/**
 * Blend & Fill Experiments
 *
 * 1. "Blend Catalog"       -- shape morphing: circle->star, rect->triangle, etc.
 * 2. "Color Gradients"     -- Oklab color blending with different easing curves
 * 3. "Spine Paths"         -- blends along curved spines
 * 4. "Fill Strategies"     -- hatch, crosshatch, stipple, scumble, contour side by side
 * 5. "Fill Shading"        -- linear, radial, noise shading on hatched fills
 * 6. "Blend + Fill Combo"  -- filled shapes blended together
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
  blendLayerType,
  rectLayerType,
  ellipseLayerType,
  polygonLayerType,
  starLayerType,
} = require("../../../plugin-shapes/dist/index.cjs");

const {
  fillLayerType,
  strokeLayerType,
  inkLayerType,
  watercolorLayerType,
  BRUSH_PRESETS,
  preloadTextureTip,
} = require("../../../plugin-painting/dist/index.cjs");

const {
  paperLayerType,
} = require("@genart-dev/plugin-textures");

// --- Shared setup ---

const outDir = path.join(__dirname, "renders");
fs.mkdirSync(outDir, { recursive: true });

const resources = { getFont: () => null, getImage: () => null, theme: "light", pixelRatio: 1 };

function full(w, h) {
  return { x: 0, y: 0, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 };
}

function rect(x, y, w, h) {
  return { x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 };
}

function save(canvas, name) {
  const filePath = path.join(outDir, name);
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));
  console.log(`  -> ${filePath}`);
}

// Preload texture tips
for (const b of Object.values(BRUSH_PRESETS)) {
  if (b.tipType === "texture" && b.tipTexture) {
    preloadTextureTip(b.tipTexture);
  }
}

// --- Demo 1: Blend Catalog ---
// Shows shape morphing between different primitives

function renderBlendCatalog() {
  console.log("Demo 1: Blend Catalog");
  const W = 1200, H = 900;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#faf8f2";
  ctx.fillRect(0, 0, W, H);

  const blends = [
    {
      label: "circle -> star-5",
      startPath: "circle", endPath: "star-5",
      startFill: "#E63946", endFill: "#457B9D",
      steps: 8,
    },
    {
      label: "rect -> triangle",
      startPath: "rect", endPath: "triangle",
      startFill: "#2A9D8F", endFill: "#E9C46A",
      steps: 10,
    },
    {
      label: "polygon-6 -> star-8",
      startPath: "polygon-6", endPath: "star-8",
      startFill: "#264653", endFill: "#F4A261",
      steps: 12,
    },
    {
      label: "triangle -> circle",
      startPath: "triangle", endPath: "circle",
      startFill: "#6A0572", endFill: "#F72585",
      steps: 14,
    },
  ];

  const rowH = (H - 60) / blends.length;

  for (let i = 0; i < blends.length; i++) {
    const b = blends[i];
    const y = 40 + i * rowH;

    // Label
    ctx.fillStyle = "#333";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(b.label, 20, y + 20);

    const props = {
      ...blendLayerType.createDefault(),
      start: JSON.stringify({
        path: b.startPath, fill: b.startFill, stroke: null,
        strokeWidth: 0, opacity: 1, scale: 1, rotation: 0,
      }),
      end: JSON.stringify({
        path: b.endPath, fill: b.endFill, stroke: null,
        strokeWidth: 0, opacity: 1, scale: 1, rotation: 0,
      }),
      mode: "steps",
      steps: b.steps,
      easing: "linear",
      showEndpoints: true,
    };

    blendLayerType.render(props, ctx, rect(20, y + 30, W - 40, rowH - 50), resources);
  }

  save(canvas, "01-blend-catalog.png");
}

// --- Demo 2: Color Gradients ---
// Same circle->circle blend with different easing functions

function renderColorGradients() {
  console.log("Demo 2: Color Gradients");
  const W = 1000, H = 800;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, W, H);

  const easings = ["linear", "ease-in", "ease-out", "ease-in-out"];
  const colorPairs = [
    { start: "#FF0000", end: "#0000FF", label: "Red -> Blue" },
    { start: "#FFD700", end: "#4B0082", label: "Gold -> Indigo" },
    { start: "#00FF88", end: "#FF0066", label: "Mint -> Magenta" },
  ];

  const cols = easings.length;
  const rows = colorPairs.length;
  const cellW = (W - 40) / cols;
  const cellH = (H - 80) / rows;

  // Column headers
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "bold 13px sans-serif";
  for (let c = 0; c < cols; c++) {
    ctx.fillText(easings[c], 30 + c * cellW, 24);
  }

  for (let r = 0; r < rows; r++) {
    const pair = colorPairs[r];

    // Row label
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "12px sans-serif";
    ctx.fillText(pair.label, 30, 55 + r * cellH);

    for (let c = 0; c < cols; c++) {
      const props = {
        ...blendLayerType.createDefault(),
        start: JSON.stringify({
          path: "circle", fill: pair.start, stroke: null,
          strokeWidth: 0, opacity: 1, scale: 1, rotation: 0,
        }),
        end: JSON.stringify({
          path: "circle", fill: pair.end, stroke: null,
          strokeWidth: 0, opacity: 1, scale: 1, rotation: 0,
        }),
        mode: "steps",
        steps: 20,
        easing: easings[c],
        showEndpoints: true,
        interpolatePath: false,
      };

      blendLayerType.render(
        props, ctx,
        rect(20 + c * cellW, 60 + r * cellH, cellW - 10, cellH - 20),
        resources,
      );
    }
  }

  save(canvas, "02-color-gradients.png");
}

// --- Demo 3: Spine Paths ---
// Blends along curved spine paths

function renderSpinePaths() {
  console.log("Demo 3: Spine Paths");
  const W = 1200, H = 900;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f0ebe3";
  ctx.fillRect(0, 0, W, H);

  // Paper texture
  paperLayerType.render(
    { ...paperLayerType.createDefault(), preset: "cold-press", roughness: -1, color: "#ece5d8", seed: 5 },
    ctx, full(W, H), resources,
  );

  // Row layout: 3 rows with generous height
  // refSize = Math.min(bounds.width, bounds.height) in blend renderer,
  // so keep bounds height small to control shape size, but provide enough
  // vertical room by using clip + overflow-friendly positioning.
  const rowH = 240;
  const pad = 30;

  // --- Row 1: Straight spine ---
  ctx.fillStyle = "#444";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("Straight Spine — star-5 to circle, ease-in-out, scale 0.45 -> 0.15", pad, pad);

  blendLayerType.render({
    ...blendLayerType.createDefault(),
    start: JSON.stringify({
      path: "star-5", fill: "#E63946", stroke: "#1D3557", strokeWidth: 2,
      opacity: 1, scale: 0.45, rotation: 0,
    }),
    end: JSON.stringify({
      path: "circle", fill: "#A8DADC", stroke: "#1D3557", strokeWidth: 1,
      opacity: 0.6, scale: 0.15, rotation: 180,
    }),
    mode: "steps", steps: 14, easing: "ease-in-out", showEndpoints: true,
    spine: JSON.stringify({ type: "straight" }),
  }, ctx, rect(pad, pad + 10, W - pad * 2, rowH), resources);

  // --- Row 2: Curved spine (arc) ---
  const row2Y = pad + rowH + 40;
  const r2Bounds = rect(pad, row2Y + 10, W - pad * 2, rowH);
  ctx.fillStyle = "#444";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("Curved Spine (arc) — hexagon to star-8, linear", pad, row2Y);

  // spine.points for "path" mode are absolute pixel coords (not normalized)
  const arcPoints = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    arcPoints.push({
      x: r2Bounds.x + t * r2Bounds.width,
      y: r2Bounds.y + r2Bounds.height * (0.5 - 0.35 * Math.sin(t * Math.PI)),
    });
  }

  blendLayerType.render({
    ...blendLayerType.createDefault(),
    start: JSON.stringify({
      path: "polygon-6", fill: "#2A9D8F", stroke: null, strokeWidth: 0,
      opacity: 1, scale: 0.55, rotation: 0,
    }),
    end: JSON.stringify({
      path: "star-8", fill: "#E76F51", stroke: null, strokeWidth: 0,
      opacity: 1, scale: 0.25, rotation: 45,
    }),
    mode: "steps", steps: 14, easing: "linear", showEndpoints: true,
    spine: JSON.stringify({ type: "path", points: arcPoints }),
  }, ctx, r2Bounds, resources);

  // --- Row 3: S-curve spine ---
  const row3Y = row2Y + rowH + 40;
  const r3Bounds = rect(pad, row3Y + 10, W - pad * 2, rowH);
  ctx.fillStyle = "#444";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("S-Curve Spine — rect to triangle, ease-in-out", pad, row3Y);

  const sPoints = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    sPoints.push({
      x: r3Bounds.x + t * r3Bounds.width,
      y: r3Bounds.y + r3Bounds.height * (0.5 + 0.3 * Math.sin(t * Math.PI * 2)),
    });
  }

  blendLayerType.render({
    ...blendLayerType.createDefault(),
    start: JSON.stringify({
      path: "rect", fill: "#264653", stroke: "#E9C46A", strokeWidth: 2,
      opacity: 1, scale: 0.45, rotation: 0,
    }),
    end: JSON.stringify({
      path: "triangle", fill: "#E9C46A", stroke: "#264653", strokeWidth: 2,
      opacity: 1, scale: 0.3, rotation: 120,
    }),
    mode: "steps", steps: 16, easing: "ease-in-out", showEndpoints: true,
    spine: JSON.stringify({ type: "path", points: sPoints }),
  }, ctx, r3Bounds, resources);

  save(canvas, "03-spine-paths.png");
}

// --- Demo 4: Fill Strategies ---
// All 5 fill strategies side by side

function renderFillStrategies() {
  console.log("Demo 4: Fill Strategies");
  const W = 1200, H = 900;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#faf6ee";
  ctx.fillRect(0, 0, W, H);

  // Paper texture
  paperLayerType.render(
    { ...paperLayerType.createDefault(), preset: "cold-press", roughness: -1, color: "#f5f0e5", seed: 12 },
    ctx, full(W, H), resources,
  );

  const strategies = [
    {
      label: "Hatch (45deg, spacing 8)",
      strategy: { type: "hatch", angle: 45, spacing: 8 },
      brushId: "ink-pen", size: 3,
    },
    {
      label: "Crosshatch (45/135, decay 0.7)",
      strategy: { type: "crosshatch", angles: [45, 135], spacing: 8, passDecay: 0.7 },
      brushId: "ink-pen", size: 2,
    },
    {
      label: "Stipple (poisson, density 50)",
      strategy: { type: "stipple", density: 50, distribution: "poisson" },
      brushId: "ink-pen", size: 3,
    },
    {
      label: "Scumble (curvature 0.6)",
      strategy: { type: "scumble", density: 18, strokeLength: 20, curvature: 0.6 },
      brushId: "round-hard", size: 2,
    },
    {
      label: "Contour (spacing 10)",
      strategy: { type: "contour", spacing: 10, smoothing: 0.4 },
      brushId: "ink-pen", size: 2,
    },
  ];

  // Two rows: top row = 3 fills in rect region, bottom row = 2 fills in ellipse region
  const topCount = 3;
  const botCount = 2;
  const pad = 30;
  const topCellW = (W - pad * (topCount + 1)) / topCount;
  const topCellH = 340;
  const botCellW = (W - pad * (botCount + 1)) / botCount;
  const botCellH = 340;

  for (let i = 0; i < strategies.length; i++) {
    const s = strategies[i];
    let x, y, cw, ch, regionJson;

    if (i < topCount) {
      x = pad + i * (topCellW + pad);
      y = 50;
      cw = topCellW;
      ch = topCellH;
      regionJson = JSON.stringify({ type: "bounds" });
    } else {
      const bi = i - topCount;
      x = pad + bi * (botCellW + pad);
      y = 50 + topCellH + 80;
      cw = botCellW;
      ch = botCellH;
      // Ellipse region for bottom row
      regionJson = JSON.stringify({
        type: "ellipse",
        cx: x + cw / 2,
        cy: y + ch / 2,
        rx: cw / 2 - 20,
        ry: ch / 2 - 20,
      });
    }

    // Label
    ctx.fillStyle = "#333";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(s.label, x, y - 10);

    // Light cell background
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillRect(x, y, cw, ch);
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, cw, ch);
    ctx.restore();

    fillLayerType.render({
      ...fillLayerType.createDefault(),
      brushId: s.brushId,
      color: "#1a1a1a",
      size: s.size,
      region: regionJson,
      strategy: JSON.stringify(s.strategy),
      shading: JSON.stringify({ type: "uniform" }),
      shadingAffects: JSON.stringify(["density"]),
      seed: 42 + i * 77,
      opacity: 0.85,
    }, ctx, rect(x, y, cw, ch), resources);
  }

  save(canvas, "04-fill-strategies.png");
}

// --- Demo 5: Fill Shading ---
// Same hatch fill with different shading functions

function renderFillShading() {
  console.log("Demo 5: Fill Shading");
  const W = 1200, H = 600;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f5f1e8";
  ctx.fillRect(0, 0, W, H);

  const shadings = [
    { label: "Uniform", shading: { type: "uniform" } },
    { label: "Linear (0deg)", shading: { type: "linear", angle: 0, range: [0.1, 1.0] } },
    { label: "Radial (center)", shading: { type: "radial", cx: 0.5, cy: 0.5, range: [1.0, 0.1] } },
    { label: "Noise (scale 60)", shading: { type: "noise", seed: 33, scale: 60, range: [0.2, 1.0] } },
  ];

  const cols = shadings.length;
  const pad = 20;
  const cellW = (W - pad * (cols + 1)) / cols;
  const cellH = H - 120;

  for (let i = 0; i < shadings.length; i++) {
    const s = shadings[i];
    const x = pad + i * (cellW + pad);
    const y = 50;

    // Label
    ctx.fillStyle = "#333";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(s.label, x, y - 12);

    // Cell bg
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, cellW, cellH);
    ctx.strokeStyle = "#ddd";
    ctx.strokeRect(x, y, cellW, cellH);
    ctx.restore();

    fillLayerType.render({
      ...fillLayerType.createDefault(),
      brushId: "ink-pen",
      color: "#2a1a0a",
      size: 2.5,
      region: JSON.stringify({ type: "bounds" }),
      strategy: JSON.stringify({ type: "hatch", angle: 45, spacing: 6 }),
      shading: JSON.stringify(s.shading),
      shadingAffects: JSON.stringify(["density"]),
      seed: 42,
      opacity: 0.9,
    }, ctx, rect(x, y, cellW, cellH), resources);
  }

  // Title
  ctx.fillStyle = "rgba(42,26,10,0.4)";
  ctx.font = "italic 16px Georgia, serif";
  ctx.fillText("Hatch fill with different shading functions", pad, H - 20);

  save(canvas, "05-fill-shading.png");
}

// --- Demo 6: Blend + Fill Combo ---
// A composition combining blend morphing with hatched/stippled fills and painting layers

function renderBlendFillCombo() {
  console.log("Demo 6: Blend + Fill Combo");
  const W = 900, H = 1200;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Dark background
  ctx.fillStyle = "#0e0c14";
  ctx.fillRect(0, 0, W, H);

  // Subtle watercolor wash behind everything
  watercolorLayerType.render({
    ...watercolorLayerType.createDefault(),
    field: "radial:0.5:0.4:diverge",
    fieldCols: 20, fieldRows: 20,
    colors: JSON.stringify(["#1a0a2e", "#2a1848"]),
    dilution: 0.3, granulation: 0.4, edgeStyle: "diffuse",
    opacity: 0.6, seed: 5,
  }, ctx, full(W, H), resources);

  // --- Diagonal blend sweep across the top-left ---
  ctx.save();
  ctx.globalAlpha = 0.85;
  const sweepBounds = rect(-40, 30, W * 0.7, 300);
  blendLayerType.render({
    ...blendLayerType.createDefault(),
    start: JSON.stringify({
      path: "circle", fill: "#E63946", stroke: null, strokeWidth: 0,
      opacity: 0.9, scale: 0.6, rotation: 0,
    }),
    end: JSON.stringify({
      path: "star-5", fill: "#457B9D", stroke: null, strokeWidth: 0,
      opacity: 0.4, scale: 0.15, rotation: 72,
    }),
    mode: "steps", steps: 18, easing: "ease-in-out", showEndpoints: true,
  }, ctx, sweepBounds, resources);
  ctx.restore();

  // --- Large crosshatch fill — off-center left, tall ellipse ---
  fillLayerType.render({
    ...fillLayerType.createDefault(),
    brushId: "ink-pen",
    color: "#c0a0ff",
    size: 2,
    region: JSON.stringify({
      type: "ellipse",
      cx: 280, cy: 620,
      rx: 220, ry: 320,
    }),
    strategy: JSON.stringify({ type: "crosshatch", angles: [30, 120], spacing: 7, passDecay: 0.65 }),
    shading: JSON.stringify({ type: "radial", cx: 0.5, cy: 0.5, range: [1, 0.2] }),
    shadingAffects: JSON.stringify(["density", "opacity"]),
    seed: 100,
    opacity: 0.75,
  }, ctx, rect(60, 300, 440, 640), resources);

  // --- Stipple cluster — upper right ---
  fillLayerType.render({
    ...fillLayerType.createDefault(),
    brushId: "ink-pen",
    color: "#ffb088",
    size: 3,
    region: JSON.stringify({
      type: "ellipse",
      cx: 700, cy: 320,
      rx: 160, ry: 220,
    }),
    strategy: JSON.stringify({ type: "stipple", density: 60, distribution: "poisson" }),
    shading: JSON.stringify({ type: "noise", seed: 55, scale: 40, range: [0.3, 1.0] }),
    shadingAffects: JSON.stringify(["density"]),
    seed: 200,
    opacity: 0.85,
  }, ctx, rect(540, 100, 320, 440), resources);

  // --- Diagonal blend arc from mid-right down to bottom-left ---
  const diagBounds = rect(80, 600, W - 160, 400);
  const diagArc = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    diagArc.push({
      x: diagBounds.x + diagBounds.width * (1 - t),
      y: diagBounds.y + diagBounds.height * (t * 0.8 + 0.1),
    });
  }

  blendLayerType.render({
    ...blendLayerType.createDefault(),
    start: JSON.stringify({
      path: "polygon-8", fill: "#2A9D8F", stroke: "#F4A261", strokeWidth: 2,
      opacity: 0.9, scale: 0.55, rotation: 0,
    }),
    end: JSON.stringify({
      path: "star-6", fill: "#F4A261", stroke: "#2A9D8F", strokeWidth: 2,
      opacity: 0.7, scale: 0.2, rotation: 60,
    }),
    mode: "steps", steps: 16, easing: "ease-out", showEndpoints: true,
    spine: JSON.stringify({ type: "path", points: diagArc }),
  }, ctx, diagBounds, resources);

  // --- Scumble texture — lower right corner ---
  fillLayerType.render({
    ...fillLayerType.createDefault(),
    brushId: "round-hard",
    color: "#e0d0c0",
    size: 2,
    region: JSON.stringify({
      type: "rect",
      x: 540, y: 820,
      width: 320, height: 340,
    }),
    strategy: JSON.stringify({ type: "scumble", density: 20, strokeLength: 18, curvature: 0.7 }),
    shading: JSON.stringify({ type: "linear", angle: 135, range: [0.3, 1.0] }),
    shadingAffects: JSON.stringify(["density", "weight"]),
    seed: 300,
    opacity: 0.6,
  }, ctx, rect(540, 820, 320, 340), resources);

  // Ink accent lines
  inkLayerType.render({
    ...inkLayerType.createDefault(),
    field: "vortex:0.5:0.5:0.2",
    fieldCols: 16, fieldRows: 16,
    colors: JSON.stringify(["#f0c0e0"]),
    weight: 0.5, taper: "both", style: "brush",
    opacity: 0.2, seed: 88,
  }, ctx, full(W, H), resources);

  // Title
  ctx.fillStyle = "rgba(200,160,255,0.5)";
  ctx.font = "italic 20px Georgia, serif";
  ctx.fillText("Blend + Fill Composition", 50, H - 30);

  save(canvas, "06-blend-fill-combo.png");
}

// --- Gallery composite ---

function renderGallery() {
  console.log("Gallery composite");
  const files = [
    "01-blend-catalog.png",
    "02-color-gradients.png",
    "03-spine-paths.png",
    "04-fill-strategies.png",
    "05-fill-shading.png",
    "06-blend-fill-combo.png",
  ];

  const images = files.map((f) => {
    const buf = fs.readFileSync(path.join(outDir, f));
    const img = new canvasPkg.Image();
    img.src = buf;
    return img;
  });

  const cols = 3, rows = 2, padding = 16;
  const thumbW = 400, thumbH = 300;
  const gW = cols * thumbW + (cols + 1) * padding;
  const gH = rows * thumbH + (rows + 1) * padding + 36;
  const gCanvas = createCanvas(gW, gH);
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

    gctx.fillStyle = "rgba(255,255,255,0.5)";
    gctx.font = "12px sans-serif";
    gctx.fillText(files[i].replace(".png", ""), x + 4, y + thumbH + 14);
  }

  gctx.fillStyle = "rgba(255,255,255,0.7)";
  gctx.font = "bold 15px sans-serif";
  gctx.fillText("Blend & Fill Experiments", padding, gH - 10);

  save(gCanvas, "blend-fill-gallery.png");
}

// --- Run all ---

console.log("\nBlend & Fill Experiments\n");

renderBlendCatalog();
renderColorGradients();
renderSpinePaths();
renderFillStrategies();
renderFillShading();
renderBlendFillCombo();
renderGallery();

console.log("\nDone! All renders saved to renders/\n");
