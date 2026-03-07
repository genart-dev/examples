#!/usr/bin/env bash
# Re-render all color-mood-series .genart files
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
CLI="$HOME/genart-dev/cli/dist/index.js"

node "$CLI" render "$DIR/01-hsl.genart"        -o "$DIR/01-hsl.png"
node "$CLI" render "$DIR/02-levels.genart"     -o "$DIR/02-levels.png"
node "$CLI" render "$DIR/03-curves.genart"     -o "$DIR/03-curves.png"
node "$CLI" render "$DIR/04-mood-board.genart" -o "$DIR/04-mood-board.png"
node "$CLI" render "$DIR/mood-series.genart"   -o "$DIR/mood-series.png"

echo "Done — 5 PNGs rendered."
