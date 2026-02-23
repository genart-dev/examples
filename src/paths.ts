import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Absolute path to the `sketches/` directory containing `.genart` files. */
export const SKETCHES_DIR = resolve(__dirname, "../sketches");
