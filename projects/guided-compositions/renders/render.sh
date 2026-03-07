#!/usr/bin/env bash
# Re-render all guided-compositions .genart files
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
CLI="$HOME/genart-dev/cli/dist/index.js"

node "$CLI" render "$DIR/01-thirds.genart"              -o "$DIR/01-thirds.png"
node "$CLI" render "$DIR/02-golden-ratio.genart"        -o "$DIR/02-golden-ratio.png"
node "$CLI" render "$DIR/03-dynamic-symmetry.genart"    -o "$DIR/03-dynamic-symmetry.png"
node "$CLI" render "$DIR/04-armature-rabatment.genart"  -o "$DIR/04-armature-rabatment.png"
node "$CLI" render "$DIR/05-musical-ratios.genart"      -o "$DIR/05-musical-ratios.png"
node "$CLI" render "$DIR/06-flow-paths.genart"          -o "$DIR/06-flow-paths.png"
node "$CLI" render "$DIR/guide-comparison.genart"       -o "$DIR/guide-comparison.png"

echo "Done — 7 PNGs rendered."
