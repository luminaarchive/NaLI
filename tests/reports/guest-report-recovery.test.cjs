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
      throw new Error("QuotaExceededError: Dom storage limit reached");
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

// Mock global window
globalThis.window = {
  localStorage: mockLocalStorage,
};

const clientRecovery = require("../../src/lib/reports/clientRecovery");
const { getSystemReadiness } = require("../../src/lib/system/readiness");

test("Guest Report Recovery - safeStorageAvailable", () => {
  // 1. Available by default
  assert.equal(clientRecovery.safeStorageAvailable(), true);

  // 2. Unavailable if window or localStorage missing
  const originalWindow = globalThis.window;
  delete globalThis.window;
  assert.equal(clientRecovery.safeStorageAvailable(), false);
  
  globalThis.window = originalWindow;

  // 3. Unavailable if setItem throws
  shouldThrowOnSetItem = true;
  assert.equal(clientRecovery.safeStorageAvailable(), false);
  shouldThrowOnSetItem = false;
});

test("Guest Report Recovery - save/load/list/clear", () => {
  store = {};
  
  const snapshot = {
    id: "rep-123",
    title: "Laporan Erosi",
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: "Tebing sungai longsor",
    timestamp: Date.now(),
    status: "draft_ready",
  };

  const saved = clientRecovery.saveGuestReportRecovery(snapshot);
  assert.equal(saved, true);

  const latest = clientRecovery.loadLatestGuestReportRecovery();
  assert.ok(latest);
  assert.equal(latest.id, "rep-123");
  assert.equal(latest.mainText, "Tebing sungai longsor");

  const list = clientRecovery.listGuestReportRecoveries();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, "rep-123");

  // Clear specific ID
  clientRecovery.clearGuestReportRecovery("rep-123");
  assert.equal(clientRecovery.listGuestReportRecoveries().length, 0);

  // Re-save and clear all
  clientRecovery.saveGuestReportRecovery(snapshot);
  assert.equal(clientRecovery.listGuestReportRecoveries().length, 1);
  clientRecovery.clearGuestReportRecovery(); // clear all
  assert.equal(clientRecovery.listGuestReportRecoveries().length, 0);
});

test("Guest Report Recovery - max 3 entries limit", () => {
  store = {};

  const makeSnapshot = (num) => ({
    id: `rep-${num}`,
    title: `Laporan ${num}`,
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: `Catatan nomor ${num}`,
    timestamp: Date.now() + num, // distinct timestamps
    status: "draft_ready",
  });

  clientRecovery.saveGuestReportRecovery(makeSnapshot(1));
  clientRecovery.saveGuestReportRecovery(makeSnapshot(2));
  clientRecovery.saveGuestReportRecovery(makeSnapshot(3));
  clientRecovery.saveGuestReportRecovery(makeSnapshot(4)); // Should displace oldest (rep-1)

  const list = clientRecovery.listGuestReportRecoveries();
  assert.equal(list.length, 3);
  
  // Sorted newest first, so rep-4, rep-3, rep-2
  assert.equal(list[0].id, "rep-4");
  assert.equal(list[1].id, "rep-3");
  assert.equal(list[2].id, "rep-2");

  // rep-1 should not be in list
  const hasRep1 = list.some(item => item.id === "rep-1");
  assert.equal(hasRep1, false);
});

test("Guest Report Recovery - TTL 24 hour pruning", () => {
  store = {};

  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  const snapFresh = {
    id: "rep-fresh",
    title: "Fresh",
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: "Teks baru",
    timestamp: now - oneHour,
    status: "draft_ready",
  };

  const snapExpired = {
    id: "rep-expired",
    title: "Expired",
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: "Teks lama sekali",
    timestamp: now - (25 * oneHour), // 25 hours ago
    status: "draft_ready",
  };

  // Directly save them to bypass list filters during creation if needed, or save using recovery
  clientRecovery.saveGuestReportRecovery(snapExpired);
  clientRecovery.saveGuestReportRecovery(snapFresh);

  // listGuestReportRecoveries should filter out the expired one
  const list = clientRecovery.listGuestReportRecoveries();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, "rep-fresh");

  // Prune expired recoveries
  clientRecovery.pruneExpiredGuestRecoveries();
  // Check raw store to ensure expired was physically removed
  const raw = JSON.parse(store["nali-recovery-snapshots"]);
  assert.equal(raw.length, 1);
  assert.equal(raw[0].id, "rep-fresh");
});

test("Guest Report Recovery - malformed JSON safe fallback", () => {
  store = {};
  store["nali-recovery-snapshots"] = "malformed { json state [";

  const list = clientRecovery.listGuestReportRecoveries();
  assert.deepEqual(list, []);

  // Ensure loadLatest doesn't throw
  const latest = clientRecovery.loadLatestGuestReportRecovery();
  assert.equal(latest, null);
});

test("Guest Report Recovery - quota error safe fallback", () => {
  store = {};
  shouldThrowOnSetItem = true;

  const snapshot = {
    id: "rep-quota",
    title: "Quota Test",
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: "Teks quota",
    timestamp: Date.now(),
    status: "draft_ready",
  };

  const saved = clientRecovery.saveGuestReportRecovery(snapshot);
  assert.equal(saved, false); // Returns false instead of throwing
  shouldThrowOnSetItem = false;
});

test("Guest Report Recovery - forbidden fields stripped and secrets sanitized", () => {
  store = {};

  const dirtySnapshot = {
    id: "rep-dirty",
    title: "Dirty",
    mode: "draft_from_materials",
    selectedModel: "obsidian",
    mainText: "Sample text with <b>HTML</b> tags.",
    timestamp: Date.now(),
    status: "draft_ready",
    
    // Forbidden fields
    report_access_token_hash: "secret_hash",
    apikey: "my-api-key",
    provider: "zephyr-provider",
    serverkey: "serv-123",
    stack: "Error: stack trace...",
    payment: { mode: "midtrans", amount: 10000 },
    midtrans: "some-payload",
  };

  clientRecovery.saveGuestReportRecovery(dirtySnapshot);

  const list = clientRecovery.listGuestReportRecoveries();
  assert.equal(list.length, 1);
  const clean = list[0];

  // Verified fields must persist
  assert.equal(clean.id, "rep-dirty");
  assert.equal(clean.title, "Dirty");
  
  // HTML tags stripped in mainText
  assert.equal(clean.mainText, "Sample text with HTML tags.");

  // Forbidden fields must be stripped
  assert.equal(clean.report_access_token_hash, undefined);
  assert.equal(clean.apikey, undefined);
  assert.equal(clean.provider, undefined);
  assert.equal(clean.serverkey, undefined);
  assert.equal(clean.stack, undefined);
  assert.equal(clean.payment, undefined);
  assert.equal(clean.midtrans, undefined);
});

test("Guest Report Recovery - UI copy and naming verification", () => {
  const workspacePath = path.join(__dirname, "../../src/components/report/AgentWorkspace.tsx");
  const formPath = path.join(__dirname, "../../src/components/report/CreateReportForm.tsx");

  const workspaceCode = fs.readFileSync(workspacePath, "utf-8");
  const formCode = fs.readFileSync(formPath, "utf-8");

  // Rule 3: Do not describe this as cloud sync, permanent storage, account sync, or guaranteed backup.
  const forbiddenRegex = /cloud\s*(sync|backup)|permanent\s*storage|account\s*sync|guaranteed\s*backup/gi;
  assert.doesNotMatch(workspaceCode, forbiddenRegex);
  assert.doesNotMatch(formCode, forbiddenRegex);

  // Verify honest labels are present
  // "local browser recovery", "recent draft recovery", "saved on this device/browser", or Indonesian equivalents
  // Indonesians: "tersimpan di browser ini"
  assert.ok(workspaceCode.includes("Draft terakhir ditemukan") || workspaceCode.includes("browser ini"));
  assert.ok(formCode.includes("Draft terakhir ditemukan") || formCode.includes("browser ini"));

  // Check integration references and NaliAlert usage
  assert.ok(workspaceCode.includes("clientRecovery") || workspaceCode.includes("recoverySnapshot"));
  assert.ok(formCode.includes("clientRecovery") || formCode.includes("recoverySnapshot"));

  // Verify NaliAlert tags for recovery
  assert.ok(workspaceCode.includes("<NaliAlert"));
  assert.ok(formCode.includes("<NaliAlert"));
});

test("Guest Report Recovery - Midtrans/payment state remains deferred", () => {
  const readiness = getSystemReadiness();
  assert.equal(readiness.midtransConfigured, false, "Midtrans remains DEFERRED.");
  assert.equal(readiness.paidCheckoutActive, false, "Paid launch remains NO-GO.");
  assert.equal(readiness.creditPurchaseActive, false, "Credit purchase remains NO-GO.");
});

test("Guest Report Recovery - no public /founder navigation links introduced", () => {
  const headerPath = path.join(__dirname, "../../src/components/report/AgentWorkspace.tsx");
  const headerCode = fs.readFileSync(headerPath, "utf-8");

  // Verify that there is no public founder console links rendered in the sidebar or workspace
  // Look for links to /founder
  const founderLinkRegex = /href=['"]\/founder['"]/g;
  assert.doesNotMatch(headerCode, founderLinkRegex, "No public /founder link should be present.");
});
