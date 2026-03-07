# Construction Drawings

Geometric constructions and compositional guides showcasing `@genart-dev/plugin-construction` and `@genart-dev/plugin-layout-guides`.

![Construction Drawings](renders/technical-plate.png)

## Scenes

| # | Scene | Source | Description |
|---|-------|--------|-------------|
| 1 | Basic Forms | [01-basic-forms.genart](renders/01-basic-forms.genart) | 6 form primitives (box, cylinder, sphere, cone, wedge, egg) with cross-contours and axes |
| 2 | Form Rotations | [02-form-rotations.genart](renders/02-form-rotations.genart) | Box rotated through 8 different X/Y/Z angle combinations |
| 3 | Value Shapes | [03-value-shapes.genart](renders/03-value-shapes.genart) | Light/shadow decomposition — 2, 3, and 5-value groupings with varying light directions |
| 4 | Envelopes | [04-envelopes.genart](renders/04-envelopes.genart) | Bounding shapes — tight, loose, with angles, plumb lines, and subdivisions |
| 5 | Guide Overlay | [05-guide-overlay.genart](renders/05-guide-overlay.genart) | Thirds, golden ratio, diagonals, and grid guides over a still life composition |
| 6 | Technical Plate | [technical-plate.genart](renders/technical-plate.genart) | Combined overview of all scenes |

## Plugins

- `@genart-dev/plugin-construction` — `construction:form`, `construction:value-shapes`, `construction:envelope`
- `@genart-dev/plugin-layout-guides` — `guides:grid`, `guides:thirds`, `guides:golden-ratio`, `guides:diagonal`

## Usage

```bash
bash renders/render.sh
```

Output PNGs go to `renders/`.
