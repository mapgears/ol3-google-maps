ifeq ($(shell uname),Darwin)
	SEDI := $(shell which sed) -i ''
else
	SEDI := $(shell which sed) -i
endif
API_KEY ?= AIzaSyD71KlyTCXJouZsGbgPCJ-oCtK76fZJUTQ
UNAME := $(shell uname)
SRC_JS_FILES := $(shell find src -type f -name '*.js')
EXAMPLES_JS_FILES := $(shell find examples -type f -name '*.js')
EXAMPLES_HTML_FILES := $(shell find examples -type f -name '*.html')
EXAMPLES_GEOJSON_FILES := $(shell find examples/data/ -name '*.geojson')


.PHONY: all
all: help

.PHONY: help
help:
	@echo "Usage: make <target>"
	@echo
	@echo "Main targets:"
	@echo
	@echo "- dist                    Create a "distribution" for the library (dist/ol3gm.js)"
	@echo "- check                   Perform a number of checks on the code (lint, compile, etc.)"
	@echo "- lint                    Check the code with the linter"
	@echo "- serve                   Run a development web server for running the examples"
	@echo "- dist-examples           Create a "distribution" for the examples (dist/examples/)"
	@echo "- dist-apidoc             Create a "distribution" for the api docs (dist/apidoc/)"
	@echo "- clean                   Remove generated files"
	@echo "- cleanall                Remove all the build artefacts"
	@echo "- help                    Display this help message"
	@echo

.PHONY: npm-install
npm-install: .build/node_modules.timestamp

.PHONY: serve
serve: node_modules/openlayers/build/olX
	node build/serve.js

.PHONY: dist
dist: dist/ol3gm.js dist/ol3gm-debug.js CHANGES.md
	cp CHANGES.md dist/

.PHONY: dist-examples
dist-examples: .build/dist-examples.timestamp

.PHONY: dist-apidoc
dist-apidoc:
	node node_modules/.bin/jsdoc -c build/jsdoc/api/conf.json -d dist/apidoc

.PHONY: lint
lint: .build/python-venv/bin/gjslint .build/gjslint.timestamp

.build/geojsonhint.timestamp: $(EXAMPLES_GEOJSON_FILES)
	$(foreach file,$?, echo $(file); node_modules/geojsonhint/bin/geojsonhint $(file);)
	touch $@

.PHONY: check
check: lint dist .build/geojsonhint.timestamp

.PHONY: clean
clean:
	rm -f dist/ol3gm.js
	rm -f node_modules/openlayers/build/ol.js
	rm -f node_modules/openlayers/build/ol-debug.js
	rm -f node_modules/openlayers/build/ol.css
	rm -rf dist/ol3
	rm -rf dist/examples

.PHONY: cleanall
cleanall: clean
	rm -rf .build

.build/node_modules.timestamp: package.json
	npm install
	mkdir -p $(dir $@)
	touch $@

.build/gjslint.timestamp: $(SRC_JS_FILES)
	.build/python-venv/bin/gjslint --jslint_error=all --strict --custom_jsdoc_tags=api $?
	touch $@

.build/dist-examples.timestamp: node_modules/openlayers/build/olX dist/ol3gm.js $(EXAMPLES_JS_FILES) $(EXAMPLES_HTML_FILES)
	node build/parse-examples.js
	mkdir -p $(dir $@)
	cp -R examples dist/
	cp node_modules/openlayers/css/ol.css dist/examples/resources/ol.css
	cp css/ol3gm.css dist/examples/resources/ol3gm.css
	for f in dist/examples/*.html; do \
		$(SEDI) 's|/@loader|../ol3gm.js|' $$f ; \
		$(SEDI) 's|<script.*build/ol\.js.*script>||' $$f; \
		$(SEDI) 's|AIzaSyD71KlyTCXJouZsGbgPCJ-oCtK76fZJUTQ|$(API_KEY)|' $$f; \
		$(SEDI) 's|../node_modules/openlayers/css/ol.css|resources/ol.css|' $$f ; \
		$(SEDI) 's|../css/ol3gm.css|resources/ol3gm.css|' $$f ; \
	done
	touch $@

.build/python-venv:
	mkdir -p $(dir $@)
	virtualenv --no-site-packages $@

.build/python-venv/bin/gjslint: .build/python-venv
	.build/python-venv/bin/pip install "http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz"
	touch $@

dist/ol3gm-debug.js: build/ol3gm-debug.json $(SRC_JS_FILES) build/build.js npm-install
	mkdir -p $(dir $@)
	node build/build.js $< $@


node_modules/openlayers/node_modules/rbush/package.json: node_modules/openlayers/package.json
	(cd ol3 && npm install --production)

node_modules/openlayers/build/ol.ext/rbush.js: node_modules/openlayers/node_modules/rbush/package.json
	(cd ol3 && node tasks/build-ext.js)

# A sourcemap is prepared, the source is exected to be deployed in 'source' directory
dist/ol3gm.js: build/ol3gm.json $(SRC_JS_FILES) build/build.js npm-install node_modules/openlayers/build/ol.ext/rbush.js
	mkdir -p $(dir $@)
	node build/build.js $< $@
	$(SEDI) 's!$(shell pwd)/dist!source!g' dist/ol3gm.js.map
	$(SEDI) 's!$(shell pwd)!source!g' dist/ol3gm.js.map
#	echo '//# sourceMappingURL=ol3gm.js.map' >> dist/ol3gm.js
#	-ln -s .. dist/source

.PHONY: node_modules/openlayers/build/olX
node_modules/openlayers/build/olX: npm-install
	(cd node_modules/openlayers && npm install && make build)
