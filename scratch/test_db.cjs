const { loadLocalEnv, createSupabaseClients } = require("../scripts/validation-utils.cjs");

loadLocalEnv();
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

const { service } = createSupabaseClients();

async function run() {
  console.log("Testing connection...");
  const { data: reports, error } = await service.from("reports").select("id").limit(1);
  if (error) {
    console.error("Error fetching reports:", error);
  } else {
    console.log("Successfully fetched reports:", reports);
  }

  // Let's try to insert a test report
  const testId = "00000000-0000-0000-0000-000000000099";
  const { error: insertError } = await service.from("reports").insert({
    id: testId,
    guest_session_id_hash: "test-guest-hash",
    report_access_token_hash: "test-token-hash",
    status: "export_ready",
    input: { test: true },
    output: { test: true },
    mode: "draft_from_materials"
  });

  if (insertError) {
    console.error("Error inserting report:", insertError);
  } else {
    console.log("Successfully inserted report!");
    // Clean up
    await service.from("reports").delete().eq("id", testId);
  }
}

run().catch(console.error);
