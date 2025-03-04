ESB := node_modules/.bin/esbuild

.PHONY: all clean superclean

all: \
	build/index.js

clean:
	rm -rf build

superclean: clean
	rm -rf node_modules

build/index.js: build.cjs tsconfig.json src/index.ts | $(ESB)
	mkdir -p build
	node $<

$(ESB):
	npm install
