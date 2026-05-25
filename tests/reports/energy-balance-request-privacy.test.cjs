const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.join(__dirname, "../..");

test("guest energy balance identifiers are not exposed in request URLs", () => {
  const workspace = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");
  const route = fs.readFileSync(path.join(repoRoot, "src/app/api/energy/balance/route.ts"), "utf8");

  assert.doesNotMatch(workspace, /\/api\/energy\/balance\?guestSessionId=/);
  assert.match(workspace, /fetch\("\/api\/energy\/balance",\s*\{/);
  assert.match(workspace, /method:\s*"POST"/);
  assert.match(workspace, /body:\s*JSON\.stringify\(\{\s*guestSessionId\s*\}\)/);

  assert.match(route, /export async function POST\(req: NextRequest\)/);
  assert.doesNotMatch(route, /searchParams\.get\("guestSessionId"\)/);
});
