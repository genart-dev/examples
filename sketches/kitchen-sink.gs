// Kitchen sink — exercises every grammar feature for syntax highlighting testing
// NOT meant to produce beautiful art — meant to test the VS Code grammar

param count 50 range:10..200 step:5
param size 30 range:5..100 step:1
param speed 1.0 range:0.1..5.0 step:0.1
color bg #1e1e2e
color primary #cba6f7
color accent #f38ba8

use easing

// function definition
fn spiral cx cy r n:
  for i in 0..n:
    angle = i / n * TWO_PI * 3
    dist2 = r * i / n
    x = cx + cos(angle) * dist2
    y = cy + sin(angle) * dist2
    dot x y fill:$primary

// helper function
fn makeGrid cols rows:
  loop cols * rows:
    gx = i % cols * (w / cols)
    gy = floor(i / cols) * (h / rows)
    dot gx gy fill:$accent.20

// let bindings
let margin = 40
let grid = 8

// named seed
seed "stars" 42

// variables and math
halfW = w / 2
halfH = h / 2
diagonal = sqrt(halfW ** 2 + halfH ** 2)

once:
  bg $bg

  // gradients as fill
  rect 0 0 w:w h:h fill:linear(#1e1e2e, #313244)

  // draw commands: circle, rect, line, arc, poly, path, text
  circle halfW halfH r:100 fill:$primary.30
  rect margin margin w:w - margin * 2 h:h - margin * 2 stroke:$accent
  line 0 0 w h stroke:$accent.50
  arc halfW halfH r:80 start:0 end:PI fill:$primary.15
  dot halfW halfH fill:white

  // for-in with step
  for x in margin..w - margin step:grid:
    for y in margin..h - margin step:grid:
      n = noise(x * 0.01, y * 0.01)
      if n > 0.3:
        circle x y r:2 fill:$primary

  // at block (translate)
  at halfW halfH:
    circle 0 0 r:30 fill:$accent.40

  // rotate block
  rotate PI / 4:
    rect 10 10 w:50 h:50 fill:$accent.20

  // blend mode block
  blend screen:
    circle halfW halfH r:150 fill:$primary.20

  // offscreen buffer
  buf = buffer(200, 200)
  into buf:
    rect 0 0 w:200 h:200 fill:radial(#cba6f7, transparent)
  draw buf halfW - 100 halfH - 100 alpha:0.5

  // text
  text "genart" halfW halfH - 200 size:48 fill:white

  // call custom function
  spiral(halfW, halfH, 80, 60)

  // watch for debugging
  watch "diagonal" diagonal
  print "sketch loaded"

frame:
  // animated overlay
  rect 0 0 w:w h:h fill:$bg.08
  loop count:
    angle = t * speed + i * TWO_PI / count
    x = halfW + cos(angle) * (100 + sin(t + i) * 50)
    y = halfH + sin(angle) * (100 + cos(t + i) * 50)
    s = size * (0.5 + sin(t * 2 + i) * 0.5)
    circle x y r:s fill:$primary.15 stroke:$accent.30

  // event handler
  on click:
    circle mouseX mouseY r:20 fill:$accent

  // key handler
  on key "r":
    bg $bg

post:
  bloom(0.15)
  vignette(0.3)
  grain(0.02)
  dither(0.1)
