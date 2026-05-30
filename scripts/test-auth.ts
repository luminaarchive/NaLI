/**
 * Auth test script: creates 3 dummy accounts, verifies sign-in/session/DB,
 * then cleans up. Run with: npx tsx scripts/test-auth.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_ACCOUNTS = [
  { email: "dummy1@nali-test.dev", password: "NaliTest2026!" },
  { email: "dummy2@nali-test.dev", password: "NaliTest2026!" },
  { email: "dummy3@nali-test.dev", password: "NaliTest2026!" },
];

type TestResult = { step: string; pass: boolean; note?: string };

function log(result: TestResult) {
  const icon = result.pass ? "PASS" : "FAIL";
  const note = result.note ? ` (${result.note})` : "";
  console.log(`  [${icon}] ${result.step}${note}`);
}

async function testAccount(email: string, password: string): Promise<boolean> {
  console.log(`\nTesting: ${email}`);
  const results: TestResult[] = [];
  let userId: string | null = null;

  // Step 1: Create user via admin
  try {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) {
      results.push({ step: "Create user", pass: false, note: error?.message });
    } else {
      userId = data.user.id;
      results.push({ step: "Create user", pass: true });
    }
  } catch (err: any) {
    results.push({ step: "Create user", pass: false, note: err.message });
  }

  if (!userId) {
    results.forEach(log);
    return false;
  }

  // Step 2: Sign in
  const anonClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let sessionToken: string | null = null;
  try {
    const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      results.push({ step: "Sign in", pass: false, note: error?.message });
    } else {
      sessionToken = data.session.access_token;
      results.push({ step: "Sign in", pass: true });
    }
  } catch (err: any) {
    results.push({ step: "Sign in", pass: false, note: err.message });
  }

  // Step 3: Assert session not null
  results.push({ step: "Session not null", pass: !!sessionToken });

  // Step 4: Insert a report_session row (use service role since table may have RLS)
  try {
    const { error } = await admin.from("report_sessions").insert({
      user_id: userId,
      title: `Test session for ${email}`,
      prompt: "Test prompt",
    });
    results.push({ step: "Insert report_session", pass: !error, note: error?.message });
  } catch (err: any) {
    results.push({ step: "Insert report_session", pass: false, note: err.message });
  }

  // Step 5: Fetch report_sessions for user
  try {
    const { data, error } = await admin
      .from("report_sessions")
      .select("id")
      .eq("user_id", userId);
    const hasRows = !error && (data?.length ?? 0) > 0;
    results.push({ step: "Fetch report_sessions count > 0", pass: hasRows, note: error?.message ?? `count=${data?.length}` });
  } catch (err: any) {
    results.push({ step: "Fetch report_sessions", pass: false, note: err.message });
  }

  // Step 6: Sign out
  try {
    const { error } = await anonClient.auth.signOut();
    results.push({ step: "Sign out", pass: !error, note: error?.message });
  } catch (err: any) {
    results.push({ step: "Sign out", pass: false, note: err.message });
  }

  // Step 7: Assert session null after sign out
  const { data: { session } } = await anonClient.auth.getSession();
  results.push({ step: "Session null after sign out", pass: session === null });

  results.forEach(log);
  return results.every((r) => r.pass);
}

async function cleanup(userIds: string[]) {
  console.log("\nCleaning up test users...");
  for (const id of userIds) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      console.log(`  WARN: Failed to delete user ${id}: ${error.message}`);
    } else {
      console.log(`  Deleted: ${id}`);
    }
  }
}

async function main() {
  console.log("NaLI Auth Test Script");
  console.log("======================");
  console.log(`Supabase URL: ${SUPABASE_URL.slice(0, 30)}...`);

  const userIds: string[] = [];
  const results: boolean[] = [];

  for (const { email, password } of TEST_ACCOUNTS) {
    // Pre-clean in case user already exists from a previous failed run
    const { data: existing } = await admin.auth.admin.listUsers();
    const existing_user = existing?.users?.find((u) => u.email === email);
    if (existing_user) {
      await admin.auth.admin.deleteUser(existing_user.id);
    }

    const { data } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (data.user) userIds.push(data.user.id);

    // Now delete just created and re-run via testAccount
    if (data.user) await admin.auth.admin.deleteUser(data.user.id);

    const pass = await testAccount(email, password);
    results.push(pass);

    // Collect the newly created user ID for cleanup
    const { data: afterTest } = await admin.auth.admin.listUsers();
    const afterUser = afterTest?.users?.find((u) => u.email === email);
    if (afterUser && !userIds.includes(afterUser.id)) {
      userIds.push(afterUser.id);
    }
  }

  await cleanup(userIds);

  console.log("\n=== RESULTS ===");
  TEST_ACCOUNTS.forEach(({ email }, i) => {
    console.log(`  ${results[i] ? "PASS" : "FAIL"} ${email}`);
  });

  const allPassed = results.every(Boolean);
  if (!allPassed) {
    console.error("\nSome tests failed.");
    process.exit(1);
  } else {
    console.log("\nAll 3 accounts passed.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
