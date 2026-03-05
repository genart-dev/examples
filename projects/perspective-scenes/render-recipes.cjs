/**
 * Perspective Scenes — Render recipes showcasing @genart-dev/plugin-perspective
 *
 * Recipes:
 *   1. Synthwave Sunset   — One-point perspective floor, neon glow
 *   2. City Corner         — Two-point grid with building facades
 *   3. Vertigo Tower       — Three-point worm's-eye with windows
 *   4. Isometric Workshop  — Isometric grid with pastel cubes
 */

"use strict";

const canvasPkg = require("canvas");
const { createCanvas } = canvasPkg;
const fs = require("fs");
const path = require("path");

if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = canvasPkg.ImageData;
}

const {
  twoPointGridLayerType,
  threePointGridLayerType,
  isometricGridLayerType,
  clipLineToRect,
  lineIntersection,
} = require("../../../plugin-perspective/dist/index.cjs");

// --- Shared setup ---

const SIZE = 800;
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

// =====================================================================
// Recipe 1: Synthwave Sunset
// =====================================================================

function renderSynthwaveSunset() {
  console.log("Recipe 1: Synthwave Sunset");
  const W = SIZE, H = SIZE;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const horizonY = H * 0.45;
  const vpX = W / 2;
  const vpY = horizonY;

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, "#0D0026");
  skyGrad.addColorStop(0.30, "#3D005A");
  skyGrad.addColorStop(0.42, "#FF006E");
  skyGrad.addColorStop(0.46, "#FF4500");
  skyGrad.addColorStop(0.50, "#FF9900");
  skyGrad.addColorStop(0.55, "#1A0030");
  skyGrad.addColorStop(1.0, "#0A0015");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // Sun disc
  const sunRadius = 100;
  const sunGrad = ctx.createRadialGradient(W / 2, horizonY, 0, W / 2, horizonY, sunRadius);
  sunGrad.addColorStop(0, "#FFCC00");
  sunGrad.addColorStop(0.4, "#FF9900");
  sunGrad.addColorStop(0.8, "#FF6600");
  sunGrad.addColorStop(1, "rgba(255,102,0,0)");
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(W / 2, horizonY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  // Sun horizontal line cuts
  ctx.globalCompositeOperation = "destination-out";
  ctx.globalAlpha = 1;
  for (let y = horizonY - sunRadius * 0.6; y < horizonY + sunRadius; y += 16) {
    const lh = 2 + (y - horizonY + sunRadius) * 0.02;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(W / 2 - sunRadius, y, sunRadius * 2, lh);
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  // Ground plane below horizon
  const groundGrad = ctx.createLinearGradient(0, horizonY, 0, H);
  groundGrad.addColorStop(0, "#1A0030");
  groundGrad.addColorStop(1, "#0A0015");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, horizonY, W, H - horizonY);

  // Manual perspective grid on temp canvas (matching style-explorer approach)
  const gridCanvas = createCanvas(W, H);
  const gridCtx = gridCanvas.getContext("2d");
  gridCtx.strokeStyle = "#FF00CC";

  // Horizontal lines with quadratic depth easing
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

  // Vertical fan lines from VP to bottom edge
  const verticalLines = 18;
  for (let i = -verticalLines / 2; i <= verticalLines / 2; i++) {
    const spread = i / (verticalLines / 2);
    const bottomX = vpX + spread * W * 0.9;
    gridCtx.globalAlpha = 0.5 + (1 - Math.abs(spread)) * 0.4;
    gridCtx.lineWidth = 0.8 + (1 - Math.abs(spread)) * 0.5;
    gridCtx.beginPath();
    gridCtx.moveTo(vpX, vpY);
    gridCtx.lineTo(bottomX, H);
    gridCtx.stroke();
  }

  // Composite sharp grid (screen)
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.6;
  ctx.drawImage(gridCanvas, 0, 0);

  // Glow pass 1: downscale blur
  const blurCanvas = createCanvas(W / 8, H / 8);
  const blurCtx = blurCanvas.getContext("2d");
  blurCtx.drawImage(gridCanvas, 0, 0, W / 8, H / 8);
  ctx.globalAlpha = 0.5;
  ctx.drawImage(blurCanvas, 0, 0, W, H);

  // Glow pass 2: even softer
  const blur2 = createCanvas(W / 16, H / 16);
  const blur2Ctx = blur2.getContext("2d");
  blur2Ctx.drawImage(gridCanvas, 0, 0, W / 16, H / 16);
  ctx.globalAlpha = 0.35;
  ctx.drawImage(blur2, 0, 0, W, H);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  // Neon cyan horizontal lines above horizon
  const neonCount = 5;
  for (let i = 0; i < neonCount; i++) {
    const t = (i + 1) / (neonCount + 1);
    const y = horizonY * (0.3 + t * 0.65);
    const alpha = 0.2 + (1 - t) * 0.3;

    ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();

    const glowGrad = ctx.createLinearGradient(0, y - 12, 0, y + 12);
    glowGrad.addColorStop(0, "rgba(0,255,255,0)");
    glowGrad.addColorStop(0.5, `rgba(0,255,255,${alpha * 0.35})`);
    glowGrad.addColorStop(1, "rgba(0,255,255,0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, y - 12, W, 24);
  }

  // Horizon glow band (magenta)
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.3;
  const hGlow = ctx.createLinearGradient(0, horizonY - 60, 0, horizonY + 60);
  hGlow.addColorStop(0, "rgba(255,0,204,0)");
  hGlow.addColorStop(0.5, "rgba(255,0,204,0.6)");
  hGlow.addColorStop(1, "rgba(255,0,204,0)");
  ctx.fillStyle = hGlow;
  ctx.fillRect(0, horizonY - 60, W, 120);

  // Sun bloom
  ctx.globalAlpha = 0.35;
  const bloom = ctx.createRadialGradient(vpX, vpY, sunRadius * 0.5, vpX, vpY, sunRadius * 3);
  bloom.addColorStop(0, "rgba(255,153,0,0.5)");
  bloom.addColorStop(0.5, "rgba(255,0,102,0.15)");
  bloom.addColorStop(1, "rgba(255,0,102,0)");
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.arc(vpX, vpY, sunRadius * 3, 0, Math.PI * 2);
  ctx.fill();

  // Cyan accent glow at grid center
  ctx.globalAlpha = 0.12;
  const cyanGlow = ctx.createRadialGradient(vpX, H * 0.75, 0, vpX, H * 0.75, W * 0.3);
  cyanGlow.addColorStop(0, "rgba(0,255,204,0.4)");
  cyanGlow.addColorStop(1, "rgba(0,255,204,0)");
  ctx.fillStyle = cyanGlow;
  ctx.fillRect(0, horizonY, W, H - horizonY);

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  // CRT scanlines
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#000000";
  for (let y = 0; y < H; y += 3) {
    ctx.fillRect(0, y, W, 1);
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  // Chromatic aberration (2px R/B channel shift)
  const imgData = ctx.getImageData(0, 0, W, H);
  const shifted = ctx.createImageData(W, H);
  const src = imgData.data;
  const dst = shifted.data;
  const offset = 2;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const rx = Math.max(0, x - offset);
      const ri = (y * W + rx) * 4;
      const bx = Math.min(W - 1, x + offset);
      const bi = (y * W + bx) * 4;
      dst[i]     = src[ri];
      dst[i + 1] = src[i + 1];
      dst[i + 2] = src[bi + 2];
      dst[i + 3] = 255;
    }
  }
  ctx.putImageData(shifted, 0, 0);

  save(canvas, "recipe-01-synthwave-sunset.png");
}

// =====================================================================
// Recipe 2: City Corner
// =====================================================================

function renderCityCorner() {
  console.log("Recipe 2: City Corner");
  const W = SIZE, H = SIZE;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const rand = mulberry32(42);

  const leftVP = { x: 0.0, y: 0.35 };
  const rightVP = { x: 1.0, y: 0.35 };
  const lvpX = leftVP.x * W;
  const lvpY = leftVP.y * H;
  const rvpX = rightVP.x * W;
  const rvpY = rightVP.y * H;
  const horizonY = (lvpY + rvpY) / 2;

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  skyGrad.addColorStop(0, "#8BAACC");
  skyGrad.addColorStop(1, "#C4CDDA");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, horizonY);

  // Ground
  ctx.fillStyle = "#4A4A48";
  ctx.fillRect(0, horizonY, W, H - horizonY);

  // Sidewalk
  const sidewalkGrad = ctx.createLinearGradient(0, horizonY, 0, horizonY + 60);
  sidewalkGrad.addColorStop(0, "#6A6A68");
  sidewalkGrad.addColorStop(1, "#4A4A48");
  ctx.fillStyle = sidewalkGrad;
  ctx.fillRect(0, horizonY, W, 60);

  // Building palette
  const buildingColors = [
    "#7A7268", "#8C8478", "#6E6860", "#9A9084", "#A09688",
    "#5C564E", "#6B6358", "#857C70", "#746C62", "#8F867A",
  ];
  const windowLit = "#B8C8D8";
  const windowDark = "#3A4550";

  // Y on a line from (vpX,vpY) through (cornerX, cornerY) at a given x
  function vpLineY(vpX, vpY, cornerY, x) {
    const dx = cornerX - vpX;
    if (Math.abs(dx) < 0.001) return cornerY;
    return vpY + (cornerY - vpY) * (x - vpX) / dx;
  }

  // Corner edge position — the vertical line where left and right walls meet
  const cornerX = W * 0.45;

  // Draw a building face as a perspective quad.
  // All heights are defined AT cornerX; top/bot edges converge from cornerX toward VP.
  function drawBuildingFace(leftX, rightX, cornerTopY, cornerBotY, vpX, vpY, color) {
    const tl = vpLineY(vpX, vpY, cornerTopY, leftX);
    const tr = vpLineY(vpX, vpY, cornerTopY, rightX);
    const bl = vpLineY(vpX, vpY, cornerBotY, leftX);
    const br = vpLineY(vpX, vpY, cornerBotY, rightX);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(leftX, tl);
    ctx.lineTo(rightX, tr);
    ctx.lineTo(rightX, br);
    ctx.lineTo(leftX, bl);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.stroke();
  }

  // Draw perspective-correct windows as quads within a face.
  // Heights defined at cornerX, converge toward VP.
  function drawWindows(leftX, rightX, cornerTopY, cornerBotY, vpX, vpY, rows, cols) {
    const padFrac = 0.1;
    const winFracW = 0.55;
    const winFracH = 0.45;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const u0 = padFrac + (c / cols) * (1 - 2 * padFrac);
        const u1 = padFrac + ((c + winFracW) / cols) * (1 - 2 * padFrac);
        const v0 = padFrac + (r / rows) * (1 - 2 * padFrac);
        const v1 = padFrac + ((r + winFracH) / rows) * (1 - 2 * padFrac);

        const wx0 = leftX + u0 * (rightX - leftX);
        const wx1 = leftX + u1 * (rightX - leftX);

        // Top/bot Y at each x, from VP through corner heights
        const topAt0 = vpLineY(vpX, vpY, cornerTopY, wx0);
        const botAt0 = vpLineY(vpX, vpY, cornerBotY, wx0);
        const topAt1 = vpLineY(vpX, vpY, cornerTopY, wx1);
        const botAt1 = vpLineY(vpX, vpY, cornerBotY, wx1);

        const wy0_left = topAt0 + v0 * (botAt0 - topAt0);
        const wy1_left = topAt0 + v1 * (botAt0 - topAt0);
        const wy0_right = topAt1 + v0 * (botAt1 - topAt1);
        const wy1_right = topAt1 + v1 * (botAt1 - topAt1);

        ctx.fillStyle = rand() > 0.35 ? windowLit : windowDark;
        ctx.beginPath();
        ctx.moveTo(wx0, wy0_left);
        ctx.lineTo(wx1, wy0_right);
        ctx.lineTo(wx1, wy1_right);
        ctx.lineTo(wx0, wy1_left);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // Right-side buildings (recede toward RIGHT VP)
  // Heights defined at cornerX; edges converge rightward toward rvpX
  const rightBuildings = [
    { offset: 0, width: 110, height: 0.35, rows: 6, cols: 3 },
    { offset: 110, width: 130, height: 0.28, rows: 5, cols: 3 },
    { offset: 240, width: 120, height: 0.40, rows: 7, cols: 3 },
    { offset: 360, width: 100, height: 0.22, rows: 4, cols: 2 },
  ];

  for (let b = 0; b < rightBuildings.length; b++) {
    const bld = rightBuildings[b];
    const lx = cornerX + bld.offset;
    const rx = Math.min(lx + bld.width, W);
    if (lx > W) break;
    const cornerTopY = horizonY - bld.height * H;
    const cornerBotY = H * 0.92;
    const ci = (b + 2) % buildingColors.length;

    drawBuildingFace(lx, rx, cornerTopY, cornerBotY, rvpX, rvpY, buildingColors[ci]);
    drawWindows(lx, rx, cornerTopY, cornerBotY, rvpX, rvpY, bld.rows, bld.cols);
  }

  // Left-side buildings (recede toward LEFT VP)
  // Heights defined at cornerX; edges converge leftward toward lvpX
  const leftBuildings = [
    { offset: 0, width: 100, height: 0.38, rows: 7, cols: 3 },
    { offset: 100, width: 120, height: 0.25, rows: 4, cols: 3 },
    { offset: 220, width: 110, height: 0.42, rows: 8, cols: 3 },
    { offset: 330, width: 100, height: 0.30, rows: 5, cols: 2 },
  ];

  for (let b = 0; b < leftBuildings.length; b++) {
    const bld = leftBuildings[b];
    const rx = cornerX - bld.offset;
    const lx = Math.max(rx - bld.width, 0);
    if (rx < 0) break;
    const cornerTopY = horizonY - bld.height * H;
    const cornerBotY = H * 0.92;
    const ci = (b + 5) % buildingColors.length;
    const r = parseInt(buildingColors[ci].slice(1, 3), 16);
    const g = parseInt(buildingColors[ci].slice(3, 5), 16);
    const bv = parseInt(buildingColors[ci].slice(5, 7), 16);
    const darken = 0.85;
    const color = `rgb(${Math.floor(r * darken)},${Math.floor(g * darken)},${Math.floor(bv * darken)})`;

    drawBuildingFace(lx, rx, cornerTopY, cornerBotY, lvpX, lvpY, color);
    drawWindows(lx, rx, cornerTopY, cornerBotY, lvpX, lvpY, bld.rows, bld.cols);
  }

  // Corner edge highlight
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cornerX, horizonY - H * 0.45);
  ctx.lineTo(cornerX, H * 0.92);
  ctx.stroke();

  // Overlay the two-point perspective grid
  const gridCanvas = createCanvas(W, H);
  const gridCtx = gridCanvas.getContext("2d");
  twoPointGridLayerType.render(
    {
      ...twoPointGridLayerType.createDefault(),
      leftVP,
      rightVP,
      horizonLineVisible: true,
      linesPerVP: 12,
      verticalLines: 10,
      depthEasing: "quadratic",
      depthStyling: true,
      guideColor: "rgba(255,200,100,0.5)",
      lineWidth: 0.8,
      dashPattern: "4,6",
    },
    gridCtx, full(W, H), resources,
  );

  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.25;
  ctx.drawImage(gridCanvas, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  // Subtle vignette
  const vigGrad = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.7);
  vigGrad.addColorStop(0, "rgba(0,0,0,0)");
  vigGrad.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, W, H);

  save(canvas, "recipe-02-city-corner.png");
}

// =====================================================================
// Recipe 3: Vertigo Tower
// =====================================================================

function renderVertigoTower() {
  console.log("Recipe 3: Vertigo Tower");
  const W = SIZE, H = SIZE;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const rand = mulberry32(77);

  // Worm's eye: looking UP at a tower from below.
  // Third VP is FAR ABOVE the canvas — verticals converge upward.
  const leftVP = { x: -0.3, y: 0.85 };
  const rightVP = { x: 1.3, y: 0.85 };
  const thirdVP = { x: 0.5, y: -0.6 }; // Above canvas — closer for dramatic convergence

  const lvpX = leftVP.x * W;
  const lvpY = leftVP.y * H;
  const rvpX = rightVP.x * W;
  const rvpY = rightVP.y * H;
  const tvpX = thirdVP.x * W;
  const tvpY = thirdVP.y * H;

  // Dark dramatic sky gradient (looking up)
  const bgGrad = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H * 1.2);
  bgGrad.addColorStop(0, "#0A0A2A");
  bgGrad.addColorStop(0.5, "#151535");
  bgGrad.addColorStop(1, "#1A1A45");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // A few stars in the sky (top portion)
  for (let i = 0; i < 60; i++) {
    const sx = rand() * W;
    const sy = rand() * H * 0.4;
    const sr = 0.5 + rand() * 1.5;
    ctx.fillStyle = `rgba(200,200,255,${0.2 + rand() * 0.5})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  const windowLitColor = "#FFDD66";
  const windowWarmColor = "#FFB844";
  const windowDarkColor = "#1A1A35";

  // Tower: base spans the bottom, edges converge upward toward thirdVP
  // We define the tower base at the bottom of the canvas, wide,
  // and let the edges converge toward tvpX, tvpY (above canvas)
  const towerBaseY = H * 1.05; // slightly below canvas edge
  const towerBaseWidth = W * 0.85;
  const towerCenterX = W * 0.5;

  // Two faces of the tower (left wall, right wall)
  // Left face: inner edge at center, outer edge at left
  // Right face: inner edge at center, outer edge at right
  // Left face floor lines converge to right VP; right face to left VP
  // (each face's horizontals recede toward the VP on the opposite side)
  const faces = [
    { innerBaseX: towerCenterX - 10, outerBaseX: towerCenterX - towerBaseWidth / 2, fillColor: "#1A1A3A", lightMul: 0.85, hVpX: lvpX, hVpY: lvpY },
    { innerBaseX: towerCenterX + 10, outerBaseX: towerCenterX + towerBaseWidth / 2, fillColor: "#222250", lightMul: 1.0, hVpX: rvpX, hVpY: rvpY },
  ];

  // Find where a line from (px,py) toward (vpx,vpy) intersects the line (ax,ay)-(bx,by)
  function vpIntersectEdge(px, py, vpx, vpy, ax, ay, bx, by) {
    const pt = lineIntersection(px, py, vpx, vpy, ax, ay, bx, by);
    if (!pt) return { x: (ax + bx) / 2, y: (ay + by) / 2 };
    return pt; // { x, y }
  }

  for (const face of faces) {
    // Vertical edges converging up toward thirdVP
    const innerLine = clipLineToRect(face.innerBaseX, towerBaseY, tvpX, tvpY, 0, 0, W, H);
    const outerLine = clipLineToRect(face.outerBaseX, towerBaseY, tvpX, tvpY, 0, 0, W, H);

    if (!innerLine || !outerLine) continue;

    // Fill the face
    ctx.fillStyle = face.fillColor;
    ctx.beginPath();
    ctx.moveTo(innerLine[0], innerLine[1]);
    ctx.lineTo(innerLine[2], innerLine[3]);
    ctx.lineTo(outerLine[2], outerLine[3]);
    ctx.lineTo(outerLine[0], outerLine[1]);
    ctx.closePath();
    ctx.fill();

    // Edge lines
    ctx.strokeStyle = "rgba(80,80,140,0.6)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(innerLine[0], innerLine[1]);
    ctx.lineTo(innerLine[2], innerLine[3]);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(outerLine[0], outerLine[1]);
    ctx.lineTo(outerLine[2], outerLine[3]);
    ctx.stroke();

    // Windows: floor lines converge toward the face's horizontal VP
    const floors = 25;
    for (let f = 0; f < floors; f++) {
      const t0 = (f + 0.15) / floors;
      const t1 = (f + 0.85) / floors;

      // Points on inner edge at t0 and t1
      const ip0x = innerLine[0] + (innerLine[2] - innerLine[0]) * t0;
      const ip0y = innerLine[1] + (innerLine[3] - innerLine[1]) * t0;
      const ip1x = innerLine[0] + (innerLine[2] - innerLine[0]) * t1;
      const ip1y = innerLine[1] + (innerLine[3] - innerLine[1]) * t1;

      // Floor lines: from inner edge point toward horizontal VP, intersected with outer edge
      const o0 = vpIntersectEdge(ip0x, ip0y, face.hVpX, face.hVpY,
        outerLine[0], outerLine[1], outerLine[2], outerLine[3]);
      const o1 = vpIntersectEdge(ip1x, ip1y, face.hVpX, face.hVpY,
        outerLine[0], outerLine[1], outerLine[2], outerLine[3]);

      // Floor separator line
      ctx.strokeStyle = "rgba(60,60,110,0.3)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(ip0x, ip0y);
      ctx.lineTo(o0.x, o0.y);
      ctx.stroke();

      const floorWidth = Math.abs(o0.x - ip0x);
      const windowsPerFloor = Math.max(1, Math.min(5, Math.floor(floorWidth / 20)));

      for (let w = 0; w < windowsPerFloor; w++) {
        const pad = 0.15;
        const cw = (1 - 2 * pad) / windowsPerFloor;
        const u0 = pad + w * cw + cw * 0.15;
        const u1 = pad + w * cw + cw * 0.85;

        // 4 corners: interpolate along the two floor lines
        const tlx = ip0x + (o0.x - ip0x) * u0;
        const tly = ip0y + (o0.y - ip0y) * u0;
        const trx = ip0x + (o0.x - ip0x) * u1;
        const try_ = ip0y + (o0.y - ip0y) * u1;
        const blx = ip1x + (o1.x - ip1x) * u0;
        const bly = ip1y + (o1.y - ip1y) * u0;
        const brx = ip1x + (o1.x - ip1x) * u1;
        const bry = ip1y + (o1.y - ip1y) * u1;

        const isLit = rand() > 0.4;
        if (isLit) {
          const warm = rand() > 0.5;
          ctx.fillStyle = warm ? windowWarmColor : windowLitColor;
          ctx.globalAlpha = (0.5 + rand() * 0.5) * face.lightMul;
        } else {
          ctx.fillStyle = windowDarkColor;
          ctx.globalAlpha = 0.5;
        }
        ctx.beginPath();
        ctx.moveTo(tlx, tly);
        ctx.lineTo(trx, try_);
        ctx.lineTo(brx, bry);
        ctx.lineTo(blx, bly);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Center edge highlight (the corner where walls meet)
  ctx.strokeStyle = "rgba(100,100,180,0.7)";
  ctx.lineWidth = 2;
  const centerLine = clipLineToRect(towerCenterX, towerBaseY, tvpX, tvpY, 0, 0, W, H);
  if (centerLine) {
    ctx.beginPath();
    ctx.moveTo(centerLine[0], centerLine[1]);
    ctx.lineTo(centerLine[2], centerLine[3]);
    ctx.stroke();
  }

  // Overlay the three-point grid
  const gridCanvas = createCanvas(W, H);
  const gridCtx = gridCanvas.getContext("2d");
  threePointGridLayerType.render(
    {
      ...threePointGridLayerType.createDefault(),
      leftVP,
      rightVP,
      thirdVP,
      horizonLineVisible: false,
      linesPerVP: 10,
      depthEasing: "cubic",
      depthStyling: true,
      guideColor: "rgba(100,120,255,0.35)",
      lineWidth: 0.5,
      dashPattern: "3,5",
    },
    gridCtx, full(W, H), resources,
  );

  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.15;
  ctx.drawImage(gridCanvas, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  // Window glow bloom
  const bloomCanvas = createCanvas(W / 6, H / 6);
  const bloomCtx = bloomCanvas.getContext("2d");
  bloomCtx.drawImage(canvas, 0, 0, W / 6, H / 6);
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.25;
  ctx.drawImage(bloomCanvas, 0, 0, W, H);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  // Dark vignette centered lower (looking up from below)
  const vigGrad = ctx.createRadialGradient(W / 2, H * 0.6, W * 0.25, W / 2, H * 0.6, W * 0.7);
  vigGrad.addColorStop(0, "rgba(0,0,0,0)");
  vigGrad.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, W, H);

  save(canvas, "recipe-03-vertigo-tower.png");
}

// =====================================================================
// Recipe 4: Isometric Workshop
// =====================================================================

function renderIsometricWorkshop() {
  console.log("Recipe 4: Isometric Workshop");
  const W = SIZE, H = SIZE;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const rand = mulberry32(123);

  // Light background
  ctx.fillStyle = "#F0EDE8";
  ctx.fillRect(0, 0, W, H);

  // Isometric parameters
  const angleDeg = 30;
  const cellSize = 40;
  const angleRad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(angleRad) * cellSize;
  const dy = Math.sin(angleRad) * cellSize;
  const originX = W / 2;
  const originY = H / 2;

  // Pastel palette for cubes
  const pastelTops = ["#A8D8EA", "#FFD3B6", "#DCEDC1", "#E8D5F5", "#FFE5B4", "#C7CEEA"];
  const pastelLefts = ["#7AB8CC", "#E0A880", "#B8D49A", "#C5A8D8", "#E0C490", "#A0A8C8"];
  const pastelRights = ["#5A98AC", "#C08860", "#98B47A", "#A588B8", "#C0A470", "#8088A8"];

  // Draw isometric cube at grid position
  function drawCube(gx, gy, height, colorIdx) {
    const cx = originX + gx * dx - gy * dx;
    const cy = originY + gx * dy + gy * dy;
    const h = height * cellSize * 0.5;

    const topColor = pastelTops[colorIdx % pastelTops.length];
    const leftColor = pastelLefts[colorIdx % pastelLefts.length];
    const rightColor = pastelRights[colorIdx % pastelRights.length];

    // Top face
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h);
    ctx.lineTo(cx + dx, cy + dy - h);
    ctx.lineTo(cx, cy + 2 * dy - h);
    ctx.lineTo(cx - dx, cy + dy - h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Left face
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(cx - dx, cy + dy - h);
    ctx.lineTo(cx, cy + 2 * dy - h);
    ctx.lineTo(cx, cy + 2 * dy);
    ctx.lineTo(cx - dx, cy + dy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right face
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(cx + dx, cy + dy - h);
    ctx.lineTo(cx, cy + 2 * dy - h);
    ctx.lineTo(cx, cy + 2 * dy);
    ctx.lineTo(cx + dx, cy + dy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Place cubes on a grid — paint back-to-front for correct occlusion
  const gridRange = 6;
  const cubePositions = [];

  for (let gx = -gridRange; gx <= gridRange; gx++) {
    for (let gy = -gridRange; gy <= gridRange; gy++) {
      // Scatter cubes on roughly half of grid positions
      if (rand() > 0.45) continue;

      const cx = originX + gx * dx - gy * dx;
      const cy = originY + gx * dy + gy * dy;
      // Skip cubes that are off-canvas
      if (cx < -cellSize || cx > W + cellSize || cy < -cellSize || cy > H + cellSize) continue;

      const height = 1 + Math.floor(rand() * 3);
      const colorIdx = Math.floor(rand() * pastelTops.length);
      cubePositions.push({ gx, gy, height, colorIdx, sortY: cy });
    }
  }

  // Sort back-to-front (painter's algorithm — larger sortY drawn later)
  cubePositions.sort((a, b) => a.sortY - b.sortY);

  for (const cube of cubePositions) {
    drawCube(cube.gx, cube.gy, cube.height, cube.colorIdx);
  }

  // Overlay the isometric grid
  const gridCanvas = createCanvas(W, H);
  const gridCtx = gridCanvas.getContext("2d");
  isometricGridLayerType.render(
    {
      ...isometricGridLayerType.createDefault(),
      angle: angleDeg,
      cellSize,
      showVerticals: true,
      showLeftDiagonals: true,
      showRightDiagonals: true,
      origin: { x: 0.5, y: 0.5 },
      guideColor: "rgba(100,100,120,0.25)",
      lineWidth: 0.5,
      dashPattern: "2,4",
    },
    gridCtx, full(W, H), resources,
  );

  ctx.globalAlpha = 0.4;
  ctx.drawImage(gridCanvas, 0, 0);
  ctx.globalAlpha = 1;

  // Subtle shadow under the whole scene
  const shadowGrad = ctx.createRadialGradient(W / 2, H / 2, W * 0.1, W / 2, H / 2, W * 0.6);
  shadowGrad.addColorStop(0, "rgba(0,0,0,0)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(0, 0, W, H);

  save(canvas, "recipe-04-isometric-workshop.png");
}

// =====================================================================
// Export & Run
// =====================================================================

function renderAll() {
  console.log("\n=== Perspective Scenes ===\n");
  renderSynthwaveSunset();
  renderCityCorner();
  renderVertigoTower();
  renderIsometricWorkshop();
  console.log("\nDone! Check the renders/ directory.");
}

module.exports = { renderAll };

// Run directly
renderAll();
