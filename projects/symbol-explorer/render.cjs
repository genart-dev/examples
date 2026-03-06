/**
 * Symbol Explorer — batch fetch and gallery render
 *
 * Fetches 108 icons from Iconify (ph, lucide, tabler) across 9 thematic groups,
 * renders one PNG gallery per group plus a contact sheet of all groups.
 *
 * Output: renders/group-*.png + renders/contact-sheet.png
 *
 * Usage:
 *   npm install canvas   (if not already)
 *   node render.cjs
 */

"use strict";

const { createCanvas, ImageData } = require("canvas");
const fs = require("fs");
const path = require("path");

if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = ImageData;
}

const { fetchAndParseIcon } = require("../../../symbols/dist/index.cjs");

// ---------------------------------------------------------------------------
// Icon catalogue — 12 icons × 9 groups = 108 total
// ---------------------------------------------------------------------------

const GROUPS = [
  {
    name: "Nature",
    icons: [
      "ph:tree", "ph:leaf", "ph:flower", "ph:mountains", "ph:wave-sine",
      "ph:snowflake", "ph:drop", "ph:flame", "ph:cloud", "ph:sun",
      "ph:moon", "ph:rainbow",
    ],
  },
  {
    name: "Animals",
    icons: [
      "ph:cat", "ph:dog", "ph:bird", "ph:fish", "ph:butterfly",
      "ph:horse", "ph:rabbit", "lucide:worm", "ph:bug", "ph:shrimp",
      "ph:cow", "ph:paw-print",
    ],
  },
  {
    name: "Celestial & Weather",
    icons: [
      "ph:star", "ph:moon-stars", "ph:sun-horizon", "ph:cloud-rain",
      "ph:cloud-lightning", "ph:cloud-snow", "ph:wind", "ph:thermometer",
      "ph:tornado", "ph:umbrella", "ph:planet", "ph:shooting-star",
    ],
  },
  {
    name: "People & Body",
    icons: [
      "ph:person", "ph:person-simple-run", "ph:person-simple-walk",
      "ph:person-simple-swim", "ph:person-simple-bike", "ph:hand",
      "ph:hand-waving", "ph:eye", "ph:ear", "ph:brain",
      "ph:heartbeat", "ph:tooth",
    ],
  },
  {
    name: "Objects & Tools",
    icons: [
      "ph:hammer", "ph:wrench", "ph:scissors", "ph:magnifying-glass",
      "ph:compass", "ph:anchor", "ph:key", "ph:lock",
      "ph:envelope", "ph:bell", "ph:lamp", "ph:flashlight",
    ],
  },
  {
    name: "Architecture & Places",
    icons: [
      "ph:house", "ph:building", "ph:church", "ph:castle-turret",
      "ph:lighthouse", "ph:tent", "ph:bridge", "ph:door",
      "tabler:window", "tabler:fence", "ph:warehouse", "ph:factory",
    ],
  },
  {
    name: "Vehicles & Transport",
    icons: [
      "ph:car", "ph:train", "ph:airplane", "ph:boat",
      "ph:bicycle", "ph:motorcycle", "ph:truck", "ph:rocket",
      "ph:sailboat", "tabler:submarine", "tabler:helicopter", "ph:bus",
    ],
  },
  {
    name: "Food & Drink",
    icons: [
      "ph:coffee", "ph:beer-stein", "ph:wine", "ph:martini",
      "ph:cake", "ph:cookie", "ph:bowl-food", "ph:fork-knife",
      "ph:pizza", "ph:hamburger", "ph:ice-cream", "ph:carrot",
    ],
  },
  {
    name: "Abstract & Geometric",
    icons: [
      "ph:circle", "ph:square", "ph:triangle", "ph:diamond",
      "ph:hexagon", "ph:pentagon", "ph:octagon", "ph:infinity",
      "ph:spiral", "ph:wave-sine", "ph:chart-line", "ph:grid-four",
    ],
  },
];

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const COLS     = 6;
const CELL_W   = 150;
const CELL_H   = 130;
const LABEL_H  = 28;
const PAD      = 14;
const HEADER_H = 48;
const BG       = "#f7f7ef";
const CELL_BG  = "#ffffff";
const BORDER   = "#e0e0d8";
const LABEL_FG = "#333";
const ID_FG    = "#999";
const FONT     = "13px sans-serif";
const ID_FONT  = "10px sans-serif";
const HDR_FONT = "bold 18px sans-serif";

// ---------------------------------------------------------------------------
// SVG path renderer (shared with render-test-iconify.cjs)
// ---------------------------------------------------------------------------

function parseViewBox(viewBox) {
  const parts = viewBox.trim().split(/\s+/).map(Number);
  return { vbX: parts[0] || 0, vbY: parts[1] || 0, vbW: parts[2] || 24, vbH: parts[3] || 24 };
}

function arcToBeziers(ctx, x1, y1, rx, ry, largeArc, sweep, x2, y2) {
  if (x1 === x2 && y1 === y2) return;
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const x1p = dx, y1p = dy;
  let rxSq = rx * rx, rySq = ry * ry;
  const x1pSq = x1p * x1p, y1pSq = y1p * y1p;
  let lambda = x1pSq / rxSq + y1pSq / rySq;
  if (lambda > 1) { const s = Math.sqrt(lambda); rx *= s; ry *= s; rxSq = rx*rx; rySq = ry*ry; }
  const num = rxSq*rySq - rxSq*y1pSq - rySq*x1pSq;
  const den = rxSq*y1pSq + rySq*x1pSq;
  const sq = Math.sqrt(Math.max(0, num / den));
  const sign = largeArc === sweep ? -1 : 1;
  const cxp = sign * sq * (rx * y1p / ry);
  const cyp = sign * sq * (-ry * x1p / rx);
  const cx = (x1 + x2) / 2 + cxp;
  const cy = (y1 + y2) / 2 + cyp;
  function angle(ux, uy, vx, vy) {
    const n = Math.sqrt(ux*ux+uy*uy) * Math.sqrt(vx*vx+vy*vy);
    let a = Math.acos(Math.max(-1, Math.min(1, (ux*vx+uy*vy)/n)));
    if (ux*vy - uy*vx < 0) a = -a;
    return a;
  }
  const theta1 = angle(1, 0, (x1p-cxp)/rx, (y1p-cyp)/ry);
  let dtheta = angle((x1p-cxp)/rx, (y1p-cyp)/ry, (-x1p-cxp)/rx, (-y1p-cyp)/ry);
  if (!sweep && dtheta > 0) dtheta -= 2*Math.PI;
  if (sweep  && dtheta < 0) dtheta += 2*Math.PI;
  const segs = Math.ceil(Math.abs(dtheta) / (Math.PI/2));
  const dt = dtheta / segs;
  const alpha = (4/3) * Math.tan(dt/4);
  let t = theta1;
  for (let s = 0; s < segs; s++) {
    const cosT = Math.cos(t), sinT = Math.sin(t);
    const cosT2 = Math.cos(t+dt), sinT2 = Math.sin(t+dt);
    ctx.bezierCurveTo(
      cx + rx*cosT  - alpha*ry*sinT,  cy + ry*sinT  + alpha*rx*cosT,
      cx + rx*cosT2 + alpha*ry*sinT2, cy + ry*sinT2 - alpha*rx*cosT2,
      cx + rx*cosT2,                  cy + ry*sinT2
    );
    t += dt;
  }
}

function applyPathToCtx(ctx, d) {
  const cmds = d.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || [];
  let cx = 0, cy = 0, mx = 0, my = 0, lx2 = 0, ly2 = 0, lastCmd = "";
  const nums = (str) =>
    (str.match(/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g) || []).map(Number);

  ctx.beginPath();
  for (const cmd of cmds) {
    const type = cmd[0], upper = type.toUpperCase(), rel = type !== upper;
    const args = nums(cmd.slice(1));
    if (upper !== "C" && upper !== "S") { lx2 = cx; ly2 = cy; }
    switch (upper) {
      case "M":
        for (let i = 0; i < args.length; i += 2) {
          const x = rel ? cx+args[i] : args[i], y = rel ? cy+args[i+1] : args[i+1];
          if (i === 0) { ctx.moveTo(x, y); mx = x; my = y; } else ctx.lineTo(x, y);
          cx = x; cy = y;
        } break;
      case "L":
        for (let i = 0; i < args.length; i += 2) {
          const x = rel ? cx+args[i] : args[i], y = rel ? cy+args[i+1] : args[i+1];
          ctx.lineTo(x, y); cx = x; cy = y;
        } break;
      case "H":
        for (let i = 0; i < args.length; i++) { const x = rel ? cx+args[i] : args[i]; ctx.lineTo(x, cy); cx = x; } break;
      case "V":
        for (let i = 0; i < args.length; i++) { const y = rel ? cy+args[i] : args[i]; ctx.lineTo(cx, y); cy = y; } break;
      case "C":
        for (let i = 0; i < args.length; i += 6) {
          const [x1,y1,x2,y2,x,y] = rel ? [cx+args[i],cy+args[i+1],cx+args[i+2],cy+args[i+3],cx+args[i+4],cy+args[i+5]] : args.slice(i,i+6);
          ctx.bezierCurveTo(x1,y1,x2,y2,x,y); lx2=x2; ly2=y2; cx=x; cy=y;
        } break;
      case "S":
        for (let i = 0; i < args.length; i += 4) {
          const x2 = rel?cx+args[i]:args[i], y2 = rel?cy+args[i+1]:args[i+1];
          const x  = rel?cx+args[i+2]:args[i+2], y = rel?cy+args[i+3]:args[i+3];
          const x1 = (lastCmd==="C"||lastCmd==="S") ? 2*cx-lx2 : cx;
          const y1 = (lastCmd==="C"||lastCmd==="S") ? 2*cy-ly2 : cy;
          ctx.bezierCurveTo(x1,y1,x2,y2,x,y); lx2=x2; ly2=y2; cx=x; cy=y;
        } break;
      case "Q":
        for (let i = 0; i < args.length; i += 4) {
          const [x1,y1,x,y] = rel ? [cx+args[i],cy+args[i+1],cx+args[i+2],cy+args[i+3]] : args.slice(i,i+4);
          ctx.quadraticCurveTo(x1,y1,x,y); cx=x; cy=y;
        } break;
      case "T":
        for (let i = 0; i < args.length; i += 2) {
          const x = rel?cx+args[i]:args[i], y = rel?cy+args[i+1]:args[i+1];
          ctx.quadraticCurveTo(cx,cy,x,y); cx=x; cy=y;
        } break;
      case "A":
        for (let i = 0; i < args.length; i += 7) {
          const rx = Math.abs(args[i]), ry = Math.abs(args[i+1]);
          const largeArc = args[i+3], sweep = args[i+4];
          const ex = rel?cx+args[i+5]:args[i+5], ey = rel?cy+args[i+6]:args[i+6];
          if (rx === 0 || ry === 0) ctx.lineTo(ex, ey);
          else arcToBeziers(ctx, cx, cy, rx, ry, largeArc, sweep, ex, ey);
          cx=ex; cy=ey;
        } break;
      case "Z":
        ctx.closePath(); cx=mx; cy=my; break;
    }
    lastCmd = upper;
  }
}

function drawIconPaths(ctx, iconData, x, y, w, h) {
  const { vbX, vbY, vbW, vbH } = parseViewBox(iconData.viewBox);
  const aspect = vbW / vbH;
  let dw = w, dh = h;
  if (aspect > 1) dh = w / aspect; else dw = h * aspect;
  const dx = x + (w - dw) / 2, dy = y + (h - dh) / 2;
  ctx.save();
  ctx.translate(dx - vbX*(dw/vbW), dy - vbY*(dh/vbH));
  ctx.scale(dw/vbW, dh/vbH);
  for (const p of iconData.paths) {
    applyPathToCtx(ctx, p.d);
    const hasFill   = p.fill   && p.fill   !== "none";
    const hasStroke = p.stroke && p.stroke !== "none";
    if (hasFill) {
      ctx.fillStyle = p.fill; ctx.fill("evenodd");
    } else if (hasStroke) {
      ctx.strokeStyle = p.stroke; ctx.lineWidth = p.strokeWidth ?? 2;
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    } else {
      ctx.fillStyle = "#222"; ctx.fill("evenodd");
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Gallery renderer
// ---------------------------------------------------------------------------

function renderGroup(groupName, icons) {
  const rows = Math.ceil(icons.length / COLS);
  const W = COLS * CELL_W + (COLS + 1) * PAD;
  const H = HEADER_H + rows * (CELL_H + LABEL_H + PAD) + PAD;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#222";
  ctx.font = HDR_FONT;
  ctx.fillText(`@genart-dev/symbols — ${groupName}`, PAD, PAD + 22);

  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, HEADER_H - 8);
  ctx.lineTo(W - PAD, HEADER_H - 8);
  ctx.stroke();

  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    const col = i % COLS, row = Math.floor(i / COLS);
    const x = PAD + col * (CELL_W + PAD);
    const y = HEADER_H + row * (CELL_H + LABEL_H + PAD);

    // Cell
    ctx.fillStyle = icon.error ? "#fff8f8" : CELL_BG;
    ctx.strokeStyle = icon.error ? "#ffcccc" : BORDER;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, CELL_W, CELL_H, 8);
    ctx.fill(); ctx.stroke();

    if (icon.error) {
      ctx.fillStyle = "#cc4444";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("fetch failed", x + CELL_W/2, y + CELL_H/2);
    } else {
      const pad = 16;
      drawIconPaths(ctx, icon, x + pad, y + pad, CELL_W - pad*2, CELL_H - pad*2);
    }

    // Name label
    const shortName = icon.name.replace(/-/g, " ");
    ctx.fillStyle = LABEL_FG;
    ctx.font = FONT;
    ctx.textAlign = "center";
    ctx.fillText(shortName, x + CELL_W/2, y + CELL_H + 13, CELL_W - 4);

    // iconifyId label
    ctx.fillStyle = ID_FG;
    ctx.font = ID_FONT;
    ctx.fillText(icon.iconifyId ?? icon.id, x + CELL_W/2, y + CELL_H + 25, CELL_W - 4);

    ctx.textAlign = "left";
  }

  return canvas;
}

// ---------------------------------------------------------------------------
// Contact sheet
// ---------------------------------------------------------------------------

function renderContactSheet(groupCanvases) {
  const THUMB_W = 320, THUMB_H = 240, THUMB_PAD = 12, THUMB_COLS = 3;
  const thumbRows = Math.ceil(groupCanvases.length / THUMB_COLS);
  const W = THUMB_COLS * THUMB_W + (THUMB_COLS + 1) * THUMB_PAD;
  const H = 50 + thumbRows * (THUMB_H + THUMB_PAD) + THUMB_PAD;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#eeeeee";
  ctx.font = "bold 17px sans-serif";
  ctx.fillText("@genart-dev/symbols — Iconify Explorer (108 icons)", THUMB_PAD, 32);

  for (let i = 0; i < groupCanvases.length; i++) {
    const { name, canvas: gc } = groupCanvases[i];
    const col = i % THUMB_COLS, row = Math.floor(i / THUMB_COLS);
    const x = THUMB_PAD + col * (THUMB_W + THUMB_PAD);
    const y = 50 + row * (THUMB_H + THUMB_PAD);

    // Draw thumbnail (scale-down)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, THUMB_W, THUMB_H, 6);
    ctx.clip();
    const fitScale = Math.min(THUMB_W / gc.width, THUMB_H / gc.height);
    const dw = Math.round(gc.width * fitScale);
    const dh = Math.round(gc.height * fitScale);
    ctx.drawImage(gc, x + (THUMB_W - dw) / 2, y + (THUMB_H - dh) / 2, dw, dh);
    ctx.restore();

    // Label overlay
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(x, y + THUMB_H - 24, THUMB_W, 24);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(name, x + THUMB_W/2, y + THUMB_H - 8);
    ctx.textAlign = "left";
  }

  return canvas;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const outDir = path.join(__dirname, "renders");
  fs.mkdirSync(outDir, { recursive: true });

  const totalIcons = GROUPS.reduce((s, g) => s + g.icons.length, 0);
  console.log(`\nSymbol Explorer — fetching ${totalIcons} icons across ${GROUPS.length} groups\n`);

  const groupCanvases = [];
  let totalFetched = 0, totalErrors = 0;

  for (const group of GROUPS) {
    console.log(`▸ ${group.name} (${group.icons.length} icons)`);
    const fetched = [];

    for (const id of group.icons) {
      process.stdout.write(`    ${id}… `);
      try {
        const data = await fetchAndParseIcon(id);
        fetched.push(data);
        process.stdout.write(`✓\n`);
        totalFetched++;
      } catch (err) {
        fetched.push({ id, iconifyId: id, name: id.split(":")[1], paths: [], viewBox: "0 0 24 24", error: err.message });
        process.stdout.write(`✗ ${err.message}\n`);
        totalErrors++;
      }
    }

    const gc = renderGroup(group.name, fetched);
    const slug = group.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const outPath = path.join(outDir, `group-${String(GROUPS.indexOf(group) + 1).padStart(2, "0")}-${slug}.png`);
    fs.writeFileSync(outPath, gc.toBuffer("image/png"));
    console.log(`  → ${path.relative(__dirname, outPath)}\n`);
    groupCanvases.push({ name: group.name, canvas: gc });
  }

  const sheet = renderContactSheet(groupCanvases);
  const sheetPath = path.join(outDir, "contact-sheet.png");
  fs.writeFileSync(sheetPath, sheet.toBuffer("image/png"));

  console.log(`\n✓ ${totalFetched}/${totalIcons} icons fetched (${totalErrors} errors)`);
  console.log(`✓ Contact sheet → ${path.relative(__dirname, sheetPath)}`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
