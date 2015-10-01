SHELL := /bin/bash

.PHONY: all
all: server

.PHONY: clean
clean:
	rm -f static/assets/*.{css,js}

.PHONY: server
server:
	npm run server
