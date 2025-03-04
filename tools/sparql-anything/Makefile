SHELL := /usr/bin/env bash
.SHELLFLAGS := -O extglob -c
SA_BIN := ./repo/sparql-anything-cli/target/sparql-anything-1.0.0-SNAPSHOT-geosparql.jar
SA_REPO := /repo

.PHONY: all clean

all: sparql-anything.jar

clean:
	rm -rf !(Makefile)

sparql-anything.jar: $(SA_BIN)
	cp $< $@

$(SA_REPO):
	git submodule update --init --remote

$(SA_BIN): $(SA_REPO)
	cd repo; \
	mvn clean -pl /sparql-anything-cli install -DskipTests -Dgenerate-cli-jar-geosparql=true
