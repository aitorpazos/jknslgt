FROM acencini/rpi-python-serial-wiringpi:latest
MAINTAINER Aitor Pazos <mail@aitorpazos.es> 

RUN $(cat /etc/apt/sources.list | sed 's/wheezy/jessie/g' > /etc/apt/sources.list.bak) && \
    mv /etc/apt/sources.list.bak /etc/apt/sources.list && \
    $(echo "deb http://www.deb-multimedia.org jessie main non-free" > /etc/apt/sources.list.d/deb-multimedia.list) && \
    apt-get update && apt-get install -y --force-yes \
        curl faad flac gcc git lame make python-alsaaudio \
             python-numpy python-pip python-setuptools unzip vorbis-tools \
             python-beautifulsoup python-mutagen python-simplejson \
             node-underscore wget ffmpeg festival festival-freebsoft-utils \
             festvox-don psmisc --no-install-recommends && \
    git clone https://togiles@bitbucket.org/togiles/lightshowpi.git && \
    cd lightshowpi && \
    git fetch && git checkout stable && \
    ./install.sh && \
    cd .. && \
    git clone https://github.com/aitorpazos/nodedoy.git

COPY defaults.cfg /data/lightshowpi/config/defaults.cfg

VOLUME /config
EXPOSE 8085
ENV SYNCHRONIZED_LIGHTS_HOME /data/lightshowpi
ENV PATH "$PATH:${SYNCHRONIZED_LIGHTS_HOME}/bin"
CMD nodejs nodedoy/source/nodedoy.js /config/nodedoy.json