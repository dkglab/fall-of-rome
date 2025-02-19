SHELL := /usr/bin/env bash
.SHELLFLAGS := -O extglob -c
SIS_HOST := https://dlcdn.apache.org/sis
SIS_VERSION := 1.4

.PHONY: all clean

all: data/installed

clean:
	rm -rf !(Makefile)

apache-sis-$(SIS_VERSION)-bin.zip:
	curl -L $(SIS_HOST)/$(SIS_VERSION)/$@ > $@

bin/sis: apache-sis-$(SIS_VERSION)-bin.zip
	unzip $<
	mv apache-sis-$(SIS_VERSION)/* .
	rmdir apache-sis-$(SIS_VERSION)
	touch $@

data/installed: | bin/sis
	yes | ./bin/sis crs EPSG:4326
	touch $@
