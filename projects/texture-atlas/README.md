# Texture Atlas

Procedural texture reference card showcasing `@genart-dev/plugin-textures`.

![Texture Atlas](renders/texture-atlas.png)

## Scenes

| # | Scene | Description |
|---|-------|-------------|
| 1 | Paper Textures | 8 paper variations — smooth, cold press, hot press, rough, tinted, kraft, dark |
| 2 | Canvas Textures | 8 canvas weaves — fine to coarse, linen, warm, raw, dark |
| 3 | Washi Textures | 8 washi papers — sparse to dense fibers, long/short, warm/cool/dark |
| 4 | Noise Textures | 12 noise variations — value, fractal, ridged at different scales and color mappings |
| 5 | Texture Grid | 4x4 reference card with one representative from each texture type |
| 6 | Contact Sheet | Combined overview of all scenes |

## Plugins

- `@genart-dev/plugin-textures` — `paperLayerType`, `canvasLayerType`, `washiLayerType`, `noiseTextureLayerType`

## Usage

```bash
npm install
node render.cjs
```

Output goes to `renders/`.
