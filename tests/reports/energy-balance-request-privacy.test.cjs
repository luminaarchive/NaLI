const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.join(__dirname, "../..");

test("legacy energy balance is not requested by the public single-report workspace", () => {
  const workspace = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");
  const route = fs.readFileSync(path.join(repoRoot, "src/app/api/energy/balance/route.ts"), "utf8");

  assert.doesNotMatch(workspace, /\/api\/energy\/balance\?guestSessionId=/);
  assert.doesNotMatch(workspace, /\/api\/energy\/balance|Kredit|credits/i);

  // Dormant endpoint remains privacy-safe while it is not connected to the public product.
  assert.match(route, /export async function POST\(req: NextRequest\)/);
  assert.doesNotMatch(route, /searchParams\.get\("guestSessionId"\)/);
});
