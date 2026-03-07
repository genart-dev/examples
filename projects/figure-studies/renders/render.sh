#!/usr/bin/env bash
# Re-render all figure-studies .genart files
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
CLI="$HOME/genart-dev/cli/dist/index.js"

node "$CLI" render "$DIR/01-mannequin-styles.genart"   -o "$DIR/01-mannequin-styles.png"
node "$CLI" render "$DIR/02-gesture-drawing.genart"    -o "$DIR/02-gesture-drawing.png"
node "$CLI" render "$DIR/03-proportion-systems.genart"  -o "$DIR/03-proportion-systems.png"
node "$CLI" render "$DIR/04-head-construction.genart"   -o "$DIR/04-head-construction.png"
node "$CLI" render "$DIR/05-posed-skeletons.genart"     -o "$DIR/05-posed-skeletons.png"
node "$CLI" render "$DIR/figure-sheet.genart"           -o "$DIR/figure-sheet.png"

echo "Done — 6 PNGs rendered."
