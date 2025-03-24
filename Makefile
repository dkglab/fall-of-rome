SHELL := /usr/bin/env bash
SA := tools/sparql-anything/sparql-anything.jar
SP := tools/skos-play/skos-play-cli.jar
RSPARQL := ./tools/jena/bin/rsparql
SM := ./tools/snowman/snowman
SHACL := ./tools/jena/bin/shacl
RIOT := ./tools/jena/bin/riot
ARQ := ./tools/jena/bin/arq
PYTHON := ./venv/bin/python
PIP := ./venv/bin/python -m pip

QUERY ?= queries/select/features-within-bbox.rq

GRAPHS := site-types ceramic-types roman-provinces municipalities analytic-regions located-sites
GRAPH_FILES := $(foreach g,$(GRAPHS),graph/$(g).ttl)

STATIC := long-list.js map-view.js maplibre-gl.css
STATIC_FILES := $(foreach s,$(STATIC),snowman/static/$(s))

.PHONY: all graph setup run-query build-snowman serve-site serve-kos restart-geosparql-server clean superclean

graph: graph/inferred.ttl

all: \
	graph \
	kos/site-types.html \
	kos/ceramic-types.html \
	$(STATIC_FILES)

setup: $(SA) $(RSPARQL) $(SM)

run-query: graph | $(RSPARQL)
	$(MAKE) -s -C tools/geosparql start
	$(RSPARQL) \
	--query $(QUERY) \
	--service http://localhost:3030/sites

restart-geosparql-server:
	$(MAKE) -s -C tools/geosparql restart

clean:
	$(MAKE) -s -C tools/geosparql stop
	rm -rf graph data/*/input.csv data/*/input.geojson $(STATIC_FILES)
	$(MAKE) -s -C snowman clean
	$(MAKE) -s -C webapp clean

superclean: clean
	$(MAKE) -s -C tools/sparql-anything clean
	$(MAKE) -s -C tools/jena clean
	$(MAKE) -s -C tools/geosparql clean
	$(MAKE) -s -C tools/skos-play clean
	$(MAKE) -s -C tools/snowman clean
	$(MAKE) -s -C snowman superclean
	$(MAKE) -s -C webapp superclean
	rm -rf venv

$(SA):
	$(MAKE) -s -C tools/sparql-anything

$(SP):
	$(MAKE) -s -C tools/skos-play

$(RSPARQL) $(SHACL) $(RIOT) $(ARQ):
	$(MAKE) -s -C tools/jena

$(SM):
	$(MAKE) -s -C tools/snowman

$(PYTHON):
	python3 -m venv venv
	$(PIP) install --upgrade pip
	$(PIP) install -r scripts/requirements.txt

data/located-sites/input.csv: data/located-sites/located-sites.csv scripts/process-site-names.py | $(PYTHON)
	cat $< | $(PYTHON) scripts/process-site-names.py > $@

data/site-types/input.csv: data/site-types/site-types.csv
	cp $< $@

data/ceramic-types/input.csv: data/ceramic-types/hayes-ars-types.csv
	cp $< $@

data/roman-provinces/input.csv: data/roman-provinces/roman-provinces.csv | $(PYTHON)
	cat data/roman-provinces/Spain-Late-Antique-Provinces.geojson | \
	$(PYTHON) scripts/process-geojson.py > \
	data/roman-provinces/input.geojson
	cp $< $@

data/municipalities/input.csv: data/municipalities/municipalities.csv | $(PYTHON)
	cat data/municipalities/portugal-municipalities.geojson | \
	$(PYTHON) scripts/process-geojson.py > \
	data/municipalities/input.geojson
	cp $< $@

data/analytic-regions/input.csv: data/analytic-regions/analytic-regions.csv
	cp $< $@

vocab/geo.in.ttl:
	mkdir -p vocab
	curl -L https://opengeospatial.github.io/ogc-geosparql/geosparql11/geo.ttl > $@

vocab/geo.ttl: vocab/geo.in.ttl queries/filter-datatype-property-ranges.rq | $(ARQ)
	$(ARQ) \
	--data $< \
	--query queries/filter-datatype-property-ranges.rq \
	--results ttl \
	--set ttl:directiveStyle=rdf11 \
	--set ttl:indentStyle=long \
	> $@

graph/inferred.ttl: vocab/geo.ttl $(GRAPH_FILES) | $(RIOT)
	$(RIOT) \
	--rdfs $< \
	--formatted ttl \
	--set ttl:directiveStyle=rdf11 \
	--set ttl:indentStyle=long \
	$(GRAPH_FILES) \
	> $@

graph/%.ttl: data/%/input.csv queries/%.rq shapes/%.ttl | $(SA) $(SHACL)
	mkdir -p graph
	SIS_DATA=tools/sis/data \
	java -jar $(SA) \
	-c location=$< \
	-q queries/$*.rq \
	> $@
	@output=$$(\
	$(SHACL) validate \
	--shapes shapes/$*.ttl \
	--data $@ \
	--text\
	); [ "$$output" == "Conforms" ] || \
	{ echo "\033[0;31mSHACL validation failed for $@:\033[0m\n$$output"; exit 1; }

kos/%.html: graph/%.ttl | $(SP)
	mkdir -p kos
	java -jar $(SP) \
	alphabetical \
	--format html \
	--input $< \
	--output $@ \
	--lang ""

serve-kos: all | $(PYTHON)
	$(PYTHON) -m http.server -b 127.0.0.1 -d kos 8001

$(STATIC_FILES) &:
	$(MAKE) -s -C webapp all
	mkdir -p snowman/static
	cp webapp/build/* snowman/static/

build-snowman: all | $(SM)
	$(MAKE) -s -C tools/geosparql start
	$(MAKE) -C snowman

serve-site: build-snowman
	$(MAKE) -s -C snowman serve
