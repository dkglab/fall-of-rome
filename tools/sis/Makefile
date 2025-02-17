SHELL := /usr/bin/env bash
.SHELLFLAGS := -O extglob -c
SIS_VERSION := 1.4
SIS_HOST := https://dlcdn.apache.org/sis
SIS_BIN := ./apache-sis-$(SIS_VERSION)/bin/sis

.PHONY: all clean

all: crs

clean:
	rm -rf !(Makefile)

sis:
	curl $(SIS_HOST)/$(SIS_VERSION)/apache-sis-$(SIS_VERSION)-bin.zip -o apache-sis-$(SIS_VERSION)-bin.zip
	unzip -o apache-sis-$(SIS_VERSION)-bin.zip
	rm apache-sis-$(SIS_VERSION)-bin.zip

crs: sis
	yes yes \
	| $(SIS_BIN) crs EPSG:3305
	export SIS_DATA=apache-sis-$(SIS_VERSION)/data
