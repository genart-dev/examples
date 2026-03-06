/**
 * Animated Portraits — Figure + animation + filter combos
 *
 * 1. "Pose Transition"      — mannequin interpolated between 3 keyframed poses (frame strips)
 * 2. "Gesture Fade"         — gesture drawing with opacity keyframes fading in/out
 * 3. "Filter Sweep"         — static figure with animated duotone + grain transitions
 * 4. "Breathing Figure"     — subtle scale oscillation on mannequin torso (eased keyframes)
 * 5. "Portrait Sequence"    — head construction with rotating view angle over time
 * 6. "Animation Sheet"      — contact sheet of key frames from each sequence
 *
 * Plugins used:
 *   - @genart-dev/plugin-figure     (mannequinLayerType, gestureLayerType, headLayerType)
 *   - @genart-dev/plugin-animation  (interpolateProperty, applyKeyframeEasing)
 *   - @genart-dev/plugin-filters    (duotoneLayerType, grainLayerType, vignetteLayerType)
 *
 * Output: renders/01-pose-transition.png .. renders/animation-sheet.png
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
} = require("../../../plugin-figure/dist/index.cjs");

const {
  interpolateProperty,
  applyKeyframeEasing,
} = require("../../../plugin-animation/dist/index.cjs");

const {
  duotoneLayerType,
  grainLayerType,
  vignetteLayerType,
} = require("../../../plugin-filters/dist/index.cjs");

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
    fctx.fillStyle = "#f0ece4";
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

// --- Pose definitions (keypoints as objects) ---

const standingPose = JSON.parse(mannequinLayerType.createDefault().keypoints);

function makePose(adjustments) {
  const pose = JSON.parse(JSON.stringify(standingPose));
  for (const [key, delta] of Object.entries(adjustments)) {
    if (pose[key]) {
      pose[key].x += delta.dx || 0;
      pose[key].y += delta.dy || 0;
    }
  }
  return pose;
}

const armsUpPose = makePose({
  rElbow: { dx: 0.02, dy: -0.14 },
  rWrist: { dx: 0.06, dy: -0.26 },
  lElbow: { dx: -0.02, dy: -0.14 },
  lWrist: { dx: -0.06, dy: -0.26 },
});

const walkingPose = makePose({
  rElbow: { dx: 0.06, dy: 0.02 },
  rWrist: { dx: 0.1, dy: 0.04 },
  lElbow: { dx: -0.06, dy: -0.02 },
  lWrist: { dx: -0.1, dy: -0.04 },
  rKnee: { dx: 0.04, dy: -0.04 },
  rAnkle: { dx: 0.06, dy: -0.02 },
  lKnee: { dx: -0.04, dy: 0.02 },
  lAnkle: { dx: -0.06, dy: 0.04 },
});

function lerpPose(poseA, poseB, t) {
  const result = {};
  for (const key of Object.keys(poseA)) {
    result[key] = {
      x: poseA[key].x + (poseB[key].x - poseA[key].x) * t,
      y: poseA[key].y + (poseB[key].y - poseA[key].y) * t,
    };
  }
  return result;
}

// ─── Scene 1: Pose Transition ───────────────────────────────────────────────

function renderPoseTransition() {
  console.log("Scene 1: Pose Transition");
  const frameCount = 12;
  const poses = [standingPose, armsUpPose, walkingPose];

  const canvas = renderFrameStrip("Pose Transition — Standing → Arms Up → Walking", frameCount, 140, 180, (ctx, w, h, t) => {
    // Map t to pose sequence: 0-0.5 = standing->armsUp, 0.5-1 = armsUp->walking
    let currentPose;
    if (t <= 0.5) {
      const localT = t * 2;
      const eased = applyKeyframeEasing(localT, "ease-in-out") ?? localT;
      currentPose = lerpPose(poses[0], poses[1], eased);
    } else {
      const localT = (t - 0.5) * 2;
      const eased = applyKeyframeEasing(localT, "ease-in-out") ?? localT;
      currentPose = lerpPose(poses[1], poses[2], eased);
    }

    mannequinLayerType.render({
      ...mannequinLayerType.createDefault(),
      keypoints: JSON.stringify(currentPose),
      method: "bean",
      showJoints: true,
      jointRadius: 4,
      showRibcagePelvis: true,
      transparency: 0.9,
      guideColor: "rgba(40,120,180,0.8)",
      lineWidth: 1.5,
    }, ctx, full(w, h), resources);
  });

  save(canvas, "01-pose-transition.png");
}

// ─── Scene 2: Gesture Fade ──────────────────────────────────────────────────

function renderGestureFade() {
  console.log("Scene 2: Gesture Fade");
  const frameCount = 12;

  // Simple line-of-action for a standing figure
  const lineOfAction = [
    { x: 0.5, y: 0.05 },
    { x: 0.48, y: 0.25 },
    { x: 0.5, y: 0.5 },
    { x: 0.48, y: 0.75 },
    { x: 0.5, y: 0.95 },
  ];

  const rhythmCurves = [
    { points: [{ x: 0.4, y: 0.15 }, { x: 0.45, y: 0.3 }, { x: 0.55, y: 0.4 }], label: "shoulder" },
    { points: [{ x: 0.6, y: 0.15 }, { x: 0.55, y: 0.3 }, { x: 0.45, y: 0.4 }], label: "hip" },
  ];

  const canvas = renderFrameStrip("Gesture Fade — Opacity Keyframes In/Out", frameCount, 140, 180, (ctx, w, h, t) => {
    // Fade in 0-0.3, hold 0.3-0.7, fade out 0.7-1
    let alpha;
    if (t < 0.3) alpha = t / 0.3;
    else if (t < 0.7) alpha = 1;
    else alpha = 1 - (t - 0.7) / 0.3;

    gestureLayerType.render({
      ...gestureLayerType.createDefault(),
      lineOfAction: JSON.stringify(lineOfAction),
      rhythmCurves: JSON.stringify(rhythmCurves),
      showLineOfAction: true,
      showRhythmCurves: true,
      curveStyle: "smooth",
      taper: true,
      taperAmount: 0.7,
      lineOfActionColor: `rgba(255,50,50,${(alpha * 0.6).toFixed(2)})`,
      rhythmColor: `rgba(50,150,255,${(alpha * 0.5).toFixed(2)})`,
      guideColor: `rgba(0,200,255,${(alpha * 0.5).toFixed(2)})`,
      lineWidth: 2,
    }, ctx, full(w, h), resources);
  });

  save(canvas, "02-gesture-fade.png");
}

// ─── Scene 3: Filter Sweep ──────────────────────────────────────────────────

function renderFilterSweep() {
  console.log("Scene 3: Filter Sweep");
  const frameCount = 12;

  const canvas = renderFrameStrip("Filter Sweep — Duotone + Grain on Static Figure", frameCount, 140, 180, (ctx, w, h, t) => {
    // Dark mannequin on white for maximum luminance contrast under duotone
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    mannequinLayerType.render({
      ...mannequinLayerType.createDefault(),
      method: "bean",
      showJoints: true,
      jointRadius: 5,
      showRibcagePelvis: true,
      transparency: 1.0,
      guideColor: "rgba(30,30,50,0.9)",
      lineWidth: 2,
    }, ctx, full(w, h), resources);

    // Duotone sweeps dark color from sepia brown → navy → purple (hex only!)
    const darkColors = ["#3B2314", "#2B1D3A", "#1A2744", "#14223B", "#1D1440", "#251245", "#2E1048", "#1B0E3D", "#14103A", "#180E44", "#1E0C48", "#220A4A"];
    const lightColors = ["#F5E6D0", "#F0DCC8", "#EAD3C0", "#E4CAB8", "#DEBFB0", "#D8B5A8", "#D2ABA0", "#CCA098", "#C69690", "#C08C88", "#BA8280", "#B47878"];
    const di = Math.min(Math.round(t * (darkColors.length - 1)), darkColors.length - 1);

    duotoneLayerType.render({
      ...duotoneLayerType.createDefault(),
      darkColor: darkColors[di],
      lightColor: lightColors[di],
      intensity: 0.5 + t * 0.4,
    }, ctx, full(w, h), resources);

    // Very subtle grain so figure stays readable
    grainLayerType.render({
      ...grainLayerType.createDefault(),
      intensity: 0.02 + t * 0.06,
      size: 1,
      seed: Math.round(t * 100),
      monochrome: true,
    }, ctx, full(w, h), resources);
  });

  save(canvas, "03-filter-sweep.png");
}

// ─── Scene 4: Breathing Figure ──────────────────────────────────────────────

function renderBreathingFigure() {
  console.log("Scene 4: Breathing Figure");
  const frameCount = 12;

  const canvas = renderFrameStrip("Breathing Figure — Torso Scale Oscillation", frameCount, 140, 180, (ctx, w, h, t) => {
    // Subtle breathing: adjust ribcage tilt slightly with sine
    const breathPhase = Math.sin(t * Math.PI * 2);
    const ribcageTilt = breathPhase * 3;

    // Also slightly adjust shoulder position to simulate breath
    const breathPose = makePose({
      rShoulder: { dx: 0, dy: breathPhase * -0.008 },
      lShoulder: { dx: 0, dy: breathPhase * -0.008 },
    });

    mannequinLayerType.render({
      ...mannequinLayerType.createDefault(),
      keypoints: JSON.stringify(breathPose),
      method: "bean",
      showJoints: true,
      jointRadius: 4,
      showRibcagePelvis: true,
      ribcageTilt: ribcageTilt,
      transparency: 0.9,
      guideColor: "rgba(40,120,180,0.8)",
      lineWidth: 1.5,
    }, ctx, full(w, h), resources);

    // Subtle vignette that breathes too
    vignetteLayerType.render({
      ...vignetteLayerType.createDefault(),
      intensity: 0.3 + breathPhase * 0.1,
      radius: 0.7,
      softness: 0.5,
    }, ctx, full(w, h), resources);
  });

  save(canvas, "04-breathing-figure.png");
}

// ─── Scene 5: Portrait Sequence ─────────────────────────────────────────────

function renderPortraitSequence() {
  console.log("Scene 5: Portrait Sequence");
  const frameCount = 12;

  const canvas = renderFrameStrip("Portrait Sequence — Head Rotation Front → 3/4 → Profile", frameCount, 150, 160, (ctx, w, h, t) => {
    // Interpolate tiltY from 0 (front) through 30 (3/4) to 80 (near profile)
    const kf = [
      { time: 0, value: 0, easing: "ease-in-out" },
      { time: 0.5, value: 30, easing: "ease-in-out" },
      { time: 1, value: 75, easing: "ease-in-out" },
    ];
    const tiltY = interpolateProperty(kf, t);

    // Slight tilt for life
    const tiltX = Math.sin(t * Math.PI) * 5;

    headLayerType.render({
      ...headLayerType.createDefault(),
      position: { x: 0.5, y: 0.45 },
      headSize: 0.55,
      tiltX,
      tiltY,
      tiltZ: 0,
      method: "loomis",
      showCrossLines: true,
      showJawPlane: true,
      showEyeLine: true,
      showNoseLine: true,
      showChinLine: true,
      showEarLine: true,
      showBrowLine: true,
      guideColor: "rgba(40,120,180,0.8)",
      lineWidth: 1.5,
    }, ctx, full(w, h), resources);
  });

  save(canvas, "05-portrait-sequence.png");
}

// ─── Scene 6: Animation Sheet ───────────────────────────────────────────────

function renderAnimationSheet() {
  console.log("Scene 6: Animation Sheet");
  const files = [
    "01-pose-transition.png",
    "02-gesture-fade.png",
    "03-filter-sweep.png",
    "04-breathing-figure.png",
    "05-portrait-sequence.png",
  ];

  const images = files.map((f) => {
    const buf = fs.readFileSync(path.join(outDir, f));
    const img = new Image();
    img.src = buf;
    return img;
  });

  // Single-column stacked layout — each strip at full width
  const padding = 16;
  const maxW = Math.max(...images.map((img) => img.width));
  const gW = maxW + padding * 2;
  const totalH = images.reduce((sum, img) => sum + Math.round(img.height * (maxW / img.width)), 0);
  const gH = totalH + (images.length + 1) * padding + 40;
  const canvas = createCanvas(gW, gH);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0d0d1a";
  ctx.fillRect(0, 0, gW, gH);

  let y = padding;
  for (let i = 0; i < images.length; i++) {
    const scale = maxW / images[i].width;
    const drawH = Math.round(images[i].height * scale);
    ctx.drawImage(images[i], padding, y, maxW, drawH);
    y += drawH + padding;
  }

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("Animated Portraits — Poses, Gestures, Filters, Breathing & Head Rotation", padding, gH - 12);

  save(canvas, "animation-sheet.png");
}

// ─── Run all ─────────────────────────────────────────────────────────────────

console.log("\nAnimated Portraits — Figure + Animation + Filter Combos\n");

renderPoseTransition();
renderGestureFade();
renderFilterSweep();
renderBreathingFigure();
renderPortraitSequence();
renderAnimationSheet();

console.log("\nDone! All renders saved to renders/\n");
