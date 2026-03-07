# Filter Gallery

Before/after filter chain demos showcasing `@genart-dev/plugin-filters`.

![Filter Gallery](renders/filter-gallery.png)

## Scenes

| # | Scene | Source | Description |
|---|-------|--------|-------------|
| 1 | Grain Textures | [01-grain.genart](renders/01-grain.genart) | Film grain — intensity sweep, size sweep, monochrome vs color |
| 2 | Duotone Palettes | [02-duotone.genart](renders/02-duotone.genart) | 7 duotone color pairs on the same test pattern |
| 3 | Chromatic Aberration | [03-chromatic.genart](renders/03-chromatic.genart) | RGB channel offset from 1px to 15px, horizontal/vertical/diagonal |
| 4 | Vignette Moods | [04-vignette.genart](renders/04-vignette.genart) | Varying softness, radius, and color (black, sepia, blue) |
| 5 | Filter Chains | [05-filter-chains.genart](renders/05-filter-chains.genart) | Stacked filters — grain+vignette, duotone+chromatic, full stack |
| 6 | Contact Sheet | [filter-gallery.genart](renders/filter-gallery.genart) | Combined overview of all scenes |

## Plugins

- `@genart-dev/plugin-filters` — `grainLayerType`, `duotoneLayerType`, `chromaticAberrationLayerType`, `vignetteLayerType`

## Usage

```bash
bash renders/render.sh
```

Output PNGs go to `renders/`.
