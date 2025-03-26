SHELL := /usr/bin/env bash
.SHELLFLAGS := -O extglob -c
SP_HOST := https://github.com/sparna-git/skos-play/releases/download
SP_VERSION := 0.9.1

.PHONY: all clean

all: skos-play-cli.jar

clean:
	rm -rf !(Makefile)

skos-play-cli.jar:
	curl -s -L $(SP_HOST)/$(SP_VERSION)/skos-play-cli-$(SP_VERSION)-onejar.jar > $@
