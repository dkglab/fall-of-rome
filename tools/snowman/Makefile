SHELL := /usr/bin/env bash
.SHELLFLAGS := -O extglob -c
OS := $(shell uname -sm)
SM_HOST := https://github.com/glaciers-in-archives/snowman/releases/download
SM_VERSION := 0.7.1

ifeq ($(OS),Darwin x86_64)
        SM_BIN := snowman-darwin-amd64
else ifeq ($(OS),Darwin arm64)
        SM_BIN := snowman-darwin-arm64
else ifeq ($(OS),Linux x86_64)
        SM_BIN := snowman-linux-amd64
else ifeq ($(OS),Linux arm64)
        SM_BIN := snowman-linux-arm64
endif

.PHONY: all clean

all: snowman

clean:
	rm -rf !(Makefile)

snowman:
	curl -s -L $(SM_HOST)/$(SM_VERSION)/$(SM_BIN) > $@
	chmod +x $@
