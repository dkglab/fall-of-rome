SHELL := /usr/bin/env bash
.SHELLFLAGS := -O extglob -c
SA_HOST := https://github.com/dkglab/sparql.anything/releases/download
SA_VERSION := 1.0.0-SNAPSHOT

.PHONY: all clean

all: sparql-anything.jar

clean:
	rm -rf !(Makefile|.gitmodules)

sparql-anything.jar:
	curl -L $(SA_HOST)/v$(SA_VERSION)/sparql-anything-$(SA_VERSION)-geosparql.jar > $@
