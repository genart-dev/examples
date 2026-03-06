/**
 * Guided Compositions — Compositional guide system showcase
 *
 * 1. "Rule of Thirds"       — thirdsGuideLayerType with elements placed at power points
 * 2. "Golden Ratio"         — goldenRatioGuideLayerType + goldenSpiralGuideLayerType overlay
 * 3. "Dynamic Symmetry"     — dynamicSymmetryGuideLayerType with diagonal grid overlay
 * 4. "Armature & Rabatment" — armatureGuideLayerType + rabatmentGuideLayerType combined
 * 5. "Musical Ratios"       — musicalRatiosGuideLayerType showing harmonic divisions
 * 6. "Flow Paths"           — flowPathGuideLayerType with eye movement trajectories
 * 7. "Guide Comparison"     — all guide types overlaid on the same composition for comparison
 *
 * Plugins used:
 *   - @genart-dev/plugin-layout-guides       (gridGuideLayerType, thirdsGuideLayerType, goldenRatioGuideLayerType, diagonalGuideLayerType, customGuideLayerType)
 *   - @genart-dev/plugin-layout-composition  (goldenSpiralGuideLayerType, goldenTriangleGuideLayerType, armatureGuideLayerType, rabatmentGuideLayerType, dynamicSymmetryGuideLayerType, musicalRatiosGuideLayerType, flowPathGuideLayerType, phiGridGuideLayerType, diagonalGridGuideLayerType, safeMarginsGuideLayerType)
 *
 * Output: renders/01-thirds.png .. renders/guide-comparison.png
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
  thirdsGuideLayerType,
  goldenRatioGuideLayerType,
  diagonalGuideLayerType,
} = require("../../../plugin-layout-guides/dist/index.cjs");

const {
  goldenSpiralGuideLayerType,
  goldenTriangleGuideLayerType,
  armatureGuideLayerType,
  rabatmentGuideLayerType,
  dynamicSymmetryGuideLayerType,
  musicalRatiosGuideLayerType,
  flowPathGuideLayerType,
  phiGridGuideLayerType,
  diagonalGridGuideLayerType,
  safeMarginsGuideLayerType,
} = require("../../../plugin-layout-composition/dist/index.cjs");

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

function renderLabeledGrid(title, cells, cols, cellW, cellH, padding, bgColor = "#f5f0e8") {
  const rows = Math.ceil(cells.length / cols);
  const W = cols * cellW + (cols + 1) * padding;
  const H = rows * cellH + (rows + 1) * padding + 50;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#333";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(title, padding, 30);

  for (let i = 0; i < cells.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * (cellW + padding);
    const y = 50 + padding + row * (cellH + padding);

    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, y - 1, cellW + 2, cellH + 2);
    ctx.drawImage(cells[i].canvas, x, y, cellW, cellH);

    ctx.fillStyle = "#555";
    ctx.font = "12px sans-serif";
    ctx.fillText(cells[i].label, x + 4, y + cellH + 14);
  }

  return canvas;
}

// Helper: simple landscape scene to overlay guides onto
function drawLandscape(ctx, w, h) {
  // Sky
  ctx.fillStyle = "#d4e4f0";
  ctx.fillRect(0, 0, w, h);
  // Ground
  ctx.fillStyle = "#a8c090";
  ctx.fillRect(0, h * 0.6, w, h * 0.4);
  // Horizon line
  ctx.strokeStyle = "#7a9a60";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.6);
  ctx.lineTo(w, h * 0.6);
  ctx.stroke();
  // Tree (focal element)
  ctx.fillStyle = "#3a5a2a";
  ctx.beginPath();
  ctx.arc(w * 0.35, h * 0.42, w * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a3a2a";
  ctx.fillRect(w * 0.34, h * 0.48, w * 0.02, h * 0.14);
  // Mountain
  ctx.fillStyle = "#8090a0";
  ctx.beginPath();
  ctx.moveTo(w * 0.55, h * 0.6);
  ctx.lineTo(w * 0.7, h * 0.25);
  ctx.lineTo(w * 0.85, h * 0.6);
  ctx.closePath();
  ctx.fill();
  // Small house
  ctx.fillStyle = "#c48040";
  ctx.fillRect(w * 0.6, h * 0.52, w * 0.06, h * 0.08);
  ctx.fillStyle = "#8b4513";
  ctx.beginPath();
  ctx.moveTo(w * 0.59, h * 0.52);
  ctx.lineTo(w * 0.63, h * 0.44);
  ctx.lineTo(w * 0.67, h * 0.52);
  ctx.closePath();
  ctx.fill();
}

function renderWithGuide(w, h, layers) {
  const c = createCanvas(w, h);
  const ctx = c.getContext("2d");
  drawLandscape(ctx, w, h);
  for (const layer of layers) {
    layer.type.render(
      { ...layer.type.createDefault(), ...layer.props },
      ctx, full(w, h), resources,
    );
  }
  return c;
}

// ─── Scene 1: Rule of Thirds ────────────────────────────────────────────────

function renderThirds() {
  console.log("Scene 1: Rule of Thirds");
  const cellW = 400, cellH = 300;

  const cells = [
    {
      label: "Thirds (default)",
      canvas: renderWithGuide(cellW, cellH, [
        { type: thirdsGuideLayerType, props: { guideColor: "rgba(255,50,50,0.6)", lineWidth: 1.5 } },
      ]),
    },
    {
      label: "Thirds + Diagonals",
      canvas: renderWithGuide(cellW, cellH, [
        { type: thirdsGuideLayerType, props: { guideColor: "rgba(255,50,50,0.5)" } },
        { type: diagonalGuideLayerType, props: { pattern: "x", guideColor: "rgba(50,50,255,0.4)" } },
      ]),
    },
    {
      label: "Phi Grid",
      canvas: renderWithGuide(cellW, cellH, [
        { type: phiGridGuideLayerType, props: { guideColor: "rgba(200,50,200,0.6)", lineWidth: 1.5 } },
      ]),
    },
    {
      label: "Thirds vs Phi Grid",
      canvas: renderWithGuide(cellW, cellH, [
        { type: thirdsGuideLayerType, props: { guideColor: "rgba(255,50,50,0.5)" } },
        { type: phiGridGuideLayerType, props: { guideColor: "rgba(50,200,50,0.5)" } },
      ]),
    },
  ];

  const canvas = renderLabeledGrid("Rule of Thirds — Power Points & Grid Divisions", cells, 2, cellW, cellH, 16);
  save(canvas, "01-thirds.png");
}

// ─── Scene 2: Golden Ratio ──────────────────────────────────────────────────

function renderGoldenRatio() {
  console.log("Scene 2: Golden Ratio");
  const cellW = 400, cellH = 300;

  const orientations = ["top-left", "top-right", "bottom-left", "bottom-right"];
  const cells = orientations.map((o) => ({
    label: `Spiral: ${o}`,
    canvas: renderWithGuide(cellW, cellH, [
      { type: goldenRatioGuideLayerType, props: { guideColor: "rgba(50,50,255,0.4)" } },
      { type: goldenSpiralGuideLayerType, props: { orientation: o, guideColor: "rgba(255,180,0,0.7)", lineWidth: 2, showRectangles: true } },
    ]),
  }));

  const canvas = renderLabeledGrid("Golden Ratio — Spiral Orientations with Phi Lines", cells, 2, cellW, cellH, 16);
  save(canvas, "02-golden-ratio.png");
}

// ─── Scene 3: Dynamic Symmetry ──────────────────────────────────────────────

function renderDynamicSymmetry() {
  console.log("Scene 3: Dynamic Symmetry");
  const cellW = 400, cellH = 300;

  const cells = [
    {
      label: "Dynamic Symmetry (full)",
      canvas: renderWithGuide(cellW, cellH, [
        { type: dynamicSymmetryGuideLayerType, props: { guideColor: "rgba(255,100,50,0.5)", showBaroqueDiagonal: true, showSinisterDiagonal: true, showReciprocals: true } },
      ]),
    },
    {
      label: "Baroque Diagonal only",
      canvas: renderWithGuide(cellW, cellH, [
        { type: dynamicSymmetryGuideLayerType, props: { guideColor: "rgba(50,150,255,0.6)", showBaroqueDiagonal: true, showSinisterDiagonal: false, showReciprocals: false } },
      ]),
    },
    {
      label: "Diagonal Grid",
      canvas: renderWithGuide(cellW, cellH, [
        { type: diagonalGridGuideLayerType, props: { guideColor: "rgba(200,50,200,0.5)", showDiamond: true, diamondColor: "rgba(200,50,200,0.08)" } },
      ]),
    },
    {
      label: "Golden Triangle",
      canvas: renderWithGuide(cellW, cellH, [
        { type: goldenTriangleGuideLayerType, props: { guideColor: "rgba(50,200,100,0.6)", mirror: false } },
      ]),
    },
  ];

  const canvas = renderLabeledGrid("Dynamic Symmetry — Diagonals, Reciprocals & Triangles", cells, 2, cellW, cellH, 16);
  save(canvas, "03-dynamic-symmetry.png");
}

// ─── Scene 4: Armature & Rabatment ──────────────────────────────────────────

function renderArmatureRabatment() {
  console.log("Scene 4: Armature & Rabatment");
  const cellW = 400, cellH = 300;

  const cells = [
    {
      label: "Armature (full)",
      canvas: renderWithGuide(cellW, cellH, [
        { type: armatureGuideLayerType, props: { variant: "full", guideColor: "rgba(255,100,50,0.5)" } },
      ]),
    },
    {
      label: "Rabatment",
      canvas: renderWithGuide(cellW, cellH, [
        { type: rabatmentGuideLayerType, props: { guideColor: "rgba(50,100,255,0.6)", showFill: true, fillColor: "rgba(50,100,255,0.06)" } },
      ]),
    },
    {
      label: "Armature + Rabatment",
      canvas: renderWithGuide(cellW, cellH, [
        { type: armatureGuideLayerType, props: { variant: "full", guideColor: "rgba(255,100,50,0.35)" } },
        { type: rabatmentGuideLayerType, props: { guideColor: "rgba(50,100,255,0.4)", showFill: true, fillColor: "rgba(50,100,255,0.05)" } },
      ]),
    },
    {
      label: "Safe Margins (title-safe)",
      canvas: renderWithGuide(cellW, cellH, [
        { type: safeMarginsGuideLayerType, props: { preset: "title-safe", guideColor: "rgba(255,50,50,0.6)" } },
      ]),
    },
  ];

  const canvas = renderLabeledGrid("Armature & Rabatment — Structural Guides", cells, 2, cellW, cellH, 16);
  save(canvas, "04-armature-rabatment.png");
}

// ─── Scene 5: Musical Ratios ────────────────────────────────────────────────

function renderMusicalRatios() {
  console.log("Scene 5: Musical Ratios");
  const cellW = 400, cellH = 300;

  const ratios = ["double-diatessaron", "double-diapente"];
  const cells = ratios.map((r) => ({
    label: r,
    canvas: renderWithGuide(cellW, cellH, [
      { type: musicalRatiosGuideLayerType, props: { ratio: r, showBothAxes: true, guideColor: "rgba(200,100,50,0.6)" } },
    ]),
  }));

  // Add phi grid comparison
  cells.push({
    label: "Musical + Phi Grid",
    canvas: renderWithGuide(cellW, cellH, [
      { type: musicalRatiosGuideLayerType, props: { ratio: "double-diatessaron", showBothAxes: true, guideColor: "rgba(200,100,50,0.4)" } },
      { type: phiGridGuideLayerType, props: { guideColor: "rgba(50,150,255,0.4)" } },
    ]),
  });

  cells.push({
    label: "Musical + Golden Spiral",
    canvas: renderWithGuide(cellW, cellH, [
      { type: musicalRatiosGuideLayerType, props: { ratio: "double-diapente", showBothAxes: true, guideColor: "rgba(200,100,50,0.3)" } },
      { type: goldenSpiralGuideLayerType, props: { guideColor: "rgba(255,180,0,0.6)", lineWidth: 2 } },
    ]),
  });

  const canvas = renderLabeledGrid("Musical Ratios — Harmonic Divisions", cells, 2, cellW, cellH, 16);
  save(canvas, "05-musical-ratios.png");
}

// ─── Scene 6: Flow Paths ────────────────────────────────────────────────────

function renderFlowPaths() {
  console.log("Scene 6: Flow Paths");
  const cellW = 400, cellH = 300;

  const patterns = ["s-curve", "z-path", "spiral", "triangle"];
  const cells = patterns.map((p) => ({
    label: `Flow: ${p}`,
    canvas: renderWithGuide(cellW, cellH, [
      { type: flowPathGuideLayerType, props: { pattern: p, showArrows: true, guideColor: "rgba(255,50,100,0.7)", lineWidth: 2 } },
    ]),
  }));

  const canvas = renderLabeledGrid("Flow Paths — Eye Movement Trajectories", cells, 2, cellW, cellH, 16);
  save(canvas, "06-flow-paths.png");
}

// ─── Scene 7: Guide Comparison ──────────────────────────────────────────────

function renderGuideComparison() {
  console.log("Scene 7: Guide Comparison");
  const thumbW = 400, thumbH = 300;

  const files = [
    "01-thirds.png",
    "02-golden-ratio.png",
    "03-dynamic-symmetry.png",
    "04-armature-rabatment.png",
    "05-musical-ratios.png",
    "06-flow-paths.png",
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
  ctx.fillText("Guided Compositions — 15 Guide Types Across 6 Studies", padding, gH - 12);

  save(canvas, "guide-comparison.png");
}

// ─── Run all ─────────────────────────────────────────────────────────────────

console.log("\nGuided Compositions — Compositional Guide System Showcase\n");

renderThirds();
renderGoldenRatio();
renderDynamicSymmetry();
renderArmatureRabatment();
renderMusicalRatios();
renderFlowPaths();
renderGuideComparison();

console.log("\nDone! All renders saved to renders/\n");
