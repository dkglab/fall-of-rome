SA := tools/sparql-anything/sparql-anything.jar

.PHONY: all clean superclean

all: data/located-sites/located-sites.ttl

clean:
	rm -f data/located-sites/located-sites.ttl

superclean: clean
	$(MAKE) -s -C tools/sparql-anything clean

$(SA):
	$(MAKE) -s -C tools/sparql-anything

data/located-sites/located-sites.ttl: data/located-sites/located-sites.csv queries/sites-from-csv.rq | $(SA)
	java -jar $(SA) \
	-c location=$< \
	-q queries/sites-from-csv.rq \
	> $@
