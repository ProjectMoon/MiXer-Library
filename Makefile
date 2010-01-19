SRC=src/
BUILD=build/
UTIL=build-util/
COMPRESS=yuicompressor-2.4.2.jar

all: build
	
build: stage
	java -jar ${UTIL}${COMPRESS} ${SRC}/mixer.js -o ${BUILD}/mixer.min.js

stage: verify
	mkdir ${BUILD}
	
verify:
	[ -e ${UTIL}${COMPRESS} ]
	[ -e ${SRC}mixer.js ]

clean:
	rm -rf ${BUILD}
