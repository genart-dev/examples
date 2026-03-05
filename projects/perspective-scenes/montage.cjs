/**
 * Montage — Composites all 4 perspective scene renders into a 2x2 grid image.
 */

"use strict";

const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const TILE = 800;
const GAP = 4;
const COLS = 2;
const ROWS = 2;
const OUT_W = COLS * TILE + (COLS - 1) * GAP;
const OUT_H = ROWS * TILE + (ROWS - 1) * GAP;

const renderDir = path.join(__dirname, "renders");

const tiles = [
  "recipe-01-synthwave-sunset.png",
  "recipe-02-city-corner.png",
  "recipe-03-vertigo-tower.png",
  "recipe-04-isometric-workshop.png",
];

async function montage() {
  console.log("\n=== Perspective Scenes Montage ===\n");

  const canvas = createCanvas(OUT_W, OUT_H);
  const ctx = canvas.getContext("2d");

  // Dark background for gap lines
  ctx.fillStyle = "#1A1A1A";
  ctx.fillRect(0, 0, OUT_W, OUT_H);

  for (let i = 0; i < tiles.length; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = col * (TILE + GAP);
    const y = row * (TILE + GAP);

    const tilePath = path.join(renderDir, tiles[i]);
    if (!fs.existsSync(tilePath)) {
      console.error(`  Missing: ${tilePath} — run render-recipes.cjs first`);
      continue;
    }

    const img = await loadImage(tilePath);
    ctx.drawImage(img, x, y, TILE, TILE);
    console.log(`  [${col},${row}] ${tiles[i]}`);
  }

  const outPath = path.join(renderDir, "montage.png");
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log(`\n  -> ${outPath}`);
}

montage().catch((err) => {
  console.error("Montage failed:", err);
  process.exit(1);
});
