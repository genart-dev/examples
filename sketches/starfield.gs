// Starfield — static sketch with params, colors, post-effects
// Tests: param, color, bg, loop, circle, noise, color alpha, post block

param count 300 range:50..1000 step:10
param depth 0.5 range:0.1..1 step:0.05
color bg #0a0a1a
color star #ffffff

bg $bg

loop count:
  x = rnd(w)
  y = rnd(h)
  size = 0.5 + rnd(1) * 3 * depth
  brightness = 0.3 + rnd(1) * 0.7
  n = noise(x * 0.005, y * 0.005)
  size = size * (0.5 + n)
  circle x y r:size fill:$star

// nebula glow clusters
loop 5:
  cx = rnd(w)
  cy = rnd(h)
  loop 40:
    ox = cx + (rnd(1) - 0.5) * 120
    oy = cy + (rnd(1) - 0.5) * 120
    r = 1 + rnd(1) * 2
    circle ox oy r:r fill:$star.08

post:
  bloom(0.2)
  vignette(0.5)
  grain(0.03)
