// Flow field — animated sketch with frame/once blocks
// Tests: frame, once, for-in range, at block, rotate, fn, math builtins

param density 20 range:5..50 step:5
param speed 0.02 range:0.005..0.1 step:0.005
param length 15 range:5..40 step:1
color bg #1a1a2e
color stroke #e94560

once:
  bg $bg

frame:
  // fade trail
  rect 0 0 w:w h:h fill:$bg.05

  for x in 0..w step:density:
    for y in 0..h step:density:
      angle = noise(x * 0.005, y * 0.005, t * speed) * PI * 4
      dx = cos(angle) * length
      dy = sin(angle) * length
      line x y x + dx y + dy stroke:$stroke.30
