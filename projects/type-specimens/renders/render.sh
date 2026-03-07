#!/usr/bin/env bash
# Re-render all type-specimens .genart files
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
CLI="$HOME/genart-dev/cli/dist/index.js"

node "$CLI" render "$DIR/01-font-catalog.genart"   -o "$DIR/01-font-catalog.png"
node "$CLI" render "$DIR/02-pangrams.genart"        -o "$DIR/02-pangrams.png"
node "$CLI" render "$DIR/03-scale-hierarchy.genart" -o "$DIR/03-scale-hierarchy.png"
node "$CLI" render "$DIR/04-text-blocks.genart"     -o "$DIR/04-text-blocks.png"
node "$CLI" render "$DIR/05-character-grid.genart"  -o "$DIR/05-character-grid.png"
node "$CLI" render "$DIR/specimen-sheet.genart"     -o "$DIR/specimen-sheet.png"

echo "Done — 6 PNGs rendered."
