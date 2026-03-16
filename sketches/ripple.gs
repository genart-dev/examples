// Ripple — interactive animated sketch
// Tests: mouseX/Y, mouseDown, frame, circle, lerp, dist, post effects

param rings 12 range:4..30 step:1
param spread 40 range:10..80 step:5
param decay 0.95 range:0.8..0.99 step:0.01
color bg #0d1117
color ring #58a6ff

once:
  bg $bg

frame:
  rect 0 0 w:w h:h fill:$bg.10

  // ripple from mouse
  if mouseDown:
    loop rings:
      r = (i + 1) * spread + sin(t * 3 + i) * 10
      alpha = (1 - i / rings) * 0.4
      circle mouseX mouseY r:r stroke:$ring.alpha

  // ambient ripples
  loop 3:
    cx = w * (i + 1) / 4
    cy = h / 2 + sin(t + i * 2) * 100
    loop 8:
      r = (i + 1) * 25 + cos(t * 2) * 5
      circle cx cy r:r stroke:$ring.15

post:
  bloom(0.3)
  chromatic_aberration(2)
  vignette(0.4)
