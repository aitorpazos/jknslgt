(function(º){
    var http = require('http');
    
    var moduleName = "jenkins";
    var version = [0,0,1];
    º.moduleTypes[moduleName] = {};
    º.moduleTypes[moduleName].name = moduleName;
    º.moduleTypes[moduleName].version = version;
    
    var jobUrlPrefix = "/job/";
    var apiPostfix = "/api/json";
    
    var _fnJenkinsColorToCode = function(color){
        var code = º.Codes.UNDEF;
        switch(color){
        case "blue":
            code = º.Codes.OK;
            break;
        case "yellow":
            code = º.Codes.WARNING;
            break;
        case "red":
            code = º.Codes.ERROR;
            break;
        default:
            code = º.Codes.UNDEF;
        }
        return code;
    };
    
    var _fnJobsListResponseAdapter = function(res){
        var jobsList = [];
        for (var i in res.jobs){
            var job = {};
            job.name = res.jobs[i].name;
            job.code = _fnJenkinsColorToCode(res.jobs[i].color);
            jobsList.push(job);
        }
        return jobsList;
    };
    
    var _fnJobStatusAdapter = function(res){
        var jobStatus = {};
        jobStatus.history = res.builds;
        jobStatus.name = res.name;
        jobStatus.code = _fnJenkinsColorToCode(color);
        return jobStatus;
    };
    
    º.moduleTypes[moduleName].getJobsList = function(modConfig, jobListCallback){
        http.get(modConfig.url + apiPostfix, function(res) {
            var body = '';

            res.on('data', function(chunk){
                body += chunk;
            });

            res.on('end', function(){
                var response = JSON.parse(body);
                jobListCallback(modConfig, _fnJobsListResponseAdapter(response));
            });
          }).on('error', function(e) {
            console.log("Request error: " + e.message);
          });
    };
    
    º.moduleTypes[moduleName].getJobStatus = function(modConfig, jobName, jobStatusCallback){
        http.get(modConfig.url + jobUrlPrefix + jobName + apiPostfix, function(res) {
            var body = '';

            res.on('data', function(chunk){
                body += chunk;
            });

            res.on('end', function(){
                var response = JSON.parse(body);
                jobStatusCallback(modConfig, _fnJobStatusAdapter(response.jobs));
            });
          }).on('error', function(e) {
            console.log("Request error: " + e.message);
          });
    }
})(nodedoy)
