import puppeteer from "puppeteer";

const OUT = process.env.OUT_DIR;
const url = process.env.SHOT_URL || "http://localhost:3000/";
const scrollTo = Number(process.env.SHOT_SCROLL || 0);
const name = process.env.SHOT_NAME || "shot";
const skipIntro = process.env.SHOT_INTRO !== "1";

const vw = Number(process.env.SHOT_W || 390);
const extraWait = Number(process.env.SHOT_WAIT || 1800);

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: vw, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

if (skipIntro) {
  await page.evaluateOnNewDocument(() => {
    window.sessionStorage.setItem("victor-initial-loader-seen-v1", "1");
  });
}

await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
await new Promise((r) => setTimeout(r, 2500));

if (scrollTo > 0) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollTo);
  await new Promise((r) => setTimeout(r, extraWait));
}

await page.screenshot({ path: `${OUT}/${name}.png` });
await browser.close();
console.log(`saved ${name}.png`);
