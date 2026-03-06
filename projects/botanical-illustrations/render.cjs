/**
 * Botanical Illustrations — Multi-plugin botanical plates
 *
 * 1. "Leaf Forms"          — ellipse + polygon shapes for leaf silhouettes with cross-contour veins
 * 2. "Flower Construction" — construction envelopes showing petal arrangement geometry
 * 3. "Textured Plate"      — botanical forms on paper texture background with washi border
 * 4. "Labeled Specimen"    — plant form + construction lines + typographic labels and annotations
 * 5. "Seed Pod Grid"       — grid of geometric seed pod forms with value shading
 * 6. "Botanical Plate"     — full plate combining all elements: texture bg, forms, construction, labels
 *
 * Plugins used:
 *   - @genart-dev/plugin-shapes       (ellipseLayerType, polygonLayerType, lineLayerType)
 *   - @genart-dev/plugin-textures     (paperLayerType, washiLayerType)
 *   - @genart-dev/plugin-construction (formLayerType, crossContourLayerType, envelopeLayerType)
 *   - @genart-dev/plugin-typography   (textLayerType)
 *
 * Output: renders/01-leaf-forms.png .. renders/botanical-plate.png
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
  ellipseLayerType,
  polygonLayerType,
  lineLayerType,
} = require("../../../plugin-shapes/dist/index.cjs");

const {
  paperLayerType,
  washiLayerType,
} = require("../../../plugin-textures/dist/index.cjs");

const {
  formLayerType,
  envelopeLayerType,
} = require("../../../plugin-construction/dist/index.cjs");

const {
  textLayerType,
} = require("../../../plugin-typography/dist/index.cjs");

// --- Shared setup ---

const outDir = path.join(__dirname, "renders");
fs.mkdirSync(outDir, { recursive: true });

const resources = { getFont: () => null, getImage: () => null, theme: "light", pixelRatio: 1 };

function full(w, h) {
  return { x: 0, y: 0, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 };
}

function bounds(x, y, w, h) {
  return { x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 };
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

// Helper: draw a simple leaf silhouette using canvas drawing
function drawLeaf(ctx, cx, cy, w, h, angle, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.bezierCurveTo(w / 2, -h / 3, w / 2, h / 3, 0, h / 2);
  ctx.bezierCurveTo(-w / 2, h / 3, -w / 2, -h / 3, 0, -h / 2);
  ctx.fill();
  // Central vein
  ctx.strokeStyle = "rgba(0,80,0,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(0, h / 2);
  ctx.stroke();
  // Side veins
  ctx.strokeStyle = "rgba(0,80,0,0.25)";
  ctx.lineWidth = 0.5;
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    const yy = (i / 4) * h * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, yy);
    ctx.lineTo((i > 0 ? 1 : -1) * w * 0.35, yy + (i > 0 ? 1 : -1) * h * 0.08);
    ctx.stroke();
  }
  ctx.restore();
}

// ─── Scene 1: Leaf Forms ────────────────────────────────────────────────────

function renderLeafForms() {
  console.log("Scene 1: Leaf Forms");
  const cellW = 300, cellH = 350;

  const leaves = [
    { label: "Ovate", w: 80, h: 160, color: "#4a7a3a" },
    { label: "Lanceolate", w: 45, h: 200, color: "#3a6a2a" },
    { label: "Cordate", w: 100, h: 140, color: "#5a8a4a" },
    { label: "Elliptic", w: 70, h: 150, color: "#3a7a4a" },
    { label: "Oblong", w: 60, h: 180, color: "#4a6a3a" },
    { label: "Deltoid", w: 90, h: 120, color: "#5a7a3a" },
  ];

  const cells = leaves.map((leaf) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f2";
    ctx.fillRect(0, 0, cellW, cellH);

    // Draw leaf
    drawLeaf(ctx, cellW / 2, cellH / 2 - 20, leaf.w, leaf.h, 0, leaf.color);

    // Draw construction ellipse overlay
    ellipseLayerType.render({
      ...ellipseLayerType.createDefault(),
      fillEnabled: false,
      strokeEnabled: true,
      strokeColor: "rgba(200,50,50,0.4)",
      strokeWidth: 1,
    }, ctx, bounds(cellW / 2 - leaf.w / 2, cellH / 2 - 20 - leaf.h / 2, leaf.w, leaf.h), resources);

    // Stem line
    lineLayerType.render({
      ...lineLayerType.createDefault(),
      strokeColor: "#5a3a1a",
      strokeWidth: 2,
      lineCap: "round",
    }, ctx, bounds(cellW / 2, cellH / 2 - 20 + leaf.h / 2, 1, 60), resources);

    return { label: leaf.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Leaf Forms — Silhouettes with Construction Ellipses", cells, 3, cellW, cellH, 16);
  save(canvas, "01-leaf-forms.png");
}

// ─── Scene 2: Flower Construction ───────────────────────────────────────────

function renderFlowerConstruction() {
  console.log("Scene 2: Flower Construction");
  const cellW = 350, cellH = 350;

  const petalCounts = [
    { label: "5-Petal Rose", petals: 5, color: "#d44060" },
    { label: "6-Petal Lily", petals: 6, color: "#e8a040" },
    { label: "8-Petal Dahlia", petals: 8, color: "#a040c0" },
    { label: "3-Petal Iris", petals: 3, color: "#4060d0" },
  ];

  const cells = petalCounts.map((flower) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f2";
    ctx.fillRect(0, 0, cellW, cellH);

    const cx = cellW / 2, cy = cellH / 2;
    const outerR = 100, innerR = 30;

    // Draw construction envelope (outer circle)
    ctx.strokeStyle = "rgba(200,50,50,0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw petals
    for (let i = 0; i < flower.petals; i++) {
      const angle = (i / flower.petals) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(angle) * (outerR * 0.55);
      const py = cy + Math.sin(angle) * (outerR * 0.55);

      // Petal ellipse
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillStyle = flower.color + "80";
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, outerR * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = flower.color;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Construction line from center
      ctx.strokeStyle = "rgba(100,100,100,0.2)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.stroke();
    }

    // Center dot
    ctx.fillStyle = "#e8c040";
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();

    return { label: flower.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Flower Construction — Petal Geometry & Radial Guides", cells, 2, cellW, cellH, 16);
  save(canvas, "02-flower-construction.png");
}

// ─── Scene 3: Textured Plate ────────────────────────────────────────────────

function renderTexturedPlate() {
  console.log("Scene 3: Textured Plate");
  const W = 600, H = 500;
  const c = createCanvas(W, H);
  const ctx = c.getContext("2d");

  // Paper background
  paperLayerType.render({
    ...paperLayerType.createDefault(),
  }, ctx, full(W, H), resources);

  // Washi border strips
  const borderW = 20;
  washiLayerType.render({
    ...washiLayerType.createDefault(),
  }, ctx, bounds(0, 0, W, borderW), resources);
  washiLayerType.render({
    ...washiLayerType.createDefault(),
  }, ctx, bounds(0, H - borderW, W, borderW), resources);
  washiLayerType.render({
    ...washiLayerType.createDefault(),
  }, ctx, bounds(0, 0, borderW, H), resources);
  washiLayerType.render({
    ...washiLayerType.createDefault(),
  }, ctx, bounds(W - borderW, 0, borderW, H), resources);

  // Draw botanical forms in the center
  drawLeaf(ctx, W * 0.35, H * 0.4, 80, 180, -0.15, "#4a7a3a");
  drawLeaf(ctx, W * 0.55, H * 0.35, 60, 140, 0.2, "#3a6a2a");
  drawLeaf(ctx, W * 0.45, H * 0.55, 50, 120, 0.4, "#5a8a4a");

  // Flower
  const fx = W * 0.6, fy = H * 0.6;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.translate(fx + Math.cos(angle) * 25, fy + Math.sin(angle) * 25);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = "rgba(200,60,80,0.6)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#e8c040";
  ctx.beginPath();
  ctx.arc(fx, fy, 6, 0, Math.PI * 2);
  ctx.fill();

  // Stem
  ctx.strokeStyle = "#5a7a3a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.45, H * 0.3);
  ctx.bezierCurveTo(W * 0.42, H * 0.5, W * 0.5, H * 0.7, W * 0.45, H * 0.85);
  ctx.stroke();

  save(c, "03-textured-plate.png");
}

// ─── Scene 4: Labeled Specimen ──────────────────────────────────────────────

function renderLabeledSpecimen() {
  console.log("Scene 4: Labeled Specimen");
  const W = 600, H = 700;
  const c = createCanvas(W, H);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#faf8f2";
  ctx.fillRect(0, 0, W, H);

  // Title
  textLayerType.render({
    ...textLayerType.createDefault(),
    text: "Rosa canina",
    fontFamily: "Georgia",
    fontSize: 28,
    fontStyle: "italic",
    color: "#333",
    align: "center",
    baseline: "top",
  }, ctx, bounds(0, 20, W, 40), resources);

  textLayerType.render({
    ...textLayerType.createDefault(),
    text: "Dog Rose — Rosaceae",
    fontFamily: "Georgia",
    fontSize: 14,
    color: "#888",
    align: "center",
    baseline: "top",
  }, ctx, bounds(0, 55, W, 25), resources);

  // Main plant form
  const plantCx = W * 0.4, stemTop = 120;

  // Main stem
  ctx.strokeStyle = "#5a7a3a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(plantCx, stemTop);
  ctx.bezierCurveTo(plantCx - 20, H * 0.4, plantCx + 10, H * 0.6, plantCx - 5, H * 0.85);
  ctx.stroke();

  // Leaves on stem
  const leafPositions = [
    { x: plantCx - 10, y: 200, angle: -0.6, w: 40, h: 80 },
    { x: plantCx + 15, y: 280, angle: 0.5, w: 35, h: 70 },
    { x: plantCx - 20, y: 370, angle: -0.4, w: 45, h: 90 },
    { x: plantCx + 10, y: 450, angle: 0.3, w: 30, h: 65 },
  ];

  for (const lp of leafPositions) {
    drawLeaf(ctx, lp.x, lp.y, lp.w, lp.h, lp.angle, "#4a7a3a");
  }

  // Flower at top
  const fx = plantCx + 10, fy = stemTop + 30;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.translate(fx + Math.cos(angle) * 20, fy + Math.sin(angle) * 20);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = "rgba(230,180,190,0.7)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(200,100,120,0.5)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = "#e8c040";
  ctx.beginPath();
  ctx.arc(fx, fy, 5, 0, Math.PI * 2);
  ctx.fill();

  // Annotation callout lines + labels
  const annotations = [
    { from: { x: fx, y: fy - 25 }, to: { x: W * 0.72, y: fy - 25 }, text: "Petal (5, obovate)" },
    { from: { x: fx, y: fy }, to: { x: W * 0.72, y: fy + 10 }, text: "Stamens (numerous)" },
    { from: { x: leafPositions[0].x, y: leafPositions[0].y }, to: { x: W * 0.72, y: leafPositions[0].y }, text: "Compound leaf (5-7 leaflets)" },
    { from: { x: plantCx, y: 500 }, to: { x: W * 0.72, y: 500 }, text: "Prickly stem (curved thorns)" },
  ];

  for (const ann of annotations) {
    ctx.strokeStyle = "rgba(150,100,100,0.4)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(ann.from.x, ann.from.y);
    ctx.lineTo(ann.to.x, ann.to.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Small dot at from
    ctx.fillStyle = "rgba(200,50,50,0.5)";
    ctx.beginPath();
    ctx.arc(ann.from.x, ann.from.y, 2, 0, Math.PI * 2);
    ctx.fill();

    textLayerType.render({
      ...textLayerType.createDefault(),
      text: ann.text,
      fontFamily: "Georgia",
      fontSize: 11,
      color: "#555",
      align: "left",
      baseline: "top",
    }, ctx, bounds(ann.to.x + 5, ann.to.y - 6, 200, 20), resources);
  }

  // Construction envelope (dashed)
  envelopeLayerType.render({
    ...envelopeLayerType.createDefault(),
    envelopePath: JSON.stringify([
      { x: 0.25, y: 0.12 }, { x: 0.55, y: 0.12 },
      { x: 0.58, y: 0.5 }, { x: 0.52, y: 0.88 },
      { x: 0.3, y: 0.88 }, { x: 0.22, y: 0.5 },
    ]),
    envelopeStyle: "loose",
    showAngles: false,
    showPlumbLine: true,
    showSubdivisions: false,
  }, ctx, full(W, H), resources);

  save(c, "04-labeled-specimen.png");
}

// ─── Scene 5: Seed Pod Grid ─────────────────────────────────────────────────

function renderSeedPodGrid() {
  console.log("Scene 5: Seed Pod Grid");
  const cellW = 250, cellH = 250;

  const pods = [
    { label: "Sphere pod", formType: "sphere", size: 0.3 },
    { label: "Egg pod", formType: "egg", size: 0.28 },
    { label: "Cone pod", formType: "cone", size: 0.3 },
    { label: "Cylinder pod", formType: "cylinder", size: 0.25 },
    { label: "Wedge seed", formType: "wedge", size: 0.28 },
    { label: "Box capsule", formType: "box", size: 0.22 },
  ];

  const cells = pods.map((pod) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f2";
    ctx.fillRect(0, 0, cellW, cellH);

    formLayerType.render({
      ...formLayerType.createDefault(),
      formType: pod.formType,
      position: { x: 0.5, y: 0.5 },
      formSize: pod.size,
      rotationX: 15,
      rotationY: 25,
      rotationZ: 0,
      showCrossContours: true,
      crossContourCount: 4,
      showAxes: false,
      showHiddenEdges: true,
      hiddenEdgeStyle: "dashed",
    }, ctx, full(cellW, cellH), resources);

    return { label: pod.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Seed Pod Grid — Geometric Forms with Cross-Contours", cells, 3, cellW, cellH, 16);
  save(canvas, "05-seed-pod-grid.png");
}

// ─── Scene 6: Botanical Plate (contact sheet) ───────────────────────────────

function renderBotanicalPlate() {
  console.log("Scene 6: Botanical Plate");
  const thumbW = 400, thumbH = 300;

  const files = [
    "01-leaf-forms.png",
    "02-flower-construction.png",
    "03-textured-plate.png",
    "04-labeled-specimen.png",
    "05-seed-pod-grid.png",
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
  ctx.fillText("Botanical Illustrations — Leaves, Flowers, Textures, Labels & Seeds", padding, gH - 12);

  save(canvas, "botanical-plate.png");
}

// ─── Run all ─────────────────────────────────────────────────────────────────

console.log("\nBotanical Illustrations — Multi-Plugin Botanical Plates\n");

renderLeafForms();
renderFlowerConstruction();
renderTexturedPlate();
renderLabeledSpecimen();
renderSeedPodGrid();
renderBotanicalPlate();

console.log("\nDone! All renders saved to renders/\n");
