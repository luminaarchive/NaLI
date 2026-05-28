import { execSync } from "node:child_process";

try {
  const status = execSync("git status --porcelain", { encoding: "utf8" }).trim();
  console.log("=========================================");
  console.log("          NaLI Git Clean Check           ");
  console.log("=========================================");

  if (status) {
    console.log("Status:  DIRTY (Uncommitted changes exist)");
    console.log("-----------------------------------------");
    console.log(status);
    console.log("=========================================");
    // Warn but do not fail unless strict env option is specified
    if (process.env.STRICT_GIT_CHECK === "true") {
      process.exit(1);
    }
  } else {
    console.log("Status:  CLEAN (No uncommitted changes)");
    console.log("=========================================");
  }
  process.exit(0);
} catch (error) {
  console.error("Failed to execute git status:", error.message);
  process.exit(2);
}
