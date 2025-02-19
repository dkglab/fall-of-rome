SA := tools/sparql-anything/sparql-anything.jar
SIS := tools/sis/bin/sis
SIS_DATA := tools/sis/data/installed
RSPARQL := ./tools/jena/bin/rsparql
QUERY ?= queries/select/features-within-bbox.rq

.PHONY: all setup run-query restart-geosparql-server clean superclean

all: graph/located-sites.ttl graph/site-types.ttl

setup: $(SA) $(RSPARQL)

run-query: graph/located-sites.ttl $(SIS_DATA) | $(RSPARQL)
	$(MAKE) -s -C tools/geosparql start
	$(RSPARQL) \
	--query $(QUERY) \
	--service http://localhost:3030/sites

restart-geosparql-server:
	$(MAKE) -s -C tools/geosparql restart

clean:
	rm -rf graph data/*/input.csv

superclean: clean
	$(MAKE) -s -C tools/sparql-anything clean
	$(MAKE) -s -C tools/jena clean
	$(MAKE) -s -C tools/geosparql clean
	$(MAKE) -s -C tools/sis clean

$(SA):
	$(MAKE) -s -C tools/sparql-anything

$(RSPARQL):
	$(MAKE) -s -C tools/jena

$(SIS_DATA):
	$(MAKE) -s -C tools/sis

data/located-sites/input.csv: data/located-sites/located-sites.csv
	cp $< $@

data/site-types/input.csv: data/site-types/site-types.csv
	cp $< $@

graph/%.ttl: data/%/input.csv queries/%.rq | $(SA)
	mkdir -p graph
	java -jar $(SA) \
	-c location=$< \
	-q queries/$*.rq \
	> $@
