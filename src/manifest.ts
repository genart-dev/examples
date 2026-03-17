/** Curated examples manifest — prompt + annotation metadata for each sketch. */

/** Metadata for a single gallery example. */
export interface ExampleEntry {
  /** Unique identifier matching the .genart file id. */
  id: string;
  /** Display title. */
  title: string;
  /** The AI prompt that "created" this sketch. */
  prompt: string;
  /** Prompt type label. */
  promptType: "create" | "explore" | "design-theory";
  /** Brief annotation shown below the preview. */
  annotation: string;
  /** Filename of the companion .genart file (relative to sketches/). */
  sketchFile: string;
}

export const EXAMPLES: ExampleEntry[] = [
  {
    id: "murmuration",
    title: "Murmuration",
    prompt:
      "Create a boids flocking simulation with fading trails — hundreds of particles following separation, alignment, and cohesion rules, swirling like a flock of starlings at dusk.",
    promptType: "create",
    annotation:
      "Boids flocking with separation, alignment, and cohesion. Each bird leaves a fading trail, creating emergent order from three simple rules.",
    sketchFile: "murmuration.genart",
  },
  {
    id: "tide-pool",
    title: "Tide Pool",
    prompt:
      "Simulate organisms in a tidal rock pool — circles growing outward from random points, modulated by Perlin noise, stopping when they collide. Translucent, layered, aquatic palette.",
    promptType: "create",
    annotation:
      "Perlin-noise-modulated circle growth with collision detection. Organisms compete for space, creating a dense, translucent tidal composition.",
    sketchFile: "tide-pool.genart",
  },
  {
    id: "lichen",
    title: "Lichen",
    prompt:
      "Create a diffusion-limited aggregation (DLA) simulation — random walkers that stick to an existing structure, building fractal crystal-like growth from a single seed point.",
    promptType: "create",
    annotation:
      "Diffusion-limited aggregation: random walkers drift until they touch the growing structure and freeze in place. Fractal, patient, irreversible.",
    sketchFile: "lichen.genart",
  },
  {
    id: "erosion",
    title: "Erosion",
    prompt:
      "Generate a geological survey map — a multi-octave noise heightmap with simulated water erosion and contour lines. Earthy, cartographic palette, scientific aesthetic.",
    promptType: "create",
    annotation:
      "Multi-octave Perlin noise heightmap with simulated water droplet erosion and contour line extraction. A fictional landscape survey.",
    sketchFile: "erosion.genart",
  },
  {
    id: "textile",
    title: "Textile",
    prompt:
      "Simulate a handwoven textile — interlocking warp and weft threads with subtle variation in spacing and thickness. Each thread has character; the whole has structure.",
    promptType: "design-theory",
    annotation:
      "Simulated warp/weft weave with pattern variation. Thread spacing, width, and color shift create the illusion of handwoven fabric.",
    sketchFile: "textile.genart",
  },
  {
    id: "phase-space",
    title: "Phase Space",
    prompt:
      "Explore the phase space of a double pendulum — plot the trajectory in angle-angle space using RK4 numerical integration. Reveal the chaotic attractor that emerges over time.",
    promptType: "explore",
    annotation:
      "Double pendulum trajectory plotted in angle-angle phase space using RK4 integration. A deterministic system that never repeats.",
    sketchFile: "phase-space.genart",
  },
  {
    id: "coral",
    title: "Coral",
    prompt:
      "Create a 3D coral reef — L-system branching with randomized angles and underwater lighting. Each branch is a decision; the whole is a living architecture.",
    promptType: "create",
    annotation:
      "L-system branching in 3D with randomized angles. Directional lighting and warm-to-cool color gradients create depth.",
    sketchFile: "coral.genart",
  },
  {
    id: "constellation",
    title: "Constellation",
    prompt:
      "Create a slowly orbiting star field — points distributed on a sphere with proximity-based edge connections. The human instinct to connect scattered points into meaning.",
    promptType: "create",
    annotation:
      "Points on a sphere with proximity-based edge connections. Stars orbit slowly, constellation lines form and dissolve.",
    sketchFile: "constellation.genart",
  },
  {
    id: "origami",
    title: "Origami",
    prompt:
      "Animate an origami fold sequence — a flat mesh that sequentially folds along creases, transforming from a sheet into a geometric form. Geometry as transformation.",
    promptType: "create",
    annotation:
      "Sequential fold transformations on a flat mesh. Each fold rotates vertices around a crease axis, building complexity from flatness.",
    sketchFile: "origami.genart",
  },
  {
    id: "aurora",
    title: "Aurora",
    prompt:
      "Create a GLSL aurora borealis — multi-octave noise distorted along horizontal bands with additive color blending. Northern lights over a frozen landscape.",
    promptType: "create",
    annotation:
      "Multi-octave noise curtains with additive blending. Horizontal bands of light undulate and shift, mimicking auroral dynamics.",
    sketchFile: "aurora.genart",
  },
  {
    id: "mycelium",
    title: "Mycelium",
    prompt:
      "Create a GLSL mycelium network — Voronoi distance fields with animated veins along cell boundaries and a pulsing bioluminescent glow. The wood-wide web.",
    promptType: "create",
    annotation:
      "Voronoi distance field with animated veins along cell boundaries. Pulsing glow simulates nutrient flow through a fungal network.",
    sketchFile: "mycelium.genart",
  },
  {
    id: "interference",
    title: "Interference",
    prompt:
      "Create a GLSL wave interference pattern — multiple point sources emitting sine waves that overlap to create moiré patterns. Ripples meeting ripples.",
    promptType: "explore",
    annotation:
      "Multiple sine wave point sources with additive superposition. Constructive and destructive interference creates evolving moiré patterns.",
    sketchFile: "interference.genart",
  },
  {
    id: "archipelago",
    title: "Archipelago",
    prompt:
      "Generate an SVG cartographic map of fictional islands — noise heightmap thresholded at sea level with concentric contour lines for elevation. Imagined geography.",
    promptType: "create",
    annotation:
      "Noise heightmap thresholded at sea level, with concentric contour lines for elevation. A cartographer's map of islands that don't exist.",
    sketchFile: "archipelago.genart",
  },
  {
    id: "letterpress",
    title: "Letterpress",
    prompt:
      "Apply Bauhaus composition principles — a grid of geometric primitives (circles, rectangles, triangles) placed by seeded RNG. Constraint breeds creativity.",
    promptType: "design-theory",
    annotation:
      "Grid cells filled with geometric primitives by seeded RNG. Systematic composition where constraint breeds creativity.",
    sketchFile: "letterpress.genart",
  },
  {
    id: "watercolor-landscape",
    title: "Watercolor Landscape",
    prompt:
      "Create a watercolor landscape using p5.brush — layered hill washes with bleed, soft clouds, and charcoal foreground texture. Atmospheric depth from back to front.",
    promptType: "create",
    annotation:
      "p5.brush watercolor washes create layered hills with natural bleed. Charcoal foreground strokes and soft cloud forms add atmospheric depth.",
    sketchFile: "watercolor-landscape.genart",
  },
  {
    id: "ink-botanicals",
    title: "Ink Botanicals",
    prompt:
      "Draw botanical specimens in pen and watercolor — branching stems with leaves and flowers, using p5.brush pen strokes for outlines and watercolor fills for washes.",
    promptType: "create",
    annotation:
      "Recursive botanical forms drawn with p5.brush pen strokes and watercolor leaf washes. Each seed grows a unique specimen arrangement.",
    sketchFile: "ink-botanicals.genart",
  },
  {
    id: "hatched-still-life",
    title: "Hatched Still Life",
    prompt:
      "Render a still life of vases, bottles, and bowls using cross-hatching — p5.brush HB pencil hatching at varying angles and densities to create form and shadow.",
    promptType: "create",
    annotation:
      "Cross-hatched still life using p5.brush HB pencil. Varying hatch angle and density build volume and cast shadow on each object.",
    sketchFile: "hatched-still-life.genart",
  },
  {
    id: "brush-catalog",
    title: "Brush Catalog",
    prompt:
      "Create a comprehensive catalog of p5.brush capabilities — all 7 stroke brushes at 3 weights, watercolor fills at varying bleed, and hatching patterns at different spacings and angles.",
    promptType: "explore",
    annotation:
      "A systematic catalog of p5.brush: 7 stroke brushes, watercolor fills with bleed control, and hatching at varying density and angle.",
    sketchFile: "brush-catalog.genart",
  },
];
