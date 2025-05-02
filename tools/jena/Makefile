SHELL := /usr/bin/env bash
.SHELLFLAGS := -O extglob -c
JENA_HOST := https://archive.apache.org/dist/jena/binaries
JENA_VERSION := 5.3.0

.PHONY: all clean

all: jena

clean:
	rm -rf !(Makefile)

jena:
	curl -s $(JENA_HOST)/apache-jena-$(JENA_VERSION).tar.gz \
	| tar zxf - --strip-components 1
