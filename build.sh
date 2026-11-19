#!/bin/sh
# Build the web app into docs/ (served by GitHub Pages and loaded by the Android app)
set -e
cd "$(dirname "$0")/.."
V=$(date +%Y%m%d%H%M%S)
NODE_PATH=tools/node_modules tools/node_modules/.bin/esbuild web/src/app.js --bundle --minify --format=esm --target=es2020,safari15 --outfile=docs/app.js --legal-comments=none --log-level=warning
cp web/style.css docs/style.css
cp web/desktop.js docs/desktop.js
cp web/manifest.webmanifest docs/manifest.webmanifest
sed "s/__VERSION__/$V/g" web/index.html > docs/index.html
sed "s/__VERSION__/$V/g" web/sw.js > docs/sw.js
touch docs/.nojekyll
[ -f docs/news.json ] || echo '{"updated":null,"items":[]}' > docs/news.json
echo "built $V  app.js $(wc -c < docs/app.js) bytes"
