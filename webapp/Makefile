ESB := node_modules/.bin/esbuild

.PHONY: all clean superclean

MODS := long-list map-view
TS := $(foreach m,$(MODS),src/$(m).ts)
JS := $(foreach m,$(MODS),build/$(m).js)

all : $(JS) build/maplibre-gl.css

clean :
	rm -rf build

superclean : clean
	rm -rf node_modules

$(ESB) node_modules/maplibre-gl/dist/maplibre-gl.css &:
	npm install

build/%.js : build.cjs tsconfig.json $(TS) | $(ESB)
	mkdir -p build
	node $<

build/maplibre-gl.css : node_modules/maplibre-gl/dist/maplibre-gl.css
	cp $< $@
