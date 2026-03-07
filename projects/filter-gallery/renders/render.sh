#!/usr/bin/env bash
# Re-render all filter-gallery .genart files
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
CLI="$HOME/genart-dev/cli/dist/index.js"

node "$CLI" render "$DIR/01-grain.genart"          -o "$DIR/01-grain.png"
node "$CLI" render "$DIR/02-duotone.genart"        -o "$DIR/02-duotone.png"
node "$CLI" render "$DIR/03-chromatic.genart"      -o "$DIR/03-chromatic.png"
node "$CLI" render "$DIR/04-vignette.genart"       -o "$DIR/04-vignette.png"
node "$CLI" render "$DIR/05-filter-chains.genart"  -o "$DIR/05-filter-chains.png"
node "$CLI" render "$DIR/filter-gallery.genart"    -o "$DIR/filter-gallery.png"

echo "Done — 6 PNGs rendered."
