

# jknslgt

This Dockerfile builds a Docker images for RaspberryPi based on `acencini/rpi-python-serial-wiringpi:latest` (`https://hub.docker.com/r/acencini/rpi-python-serial-wiringpi/`). Please note that it must run in privileged mode:

``docker run -P -v <your path to jknslgt.json>:/config --device /dev/ttyAMA0:/dev/ttyAMA0 --device /dev/mem:/dev/mem --device /dev/snd:/dev/snd --privileged aitorpazos/jknslgt:latest``

(Some day Docker registry will support automated non x86* builds ;-) )
