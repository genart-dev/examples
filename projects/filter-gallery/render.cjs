/**
 * Filter Gallery — Before/after filter chain demos
 *
 * 1. "Grain Textures"         — Film grain with varying amount, size, and monochrome toggle
 * 2. "Duotone Palettes"       — Same image in 6 duotone color pairs
 * 3. "Chromatic Aberration"   — Offset sweep from subtle (1px) to dramatic (15px)
 * 4. "Vignette Moods"         — Vignette with varying softness, radius, and color
 * 5. "Filter Chains"          — Stacked filters: grain + vignette, duotone + chromatic, etc.
 * 6. "Filter Gallery Sheet"   — Contact sheet of all demos
 *
 * Note: blurLayerType requires OffscreenCanvas + ctx.filter (browser only),
 * so blur is implemented manually here for node-canvas compatibility.
 *
 * Plugins used:
 *   - @genart-dev/plugin-filters  (grainLayerType, duotoneLayerType, chromaticAberrationLayerType, vignetteLayerType)
 *
 * Output: renders/01-grain.png .. renders/filter-gallery.png
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
  grainLayerType,
  duotoneLayerType,
  chromaticAberrationLayerType,
  vignetteLayerType,
} = require("../../../plugin-filters/dist/index.cjs");

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

// Helper: generate a colorful test pattern for clear filter visibility
function createTestPattern(w, h) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#1a1a2e");
  grad.addColorStop(0.33, "#16213e");
  grad.addColorStop(0.66, "#0f3460");
  grad.addColorStop(1, "#533483");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Colored circles
  const colors = ["#e94560", "#f0a500", "#00b4d8", "#06d6a0", "#e07be0", "#ffd166", "#118ab2", "#ef476f"];
  for (let i = 0; i < colors.length; i++) {
    const x = w * (0.1 + (i % 4) * 0.25);
    const y = h * (0.3 + Math.floor(i / 4) * 0.4);
    ctx.beginPath();
    ctx.arc(x, y, 25 + i * 3, 0, Math.PI * 2);
    ctx.fillStyle = colors[i];
    ctx.fill();
  }

  // White and black reference patches
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(10, 10, 40, 40);
  ctx.fillStyle = "#000000";
  ctx.fillRect(60, 10, 40, 40);

  // Thin lines for sharpness reference
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.7, h * (0.1 + i * 0.04));
    ctx.lineTo(w * 0.95, h * (0.1 + i * 0.04));
    ctx.stroke();
  }

  return canvas;
}

// Helper: copy a canvas
function copyCanvas(src) {
  const dst = createCanvas(src.width, src.height);
  dst.getContext("2d").drawImage(src, 0, 0);
  return dst;
}

// Helper: render a labeled grid
function renderLabeledGrid(title, cells, cols, cellW, cellH, padding) {
  const rows = Math.ceil(cells.length / cols);
  const W = cols * cellW + (cols + 1) * padding;
  const H = rows * cellH + (rows + 1) * padding + 50;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#1a1a1a";
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

// ─── Scene 1: Grain Textures ─────────────────────────────────────────────────

function renderGrain() {
  console.log("Scene 1: Grain Textures");
  const cellW = 300, cellH = 250;
  const base = createTestPattern(cellW, cellH);

  const variations = [
    { label: "Original", intensity: 0 },
    { label: "Subtle (0.1)", intensity: 0.1, size: 1, monochrome: true },
    { label: "Medium (0.3)", intensity: 0.3, size: 1, monochrome: true },
    { label: "Heavy (0.6)", intensity: 0.6, size: 1, monochrome: true },
    { label: "Size 1", intensity: 0.3, size: 1, monochrome: true },
    { label: "Size 2", intensity: 0.3, size: 2, monochrome: true },
    { label: "Size 4", intensity: 0.3, size: 4, monochrome: true },
    { label: "Color Grain", intensity: 0.3, size: 1, monochrome: false },
  ];

  const cells = variations.map((v, i) => {
    const c = copyCanvas(base);
    if (v.intensity > 0) {
      grainLayerType.render({
        ...grainLayerType.createDefault(),
        intensity: v.intensity,
        size: v.size ?? 1,
        monochrome: v.monochrome ?? true,
        seed: i * 42,
      }, c.getContext("2d"), full(cellW, cellH), resources);
    }
    return { label: v.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Film Grain", cells, 4, cellW, cellH, 16);
  save(canvas, "01-grain.png");
}

// ─── Scene 2: Duotone Palettes ──────────────────────────────────────────────

function renderDuotone() {
  console.log("Scene 2: Duotone Palettes");
  const cellW = 300, cellH = 250;
  const base = createTestPattern(cellW, cellH);

  const palettes = [
    { label: "Original", darkColor: null, lightColor: null },
    { label: "Navy / Cream", darkColor: "#000033", lightColor: "#fffdd0" },
    { label: "Pink / Teal", darkColor: "#ff69b4", lightColor: "#008080" },
    { label: "Gold / Purple", darkColor: "#4a0080", lightColor: "#ffd700" },
    { label: "Mint / Charcoal", darkColor: "#2f4f4f", lightColor: "#98ff98" },
    { label: "Peach / Slate", darkColor: "#474e68", lightColor: "#ffdab9" },
    { label: "Lime / Indigo", darkColor: "#1a0040", lightColor: "#a0ff00" },
    { label: "Classic BW", darkColor: "#000000", lightColor: "#ffffff" },
  ];

  const cells = palettes.map((v) => {
    const c = copyCanvas(base);
    if (v.darkColor) {
      duotoneLayerType.render({
        ...duotoneLayerType.createDefault(),
        darkColor: v.darkColor,
        lightColor: v.lightColor,
        intensity: 1.0,
      }, c.getContext("2d"), full(cellW, cellH), resources);
    }
    return { label: v.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Duotone Palettes", cells, 4, cellW, cellH, 16);
  save(canvas, "02-duotone.png");
}

// ─── Scene 3: Chromatic Aberration ──────────────────────────────────────────

function renderChromatic() {
  console.log("Scene 3: Chromatic Aberration");
  const cellW = 300, cellH = 250;
  const base = createTestPattern(cellW, cellH);

  const offsets = [
    { label: "Original", offsetX: 0, offsetY: 0 },
    { label: "1px horizontal", offsetX: 1, offsetY: 0 },
    { label: "3px horizontal", offsetX: 3, offsetY: 0 },
    { label: "5px horizontal", offsetX: 5, offsetY: 0 },
    { label: "10px horizontal", offsetX: 10, offsetY: 0 },
    { label: "15px horizontal", offsetX: 15, offsetY: 0 },
    { label: "5px diagonal", offsetX: 5, offsetY: 5 },
    { label: "8px vertical", offsetX: 0, offsetY: 8 },
  ];

  const cells = offsets.map((v) => {
    const c = copyCanvas(base);
    if (v.offsetX !== 0 || v.offsetY !== 0) {
      chromaticAberrationLayerType.render({
        ...chromaticAberrationLayerType.createDefault(),
        offsetX: v.offsetX,
        offsetY: v.offsetY,
        intensity: 1.0,
      }, c.getContext("2d"), full(cellW, cellH), resources);
    }
    return { label: v.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Chromatic Aberration", cells, 4, cellW, cellH, 16);
  save(canvas, "03-chromatic.png");
}

// ─── Scene 4: Vignette Moods ────────────────────────────────────────────────

function renderVignette() {
  console.log("Scene 4: Vignette Moods");
  const cellW = 300, cellH = 250;
  const base = createTestPattern(cellW, cellH);

  const variations = [
    { label: "Original", intensity: 0 },
    { label: "Subtle", intensity: 0.3, radius: 0.8, softness: 0.6, color: "#000000" },
    { label: "Medium", intensity: 0.5, radius: 0.7, softness: 0.5, color: "#000000" },
    { label: "Heavy", intensity: 0.8, radius: 0.5, softness: 0.4, color: "#000000" },
    { label: "Tight", intensity: 0.6, radius: 0.4, softness: 0.3, color: "#000000" },
    { label: "Wide", intensity: 0.5, radius: 1.2, softness: 0.7, color: "#000000" },
    { label: "Sepia", intensity: 0.6, radius: 0.6, softness: 0.5, color: "#3a2010" },
    { label: "Blue", intensity: 0.5, radius: 0.7, softness: 0.5, color: "#001040" },
  ];

  const cells = variations.map((v) => {
    const c = copyCanvas(base);
    if (v.intensity > 0) {
      vignetteLayerType.render({
        ...vignetteLayerType.createDefault(),
        intensity: v.intensity,
        radius: v.radius,
        softness: v.softness,
        color: v.color,
      }, c.getContext("2d"), full(cellW, cellH), resources);
    }
    return { label: v.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Vignette Moods", cells, 4, cellW, cellH, 16);
  save(canvas, "04-vignette.png");
}

// ─── Scene 5: Filter Chains ────────────────────────────────────────────────

function renderFilterChains() {
  console.log("Scene 5: Filter Chains");
  const cellW = 400, cellH = 300;
  const base = createTestPattern(cellW, cellH);

  const chains = [
    {
      label: "Original",
      filters: [],
    },
    {
      label: "Grain + Vignette",
      filters: [
        { type: grainLayerType, props: { intensity: 0.25, size: 1, seed: 7, monochrome: true } },
        { type: vignetteLayerType, props: { intensity: 0.5, radius: 0.7, softness: 0.5, color: "#000000" } },
      ],
    },
    {
      label: "Duotone + Chromatic",
      filters: [
        { type: duotoneLayerType, props: { darkColor: "#000033", lightColor: "#ffcc00", intensity: 1.0 } },
        { type: chromaticAberrationLayerType, props: { offsetX: 5, offsetY: 0, intensity: 1.0 } },
      ],
    },
    {
      label: "Chromatic + Grain + Vignette",
      filters: [
        { type: chromaticAberrationLayerType, props: { offsetX: 4, offsetY: 2, intensity: 1.0 } },
        { type: grainLayerType, props: { intensity: 0.2, size: 1, seed: 99, monochrome: true } },
        { type: vignetteLayerType, props: { intensity: 0.6, radius: 0.6, softness: 0.5, color: "#000000" } },
      ],
    },
    {
      label: "Duotone (mint) + Vignette",
      filters: [
        { type: duotoneLayerType, props: { darkColor: "#2f4f4f", lightColor: "#98ff98", intensity: 1.0 } },
        { type: vignetteLayerType, props: { intensity: 0.5, radius: 0.7, softness: 0.5, color: "#102010" } },
      ],
    },
    {
      label: "Full Stack",
      filters: [
        { type: duotoneLayerType, props: { darkColor: "#1a0040", lightColor: "#ffd700", intensity: 0.7 } },
        { type: chromaticAberrationLayerType, props: { offsetX: 3, offsetY: 1, intensity: 1.0 } },
        { type: grainLayerType, props: { intensity: 0.15, size: 1, seed: 42, monochrome: false } },
        { type: vignetteLayerType, props: { intensity: 0.5, radius: 0.6, softness: 0.5, color: "#000000" } },
      ],
    },
  ];

  const cells = chains.map((chain) => {
    const c = copyCanvas(base);
    const ctx = c.getContext("2d");
    for (const f of chain.filters) {
      f.type.render(
        { ...f.type.createDefault(), ...f.props },
        ctx,
        full(cellW, cellH),
        resources,
      );
    }
    return { label: chain.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Filter Chains", cells, 3, cellW, cellH, 16);
  save(canvas, "05-filter-chains.png");
}

// ─── Scene 6: Contact Sheet ─────────────────────────────────────────────────

function renderContactSheet() {
  console.log("Scene 6: Contact Sheet");
  const thumbW = 400, thumbH = 300;

  const files = [
    "01-grain.png",
    "02-duotone.png",
    "03-chromatic.png",
    "04-vignette.png",
    "05-filter-chains.png",
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
  ctx.fillText("Filter Gallery — Before/After Filter Chain Demos", padding, gH - 12);

  save(canvas, "filter-gallery.png");
}

// ─── Run all ─────────────────────────────────────────────────────────────────

console.log("\nFilter Gallery — Before/After Filter Chain Demos\n");

renderGrain();
renderDuotone();
renderChromatic();
renderVignette();
renderFilterChains();
renderContactSheet();

console.log("\nDone! All renders saved to renders/\n");
