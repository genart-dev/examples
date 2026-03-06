/**
 * Color Mood Series — Color adjustment variations
 *
 * 1. "HSL Shifts"       — hue rotation, saturation sweep, lightness sweep
 * 2. "Levels"           — high key, low key, high contrast, faded
 * 3. "Curves"           — S-curve, lifted blacks, crushed highlights, cross-process
 * 4. "Mood Board"       — named moods combining HSL + levels + curves
 * 5. "Contact Sheet"    — all moods combined
 *
 * Plugins used:
 *   - @genart-dev/plugin-color-adjust  (hslLayerType, levelsLayerType, curvesLayerType)
 *
 * Output: renders/01-hsl.png .. renders/mood-series.png
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
  hslLayerType,
  levelsLayerType,
  curvesLayerType,
} = require("../../../plugin-color-adjust/dist/index.cjs");

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

// Helper: colorful base image (HSL wheel + landscape-like shapes)
function createBaseImage(w, h) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  sky.addColorStop(0, "#4a90d9");
  sky.addColorStop(1, "#87ceeb");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.6);

  // Ground
  const ground = ctx.createLinearGradient(0, h * 0.55, 0, h);
  ground.addColorStop(0, "#4a8c3f");
  ground.addColorStop(1, "#2d5a27");
  ctx.fillStyle = ground;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);

  // Sun
  ctx.beginPath();
  ctx.arc(w * 0.75, h * 0.2, 30, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd700";
  ctx.fill();

  // Mountains
  ctx.beginPath();
  ctx.moveTo(0, h * 0.6);
  ctx.lineTo(w * 0.2, h * 0.3);
  ctx.lineTo(w * 0.4, h * 0.55);
  ctx.lineTo(w * 0.55, h * 0.25);
  ctx.lineTo(w * 0.7, h * 0.5);
  ctx.lineTo(w * 0.85, h * 0.35);
  ctx.lineTo(w, h * 0.55);
  ctx.lineTo(w, h * 0.6);
  ctx.closePath();
  ctx.fillStyle = "#5a6e7f";
  ctx.fill();

  // Trees (simple triangles)
  for (let i = 0; i < 8; i++) {
    const tx = w * (0.08 + i * 0.12);
    const ty = h * 0.6;
    ctx.beginPath();
    ctx.moveTo(tx, ty - 40);
    ctx.lineTo(tx - 15, ty);
    ctx.lineTo(tx + 15, ty);
    ctx.closePath();
    ctx.fillStyle = `hsl(${120 + i * 5}, 50%, ${25 + i * 3}%)`;
    ctx.fill();
  }

  // Flowers (colored dots)
  const flowerColors = ["#ff6b6b", "#ffd93d", "#ff8fd8", "#c084fc", "#fb923c"];
  for (let i = 0; i < 20; i++) {
    const fx = w * (0.05 + Math.random() * 0.9);
    const fy = h * (0.65 + Math.random() * 0.3);
    ctx.beginPath();
    ctx.arc(fx, fy, 3 + Math.random() * 4, 0, Math.PI * 2);
    ctx.fillStyle = flowerColors[i % flowerColors.length];
    ctx.fill();
  }

  return canvas;
}

function copyCanvas(src) {
  const dst = createCanvas(src.width, src.height);
  dst.getContext("2d").drawImage(src, 0, 0);
  return dst;
}

function renderLabeledGrid(title, cells, cols, cellW, cellH, padding, bgColor = "#1a1a1a") {
  const rows = Math.ceil(cells.length / cols);
  const W = cols * cellW + (cols + 1) * padding;
  const H = rows * cellH + (rows + 1) * padding + 50;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#e0e0e0";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(title, padding, 30);

  for (let i = 0; i < cells.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * (cellW + padding);
    const y = 50 + padding + row * (cellH + padding);

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, y - 1, cellW + 2, cellH + 2);
    ctx.drawImage(cells[i].canvas, x, y, cellW, cellH);

    ctx.fillStyle = "#aaa";
    ctx.font = "11px sans-serif";
    ctx.fillText(cells[i].label, x, y + cellH + 14);
  }

  return canvas;
}

// ─── Scene 1: HSL Shifts ────────────────────────────────────────────────────

function renderHslShifts() {
  console.log("Scene 1: HSL Shifts");
  const cellW = 300, cellH = 200;
  const base = createBaseImage(cellW, cellH);

  const variations = [
    { label: "Original", hue: 0, saturation: 0, lightness: 0 },
    { label: "Hue +60", hue: 60, saturation: 0, lightness: 0 },
    { label: "Hue +120", hue: 120, saturation: 0, lightness: 0 },
    { label: "Hue +180", hue: 180, saturation: 0, lightness: 0 },
    { label: "Sat -50", hue: 0, saturation: -50, lightness: 0 },
    { label: "Sat +50", hue: 0, saturation: 50, lightness: 0 },
    { label: "Light -30", hue: 0, saturation: 0, lightness: -30 },
    { label: "Light +30", hue: 0, saturation: 0, lightness: 30 },
  ];

  const cells = variations.map((v) => {
    const c = copyCanvas(base);
    if (v.hue !== 0 || v.saturation !== 0 || v.lightness !== 0) {
      hslLayerType.render({
        ...hslLayerType.createDefault(),
        hue: v.hue,
        saturation: v.saturation,
        lightness: v.lightness,
      }, c.getContext("2d"), full(cellW, cellH), resources);
    }
    return { label: v.label, canvas: c };
  });

  const canvas = renderLabeledGrid("HSL Shifts", cells, 4, cellW, cellH, 16);
  save(canvas, "01-hsl.png");
}

// ─── Scene 2: Levels ────────────────────────────────────────────────────────

function renderLevels() {
  console.log("Scene 2: Levels");
  const cellW = 300, cellH = 200;
  const base = createBaseImage(cellW, cellH);

  const variations = [
    { label: "Original", inputBlack: 0, inputWhite: 255, gamma: 1.0, outputBlack: 0, outputWhite: 255 },
    { label: "High Key", inputBlack: 0, inputWhite: 200, gamma: 1.4, outputBlack: 40, outputWhite: 255 },
    { label: "Low Key", inputBlack: 40, inputWhite: 255, gamma: 0.7, outputBlack: 0, outputWhite: 220 },
    { label: "High Contrast", inputBlack: 40, inputWhite: 215, gamma: 1.0, outputBlack: 0, outputWhite: 255 },
    { label: "Faded", inputBlack: 0, inputWhite: 255, gamma: 1.0, outputBlack: 40, outputWhite: 220 },
    { label: "Bright Gamma", inputBlack: 0, inputWhite: 255, gamma: 2.0, outputBlack: 0, outputWhite: 255 },
    { label: "Dark Gamma", inputBlack: 0, inputWhite: 255, gamma: 0.5, outputBlack: 0, outputWhite: 255 },
    { label: "Crushed", inputBlack: 80, inputWhite: 180, gamma: 1.0, outputBlack: 0, outputWhite: 255 },
  ];

  const cells = variations.map((v) => {
    const c = copyCanvas(base);
    const isDefault = v.inputBlack === 0 && v.inputWhite === 255 && v.gamma === 1.0 && v.outputBlack === 0 && v.outputWhite === 255;
    if (!isDefault) {
      levelsLayerType.render({
        ...levelsLayerType.createDefault(),
        inputBlack: v.inputBlack,
        inputWhite: v.inputWhite,
        gamma: v.gamma,
        outputBlack: v.outputBlack,
        outputWhite: v.outputWhite,
      }, c.getContext("2d"), full(cellW, cellH), resources);
    }
    return { label: v.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Levels", cells, 4, cellW, cellH, 16);
  save(canvas, "02-levels.png");
}

// ─── Scene 3: Curves ────────────────────────────────────────────────────────

function renderCurves() {
  console.log("Scene 3: Curves");
  const cellW = 300, cellH = 200;
  const base = createBaseImage(cellW, cellH);

  const variations = [
    { label: "Linear (original)", points: [[0, 0], [255, 255]] },
    { label: "S-Curve (contrast)", points: [[0, 0], [64, 40], [192, 215], [255, 255]] },
    { label: "Inverse S (matte)", points: [[0, 0], [64, 80], [192, 175], [255, 255]] },
    { label: "Lifted Blacks", points: [[0, 30], [128, 140], [255, 255]] },
    { label: "Crushed Highlights", points: [[0, 0], [128, 130], [255, 220]] },
    { label: "Cross-Process", points: [[0, 20], [80, 50], [180, 220], [255, 240]], channel: "r" },
    { label: "Solarize", points: [[0, 0], [64, 200], [128, 0], [192, 200], [255, 0]] },
    { label: "Posterize", points: [[0, 0], [85, 0], [86, 128], [170, 128], [171, 255], [255, 255]], interpolation: "linear" },
  ];

  const cells = variations.map((v) => {
    const c = copyCanvas(base);
    const isLinear = v.points.length === 2 && v.points[0][0] === 0 && v.points[0][1] === 0 && v.points[1][0] === 255 && v.points[1][1] === 255;
    if (!isLinear) {
      curvesLayerType.render({
        ...curvesLayerType.createDefault(),
        points: JSON.stringify(v.points),
        channel: v.channel || "rgb",
        interpolation: v.interpolation || "monotone-cubic",
      }, c.getContext("2d"), full(cellW, cellH), resources);
    }
    return { label: v.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Curves", cells, 4, cellW, cellH, 16);
  save(canvas, "03-curves.png");
}

// ─── Scene 4: Mood Board ────────────────────────────────────────────────────

function renderMoodBoard() {
  console.log("Scene 4: Mood Board");
  const cellW = 350, cellH = 230;
  const base = createBaseImage(cellW, cellH);

  const moods = [
    {
      label: "Original",
      filters: [],
    },
    {
      label: "Golden Hour",
      filters: [
        { type: hslLayerType, props: { hue: 15, saturation: 25, lightness: 10 } },
        { type: curvesLayerType, props: { points: JSON.stringify([[0, 10], [128, 145], [255, 250]]) } },
      ],
    },
    {
      label: "Midnight",
      filters: [
        { type: hslLayerType, props: { hue: -30, saturation: -20, lightness: -35 } },
        { type: levelsLayerType, props: { inputBlack: 0, inputWhite: 200, gamma: 0.6, outputBlack: 0, outputWhite: 180 } },
      ],
    },
    {
      label: "Overcast",
      filters: [
        { type: hslLayerType, props: { hue: 0, saturation: -40, lightness: 5 } },
        { type: levelsLayerType, props: { inputBlack: 20, inputWhite: 240, gamma: 1.1, outputBlack: 30, outputWhite: 230 } },
      ],
    },
    {
      label: "Vintage",
      filters: [
        { type: hslLayerType, props: { hue: 10, saturation: -30, lightness: 5 } },
        { type: curvesLayerType, props: { points: JSON.stringify([[0, 25], [64, 55], [192, 200], [255, 235]]) } },
        { type: levelsLayerType, props: { inputBlack: 0, inputWhite: 255, gamma: 1.0, outputBlack: 20, outputWhite: 240 } },
      ],
    },
    {
      label: "Neon",
      filters: [
        { type: hslLayerType, props: { hue: 0, saturation: 80, lightness: 5 } },
        { type: curvesLayerType, props: { points: JSON.stringify([[0, 0], [64, 30], [192, 225], [255, 255]]) } },
      ],
    },
    {
      label: "Autumn",
      filters: [
        { type: hslLayerType, props: { hue: -20, saturation: 15, lightness: -5 } },
        { type: curvesLayerType, props: { points: JSON.stringify([[0, 5], [100, 80], [200, 190], [255, 245]]) } },
      ],
    },
    {
      label: "Arctic",
      filters: [
        { type: hslLayerType, props: { hue: 30, saturation: -35, lightness: 15 } },
        { type: levelsLayerType, props: { inputBlack: 0, inputWhite: 230, gamma: 1.3, outputBlack: 20, outputWhite: 255 } },
      ],
    },
  ];

  const cells = moods.map((mood) => {
    const c = copyCanvas(base);
    const ctx = c.getContext("2d");
    for (const f of mood.filters) {
      f.type.render(
        { ...f.type.createDefault(), ...f.props },
        ctx, full(cellW, cellH), resources,
      );
    }
    return { label: mood.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Mood Board", cells, 4, cellW, cellH, 16);
  save(canvas, "04-mood-board.png");
}

// ─── Scene 5: Contact Sheet ─────────────────────────────────────────────────

function renderContactSheet() {
  console.log("Scene 5: Contact Sheet");
  const thumbW = 420, thumbH = 300;

  const files = [
    "01-hsl.png",
    "02-levels.png",
    "03-curves.png",
    "04-mood-board.png",
  ];

  const images = files.map((f) => {
    const buf = fs.readFileSync(path.join(outDir, f));
    const img = new Image();
    img.src = buf;
    return img;
  });

  const cols = 2;
  const rows = 2;
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
    const img = images[i];
    const scale = Math.min(thumbW / img.width, thumbH / img.height);
    const dw = Math.round(img.width * scale);
    const dh = Math.round(img.height * scale);
    ctx.drawImage(img, x + (thumbW - dw) / 2, y + (thumbH - dh) / 2, dw, dh);

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "12px sans-serif";
    ctx.fillText(files[i].replace(".png", ""), x + 4, y + thumbH + 14);
  }

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("Color Mood Series — HSL, Levels, Curves & Moods", padding, gH - 12);

  save(canvas, "mood-series.png");
}

// ─── Run all ─────────────────────────────────────────────────────────────────

console.log("\nColor Mood Series — Color Adjustment Variations\n");

renderHslShifts();
renderLevels();
renderCurves();
renderMoodBoard();
renderContactSheet();

console.log("\nDone! All renders saved to renders/\n");
