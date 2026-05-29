const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const test = require("node:test");

const repoRoot = path.join(__dirname, "../..");

function getAllFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      getAllFiles(full, files);
    } else if (stat.isFile() && /\.(tsx|ts|js|jsx|css|html)$/.test(item)) {
      files.push(full);
    }
  }
  return files;
}

test("Zero-tolerance copy audit scanner", () => {
  const targetDirs = [
    path.join(repoRoot, "src/app"),
    path.join(repoRoot, "src/components")
  ];

  const forbiddenTerms = [
    { term: "mock", regex: /\bm\s*o\s*c\s*k\b/i },
    { term: "CP1", regex: /\bCP1\b/i },
    { term: "em dash", regex: /—/ },
    { term: "AI_ENGINE_UNAVAILABLE", regex: /AI_ENGINE_UNAVAILABLE/i },
    { term: "provider capacity", regex: /provider\s+capacity/i }
  ];

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = getAllFiles(dir);

    for (const file of files) {
      // Exclude the api router directory completely
      if (file.includes(path.join(repoRoot, "src/app/api"))) {
        continue;
      }

      let content = fs.readFileSync(file, "utf8");
      if (/\.(tsx|ts|js|jsx)$/.test(file)) {
        content = content
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/\/\/.*/g, "");
      }

      for (const rule of forbiddenTerms) {
        const hasTerm = rule.regex.test(content);
        assert.ok(!hasTerm, `File ${path.relative(repoRoot, file)} contains forbidden term "${rule.term}"`);
      }
    }
  }
});
