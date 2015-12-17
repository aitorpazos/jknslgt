#!/bin/bash

CONFIG_DIR=<Replace with the DIR you want to put your config in>
trap "docker stop nodedoy; exit 0" SIGINT SIGTERM

if [ "$(docker ps -a --format '{{.Names}}' | grep nodedoy)" == "" ]; then
	docker run -p 8085:8085 --name nodedoy -v ${CONFIG_DIR}:/config --device /dev/ttyAMA0:/dev/ttyAMA0 --device /dev/mem:/dev/mem --device /dev/snd:/dev/snd --privileged aitorpazos/nodedoy:latest;
else
	docker start nodedoy
fi

while true; do sleep 2; done