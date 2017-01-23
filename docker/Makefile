all: build build-rpi

Dockerfile: Dockerfile.in *.docker
	cpp -o Dockerfile Dockerfile.in

Dockerfile-rpi: Dockerfile-rpi.in *.docker
	cpp -o Dockerfile-rpi Dockerfile-rpi.in

build: Dockerfile
	docker build --rm -t aitorpazos/nodedoy -f Dockerfile ..

build-rpi: Dockerfile-rpi
	#https://blog.hypriot.com/post/setup-simple-ci-pipeline-for-arm-images/
	docker run --rm --privileged multiarch/qemu-user-static:register --reset
	docker build --rm -t aitorpazos/rpi-nodedoy -f Dockerfile-rpi ..
	docker build --rm -t aitorpazos/rpi-nodedoy-wiringpi rpi-wiringpi