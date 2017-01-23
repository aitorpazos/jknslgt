# docker images

Yoy can use the Makefile in this folder in order to build a set of docker images
containing nodedoy.

Calling `make` it will generate three images: 
- aitorpazos/nodedoy              -> x86_64 nodedoy image
- aitorpazos/rpi-nodedoy          -> armhf nodedoy image (based in raspbian)
- aitorpazos/rpi-nodedoy-wiringpi -> armhf nodedoy image with wiringpi, audio 
and TTS support

You will require `cpp` command installed, which pre-process Dockerfiles.

## Run the docker container on startup

Two files are provided in order to make this task easy: `dockernodedoy.sh` and 
`nodedoy.service`.

### dockernodedoy.sh

This is a wrapper that starts an existing container named nodedoy or create a new 
one if it doesn't exist.

### nodedoy.service

Systemd service file that you should copy to `/etc/systemd/system` folder in order to
register `nodedoy` as a system's service so it runs automatically at boot.

You might want to edit `nodedoy.service` file in order to set the right path of 
dockernodedoy.sh or point it to your own image. The only parameter `dockernodedoy.sh`
accepts is the image that it will start.

* All the steps:

>cp <this dir>/nodedoy.service /etc/systemd/system/nodedoy.service
>systemctl daemon-reload  
>systemctl enable nodedoy.service  
>systemctl start nodedoy.service  

Your host system is now prepared to run nodedoy automatically.

