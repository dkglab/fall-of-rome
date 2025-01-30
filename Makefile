SA := tools/sparql-anything/sparql-anything.jar
QSV := tools/qsv/qsv

.PHONY: all setup clean superclean

all: data/located-sites/located-sites.ttl

setup: $(SA) $(QSV)

clean:
	rm -f data/located-sites/located-sites.ttl

superclean: clean
	$(MAKE) -s -C tools/sparql-anything clean

$(SA):
	$(MAKE) -s -C tools/sparql-anything

$(QSV):
	$(MAKE) -s -C tools/qsv

data/located-sites/located-sites.ttl: data/located-sites/located-sites.csv queries/sites-from-csv.rq | $(SA)
	java -jar $(SA) \
	-c location=$< \
	-q queries/sites-from-csv.rq \
	> $@
