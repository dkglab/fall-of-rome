.PHONY: all clean superclean

all: site/index.html

site/index.html: \
	snowman.yaml views.yaml \
	$(wildcard queries/*.rq) \
	$(wildcard templates/*.html) $(wildcard templates/layouts/*.html)
	../tools/snowman/snowman build -v -t

clean:
	rm -rf site

superclean:
	rm -rf .snowman
