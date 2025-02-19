SHELL := /usr/bin/env bash
.SHELLFLAGS := -O extglob -c
GS_HOST := https://repo1.maven.org/maven2/org/apache/jena/jena-fuseki-geosparql
GS_VERSION := 5.3.0
DS_NAME ?= sites
DS_FILE ?= ../../graph/located-sites.ttl

.PHONY: all clean start stop restart

all: jena-fuseki-geosparql.jar

clean: stop
	rm -rf !(Makefile)

start: jena-fuseki-geosparql.jar
	if [ ! -e run/geosparql.pid ]; then \
	mkdir -p run; \
	java -jar jena-fuseki-geosparql.jar \
	--port 3030 \
	--dataset $(DS_NAME) \
	--rdf_file $(DS_FILE) \
	> run/geosparql.log 2>&1 \
	& echo $$! \
	> run/geosparql.pid; \
	sleep 10; \
	fi

stop:
	if [ -e run/geosparql.pid ]; then \
	kill $$(cat run/geosparql.pid) || true; \
	rm -f run/geosparql.pid; \
	fi

restart: stop start

jena-fuseki-geosparql.jar:
	curl -L $(GS_HOST)/$(GS_VERSION)/jena-fuseki-geosparql-$(GS_VERSION).jar > $@
