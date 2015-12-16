/**
 * This program let you configure a server that execute queries to services
 * every certain period of time and then execute the configured actions on
 * status change
 */
jknslgt = function(){
    
    jknslgt.Codes = {"UNDEF": "unknown", "OK": "ok", "WARNING": "warning", "ERROR": "error"};
    jknslgt.CommandTypes = {"EVAL": "eval", "EXEC": "exec"};
    jknslgt.storageTypes = {};
    jknslgt.moduleTypes = {};
    
    var fs = require('fs');
    var timers = require('timers');
    var exec = require('child_process').exec;
    var http = require('http');
    var qs = require('querystring');
    
    var MODULES_DIR = __dirname + "/modules";
    var STORAGE_ADDON_DIR = __dirname + "/storage-addons";
    var REPETITION_MIN_INTERVAL = 2*1000;
    var configFile = "./jknslgt.json";
    // The only parameter accepted is the config file
    if (process.argv.length > 2){
        configFile = process.argv[2];
    }
    
    /**
     * Only lower case module/storage names should be used.
     */
    var addOnDirs = [MODULES_DIR];
    for (var i in addOnDirs){
        var files = fs.readdirSync(addOnDirs[i]);
        for (var fi in files){
            var fileLower = files[fi].toLowerCase();
            if (fileLower.match(".*\.js$").length > 0){
                require(addOnDirs[i] + "/" + files[fi]);
            }
        }
    }
    
    /**
     * See jknslgt.json.example for more info
     */
    jknslgt.config = require(configFile);
    
    /**
     * Returns the correct module config for certain Id
     */
    jknslgt.getModuleConfigById = function(moduleId){
        var config = undefined;
        var modules = jknslgt.config.modules;
        for (var i in modules){
            if (moduleId === modules[i].id){
                config = modules[i];
            }
        }
        return config;
    };
    
    /**
     * Returns the right job config depending on the specifity of the name string
     */
    var _getAplicableJob = function(job, moduleConfig){
        var jobs = moduleConfig.jobs;
        var precedenceConfig = {"high": [],
                                "medium": [],
                                "low": []
                                };
        // First we build the precedence config according to config job's name
        // specifity
        for (var i in jobs){
            var name = jobs[i].name;
            if (name.indexOf(".") >= 0 ||
                    name.indexOf("*") >= 0 ||
                    name.indexOf("+") >= 0
                    ){
                precedenceConfig["high"].push(jobs[i]);
            } else if (name.indexOf("{") >= 0 ||
                    name.indexOf("}") >= 0 ||
                    name.indexOf("[") >= 0 ||
                    name.indexOf("]") >= 0
                    ){
                precedenceConfig["medium"].push(jobs[i]);
            } else {
                precedenceConfig["low"].push(jobs[i]);
            }
        }
        
        // Now we look for a match
        for (var i in precedenceConfig){
            for (var j in precedenceConfig[i]){
                var match = job.match(precedenceConfig[i][j].name);
                if (null !== match &&
                        match.length === 1){
                    return precedenceConfig[i][j];
                }
            }
        }
        return undefined;
    };
    
    /**
     * Callback function which process jobs list status queries
     */
    var jobListCallback = function(modConfig, jobsStatus){
        for (var statusi in jobsStatus){
            var storage = jknslgt.storageTypes[jknslgt.config.storage.type];
            storage.storeStatus(modConfig.id, jobsStatus[statusi].name, jobsStatus[statusi], _fnOnChangeStoreCallback);
        }
    };
    
    /**
     * Function which processes a command in order to concatenate parameters in array
     * commands to the resultant command string.
     */
    var _fnProcessCommand = function(jobConfig, oldStatus, newStatus, command){
        var result = command.command;
        
        // We assume it's an array of a sequence of strings and 
        if (typeof(command.command) !== "string"){
            result = "";
            for (var i in command.command){
                if (i%2 === 0){
                    result = result.concat(command.command[i]);
                } else {
                    result = result.concat(eval(command.command[i]));
                }
            }
        }
        
        return result;
    }
    
    var _executeCommand = function(jobConfig, oldStatus, newStatus, command){
     // setting the delay
        var delay = 0;
        if (command.after !== undefined){
            delay = command.after * 1000;
        }
        timers.setTimeout(function(command){
            // Configure repetitions
            // Default: REPETITION_MIN_INTERVAL
            var repeatEvery = REPETITION_MIN_INTERVAL;
            if (command.repeatEvery !== undefined){
                // Don't allow repetitions too fast
                if (command.repeatEvery * 1000 > repeatEvery){
                    repeatEvery = command.repeatEvery * 1000;
                } else {
                    console.warn("Job (" + job + ") command repeatEvery too often (" +
                            command.repeatEvery+"): " + command.command + ". Using default: " + REPETITION_MIN_INTERVAL/1000);
                }
            }
            
            // Default: 1
            var repetitions = 1;
            if (command.repetitions !== undefined){
                repetitions = command.repetitions;
            }
            
            if (repetitions > 0){
              var interval = timers.setInterval(function(command){
                if (repetitions-- <= 1){
                  timers.clearInterval(interval);
                }
                console.info(repetitions + " repetitions to go...");
                
                // Running command according to it's type
                switch(command.type.toLowerCase()){
                case jknslgt.CommandTypes.EVAL:
                    eval(_fnProcessCommand(jobConfig, oldStatus, newStatus, command));
                    break;
                case jknslgt.CommandTypes.EXEC:
                    child = exec(_fnProcessCommand(jobConfig, oldStatus, newStatus, command),
                            function (error, stdout, stderr) {
                              console.log(stdout);
                              console.error(stderr);
                              if (error !== null) {
                                console.error('exec error: ' + error);
                              }
                          });
                    break;
                default:
                    break;
                }
              }, repeatEvery, command)
            }
        }, delay, command);
    }
    /**
     * Function used as a callback to status storage when there is a change
     */
    var _fnOnChangeStoreCallback = function(oldStatus, newStatus, job, moduleConfig){
        var jobConfig = _getAplicableJob(job, moduleConfig);
        
        if (jobConfig === undefined || jobConfig.results === undefined) return;
        
        if (jobConfig.results[newStatus.code] !== undefined &&
                (jobConfig.ignore === undefined ||
                jobConfig.ignore === false)){
            var resultCommands = jobConfig.results[newStatus.code].commands;
            if (resultCommands === undefined) return;
            
            for (var i in resultCommands){
                var command = resultCommands[i];
                _executeCommand(jobConfig, oldStatus, newStatus, command);
            }
        }
    };
    
    /**
     * Function that will be called to run a check periodically. It fetches the jobs
     * list and execute it actions on code change
     */
    var timerFunc = function(module){
        var moduleType = jknslgt.moduleTypes[module.type];
        if (moduleType === undefined){
            console.error("Check configuration, module type " + module.type + " not found.");
            return;
        }
        
        moduleType.getJobsList(module, jobListCallback);
    };
    
    /**
     * Running the main timed actions
     */
    var modulesIntervals = {};
    var _fnSetModulesIntervals = function(){
        modulesIntervals = {}
        for (var moduleId in jknslgt.config.modules){
            var period = 10 * 1000;
            var module = jknslgt.config.modules[moduleId];
            if (module.period !== undefined){
                period = module.period * 1000;
            }
            modulesIntervals[module.id] = {};
            modulesIntervals[module.id].period = period;
            modulesIntervals[module.id].intervalObj = timers.setInterval(timerFunc, period, module);
        }
    }
    
    var _fnClearModulesIntervals = function(){
        for (var moduleId in jknslgt.config.modules){
            var module = jknslgt.config.modules[moduleId];
            if (modulesIntervals[module.id].intervalObj !== undefined){
                timers.clearInterval(modulesIntervals[module.id].intervalObj);
            }
        }
    }
    
    // First time call
    _fnSetModulesIntervals();
    
    /**
     * Registering default on-memory storage
     */
    (function(º){
        var storageName = "internal";
        var version = [0,0,1];
        º.storageTypes[storageName] = {};
        º.storageTypes[storageName].name = storageName;
        º.storageTypes[storageName].version = version;
        
        var storedStatus = {};
        
        º.storageTypes[storageName].storeStatus = function(moduleId, job, status, onChangeCallback){
            if (status === undefined){
                console.error("ERROR[storeStatus]: status was undefined");
                return;
            }
            if (storedStatus[moduleId] === undefined){
                storedStatus[moduleId] = {};
            }
            
            var module = storedStatus[moduleId];
            if (module[job] === undefined){
                storedStatus[moduleId][job] = {};
            }
            
            var oldStatus = storedStatus[moduleId][job];
            // First update is skipped, but we always save new status
            storedStatus[moduleId][job] = status;
            if (oldStatus === undefined || oldStatus.code === undefined ||
                    oldStatus.code === status.code){
                return;
            } else {
                console.info("Detected status change on store, calling callback: Old - " + oldStatus.code + " | New: " + status.code);
                onChangeCallback(oldStatus, status, job, º.getModuleConfigById(moduleId));
            }
        };
        
        º.storageTypes[storageName].getStatus = function(moduleId, job, onGetCallback){
            onGetCallback(storedStatus[moduleId][job], job, º.getModuleConfigById(moduleId));
        };
        
    /**
     * Creating a small server to reply to config changes and commands
     */
      var serverPort = 8085;
      http.createServer(function (request, response) {
        if(request.method === "GET") {
          if (request.url === "/favicon.ico") {
            response.writeHead(404, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({"result": 404, "message": "Not found"}, null, 2));
          } else {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(JSON.stringify(jknslgt.config, null, 2), null, 2));
          }
        } else if(request.method === "POST") {
          if (jknslgt.config.enableHTTPChanges !== undefined &&
                  jknslgt.config.enableHTTPChanges === true){
              if (request.url === "/config") {
                var requestBody = '';
                request.on('data', function(data) {
                  requestBody += data;
                  if(requestBody.length > 1e7) {
                    response.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'application/json'});
                    response.end(JSON.stringify({"result": 413, "message": "Request Entity Too Large"}, null, 2));
                  }
                });
                request.on('end', function() {
                  try {
                      // We don't apply if there is a parsing exception
                      var newConfig = JSON.parse(requestBody);
                      _fnClearModulesIntervals();
                      jknslgt.config = newConfig;
                      _fnSetModulesIntervals();
                      response.writeHead(200, {'Content-Type': 'application/json'});
                      response.end(JSON.stringify({"result": 200, "message": "Config updated"}, null, 2));
                  } catch (e) {
                    console.error("Request:" + requestBody + " - Exception: " + e);
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify({"result": 500, "message": "Error parsing config"}, null, 2));
                  }
                });
              } else if (request.url === "/command") {
                var requestBody = '';
                request.on('data', function(data) {
                  requestBody += data;
                  if(requestBody.length > 1e7) {
                    response.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'application/json'});
                    response.end(JSON.stringify({"result": 413, "message": "Request Entity Too Large"}, null, 2));
                  }
                });
                request.on('end', function() {
                  try {
                      // We skip on parsing exception
                      var command = JSON.parse(requestBody);
                      _executeCommand(null, null, null, command);
                      response.writeHead(200, {'Content-Type': 'application/json'});
                      response.end(JSON.stringify({"result": 200, "message": "Command executed"}, null, 2));
                  } catch (e) {
                      console.error("Request:" + requestBody + " - Exception: " + e);
                      response.writeHead(500, {'Content-Type': 'application/json'});
                      response.end(JSON.stringify({"result": 500, "message": "Error parsing command"}, null, 2));
                  }
                });
              } else {
                response.writeHead(404, 'Resource Not Found', {'Content-Type': 'application/json'});
                response.end(JSON.stringify({"result": 404, "message": "Not found"}, null, 2));
              }
          } else {
              response.writeHead(401, 'Unauthorized', {'Content-Type': 'application/json'});
              response.end(JSON.stringify({"result": 401, "message": "Unauthorized"}, null, 2));
          }
        } else {
          response.writeHead(405, 'Method Not Supported', {'Content-Type': 'application/json'});
          return response.end(JSON.stringify({"result": 405, "message": "Method not supported"}, null, 2));
        }
      }).listen(serverPort);
      console.log('Server running at localhost:'+serverPort);
    })(jknslgt);
    // End of internal on-memory storage
}

jknslgt();

