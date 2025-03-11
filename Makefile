SHELL := /usr/bin/env bash
SA := tools/sparql-anything/sparql-anything.jar
SP := tools/skos-play/skos-play-cli.jar
RSPARQL := ./tools/jena/bin/rsparql
SM := ./tools/snowman/snowman
SHACL := ./tools/jena/bin/shacl
QUERY ?= queries/select/features-within-bbox.rq

.PHONY: all graph setup run-query build-snowman serve-site serve-kos restart-geosparql-server clean superclean

graph: \
	graph/site-types.ttl \
	graph/ceramic-types.ttl \
	graph/roman-provinces.ttl \
	graph/municipalities.ttl \
	graph/located-sites.ttl

all: \
	graph \
	kos/site-types.html \
	kos/ceramic-types.html \
	webapp/build/index.js

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
	rm -rf graph data/*/input.csv
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

$(SA):
	$(MAKE) -s -C tools/sparql-anything

$(SP):
	$(MAKE) -s -C tools/skos-play

$(RSPARQL) $(SHACL):
	$(MAKE) -s -C tools/jena

$(SM):
	$(MAKE) -s -C tools/snowman

data/located-sites/input.csv: data/located-sites/located-sites.csv scripts/process-site-names.py
	cat $< | python3 scripts/process-site-names.py > $@

data/site-types/input.csv: data/site-types/site-types.csv
	cp $< $@

data/ceramic-types/input.csv: data/ceramic-types/hayes-ars-types.csv
	cp $< $@

data/roman-provinces/input.csv: data/roman-provinces/roman-provinces.csv
	cp $< $@

data/municipalities/input.csv: data/municipalities/municipalities.csv
	cp $< $@

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

serve-kos: all
	python3 -m http.server -b 127.0.0.1 -d kos 8001

webapp/build/index.js:
	$(MAKE) -s -C webapp

snowman/static/index.js: webapp/build/index.js
	mkdir -p snowman/static
	cp $<* snowman/static/

build-snowman: all snowman/static/index.js | $(SM)
	$(MAKE) -s -C tools/geosparql start
	$(MAKE) -C snowman

serve-site: build-snowman
	$(MAKE) -s -C snowman serve
