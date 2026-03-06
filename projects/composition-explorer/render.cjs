/**
 * Composition Explorer — Visual demos of all 10 composition guide types
 *
 * 1. "Classical Systems"    — 3×2 grid comparing 6 painting composition systems
 * 2. "Flow Analysis"       — 5 flow path patterns with numbered waypoints
 * 3. "Safe Zones"          — 5 safe margin presets side by side
 * 4. "Musical Harmony"     — 4 musical ratio systems with colored bands
 * 5. "Spiral Orientations" — Golden spiral in all 4 orientations
 */

"use strict";

const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const {
  goldenSpiralGuideLayerType,
  goldenTriangleGuideLayerType,
  armatureGuideLayerType,
  rabatmentGuideLayerType,
  safeMarginsGuideLayerType,
  flowPathGuideLayerType,
  musicalRatiosGuideLayerType,
  dynamicSymmetryGuideLayerType,
  phiGridGuideLayerType,
  diagonalGridGuideLayerType,
} = require("../../../plugin-layout-composition/dist/index.cjs");

// ─── Shared setup ───────────────────────────────────────────────────────────

const outDir = path.join(__dirname, "renders");
fs.mkdirSync(outDir, { recursive: true });

const BG = "#1a1a2e";
const GUIDE_COLOR = "rgba(0,200,255,0.5)";
const LABEL_COLOR = "rgba(255,255,255,0.85)";
const PANEL_W = 1200;
const PANEL_H = 800;
const resources = { getFont: () => null, getImage: () => null, theme: "dark", pixelRatio: 1 };

function save(canvas, name) {
  const buf = canvas.toBuffer("image/png");
  const out = path.join(outDir, name);
  fs.writeFileSync(out, buf);
  console.log(`  ✓ ${name} (${buf.length} bytes)`);
}

function bounds(x, y, w, h) {
  return { x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 };
}

function fillBg(ctx, w, h) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
}

function drawLabel(ctx, text, x, y, fontSize = 16) {
  ctx.save();
  ctx.fillStyle = LABEL_COLOR;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawTitle(ctx, title, w) {
  drawLabel(ctx, title, w / 2, 35, 22);
}

function drawPanelBorder(ctx, x, y, w, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

// ─── Still-life scene elements (individual shapes placed at focal points) ────

const SCENE_ELEMENTS = [
  // Vase
  (ctx, cx, cy, s) => {
    ctx.fillStyle = "rgba(180,80,60,0.6)";
    const vw = 24 * s, vh = 40 * s;
    ctx.fillRect(cx - vw / 2, cy - vh / 2, vw, vh);
    ctx.beginPath();
    ctx.ellipse(cx, cy - vh / 2, vw / 2 + 3 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(200,100,70,0.6)";
    ctx.fill();
  },
  // Fruit (orange circle)
  (ctx, cx, cy, s) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 14 * s, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,180,50,0.7)";
    ctx.fill();
  },
  // Leaf
  (ctx, cx, cy, s) => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18 * s, 7 * s, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(80,200,80,0.55)";
    ctx.fill();
  },
  // Blue bowl
  (ctx, cx, cy, s) => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 20 * s, 10 * s, 0, 0, Math.PI);
    ctx.fillStyle = "rgba(60,120,200,0.5)";
    ctx.fill();
  },
  // Small red apple
  (ctx, cx, cy, s) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 10 * s, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(220,60,60,0.6)";
    ctx.fill();
  },
];

function drawSceneElement(ctx, idx, cx, cy, scale) {
  ctx.save();
  SCENE_ELEMENTS[idx % SCENE_ELEMENTS.length](ctx, cx, cy, scale);
  ctx.restore();
}

// Focal points for each composition system (normalized 0-1 within the cell)
// w = importance weight: 1.0 = primary subject, smaller = supporting elements
function getFocalPoints(systemName) {
  switch (systemName) {
    case "Golden Spiral":
      return [{ x: 0.62, y: 0.62, w: 1.0 }, { x: 0.38, y: 0.38, w: 0.6 }, { x: 0.75, y: 0.3, w: 0.4 }];
    case "Golden Triangle":
      return [{ x: 0.3, y: 0.55, w: 1.0 }, { x: 0.7, y: 0.25, w: 0.65 }, { x: 0.5, y: 0.75, w: 0.4 }];
    case "Harmonic Armature":
      return [{ x: 0.33, y: 0.33, w: 1.0 }, { x: 0.67, y: 0.33, w: 0.7 }, { x: 0.5, y: 0.67, w: 0.5 }];
    case "Rabatment":
      return [{ x: 0.25, y: 0.5, w: 1.0 }, { x: 0.75, y: 0.5, w: 0.7 }, { x: 0.5, y: 0.35, w: 0.45 }];
    case "Dynamic Symmetry":
      return [{ x: 0.3, y: 0.7, w: 1.0 }, { x: 0.7, y: 0.3, w: 0.65 }, { x: 0.5, y: 0.5, w: 0.4 }];
    case "Phi Grid":
      return [{ x: 0.382, y: 0.382, w: 1.0 }, { x: 0.618, y: 0.618, w: 0.7 }, { x: 0.618, y: 0.382, w: 0.45 }];
    default:
      return [{ x: 0.5, y: 0.5, w: 1.0 }];
  }
}

// ─── 1. Classical Composition Systems ─────────────────────────────────────────

function renderClassicalSystems() {
  const canvas = createCanvas(PANEL_W, PANEL_H);
  const ctx = canvas.getContext("2d");
  fillBg(ctx, PANEL_W, PANEL_H);
  drawTitle(ctx, "Classical Painting Composition Systems", PANEL_W);

  const cols = 3, rows = 2;
  const margin = 30;
  const topOffset = 55;
  const cellW = (PANEL_W - margin * (cols + 1)) / cols;
  const cellH = (PANEL_H - topOffset - margin * (rows + 1)) / rows;

  const systems = [
    { name: "Golden Spiral", type: goldenSpiralGuideLayerType, props: { orientation: "top-left", showRectangles: true, turns: 8 } },
    { name: "Golden Triangle", type: goldenTriangleGuideLayerType, props: { mirror: false, showIntersections: true, intersectionRadius: 5 } },
    { name: "Harmonic Armature", type: armatureGuideLayerType, props: { variant: "major", showIntersections: true, intersectionRadius: 5 } },
    { name: "Rabatment", type: rabatmentGuideLayerType, props: { showFill: true, fillColor: "rgba(0,200,255,0.08)" } },
    { name: "Dynamic Symmetry", type: dynamicSymmetryGuideLayerType, props: { rootRectangle: "phi", showBaroqueDiagonal: true, showSinisterDiagonal: true, showReciprocals: true, showIntersections: true, intersectionRadius: 5 } },
    { name: "Phi Grid", type: phiGridGuideLayerType, props: { showIntersections: true, intersectionRadius: 5 } },
  ];

  systems.forEach((sys, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const px = margin + col * (cellW + margin);
    const py = topOffset + margin + row * (cellH + margin);

    // Panel background
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(px, py, cellW, cellH);
    drawPanelBorder(ctx, px, py, cellW, cellH);

    // Draw scene elements at composition-specific focal points
    // Scale relative to cell size so elements look proportional in the panel
    const baseScale = Math.min(cellW, cellH) / 200;
    const focals = getFocalPoints(sys.name);
    focals.forEach((fp, fi) => {
      drawSceneElement(ctx, fi, px + cellW * fp.x, py + cellH * fp.y, baseScale * fp.w);
    });

    // Render the guide overlay
    const props = { ...sys.props, guideColor: GUIDE_COLOR, lineWidth: 1.5, dashPattern: "6,4" };
    sys.type.render(props, ctx, bounds(px, py, cellW, cellH), resources);

    // Label
    drawLabel(ctx, sys.name, px + cellW / 2, py + cellH + 18, 13);
  });

  save(canvas, "classical-systems.png");
}

// ─── 2. Flow Analysis ─────────────────────────────────────────────────────────

function renderFlowAnalysis() {
  const canvas = createCanvas(PANEL_W, PANEL_H);
  const ctx = canvas.getContext("2d");
  fillBg(ctx, PANEL_W, PANEL_H);
  drawTitle(ctx, "Eye Flow Path Patterns", PANEL_W);

  const patterns = ["s-curve", "z-pattern", "c-curve", "circular", "diagonal"];
  const cols = 5;
  const margin = 20;
  const topOffset = 55;
  const cellW = (PANEL_W - margin * (cols + 1)) / cols;
  const cellH = PANEL_H - topOffset - margin * 2 - 25;

  patterns.forEach((pattern, i) => {
    const px = margin + i * (cellW + margin);
    const py = topOffset + margin;

    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(px, py, cellW, cellH);
    drawPanelBorder(ctx, px, py, cellW, cellH);

    // Render flow path
    const props = {
      pattern,
      direction: "normal",
      showArrows: true,
      tension: 0.5,
      guideColor: GUIDE_COLOR,
      lineWidth: 2,
      dashPattern: "8,4",
    };
    flowPathGuideLayerType.render(props, ctx, bounds(px, py, cellW, cellH), resources);

    // Draw numbered waypoint circles along the path
    const waypoints = getFlowWaypoints(pattern, px, py, cellW, cellH);
    waypoints.forEach((wp, idx) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(wp.x, wp.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,100,50,0.8)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(idx + 1), wp.x, wp.y);
      ctx.restore();
    });

    drawLabel(ctx, pattern, px + cellW / 2, py + cellH + 20, 12);
  });

  save(canvas, "flow-analysis.png");
}

function getFlowWaypoints(pattern, x, y, w, h) {
  const s = (nx, ny) => ({ x: x + nx * w, y: y + ny * h });
  switch (pattern) {
    case "s-curve":
      return [s(0.1, 0.1), s(0.7, 0.25), s(0.9, 0.5), s(0.3, 0.75), s(0.9, 0.9)];
    case "z-pattern":
      return [s(0.1, 0.1), s(0.5, 0.1), s(0.9, 0.1), s(0.5, 0.5), s(0.1, 0.9), s(0.5, 0.9), s(0.9, 0.9)];
    case "c-curve":
      return [s(0.5, 0.1), s(0.85, 0.3), s(0.85, 0.7), s(0.5, 0.9)];
    case "circular":
      return [s(0.5, 0.15), s(0.85, 0.5), s(0.5, 0.85), s(0.15, 0.5)];
    case "diagonal":
      return [s(0.1, 0.1), s(0.35, 0.35), s(0.65, 0.65), s(0.9, 0.9)];
    default:
      return [];
  }
}

// ─── 3. Safe Zones ─────────────────────────────────────────────────────────────

function renderSafeZones() {
  const canvas = createCanvas(PANEL_W, PANEL_H);
  const ctx = canvas.getContext("2d");
  fillBg(ctx, PANEL_W, PANEL_H);
  drawTitle(ctx, "Safe Margin Presets", PANEL_W);

  const presets = [
    { name: "Title Safe (5%)", preset: "title-safe" },
    { name: "Action Safe (3.5%)", preset: "action-safe" },
    { name: "Broadcast", preset: "broadcast" },
    { name: "Print Bleed (1%)", preset: "print-bleed" },
    { name: "Custom (15%)", preset: "custom", margin: 15 },
  ];

  const cols = 5;
  const margin = 20;
  const topOffset = 55;
  const cellW = (PANEL_W - margin * (cols + 1)) / cols;
  const cellH = PANEL_H - topOffset - margin * 2 - 25;

  presets.forEach((preset, i) => {
    const px = margin + i * (cellW + margin);
    const py = topOffset + margin;

    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(px, py, cellW, cellH);
    drawPanelBorder(ctx, px, py, cellW, cellH);

    // Shade the margin area (fill full cell, then clear the safe region)
    const props = {
      preset: preset.preset,
      margin: preset.margin ?? 10,
      guideColor: GUIDE_COLOR,
      lineWidth: 2,
      dashPattern: "6,4",
    };

    // Draw margin shading
    const margins = getPresetMargins(preset.preset, preset.margin ?? 10);
    for (const pct of margins) {
      const insetX = (cellW * pct) / 100;
      const insetY = (cellH * pct) / 100;
      ctx.save();
      ctx.fillStyle = "rgba(0,200,255,0.08)";

      // Top strip
      ctx.fillRect(px, py, cellW, insetY);
      // Bottom strip
      ctx.fillRect(px, py + cellH - insetY, cellW, insetY);
      // Left strip
      ctx.fillRect(px, py + insetY, insetX, cellH - 2 * insetY);
      // Right strip
      ctx.fillRect(px + cellW - insetX, py + insetY, insetX, cellH - 2 * insetY);
      ctx.restore();
    }

    // Render the guide lines on top
    safeMarginsGuideLayerType.render(props, ctx, bounds(px, py, cellW, cellH), resources);

    // "SAFE" label in center
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SAFE", px + cellW / 2, py + cellH / 2);
    ctx.restore();

    drawLabel(ctx, preset.name, px + cellW / 2, py + cellH + 20, 11);
  });

  save(canvas, "safe-zones.png");
}

function getPresetMargins(preset, customMargin) {
  switch (preset) {
    case "title-safe": return [5];
    case "action-safe": return [3.5];
    case "broadcast": return [3.5, 5];
    case "print-bleed": return [1];
    case "custom": return [customMargin];
    default: return [5];
  }
}

// ─── 4. Musical Harmony ────────────────────────────────────────────────────────

function renderMusicalHarmony() {
  const canvas = createCanvas(PANEL_W, PANEL_H);
  const ctx = canvas.getContext("2d");
  fillBg(ctx, PANEL_W, PANEL_H);
  drawTitle(ctx, "Musical Ratio Proportional Systems", PANEL_W);

  const ratios = [
    { name: "Diatessaron (3:4)", ratio: "diatessaron", positions: [3 / 7, 4 / 7] },
    { name: "Diapente (2:3)", ratio: "diapente", positions: [2 / 5, 3 / 5] },
    { name: "Diapason (1:2)", ratio: "diapason", positions: [1 / 3, 2 / 3] },
    { name: "Double Diatessaron (9:12:16)", ratio: "double-diatessaron", positions: [9 / 16, 12 / 16] },
  ];

  const cols = 4;
  const margin = 25;
  const topOffset = 55;
  const cellW = (PANEL_W - margin * (cols + 1)) / cols;
  const cellH = PANEL_H - topOffset - margin * 2 - 25;

  const bandColors = [
    "rgba(255,80,80,0.15)",
    "rgba(80,200,255,0.15)",
    "rgba(80,255,120,0.15)",
    "rgba(255,200,50,0.15)",
  ];

  ratios.forEach((r, i) => {
    const px = margin + i * (cellW + margin);
    const py = topOffset + margin;

    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(px, py, cellW, cellH);
    drawPanelBorder(ctx, px, py, cellW, cellH);

    // Draw colored bands between division lines
    const allPositions = [0, ...r.positions, 1];
    for (let j = 0; j < allPositions.length - 1; j++) {
      const y1 = py + cellH * allPositions[j];
      const y2 = py + cellH * allPositions[j + 1];
      ctx.fillStyle = bandColors[j % bandColors.length];
      ctx.fillRect(px, y1, cellW, y2 - y1);

      // Band ratio label
      const bandH = allPositions[j + 1] - allPositions[j];
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${Math.round(bandH * 100)}%`, px + cellW / 2, (y1 + y2) / 2);
      ctx.restore();
    }

    // Render the guide lines
    const props = {
      ratio: r.ratio,
      showBothAxes: true,
      guideColor: GUIDE_COLOR,
      lineWidth: 2,
      dashPattern: "8,4",
    };
    musicalRatiosGuideLayerType.render(props, ctx, bounds(px, py, cellW, cellH), resources);

    drawLabel(ctx, r.name, px + cellW / 2, py + cellH + 20, 11);
  });

  save(canvas, "musical-harmony.png");
}

// ─── 5. Spiral Orientations ────────────────────────────────────────────────────

function renderSpiralOrientations() {
  const canvas = createCanvas(PANEL_W, PANEL_H);
  const ctx = canvas.getContext("2d");
  fillBg(ctx, PANEL_W, PANEL_H);
  drawTitle(ctx, "Golden Spiral — All 4 Orientations", PANEL_W);

  const orientations = ["top-left", "top-right", "bottom-left", "bottom-right"];
  const cols = 2, rows = 2;
  const margin = 25;
  const topOffset = 55;
  const cellW = (PANEL_W - margin * (cols + 1)) / cols;
  const cellH = (PANEL_H - topOffset - margin * (rows + 1) - 20) / rows;

  // Pre-compute convergence points for each orientation
  const PHI = (1 + Math.sqrt(5)) / 2;

  orientations.forEach((orientation, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const px = margin + col * (cellW + margin);
    const py = topOffset + margin + row * (cellH + margin);

    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(px, py, cellW, cellH);
    drawPanelBorder(ctx, px, py, cellW, cellH);

    // Render spiral
    const props = {
      orientation,
      showRectangles: true,
      turns: 10,
      guideColor: GUIDE_COLOR,
      lineWidth: 1.5,
      dashPattern: "6,4",
    };
    goldenSpiralGuideLayerType.render(props, ctx, bounds(px, py, cellW, cellH), resources);

    // Compute convergence point and draw focal circle
    const convergence = getSpiralConvergence(orientation, px, py, cellW, cellH, PHI);
    ctx.save();
    ctx.beginPath();
    ctx.arc(convergence.x, convergence.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,100,50,0.7)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.restore();

    drawLabel(ctx, orientation, px + cellW / 2, py + cellH + 18, 13);
  });

  save(canvas, "spiral-orientations.png");
}

function getSpiralConvergence(orientation, x, y, w, h, PHI) {
  // The golden spiral converges at a point determined by the golden ratio
  // For a rectangle fitted to golden proportions:
  let gw, gh;
  if (w / h > PHI) {
    gh = h;
    gw = gh * PHI;
  } else {
    gw = w;
    gh = gw / PHI;
  }
  const ox = x + (w - gw) / 2;
  const oy = y + (h - gh) / 2;

  // The convergence point in golden rectangle coordinates
  const cx = gw / PHI / PHI; // ≈ 0.382 of width from the start corner
  const cy = gh / PHI / PHI;

  switch (orientation) {
    case "top-left":
      return { x: ox + gw - cx, y: oy + gh - cy };
    case "top-right":
      return { x: ox + cx, y: oy + gh - cy };
    case "bottom-left":
      return { x: ox + gw - cx, y: oy + cy };
    case "bottom-right":
      return { x: ox + cx, y: oy + cy };
    default:
      return { x: ox + gw / 2, y: oy + gh / 2 };
  }
}

// ─── Run all demos ──────────────────────────────────────────────────────────

async function main() {
  console.log("Composition Explorer — rendering demos...\n");

  renderClassicalSystems();
  renderFlowAnalysis();
  renderSafeZones();
  renderMusicalHarmony();
  renderSpiralOrientations();

  console.log("\nDone! All renders saved to renders/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
