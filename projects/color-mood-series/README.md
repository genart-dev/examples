# Color Mood Series

Color adjustment variations showcasing `@genart-dev/plugin-color-adjust`.

![Color Mood Series](renders/mood-series.png)

## Scenes

| # | Scene | Source | Description |
|---|-------|--------|-------------|
| 1 | HSL Shifts | [01-hsl.genart](renders/01-hsl.genart) | Hue rotation (60/120/180), saturation and lightness sweeps |
| 2 | Levels | [02-levels.genart](renders/02-levels.genart) | High key, low key, high contrast, faded, gamma variations |
| 3 | Curves | [03-curves.genart](renders/03-curves.genart) | S-curve, lifted blacks, crushed highlights, cross-process, solarize, posterize |
| 4 | Mood Board | [04-mood-board.genart](renders/04-mood-board.genart) | 7 named moods — golden hour, midnight, overcast, vintage, neon, autumn, arctic |
| 5 | Contact Sheet | [mood-series.genart](renders/mood-series.genart) | Combined overview of all scenes |

## Plugins

- `@genart-dev/plugin-color-adjust` — `hslLayerType`, `levelsLayerType`, `curvesLayerType`

## Usage

```bash
bash renders/render.sh
```

Output goes to `renders/`.
