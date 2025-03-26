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

STATIC := list-view.js map-view.js maplibre-gl.css web_bg.wasm
STATIC_FILES := $(foreach s,$(STATIC),snowman/static/$(s))

.PHONY: all graph setup run-query build-snowman serve-site serve-kos restart-geosparql-server clean superclean

define log
	@echo -e "\\n\033[0;32m$(1)\033[0m"
endef

graph: graph/inferred.ttl

all: \
	snowman/static/data.ttl \
	kos/site-types.html \
	kos/ceramic-types.html \
	$(STATIC_FILES)

setup: $(SA) $(RSPARQL) $(SM)

run-query: graph | $(RSPARQL)
	@$(MAKE) -s -C tools/geosparql start
	$(RSPARQL) \
	--query $(QUERY) \
	--service http://localhost:3030/sites

restart-geosparql-server:
	@$(MAKE) -s -C tools/geosparql restart

clean:
	@$(MAKE) -s -C tools/geosparql stop
	@rm -rf graph data/*/input.csv data/*/input.geojson $(STATIC_FILES)
	@$(MAKE) -s -C snowman clean
	@$(MAKE) -s -C webapp clean

superclean: clean
	@$(MAKE) -s -C tools/sparql-anything clean
	@$(MAKE) -s -C tools/jena clean
	@$(MAKE) -s -C tools/geosparql clean
	@$(MAKE) -s -C tools/skos-play clean
	@$(MAKE) -s -C tools/snowman clean
	@$(MAKE) -s -C snowman superclean
	@$(MAKE) -s -C webapp superclean
	@rm -rf venv

$(SA):
	@$(MAKE) -s -C tools/sparql-anything

$(SP):
	@$(MAKE) -s -C tools/skos-play

$(RSPARQL) $(SHACL) $(RIOT) $(ARQ):
	@$(MAKE) -s -C tools/jena

$(SM):
	@$(MAKE) -s -C tools/snowman

$(PYTHON):
	@python3 -m venv venv
	@$(PIP) install -q --upgrade pip
	@$(PIP) install -q -r scripts/requirements.txt

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
	@mkdir -p vocab
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

# Recipe to construct a graph TTL file from source data and validate it using SHACL
graph/%.ttl: queries/%.rq shapes/%.ttl | $(SA) $(SHACL)
	@mkdir -p graph
	$(call log,Constructing $@ from source data...)
	SIS_DATA=tools/sis/data java -jar $(SA) -q $< > $@
	$(call log,Validating $@ using shapes/$*.ttl...)
	@echo $(SHACL) validate --shapes shapes/$*.ttl --data $@ --text
	@output=$$(\
	$(SHACL) validate \
	--shapes shapes/$*.ttl \
	--data $@ \
	--text\
	); [ "$$output" == "Conforms" ] && \
	{ echo -e "\033[0;32mValid!\033[0m"; } || \
	{ echo -e "\\n$$output\\n\\n\033[0;31mSHACL validation failed for $@; see errors above\033[0m"; exit 1; }

graph/site-types.ttl: data/site-types/site-types.csv

graph/ceramic-types.ttl: data/ceramic-types/hayes-ars-types.csv

graph/roman-provinces.ttl: \
	data/roman-provinces/roman-provinces.csv \
	data/roman-provinces/Spain-Late-Antique-Provinces.wkt.json

graph/municipalities.ttl: \
	data/municipalities/municipalities.csv \
	data/municipalities/portugal-municipalities.wkt.json \
	data/municipalities/spain-municipalities-simplified.wkt.json

graph/analytic-regions.ttl: data/analytic-regions/analytic-regions.csv

graph/located-sites.ttl: \
	data/located-sites/input.csv \
	graph/site-types.ttl \
	graph/municipalities.ttl

kos/%.html: graph/%.ttl | $(SP)
	@mkdir -p kos
	$(call log,Generating HTML view of $<...)
	java -jar $(SP) alphabetical --format html --input $< --output $@ --lang "" > /dev/null

serve-kos: all | $(PYTHON)
	$(PYTHON) -m http.server -b 127.0.0.1 -d kos 8001

$(STATIC_FILES) &:
	@$(MAKE) -s -C webapp all
	@mkdir -p snowman/static
	@cp webapp/build/* snowman/static/

snowman/static/data.ttl: graph/inferred.ttl
	@cp $< $@

build-snowman: all | $(SM)
	@$(MAKE) -s -C tools/geosparql start
	$(call log,Generating website...)
	@$(MAKE) -s -C snowman

serve-site: build-snowman
	$(call log,Serving website...)
	@$(MAKE) -s-C snowman serve
