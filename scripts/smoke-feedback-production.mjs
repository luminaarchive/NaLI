import { chromium } from 'playwright';

// Exit after 120 seconds maximum to prevent hanging indefinitely
const globalTimeout = setTimeout(() => {
  console.error("FATAL: Global smoke test timeout of 120 seconds exceeded!");
  process.exit(1);
}, 120000);

async function runSmokeTest() {
  let browser = null;
  try {
    console.log("[1/8] opening site");
    browser = await chromium.launch({ headless: true });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(15000);

    // Detailed console log capture with safety replacements
    page.on('console', msg => {
      let text = msg.text();
      // Safe replacement of potentially sensitive values to avoid printing raw secrets
      text = text.replace(/[a-f0-9]{32,}/ig, '[HEX-REDACTED]');
      text = text.replace(/session-[a-z0-9-]+/ig, 'session-[REDACTED]');
      console.log(`[Browser Console] [${msg.type()}] ${text}`);
    });

    page.on('pageerror', err => {
      console.error(`[Browser PageError] ${err.message}`);
    });

    // Monitor all requests
    page.on('request', req => {
      console.log(`[Request] ${req.method()} ${req.url()}`);
    });

    page.on('response', res => {
      console.log(`[Response] ${res.status()} ${res.url()}`);
    });

    // Open create report page
    const baseUrl = process.env.TEST_URL || "https://naliai.vercel.app";
    await page.goto(`${baseUrl}/create-report`, { timeout: 30000 });
    
    console.log("[2/8] checking localStorage guest session");
    const initialLocalStorage = await page.evaluate(() => {
      const session = localStorage.getItem("nali-guest-session-id");
      return {
        exists: !!session,
        length: session ? session.length : 0
      };
    });
    console.log(`- guestSessionExists: ${initialLocalStorage.exists}`);
    console.log(`- guestSessionLength: ${initialLocalStorage.length}`);

    console.log("[3/8] filling report input");
    const textarea = page.locator('textarea[placeholder*="Tulis catatan, lokasi, atau sumber"]');
    await textarea.waitFor({ state: 'visible', timeout: 15000 });
    await textarea.fill("Saya mengamati erosi di Banjir Kanal Semarang. Tebing sungai terlihat terkikis, air mengalir sangat deras, dan terdapat runtuhan tanah kecil di sepanjang tikungan sungai.");

    // Check integrity consent
    const checkbox = page.locator('input[type="checkbox"]');
    await checkbox.waitFor({ state: 'visible', timeout: 15000 });
    await checkbox.check();

    // Listen for API generation response
    let apiResponseStatus = null;
    let apiResponseJson = null;
    page.on('response', async (response) => {
      if (response.url().includes('/api/reports/generate') && response.request().method() === 'POST') {
        apiResponseStatus = response.status();
        try {
          apiResponseJson = await response.json();
        } catch (e) {
          // ignore parsing error
        }
      }
    });

    console.log("[4/8] submitting report");
    const submitBtn = page.locator('button[type="submit"]:has-text("Buat Draf Berbasis Bahan")');
    await submitBtn.waitFor({ state: 'visible', timeout: 15000 });
    await submitBtn.click();

    console.log("[5/8] reached report page");
    // Wait for redirection to /report/[id] (timeout max 60 seconds)
    let reachedReportPage = false;
    const start = Date.now();
    while (Date.now() - start < 60000) {
      const currentUrl = page.url();
      if (/\/report\/[a-zA-Z0-9-]+/.test(currentUrl)) {
        reachedReportPage = true;
        break;
      }
      await page.waitForTimeout(500);
    }

    if (!reachedReportPage) {
      console.error(`Failed to redirect to report page. Current URL is: ${page.url()}`);
      console.error(`API response status: ${apiResponseStatus}`);
      if (apiResponseJson) {
        console.error(`API response error field: ${apiResponseJson.error || 'none'}`);
        console.error(`API has report field: ${!!apiResponseJson.report}`);
      }
      throw new Error("Redirection to /report/[id] timed out.");
    }

    const reportId = page.url().split('/report/')[1]?.split('?')[0];
    console.log(`- Redirected to report page! ID: ${reportId}`);
    console.log(`- apiPersistenceStatus: ${apiResponseJson?.persistence}`);

    // Verify localStorage after generation
    const postLocalStorage = await page.evaluate((rId) => {
      const session = localStorage.getItem("nali-guest-session-id");
      const reportItem = localStorage.getItem(`nali-report:${rId}`);
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.includes('access') || k.includes('key')) {
          keys.push(k);
        }
      }
      return {
        sessionExists: !!session,
        sessionLength: session ? session.length : 0,
        reportExists: !!reportItem,
        reportLength: reportItem ? reportItem.length : 0,
        accessKeyAliases: keys
      };
    }, reportId);

    console.log(`- guestSessionExists: ${postLocalStorage.sessionExists}`);
    console.log(`- guestSessionLength: ${postLocalStorage.sessionLength}`);
    console.log(`- reportExistsInLocalStorage: ${postLocalStorage.reportExists}`);
    console.log(`- reportLocalStorageLength: ${postLocalStorage.reportLength}`);
    console.log(`- accessKeyAliasesFound: ${postLocalStorage.accessKeyAliases.join(', ')}`);

    console.log("[6/8] submitting feedback");
    const feedbackHeading = page.locator('h2:has-text("Apakah preview ini membantu?")');
    await feedbackHeading.waitFor({ state: 'visible', timeout: 15000 });
    await feedbackHeading.scrollIntoViewIfNeeded();

    const membantuBtn = page.getByRole('button', { name: 'Membantu', exact: true });
    await membantuBtn.waitFor({ state: 'visible', timeout: 15000 });
    await membantuBtn.click();

    const feedbackText = page.locator('textarea[placeholder="Catatan singkat opsional..."]');
    await feedbackText.waitFor({ state: 'visible', timeout: 15000 });
    await feedbackText.fill("E2E Playwright Smoke test feedback. Hope this works!");

    let feedbackRequestPayload = null;
    let feedbackResponseStatus = null;
    let feedbackResponseJson = null;

    page.on('request', req => {
      if (req.url().includes(`/api/reports/${reportId}/feedback`) && req.method() === 'POST') {
        try {
          feedbackRequestPayload = JSON.parse(req.postData() || '{}');
        } catch (e) {
          // ignore
        }
      }
    });

    page.on('response', async res => {
      if (res.url().includes(`/api/reports/${reportId}/feedback`) && res.request().method() === 'POST') {
        feedbackResponseStatus = res.status();
        try {
          feedbackResponseJson = await res.json();
        } catch (e) {
          // ignore
        }
      }
    });

    const submitFeedbackBtn = page.locator('button:has-text("Kirim feedback")');
    await submitFeedbackBtn.waitFor({ state: 'visible', timeout: 15000 });
    await submitFeedbackBtn.click();

    console.log("[7/8] checking feedback response");
    let feedbackFinished = false;
    const feedbackStart = Date.now();
    while (Date.now() - feedbackStart < 30000) {
      if (feedbackResponseStatus !== null) {
        feedbackFinished = true;
        break;
      }
      await page.waitForTimeout(200);
    }

    if (!feedbackFinished) {
      throw new Error("Feedback submission API timed out (30s).");
    }

    console.log(`- feedbackStatus: ${feedbackResponseStatus}`);
    if (feedbackRequestPayload) {
      console.log(`- requestIncludedGuestSession: ${!!feedbackRequestPayload.guest_session_id}`);
      console.log(`- requestIncludedAccessKey: ${!!(feedbackRequestPayload.report_access_key || feedbackRequestPayload.access_key)}`);
    }

    console.log(`- responsePayload: ${JSON.stringify(feedbackResponseJson)}`);

    const successToast = page.locator('text="Terima kasih, feedback tersimpan."');
    const toastVisible = await successToast.isVisible();
    console.log(`- uiShowsSuccessMessage: ${toastVisible}`);

    if (feedbackResponseStatus !== 200 || !feedbackResponseJson?.stored) {
      throw new Error(`Feedback submission failed with status ${feedbackResponseStatus}`);
    }

    console.log("[8/8] done");
  } finally {
    if (browser) {
      await browser.close();
      console.log("Browser closed successfully.");
    }
    clearTimeout(globalTimeout);
  }
}

runSmokeTest().catch(err => {
  console.error("SMOKE TEST FAILED:", err.message);
  process.exit(1);
});
