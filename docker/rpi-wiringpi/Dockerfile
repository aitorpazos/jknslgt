FROM aitorpazos/rpi-nodedoy
MAINTAINER Aitor Pazos <mail@aitorpazos.es>

# Install dependencies
#$(cat /etc/apt/sources.list | sed 's/wheezy/jessie/g' > /etc/apt/sources.list.bak) && 
#mv /etc/apt/sources.list.bak /etc/apt/sources.list && 
RUN $(echo "deb http://www.deb-multimedia.org jessie main non-free" > /etc/apt/sources.list.d/deb-multimedia.list) && \
    apt-get update && apt-get install -y \
    git-core build-essential gcc python-dev \
    python-pip python-numpy python-setuptools python-beautifulsoup \
    python-mutagen python-simplejson python-virtualenv libraspberrypi-bin \
    libraspberrypi-dev libraspberrypi-doc curl faad flac gcc git lame \
    unzip vorbis-tools node-underscore wget \
    festival festival-freebsoft-utils festvox-don psmisc \
    --no-install-recommends && \
    pip install pyserial && \
    cd /root && \
    git clone git://git.drogon.net/wiringPi && \
    cd wiringPi && ./build && \
    pip install wiringpi2 && \
    cd .. && \
    git clone https://bitbucket.org/togiles/lightshowpi.git && \
    cd lightshowpi && \
    git fetch && git checkout stable && \
    ./install.sh && \
    apt-get purge -y build-essential gcc python-dev libraspberrypi-dev libraspberrypi-doc && \
    rm -rf /var/lib/apt/lists/*

COPY defaults.cfg /data/lightshowpi/config/defaults.cfg

ENV SYNCHRONIZED_LIGHTS_HOME /data/lightshowpi
ENV PATH "${PATH}:${SYNCHRONIZED_LIGHTS_HOME}/bin"
WORKDIR /opt/nodedoy

CMD nodejs nodedoy.js /etc/nodedoy/config.json 