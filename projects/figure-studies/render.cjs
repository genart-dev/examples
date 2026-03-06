/**
 * Figure Studies — Life drawing demos
 *
 * 1. "Mannequin Styles"     — same pose rendered in all 5 styles
 * 2. "Gesture Drawing"      — quick gesture lines with varying energy
 * 3. "Proportion Systems"   — side-by-side comparison of 7 proportion systems
 * 4. "Head Construction"    — Loomis head from multiple angles
 * 5. "Posed Skeletons"      — skeleton layer with color modes and styles
 * 6. "Figure Sheet"         — contact sheet combining all studies
 *
 * Plugins used:
 *   - @genart-dev/plugin-figure  (mannequinLayerType, gestureLayerType, headLayerType, proportionGridLayerType)
 *   - @genart-dev/plugin-poses   (skeletonLayerType, annotationsLayerType)
 *
 * Output: renders/01-mannequin-styles.png .. renders/figure-sheet.png
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
  mannequinLayerType,
  gestureLayerType,
  headLayerType,
  proportionGridLayerType,
  PROPORTION_SYSTEMS,
} = require("../../../plugin-figure/dist/index.cjs");

const {
  skeletonLayerType,
} = require("../../../plugin-poses/dist/index.cjs");

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

// --- Pose data (normalized 0-1) ---

const STANDING_POSE = {
  nose: { x: 0.50, y: 0.06 }, neck: { x: 0.50, y: 0.10 },
  rShoulder: { x: 0.42, y: 0.14 }, rElbow: { x: 0.38, y: 0.26 }, rWrist: { x: 0.36, y: 0.38 },
  lShoulder: { x: 0.58, y: 0.14 }, lElbow: { x: 0.62, y: 0.26 }, lWrist: { x: 0.64, y: 0.38 },
  midHip: { x: 0.50, y: 0.46 },
  rHip: { x: 0.46, y: 0.46 }, rKnee: { x: 0.44, y: 0.64 }, rAnkle: { x: 0.43, y: 0.82 },
  lHip: { x: 0.54, y: 0.46 }, lKnee: { x: 0.56, y: 0.64 }, lAnkle: { x: 0.57, y: 0.82 },
  rEye: { x: 0.48, y: 0.05 }, lEye: { x: 0.52, y: 0.05 },
  rEar: { x: 0.46, y: 0.06 }, lEar: { x: 0.54, y: 0.06 },
  lBigToe: { x: 0.58, y: 0.86 }, lSmallToe: { x: 0.56, y: 0.86 }, lHeel: { x: 0.57, y: 0.84 },
  rBigToe: { x: 0.42, y: 0.86 }, rSmallToe: { x: 0.44, y: 0.86 }, rHeel: { x: 0.43, y: 0.84 },
};

const SITTING_POSE = {
  nose: { x: 0.50, y: 0.08 }, neck: { x: 0.50, y: 0.14 },
  rShoulder: { x: 0.40, y: 0.18 }, rElbow: { x: 0.34, y: 0.30 }, rWrist: { x: 0.30, y: 0.42 },
  lShoulder: { x: 0.60, y: 0.18 }, lElbow: { x: 0.66, y: 0.30 }, lWrist: { x: 0.70, y: 0.42 },
  midHip: { x: 0.50, y: 0.48 },
  rHip: { x: 0.44, y: 0.48 }, rKnee: { x: 0.34, y: 0.60 }, rAnkle: { x: 0.34, y: 0.80 },
  lHip: { x: 0.56, y: 0.48 }, lKnee: { x: 0.66, y: 0.60 }, lAnkle: { x: 0.66, y: 0.80 },
  rEye: { x: 0.48, y: 0.07 }, lEye: { x: 0.52, y: 0.07 },
  rEar: { x: 0.46, y: 0.08 }, lEar: { x: 0.54, y: 0.08 },
  lBigToe: { x: 0.67, y: 0.84 }, lSmallToe: { x: 0.65, y: 0.84 }, lHeel: { x: 0.66, y: 0.82 },
  rBigToe: { x: 0.33, y: 0.84 }, rSmallToe: { x: 0.35, y: 0.84 }, rHeel: { x: 0.34, y: 0.82 },
};

const DYNAMIC_POSE = {
  nose: { x: 0.48, y: 0.08 }, neck: { x: 0.48, y: 0.13 },
  rShoulder: { x: 0.38, y: 0.16 }, rElbow: { x: 0.28, y: 0.22 }, rWrist: { x: 0.20, y: 0.16 },
  lShoulder: { x: 0.58, y: 0.16 }, lElbow: { x: 0.68, y: 0.10 }, lWrist: { x: 0.76, y: 0.06 },
  midHip: { x: 0.50, y: 0.44 },
  rHip: { x: 0.44, y: 0.44 }, rKnee: { x: 0.36, y: 0.60 }, rAnkle: { x: 0.30, y: 0.78 },
  lHip: { x: 0.56, y: 0.44 }, lKnee: { x: 0.64, y: 0.56 }, lAnkle: { x: 0.72, y: 0.70 },
  rEye: { x: 0.46, y: 0.07 }, lEye: { x: 0.50, y: 0.07 },
  rEar: { x: 0.44, y: 0.08 }, lEar: { x: 0.52, y: 0.08 },
  lBigToe: { x: 0.74, y: 0.74 }, lSmallToe: { x: 0.72, y: 0.74 }, lHeel: { x: 0.72, y: 0.72 },
  rBigToe: { x: 0.28, y: 0.82 }, rSmallToe: { x: 0.30, y: 0.82 }, rHeel: { x: 0.30, y: 0.80 },
};

// Helper: render a labeled grid
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

// ─── Scene 1: Mannequin Styles ──────────────────────────────────────────────

function renderMannequinStyles() {
  console.log("Scene 1: Mannequin Styles");
  const cellW = 250, cellH = 400;
  const methods = ["stick", "bean", "blocks", "loomis", "anatomy"];

  const cells = methods.map((method) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, 0, cellW, cellH);

    mannequinLayerType.render({
      ...mannequinLayerType.createDefault(),
      keypoints: JSON.stringify(STANDING_POSE),
      method,
      showJoints: true,
      showSymmetryLine: method === "loomis",
      showCenterOfGravity: method === "anatomy",
    }, ctx, full(cellW, cellH), resources);

    return { label: method.charAt(0).toUpperCase() + method.slice(1), canvas: c };
  });

  const canvas = renderLabeledGrid("Mannequin Styles — Same Pose, 5 Methods", cells, 5, cellW, cellH, 16);
  save(canvas, "01-mannequin-styles.png");
}

// ─── Scene 2: Gesture Drawing ───────────────────────────────────────────────

function renderGestureDrawing() {
  console.log("Scene 2: Gesture Drawing");
  const cellW = 300, cellH = 450;

  const gestures = [
    {
      label: "Straight (head to feet)",
      lineOfAction: [{ x: 0.5, y: 0.05 }, { x: 0.5, y: 0.3 }, { x: 0.5, y: 0.6 }, { x: 0.5, y: 0.9 }],
      rhythmCurves: [
        { points: [{ x: 0.35, y: 0.15 }, { x: 0.4, y: 0.3 }, { x: 0.35, y: 0.45 }], label: "torso" },
      ],
      curveStyle: "smooth",
    },
    {
      label: "S-Curve (contrapposto)",
      lineOfAction: [{ x: 0.5, y: 0.05 }, { x: 0.55, y: 0.25 }, { x: 0.45, y: 0.55 }, { x: 0.5, y: 0.9 }],
      rhythmCurves: [
        { points: [{ x: 0.35, y: 0.12 }, { x: 0.38, y: 0.3 }, { x: 0.42, y: 0.45 }], label: "torso R" },
        { points: [{ x: 0.58, y: 0.12 }, { x: 0.55, y: 0.3 }, { x: 0.52, y: 0.45 }], label: "torso L" },
      ],
      curveStyle: "smooth",
    },
    {
      label: "Angular (action pose)",
      lineOfAction: [{ x: 0.45, y: 0.05 }, { x: 0.5, y: 0.2 }, { x: 0.55, y: 0.4 }, { x: 0.4, y: 0.7 }, { x: 0.35, y: 0.9 }],
      rhythmCurves: [
        { points: [{ x: 0.3, y: 0.15 }, { x: 0.35, y: 0.35 }], label: "arm R" },
        { points: [{ x: 0.65, y: 0.15 }, { x: 0.7, y: 0.08 }], label: "arm L" },
      ],
      curveStyle: "angular",
    },
    {
      label: "Organic (flowing)",
      lineOfAction: [{ x: 0.55, y: 0.05 }, { x: 0.5, y: 0.2 }, { x: 0.45, y: 0.4 }, { x: 0.5, y: 0.6 }, { x: 0.55, y: 0.8 }, { x: 0.5, y: 0.95 }],
      rhythmCurves: [
        { points: [{ x: 0.35, y: 0.1 }, { x: 0.3, y: 0.25 }, { x: 0.35, y: 0.4 }], label: "C-curve" },
        { points: [{ x: 0.6, y: 0.5 }, { x: 0.65, y: 0.65 }, { x: 0.6, y: 0.8 }], label: "leg" },
      ],
      curveStyle: "organic",
    },
    {
      label: "Tapered (no taper)",
      lineOfAction: [{ x: 0.5, y: 0.05 }, { x: 0.55, y: 0.25 }, { x: 0.45, y: 0.55 }, { x: 0.5, y: 0.9 }],
      rhythmCurves: [],
      curveStyle: "smooth",
      taper: false,
    },
    {
      label: "Full taper",
      lineOfAction: [{ x: 0.5, y: 0.05 }, { x: 0.55, y: 0.25 }, { x: 0.45, y: 0.55 }, { x: 0.5, y: 0.9 }],
      rhythmCurves: [],
      curveStyle: "smooth",
      taper: true,
      taperAmount: 1.0,
    },
  ];

  const cells = gestures.map((g) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, 0, cellW, cellH);

    gestureLayerType.render({
      ...gestureLayerType.createDefault(),
      lineOfAction: JSON.stringify(g.lineOfAction),
      rhythmCurves: JSON.stringify(g.rhythmCurves),
      curveStyle: g.curveStyle,
      taper: g.taper !== undefined ? g.taper : true,
      taperAmount: g.taperAmount !== undefined ? g.taperAmount : 0.7,
      showLineOfAction: true,
      showRhythmCurves: true,
    }, ctx, full(cellW, cellH), resources);

    return { label: g.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Gesture Drawing — Line of Action & Rhythm", cells, 3, cellW, cellH, 16);
  save(canvas, "02-gesture-drawing.png");
}

// ─── Scene 3: Proportion Systems ────────────────────────────────────────────

function renderProportionSystems() {
  console.log("Scene 3: Proportion Systems");
  const cellW = 200, cellH = 500;

  const systemIds = Object.keys(PROPORTION_SYSTEMS);

  const cells = systemIds.map((id) => {
    const sys = PROPORTION_SYSTEMS[id];
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, 0, cellW, cellH);

    proportionGridLayerType.render({
      ...proportionGridLayerType.createDefault(),
      system: id,
      showLabels: true,
      showLandmarks: true,
      showCenterLine: true,
      showWidthGuides: true,
      figureHeight: 0.9,
    }, ctx, full(cellW, cellH), resources);

    return { label: `${sys.label} (${sys.headUnits}h)`, canvas: c };
  });

  const canvas = renderLabeledGrid("Proportion Systems — 7 Standards", cells, 7, cellW, cellH, 12);
  save(canvas, "03-proportion-systems.png");
}

// ─── Scene 4: Head Construction ─────────────────────────────────────────────

function renderHeadConstruction() {
  console.log("Scene 4: Head Construction");
  const cellW = 300, cellH = 350;

  const views = [
    { label: "Front", tiltX: 0, tiltY: 0, tiltZ: 0, method: "loomis" },
    { label: "3/4 Right", tiltX: 0, tiltY: 30, tiltZ: 0, method: "loomis" },
    { label: "3/4 Left", tiltX: 0, tiltY: -30, tiltZ: 0, method: "loomis" },
    { label: "Profile Right", tiltX: 0, tiltY: 60, tiltZ: 0, method: "loomis" },
    { label: "Looking Down", tiltX: 20, tiltY: 15, tiltZ: 0, method: "loomis" },
    { label: "Looking Up", tiltX: -25, tiltY: 15, tiltZ: 0, method: "loomis" },
    { label: "Tilted", tiltX: 5, tiltY: 15, tiltZ: 15, method: "loomis" },
    { label: "Asaro Front", tiltX: 0, tiltY: 10, tiltZ: 0, method: "asaro" },
    { label: "Simple Front", tiltX: 0, tiltY: 15, tiltZ: 0, method: "simple" },
  ];

  const cells = views.map((v) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, 0, cellW, cellH);

    headLayerType.render({
      ...headLayerType.createDefault(),
      position: { x: 0.5, y: 0.4 },
      headSize: 0.35,
      tiltX: v.tiltX,
      tiltY: v.tiltY,
      tiltZ: v.tiltZ,
      method: v.method,
      showCrossLines: true,
      showJawPlane: true,
      showEyeLine: true,
      showNoseLine: true,
      showChinLine: true,
      showEarLine: true,
      showBrowLine: true,
      showHairline: v.method === "loomis",
    }, ctx, full(cellW, cellH), resources);

    return { label: v.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Head Construction — Loomis, Asaro, Simple", cells, 3, cellW, cellH, 16);
  save(canvas, "04-head-construction.png");
}

// ─── Scene 5: Posed Skeletons ───────────────────────────────────────────────

function renderPosedSkeletons() {
  console.log("Scene 5: Posed Skeletons");
  const cellW = 300, cellH = 450;

  const variations = [
    {
      label: "Stick — Uniform",
      pose: STANDING_POSE, poseLabel: "Standing",
      skeletonStyle: "stick", colorMode: "uniform", jointStyle: "circle",
    },
    {
      label: "Stick — Left/Right",
      pose: STANDING_POSE, poseLabel: "Standing",
      skeletonStyle: "stick", colorMode: "left-right", jointStyle: "circle",
    },
    {
      label: "Stick — Limb Groups",
      pose: STANDING_POSE, poseLabel: "Standing",
      skeletonStyle: "stick", colorMode: "limb-groups", jointStyle: "diamond",
    },
    {
      label: "Proportional — Sitting",
      pose: SITTING_POSE, poseLabel: "Sitting",
      skeletonStyle: "proportional", colorMode: "uniform", jointStyle: "circle",
    },
    {
      label: "Silhouette — Sitting",
      pose: SITTING_POSE, poseLabel: "Sitting",
      skeletonStyle: "silhouette", colorMode: "left-right", jointStyle: "none",
    },
    {
      label: "Proportional — Dynamic",
      pose: DYNAMIC_POSE, poseLabel: "Dynamic",
      skeletonStyle: "proportional", colorMode: "rainbow", jointStyle: "circle",
    },
  ];

  const cells = variations.map((v) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, 0, cellW, cellH);

    const poseData = {
      keypoints: v.pose,
      source: "custom",
      label: v.poseLabel,
    };

    skeletonLayerType.render({
      ...skeletonLayerType.createDefault(),
      poseData: JSON.stringify(poseData),
      skeletonStyle: v.skeletonStyle,
      colorMode: v.colorMode,
      jointStyle: v.jointStyle,
      jointRadius: 6,
      limbWidth: 3,
      poseLabel: v.poseLabel,
      showBoundingBox: false,
    }, ctx, full(cellW, cellH), resources);

    return { label: v.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Posed Skeletons — Styles & Color Modes", cells, 3, cellW, cellH, 16);
  save(canvas, "05-posed-skeletons.png");
}

// ─── Scene 6: Figure Sheet (contact sheet) ──────────────────────────────────

function renderFigureSheet() {
  console.log("Scene 6: Figure Sheet");
  const thumbW = 400, thumbH = 300;

  const files = [
    "01-mannequin-styles.png",
    "02-gesture-drawing.png",
    "03-proportion-systems.png",
    "04-head-construction.png",
    "05-posed-skeletons.png",
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
  ctx.fillText("Figure Studies — Life Drawing Demos", padding, gH - 12);

  save(canvas, "figure-sheet.png");
}

// ─── Run all ─────────────────────────────────────────────────────────────────

console.log("\nFigure Studies — Life Drawing Demos\n");

renderMannequinStyles();
renderGestureDrawing();
renderProportionSystems();
renderHeadConstruction();
renderPosedSkeletons();
renderFigureSheet();

console.log("\nDone! All renders saved to renders/\n");
