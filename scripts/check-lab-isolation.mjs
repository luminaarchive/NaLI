/**
 * Lab isolation guard (Bucket C).
 *
 * Enforces the one-directional boundary: only code that itself lives under a
 * `lab/` directory may import Lab modules (@/lib/lab, @/components/lab,
 * @/app/lab). A public route importing Lab code would be a leak of private
 * speculation into the public site, so this fails the build.
 *
 * Run: node scripts/check-lab-isolation.mjs
 */

import fs from "node:fs";
import path from "node:path";

const ROOTS = ["app", "components", "lib"];
const LAB_IMPORT = /from\s+["']@\/(?:lib|components|app)\/lab(?:\/|["'])/;

/** Recursively collect .ts/.tsx files under a directory. */
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/** A file is "inside the Lab" if any path segment is exactly `lab`. */
function isLabFile(file) {
  return file.split(path.sep).includes("lab");
}

const violations = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (isLabFile(file)) continue; // Lab code may import Lab code.
    const src = fs.readFileSync(file, "utf8");
    src.split("\n").forEach((line, i) => {
      if (LAB_IMPORT.test(line)) {
        violations.push(`${file}:${i + 1}: ${line.trim()}`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error("Lab isolation violated: non-Lab code imports Lab modules.\n");
  for (const v of violations) console.error("  " + v);
  console.error(
    "\nLab code must stay private. Move the consumer under a lab/ dir, or pass data via the manual promotion path.",
  );
  process.exit(1);
}

console.log("Lab isolation OK: no public code imports Lab modules.");
