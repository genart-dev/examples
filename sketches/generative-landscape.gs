// Generative landscape — layered terrain with atmosphere
// Tests: multiple loops, noise layering, gradients, color mixing, named args

param layers 5 range:2..10 step:1
param roughness 0.3 range:0.05..0.8 step:0.05
param horizon 0.35 range:0.2..0.6 step:0.05
color sky #2d1b69
color ground #1a472a
color sun #ffd700
color mist #e8e0d0

// sky gradient
rect 0 0 w:w h:h fill:linear($sky, #0a0a1a)

// sun glow
circle w * 0.7 h * horizon r:60 fill:$sun.40
bloom(0.8)

// terrain layers — back to front
for layer in 0..layers:
  depth = layer / layers
  baseY = h * horizon + depth * h * (1 - horizon)
  amplitude = 80 * (1 - depth * 0.3)
  freq = 0.003 + depth * 0.002

  // terrain profile
  for x in 0..w:
    n = noise(x * freq + layer * 100, depth * 10) * amplitude
    n = n + noise(x * freq * 3, layer * 50) * amplitude * roughness * 0.3
    y = baseY - n

    // vertical fill from terrain line to bottom
    terrainH = h - y
    darkness = 0.3 + depth * 0.5
    rect x y w:1 h:terrainH fill:$ground

  // mist between layers
  if layer > 0:
    mistAlpha = (1 - depth) * 0.08
    rect 0 baseY - 40 w:w h:80 fill:$mist

post:
  vignette(0.6)
  grain(0.04)
  grade(1.1, 0.9, 1.0, -5)
