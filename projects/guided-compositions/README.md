# Guided Compositions

Compositional guide system showcase using `@genart-dev/plugin-layout-guides` and `@genart-dev/plugin-layout-composition`.

![Guided Compositions](renders/guide-comparison.png)

## Scenes

| # | Scene | Description |
|---|-------|-------------|
| 1 | Rule of Thirds | Elements placed at power points |
| 2 | Golden Ratio | Golden ratio + golden spiral overlay |
| 3 | Dynamic Symmetry | Dynamic symmetry + diagonal grid overlay |
| 4 | Armature & Rabatment | Combined armature and rabatment guides |
| 5 | Musical Ratios | Harmonic divisions |
| 6 | Flow Paths | Eye movement trajectories |
| 7 | Guide Comparison | All guide types on the same composition |

## Plugins

- `@genart-dev/plugin-layout-guides` — `gridGuideLayerType`, `thirdsGuideLayerType`, `goldenRatioGuideLayerType`, `diagonalGuideLayerType`, `customGuideLayerType`
- `@genart-dev/plugin-layout-composition` — `goldenSpiralGuideLayerType`, `armatureGuideLayerType`, `rabatmentGuideLayerType`, `dynamicSymmetryGuideLayerType`, `musicalRatiosGuideLayerType`, `flowPathGuideLayerType`

## Usage

```bash
npm install
node render.cjs
```

Output goes to `renders/`.
