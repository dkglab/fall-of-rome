SHELL := /usr/bin/env bash
.SHELLFLAGS := -O extglob -c
SA_BIN := ./repo/sparql-anything-cli/target/sparql-anything-1.0.0-SNAPSHOT-geosparql.jar

.PHONY: all clean

all: sparql-anything.jar

clean:
	rm -rf !(Makefile|.gitmodules)

sparql-anything.jar: $(SA_BIN)
	cp $< $@

repo:
	git submodule update --init --remote

$(SA_BIN): repo
	cd repo && \
	mvn clean \
	--projects /sparql-anything-cli \
	install \
	-DskipTests \
	-Dgenerate-cli-jar-geosparql=true
