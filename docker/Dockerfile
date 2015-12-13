FROM acencini/rpi-python-serial-wiringpi:latest
MAINTAINER Aitor Pazos <mail@aitorpazos.es> 

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
        curl faad flac gcc git lame make python-alsaaudio python-dev \
             python-numpy python-pip python-setuptools unzip vorbis-tools \
             python-beautifulsoup python-mutagen python-simplejson \
             node-underscore && \
    git clone git://git.drogon.net/wiringPi && \
    cd wiringPi && \
    ./build && \
    cd .. && \
    git clone https://github.com/Gadgetoid/WiringPi2-Python.git && \
    cd WiringPi2-Python && \
    python setup.py install && \
    cd .. && \
    git clone https://togiles@bitbucket.org/togiles/lightshowpi.git && \
    cd lightshowpi && \
    git fetch && git checkout stable && \
    ./install.sh && \
    cd .. && \
    git clone https://github.com/aitorpazos/jknslgt.git && \
    cd 

VOLUME /config
CMD node jknslgt/source/jknslgt.js /config/jknslgt.json
