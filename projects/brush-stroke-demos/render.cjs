/**
 * Brush Stroke System — Visual Demos
 *
 * 1. "Preset Catalog"     — all 14 brush presets side by side (11 round + 3 texture)
 * 2. "Pressure Dynamics"  — pressure-sensitive strokes showing taper + width
 * 3. "Calligraphy"        — ink-pen strokes with curves and loops
 * 4. "Splatter Abstract"  — splatter + watercolor-round scatter painting
 * 5. "Field Influence"    — strokes modulated by a vortex vector field
 * 6. "Texture Tips"       — chalk, sponge, and bristle texture brush strokes
 */

"use strict";

const canvasPkg = require("canvas");
const { createCanvas } = canvasPkg;
const fs = require("fs");
const path = require("path");

// Polyfill browser globals for brush tip/stamp renderer (uses new ImageData() directly)
if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = canvasPkg.ImageData;
}

// Require plugin-painting dist directly so it resolves `require("canvas")`
// from THIS project's node_modules (avoiding dual native module conflicts)
const {
  strokeLayerType,
  BRUSH_PRESETS,
  preloadTextureTip,
} = require("../../../plugin-painting/dist/index.cjs");

let washiLayerType;
try {
  ({ washiLayerType } = require("@genart-dev/plugin-textures"));
} catch {
  // textures plugin optional
}

// ─── Shared setup ───────────────────────────────────────────────────────────

const outDir = path.join(__dirname, "renders");
fs.mkdirSync(outDir, { recursive: true });

const resources = { getFont: () => null, getImage: () => null, theme: "light", pixelRatio: 1 };

function full(w, h) {
  return { x: 0, y: 0, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 };
}

function save(canvas, name) {
  const filePath = path.join(outDir, name);
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));
  console.log(`  → ${filePath}`);
}

// Helper: generate a horizontal S-curve stroke
function sCurve(x0, y0, x1, y1, points = 40) {
  const pts = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * (0.5 + 0.4 * Math.sin(t * Math.PI * 2));
    pts.push({ x, y, pressure: 0.3 + 0.7 * Math.sin(t * Math.PI) });
  }
  return pts;
}

// Helper: straight line with pressure ramp
function pressureLine(x0, y0, x1, y1, points = 30) {
  const pts = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    pts.push({
      x: x0 + (x1 - x0) * t,
      y: y0 + (y1 - y0) * t,
      pressure: Math.sin(t * Math.PI), // 0 → 1 → 0
    });
  }
  return pts;
}

// Helper: circular arc
function arc(cx, cy, radius, startAngle, endAngle, points = 50) {
  const pts = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const angle = startAngle + (endAngle - startAngle) * t;
    pts.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      pressure: 0.5 + 0.5 * Math.sin(t * Math.PI),
    });
  }
  return pts;
}

// Helper: loop / figure-8
function figure8(cx, cy, rx, ry, points = 80) {
  const pts = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const angle = t * Math.PI * 2;
    pts.push({
      x: cx + rx * Math.sin(angle),
      y: cy + ry * Math.sin(angle * 2),
      pressure: 0.2 + 0.8 * (0.5 + 0.5 * Math.cos(angle * 3)),
    });
  }
  return pts;
}

// Helper: random scatter points
function randomPath(x0, y0, x1, y1, count = 60, seed = 42) {
  let s = seed;
  function rng() {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  }
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    pts.push({
      x: x0 + (x1 - x0) * t + (rng() - 0.5) * 60,
      y: y0 + (y1 - y0) * t + (rng() - 0.5) * 60,
      pressure: 0.3 + rng() * 0.7,
    });
  }
  return pts;
}

// ─── Demo 1: Preset Catalog ─────────────────────────────────────────────────
// All 11 brush presets, each drawing an S-curve with label

function renderPresetCatalog() {
  console.log("Demo 1: Preset Catalog");
  const W = 1200, H = 800;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#f5f0e8";
  ctx.fillRect(0, 0, W, H);

  const presetIds = Object.keys(BRUSH_PRESETS);
  const cols = 4;
  const rows = Math.ceil(presetIds.length / cols);
  const cellW = W / cols;
  const cellH = H / rows;

  const strokes = [];
  for (let i = 0; i < presetIds.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x0 = col * cellW + 30;
    const y0 = row * cellH + cellH * 0.35;
    const x1 = (col + 1) * cellW - 30;
    const y1 = y0;

    const id = presetIds[i];

    // Draw label
    ctx.fillStyle = "#333";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(id, x0, row * cellH + 24);

    // Color each preset differently
    const colors = [
      "#1a1a1a", "#555", "#1a1a1a", "#2a2a2a",
      "#1a1a1a", "#c44", "#4477bb", "#333",
      "#c44", "#888", "#aaa",
    ];

    strokes.push({
      brushId: id,
      color: colors[i] || "#1a1a1a",
      points: sCurve(x0, y0, x1, y1, 50),
      size: id === "splatter" ? 12 : undefined,
      seed: i * 77,
    });
  }

  strokeLayerType.render(
    {
      ...strokeLayerType.createDefault(),
      strokes: JSON.stringify(strokes),
      seed: 42,
    },
    ctx,
    full(W, H),
    resources,
  );

  save(canvas, "01-preset-catalog.png");
}

// ─── Demo 2: Pressure Dynamics ──────────────────────────────────────────────
// Shows how pressure affects size and opacity with different brush types

function renderPressureDynamics() {
  console.log("Demo 2: Pressure Dynamics");
  const W = 900, H = 600;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#faf8f4";
  ctx.fillRect(0, 0, W, H);

  const demos = [
    { brush: "round-hard", label: "Round Hard — pressure → size + opacity", color: "#1a1a1a" },
    { brush: "round-soft", label: "Round Soft — pressure → size + opacity", color: "#335599" },
    { brush: "pencil",     label: "Pencil — pressure → opacity [0.4, 1.0] + taper", color: "#2a2a2a" },
    { brush: "ink-pen",    label: "Ink Pen — pressure → size + wash mode", color: "#1a1a1a" },
    { brush: "flat",       label: "Flat — elliptical tip, pressure → size", color: "#884422" },
  ];

  const strokes = [];
  for (let i = 0; i < demos.length; i++) {
    const y = 60 + i * 108;
    const { brush, label, color } = demos[i];

    ctx.fillStyle = "#666";
    ctx.font = "13px sans-serif";
    ctx.fillText(label, 30, y - 18);

    strokes.push({
      brushId: brush,
      color,
      points: pressureLine(40, y, W - 40, y, 50),
      size: 28,
      seed: i * 99,
    });
  }

  strokeLayerType.render(
    {
      ...strokeLayerType.createDefault(),
      strokes: JSON.stringify(strokes),
      seed: 7,
    },
    ctx,
    full(W, H),
    resources,
  );

  save(canvas, "02-pressure-dynamics.png");
}

// ─── Demo 3: Calligraphy ────────────────────────────────────────────────────
// Ink-pen curves, loops, and flourishes

function renderCalligraphy() {
  console.log("Demo 3: Calligraphy");
  const W = 900, H = 700;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Warm parchment background
  ctx.fillStyle = "#f0e8d8";
  ctx.fillRect(0, 0, W, H);

  const strokes = [
    // Large sweeping arc
    { brushId: "ink-pen", color: "#1a1a1a", points: arc(450, 200, 180, -Math.PI * 0.8, Math.PI * 0.2, 60), size: 18 },
    // Figure-8 flourish
    { brushId: "ink-pen", color: "#1a1a1a", points: figure8(450, 400, 200, 100, 100), size: 14 },
    // Horizontal baseline strokes
    { brushId: "ink-pen", color: "#2a2a2a", points: sCurve(60, 560, 840, 560, 50), size: 10 },
    { brushId: "ink-pen", color: "#2a2a2a", points: sCurve(60, 620, 840, 620, 50), size: 8 },
    // Small decorative dots using marker
    { brushId: "marker", color: "#884444", points: arc(150, 200, 30, 0, Math.PI * 2, 20), size: 16 },
    { brushId: "marker", color: "#884444", points: arc(750, 200, 30, 0, Math.PI * 2, 20), size: 16 },
  ];

  strokeLayerType.render(
    {
      ...strokeLayerType.createDefault(),
      strokes: JSON.stringify(strokes),
      seed: 33,
    },
    ctx,
    full(W, H),
    resources,
  );

  // Add title
  ctx.fillStyle = "rgba(100,60,40,0.4)";
  ctx.font = "italic 18px Georgia, serif";
  ctx.fillText("Calligraphy — ink-pen + marker presets", 30, H - 20);

  save(canvas, "03-calligraphy.png");
}

// ─── Demo 4: Splatter Abstract ──────────────────────────────────────────────
// Splatter + watercolor-round creating an abstract painting

function renderSplatterAbstract() {
  console.log("Demo 4: Splatter Abstract");
  const W = 900, H = 900;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Dark background
  ctx.fillStyle = "#0d0d14";
  ctx.fillRect(0, 0, W, H);

  const strokes = [];

  // Watercolor-round washes (background)
  const washColors = ["#2244aa", "#aa2244", "#22aa66", "#aa8822"];
  for (let i = 0; i < 4; i++) {
    const cx = 200 + (i % 2) * 500;
    const cy = 200 + Math.floor(i / 2) * 500;
    strokes.push({
      brushId: "watercolor-round",
      color: washColors[i],
      points: arc(cx, cy, 120 + i * 30, 0, Math.PI * 2, 40),
      size: 80,
      seed: i * 111,
    });
  }

  // Splatter bursts
  const splatColors = ["#ff4444", "#44ff88", "#4488ff", "#ffaa22", "#ff44ff", "#44ffff"];
  for (let i = 0; i < 6; i++) {
    strokes.push({
      brushId: "splatter",
      color: splatColors[i],
      points: randomPath(
        100 + (i % 3) * 250,
        100 + Math.floor(i / 3) * 350,
        300 + (i % 3) * 250,
        350 + Math.floor(i / 3) * 350,
        40,
        i * 17,
      ),
      size: 10 + i * 3,
      seed: i * 234,
    });
  }

  // Charcoal-stick accents
  strokes.push({
    brushId: "charcoal-stick",
    color: "#cccccc",
    points: sCurve(100, 450, 800, 450, 60),
    size: 20,
    seed: 777,
  });

  strokeLayerType.render(
    {
      ...strokeLayerType.createDefault(),
      strokes: JSON.stringify(strokes),
      seed: 99,
    },
    ctx,
    full(W, H),
    resources,
  );

  save(canvas, "04-splatter-abstract.png");
}

// ─── Demo 5: Field Influence ────────────────────────────────────────────────
// Same strokes rendered with and without a vortex vector field

function renderFieldInfluence() {
  console.log("Demo 5: Field Influence");
  const W = 1200, H = 500;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f5f0e8";
  ctx.fillRect(0, 0, W, H);

  // Build identical strokes for both panels
  const baseStrokes = [];
  const lineColors = ["#aa3333", "#3355aa", "#33aa55", "#aa8822", "#8833aa"];
  for (let i = 0; i < 5; i++) {
    const y = 80 + i * 80;
    baseStrokes.push({
      brushId: "round-soft",
      color: lineColors[i],
      points: pressureLine(30, y, 570, y, 40),
      size: 24,
      seed: i * 55,
    });
  }

  // Labels
  ctx.fillStyle = "#333";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("Without field", 220, 30);
  ctx.fillText("With vortex field", 830, 30);

  // Left panel: no field
  strokeLayerType.render(
    {
      ...strokeLayerType.createDefault(),
      strokes: JSON.stringify(baseStrokes),
      seed: 42,
    },
    ctx,
    { x: 0, y: 0, width: 600, height: H, rotation: 0, scaleX: 1, scaleY: 1 },
    resources,
  );

  // Divider
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(600, 10);
  ctx.lineTo(600, H - 10);
  ctx.stroke();

  // Right panel: with vortex field (modulates alpha by magnitude)
  const rightStrokes = baseStrokes.map((s) => ({
    ...s,
    points: s.points.map((p) => ({ ...p, x: p.x + 600 })),
  }));

  strokeLayerType.render(
    {
      ...strokeLayerType.createDefault(),
      strokes: JSON.stringify(rightStrokes),
      field: "vortex:0.5:0.5:0.4",
      fieldCols: 24,
      fieldRows: 24,
      seed: 42,
    },
    ctx,
    { x: 600, y: 0, width: 600, height: H, rotation: 0, scaleX: 1, scaleY: 1 },
    resources,
  );

  save(canvas, "05-field-influence.png");
}

// ─── Demo 6: Texture Tips ────────────────────────────────────────────────────
// Chalk, sponge, and bristle texture brush strokes on paper-like background

function renderTextureTips() {
  console.log("Demo 6: Texture Tips");
  const W = 1000, H = 700;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Warm paper background
  ctx.fillStyle = "#f0e6d4";
  ctx.fillRect(0, 0, W, H);

  // Preload all texture tips
  for (const id of Object.keys(BRUSH_PRESETS)) {
    const preset = BRUSH_PRESETS[id];
    if (preset.tipType === "texture" && preset.tipTexture) {
      preloadTextureTip(preset.tipTexture);
    }
  }

  const textureBrushes = [
    {
      id: "texture-chalk",
      label: "Chalk — rough grain, variable opacity",
      color: "#443322",
      strokes: [
        { points: sCurve(40, 100, 960, 100, 60), size: 24 },
        { points: pressureLine(40, 160, 960, 160, 50), size: 18 },
        { points: arc(200, 100, 60, -Math.PI * 0.5, Math.PI * 0.5, 30), size: 14 },
      ],
    },
    {
      id: "texture-sponge",
      label: "Sponge — porous dabs, organic clusters",
      color: "#336655",
      strokes: [
        { points: sCurve(40, 310, 960, 310, 60), size: 30 },
        { points: pressureLine(40, 370, 960, 370, 50), size: 22 },
        { points: randomPath(100, 280, 900, 380, 30, 88), size: 26 },
      ],
    },
    {
      id: "texture-bristle",
      label: "Bristle — parallel streaks, directional texture",
      color: "#553344",
      strokes: [
        { points: sCurve(40, 510, 960, 510, 60), size: 22 },
        { points: pressureLine(40, 570, 960, 570, 50), size: 16 },
        { points: figure8(500, 530, 180, 60, 80), size: 12 },
      ],
    },
  ];

  const allStrokes = [];
  for (let i = 0; i < textureBrushes.length; i++) {
    const { id, label, color, strokes: demoStrokes } = textureBrushes[i];
    const yBase = 30 + i * 210;

    // Label
    ctx.fillStyle = "#555";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(label, 40, yBase);

    for (const s of demoStrokes) {
      allStrokes.push({
        brushId: id,
        color,
        ...s,
        seed: i * 123 + allStrokes.length * 7,
      });
    }
  }

  strokeLayerType.render(
    {
      ...strokeLayerType.createDefault(),
      strokes: JSON.stringify(allStrokes),
      seed: 55,
    },
    ctx,
    full(W, H),
    resources,
  );

  // Overlay labels after render so they aren't covered
  for (let i = 0; i < textureBrushes.length; i++) {
    const { label } = textureBrushes[i];
    const yBase = 30 + i * 210;
    ctx.fillStyle = "rgba(245,236,220,0.85)";
    ctx.fillRect(30, yBase - 16, ctx.measureText(label).width + 20, 22);
    ctx.fillStyle = "#333";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(label, 40, yBase);
  }

  save(canvas, "06-texture-tips.png");
}

// ─── Demo 7: Gallery composite ──────────────────────────────────────────────

function renderGallery() {
  console.log("Gallery composite");
  const thumbW = 400;

  // Read all renders
  const files = [
    "01-preset-catalog.png",
    "02-pressure-dynamics.png",
    "03-calligraphy.png",
    "04-splatter-abstract.png",
    "05-field-influence.png",
    "06-texture-tips.png",
  ];

  const { createCanvas: cc, loadImage } = require("canvas");
  const images = files.map((f) => {
    const buf = fs.readFileSync(path.join(outDir, f));
    const img = new (require("canvas").Image)();
    img.src = buf;
    return img;
  });

  // 3 columns, 2 rows
  const cols = 3;
  const rows = 2;
  const padding = 20;
  const thumbH = 280;
  const gW = cols * thumbW + (cols + 1) * padding;
  const gH = rows * thumbH + (rows + 1) * padding + 40;
  const gCanvas = cc(gW, gH);
  const gctx = gCanvas.getContext("2d");

  gctx.fillStyle = "#1c1a18";
  gctx.fillRect(0, 0, gW, gH);

  for (let i = 0; i < images.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * (thumbW + padding);
    const y = padding + row * (thumbH + padding);

    const img = images[i];
    const scale = Math.min(thumbW / img.width, thumbH / img.height);
    const dw = Math.round(img.width * scale);
    const dh = Math.round(img.height * scale);
    gctx.drawImage(img, x + (thumbW - dw) / 2, y + (thumbH - dh) / 2, dw, dh);

    // Label
    gctx.fillStyle = "rgba(255,255,255,0.6)";
    gctx.font = "12px sans-serif";
    gctx.fillText(files[i].replace(".png", ""), x + 4, y + thumbH + 14);
  }

  // Title
  gctx.fillStyle = "rgba(255,255,255,0.8)";
  gctx.font = "bold 16px sans-serif";
  gctx.fillText("Brush Stroke System — Visual Demos", padding, gH - 12);

  save(gCanvas, "brush-stroke-gallery.png");
}

// ─── Run all ─────────────────────────────────────────────────────────────────

console.log("\n🖌️  Brush Stroke System — Visual Demos\n");

renderPresetCatalog();
renderPressureDynamics();
renderCalligraphy();
renderSplatterAbstract();
renderFieldInfluence();
renderTextureTips();
renderGallery();

console.log("\nDone! All renders saved to renders/\n");
