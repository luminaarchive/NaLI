// @ts-nocheck
import { test, expect } from "@playwright/test";

test.describe("NaLI Workspace E2E Continuous Use & Persistence Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Grant simulated local storage tokens to bypass empty states
    await page.addInitScript(() => {
      window.localStorage.setItem("nali-guest-session-id", "e2e-session-uuid-123");
    });
  });

  test("Should flow seamlessly from Homepage search to workspace and run iterative chat revision", async ({ page }) => {
    test.setTimeout(120000);

    // 1. Visit homepage
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Apa yang ingin kamu susun hari ini?");

    // 2. Type an observation query in homepage query box
    const queryBox = page.locator("textarea[placeholder*='Deskripsikan spesies']");
    await expect(queryBox).toBeVisible();
    await queryBox.fill("Bantu saya menyusun laporan observasi tentang burung madu pengantin (Leptocoma sperata) di lereng Gunung Lawu berdasarkan catatan saya.");

    // 3. Click search submit button
    const submitBtn = page.locator("button:has-text('Mulai Susun Laporan')");
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 4. Verify workspace routing
    await page.waitForURL(/\/create-report/);
    await expect(page).toHaveURL(/\/create-report/);

    // 5. Verify prefilled composer state
    const composer = page.locator("textarea[placeholder*='Tulis tugas']");
    await expect(composer).toBeVisible();
    await expect(composer).toHaveValue("Bantu saya menyusun laporan observasi tentang burung madu pengantin (Leptocoma sperata) di lereng Gunung Lawu berdasarkan catatan saya.");

    // 6. Click More to reveal options, then check academic integrity checkbox
    const moreBtn = page.locator("button:has-text('More')");
    await expect(moreBtn).toBeVisible();
    await moreBtn.click();

    const integrityCheckbox = page.locator("input[type='checkbox']");
    await expect(integrityCheckbox).toBeVisible();
    await integrityCheckbox.check();

    // 7. Click submit query to trigger initial generation
    const sendBtn = page.locator("button[aria-label*='Buat Laporan']");
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();

    // 8. Verify agent workspace timeline and output rendering
    await expect(page.locator("text=Rencana Kerja NaLI (Active Plan)")).toBeVisible();
    
    // Wait for the server generation to complete
    await page.waitForURL(/\/report\/[a-f0-9-]+/);
    await expect(page.locator("text=Salin Markdown").first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator("text=Salin teks biasa").first()).toBeVisible({ timeout: 30000 });

    // 9. Send first follow-up message to revise the report
    const followUpComposer = page.locator("textarea[placeholder*='Ketik instruksi penyuntingan']");
    await expect(followUpComposer).toBeVisible();
    await followUpComposer.fill("Tolong perpendek ringkasan draf laporan di atas.");
    const followUpSendBtn = page.locator("button[aria-label*='Buat Laporan']");
    await expect(followUpSendBtn).toBeEnabled();
    await followUpSendBtn.click();

    // Verify revision finishes successfully
    await expect(page.locator("text=Silakan tinjau perubahan pada draf laporan").last()).toBeVisible({ timeout: 30000 });

    // 10. Send second follow-up message to restructure
    await followUpComposer.fill("Tolong ubah gaya bahasa laporan menjadi lebih formal.");
    await followUpSendBtn.click();
    await expect(page.locator("text=Telah disesuaikan ke gaya bahasa")).toBeVisible({ timeout: 30000 });

    // 11. Verify localStorage thread history persistence after reload
    await page.reload();
    await expect(page.locator("text=Burung Madu Pengantin").first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator("text=Salin Markdown").first()).toBeVisible({ timeout: 30000 });

    // 12. Verify PDF export lock state explanation
    const pdfDisclaimer = page.locator("text=PDF/DOCX publik tetap terkunci / inactive").first();
    await expect(pdfDisclaimer).toBeVisible({ timeout: 30000 });
  });

  test("Should support mobile viewport 360px responsiveness", async ({ page }) => {
    // Set 360px mobile width
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/create-report");

    // Verify empty state is legible
    await expect(page.locator("h1")).toContainText("Apa yang bisa NaLI bantu susun?");
    const composer = page.locator("textarea[placeholder*='Tulis tugas']");
    await expect(composer).toBeVisible();

    // Verify sidebar history drawer button is visible on mobile
    const menuBtn = page.locator("button[aria-label='Buka riwayat']");
    await expect(menuBtn).toBeVisible();
  });
});
