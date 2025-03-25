ESB := node_modules/.bin/esbuild

.PHONY: all clean superclean

MODS := list-view map-view
TS := $(foreach m,$(MODS),src/$(m).ts)
JS := $(foreach m,$(MODS),build/$(m).js)

all : $(JS) build/maplibre-gl.css build/web_bg.wasm

clean :
	rm -rf build

superclean : clean
	rm -rf node_modules

$(ESB) \
node_modules/maplibre-gl/dist/maplibre-gl.css \
node_modules/oxigraph/web_bg.wasm &:
	npm install

build/%.js : build.cjs tsconfig.json $(TS) | $(ESB)
	mkdir -p build
	node $<

build/maplibre-gl.css : node_modules/maplibre-gl/dist/maplibre-gl.css
	mkdir -p build
	cp $< $@

build/web_bg.wasm: node_modules/oxigraph/web_bg.wasm
	mkdir -p build
	cp $< $@
