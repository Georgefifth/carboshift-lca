import { chromium } from 'playwright';
import { spawn } from 'child_process';

async function run() {
  console.log('Starting preview server...');
  const server = spawn('npx', ['vite', 'preview', '--port', '5199', '--strictPort'], { stdio: 'inherit' });

  // Give server 2 seconds to start
  await new Promise((r) => setTimeout(r, 2000));

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop 1440px Viewport
    console.log('Capturing Desktop 1440px...');
    const desktopPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });

    const consoleErrors = [];
    desktopPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await desktopPage.goto('http://localhost:5199', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(500);

    await desktopPage.screenshot({
      path: 'evidence/stage-2-build/frontend/desktop-1440px.png',
      fullPage: false,
    });

    // 2. Mobile 390px Viewport
    console.log('Capturing Mobile 390px...');
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    await mobilePage.goto('http://localhost:5199', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(500);

    await mobilePage.screenshot({
      path: 'evidence/stage-2-build/frontend/mobile-390px.png',
      fullPage: true,
    });

    // 3. Tab: Lifecycle Waterfall
    console.log('Capturing Tab 2: Lifecycle Waterfall...');
    await desktopPage.click('text=2. Lifecycle Waterfall');
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({
      path: 'evidence/stage-2-build/frontend/tab-waterfall.png',
      fullPage: false,
    });

    // 4. Tab: TCO Economics
    console.log('Capturing Tab 3: TCO Economics...');
    await desktopPage.click('text=3. TCO Economics');
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({
      path: 'evidence/stage-2-build/frontend/tab-economics.png',
      fullPage: false,
    });

    // 5. Scientific Audit Modal
    console.log('Capturing Scientific Audit Modal...');
    await desktopPage.click('text=Scientific Audit');
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({
      path: 'evidence/stage-2-build/frontend/modal-audit.png',
      fullPage: false,
    });

    console.log('All screenshots captured successfully!');
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors);
      process.exit(1);
    }
  } finally {
    await browser.close();
    server.kill();
  }
}

run().catch((err) => {
  console.error('Capture script error:', err);
  process.exit(1);
});
