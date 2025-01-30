SHELL := /usr/bin/env bash
.SHELLFLAGS := -O extglob -c
QSV_HOST := https://github.com/dathere/qsv/releases/download
QSV_VERSION := 2.2.1
QSV_ARCH := aarch64-unknown-linux-gnu

.PHONY: all clean

all: qsv

clean:
	rm -rf !(Makefile)

qsv:
	curl -L $(QSV_HOST)/$(QSV_VERSION)/qsv-$(QSV_VERSION)-$(QSV_ARCH).zip > qsv.zip
	unzip qsv.zip
