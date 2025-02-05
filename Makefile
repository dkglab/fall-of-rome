SA := tools/sparql-anything/sparql-anything.jar

.PHONY: all setup clean superclean

all: graph/located-sites.ttl graph/site-types.ttl

setup: $(SA)

clean:
	rm -rf graph data/*/input.csv

superclean: clean
	$(MAKE) -s -C tools/sparql-anything clean

$(SA):
	$(MAKE) -s -C tools/sparql-anything

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
