#!/bin/bash

DOCKER_IMAGE="aitorpazos/nodedoy:latest"
if [ -z "$1" ]; then
    DOCKER_IMAGE="$1";
fi

DOCKER_CONTAINER_NAME="nodedoy"
DOCKER_RUN_PARAMS="-p 8085:8085 --name ${DOCKER_CONTAINER_NAME}
#DOCKER_RUN_PARAMS="-p 8085:8085 --name ${DOCKER_CONTAINER_NAME} --device /dev/ttyAMA0:/dev/ttyAMA0 --device /dev/mem:/dev/mem --device /dev/snd:/dev/snd --privileged"

trap "docker stop nodedoy; exit 0" SIGINT SIGTERM

if [ "$(docker ps -a --format '{{.Names}}' | grep ${DOCKER_CONTAINER_NAME})" == "" ]; then
	docker run ${DOCKER_RUN_PARAMS} ${DOCKER_IMAGE};
else
	docker start ${DOCKER_CONTAINER_NAME}
fi

while true; do sleep 2; done