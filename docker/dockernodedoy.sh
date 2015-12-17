#!/bin/bash

trap "docker stop nodedoy" SIGINT SIGTERM

if [ "$(docker ps -a --format '{{.Names}}' | grep nodedoy)" == "" ]; then
docker run -p 8085:8085 -v /config/nodedoy.json:/config --device /dev/ttyAMA0:/dev/ttyAMA0 --device /dev/mem:/dev/mem --device /dev/snd:/dev/snd --privileged aitorpazos/nodedoy:latest;
else
	docker start nodedoy
fi

while true; do sleep 2; done