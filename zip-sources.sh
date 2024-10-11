#!/bin/bash

# zip all source files for review
PACKAGE_VERSION=$(node -p -e "require('./package.json').version")

OUTPUT_FILE=web-ext-artifacts/neoatlantis_slate_browser_$PACKAGE_VERSION.src.zip

mkdir -p web-ext-artifacts
zip -r $OUTPUT_FILE \
	./src ./webpack ./package.json ./pnpm-lock.yaml ./README.md ./webpack.config.js
