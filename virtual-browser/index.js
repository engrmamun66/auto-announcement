const { chromium } = require('playwright');

const URL = process.argv[2] || process.env.VB_URL || 'https://cb2.softproit.cloud';
const HEADLESS = process.env.VB_HEADLESS === 'true';
const RELOAD_ON_CRASH_DELAY_MS = 3000;

async function run() {
  const browser = await chromium.launch({
    headless: HEADLESS,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      ...(HEADLESS ? [] : ['--kiosk', '--start-fullscreen', '--noerrdialogs', '--disable-infobars']),
    ],
  });

  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  page.on('crash', () => restart());
  page.on('close', () => restart());
  context.on('close', () => {});
  browser.on('disconnected', () => restart());

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  console.log(`virtual-browser: loaded ${URL}`);
}

let restarting = false;
function restart() {
  if (restarting) return;
  restarting = true;
  console.log(`virtual-browser: browser closed/crashed, restarting in ${RELOAD_ON_CRASH_DELAY_MS}ms`);
  setTimeout(() => {
    restarting = false;
    run().catch((err) => {
      console.error('virtual-browser: failed to restart', err);
      restart();
    });
  }, RELOAD_ON_CRASH_DELAY_MS);
}

run().catch((err) => {
  console.error('virtual-browser: failed to start', err);
  restart();
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
