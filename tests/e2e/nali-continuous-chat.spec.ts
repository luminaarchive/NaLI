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
    // 1. Visit homepage
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Apa yang ingin kamu susun hari ini?");

    // 2. Type an observation query in homepage query box
    const queryBox = page.locator("textarea[placeholder*='Deskripsikan spesies']");
    await expect(queryBox).toBeVisible();
    await queryBox.fill("Bantu saya menyusun laporan observasi tentang burung madu pengantin (Leptocoma sperata) di lereng Gunung Lawu.");

    // 3. Click search submit button
    const submitBtn = page.locator("button:has-text('Mulai Susun Laporan')");
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 4. Verify workspace routing
    await page.waitForURL(/\/create-report/);
    await expect(page).toHaveURL(/\/create-report/);

    // 5. Verify prefilled composer state
    const composer = page.locator("textarea[placeholder*='Ketik catatan, topik']");
    await expect(composer).toBeVisible();
    await expect(composer).toHaveValue("Bantu saya menyusun laporan observasi tentang burung madu pengantin (Leptocoma sperata) di lereng Gunung Lawu.");

    // 6. Check academic integrity checkbox
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
    await expect(page.locator("text=Salin Markdown")).toBeVisible();
    await expect(page.locator("text=Salin teks biasa")).toBeVisible();

    // 9. Send first follow-up message to revise the report
    const followUpComposer = page.locator("textarea[placeholder*='Ketik instruksi penyuntingan']");
    await expect(followUpComposer).toBeVisible();
    await followUpComposer.fill("Tolong perpendek ringkasan draf laporan di atas.");
    const followUpSendBtn = page.locator("button[aria-label*='Buat Laporan']");
    await expect(followUpSendBtn).toBeEnabled();
    await followUpSendBtn.click();

    // Verify revision finishes successfully
    await expect(page.locator("text=Telah disesuaikan ke gaya bahasa")).toBeVisible();

    // 10. Send second follow-up message to restructure
    await followUpComposer.fill("Tolong ubah gaya bahasa laporan menjadi lebih formal.");
    await followUpSendBtn.click();
    await expect(page.locator("text=Silakan tinjau perubahan pada draf laporan")).toBeVisible();

    // 11. Verify localStorage thread history persistence after reload
    await page.reload();
    await expect(page.locator("text=Burung Madu Pengantin")).toBeVisible();
    await expect(page.locator("text=Salin Markdown")).toBeVisible();

    // 12. Verify PDF export lock state explanation
    const pdfDisclaimer = page.locator("text=PDF/DOCX publik tetap terkunci / inactive di CP1");
    await expect(pdfDisclaimer).toBeVisible();
  });

  test("Should support mobile viewport 360px responsiveness", async ({ page }) => {
    // Set 360px mobile width
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/create-report");

    // Verify empty state is legible
    await expect(page.locator("h1")).toContainText("Buat Laporan");
    const composer = page.locator("textarea[placeholder*='Ketik catatan, topik']");
    await expect(composer).toBeVisible();

    // Verify sidebar history drawer button is visible on mobile
    const menuBtn = page.locator("button[aria-label='Buka riwayat']");
    await expect(menuBtn).toBeVisible();
  });
});
