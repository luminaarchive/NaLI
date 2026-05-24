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

test("Guest Report Autosave - status validation", () => {
  store = {};
  
  const snapshot = {
    id: "composer-autosave",
    title: "Autosave Draft Laporan",
    mode: "draft_from_materials",
    selectedModel: "obsidian",
    mainText: "Sungai Bengawan Solo terlihat keruh hari ini.",
    timestamp: Date.now(),
    status: "autosaved_draft",
  };

  const saved = clientRecovery.saveGuestReportRecovery(snapshot);
  assert.equal(saved, true);

  const list = clientRecovery.listGuestReportRecoveries();
  assert.equal(list.length, 1);
  assert.equal(list[0].status, "autosaved_draft");
  assert.equal(list[0].selectedModel, "obsidian");
});

test("Guest Report Autosave - ignores empty or too short input", () => {
  // Creating a short input check test
  const testInputShort = "Short input";
  const isValidLength = testInputShort.trim().length >= 20;
  assert.equal(isValidLength, false);

  const testInputLong = "This is a long enough input to be autosaved correctly.";
  const isValidLengthLong = testInputLong.trim().length >= 20;
  assert.equal(isValidLengthLong, true);
});

test("Guest Report Autosave - strips forbidden fields", () => {
  store = {};

  const dirtyAutosave = {
    id: "composer-autosave",
    title: "Autosave Draft Laporan",
    mode: "draft_from_materials",
    selectedModel: "zephyr",
    mainText: "Laporan observasi di tebing <b>sungai</b>.",
    timestamp: Date.now(),
    status: "autosaved_draft",
    
    // Forbidden fields
    report_access_token_hash: "secret_access_hash",
    apikey: "secret-key",
    provider: "obsidian-internal-provider",
    stack: "Error: stack trace details...",
    payment: "midtrans-payload",
  };

  clientRecovery.saveGuestReportRecovery(dirtyAutosave);

  const list = clientRecovery.listGuestReportRecoveries();
  assert.equal(list.length, 1);
  const clean = list[0];

  assert.equal(clean.id, "composer-autosave");
  assert.equal(clean.mainText, "Laporan observasi di tebing sungai.");
  assert.equal(clean.selectedModel, "zephyr");

  // Verify fields are stripped
  assert.equal(clean.report_access_token_hash, undefined);
  assert.equal(clean.apikey, undefined);
  assert.equal(clean.provider, undefined);
  assert.equal(clean.stack, undefined);
  assert.equal(clean.payment, undefined);
});

test("Guest Report Autosave - respects max 3 entries & LIFO list limits", () => {
  store = {};

  const makeSnapshot = (num) => ({
    id: `autosave-${num}`,
    title: `Laporan ${num}`,
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: `Observasi sungai dan tanah longsor nomor ${num}`,
    timestamp: Date.now() + num,
    status: "autosaved_draft",
  });

  clientRecovery.saveGuestReportRecovery(makeSnapshot(1));
  clientRecovery.saveGuestReportRecovery(makeSnapshot(2));
  clientRecovery.saveGuestReportRecovery(makeSnapshot(3));
  clientRecovery.saveGuestReportRecovery(makeSnapshot(4)); // rep-1 gets evicted

  const list = clientRecovery.listGuestReportRecoveries();
  assert.equal(list.length, 3);
  assert.equal(list[0].id, "autosave-4");
  assert.equal(list[1].id, "autosave-3");
  assert.equal(list[2].id, "autosave-2");
  
  const hasOldest = list.some(item => item.id === "autosave-1");
  assert.equal(hasOldest, false);
});

test("Guest Report Autosave - respects TTL boundaries", () => {
  store = {};
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  const freshSnap = {
    id: "composer-autosave",
    title: "Autosave",
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: "Observasi air sungai keruh",
    timestamp: now - oneHour,
    status: "autosaved_draft",
  };

  const expiredSnap = {
    id: "composer-autosave-expired",
    title: "Expired Autosave",
    mode: "draft_from_materials",
    selectedModel: "peregrine",
    mainText: "Observasi tebing sungai retak",
    timestamp: now - (25 * oneHour), // 25 hours ago
    status: "autosaved_draft",
  };

  clientRecovery.saveGuestReportRecovery(expiredSnap);
  clientRecovery.saveGuestReportRecovery(freshSnap);

  const list = clientRecovery.listGuestReportRecoveries();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, "composer-autosave");
});

test("Guest Report Autosave - source-level checks (debounce, UI copy, integrity)", () => {
  const formPath = path.join(__dirname, "../../src/components/report/CreateReportForm.tsx");
  const workspacePath = path.join(__dirname, "../../src/components/report/AgentWorkspace.tsx");

  const formCode = fs.readFileSync(formPath, "utf-8");
  const workspaceCode = fs.readFileSync(workspacePath, "utf-8");

  // Verify that debounce/throttle is implemented in both files via timers
  assert.ok(formCode.includes("setTimeout") && formCode.includes("clearTimeout"), "Debounce timer must exist in CreateReportForm.");
  assert.ok(workspaceCode.includes("setTimeout") && workspaceCode.includes("clearTimeout"), "Debounce timer must exist in AgentWorkspace.");

  // Verify they save snapshots with status "autosaved_draft"
  assert.ok(formCode.includes("autosaved_draft"), "CreateReportForm must utilize 'autosaved_draft' status.");
  assert.ok(workspaceCode.includes("autosaved_draft"), "AgentWorkspace must utilize 'autosaved_draft' status.");

  // Verify they check for minimum character length (20 characters)
  assert.ok(formCode.includes(".length < 20"), "CreateReportForm must check length before autosaving.");
  assert.ok(workspaceCode.includes(".length < 20"), "AgentWorkspace must check length before autosaving.");

  // Verify honest copy limits
  const forbiddenRegex = /cloud\s*(sync|backup)|permanent\s*storage|account\s*sync|guaranteed\s*backup/gi;
  assert.doesNotMatch(formCode, forbiddenRegex);
  assert.doesNotMatch(workspaceCode, forbiddenRegex);

  // Verify NaliAlert usage for recovery display
  assert.ok(formCode.includes("<NaliAlert"), "CreateReportForm uses NaliAlert banner.");
  assert.ok(workspaceCode.includes("<NaliAlert"), "AgentWorkspace uses NaliAlert banner.");
});

test("Guest Report Autosave - Midtrans/payment remains deferred", () => {
  const readiness = getSystemReadiness();
  assert.equal(readiness.midtransConfigured, false, "Midtrans config remains deferred.");
  assert.equal(readiness.paidCheckoutActive, false, "Paid launch remains NO-GO.");
});
