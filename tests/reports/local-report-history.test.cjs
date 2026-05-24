require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

// Mock localStorage
let store = {};
let shouldThrowOnSetItem = false;

const mockLocalStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => {
    if (shouldThrowOnSetItem) {
      throw new Error("QuotaExceededError");
    }
    store[key] = String(value);
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    store = {};
  }
};

globalThis.window = {
  localStorage: mockLocalStorage,
};

const clientRecovery = require("../../src/lib/reports/clientRecovery");
const { getSystemReadiness } = require("../../src/lib/system/readiness");

test("Local History - list returns max 3 newest entries in LIFO order", () => {
  store = {};
  const makeSnapshot = (num) => ({
    id: `rep-${num}`,
    title: `Draft ${num}`,
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: `Teks ${num}`,
    timestamp: Date.now() + num,
    status: "draft_ready",
  });

  clientRecovery.saveGuestReportRecovery(makeSnapshot(1));
  clientRecovery.saveGuestReportRecovery(makeSnapshot(2));
  clientRecovery.saveGuestReportRecovery(makeSnapshot(3));
  clientRecovery.saveGuestReportRecovery(makeSnapshot(4)); // rep-1 evicted

  const list = clientRecovery.listGuestReportRecoveries();
  assert.equal(list.length, 3);
  assert.equal(list[0].id, "rep-4");
  assert.equal(list[1].id, "rep-3");
  assert.equal(list[2].id, "rep-2");
  assert.equal(list.some(item => item.id === "rep-1"), false);
});

test("Local History - rename sanitizes HTML/secrets and clamps length", () => {
  store = {};
  const snapshot = {
    id: "rep-rename",
    title: "Old Title",
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: "Content",
    timestamp: Date.now(),
    status: "draft_ready",
  };
  clientRecovery.saveGuestReportRecovery(snapshot);

  // Test renaming with dirty title
  const dirtyTitle = "New Title with <b>HTML</b> and sk-key1234567890abcdef and tokenhash value";
  clientRecovery.renameGuestReportRecovery("rep-rename", dirtyTitle);

  const cleanSnapshot = clientRecovery.getGuestReportRecoveryById("rep-rename");
  assert.ok(cleanSnapshot);
  assert.doesNotMatch(cleanSnapshot.title, /<b>/);
  assert.doesNotMatch(cleanSnapshot.title, /sk-key/);
  assert.doesNotMatch(cleanSnapshot.title, /tokenhash/);
  assert.match(cleanSnapshot.title, /New Title with HTML and and value/);

  // Test length clamping
  const longTitle = "Draft Laporan Baru Dengan Judul Sangat Panjang ".repeat(10);
  clientRecovery.renameGuestReportRecovery("rep-rename", longTitle);
  const clampedSnapshot = clientRecovery.getGuestReportRecoveryById("rep-rename");
  assert.equal(clampedSnapshot.title.length, 80);

  // Test empty title fallback
  clientRecovery.renameGuestReportRecovery("rep-rename", "");
  const fallbackSnapshot = clientRecovery.getGuestReportRecoveryById("rep-rename");
  assert.equal(fallbackSnapshot.title, "Draft Laporan Tanpa Judul");
});

test("Local History - delete one removes only that entry", () => {
  store = {};
  const makeSnapshot = (num) => ({
    id: `rep-${num}`,
    title: `Draft ${num}`,
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: `Teks ${num}`,
    timestamp: Date.now() + num,
    status: "draft_ready",
  });

  clientRecovery.saveGuestReportRecovery(makeSnapshot(1));
  clientRecovery.saveGuestReportRecovery(makeSnapshot(2));

  clientRecovery.clearGuestReportRecovery("rep-1");
  const list = clientRecovery.listGuestReportRecoveries();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, "rep-2");
});

test("Local History - clear all removes only NaLI recovery snapshots", () => {
  store = {};
  store["other-unrelated-key"] = "keep-me";

  const snapshot = {
    id: "rep-clear",
    title: "Draft",
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: "Text",
    timestamp: Date.now(),
    status: "draft_ready",
  };
  clientRecovery.saveGuestReportRecovery(snapshot);

  clientRecovery.clearGuestReportRecovery(); // clear all recoveries

  assert.equal(clientRecovery.listGuestReportRecoveries().length, 0);
  assert.equal(store["other-unrelated-key"], "keep-me");
});

test("Local History - malformed JSON recovers safely", () => {
  store = {};
  store["nali-recovery-snapshots"] = "not json { [";

  const list = clientRecovery.listGuestReportRecoveries();
  assert.deepEqual(list, []);

  const item = clientRecovery.getGuestReportRecoveryById("any");
  assert.equal(item, null);
});

test("Local History - expired entries are pruned", () => {
  store = {};
  const now = Date.now();
  const snapExpired = {
    id: "rep-expired",
    title: "Old Draft",
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: "Expired Content",
    timestamp: now - (25 * 60 * 60 * 1000), // 25 hours ago
    status: "draft_ready",
  };
  const snapFresh = {
    id: "rep-fresh",
    title: "New Draft",
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: "Fresh Content",
    timestamp: now,
    status: "draft_ready",
  };

  clientRecovery.saveGuestReportRecovery(snapExpired);
  clientRecovery.saveGuestReportRecovery(snapFresh);

  // Retrieve list (drops expired in listGuestReportRecoveries)
  const list = clientRecovery.listGuestReportRecoveries();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, "rep-fresh");

  // Physically prune
  clientRecovery.clearExpiredGuestRecoveries();
  const raw = JSON.parse(store["nali-recovery-snapshots"]);
  assert.equal(raw.length, 1);
  assert.equal(raw[0].id, "rep-fresh");
});

test("Local History - security: never stores secrets or access keys", () => {
  store = {};
  const dirty = {
    id: "rep-dirty",
    title: "Draft",
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: "Text",
    timestamp: Date.now(),
    status: "draft_ready",
    
    // Forbidden fields
    report_access_token_hash: "hash_value",
    access_key: "raw_access_key",
    token: "my-token",
    apikey: "my-api",
  };

  clientRecovery.saveGuestReportRecovery(dirty);

  const clean = clientRecovery.getGuestReportRecoveryById("rep-dirty");
  assert.ok(clean);
  assert.equal(clean.report_access_token_hash, undefined);
  assert.equal(clean.access_key, undefined);
  assert.equal(clean.token, undefined);
  assert.equal(clean.apikey, undefined);
});

test("Local History - UI source copy verification", () => {
  const formPath = path.join(__dirname, "../../src/components/report/CreateReportForm.tsx");
  const workspacePath = path.join(__dirname, "../../src/components/report/AgentWorkspace.tsx");

  const formCode = fs.readFileSync(formPath, "utf-8");
  const workspaceCode = fs.readFileSync(workspacePath, "utf-8");

  // Check forbidden labels
  const forbiddenRegex = /cloud\s*(sync|backup)|permanent\s*storage|account\s*sync|guaranteed\s*backup/gi;
  assert.doesNotMatch(formCode, forbiddenRegex);
  assert.doesNotMatch(workspaceCode, forbiddenRegex);

  // Check presence of LocalHistoryPanel rendering
  assert.ok(formCode.includes("<LocalHistoryPanel"));
  assert.ok(workspaceCode.includes("<LocalHistoryPanel"));

  // Check allowed labels
  assert.ok(formCode.includes("Riwayat lokal browser") || formCode.includes("Draft lokal terbaru"));
  assert.ok(workspaceCode.includes("Riwayat lokal browser") || workspaceCode.includes("Draft lokal terbaru"));
});

test("Local History - Midtrans remains deferred & no public founder links", () => {
  const readiness = getSystemReadiness();
  assert.equal(readiness.midtransConfigured, false, "Midtrans config must be deferred.");
  assert.equal(readiness.paidCheckoutActive, false, "Paid launch checkout must be inactive.");

  const workspacePath = path.join(__dirname, "../../src/components/report/AgentWorkspace.tsx");
  const workspaceCode = fs.readFileSync(workspacePath, "utf-8");
  assert.doesNotMatch(workspaceCode, /href=['"]\/founder['"]/g, "No founder link in public header/sidebar.");
});
