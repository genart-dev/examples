/**
 * Type Specimens — Typography showcase
 *
 * 1. "Font Stack Catalog"    — render each BUILT_IN_FONTS at multiple sizes
 * 2. "Pangrams"              — classic pangrams in different weights and styles
 * 3. "Scale & Hierarchy"     — typographic scale (display, h1-h4, body, small, caption)
 * 4. "Text Blocks"           — paragraph layout with alignment (left, center, right, justify)
 * 5. "Character Grid"        — full character set grid for a selected font
 * 6. "Specimen Contact Sheet" — all specimens combined
 *
 * Plugins used:
 *   - @genart-dev/plugin-typography  (textLayerType, BUILT_IN_FONTS, resolveFontStack)
 *
 * Output: renders/01-font-catalog.png .. renders/specimen-sheet.png
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
  BUILT_IN_FONTS,
} = require("../../../plugin-typography/dist/index.cjs");

// --- Shared setup ---

const outDir = path.join(__dirname, "renders");
fs.mkdirSync(outDir, { recursive: true });

const resources = { getFont: () => null, getImage: () => null, theme: "light", pixelRatio: 1 };

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

// ─── Scene 1: Font Stack Catalog ─────────────────────────────────────────────

function renderFontCatalog() {
  console.log("Scene 1: Font Stack Catalog");
  const cellW = 500, cellH = 220;
  const sizes = [12, 24, 36, 48];

  const cells = BUILT_IN_FONTS.map((font) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, 0, cellW, cellH);

    let yOff = 16;
    ctx.fillStyle = "#999";
    ctx.font = "10px sans-serif";
    ctx.fillText(`${font.family} — ${font.category}`, 12, yOff);
    yOff += 16;

    for (const size of sizes) {
      textLayerType.render({
        ...textLayerType.createDefault(),
        text: font.family,
        fontFamily: font.family,
        fontSize: size,
        fontWeight: "400",
        color: "#222",
        align: "left",
        baseline: "top",
      }, ctx, { x: 12, y: yOff, width: cellW - 24, height: size + 8, rotation: 0, scaleX: 1, scaleY: 1 }, resources);
      yOff += size + 12;
    }

    return { label: font.family, canvas: c };
  });

  const canvas = renderLabeledGrid("Font Stack Catalog — Built-in Fonts at 12/24/36/48px", cells, 2, cellW, cellH, 16);
  save(canvas, "01-font-catalog.png");
}

// ─── Scene 2: Pangrams ──────────────────────────────────────────────────────

function renderPangrams() {
  console.log("Scene 2: Pangrams");
  const cellW = 600, cellH = 120;
  const pangram = "The quick brown fox jumps over the lazy dog";

  const variations = [
    { family: "Georgia", weight: "400", style: "normal", label: "Georgia Regular" },
    { family: "Georgia", weight: "700", style: "normal", label: "Georgia Bold" },
    { family: "Georgia", weight: "400", style: "italic", label: "Georgia Italic" },
    { family: "Inter", weight: "400", style: "normal", label: "Inter Regular" },
    { family: "Inter", weight: "700", style: "normal", label: "Inter Bold" },
    { family: "Helvetica", weight: "400", style: "normal", label: "Helvetica Regular" },
    { family: "Times New Roman", weight: "400", style: "normal", label: "Times New Roman Regular" },
    { family: "Courier New", weight: "400", style: "normal", label: "Courier New Regular" },
  ];

  const cells = variations.map((v) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, 0, cellW, cellH);

    ctx.fillStyle = "#aaa";
    ctx.font = "10px sans-serif";
    ctx.fillText(v.label, 12, 16);

    textLayerType.render({
      ...textLayerType.createDefault(),
      text: pangram,
      fontFamily: v.family,
      fontSize: 28,
      fontWeight: v.weight,
      fontStyle: v.style,
      color: "#1a1a1a",
      align: "left",
      baseline: "top",
    }, ctx, { x: 12, y: 30, width: cellW - 24, height: 70, rotation: 0, scaleX: 1, scaleY: 1 }, resources);

    return { label: v.label, canvas: c };
  });

  const canvas = renderLabeledGrid("Pangrams — Weight & Style Variations", cells, 2, cellW, cellH, 12);
  save(canvas, "02-pangrams.png");
}

// ─── Scene 3: Scale & Hierarchy ─────────────────────────────────────────────

function renderScaleHierarchy() {
  console.log("Scene 3: Scale & Hierarchy");
  const W = 700, H = 550;
  const c = createCanvas(W, H);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#faf8f4";
  ctx.fillRect(0, 0, W, H);

  const levels = [
    { label: "Display", size: 64, weight: "700", text: "Display" },
    { label: "H1", size: 48, weight: "700", text: "Heading 1" },
    { label: "H2", size: 36, weight: "700", text: "Heading 2" },
    { label: "H3", size: 28, weight: "700", text: "Heading 3" },
    { label: "H4", size: 22, weight: "400", text: "Heading 4" },
    { label: "Body", size: 16, weight: "400", text: "Body text — The quick brown fox jumps over the lazy dog." },
    { label: "Small", size: 13, weight: "400", text: "Small text — Supporting details and secondary information." },
    { label: "Caption", size: 11, weight: "400", text: "CAPTION — IMAGE ATTRIBUTION OR FOOTNOTES" },
  ];

  let yOff = 20;
  for (const lv of levels) {
    // Size label
    ctx.fillStyle = "#bbb";
    ctx.font = "10px sans-serif";
    ctx.fillText(`${lv.label} (${lv.size}px)`, 16, yOff + 4);

    textLayerType.render({
      ...textLayerType.createDefault(),
      text: lv.text,
      fontFamily: "Georgia",
      fontSize: lv.size,
      fontWeight: lv.weight,
      color: "#1a1a1a",
      align: "left",
      baseline: "top",
    }, ctx, { x: 120, y: yOff, width: W - 140, height: lv.size + 10, rotation: 0, scaleX: 1, scaleY: 1 }, resources);

    yOff += lv.size + 20;
  }

  // Draw vertical rhythm line
  ctx.strokeStyle = "rgba(200,50,50,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(118, 0);
  ctx.lineTo(118, H);
  ctx.stroke();

  save(c, "03-scale-hierarchy.png");
}

// ─── Scene 4: Text Blocks ───────────────────────────────────────────────────

function renderTextBlocks() {
  console.log("Scene 4: Text Blocks");
  const cellW = 350, cellH = 200;
  const sampleText = "Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed.";

  const alignments = ["left", "center", "right"];

  const cells = alignments.map((align) => {
    const c = createCanvas(cellW, cellH);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, 0, cellW, cellH);

    // Alignment indicator line
    const xLine = align === "left" ? 20 : align === "right" ? cellW - 20 : cellW / 2;
    ctx.strokeStyle = "rgba(200,50,50,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xLine, 0);
    ctx.lineTo(xLine, cellH);
    ctx.stroke();

    textLayerType.render({
      ...textLayerType.createDefault(),
      text: sampleText,
      fontFamily: "Georgia",
      fontSize: 18,
      fontWeight: "400",
      color: "#222",
      align: align,
      baseline: "top",
      lineHeight: 1.5,
    }, ctx, { x: 20, y: 20, width: cellW - 40, height: cellH - 40, rotation: 0, scaleX: 1, scaleY: 1 }, resources);

    return { label: `Align: ${align}`, canvas: c };
  });

  const canvas = renderLabeledGrid("Text Blocks — Alignment Variations", cells, 3, cellW, cellH, 16);
  save(canvas, "04-text-blocks.png");
}

// ─── Scene 5: Character Grid ────────────────────────────────────────────────

function renderCharacterGrid() {
  console.log("Scene 5: Character Grid");
  const W = 800, H = 700;
  const c = createCanvas(W, H);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#faf8f4";
  ctx.fillRect(0, 0, W, H);

  const family = "Georgia";
  ctx.fillStyle = "#333";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(`${family} — Character Set`, 20, 30);

  // ASCII printable + extended Latin selection
  const chars = [];
  for (let i = 33; i <= 126; i++) chars.push(String.fromCharCode(i));
  // Extended Latin
  for (let i = 192; i <= 255; i++) chars.push(String.fromCharCode(i));

  const cols = 16;
  const cellSize = 40;
  const startX = 30, startY = 55;

  for (let i = 0; i < chars.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cellSize + 4);
    const y = startY + row * (cellSize + 4);

    ctx.strokeStyle = "#e0d8d0";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, cellSize, cellSize);

    textLayerType.render({
      ...textLayerType.createDefault(),
      text: chars[i],
      fontFamily: family,
      fontSize: 22,
      fontWeight: "400",
      color: "#1a1a1a",
      align: "center",
      baseline: "top",
    }, ctx, { x: x, y: y + 8, width: cellSize, height: cellSize - 8, rotation: 0, scaleX: 1, scaleY: 1 }, resources);
  }

  save(c, "05-character-grid.png");
}

// ─── Scene 6: Specimen Contact Sheet ─────────────────────────────────────────

function renderSpecimenSheet() {
  console.log("Scene 6: Specimen Contact Sheet");
  const thumbW = 400, thumbH = 300;

  const files = [
    "01-font-catalog.png",
    "02-pangrams.png",
    "03-scale-hierarchy.png",
    "04-text-blocks.png",
    "05-character-grid.png",
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
  ctx.fillText("Type Specimens — Font Catalog, Pangrams, Hierarchy, Alignment & Characters", padding, gH - 12);

  save(canvas, "specimen-sheet.png");
}

// ─── Run all ─────────────────────────────────────────────────────────────────

console.log("\nType Specimens — Typography Showcase\n");

renderFontCatalog();
renderPangrams();
renderScaleHierarchy();
renderTextBlocks();
renderCharacterGrid();
renderSpecimenSheet();

console.log("\nDone! All renders saved to renders/\n");
