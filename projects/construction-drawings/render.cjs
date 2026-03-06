/**
 * Construction Drawings — Geometric and architectural constructions
 *
 * 1. "Basic Forms"         — 6 form types (box, cylinder, sphere, cone, wedge, egg) with cross-contours
 * 2. "Form Rotations"      — single form rotated through different X/Y/Z angles
 * 3. "Value Shapes"        — light/shadow decomposition with different light directions
 * 4. "Envelopes"           — bounding envelopes with angles, plumb lines, and subdivisions
 * 5. "Guide Overlay"       — thirds + golden ratio + diagonal guides on a composition
 * 6. "Technical Plate"     — contact sheet of all scenes
 *
 * Plugins used:
 *   - @genart-dev/plugin-construction   (formLayerType, crossContourLayerType, valueShapesLayerType, envelopeLayerType)
 *   - @genart-dev/plugin-layout-guides  (gridGuideLayerType, thirdsGuideLayerType, goldenRatioGuideLayerType, diagonalGuideLayerType)
 *
 * Output: renders/01-basic-forms.png .. renders/technical-plate.png
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
  formLayerType,
  crossContourLayerType,
  valueShapesLayerType,
  envelopeLayerType,
} = require("../../../plugin-construction/dist/index.cjs");

const {
  gridGuideLayerType,
  thirdsGuideLayerType,
  goldenRatioGuideLayerType,
  diagonalGuideLayerType,
} = require("../../../plugin-layout-guides/dist/index.cjs");

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

// ─── Scene 1: Basic Forms ───────────────────────────────────────────────────

function renderBasicForms() {
  console.log("Scene 1: Basic Forms");
  const cellW = 300, cellH = 300;
  const formTypes = ["box", "cylinder", "sphere", "cone", "wedge", "egg"];

  const cells = formTypes.map((ft) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, 0, cellW, cellH);

    formLayerType.render({
      ...formLayerType.createDefault(),
      formType: ft,
      position: { x: 0.5, y: 0.5 },
      formSize: 0.3,
      rotationX: 20,
      rotationY: 35,
      rotationZ: 0,
      showCrossContours: true,
      crossContourCount: 5,
      showAxes: true,
      showHiddenEdges: true,
      hiddenEdgeStyle: "dashed",
    }, ctx, full(cellW, cellH), resources);

    return { label: ft.charAt(0).toUpperCase() + ft.slice(1), canvas: c };
  });

  const canvas = renderLabeledGrid("Basic Forms — 6 Primitives with Cross-Contours", cells, 3, cellW, cellH, 16);
  save(canvas, "01-basic-forms.png");
}

// ─── Scene 2: Form Rotations ────────────────────────────────────────────────

function renderFormRotations() {
  console.log("Scene 2: Form Rotations");
  const cellW = 250, cellH = 250;

  const rotations = [
    { label: "Front (0, 0, 0)", rotationX: 0, rotationY: 0, rotationZ: 0 },
    { label: "Tilt (30, 0, 0)", rotationX: 30, rotationY: 0, rotationZ: 0 },
    { label: "Turn (0, 45, 0)", rotationX: 0, rotationY: 45, rotationZ: 0 },
    { label: "Roll (0, 0, 30)", rotationX: 0, rotationY: 0, rotationZ: 30 },
    { label: "3/4 (20, 35, 0)", rotationX: 20, rotationY: 35, rotationZ: 0 },
    { label: "Above (60, 30, 0)", rotationX: 60, rotationY: 30, rotationZ: 0 },
    { label: "Below (-40, 20, 0)", rotationX: -40, rotationY: 20, rotationZ: 0 },
    { label: "Complex (25, 45, 15)", rotationX: 25, rotationY: 45, rotationZ: 15 },
  ];

  const cells = rotations.map((r) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, 0, cellW, cellH);

    formLayerType.render({
      ...formLayerType.createDefault(),
      formType: "box",
      position: { x: 0.5, y: 0.5 },
      formSize: 0.28,
      rotationX: r.rotationX,
      rotationY: r.rotationY,
      rotationZ: r.rotationZ,
      showCrossContours: false,
      showAxes: true,
      showHiddenEdges: true,
    }, ctx, full(cellW, cellH), resources);

    return { label: r.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Form Rotations — Box at Different Angles", cells, 4, cellW, cellH, 12);
  save(canvas, "02-form-rotations.png");
}

// ─── Scene 3: Value Shapes ──────────────────────────────────────────────────

function renderValueShapes() {
  console.log("Scene 3: Value Shapes");
  const cellW = 350, cellH = 350;

  const variations = [
    { label: "Top-left light", lightAzimuth: 315, lightElevation: 45, valueGrouping: "three-value" },
    { label: "Top-right light", lightAzimuth: 45, lightElevation: 45, valueGrouping: "three-value" },
    { label: "Low angle", lightAzimuth: 315, lightElevation: 20, valueGrouping: "three-value" },
    { label: "Two-value", lightAzimuth: 315, lightElevation: 45, valueGrouping: "two-value" },
    { label: "Five-value", lightAzimuth: 315, lightElevation: 45, valueGrouping: "five-value" },
    { label: "Rim light", lightAzimuth: 180, lightElevation: 30, valueGrouping: "three-value" },
  ];

  const cells = variations.map((v) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, 0, cellW, cellH);

    valueShapesLayerType.render({
      ...valueShapesLayerType.createDefault(),
      lightAzimuth: v.lightAzimuth,
      lightElevation: v.lightElevation,
      valueGrouping: v.valueGrouping,
      showLightIndicator: true,
      showTerminator: true,
      showCastShadow: true,
      showOcclusionShadow: true,
      showZoneLabels: true,
    }, ctx, full(cellW, cellH), resources);

    return { label: v.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Value Shapes — Light & Shadow Decomposition", cells, 3, cellW, cellH, 16);
  save(canvas, "03-value-shapes.png");
}

// ─── Scene 4: Envelopes ─────────────────────────────────────────────────────

function renderEnvelopes() {
  console.log("Scene 4: Envelopes");
  const cellW = 350, cellH = 400;

  // Different envelope paths
  const variations = [
    {
      label: "Simple Envelope",
      path: [{ x: 0.3, y: 0.1 }, { x: 0.7, y: 0.1 }, { x: 0.8, y: 0.5 }, { x: 0.6, y: 0.9 }, { x: 0.4, y: 0.9 }, { x: 0.2, y: 0.5 }],
      style: "tight",
      showAngles: true, showPlumbLine: true, showSubdivisions: false,
    },
    {
      label: "Loose Fit",
      path: [{ x: 0.3, y: 0.1 }, { x: 0.7, y: 0.1 }, { x: 0.8, y: 0.5 }, { x: 0.6, y: 0.9 }, { x: 0.4, y: 0.9 }, { x: 0.2, y: 0.5 }],
      style: "loose",
      showAngles: false, showPlumbLine: true, showSubdivisions: false,
    },
    {
      label: "With Subdivisions",
      path: [{ x: 0.25, y: 0.15 }, { x: 0.75, y: 0.15 }, { x: 0.85, y: 0.45 }, { x: 0.7, y: 0.85 }, { x: 0.3, y: 0.85 }, { x: 0.15, y: 0.45 }],
      style: "tight",
      showAngles: true, showPlumbLine: true, showSubdivisions: true,
    },
    {
      label: "Asymmetric Form",
      path: [{ x: 0.4, y: 0.1 }, { x: 0.8, y: 0.2 }, { x: 0.85, y: 0.6 }, { x: 0.7, y: 0.85 }, { x: 0.3, y: 0.9 }, { x: 0.15, y: 0.55 }, { x: 0.25, y: 0.25 }],
      style: "tight",
      showAngles: true, showPlumbLine: true, showSubdivisions: false,
    },
  ];

  const cells = variations.map((v) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, 0, cellW, cellH);

    envelopeLayerType.render({
      ...envelopeLayerType.createDefault(),
      envelopePath: JSON.stringify(v.path),
      envelopeStyle: v.style,
      showAngles: v.showAngles,
      showPlumbLine: v.showPlumbLine,
      showSubdivisions: v.showSubdivisions,
      subdivisionDepth: 2,
    }, ctx, full(cellW, cellH), resources);

    return { label: v.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Envelopes — Bounding Shapes & Construction", cells, 2, cellW, cellH, 16);
  save(canvas, "04-envelopes.png");
}

// ─── Scene 5: Guide Overlay ─────────────────────────────────────────────────

function renderGuideOverlay() {
  console.log("Scene 5: Guide Overlay");
  const cellW = 400, cellH = 300;

  // Base composition: simple still life shapes
  function drawStillLife(ctx, w, h) {
    ctx.fillStyle = "#f0ece4";
    ctx.fillRect(0, 0, w, h);
    // Table line
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    ctx.lineTo(w, h * 0.7);
    ctx.stroke();
    // Tall bottle
    ctx.fillStyle = "#3a3a5a";
    ctx.fillRect(w * 0.33, h * 0.2, w * 0.08, h * 0.5);
    ctx.fillRect(w * 0.35, h * 0.15, w * 0.04, h * 0.08);
    // Bowl
    ctx.beginPath();
    ctx.arc(w * 0.6, h * 0.65, w * 0.1, 0, Math.PI);
    ctx.fillStyle = "#8b5e3c";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.6, h * 0.55, w * 0.1, w * 0.03, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#a07050";
    ctx.fill();
    // Apple
    ctx.beginPath();
    ctx.arc(w * 0.75, h * 0.63, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#c44";
    ctx.fill();
  }

  const guides = [
    {
      label: "Rule of Thirds",
      layers: [{ type: thirdsGuideLayerType, props: {} }],
    },
    {
      label: "Golden Ratio",
      layers: [{ type: goldenRatioGuideLayerType, props: {} }],
    },
    {
      label: "Diagonal (X)",
      layers: [{ type: diagonalGuideLayerType, props: { pattern: "x" } }],
    },
    {
      label: "Grid 5x4",
      layers: [{ type: gridGuideLayerType, props: { columns: 5, rows: 4 } }],
    },
    {
      label: "Thirds + Golden",
      layers: [
        { type: thirdsGuideLayerType, props: { guideColor: "rgba(255,50,50,0.5)" } },
        { type: goldenRatioGuideLayerType, props: { guideColor: "rgba(50,50,255,0.5)" } },
      ],
    },
    {
      label: "All Guides",
      layers: [
        { type: gridGuideLayerType, props: { columns: 3, rows: 3, guideColor: "rgba(200,200,200,0.3)" } },
        { type: thirdsGuideLayerType, props: { guideColor: "rgba(255,50,50,0.4)" } },
        { type: goldenRatioGuideLayerType, props: { guideColor: "rgba(50,50,255,0.4)" } },
        { type: diagonalGuideLayerType, props: { pattern: "x", guideColor: "rgba(50,200,50,0.3)" } },
      ],
    },
  ];

  const cells = guides.map((g) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    drawStillLife(ctx, cellW, cellH);

    for (const layer of g.layers) {
      layer.type.render(
        { ...layer.type.createDefault(), ...layer.props },
        ctx, full(cellW, cellH), resources,
      );
    }

    return { label: g.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Guide Overlay — Compositional Guides on Still Life", cells, 3, cellW, cellH, 16);
  save(canvas, "05-guide-overlay.png");
}

// ─── Scene 6: Technical Plate ───────────────────────────────────────────────

function renderTechnicalPlate() {
  console.log("Scene 6: Technical Plate");
  const thumbW = 400, thumbH = 300;

  const files = [
    "01-basic-forms.png",
    "02-form-rotations.png",
    "03-value-shapes.png",
    "04-envelopes.png",
    "05-guide-overlay.png",
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
  ctx.fillText("Construction Drawings — Forms, Values, Envelopes & Guides", padding, gH - 12);

  save(canvas, "technical-plate.png");
}

// ─── Run all ─────────────────────────────────────────────────────────────────

console.log("\nConstruction Drawings — Geometric & Architectural Constructions\n");

renderBasicForms();
renderFormRotations();
renderValueShapes();
renderEnvelopes();
renderGuideOverlay();
renderTechnicalPlate();

console.log("\nDone! All renders saved to renders/\n");
