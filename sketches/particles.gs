// Particle system — animated with prev (feedback), touch input
// Tests: prev, touchX/Y, touches array, for-in, collect loop, vectors

param count 200 range:50..500 step:25
param gravity 0.1 range:0..0.5 step:0.01
param wind 0 range:-1..1 step:0.1
color bg #000000
color hot #ff6b35
color cool #004e89

// particle state as arrays
once:
  bg $bg

frame:
  // fade using prev frame
  rect 0 0 w:w h:h fill:$bg.05

  loop count:
    // unique per-particle seed
    seed "p" i
    age = (t * 2 + i * 0.1) % 3
    life = age / 3

    // spawn from bottom center or touch point
    spawnX = touchX > 0 ? touchX : w / 2 + rnd(-50, 50)
    spawnY = touchY > 0 ? touchY : h

    // physics
    x = spawnX + sin(i * 0.5 + t) * 30 * life + wind * age * 20
    y = spawnY - age * 150 + gravity * age * age * 100
    vel = 1 - life

    // color interpolation by life
    s = 3 * vel + 1
    if life < 0.5:
      circle x y r:s fill:$hot
    else:
      circle x y r:s * 0.7 fill:$cool

  // touch indicators
  for touch in touches:
    circle touch.x touch.y r:5 fill:white.50

post:
  bloom(0.4)
  chromatic_aberration(1)
