#!/usr/bin/env bash
# Re-render all construction-drawings .genart files
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
CLI="$HOME/genart-dev/cli/dist/index.js"

node "$CLI" render "$DIR/01-basic-forms.genart"    -o "$DIR/01-basic-forms.png"
node "$CLI" render "$DIR/02-form-rotations.genart"  -o "$DIR/02-form-rotations.png"
node "$CLI" render "$DIR/03-value-shapes.genart"    -o "$DIR/03-value-shapes.png"
node "$CLI" render "$DIR/04-envelopes.genart"       -o "$DIR/04-envelopes.png"
node "$CLI" render "$DIR/05-guide-overlay.genart"   -o "$DIR/05-guide-overlay.png"
node "$CLI" render "$DIR/technical-plate.genart"    -o "$DIR/technical-plate.png"

echo "Done — 6 PNGs rendered."
