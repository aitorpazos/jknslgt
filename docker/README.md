

# nodedoy

This Dockerfile builds a Docker images for RaspberryPi based on `acencini/rpi-python-serial-wiringpi:latest` (`https://hub.docker.com/r/acencini/rpi-python-serial-wiringpi/`). Please note that it must run in privileged mode:

``docker run -P -v <your path to nodedoy.json>:/config --device /dev/ttyAMA0:/dev/ttyAMA0 --device /dev/mem:/dev/mem --device /dev/snd:/dev/snd --privileged aitorpazos/nodedoy:latest``

(Some day Docker registry will support automated non x86* builds ;-) )

## Run the docker container on startup

Two files are provided in order to make this task easy: dockernodedoy.sh and nodedoy.service.

### dockernodedoy.sh

This is a wrapper that starts an existing container named nodedoy or create a new one if it doesn't exist.

### nodedoy.service

Systemd service file that you should copy to `/etc/systemd/system` folder in order to
register `nodedoy` as a service of the system so it runs automatically on boot.

You need to edit nodedoy.service file in order to set the right path of dockernodedoy.sh and
you need to edit dockernodedoy.sh to set the directory you store nodedoy.json file.

* All steps:

>cp <this dir>/nodedoy.service /etc/systemd/system/nodedoy.service
>systemctl daemon-reload  
>systemctl enable nodedoy.service  
>systemctl start nodedoy.service  

Your host system should be prepared to run nodedoy automatically.

