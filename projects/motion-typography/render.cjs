/**
 * Motion Typography — Kinetic type compositions
 *
 * 1. "Word Cascade"       — words falling into position with staggered easing
 * 2. "Breathing Text"     — text scaling with a sine-wave breath cycle
 * 3. "Typewriter"         — characters appearing one by one with cursor blink
 * 4. "Scatter & Gather"   — letters explode outward then reassemble
 * 5. "Wave Text"          — baseline wave animation rippling through a sentence
 * 6. "Motion Type Sheet"  — contact sheet of key frames from each sequence
 *
 * Plugins used:
 *   - @genart-dev/plugin-typography  (textLayerType, BUILT_IN_FONTS)
 *   - @genart-dev/plugin-animation   (interpolateProperty, applyKeyframeEasing)
 *
 * Output: renders/01-word-cascade.png .. renders/motion-type-sheet.png
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
  textLayerType,
} = require("../../../plugin-typography/dist/index.cjs");

const {
  interpolateProperty,
  applyKeyframeEasing,
} = require("../../../plugin-animation/dist/index.cjs");

// --- Shared setup ---

const outDir = path.join(__dirname, "renders");
fs.mkdirSync(outDir, { recursive: true });

const resources = { getFont: () => null, getImage: () => null, theme: "light", pixelRatio: 1 };

function save(canvas, name) {
  const filePath = path.join(outDir, name);
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));
  console.log(`  -> ${filePath}`);
}

function renderLabeledGrid(title, cells, cols, cellW, cellH, padding, bgColor = "#1a1a2e") {
  const rows = Math.ceil(cells.length / cols);
  const W = cols * cellW + (cols + 1) * padding;
  const H = rows * cellH + (rows + 1) * padding + 50;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#eee";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(title, padding, 30);

  for (let i = 0; i < cells.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * (cellW + padding);
    const y = 50 + padding + row * (cellH + padding);

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, y - 1, cellW + 2, cellH + 2);
    ctx.drawImage(cells[i].canvas, x, y, cellW, cellH);

    ctx.fillStyle = "#888";
    ctx.font = "12px sans-serif";
    ctx.fillText(cells[i].label, x + 4, y + cellH + 14);
  }

  return canvas;
}

// Helper: render a horizontal frame strip
function renderFrameStrip(title, frameCount, frameW, frameH, renderFrame) {
  const padding = 4;
  const W = frameCount * (frameW + padding) + padding;
  const H = frameH + 50;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0d0d1a";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#ccc";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText(title, padding, 18);

  for (let i = 0; i < frameCount; i++) {
    const t = i / (frameCount - 1);
    const fc = createCanvas(frameW, frameH);
    const fctx = fc.getContext("2d");
    fctx.fillStyle = "#16162a";
    fctx.fillRect(0, 0, frameW, frameH);

    renderFrame(fctx, frameW, frameH, t, i);

    const x = padding + i * (frameW + padding);
    const y = 30;
    ctx.drawImage(fc, x, y);

    ctx.fillStyle = "#666";
    ctx.font = "9px sans-serif";
    ctx.fillText(`f${i}`, x + 2, y + frameH + 12);
  }

  return canvas;
}

// ─── Scene 1: Word Cascade ──────────────────────────────────────────────────

function renderWordCascade() {
  console.log("Scene 1: Word Cascade");
  const words = ["Motion", "Design", "Creates", "Visual", "Poetry"];
  const frameCount = 8;

  const canvas = renderFrameStrip("Word Cascade — Staggered Drop-In", frameCount, 200, 250, (ctx, w, h, t) => {
    for (let i = 0; i < words.length; i++) {
      const delay = i * 0.15;
      const localT = Math.max(0, Math.min(1, (t - delay) / (1 - delay * words.length / (words.length - 1))));
      const easedT = applyKeyframeEasing(localT, "ease-out") ?? localT;

      const startY = -40;
      const endY = 30 + i * 42;
      const y = startY + (endY - startY) * easedT;
      const alpha = easedT;

      textLayerType.render({
        ...textLayerType.createDefault(),
        text: words[i],
        fontFamily: "Helvetica",
        fontSize: 32,
        fontWeight: "700",
        color: `rgba(255,255,255,${alpha.toFixed(2)})`,
        align: "center",
        baseline: "top",
      }, ctx, { x: 0, y, width: w, height: 40, rotation: 0, scaleX: 1, scaleY: 1 }, resources);
    }
  });

  save(canvas, "01-word-cascade.png");
}

// ─── Scene 2: Breathing Text ────────────────────────────────────────────────

function renderBreathingText() {
  console.log("Scene 2: Breathing Text");
  const frameCount = 8;

  const canvas = renderFrameStrip("Breathing Text — Sine-Wave Scale Oscillation", frameCount, 250, 150, (ctx, w, h, t) => {
    const breath = 1.0 + 0.08 * Math.sin(t * Math.PI * 2);
    const alpha = 0.6 + 0.4 * Math.sin(t * Math.PI * 2);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(breath, breath);
    ctx.translate(-w / 2, -h / 2);

    textLayerType.render({
      ...textLayerType.createDefault(),
      text: "Breathe",
      fontFamily: "Georgia",
      fontSize: 48,
      fontWeight: "400",
      fontStyle: "italic",
      color: `rgba(200,220,255,${alpha.toFixed(2)})`,
      align: "center",
      baseline: "top",
    }, ctx, { x: 0, y: h / 2 - 30, width: w, height: 60, rotation: 0, scaleX: 1, scaleY: 1 }, resources);

    ctx.restore();
  });

  save(canvas, "02-breathing-text.png");
}

// ─── Scene 3: Typewriter ────────────────────────────────────────────────────

function renderTypewriter() {
  console.log("Scene 3: Typewriter");
  const fullText = "Hello, World!";
  const frameCount = 14;

  const canvas = renderFrameStrip("Typewriter — Character-by-Character Reveal", frameCount, 200, 100, (ctx, w, h, t, frameIdx) => {
    const charCount = Math.min(frameIdx, fullText.length);
    const visibleText = fullText.substring(0, charCount);
    const showCursor = frameIdx % 2 === 0 || frameIdx < fullText.length;

    textLayerType.render({
      ...textLayerType.createDefault(),
      text: visibleText + (showCursor ? "|" : ""),
      fontFamily: "Courier New",
      fontSize: 24,
      fontWeight: "400",
      color: "#00ff88",
      align: "left",
      baseline: "top",
    }, ctx, { x: 16, y: h / 2 - 14, width: w - 32, height: 30, rotation: 0, scaleX: 1, scaleY: 1 }, resources);
  });

  save(canvas, "03-typewriter.png");
}

// ─── Scene 4: Scatter & Gather ──────────────────────────────────────────────

function renderScatterGather() {
  console.log("Scene 4: Scatter & Gather");
  const word = "GATHER";
  const frameCount = 8;

  // Pseudo-random scatter positions (seeded by char index)
  function scatter(i) {
    const angles = [2.1, 4.5, 0.8, 5.2, 3.7, 1.4];
    const dists = [90, 75, 110, 85, 95, 80];
    return {
      dx: Math.cos(angles[i % angles.length]) * dists[i % dists.length],
      dy: Math.sin(angles[i % angles.length]) * dists[i % dists.length],
    };
  }

  const canvas = renderFrameStrip("Scatter & Gather — Letters Reassemble", frameCount, 250, 200, (ctx, w, h, t) => {
    // t=0: scattered, t=1: assembled
    const gatherT = applyKeyframeEasing(t, "ease-in-out") ?? t;
    const charW = 30;
    const startX = (w - word.length * charW) / 2;

    for (let i = 0; i < word.length; i++) {
      const { dx, dy } = scatter(i);
      const targetX = startX + i * charW;
      const targetY = h / 2 - 20;
      const x = targetX + dx * (1 - gatherT);
      const y = targetY + dy * (1 - gatherT);
      const alpha = 0.3 + 0.7 * gatherT;
      const rotation = (1 - gatherT) * (i % 2 === 0 ? 0.5 : -0.5);

      ctx.save();
      ctx.translate(x + charW / 2, y + 20);
      ctx.rotate(rotation);
      ctx.translate(-(x + charW / 2), -(y + 20));

      textLayerType.render({
        ...textLayerType.createDefault(),
        text: word[i],
        fontFamily: "Helvetica",
        fontSize: 36,
        fontWeight: "700",
        color: `rgba(255,200,100,${alpha.toFixed(2)})`,
        align: "center",
        baseline: "top",
      }, ctx, { x, y, width: charW, height: 44, rotation: 0, scaleX: 1, scaleY: 1 }, resources);

      ctx.restore();
    }
  });

  save(canvas, "04-scatter-gather.png");
}

// ─── Scene 5: Wave Text ─────────────────────────────────────────────────────

function renderWaveText() {
  console.log("Scene 5: Wave Text");
  const text = "WAVE MOTION";
  const frameCount = 8;

  const canvas = renderFrameStrip("Wave Text — Per-Character Baseline Ripple", frameCount, 300, 150, (ctx, w, h, t) => {
    const charW = 24;
    const startX = (w - text.length * charW) / 2;
    const baseY = h / 2 - 10;

    for (let i = 0; i < text.length; i++) {
      const phase = i * 0.5;
      const yOffset = Math.sin(t * Math.PI * 2 + phase) * 20;

      textLayerType.render({
        ...textLayerType.createDefault(),
        text: text[i],
        fontFamily: "Helvetica",
        fontSize: 28,
        fontWeight: "700",
        color: `hsl(${(i * 30 + t * 360) % 360}, 70%, 70%)`,
        align: "center",
        baseline: "top",
      }, ctx, { x: startX + i * charW, y: baseY + yOffset, width: charW, height: 36, rotation: 0, scaleX: 1, scaleY: 1 }, resources);
    }
  });

  save(canvas, "05-wave-text.png");
}

// ─── Scene 6: Motion Type Sheet ─────────────────────────────────────────────

function renderMotionTypeSheet() {
  console.log("Scene 6: Motion Type Sheet");
  const thumbW = 400, thumbH = 200;

  const files = [
    "01-word-cascade.png",
    "02-breathing-text.png",
    "03-typewriter.png",
    "04-scatter-gather.png",
    "05-wave-text.png",
  ];

  const images = files.map((f) => {
    const buf = fs.readFileSync(path.join(outDir, f));
    const img = new Image();
    img.src = buf;
    return img;
  });

  const cols = 2;
  const rows = Math.ceil(images.length / cols);
  const padding = 20;
  const gW = cols * thumbW + (cols + 1) * padding;
  const gH = rows * thumbH + (rows + 1) * padding + 40;
  const canvas = createCanvas(gW, gH);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0d0d1a";
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
  ctx.fillText("Motion Typography — Cascade, Breathing, Typewriter, Scatter & Wave", padding, gH - 12);

  save(canvas, "motion-type-sheet.png");
}

// ─── Run all ─────────────────────────────────────────────────────────────────

console.log("\nMotion Typography — Kinetic Type Compositions\n");

renderWordCascade();
renderBreathingText();
renderTypewriter();
renderScatterGather();
renderWaveText();
renderMotionTypeSheet();

console.log("\nDone! All renders saved to renders/\n");
