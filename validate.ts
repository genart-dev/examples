/**
 * Validate all .genart files in sketches/ — ensures they parse correctly
 * using the @genart-dev/format parser.
 */

import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseGenart } from "@genart-dev/format";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sketchesDir = resolve(__dirname, "sketches");

const files = readdirSync(sketchesDir).filter((f) => f.endsWith(".genart"));

if (files.length === 0) {
  console.error("No .genart files found in sketches/");
  process.exit(1);
}

let passed = 0;
let failed = 0;

for (const file of files) {
  const filePath = resolve(sketchesDir, file);
  try {
    const raw = readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw);
    parseGenart(json);
    console.log(`  ✓ ${file}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${file}: ${err instanceof Error ? err.message : err}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed out of ${files.length} files`);

if (failed > 0) {
  process.exit(1);
}
