#!/usr/bin/env bash
# Re-render all texture-atlas .genart files
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
CLI="$HOME/genart-dev/cli/dist/index.js"

node "$CLI" render "$DIR/01-paper.genart"       -o "$DIR/01-paper.png"
node "$CLI" render "$DIR/02-canvas.genart"      -o "$DIR/02-canvas.png"
node "$CLI" render "$DIR/03-washi.genart"       -o "$DIR/03-washi.png"
node "$CLI" render "$DIR/04-noise.genart"       -o "$DIR/04-noise.png"
node "$CLI" render "$DIR/05-texture-grid.genart" -o "$DIR/05-texture-grid.png"
node "$CLI" render "$DIR/texture-atlas.genart"  -o "$DIR/texture-atlas.png"

echo "Done — 6 PNGs rendered."
