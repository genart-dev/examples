#!/usr/bin/env bash
# Re-render all composition-explorer .genart files
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
CLI="$HOME/genart-dev/cli/dist/index.js"

node "$CLI" render "$DIR/classical-systems.genart"   -o "$DIR/classical-systems.png"
node "$CLI" render "$DIR/flow-analysis.genart"       -o "$DIR/flow-analysis.png"
node "$CLI" render "$DIR/safe-zones.genart"          -o "$DIR/safe-zones.png"
node "$CLI" render "$DIR/musical-harmony.genart"     -o "$DIR/musical-harmony.png"
node "$CLI" render "$DIR/spiral-orientations.genart" -o "$DIR/spiral-orientations.png"

echo "Done — 5 PNGs rendered."
