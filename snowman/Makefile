.PHONY: all serve clean superclean

all: site/index.html

serve: all
	../tools/snowman/snowman server

site/index.html: \
	snowman.yaml views.yaml \
	$(wildcard queries/*.rq) \
	$(wildcard static/*) \
	$(wildcard templates/*.html) \
	$(wildcard templates/*.json) \
	$(wildcard templates/layouts/*.html)
	../tools/snowman/snowman build -v -t

clean:
	rm -rf site

superclean: clean
	rm -rf .snowman
