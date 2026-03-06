/**
 * Abstractionist Series — 5 paintings using plugin-painting, plugin-textures, plugin-shapes
 *
 * 1. "Primordial Flux"   — vortex watercolor + washi, deep indigo/violet
 * 2. "Ochre Strata"      — oil impasto + canvas texture, warm earth bands
 * 3. "Verdant Turbulence"— ink over gouache washes, forest greens, noise field
 * 4. "Midnight Geometry" — charcoal + polygon/star shapes on rough paper
 * 5. "Chromatic Bloom"   — radial watercolor + pastel, vivid jewel tones
 */

"use strict";

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const {
  watercolorLayerType,
  oilAcrylicLayerType: oilLayerType,
  gouacheLayerType,
  inkLayerType,
  pastelLayerType,
  charcoalLayerType,
} = require("@genart-dev/plugin-painting");

const {
  paperLayerType,
  canvasLayerType,
  washiLayerType,
  noiseTextureLayerType,
} = require("@genart-dev/plugin-textures");

const {
  rectLayerType,
  ellipseLayerType,
  polygonLayerType,
  starLayerType,
  lineLayerType,
} = require("@genart-dev/plugin-shapes");

// ─── Shared setup ───────────────────────────────────────────────────────────

const W = 900;
const H = 1200; // portrait
const outDir = path.join(__dirname, "renders");
fs.mkdirSync(outDir, { recursive: true });

const resources = { getFont: () => null, getImage: () => null, theme: "light", pixelRatio: 1 };

function full() {
  return { x: 0, y: 0, width: W, height: H, rotation: 0, scaleX: 1, scaleY: 1 };
}

function rect(x, y, w, h) {
  return { x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 };
}

// ─── Painting 1: "Primordial Flux" ──────────────────────────────────────────
// Deep indigo/violet vortex watercolor, washi paper texture, floating ellipses

function painting1() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Background fill — deep midnight
  ctx.fillStyle = "#0d0a1a";
  ctx.fillRect(0, 0, W, H);

  // Washi texture — gives it a translucent paper feel
  washiLayerType.render(
    { ...washiLayerType.createDefault(), fiberDensity: 0.35, fiberLength: 120, color: "#1a1230", seed: 7 },
    ctx, full(), resources,
  );

  // Vortex watercolor — primary swirl, deep violet/indigo
  watercolorLayerType.render(
    {
      ...watercolorLayerType.createDefault(),
      field: "vortex:0.5:0.45:0.38",
      fieldCols: 24, fieldRows: 24,
      colors: JSON.stringify(["#2a1060", "#5a2d9e", "#8a4fcc", "#c482f4"]),
      dilution: 0.28, granulation: 0.55, edgeStyle: "lost",
      opacity: 0.92, seed: 11,
    },
    ctx, full(), resources,
  );

  // Second vortex layer — offset center, blue-violet bloom
  watercolorLayerType.render(
    {
      ...watercolorLayerType.createDefault(),
      field: "vortex:0.38:0.62:0.22",
      fieldCols: 18, fieldRows: 18,
      colors: JSON.stringify(["#1a2880", "#3d5fd4", "#90b0ff"]),
      dilution: 0.45, granulation: 0.3, edgeStyle: "diffuse",
      opacity: 0.6, seed: 77,
    },
    ctx, full(), resources,
  );

  // Radial bloom from top-left — warm contrast
  watercolorLayerType.render(
    {
      ...watercolorLayerType.createDefault(),
      field: "radial:0.12:0.15:diverge",
      fieldCols: 16, fieldRows: 16,
      colors: JSON.stringify(["#e040c8", "#f090e8"]),
      dilution: 0.6, granulation: 0.2, edgeStyle: "diffuse",
      opacity: 0.38, seed: 31,
      maskCenterY: 0.18, maskSpread: 0.15,
    },
    ctx, full(), resources,
  );

  // Ink vortex lines — define the swirl energy
  inkLayerType.render(
    {
      ...inkLayerType.createDefault(),
      field: "vortex:0.5:0.45:0.38",
      fieldCols: 28, fieldRows: 28,
      colors: JSON.stringify(["#c0a0ff"]),
      weight: 0.8, taper: "both", style: "fluid",
      opacity: 0.45, seed: 55,
    },
    ctx, full(), resources,
  );

  // Floating geometric ellipses — bokeh, varied sizes
  const ellipses = [
    // large diffuse background halos
    { x: 220, y: 260, w: 420, h: 300, fill: "#c482f4", alpha: 0.22 },
    { x: 380, y: 580, w: 340, h: 340, fill: "#3d5fd4", alpha: 0.20 },
    { x:  60, y: 620, w: 240, h: 380, fill: "#8a4fcc", alpha: 0.16 },
    { x: 540, y: 100, w: 300, h: 200, fill: "#e040c8", alpha: 0.24 },
    { x: 100, y: 920, w: 500, h: 180, fill: "#5a2d9e", alpha: 0.22 },
    // medium mid-layer
    { x: 650, y: 450, w: 180, h: 140, fill: "#a060f8", alpha: 0.28 },
    { x: 280, y: 800, w: 150, h: 150, fill: "#6040e0", alpha: 0.24 },
    { x: 500, y: 300, w: 130, h: 100, fill: "#d080ff", alpha: 0.30 },
    // small crisp bokeh dots
    { x: 760, y: 650, w:  60, h:  60, fill: "#f0c0ff", alpha: 0.50 },
    { x:  90, y: 380, w:  45, h:  45, fill: "#80a8ff", alpha: 0.55 },
    { x: 400, y:  80, w:  80, h:  55, fill: "#e060d8", alpha: 0.45 },
    { x: 680, y: 980, w:  50, h:  50, fill: "#c0a0ff", alpha: 0.50 },
    { x: 200, y: 1100, w: 35, h:  35, fill: "#9070e8", alpha: 0.60 },
    { x: 820, y: 320, w:  30, h:  30, fill: "#f080e0", alpha: 0.55 },
  ];
  for (const e of ellipses) {
    ctx.save();
    ctx.globalAlpha = e.alpha;
    ctx.globalCompositeOperation = "screen";
    ellipseLayerType.render(
      { ...ellipseLayerType.createDefault(), fillColor: e.fill, fillEnabled: true, strokeEnabled: false },
      ctx, rect(e.x, e.y, e.w, e.h), resources,
    );
    ctx.restore();
  }

  // Thin ink arcs — structural lines
  for (const lineData of [
    { x1: 0, y1: H * 0.33, x2: W, y2: H * 0.38, color: "#9060d0", w: 1.2 },
    { x1: 0, y1: H * 0.67, x2: W, y2: H * 0.70, color: "#6040a0", w: 0.7 },
  ]) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    const lb = rect(lineData.x1, lineData.y1, lineData.x2 - lineData.x1, lineData.y2 - lineData.y1);
    lineLayerType.render(
      { ...lineLayerType.createDefault(), strokeColor: lineData.color, strokeWidth: lineData.w },
      ctx, lb, resources,
    );
    ctx.restore();
  }

  // Title
  ctx.fillStyle = "rgba(200,160,255,0.55)";
  ctx.font = "italic 22px Georgia, serif";
  ctx.fillText("I. Primordial Flux", 36, H - 28);

  return canvas;
}

// ─── Painting 2: "Ochre Strata" ─────────────────────────────────────────────
// Oil impasto + canvas texture, warm earth tones, horizontal banding

function painting2() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Warm cream base
  ctx.fillStyle = "#f2e8d5";
  ctx.fillRect(0, 0, W, H);

  // Canvas texture — woven linen
  canvasLayerType.render(
    { ...canvasLayerType.createDefault(), weaveScale: 8, density: 0.5, roughness: 0.5, color: "#e8dcc8", seed: 3 },
    ctx, full(), resources,
  );

  // Stratum 1 — sky ochre (top) — +20% saturation/brightness
  oilLayerType.render(
    {
      ...oilLayerType.createDefault(),
      field: "linear:5:0.6",
      fieldCols: 22, fieldRows: 12,
      colors: JSON.stringify(["#e8b830", "#f5d040", "#fdeea0"]),
      impasto: true, scumble: false, blendRadius: 14,
      opacity: 0.95, seed: 10,
      maskCenterY: 0.18, maskSpread: 0.16,
    },
    ctx, full(), resources,
  );

  // Stratum 2 — sienna midband — +20%
  oilLayerType.render(
    {
      ...oilLayerType.createDefault(),
      field: "noise:3:0.12:2",
      fieldCols: 22, fieldRows: 14,
      colors: JSON.stringify(["#d4600a", "#e8842a", "#f5a060"]),
      impasto: true, scumble: true, blendRadius: 10,
      opacity: 0.96, seed: 20,
      maskCenterY: 0.44, maskSpread: 0.10,
    },
    ctx, full(), resources,
  );

  // Stratum 3 — raw umber lower-mid — +20%
  oilLayerType.render(
    {
      ...oilLayerType.createDefault(),
      field: "noise:88:0.08:3",
      fieldCols: 22, fieldRows: 14,
      colors: JSON.stringify(["#6e3610", "#906030", "#b08050"]),
      impasto: false, scumble: true, blendRadius: 8,
      opacity: 0.97, seed: 30,
      maskCenterY: 0.64, maskSpread: 0.09,
    },
    ctx, full(), resources,
  );

  // Stratum 4 — dark earth base — +20%
  oilLayerType.render(
    {
      ...oilLayerType.createDefault(),
      field: "linear:175:0.5",
      fieldCols: 22, fieldRows: 10,
      colors: JSON.stringify(["#3a2008", "#542e10"]),
      impasto: false, scumble: false, blendRadius: 6,
      opacity: 0.95, seed: 40,
      maskCenterY: 0.86, maskSpread: 0.12,
    },
    ctx, full(), resources,
  );

  // Geometric rects — strata dividers and abstract blocks
  const blocks = [
    { x: 0,   y: H * 0.30, w: W * 0.60, h: 6,  fill: "#8a4a18", alpha: 0.55 },
    { x: W*0.60, y: H * 0.30, w: W * 0.40, h: 6, fill: "#c08040", alpha: 0.40 },
    { x: 0,   y: H * 0.54, w: W,          h: 4,  fill: "#3a1a08", alpha: 0.65 },
    { x: 0,   y: H * 0.74, w: W,          h: 3,  fill: "#1e0e04", alpha: 0.55 },
    // Bold rectangles — Rothko-inspired floating fields — +20% alpha
    { x: 80,  y: H * 0.08, w: W - 160, h: H * 0.18, fill: "#f5c830", alpha: 0.34 },
    { x: 120, y: H * 0.35, w: W - 240, h: H * 0.17, fill: "#e06820", alpha: 0.28 },
    { x: 60,  y: H * 0.58, w: W - 120, h: H * 0.14, fill: "#8c4010", alpha: 0.34 },
    { x: 100, y: H * 0.78, w: W - 200, h: H * 0.16, fill: "#2a1006", alpha: 0.32 },
  ];
  for (const b of blocks) {
    ctx.save();
    ctx.globalAlpha = b.alpha;
    rectLayerType.render(
      { ...rectLayerType.createDefault(), fillColor: b.fill, fillEnabled: true, strokeEnabled: false, cornerRadius: 0 },
      ctx, rect(b.x, b.y, b.w, b.h === 6 || b.h === 4 || b.h === 3 ? b.h : b.h), resources,
    );
    ctx.restore();
  }

  // Impasto scumble accent — highlights top
  oilLayerType.render(
    {
      ...oilLayerType.createDefault(),
      field: "radial:0.5:0.0:diverge",
      fieldCols: 14, fieldRows: 10,
      colors: JSON.stringify(["#fff5cc", "#fce8a0"]),
      impasto: true, scumble: true, blendRadius: 20,
      opacity: 0.25, seed: 99,
      maskCenterY: 0.08, maskSpread: 0.07,
    },
    ctx, full(), resources,
  );

  ctx.fillStyle = "rgba(90,48,16,0.50)";
  ctx.font = "italic 22px Georgia, serif";
  ctx.fillText("II. Ochre Strata", 36, H - 28);

  return canvas;
}

// ─── Painting 3: "Verdant Turbulence" ───────────────────────────────────────
// Ink streamlines over gouache washes, forest greens, turbulent noise field

function painting3() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Off-white ground
  ctx.fillStyle = "#f0f4ec";
  ctx.fillRect(0, 0, W, H);

  // Cold-press paper
  paperLayerType.render(
    { ...paperLayerType.createDefault(), preset: "cold-press", roughness: -1, color: "#eef2e8", seed: 5 },
    ctx, full(), resources,
  );

  // Gouache base wash — deep forest
  gouacheLayerType.render(
    {
      ...gouacheLayerType.createDefault(),
      field: "noise:14:0.08:3",
      fieldCols: 20, fieldRows: 20,
      colors: JSON.stringify(["#1a4020", "#2a6030", "#3a8040"]),
      dryBrush: false, grain: 0.3,
      opacity: 0.80, seed: 14,
    },
    ctx, full(), resources,
  );

  // Watercolor mid-layer — lighter greens with texture
  watercolorLayerType.render(
    {
      ...watercolorLayerType.createDefault(),
      field: "noise:61:0.14:4",
      fieldCols: 24, fieldRows: 24,
      colors: JSON.stringify(["#4aaa50", "#70cc60", "#a8e898"]),
      dilution: 0.4, granulation: 0.5, edgeStyle: "diffuse",
      opacity: 0.55, seed: 61,
    },
    ctx, full(), resources,
  );

  // Gouache chartreuse highlights — sporadic blooms
  gouacheLayerType.render(
    {
      ...gouacheLayerType.createDefault(),
      field: "radial:0.7:0.3:diverge",
      fieldCols: 14, fieldRows: 14,
      colors: JSON.stringify(["#b8e040", "#d4f060"]),
      dryBrush: true, grain: 0.6,
      opacity: 0.40, seed: 33,
      maskCenterY: 0.28, maskSpread: 0.20,
    },
    ctx, full(), resources,
  );

  // Ink streamlines — turbulent noise, dark ink
  inkLayerType.render(
    {
      ...inkLayerType.createDefault(),
      field: "noise:14:0.08:3",
      fieldCols: 30, fieldRows: 30,
      colors: JSON.stringify(["#0a1e0d"]),
      weight: 1.2, taper: "tail", style: "fluid",
      opacity: 0.70, seed: 14,
    },
    ctx, full(), resources,
  );

  // Secondary ink layer — scratchy feel, offset seed
  inkLayerType.render(
    {
      ...inkLayerType.createDefault(),
      field: "noise:77:0.11:3",
      fieldCols: 26, fieldRows: 26,
      colors: JSON.stringify(["#1a3a10"]),
      weight: 0.7, taper: "both", style: "scratchy",
      opacity: 0.45, seed: 77,
    },
    ctx, full(), resources,
  );

  // Noise texture overlay — fractal green-on-green
  noiseTextureLayerType.render(
    { ...noiseTextureLayerType.createDefault(), type: "fractal", scale: 60, octaves: 4, colorA: "#c8e8c0", colorB: "#204018", seed: 9 },
    ctx, full(), resources,
  );
  // reduce opacity by drawing on top
  ctx.save();
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = "rgba(240,244,236,0)"; // transparent pass — noise already rendered
  ctx.restore();

  // Squares — big, 40% darker green, plus smaller accent polygons
  const polygons = [
    // large dark green squares (sides:4, rot:0 = axis-aligned)
    { x: 80,  y: 120, w: 260, h: 260, sides: 4, rot: 0,  fill: "#1a5c20", alpha: 0.62 },
    { x: 530, y: 360, w: 320, h: 320, sides: 4, rot: 0,  fill: "#175018", alpha: 0.58 },
    { x: 150, y: 700, w: 220, h: 220, sides: 4, rot: 0,  fill: "#1e6424", alpha: 0.55 },
    { x: 580, y: 820, w: 280, h: 280, sides: 4, rot: 0,  fill: "#134018", alpha: 0.60 },
    // smaller accent polygons
    { x: 660, y:  80, w:  80, h:  80, sides: 6, rot: 30, fill: "#7aaa28", alpha: 0.40 },
    { x: 320, y: 510, w: 100, h: 100, sides: 5, rot: 0,  fill: "#3a8030", alpha: 0.35 },
    { x:  60, y: 980, w:  90, h:  90, sides: 7, rot: 15, fill: "#2a6828", alpha: 0.38 },
    { x: 760, y: 640, w:  65, h:  65, sides: 4, rot: 20, fill: "#5a9840", alpha: 0.45 },
  ];
  for (const p of polygons) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.globalCompositeOperation = "multiply";
    polygonLayerType.render(
      { ...polygonLayerType.createDefault(), fillColor: p.fill, fillEnabled: true, strokeEnabled: false, sides: p.sides, rotation: p.rot },
      ctx, rect(p.x, p.y, p.w, p.h), resources,
    );
    ctx.restore();
  }

  ctx.fillStyle = "rgba(10,30,13,0.50)";
  ctx.font = "italic 22px Georgia, serif";
  ctx.fillText("III. Verdant Turbulence", 36, H - 28);

  return canvas;
}

// ─── Painting 4: "Midnight Geometry" ────────────────────────────────────────
// Charcoal vortex + stark polygons/stars on rough paper, high contrast

function painting4() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Near-white with warm undertone
  ctx.fillStyle = "#f5f1eb";
  ctx.fillRect(0, 0, W, H);

  // Rough paper — heavy tooth
  paperLayerType.render(
    { ...paperLayerType.createDefault(), preset: "rough", roughness: -1, color: "#f0ead8", seed: 21 },
    ctx, full(), resources,
  );

  // Charcoal vortex — primary mark
  charcoalLayerType.render(
    {
      ...charcoalLayerType.createDefault(),
      field: "vortex:0.5:0.5:0.42",
      fieldCols: 28, fieldRows: 28,
      colors: JSON.stringify(["#0e0c0a"]),
      density: 0.75, smear: true, grain: 0.65,
      opacity: 0.82, seed: 41,
    },
    ctx, full(), resources,
  );

  // Second charcoal — offset vortex, medium gray
  charcoalLayerType.render(
    {
      ...charcoalLayerType.createDefault(),
      field: "vortex:0.32:0.68:0.28",
      fieldCols: 22, fieldRows: 22,
      colors: JSON.stringify(["#2a2624"]),
      density: 0.55, smear: false, grain: 0.5,
      opacity: 0.55, seed: 63,
    },
    ctx, full(), resources,
  );

  // Noise charcoal — fills residual space with texture
  charcoalLayerType.render(
    {
      ...charcoalLayerType.createDefault(),
      field: "noise:99:0.18:3",
      fieldCols: 20, fieldRows: 20,
      colors: JSON.stringify(["#1a1714"]),
      density: 0.35, smear: false, grain: 0.70,
      opacity: 0.40, seed: 80,
    },
    ctx, full(), resources,
  );

  // Ink lines — structural geometry
  inkLayerType.render(
    {
      ...inkLayerType.createDefault(),
      field: "linear:90:1.0",
      fieldCols: 10, fieldRows: 40,
      colors: JSON.stringify(["#0a0806"]),
      weight: 0.6, taper: "none", style: "fluid",
      opacity: 0.28, seed: 15,
    },
    ctx, full(), resources,
  );

  // Big dark filled triangle — background anchor, rendered first
  ctx.save();
  ctx.globalAlpha = 0.88;
  polygonLayerType.render(
    { ...polygonLayerType.createDefault(), fillColor: "#050403", fillEnabled: true, strokeEnabled: false, sides: 3, rotation: 8 },
    ctx, rect(-80, 200, 900, 900), resources,
  );
  ctx.restore();

  // Stars — big center + 25% more small stars, ranging sizes
  const stars = [
    // dominant center star
    { x: 300, y: 430, w: 300, h: 300, pts: 5, inner: 0.40, rot: 0,  fill: "#f5f1eb", stroke: "#0e0c0a", sw: 2.5, alpha: 0.98 },
    // medium stars
    { x: 100, y: 120, w: 110, h: 110, pts: 8, inner: 0.38, rot: 22, fill: "#f5f1eb", stroke: "#1a1614", sw: 1.5, alpha: 0.90 },
    { x: 630, y: 200, w:  80, h:  80, pts: 6, inner: 0.45, rot: 0,  fill: "#e8e0d0", stroke: "#0e0c0a", sw: 1.0, alpha: 0.88 },
    { x: 710, y: 720, w:  95, h:  95, pts: 7, inner: 0.42, rot: 10, fill: "#ddd5c5", stroke: "#1a1614", sw: 1.5, alpha: 0.82 },
    { x: 490, y: 1040, w: 90, h:  90, pts: 6, inner: 0.48, rot: 30, fill: "#e4dccb", stroke: "#0e0c0a", sw: 1.2, alpha: 0.84 },
    // small stars — varied sizes
    { x: 155, y: 880, w:  55, h:  55, pts: 4, inner: 0.35, rot: 45, fill: "#f0e8d8", stroke: "#0e0c0a", sw: 1.0, alpha: 0.88 },
    { x: 760, y: 480, w:  42, h:  42, pts: 5, inner: 0.42, rot: 18, fill: "#ede5d4", stroke: "#1a1614", sw: 0.8, alpha: 0.80 },
    { x:  50, y: 620, w:  34, h:  34, pts: 6, inner: 0.45, rot: 60, fill: "#f0e8d8", stroke: "#0e0c0a", sw: 0.7, alpha: 0.75 },
    { x: 820, y: 970, w:  48, h:  48, pts: 5, inner: 0.40, rot: 36, fill: "#e8e0cf", stroke: "#1a1614", sw: 0.8, alpha: 0.78 },
    { x: 280, y: 1110, w: 30, h:  30, pts: 4, inner: 0.38, rot: 0,  fill: "#f5f0e5", stroke: "#0e0c0a", sw: 0.6, alpha: 0.72 },
    { x: 650, y:  80, w:  38, h:  38, pts: 7, inner: 0.44, rot: 25, fill: "#e0d8c8", stroke: "#1a1614", sw: 0.7, alpha: 0.76 },
    { x: 430, y: 280, w:  26, h:  26, pts: 5, inner: 0.40, rot: 54, fill: "#f0e8d8", stroke: "#0e0c0a", sw: 0.5, alpha: 0.70 },
    { x:  80, y: 1080, w: 44, h:  44, pts: 6, inner: 0.46, rot: 42, fill: "#ddd5c2", stroke: "#1a1614", sw: 0.8, alpha: 0.74 },
  ];
  for (const s of stars) {
    ctx.save();
    ctx.globalAlpha = s.alpha;
    starLayerType.render(
      {
        ...starLayerType.createDefault(),
        fillColor: s.fill, fillEnabled: true,
        strokeColor: s.stroke, strokeWidth: s.sw, strokeEnabled: s.sw > 0,
        points: s.pts, innerRadius: s.inner, rotation: s.rot,
      },
      ctx, rect(s.x, s.y, s.w, s.h), resources,
    );
    ctx.restore();
  }

  ctx.fillStyle = "rgba(14,12,10,0.45)";
  ctx.font = "italic 22px Georgia, serif";
  ctx.fillText("IV. Midnight Geometry", 36, H - 28);

  return canvas;
}

// ─── Painting 5: "Chromatic Bloom" ──────────────────────────────────────────
// Radial watercolor + pastel, jewel-tone palette, floral abstraction

function painting5() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Deep warm black base
  ctx.fillStyle = "#0a0708";
  ctx.fillRect(0, 0, W, H);

  // Subtle washi beneath
  washiLayerType.render(
    { ...washiLayerType.createDefault(), fiberDensity: 0.25, fiberLength: 90, color: "#100a0c", seed: 17 },
    ctx, full(), resources,
  );

  // Central radial bloom — magenta/coral, wider spread
  watercolorLayerType.render(
    {
      ...watercolorLayerType.createDefault(),
      field: "radial:0.5:0.48:diverge",
      fieldCols: 26, fieldRows: 26,
      colors: JSON.stringify(["#e01060", "#f04090", "#f880b8"]),
      dilution: 0.16, granulation: 0.50, edgeStyle: "diffuse",
      opacity: 0.92, seed: 22,
    },
    ctx, full(), resources,
  );

  // Secondary bloom — top-right, amber, broader mask
  watercolorLayerType.render(
    {
      ...watercolorLayerType.createDefault(),
      field: "radial:0.78:0.22:diverge",
      fieldCols: 20, fieldRows: 20,
      colors: JSON.stringify(["#e08010", "#f0b040", "#f8d880"]),
      dilution: 0.28, granulation: 0.38, edgeStyle: "diffuse",
      opacity: 0.72, seed: 44,
      maskCenterY: 0.20, maskSpread: 0.28,
    },
    ctx, full(), resources,
  );

  // Tertiary bloom — lower-left, teal, broader mask
  watercolorLayerType.render(
    {
      ...watercolorLayerType.createDefault(),
      field: "radial:0.22:0.78:diverge",
      fieldCols: 20, fieldRows: 20,
      colors: JSON.stringify(["#00a090", "#20c8a8", "#80e8d8"]),
      dilution: 0.30, granulation: 0.42, edgeStyle: "diffuse",
      opacity: 0.70, seed: 66,
      maskCenterY: 0.78, maskSpread: 0.28,
    },
    ctx, full(), resources,
  );

  // Vortex accent — indigo spiral, stronger
  watercolorLayerType.render(
    {
      ...watercolorLayerType.createDefault(),
      field: "vortex:0.5:0.48:0.35",
      fieldCols: 22, fieldRows: 22,
      colors: JSON.stringify(["#4020c0", "#7040e0", "#a878f8"]),
      dilution: 0.42, granulation: 0.28, edgeStyle: "lost",
      opacity: 0.55, seed: 88,
    },
    ctx, full(), resources,
  );

  // Pastel over the blooms — silky diffuse overlay
  pastelLayerType.render(
    {
      ...pastelLayerType.createDefault(),
      field: "noise:55:0.06:2",
      fieldCols: 16, fieldRows: 16,
      colors: JSON.stringify(["#ff80c8", "#ff60a0"]),
      softness: 0.75, buildup: 0.30, grain: 0.40,
      opacity: 0.28, seed: 55,
    },
    ctx, full(), resources,
  );

  // Bokeh ellipses — large halos + crisp small
  const bokehEllipses = [
    // large diffuse halos
    { x: 250, y: 380, w: 400, h: 400, fill: "#f04090", alpha: 0.14 },
    { x: 560, y:  80, w: 320, h: 240, fill: "#f8d880", alpha: 0.16 },
    { x:  30, y: 680, w: 350, h: 350, fill: "#80e8d8", alpha: 0.13 },
    { x: 500, y: 750, w: 280, h: 280, fill: "#a878f8", alpha: 0.15 },
    { x: 120, y: 120, w: 260, h: 180, fill: "#f04090", alpha: 0.12 },
    // medium
    { x: 680, y: 520, w: 160, h: 130, fill: "#f0b040", alpha: 0.22 },
    { x: 200, y: 950, w: 180, h: 120, fill: "#20c8a8", alpha: 0.20 },
    { x: 600, y: 300, w: 140, h: 140, fill: "#7040e0", alpha: 0.24 },
    // small crisp bokeh
    { x: 780, y: 820, w:  55, h:  55, fill: "#ff80c8", alpha: 0.55 },
    { x:  70, y: 440, w:  40, h:  40, fill: "#80ffee", alpha: 0.50 },
    { x: 450, y:  50, w:  65, h:  45, fill: "#ffcc40", alpha: 0.48 },
    { x: 820, y: 200, w:  35, h:  35, fill: "#c080ff", alpha: 0.55 },
    { x: 310, y: 1100, w: 48, h:  48, fill: "#ff60a0", alpha: 0.52 },
    { x: 660, y: 1060, w: 32, h:  32, fill: "#40e8d0", alpha: 0.50 },
    { x: 140, y: 1150, w: 28, h:  28, fill: "#ffa040", alpha: 0.55 },
    { x: 740, y: 420, w:  22, h:  22, fill: "#e080ff", alpha: 0.60 },
  ];
  for (const e of bokehEllipses) {
    ctx.save();
    ctx.globalAlpha = e.alpha;
    ctx.globalCompositeOperation = "screen";
    ellipseLayerType.render(
      { ...ellipseLayerType.createDefault(), fillColor: e.fill, fillEnabled: true, strokeEnabled: false },
      ctx, rect(e.x, e.y, e.w, e.h), resources,
    );
    ctx.restore();
  }

  // Stars — petal/bloom motifs in jewel tones, more shapes
  const bloomStars = [
    { x: 330, y: 410, w: 320, h: 320, pts: 8, inner: 0.55, rot: 22, fill: "#f04090", alpha: 0.22 },
    { x: 390, y: 480, w: 220, h: 220, pts: 6, inner: 0.50, rot: 0,  fill: "#f8d880", alpha: 0.24 },
    { x:  80, y: 820, w: 170, h: 170, pts: 5, inner: 0.45, rot: 36, fill: "#80e8d8", alpha: 0.26 },
    { x: 660, y: 150, w: 130, h: 130, pts: 7, inner: 0.42, rot: 51, fill: "#a878f8", alpha: 0.28 },
    { x: 720, y: 880, w: 110, h: 110, pts: 5, inner: 0.40, rot: 72, fill: "#f04090", alpha: 0.32 },
    { x: 500, y: 960, w:  90, h:  90, pts: 6, inner: 0.48, rot: 15, fill: "#20c8a8", alpha: 0.30 },
    { x: 160, y: 560, w:  75, h:  75, pts: 4, inner: 0.38, rot: 45, fill: "#f0b040", alpha: 0.35 },
    { x: 780, y: 600, w:  60, h:  60, pts: 8, inner: 0.52, rot: 10, fill: "#c080ff", alpha: 0.38 },
    { x: 430, y: 180, w:  50, h:  50, pts: 5, inner: 0.42, rot: 54, fill: "#ff80c8", alpha: 0.40 },
    { x:  60, y: 200, w:  42, h:  42, pts: 6, inner: 0.46, rot: 30, fill: "#80e8d8", alpha: 0.38 },
  ];
  for (const s of bloomStars) {
    ctx.save();
    ctx.globalAlpha = s.alpha;
    ctx.globalCompositeOperation = "screen";
    starLayerType.render(
      {
        ...starLayerType.createDefault(),
        fillColor: s.fill, fillEnabled: true,
        strokeEnabled: false,
        points: s.pts, innerRadius: s.inner, rotation: s.rot,
      },
      ctx, rect(s.x, s.y, s.w, s.h), resources,
    );
    ctx.restore();
  }

  // Ink accent lines — petal veins
  inkLayerType.render(
    {
      ...inkLayerType.createDefault(),
      field: "vortex:0.5:0.48:0.28",
      fieldCols: 24, fieldRows: 24,
      colors: JSON.stringify(["#ffc0e0"]),
      weight: 0.7, taper: "both", style: "brush",
      opacity: 0.30, seed: 22,
    },
    ctx, full(), resources,
  );

  ctx.fillStyle = "rgba(248,128,184,0.55)";
  ctx.font = "italic 22px Georgia, serif";
  ctx.fillText("V. Chromatic Bloom", 36, H - 28);

  return canvas;
}

// ─── Render all five ─────────────────────────────────────────────────────────

console.log("Rendering abstractionist series…");

const paintings = [
  { fn: painting1, file: "abstract-1-primordial-flux.png",     label: "I. Primordial Flux" },
  { fn: painting2, file: "abstract-2-ochre-strata.png",        label: "II. Ochre Strata" },
  { fn: painting3, file: "abstract-3-verdant-turbulence.png",  label: "III. Verdant Turbulence" },
  { fn: painting4, file: "abstract-4-midnight-geometry.png",   label: "IV. Midnight Geometry" },
  { fn: painting5, file: "abstract-5-chromatic-bloom.png",     label: "V. Chromatic Bloom" },
];

const rendered = [];
for (const { fn, file, label } of paintings) {
  console.log(`  Rendering ${label}…`);
  const c = fn();
  fs.writeFileSync(path.join(outDir, file), c.toBuffer("image/png"));
  console.log(`  ✓ Wrote ${file}`);
  rendered.push(c);
}

// ─── Gallery composite — 3-column, 2-row grid ────────────────────────────

const THUMB_W = 380;
const THUMB_H = 507; // maintain ~3:4 portrait ratio
const COLS = 3;
const ROWS = 2; // last cell (col 2, row 1) = title card
const PAD = 20;
const GW = COLS * THUMB_W + (COLS + 1) * PAD;
const GH = ROWS * THUMB_H + (ROWS + 1) * PAD;

const gallery = createCanvas(GW, GH);
const gctx = gallery.getContext("2d");

// Gallery background — warm charcoal
gctx.fillStyle = "#1c1a18";
gctx.fillRect(0, 0, GW, GH);

// Draw thumbnails
rendered.forEach((c, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const gx = PAD + col * (THUMB_W + PAD);
  const gy = PAD + row * (THUMB_H + PAD);
  const scale = Math.min(THUMB_W / c.width, THUMB_H / c.height);
  const dw = Math.round(c.width * scale);
  const dh = Math.round(c.height * scale);
  gctx.drawImage(c, gx + (THUMB_W - dw) / 2, gy + (THUMB_H - dh) / 2, dw, dh);

  // Thin border
  gctx.strokeStyle = "rgba(255,255,255,0.10)";
  gctx.lineWidth = 1;
  gctx.strokeRect(gx, gy, THUMB_W, THUMB_H);
});

// Title card (bottom-right cell: col 2, row 1)
{
  const col = 2;
  const row = 1;
  const gx = PAD + col * (THUMB_W + PAD);
  const gy = PAD + row * (THUMB_H + PAD);
  gctx.fillStyle = "#2a2622";
  gctx.fillRect(gx, gy, THUMB_W, THUMB_H);
  gctx.strokeStyle = "rgba(255,255,255,0.08)";
  gctx.lineWidth = 1;
  gctx.strokeRect(gx, gy, THUMB_W, THUMB_H);
  gctx.fillStyle = "rgba(255,255,255,0.85)";
  gctx.font = "bold 28px Georgia, serif";
  gctx.fillText("Abstractionist", gx + 40, gy + THUMB_H / 2 - 28);
  gctx.fillText("Series", gx + 40, gy + THUMB_H / 2 + 8);
  gctx.fillStyle = "rgba(255,255,255,0.35)";
  gctx.font = "16px Georgia, serif";
  gctx.fillText("painting · textures · shapes", gx + 40, gy + THUMB_H / 2 + 42);
  gctx.fillStyle = "rgba(255,255,255,0.20)";
  gctx.font = "13px monospace";
  gctx.fillText("2026", gx + 40, gy + THUMB_H / 2 + 70);
}

// Series label at bottom of gallery
gctx.fillStyle = "rgba(255,255,255,0.45)";
gctx.font = "italic 14px Georgia, serif";
const labels = ["I", "II", "III", "IV", "V"];
rendered.forEach((_c, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const gx = PAD + col * (THUMB_W + PAD) + 12;
  const gy = PAD + row * (THUMB_H + PAD) + THUMB_H - 14;
  gctx.fillText(paintings[i].label, gx, gy);
});

const galleryPath = path.join(outDir, "abstract-series-gallery.png");
fs.writeFileSync(galleryPath, gallery.toBuffer("image/png"));
console.log(`\n✓ Gallery written: ${galleryPath}`);
console.log("\nDone. All files in:", outDir);
