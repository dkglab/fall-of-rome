SA := tools/sparql-anything/sparql-anything.jar
SP := tools/skos-play/skos-play-cli.jar
RSPARQL := ./tools/jena/bin/rsparql
SM := ./tools/snowman/snowman
SHACL := ./tools/jena/bin/shacl
SIS := tools/sis/bin/sis
SIS_DATA := tools/sis/data/installed
QUERY ?= queries/select/features-within-bbox.rq

.PHONY: all setup run-query build-snowman serve-site serve-kos restart-geosparql-server clean superclean

all: \
	graph/site-types.ttl \
	graph/ceramic-types.ttl \
	graph/roman-provinces.ttl \
	graph/municipalities.ttl \
	graph/located-sites.ttl \
	kos/site-types.html \
	kos/ceramic-types.html

setup: $(SA) $(RSPARQL) $(SM)

run-query: graph/located-sites.ttl $(SIS_DATA) | $(RSPARQL)
	$(MAKE) -s -C tools/geosparql start
	$(RSPARQL) \
	--query $(QUERY) \
	--service http://localhost:3030/sites

restart-geosparql-server:
	$(MAKE) -s -C tools/geosparql restart

clean:
	rm -rf graph data/*/input.csv
	$(MAKE) -s -C snowman clean

superclean: clean
	$(MAKE) -s -C tools/sparql-anything clean
	$(MAKE) -s -C tools/jena clean
	$(MAKE) -s -C tools/geosparql clean
	$(MAKE) -s -C tools/sis clean
	$(MAKE) -s -C tools/skos-play clean
	$(MAKE) -s -C tools/snowman clean
	$(MAKE) -s -C snowman superclean

$(SA):
	$(MAKE) -s -C tools/sparql-anything

$(SP):
	$(MAKE) -s -C tools/skos-play

$(RSPARQL) $(SHACL):
	$(MAKE) -s -C tools/jena

$(SIS_DATA):
	$(MAKE) -s -C tools/sis

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
	java -jar $(SA) \
	-c location=$< \
	-q queries/$*.rq \
	> $@
	$(SHACL) validate \
	--shapes shapes/$*.ttl \
	--data $@ \
	--text

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

build-snowman: all | $(SM)
	$(MAKE) -s -C tools/geosparql start
	$(MAKE) -C snowman
	$(MAKE) -s -C tools/geosparql stop

serve-site: build-snowman
	$(MAKE) -s -C snowman serve
