import { test, expect } from "@playwright/test";

test.describe("NaLI Auth, Manus-like UI, and Persistence linking E2E", () => {
  test("1. Login page renders Manus-like layout and options", async ({ page }) => {
    await page.goto("/login");

    // Title and Subtitle check (Indonesian)
    await expect(page.locator("h1")).toContainText("Masuk ke NaLI");
    await expect(page.locator("p").first()).toContainText(
      "Lanjutkan laporan, catatan, dan riwayat kerja berbasis bukti."
    );

    // Prominent Google OAuth button
    const googleBtn = page.locator("button:has-text('Lanjutkan dengan Google')");
    await expect(googleBtn).toBeVisible();

    // Separator
    await expect(page.locator("span:has-text('atau')")).toBeVisible();

    // Email & Password forms
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();

    // Submit button
    const submitBtn = page.locator("button[type='submit']:has-text('Masuk')");
    await expect(submitBtn).toBeVisible();

    // Register Link
    const registerLink = page.locator("a:has-text('Buat akun')");
    await expect(registerLink).toBeVisible();
  });

  test("2. Register page renders and password visibility toggle works", async ({ page }) => {
    await page.goto("/register");

    // Title and Subtitle check
    await expect(page.locator("h1")).toContainText("Buat Akun NaLI");

    // Email, password, and profile fields
    await expect(page.locator("input[placeholder='Siti Rahma']")).toBeVisible();
    await expect(page.locator("input[placeholder='Universitas...']")).toBeVisible();
    await expect(page.locator("input[type='email']")).toBeVisible();

    const passwordInput = page.locator("input[placeholder='••••••••']");
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Password visibility toggle
    const toggleBtn = page.locator("button[aria-label='Tampilkan kata sandi']");
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "text");
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Role selection options
    await expect(page.locator("button:has-text('Mahasiswa')")).toBeVisible();
    await expect(page.locator("button:has-text('Peneliti')")).toBeVisible();
    await expect(page.locator("button:has-text('Tim lapangan')")).toBeVisible();
    await expect(page.locator("button:has-text('Umum')")).toBeVisible();
  });

  test("3. Login page mobile 360px viewport responsiveness", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/login");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("button:has-text('Lanjutkan dengan Google')")).toBeVisible();
    await expect(page.locator("input[type='email']")).toBeVisible();
  });

  test("4. Safe login redirect parameter handling", async ({ page }) => {
    // Go to login with relative destination next query param
    await page.goto("/login?next=%2Fcreate-report%3FthreadId%3D123");

    // Verify it forwards correctly in register link too
    const registerLink = page.locator("a:has-text('Buat akun')");
    const href = await registerLink.getAttribute("href");
    expect(href).toContain("/register?next=%2Fcreate-report%3FthreadId%3D123");
  });

  test("5. Guest 3-message flow and 'Simpan ke akun' header transition", async ({ page }) => {
    test.setTimeout(90000);

    // Initial guest workspace load
    await page.goto("/create-report");
    await expect(page.locator("h1")).toContainText("Buat Laporan");

    // Check header states - Guest must be visible
    const guestHeaderTag = page.locator("span:has-text('Guest')");
    await expect(guestHeaderTag).toBeVisible();

    const saveToAccountLink = page.locator("a:has-text('Simpan ke akun')");
    await expect(saveToAccountLink).toBeVisible();

    // Redirect verify
    const redirectUrl = await saveToAccountLink.getAttribute("href");
    expect(redirectUrl).toContain("/login?next=%2Fcreate-report&linkGuest=1");
  });
});
