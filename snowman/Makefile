.PHONY: all serve clean superclean

all: .built

serve: all
	../tools/snowman/snowman server

.built: \
	snowman.yaml views.yaml \
	$(wildcard queries/*.rq) \
	$(wildcard static/*) \
	$(wildcard templates/*.html) \
	$(wildcard templates/*.json) \
	$(wildcard templates/layouts/*.html)
	../tools/snowman/snowman build
	@touch $@

clean:
	rm -rf site .built

superclean: clean
	rm -rf .snowman
