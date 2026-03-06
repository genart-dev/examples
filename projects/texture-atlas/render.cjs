/**
 * Texture Atlas — Procedural texture reference
 *
 * 1. "Paper Textures"   — paperLayerType with varying roughness, color, and grain
 * 2. "Canvas Textures"  — canvasLayerType with different weave densities and tints
 * 3. "Washi Textures"   — washiLayerType with fiber density, color, and transparency variations
 * 4. "Noise Textures"   — noiseTextureLayerType with scale, octaves, and type sweeps
 * 5. "Texture Grid"     — 4x4 grid combining all texture types as a reference card
 * 6. "Contact Sheet"    — all texture studies combined
 *
 * Plugins used:
 *   - @genart-dev/plugin-textures  (paperLayerType, canvasLayerType, washiLayerType, noiseTextureLayerType)
 *
 * Output: renders/01-paper.png .. renders/texture-atlas.png
 *
 * Usage:
 *   npm install
 *   node render.cjs
 */

"use strict";

const canvasPkg = require("canvas");
const { createCanvas, Image } = canvasPkg;
const fs = require("fs");
const path = require("path");

if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = canvasPkg.ImageData;
}

const {
  paperLayerType,
  canvasLayerType,
  washiLayerType,
  noiseTextureLayerType,
} = require("../../../plugin-textures/dist/index.cjs");

// --- Shared setup ---

const outDir = path.join(__dirname, "renders");
fs.mkdirSync(outDir, { recursive: true });

const resources = { getFont: () => null, getImage: () => null, theme: "light", pixelRatio: 1 };

function full(w, h) {
  return { x: 0, y: 0, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 };
}

function save(canvas, name) {
  const filePath = path.join(outDir, name);
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));
  console.log(`  -> ${filePath}`);
}

// Helper: render a layer type into a cell-sized canvas, then draw it onto the main canvas
function renderCell(layerType, props, cellW, cellH) {
  const cellCanvas = createCanvas(cellW, cellH);
  const cellCtx = cellCanvas.getContext("2d");
  layerType.render(props, cellCtx, full(cellW, cellH), resources);
  return cellCanvas;
}

// Helper: draw a labeled grid of cells
function renderLabeledGrid(title, cells, cols, cellW, cellH, padding) {
  const rows = Math.ceil(cells.length / cols);
  const W = cols * cellW + (cols + 1) * padding;
  const H = rows * cellH + (rows + 1) * padding + 50;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#e8e4dc";
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.fillStyle = "#333";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(title, padding, 30);

  for (let i = 0; i < cells.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * (cellW + padding);
    const y = 50 + padding + row * (cellH + padding);

    // Cell border
    ctx.strokeStyle = "#bbb";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, y - 1, cellW + 2, cellH + 2);

    // Cell image
    ctx.drawImage(cells[i].canvas, x, y, cellW, cellH);

    // Label
    ctx.fillStyle = "#555";
    ctx.font = "11px sans-serif";
    ctx.fillText(cells[i].label, x, y + cellH + 14);
  }

  return canvas;
}

// ─── Scene 1: Paper Textures ─────────────────────────────────────────────────

function renderPaper() {
  console.log("Scene 1: Paper Textures");
  const cellW = 300, cellH = 300;

  const variations = [
    { label: "Smooth", preset: "smooth", color: "#f8f4ee" },
    { label: "Cold Press", preset: "cold-press", color: "#f8f4ee" },
    { label: "Hot Press", preset: "hot-press", color: "#f8f4ee" },
    { label: "Rough", preset: "rough", color: "#f8f4ee" },
    { label: "Warm Tint", preset: "cold-press", color: "#f0e0c8" },
    { label: "Cool Tint", preset: "cold-press", color: "#e8eef4" },
    { label: "Kraft", preset: "rough", color: "#c8b090" },
    { label: "Dark Paper", preset: "hot-press", color: "#3a3530" },
  ];

  const cells = variations.map((v, i) => ({
    label: v.label,
    canvas: renderCell(paperLayerType, {
      ...paperLayerType.createDefault(),
      preset: v.preset,
      color: v.color,
      seed: i * 37,
    }, cellW, cellH),
  }));

  const canvas = renderLabeledGrid("Paper Textures", cells, 4, cellW, cellH, 16);
  save(canvas, "01-paper.png");
}

// ─── Scene 2: Canvas Textures ────────────────────────────────────────────────

function renderCanvasTexture() {
  console.log("Scene 2: Canvas Textures");
  const cellW = 300, cellH = 300;

  const variations = [
    { label: "Fine Weave", weaveScale: 3, density: 0.4, roughness: 0.2, color: "#f0ece4" },
    { label: "Medium Weave", weaveScale: 6, density: 0.6, roughness: 0.4, color: "#f0ece4" },
    { label: "Coarse Weave", weaveScale: 12, density: 0.8, roughness: 0.5, color: "#f0ece4" },
    { label: "Linen (large)", weaveScale: 16, density: 0.7, roughness: 0.6, color: "#ede8dc" },
    { label: "Tight + Smooth", weaveScale: 2, density: 0.3, roughness: 0.1, color: "#f5f2ed" },
    { label: "Warm Canvas", weaveScale: 8, density: 0.6, roughness: 0.4, color: "#e8d8c0" },
    { label: "Raw Canvas", weaveScale: 10, density: 0.9, roughness: 0.7, color: "#d0c0a0" },
    { label: "Dark Canvas", weaveScale: 6, density: 0.5, roughness: 0.4, color: "#3a3530" },
  ];

  const cells = variations.map((v, i) => ({
    label: v.label,
    canvas: renderCell(canvasLayerType, {
      ...canvasLayerType.createDefault(),
      weaveScale: v.weaveScale,
      density: v.density,
      roughness: v.roughness,
      color: v.color,
      seed: i * 53,
    }, cellW, cellH),
  }));

  const canvas = renderLabeledGrid("Canvas Textures", cells, 4, cellW, cellH, 16);
  save(canvas, "02-canvas.png");
}

// ─── Scene 3: Washi Textures ────────────────────────────────────────────────

function renderWashi() {
  console.log("Scene 3: Washi Textures");
  const cellW = 300, cellH = 300;

  const variations = [
    { label: "Sparse Fibers", fiberDensity: 0.2, fiberLength: 80, color: "#f5f0e8" },
    { label: "Medium Fibers", fiberDensity: 0.5, fiberLength: 80, color: "#f5f0e8" },
    { label: "Dense Fibers", fiberDensity: 0.9, fiberLength: 80, color: "#f5f0e8" },
    { label: "Long Fibers", fiberDensity: 0.5, fiberLength: 180, color: "#f5f0e8" },
    { label: "Short Fibers", fiberDensity: 0.7, fiberLength: 30, color: "#f5f0e8" },
    { label: "Warm Washi", fiberDensity: 0.5, fiberLength: 100, color: "#f0e0c8" },
    { label: "Cool Washi", fiberDensity: 0.5, fiberLength: 100, color: "#e0e8f0" },
    { label: "Dark Washi", fiberDensity: 0.6, fiberLength: 100, color: "#3a3830" },
  ];

  const cells = variations.map((v, i) => ({
    label: v.label,
    canvas: renderCell(washiLayerType, {
      ...washiLayerType.createDefault(),
      fiberDensity: v.fiberDensity,
      fiberLength: v.fiberLength,
      color: v.color,
      seed: i * 71,
    }, cellW, cellH),
  }));

  const canvas = renderLabeledGrid("Washi Textures", cells, 4, cellW, cellH, 16);
  save(canvas, "03-washi.png");
}

// ─── Scene 4: Noise Textures ────────────────────────────────────────────────

function renderNoise() {
  console.log("Scene 4: Noise Textures");
  const cellW = 300, cellH = 300;

  const variations = [
    { label: "Value (scale 40)", type: "value", scale: 40, octaves: 1, colorA: "#ffffff", colorB: "#000000" },
    { label: "Value (scale 120)", type: "value", scale: 120, octaves: 1, colorA: "#ffffff", colorB: "#000000" },
    { label: "Fractal 2 oct", type: "fractal", scale: 80, octaves: 2, colorA: "#ffffff", colorB: "#000000" },
    { label: "Fractal 4 oct", type: "fractal", scale: 80, octaves: 4, colorA: "#ffffff", colorB: "#000000" },
    { label: "Fractal 6 oct", type: "fractal", scale: 80, octaves: 6, colorA: "#ffffff", colorB: "#000000" },
    { label: "Ridged", type: "ridged", scale: 80, octaves: 4, colorA: "#ffffff", colorB: "#000000" },
    { label: "Warm Tones", type: "fractal", scale: 60, octaves: 4, colorA: "#f0d8a0", colorB: "#4a2010" },
    { label: "Cool Tones", type: "fractal", scale: 60, octaves: 4, colorA: "#c0d8f0", colorB: "#0a1040" },
    { label: "Ridged (warm)", type: "ridged", scale: 50, octaves: 4, colorA: "#f0e8d0", colorB: "#8a3010" },
    { label: "Tiny Scale", type: "fractal", scale: 10, octaves: 3, colorA: "#ffffff", colorB: "#000000" },
    { label: "Huge Scale", type: "fractal", scale: 200, octaves: 4, colorA: "#ffffff", colorB: "#000000" },
    { label: "Ridged (blue)", type: "ridged", scale: 60, octaves: 5, colorA: "#e0f0ff", colorB: "#001030" },
  ];

  const cells = variations.map((v, i) => ({
    label: v.label,
    canvas: renderCell(noiseTextureLayerType, {
      ...noiseTextureLayerType.createDefault(),
      type: v.type,
      scale: v.scale,
      octaves: v.octaves,
      colorA: v.colorA,
      colorB: v.colorB,
      seed: i * 43,
    }, cellW, cellH),
  }));

  const canvas = renderLabeledGrid("Noise Textures", cells, 4, cellW, cellH, 16);
  save(canvas, "04-noise.png");
}

// ─── Scene 5: Texture Grid (reference card) ─────────────────────────────────

function renderTextureGrid() {
  console.log("Scene 5: Texture Grid");
  const cellW = 250, cellH = 250;

  const cells = [
    // Row 1: Paper
    { label: "Paper: Smooth", fn: () => renderCell(paperLayerType, { ...paperLayerType.createDefault(), preset: "smooth", seed: 1 }, cellW, cellH) },
    { label: "Paper: Cold Press", fn: () => renderCell(paperLayerType, { ...paperLayerType.createDefault(), preset: "cold-press", seed: 2 }, cellW, cellH) },
    { label: "Paper: Hot Press", fn: () => renderCell(paperLayerType, { ...paperLayerType.createDefault(), preset: "hot-press", seed: 3 }, cellW, cellH) },
    { label: "Paper: Rough", fn: () => renderCell(paperLayerType, { ...paperLayerType.createDefault(), preset: "rough", seed: 4 }, cellW, cellH) },
    // Row 2: Canvas
    { label: "Canvas: Fine", fn: () => renderCell(canvasLayerType, { ...canvasLayerType.createDefault(), weaveScale: 3, density: 0.4, seed: 5 }, cellW, cellH) },
    { label: "Canvas: Medium", fn: () => renderCell(canvasLayerType, { ...canvasLayerType.createDefault(), weaveScale: 6, density: 0.6, seed: 6 }, cellW, cellH) },
    { label: "Canvas: Coarse", fn: () => renderCell(canvasLayerType, { ...canvasLayerType.createDefault(), weaveScale: 12, density: 0.8, seed: 7 }, cellW, cellH) },
    { label: "Canvas: Linen", fn: () => renderCell(canvasLayerType, { ...canvasLayerType.createDefault(), weaveScale: 16, density: 0.7, seed: 8 }, cellW, cellH) },
    // Row 3: Washi
    { label: "Washi: Sparse", fn: () => renderCell(washiLayerType, { ...washiLayerType.createDefault(), fiberDensity: 0.2, seed: 9 }, cellW, cellH) },
    { label: "Washi: Medium", fn: () => renderCell(washiLayerType, { ...washiLayerType.createDefault(), fiberDensity: 0.5, seed: 10 }, cellW, cellH) },
    { label: "Washi: Dense", fn: () => renderCell(washiLayerType, { ...washiLayerType.createDefault(), fiberDensity: 0.9, seed: 11 }, cellW, cellH) },
    { label: "Washi: Long", fn: () => renderCell(washiLayerType, { ...washiLayerType.createDefault(), fiberLength: 180, seed: 12 }, cellW, cellH) },
    // Row 4: Noise
    { label: "Noise: Value", fn: () => renderCell(noiseTextureLayerType, { ...noiseTextureLayerType.createDefault(), type: "value", seed: 13 }, cellW, cellH) },
    { label: "Noise: Fractal", fn: () => renderCell(noiseTextureLayerType, { ...noiseTextureLayerType.createDefault(), type: "fractal", seed: 14 }, cellW, cellH) },
    { label: "Noise: Ridged", fn: () => renderCell(noiseTextureLayerType, { ...noiseTextureLayerType.createDefault(), type: "ridged", seed: 15 }, cellW, cellH) },
    { label: "Noise: Colored", fn: () => renderCell(noiseTextureLayerType, { ...noiseTextureLayerType.createDefault(), type: "fractal", colorA: "#f0d8a0", colorB: "#1a0a30", seed: 16 }, cellW, cellH) },
  ];

  const rendered = cells.map((c) => ({ label: c.label, canvas: c.fn() }));
  const canvas = renderLabeledGrid("Texture Reference Grid", rendered, 4, cellW, cellH, 12);
  save(canvas, "05-texture-grid.png");
}

// ─── Scene 6: Contact Sheet ─────────────────────────────────────────────────

function renderContactSheet() {
  console.log("Scene 6: Contact Sheet");
  const thumbW = 400;
  const thumbH = 300;

  const files = [
    "01-paper.png",
    "02-canvas.png",
    "03-washi.png",
    "04-noise.png",
    "05-texture-grid.png",
  ];

  const images = files.map((f) => {
    const buf = fs.readFileSync(path.join(outDir, f));
    const img = new Image();
    img.src = buf;
    return img;
  });

  const cols = 3;
  const rows = Math.ceil(images.length / cols);
  const padding = 20;
  const gW = cols * thumbW + (cols + 1) * padding;
  const gH = rows * thumbH + (rows + 1) * padding + 40;
  const canvas = createCanvas(gW, gH);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#1c1a18";
  ctx.fillRect(0, 0, gW, gH);

  for (let i = 0; i < images.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * (thumbW + padding);
    const y = padding + row * (thumbH + padding);
    ctx.drawImage(images[i], x, y, thumbW, thumbH);

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "12px sans-serif";
    ctx.fillText(files[i].replace(".png", ""), x + 4, y + thumbH + 14);
  }

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("Texture Atlas — Procedural Texture Reference", padding, gH - 12);

  save(canvas, "texture-atlas.png");
}

// ─── Run all ─────────────────────────────────────────────────────────────────

console.log("\nTexture Atlas — Procedural Texture Reference\n");

renderPaper();
renderCanvasTexture();
renderWashi();
renderNoise();
renderTextureGrid();
renderContactSheet();

console.log("\nDone! All renders saved to renders/\n");
