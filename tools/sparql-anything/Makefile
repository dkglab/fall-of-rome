SHELL := /usr/bin/env bash
.SHELLFLAGS := -O extglob -c
SA_HOST := https://github.com/SPARQL-Anything/sparql.anything/releases/download
SA_VERSION := 0.9.0

.PHONY: all clean

all: sparql-anything.jar

clean:
	rm -rf !(Makefile)

sparql-anything.jar:
	curl -L $(SA_HOST)/$(SA_VERSION)/sparql-anything-$(SA_VERSION).jar > $@
