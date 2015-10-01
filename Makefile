SHELL := /bin/bash

.PHONY: all
all: server

.PHONY: clean
clean:
	rm -f static/assets/*.{css,js}

.PHONY: server
server:
	python -m SimpleHTTPServer

.PHONY: watch
watch:
	npm run watch
