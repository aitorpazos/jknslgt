FROM acencini/rpi-python-serial-wiringpi:latest
MAINTAINER Aitor Pazos <mail@aitorpazos.es> 

RUN $(cat /etc/apt/sources.list | sed 's/wheezy/jessie/g' > /etc/apt/sources.list.bak) && \
    $(echo "deb http://www.deb-multimedia.org jessie main non-free" > /etc/apt/sources.list.d/deb-multimedia.list) && \
    mv /etc/apt/sources.list.bak /etc/apt/sources.list && \
    apt-get update && apt-get install -y --force-yes \
        curl faad flac gcc git lame make python-alsaaudio \
             python-numpy python-pip python-setuptools unzip vorbis-tools \
             python-beautifulsoup python-mutagen python-simplejson \
             node-underscore ffmpeg --no-install-recommends && \
    git clone https://togiles@bitbucket.org/togiles/lightshowpi.git && \
    cd lightshowpi && \
    git fetch && git checkout stable && \
    ./install.sh && \
    cd .. && \
    git clone https://github.com/aitorpazos/jknslgt.git

VOLUME /config
CMD node jknslgt/source/jknslgt.js /config/jknslgt.json