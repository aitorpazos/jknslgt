

# rpi-nodedoy-wiringpi

This Dockerfile builds a Docker image for RaspberryPi that includes nodedoy and 
based on the work at `https://hub.docker.com/r/acencini/rpi-python-serial-wiringpi/`,
so it contains all the software required to easily manipulate RaspberryPi's GPIOs,
play audio files and do text-to-speech as well. Please note that it must run in 
privileged mode. It's expected that you use this as a base image to create your own
which will hold all your customisation. However, the run command of you image
would look similar to this:

``docker run -P --device /dev/ttyAMA0:/dev/ttyAMA0 --device /dev/mem:/dev/mem --device /dev/snd:/dev/snd --privileged aitorpazos/rpi-nodedoy-wiringpi:latest``

## Run the docker container on startup

Check the parent README.md file for some details on how to do this.


