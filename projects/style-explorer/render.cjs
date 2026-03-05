/**
 * Style Explorer
 *
 * Visual showcase of @genart-dev/styles and @genart-dev/plugin-styles:
 *
 * 1. "Movement Timeline"     -- chronological bar chart of art movements with era coloring
 * 2. "Recipe Palette Grid"   -- all 26 recipes with palette swatches + layer stack info
 * 3. "Style Suggestions"     -- natural-language prompts → matched styles with confidence
 * 4. "Movement Palettes"     -- merged palettes for each movement, sorted by luminance
 * 5. "Reference Layer Demo"  -- plugin-styles reference layer rendered for multiple recipes
 * 6. "Recipe Deep Dive"      -- detailed layer stack visualization for 4 selected recipes
 */

"use strict";

const canvasPkg = require("canvas");
const { createCanvas, registerFont } = canvasPkg;
const fs = require("fs");
const path = require("path");

const {
  MOVEMENTS, ARTISTS, MEDIA, RECIPES,
  getMovement, getArtist, getRecipe,
  getTimeline, getMovementsInRange, getContemporaryMovements,
  searchStyles, searchRecipes,
  suggestStyles,
  getRecipePalette, getMovementPalettes, getArtistPalettes,
  mergedPalette, tint, shade, luminance, sortByLuminance,
} = require("../../../styles/dist/index.cjs");

const {
  referenceLayerType,
} = require("../../../plugin-styles/dist/index.cjs");

// --- Shared setup ---

const outDir = path.join(__dirname, "renders");
fs.mkdirSync(outDir, { recursive: true });

const resources = { getFont: () => null, getImage: () => null, theme: "light", pixelRatio: 1 };

function save(canvas, name) {
  const filePath = path.join(outDir, name);
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));
  console.log(`  -> ${filePath}`);
}

// Era → color mapping for timeline visualization
const ERA_COLORS = {
  "ancient":       "#8B7355",
  "medieval":      "#6B4E3D",
  "renaissance":   "#A0785A",
  "baroque":       "#7B2D26",
  "neoclassical":  "#4A6B5C",
  "modern-early":  "#3A6B9F",
  "modern-mid":    "#E07B39",
  "modern-late":   "#C23B22",
  "postmodern":    "#7B2D8B",
  "contemporary":  "#2B8B6B",
};

// --- Demo 1: Movement Timeline ---

function renderTimeline() {
  console.log("Demo 1: Movement Timeline");
  const W = 1600, H = 1000;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, W, H);

  const timeline = getTimeline();
  const minYear = Math.min(...timeline.map((e) => e.yearStart));
  const maxYear = 2026;

  const margin = { top: 80, right: 40, bottom: 60, left: 200 };
  const plotW = W - margin.left - margin.right;
  const plotH = H - margin.top - margin.bottom;
  const barH = Math.min(24, plotH / timeline.length - 2);

  // Title
  ctx.fillStyle = "#E0E0E0";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText("Art Movement Timeline", margin.left, 44);
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#666";
  ctx.fillText(`${timeline.length} movements from ${minYear} to present`, margin.left, 66);

  // Year axis
  const yearStep = 20;
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  for (let year = Math.ceil(minYear / yearStep) * yearStep; year <= maxYear; year += yearStep) {
    const x = margin.left + ((year - minYear) / (maxYear - minYear)) * plotW;
    ctx.beginPath();
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, H - margin.bottom);
    ctx.stroke();
    ctx.fillStyle = "#555";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(year), x, H - margin.bottom + 18);
  }
  ctx.textAlign = "left";

  // Bars
  for (let i = 0; i < timeline.length; i++) {
    const entry = timeline[i];
    const y = margin.top + i * (plotH / timeline.length);
    const end = entry.yearEnd ?? maxYear;
    const x1 = margin.left + ((entry.yearStart - minYear) / (maxYear - minYear)) * plotW;
    const x2 = margin.left + ((end - minYear) / (maxYear - minYear)) * plotW;

    // Label
    ctx.fillStyle = "#999";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(entry.name, margin.left - 10, y + barH / 2 + 4);
    ctx.textAlign = "left";

    // Bar
    const color = ERA_COLORS[entry.era] || "#555";
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(x1, y, Math.max(x2 - x1, 2), barH);
    ctx.globalAlpha = 1;

    // End cap for ongoing movements
    if (!entry.yearEnd) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x2, y);
      ctx.lineTo(x2 + 8, y + barH / 2);
      ctx.lineTo(x2, y + barH);
      ctx.fill();
    }
  }

  // Era legend
  const legendY = H - 30;
  let legendX = margin.left;
  ctx.font = "10px sans-serif";
  for (const [era, color] of Object.entries(ERA_COLORS)) {
    ctx.fillStyle = color;
    ctx.fillRect(legendX, legendY - 8, 10, 10);
    ctx.fillStyle = "#777";
    ctx.fillText(era, legendX + 14, legendY);
    legendX += ctx.measureText(era).width + 30;
  }

  save(canvas, "01-movement-timeline.png");
}

// --- Demo 2: Recipe Palette Grid ---

function renderRecipePaletteGrid() {
  console.log("Demo 2: Recipe Palette Grid");
  const cols = 4;
  const rows = Math.ceil(RECIPES.length / cols);
  const cellW = 380, cellH = 110;
  const pad = 16;
  const W = cols * cellW + pad * 2;
  const H = rows * cellH + pad * 2 + 70;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.fillStyle = "#E0E0E0";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("Style Recipes — Palette Overview", pad, 36);
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#666";
  ctx.fillText(`${RECIPES.length} recipes across ${MOVEMENTS.length} movements`, pad, 56);

  for (let i = 0; i < RECIPES.length; i++) {
    const recipe = RECIPES[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = pad + col * cellW;
    const y = 70 + pad + row * cellH;

    // Card background
    ctx.fillStyle = "#151515";
    ctx.fillRect(x + 4, y + 4, cellW - 8, cellH - 8);

    // Recipe name
    ctx.fillStyle = "#CCC";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(recipe.name, x + 12, y + 22);

    // Style ref + renderer badges
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#666";
    ctx.fillText(`${recipe.styleRef.kind}:${recipe.styleRef.id}`, x + 12, y + 36);

    let badgeX = x + 12;
    for (const renderer of recipe.recommendedRenderers) {
      const tw = ctx.measureText(renderer).width + 10;
      ctx.fillStyle = "#252525";
      ctx.fillRect(badgeX, y + 42, tw, 14);
      ctx.fillStyle = "#888";
      ctx.font = "9px sans-serif";
      ctx.fillText(renderer, badgeX + 5, y + 53);
      badgeX += tw + 4;
    }

    // Palette swatches
    const swatchSize = 20;
    const swatchGap = 3;
    const palette = recipe.suggestedPalette;
    for (let j = 0; j < palette.length; j++) {
      const sx = x + 12 + j * (swatchSize + swatchGap);
      const sy = y + 62;
      ctx.fillStyle = palette[j];
      ctx.fillRect(sx, sy, swatchSize, swatchSize);
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(sx, sy, swatchSize, swatchSize);
    }

    // Layer count
    ctx.fillStyle = "#555";
    ctx.font = "10px sans-serif";
    ctx.fillText(`${recipe.layers.length} layers`, x + 12, y + cellH - 14);

    // Tags (first 3)
    const tags = recipe.tags.slice(0, 3).join(", ");
    ctx.fillStyle = "#444";
    ctx.fillText(tags, x + 80, y + cellH - 14);
  }

  save(canvas, "02-recipe-palette-grid.png");
}

// --- Demo 3: Style Suggestions ---

function renderStyleSuggestions() {
  console.log("Demo 3: Style Suggestions");

  const prompts = [
    "dark moody Japanese ink landscape",
    "vibrant pop art with bold geometric shapes",
    "peaceful minimal zen composition",
    "swirling turbulent night sky with stars",
    "retro 80s neon grid",
    "soft impressionist garden in sunlight",
  ];

  const W = 1200, rowH = 160;
  const H = 80 + prompts.length * rowH;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.fillStyle = "#E0E0E0";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("Natural Language Style Suggestions", 20, 36);
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#666";
  ctx.fillText("suggestStyles(prompt) → ranked style + recipe matches with confidence scores", 20, 56);

  for (let p = 0; p < prompts.length; p++) {
    const prompt = prompts[p];
    const suggestions = suggestStyles(prompt, 5);
    const y = 80 + p * rowH;

    // Prompt label
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(16, y, W - 32, rowH - 8);

    ctx.fillStyle = "#E0E0E0";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(`"${prompt}"`, 28, y + 20);

    // Suggestion results
    for (let s = 0; s < suggestions.length; s++) {
      const sg = suggestions[s];
      const sx = 28 + s * 220;
      const sy = y + 36;

      // Confidence bar
      const barW = 200;
      const barH = 6;
      ctx.fillStyle = "#252525";
      ctx.fillRect(sx, sy, barW, barH);
      const confColor = sg.confidence > 0.6 ? "#2B8B6B" : sg.confidence > 0.4 ? "#E07B39" : "#555";
      ctx.fillStyle = confColor;
      ctx.fillRect(sx, sy, barW * sg.confidence, barH);

      // Name + kind
      ctx.fillStyle = "#AAA";
      ctx.font = "bold 11px sans-serif";
      const name = sg.result.name;
      ctx.fillText(name.length > 26 ? name.slice(0, 24) + "..." : name, sx, sy + 20);

      ctx.fillStyle = "#666";
      ctx.font = "10px sans-serif";
      ctx.fillText(`${sg.kind} — ${(sg.confidence * 100).toFixed(0)}%`, sx, sy + 34);

      // Reason
      ctx.fillStyle = "#555";
      ctx.font = "italic 9px sans-serif";
      const reason = sg.reason.length > 30 ? sg.reason.slice(0, 28) + "..." : sg.reason;
      ctx.fillText(reason, sx, sy + 48);

      // Palette if recipe
      if (sg.kind === "recipe" && sg.result.suggestedPalette) {
        const pal = sg.result.suggestedPalette;
        for (let c = 0; c < Math.min(pal.length, 7); c++) {
          ctx.fillStyle = pal[c];
          ctx.fillRect(sx + c * 14, sy + 55, 12, 12);
        }
      }
    }
  }

  save(canvas, "03-style-suggestions.png");
}

// --- Demo 4: Movement Palettes ---

function renderMovementPalettes() {
  console.log("Demo 4: Movement Palettes");

  const movements = MOVEMENTS.filter((m) => m.recipes.length > 0);
  const W = 1200, rowH = 60;
  const H = 80 + movements.length * rowH;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#E0E0E0";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("Movement Palettes — Merged & Sorted by Luminance", 20, 36);
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#666";
  ctx.fillText("getMovementPalettes() + mergedPalette() + sortByLuminance()", 20, 56);

  for (let i = 0; i < movements.length; i++) {
    const m = movements[i];
    const y = 80 + i * rowH;
    const colors = sortByLuminance(mergedPalette(m.recipes, 12));

    // Movement name
    ctx.fillStyle = "#999";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(m.name, 200, y + 24);
    ctx.textAlign = "left";

    // Era badge
    ctx.fillStyle = ERA_COLORS[m.era] || "#555";
    ctx.fillRect(210, y + 12, 6, 16);

    // Palette strip
    if (colors.length > 0) {
      const stripW = 700;
      const segW = stripW / colors.length;
      for (let c = 0; c < colors.length; c++) {
        ctx.fillStyle = colors[c];
        ctx.fillRect(230 + c * segW, y + 6, segW, 28);
      }
      // Outline
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.strokeRect(230, y + 6, stripW, 28);
    }

    // Color count + tint/shade demo
    if (colors.length > 0) {
      const baseColor = colors[Math.floor(colors.length / 2)];
      const tinted = tint(baseColor, 0.3);
      const shaded = shade(baseColor, 0.3);
      const demoX = 950;
      ctx.fillStyle = shaded;
      ctx.fillRect(demoX, y + 8, 20, 24);
      ctx.fillStyle = baseColor;
      ctx.fillRect(demoX + 22, y + 8, 20, 24);
      ctx.fillStyle = tinted;
      ctx.fillRect(demoX + 44, y + 8, 20, 24);
      ctx.fillStyle = "#555";
      ctx.font = "9px sans-serif";
      ctx.fillText("shade / base / tint", demoX, y + 46);
    }

    // Recipe count
    ctx.fillStyle = "#444";
    ctx.font = "10px sans-serif";
    ctx.fillText(`${m.recipes.length} recipe${m.recipes.length > 1 ? "s" : ""}`, 1100, y + 24);
  }

  save(canvas, "04-movement-palettes.png");
}

// --- Demo 5: Reference Layer ---

function renderReferenceLayerDemo() {
  console.log("Demo 5: Reference Layer (plugin-styles)");

  const recipeIds = [
    "impressionism-landscape", "sumi-e-bamboo", "van-gogh-starry-night",
    "pop-art-ben-day", "bauhaus-composition", "synthwave-grid",
    "minimalism-composition", "generative-flow-field",
  ];

  const cols = 4;
  const rows = Math.ceil(recipeIds.length / cols);
  const cellW = 320, cellH = 200;
  const pad = 16;
  const W = cols * cellW + pad * 2;
  const H = rows * cellH + pad * 2 + 70;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#E0E0E0";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("Reference Layer — styles:reference (plugin-styles)", pad, 36);
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#666";
  ctx.fillText("referenceLayerType.render() displays palette swatches + style metadata as a guide layer", pad, 56);

  for (let i = 0; i < recipeIds.length; i++) {
    const recipe = getRecipe(recipeIds[i]);
    if (!recipe) continue;

    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = pad + col * cellW;
    const y = 70 + pad + row * cellH;

    // Card background (simulates canvas area)
    ctx.fillStyle = "#F5F0E8";
    ctx.fillRect(x + 4, y + 4, cellW - 8, cellH - 8);

    // Render the reference layer
    const props = referenceLayerType.createDefault();
    props.styleId = recipe.styleRef.id;
    props.styleKind = recipe.styleRef.kind;
    props.recipeId = recipe.id;
    props._name = recipe.name;
    props._palette = JSON.stringify(recipe.suggestedPalette);

    const bounds = { x: x + 4, y: y + 4, width: cellW - 8, height: cellH - 8, rotation: 0, scaleX: 1, scaleY: 1 };
    referenceLayerType.render(props, ctx, bounds, resources);

    // Recipe description below swatches
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.font = "10px sans-serif";
    const desc = recipe.description.length > 50 ? recipe.description.slice(0, 48) + "..." : recipe.description;
    ctx.fillText(desc, x + 14, y + cellH - 24);

    // Renderers
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.font = "9px sans-serif";
    ctx.fillText(recipe.recommendedRenderers.join(", "), x + 14, y + cellH - 12);
  }

  save(canvas, "05-reference-layer-demo.png");
}

// --- Demo 6: Recipe Deep Dive ---

function renderRecipeDeepDive() {
  console.log("Demo 6: Recipe Deep Dive");

  const recipeIds = [
    "impressionism-landscape",
    "sumi-e-bamboo",
    "synthwave-grid",
    "generative-flow-field",
  ];

  const W = 1400, recipeH = 300;
  const H = 80 + recipeIds.length * recipeH;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#E0E0E0";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("Recipe Deep Dive — Layer Stack Visualization", 20, 36);
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#666";
  ctx.fillText("Each recipe defines an ordered stack of plugin layers with blend modes, opacity, and properties", 20, 56);

  for (let r = 0; r < recipeIds.length; r++) {
    const recipe = getRecipe(recipeIds[r]);
    if (!recipe) continue;

    const y = 80 + r * recipeH;

    // Background card
    ctx.fillStyle = "#121212";
    ctx.fillRect(16, y + 4, W - 32, recipeH - 12);

    // Recipe header
    ctx.fillStyle = "#E0E0E0";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(recipe.name, 32, y + 30);

    ctx.fillStyle = "#777";
    ctx.font = "12px sans-serif";
    ctx.fillText(recipe.description, 32, y + 48);

    // Palette strip at top-right
    const palX = W - 40 - recipe.suggestedPalette.length * 24;
    for (let c = 0; c < recipe.suggestedPalette.length; c++) {
      ctx.fillStyle = recipe.suggestedPalette[c];
      ctx.fillRect(palX + c * 24, y + 14, 22, 22);
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.strokeRect(palX + c * 24, y + 14, 22, 22);
    }

    // Layer stack (rendered bottom-up, displayed top-down)
    const layerX = 32;
    const layerStartY = y + 65;
    const layerH = 32;

    for (let l = 0; l < recipe.layers.length; l++) {
      const layer = recipe.layers[l];
      const ly = layerStartY + l * layerH;

      // Order number
      ctx.fillStyle = "#444";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(String(layer.order), layerX, ly + 14);

      // Layer type badge
      const typeColor = layer.typeId.startsWith("painting:") ? "#3A6B9F"
        : layer.typeId.startsWith("textures:") ? "#8B7355"
        : layer.typeId.startsWith("filters:") ? "#7B2D8B"
        : layer.typeId.startsWith("composite:") ? "#555"
        : "#2B8B6B";
      const typeBadgeW = ctx.measureText(layer.typeId).width + 12;
      ctx.fillStyle = typeColor;
      ctx.globalAlpha = 0.25;
      ctx.fillRect(layerX + 20, ly + 2, typeBadgeW, 18);
      ctx.globalAlpha = 1;
      ctx.fillStyle = typeColor;
      ctx.font = "10px monospace";
      ctx.fillText(layer.typeId, layerX + 26, ly + 14);

      // Layer name
      ctx.fillStyle = "#CCC";
      ctx.font = "12px sans-serif";
      ctx.fillText(layer.name, layerX + 30 + typeBadgeW, ly + 14);

      // Blend mode + opacity
      ctx.fillStyle = "#666";
      ctx.font = "10px sans-serif";
      const blendText = `${layer.blendMode} @ ${(layer.opacity * 100).toFixed(0)}%`;
      ctx.fillText(blendText, 420, ly + 14);

      // Key properties
      ctx.fillStyle = "#555";
      ctx.font = "10px monospace";
      const propsStr = Object.entries(layer.properties)
        .map(([k, v]) => `${k}: ${v}`)
        .join("  ");
      const truncProps = propsStr.length > 70 ? propsStr.slice(0, 68) + "..." : propsStr;
      ctx.fillText(truncProps, 560, ly + 14);

      // Optional badge
      if (layer.optional) {
        ctx.fillStyle = "#444";
        ctx.font = "italic 9px sans-serif";
        ctx.fillText("optional", W - 80, ly + 14);
      }
    }

    // Agent guidance preview
    const guidanceY = layerStartY + recipe.layers.length * layerH + 12;
    ctx.fillStyle = "#333";
    ctx.font = "italic 10px sans-serif";
    const guidanceLine = recipe.agentGuidance.split("\n")[0];
    const truncGuidance = guidanceLine.length > 120 ? guidanceLine.slice(0, 118) + "..." : guidanceLine;
    ctx.fillText(`Agent guidance: "${truncGuidance}"`, 32, guidanceY);
  }

  save(canvas, "06-recipe-deep-dive.png");
}

// --- Run all demos ---

console.log("\n=== Style Explorer ===\n");
console.log(`Data: ${MOVEMENTS.length} movements, ${ARTISTS.length} artists, ${MEDIA.length} media, ${RECIPES.length} recipes\n`);

renderTimeline();
renderRecipePaletteGrid();
renderStyleSuggestions();
renderMovementPalettes();
renderReferenceLayerDemo();
renderRecipeDeepDive();

console.log("\nDone! Check the renders/ directory.");
