/**
 * Recipe Renders — Actual artwork for each recipe deep-dive
 *
 * Uses real plugin layer types where available (painting:watercolor, painting:oil,
 * painting:ink, textures:canvas, textures:paper, filter:grain) and implements
 * conceptual types (composite:flat, gradients, perspective grids, flow paths)
 * directly with canvas2d.
 *
 * Recipes rendered:
 *   1. Impressionist Landscape
 *   2. Sumi-e Bamboo
 *   3. Synthwave Retrowave Grid
 *   4. Generative Flow Field
 */

"use strict";

const canvasPkg = require("canvas");
const { createCanvas } = canvasPkg;
const fs = require("fs");
const path = require("path");

if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = canvasPkg.ImageData;
}

// --- Plugin imports ---
const {
  watercolorLayerType,
  oilAcrylicLayerType,
  inkLayerType,
} = require("../../../plugin-painting/dist/index.cjs");

const {
  canvasLayerType,
  paperLayerType,
} = require("../../../plugin-textures/dist/index.cjs");

const {
  getRecipe,
} = require("../../../styles/dist/index.cjs");

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

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

// Simple seeded PRNG (mulberry32)
function mulberry32(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 2D simplex-ish noise for flow fields
function createNoise2D(seed) {
  const rand = mulberry32(seed);
  const perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];

  // Value noise with smooth interpolation
  return (x, y) => {
    const ix = Math.floor(x) & 255;
    const iy = Math.floor(y) & 255;
    const fx = x - Math.floor(x);
    const fy = y - Math.floor(y);
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    const a = perm[ix + perm[iy]];
    const b = perm[ix + 1 + perm[iy]];
    const c = perm[ix + perm[iy + 1]];
    const d = perm[ix + 1 + perm[iy + 1]];
    const val = a + u * (b - a) + v * (c - a) + u * v * (a - b - c + d);
    return val / 255;
  };
}

// =====================================================================
// Recipe 1: Impressionist Landscape
// =====================================================================

function renderImpressionistLandscape() {
  console.log("Recipe 1: Impressionist Landscape");
  const recipe = getRecipe("impressionism-landscape");
  const W = 1200, H = 900;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const bounds = full(W, H);

  // --- Paint the sky directly with canvas gradients (impressionist base) ---
  // Warm golden-hour sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  skyGrad.addColorStop(0, "#87CEEB");
  skyGrad.addColorStop(0.3, "#B0D4F1");
  skyGrad.addColorStop(0.6, "#F5DEB3");
  skyGrad.addColorStop(1.0, "#FFECD2");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H * 0.55);

  // Green foliage base for lower half
  const groundGrad = ctx.createLinearGradient(0, H * 0.45, 0, H);
  groundGrad.addColorStop(0, "#90C060");
  groundGrad.addColorStop(0.3, "#4A8B30");
  groundGrad.addColorStop(0.7, "#2E6B1E");
  groundGrad.addColorStop(1.0, "#1A4A0E");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, H * 0.45, W, H * 0.55);

  // Layer 0: Linen canvas texture (textures:canvas, multiply @ 0.12)
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.12;
  canvasLayerType.render(
    { ...canvasLayerType.createDefault(), weaveScale: 8, density: 0.5, roughness: 0.35, color: "#E8E0D0", seed: 42 },
    ctx, bounds, resources,
  );
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  // Layer 1: Sky wash (painting:watercolor, multiply @ 0.3)
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.3;
  watercolorLayerType.render(
    {
      ...watercolorLayerType.createDefault(),
      colors: '["#87CEEB", "#4169E1", "#B0C4DE"]',
      dilution: 0.8,
      granulation: 0.15,
      edgeStyle: "soft",
      field: "noise:12:0.06:2",
      fieldCols: 20,
      fieldRows: 20,
      seed: 101,
      maskCenterY: 0.2,
      maskSpread: 0.3,
    },
    ctx, bounds, resources,
  );
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  // Layer 2: Foliage impasto (painting:oil, normal @ 0.7)
  ctx.globalAlpha = 0.7;
  oilAcrylicLayerType.render(
    {
      ...oilAcrylicLayerType.createDefault(),
      colors: '["#228B22", "#2E8B57", "#3CB371", "#90EE90"]',
      impasto: true,
      scumble: true,
      blendRadius: 2,
      field: "noise:77:0.15:4",
      fieldCols: 30,
      fieldRows: 30,
      seed: 202,
      maskCenterY: 0.78,
      maskSpread: 0.22,
    },
    ctx, bounds, resources,
  );
  ctx.globalAlpha = 1;

  // Layer 3: Light accents (painting:oil, screen @ 0.25)
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.25;
  oilAcrylicLayerType.render(
    {
      ...oilAcrylicLayerType.createDefault(),
      colors: '["#FFD700", "#FFA500"]',
      impasto: true,
      scumble: false,
      blendRadius: 1,
      field: "noise:33:0.08:2",
      fieldCols: 20,
      fieldRows: 20,
      seed: 303,
      maskCenterY: 0.45,
      maskSpread: 0.3,
    },
    ctx, bounds, resources,
  );
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  // Layer 4: Earth tones in mid-ground treeline
  ctx.globalAlpha = 0.45;
  oilAcrylicLayerType.render(
    {
      ...oilAcrylicLayerType.createDefault(),
      colors: '["#8B4513", "#A0522D", "#6B4423"]',
      impasto: true,
      scumble: true,
      blendRadius: 2,
      field: "noise:55:0.12:3",
      fieldCols: 24,
      fieldRows: 24,
      seed: 404,
      maskCenterY: 0.55,
      maskSpread: 0.1,
    },
    ctx, bounds, resources,
  );
  ctx.globalAlpha = 1;

  // Layer 4b: Water reflections near bottom
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.3;
  watercolorLayerType.render(
    {
      ...watercolorLayerType.createDefault(),
      colors: '["#4169E1", "#87CEEB", "#2E8B57"]',
      dilution: 0.6,
      granulation: 0.25,
      edgeStyle: "diffuse",
      field: "linear:0:0.5:0",
      fieldCols: 20,
      fieldRows: 20,
      seed: 505,
      maskCenterY: 0.92,
      maskSpread: 0.12,
    },
    ctx, bounds, resources,
  );
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  // Layer 4c: Short impressionist dabs — broken color brushstrokes
  // Instead of continuous flow lines, scatter short directional marks
  const dabRand = mulberry32(606);
  const dabColors = [
    "#228B22", "#2E8B57", "#3CB371", "#6B8E23", // greens
    "#8B4513", "#A0522D", "#CD853F",             // earth
    "#FFD700", "#FFA500",                         // light
    "#87CEEB", "#6495ED",                         // sky reflections
    "#556B2F", "#4A7023",                         // dark foliage
  ];

  ctx.lineCap = "round";
  for (let d = 0; d < 6000; d++) {
    const dx = dabRand() * W;
    const dy = dabRand() * H;
    const ny = dy / H;

    // Density mask: more dabs in foliage zone (0.45-0.95), fewer in sky
    const inFoliage = ny > 0.4;
    if (!inFoliage && dabRand() > 0.15) continue;
    if (inFoliage && dabRand() > 0.8) continue;

    // Pick color based on vertical position
    let color;
    if (ny < 0.4) {
      // Sky zone — light blues and whites
      color = dabColors[9 + Math.floor(dabRand() * 2)];
    } else if (ny < 0.55) {
      // Treeline — darks and earth
      color = dabColors[4 + Math.floor(dabRand() * 3)];
    } else {
      // Foliage — greens with occasional earth/light
      const pick = dabRand();
      if (pick < 0.6) color = dabColors[Math.floor(dabRand() * 4)];
      else if (pick < 0.8) color = dabColors[7 + Math.floor(dabRand() * 2)];
      else color = dabColors[11 + Math.floor(dabRand() * 2)];
    }

    // Short stroke: random angle, short length (5-20px)
    const angle = (dabRand() - 0.5) * Math.PI * 0.6 + (inFoliage ? -0.3 : 0.1);
    const len = 6 + dabRand() * 22;
    const strokeW = 2 + dabRand() * 6;

    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.15 + dabRand() * 0.35;
    ctx.lineWidth = strokeW;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx + Math.cos(angle) * len, dy + Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Layer 5: Film grain (manual — fine noise overlay)
  // putImageData bypasses compositing, so render grain to a temp canvas first
  const grainCanvas = createCanvas(W, H);
  const grainCtx = grainCanvas.getContext("2d");
  const grainData = grainCtx.createImageData(W, H);
  const gd = grainData.data;
  const grainRand = mulberry32(999);
  for (let i = 0; i < gd.length; i += 4) {
    const v = Math.floor(grainRand() * 255);
    gd[i] = v;
    gd[i + 1] = v;
    gd[i + 2] = v;
    gd[i + 3] = 255;
  }
  grainCtx.putImageData(grainData, 0, 0);
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.08;
  ctx.drawImage(grainCanvas, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  // Title card overlay
  drawRecipeLabel(ctx, W, H, recipe);

  save(canvas, "recipe-01-impressionism-landscape.png");
}

// =====================================================================
// Recipe 2: Sumi-e Bamboo
// =====================================================================

function renderSumie() {
  console.log("Recipe 2: Sumi-e Bamboo");
  const recipe = getRecipe("sumi-e-bamboo");
  const W = 800, H = 1200;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const bounds = full(W, H);

  // Layer 0: Rice paper ground (composite:flat)
  ctx.fillStyle = "#F8F2E4";
  ctx.fillRect(0, 0, W, H);

  // Layer 1: Paper fiber texture (textures:paper, multiply @ 0.15)
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.15;
  paperLayerType.render(
    { ...paperLayerType.createDefault(), preset: "rough", color: "#E8DFC8", seed: 42 },
    ctx, bounds, resources,
  );
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  // Layer 2: Background wash — very dilute ink wash (watercolor with dark ink)
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.15;
  watercolorLayerType.render(
    {
      ...watercolorLayerType.createDefault(),
      colors: '["#2A2010", "#4A3820"]',
      dilution: 0.9,
      granulation: 0.1,
      edgeStyle: "lost",
      field: "noise:50:0.04:2",
      fieldCols: 16,
      fieldRows: 16,
      seed: 111,
      maskCenterY: 0.3,
      maskSpread: 0.6,
    },
    ctx, bounds, resources,
  );
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  // Layer 3: Bamboo stalks — bold calligraphic vertical ink strokes
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.75;
  const rand = mulberry32(222);

  // Draw 3-4 bamboo stalks
  const stalks = [
    { x: W * 0.3, segments: 6 },
    { x: W * 0.55, segments: 7 },
    { x: W * 0.72, segments: 5 },
  ];

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const stalk of stalks) {
    const segH = (H * 0.7) / stalk.segments;
    let y = H * 0.15;
    const baseX = stalk.x + (rand() - 0.5) * 20;

    for (let s = 0; s < stalk.segments; s++) {
      const x1 = baseX + (rand() - 0.5) * 8;
      const x2 = baseX + (rand() - 0.5) * 8;
      const strokeW = 6 + rand() * 12;

      // Main segment stroke
      ctx.strokeStyle = `rgba(42, 32, 16, ${0.5 + rand() * 0.4})`;
      ctx.lineWidth = strokeW;
      ctx.beginPath();
      ctx.moveTo(x1, y + 4);
      ctx.bezierCurveTo(
        x1 + (rand() - 0.5) * 15, y + segH * 0.3,
        x2 + (rand() - 0.5) * 15, y + segH * 0.7,
        x2, y + segH - 4,
      );
      ctx.stroke();

      // Joint node — darker, wider mark
      ctx.strokeStyle = "rgba(26, 20, 10, 0.7)";
      ctx.lineWidth = strokeW * 1.3;
      ctx.beginPath();
      ctx.moveTo(x2 - strokeW * 0.5, y + segH);
      ctx.lineTo(x2 + strokeW * 0.5, y + segH);
      ctx.stroke();

      y += segH;
    }
  }
  ctx.globalAlpha = 1;

  // Layer 4: Bamboo leaves — quick decisive strokes
  ctx.globalAlpha = 0.85;
  const leafRand = mulberry32(333);

  for (const stalk of stalks) {
    const baseX = stalk.x;
    // Leaves cluster at joints
    for (let j = 0; j < stalk.segments; j++) {
      if (leafRand() > 0.6) continue; // Not every joint has leaves
      const jointY = H * 0.15 + j * ((H * 0.7) / stalk.segments);
      const numLeaves = 2 + Math.floor(leafRand() * 4);

      for (let l = 0; l < numLeaves; l++) {
        const angle = (leafRand() - 0.5) * Math.PI * 0.8;
        const leafLen = 30 + leafRand() * 60;
        const side = leafRand() > 0.5 ? 1 : -1;
        const startX = baseX + side * (3 + leafRand() * 8);
        const startY = jointY + (leafRand() - 0.5) * 20;

        ctx.strokeStyle = `rgba(42, 32, 16, ${0.6 + leafRand() * 0.3})`;
        ctx.lineWidth = 1.5 + leafRand() * 2.5;
        ctx.beginPath();
        ctx.moveTo(startX, startY);

        // Leaf: single curved stroke tapering at tip
        const endX = startX + Math.cos(angle) * leafLen * side;
        const endY = startY + Math.sin(angle) * leafLen * 0.5 - leafLen * 0.3;
        const cpX = startX + Math.cos(angle) * leafLen * 0.5 * side;
        const cpY = startY - leafLen * 0.15 + (leafRand() - 0.5) * 20;

        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.stroke();
      }
    }
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  // Layer 5: Red seal (traditional vermillion artist seal)
  const sealX = W * 0.78;
  const sealY = H * 0.82;
  const sealSize = 32;

  ctx.fillStyle = "#CC2200";
  ctx.fillRect(sealX, sealY, sealSize, sealSize * 1.2);

  // Simple seal character (abstract mark inside)
  ctx.strokeStyle = "#F8F2E4";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sealX + 8, sealY + 8);
  ctx.lineTo(sealX + sealSize - 8, sealY + sealSize * 1.2 - 8);
  ctx.moveTo(sealX + sealSize - 8, sealY + 8);
  ctx.lineTo(sealX + 8, sealY + sealSize * 1.2 - 8);
  ctx.moveTo(sealX + sealSize / 2, sealY + 6);
  ctx.lineTo(sealX + sealSize / 2, sealY + sealSize * 1.2 - 6);
  ctx.stroke();

  drawRecipeLabel(ctx, W, H, recipe);
  save(canvas, "recipe-02-sumi-e-bamboo.png");
}

// =====================================================================
// Recipe 3: Synthwave Retrowave Grid
// =====================================================================

function renderSynthwave() {
  console.log("Recipe 3: Synthwave Retrowave Grid");
  const recipe = getRecipe("synthwave-grid");
  const W = 1600, H = 900;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Layer 0: Gradient sky (composite:gradient, top-bottom)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, "#0D0026");
  skyGrad.addColorStop(0.45, "#3D005A");
  skyGrad.addColorStop(0.55, "#FF006E");
  skyGrad.addColorStop(0.58, "#FF4500");
  skyGrad.addColorStop(0.62, "#FF9900");
  skyGrad.addColorStop(1.0, "#0D0026");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // Layer 1: Sun disc (screen @ 0.9)
  const horizonY = H * 0.55;
  const sunRadius = 100;
  const sunGrad = ctx.createRadialGradient(W / 2, horizonY, 0, W / 2, horizonY, sunRadius);
  sunGrad.addColorStop(0, "#FFCC00");
  sunGrad.addColorStop(0.4, "#FF9900");
  sunGrad.addColorStop(0.8, "#FF6600");
  sunGrad.addColorStop(1, "rgba(255, 102, 0, 0)");

  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(W / 2, horizonY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  // Sun horizontal line cuts (synthwave signature)
  ctx.globalCompositeOperation = "destination-out";
  ctx.globalAlpha = 1;
  const lineSpacing = 8;
  for (let y = horizonY - sunRadius * 0.6; y < horizonY + sunRadius; y += lineSpacing * 2) {
    const lh = 2 + (y - horizonY + sunRadius) * 0.02;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(W / 2 - sunRadius, y, sunRadius * 2, lh);
  }
  ctx.globalCompositeOperation = "source-over";

  // Ground plane (below horizon, dark)
  const groundGrad = ctx.createLinearGradient(0, horizonY, 0, H);
  groundGrad.addColorStop(0, "#1A0030");
  groundGrad.addColorStop(1, "#0A0015");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, horizonY, W, H - horizonY);

  // Layer 2: Perspective grid (screen @ 0.7)
  // Render grid to a temp canvas, then blur it for glow, and composite both
  const vpX = W / 2;
  const vpY = horizonY;

  const gridCanvas = createCanvas(W, H);
  const gridCtx = gridCanvas.getContext("2d");
  gridCtx.strokeStyle = "#FF00CC";

  // Horizontal lines receding in perspective
  const gridLines = 16;
  for (let i = 1; i <= gridLines; i++) {
    const t = i / gridLines;
    const y = vpY + Math.pow(t, 2.0) * (H - vpY);
    gridCtx.globalAlpha = 0.5 + t * 0.5;
    gridCtx.lineWidth = 0.8 + t * 2.0;
    gridCtx.beginPath();
    gridCtx.moveTo(0, y);
    gridCtx.lineTo(W, y);
    gridCtx.stroke();
  }

  // Vertical lines converging to vanishing point (fewer, cleaner)
  const verticalLines = 18;
  for (let i = -verticalLines / 2; i <= verticalLines / 2; i++) {
    const spread = (i / (verticalLines / 2));
    const bottomX = vpX + spread * W * 0.9;
    gridCtx.globalAlpha = 0.5 + (1 - Math.abs(spread)) * 0.4;
    gridCtx.lineWidth = 0.8 + (1 - Math.abs(spread)) * 0.5;
    gridCtx.beginPath();
    gridCtx.moveTo(vpX, vpY);
    gridCtx.lineTo(bottomX, H);
    gridCtx.stroke();
  }

  // Composite the sharp grid
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.6;
  ctx.drawImage(gridCanvas, 0, 0);

  // Glow pass: blur the grid by drawing it scaled down and back up
  const blurCanvas = createCanvas(W / 8, H / 8);
  const blurCtx = blurCanvas.getContext("2d");
  blurCtx.drawImage(gridCanvas, 0, 0, W / 8, H / 8);
  ctx.globalAlpha = 0.5;
  ctx.drawImage(blurCanvas, 0, 0, W, H);

  // Even softer glow pass
  const blur2 = createCanvas(W / 16, H / 16);
  const blur2Ctx = blur2.getContext("2d");
  blur2Ctx.drawImage(gridCanvas, 0, 0, W / 16, H / 16);
  ctx.globalAlpha = 0.35;
  ctx.drawImage(blur2, 0, 0, W, H);

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  // Layer 3: Neon glow on horizon + sun bloom
  ctx.globalCompositeOperation = "screen";

  // Horizon glow band
  ctx.globalAlpha = 0.3;
  const glowGrad = ctx.createLinearGradient(0, horizonY - 60, 0, horizonY + 60);
  glowGrad.addColorStop(0, "rgba(255, 0, 204, 0)");
  glowGrad.addColorStop(0.5, "rgba(255, 0, 204, 0.6)");
  glowGrad.addColorStop(1, "rgba(255, 0, 204, 0)");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, horizonY - 60, W, 120);

  // Sun bloom
  ctx.globalAlpha = 0.35;
  const sunGlow = ctx.createRadialGradient(vpX, vpY, sunRadius * 0.5, vpX, vpY, sunRadius * 3);
  sunGlow.addColorStop(0, "rgba(255, 153, 0, 0.5)");
  sunGlow.addColorStop(0.5, "rgba(255, 0, 102, 0.15)");
  sunGlow.addColorStop(1, "rgba(255, 0, 102, 0)");
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(vpX, vpY, sunRadius * 3, 0, Math.PI * 2);
  ctx.fill();

  // Cyan accent glow at grid center
  ctx.globalAlpha = 0.12;
  const cyanGlow = ctx.createRadialGradient(vpX, H * 0.75, 0, vpX, H * 0.75, W * 0.3);
  cyanGlow.addColorStop(0, "rgba(0, 255, 204, 0.4)");
  cyanGlow.addColorStop(1, "rgba(0, 255, 204, 0)");
  ctx.fillStyle = cyanGlow;
  ctx.fillRect(0, horizonY, W, H - horizonY);

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  // Layer 4: CRT scanlines (multiply @ 0.15)
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#000000";
  for (let y = 0; y < H; y += 3) {
    ctx.fillRect(0, y, W, 1);
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  // Layer 5: Chromatic aberration (subtle color shift)
  const imgData = ctx.getImageData(0, 0, W, H);
  const shifted = ctx.createImageData(W, H);
  const src = imgData.data;
  const dst = shifted.data;
  const offset = 2;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      // Red channel shifted left
      const rx = Math.max(0, x - offset);
      const ri = (y * W + rx) * 4;
      // Blue channel shifted right
      const bx = Math.min(W - 1, x + offset);
      const bi = (y * W + bx) * 4;

      dst[i]     = src[ri];     // R from left
      dst[i + 1] = src[i + 1];  // G stays
      dst[i + 2] = src[bi + 2]; // B from right
      dst[i + 3] = 255;
    }
  }
  ctx.putImageData(shifted, 0, 0);

  drawRecipeLabel(ctx, W, H, recipe);
  save(canvas, "recipe-03-synthwave-grid.png");
}

// =====================================================================
// Recipe 4: Generative Flow Field
// =====================================================================

function renderFlowField() {
  console.log("Recipe 4: Generative Flow Field");
  const recipe = getRecipe("generative-flow-field");
  const W = 1000, H = 1000;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Layer 0: Dark ground
  ctx.fillStyle = "#0D0D0D";
  ctx.fillRect(0, 0, W, H);

  // Layer 1: Flow paths with spatially-mapped color.
  // Color is determined by position using a second noise field,
  // so different regions of the canvas show different hues.
  const flowNoise = createNoise2D(42);
  const colorNoise = createNoise2D(777);
  const noiseScale = 0.003;

  // Full palette — saturated enough to read on dark ground
  const fullPalette = [
    [232, 190, 140], // warm cream
    [200, 120, 90],  // terracotta
    [240, 160, 50],  // amber
    [230, 75, 85],   // coral
    [200, 70, 140],  // rose
    [160, 110, 210], // purple
    [90, 160, 220],  // blue
    [60, 190, 170],  // teal
    [130, 200, 130], // green
  ];

  function drawColorfulFlow(count, maxSteps, alpha, strokeW, seed, stepLen) {
    const pr = mulberry32(seed);

    for (let p = 0; p < count; p++) {
      const startX = pr() * W;
      const startY = pr() * H;

      // Pick color from spatial noise at start position
      const cn = colorNoise(startX * 0.004, startY * 0.004);
      const ci = Math.floor(cn * fullPalette.length) % fullPalette.length;
      const color = fullPalette[Math.abs(ci)];

      // Vary alpha slightly per-path
      const pathAlpha = alpha * (0.6 + pr() * 0.8);

      ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${pathAlpha})`;
      ctx.lineWidth = strokeW * (0.4 + pr() * 1.2);
      ctx.lineCap = "round";

      ctx.beginPath();
      let x = startX, y = startY;
      ctx.moveTo(x, y);

      for (let s = 0; s < maxSteps; s++) {
        const n1 = flowNoise(x * noiseScale, y * noiseScale);
        const n2 = flowNoise(x * noiseScale * 2, y * noiseScale * 2) * 0.5;
        const angle = (n1 + n2) * Math.PI * 4;

        x += Math.cos(angle) * stepLen;
        y += Math.sin(angle) * stepLen;

        if (x < -10 || x > W + 10 || y < -10 || y > H + 10) break;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  // Multiple passes with additive blending for brightness accumulation
  ctx.globalCompositeOperation = "lighter";

  // Dense thin base layer
  drawColorfulFlow(14400, 500, 0.03, 0.6, 42, 2);
  // Medium-weight fill pass
  drawColorfulFlow(9000, 400, 0.025, 0.9, 100, 2);
  // Thicker accent pass
  drawColorfulFlow(3600, 300, 0.04, 1.5, 200, 2.5);

  ctx.globalCompositeOperation = "source-over";

  // Layer 3: Edge vignette (multiply @ 0.4, subtle)
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.4;
  const vigGrad = ctx.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 0.72);
  vigGrad.addColorStop(0, "#FFFFFF");
  vigGrad.addColorStop(0.6, "#FFFFFF");
  vigGrad.addColorStop(1, "#000000");
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  drawRecipeLabel(ctx, W, H, recipe);
  save(canvas, "recipe-04-generative-flow-field.png");
}

// =====================================================================
// Shared: Recipe label overlay
// =====================================================================

function drawRecipeLabel(ctx, W, H, recipe) {
  if (!recipe) return;

  // Semi-transparent bar at bottom
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.fillRect(0, H - 60, W, 60);

  // Recipe name
  ctx.fillStyle = "#E0E0E0";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(recipe.name, 16, H - 32);

  // Description
  ctx.fillStyle = "#999";
  ctx.font = "12px sans-serif";
  const desc = recipe.description.length > 100 ? recipe.description.slice(0, 98) + "..." : recipe.description;
  ctx.fillText(desc, 16, H - 14);

  // Palette swatches at right
  const swatchSize = 20;
  const palette = recipe.suggestedPalette;
  for (let i = 0; i < palette.length; i++) {
    const sx = W - 16 - (palette.length - i) * (swatchSize + 3);
    ctx.fillStyle = palette[i];
    ctx.fillRect(sx, H - 48, swatchSize, swatchSize);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(sx, H - 48, swatchSize, swatchSize);
  }

  // Renderer badges
  ctx.font = "10px sans-serif";
  let badgeX = W - 16 - palette.length * (swatchSize + 3);
  ctx.fillStyle = "#666";
  ctx.textAlign = "right";
  ctx.fillText(recipe.recommendedRenderers.join(" / "), badgeX - 8, H - 14);
  ctx.textAlign = "left";
}

// =====================================================================
// Run all recipe renders
// =====================================================================

console.log("\n=== Recipe Renders ===\n");

renderImpressionistLandscape();
renderSumie();
renderSynthwave();
renderFlowField();

console.log("\nDone! Check the renders/ directory.");
