SA := tools/sparql-anything/sparql-anything.jar
RSPARQL := ./tools/jena/bin/rsparql
SHACL := ./tools/jena/bin/shacl
QUERY ?= queries/geosparql.rq

.PHONY: all setup run-query clean superclean

all: \
	graph/located-sites.ttl \
	graph/site-types.ttl \
	graph/ceramic-types.ttl \
	graph/roman-provinces.ttl \
	graph/municipalities.ttl

setup: $(SA) $(RSPARQL)

run-query: graph/located-sites.ttl | $(RSPARQL)
	$(MAKE) -s -C tools/geosparql start
	$(RSPARQL) \
	--query $(QUERY) \
	--service http://localhost:3030/sites

clean:
	rm -rf graph data/*/input.csv

superclean: clean
	$(MAKE) -s -C tools/sparql-anything clean
	$(MAKE) -s -C tools/jena clean
	$(MAKE) -s -C tools/geosparql clean

$(SA):
	$(MAKE) -s -C tools/sparql-anything

$(RSPARQL) $(SHACL):
	$(MAKE) -s -C tools/jena

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
