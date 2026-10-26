// Renders scene.html frame-by-frame with headless Chromium.
//   node render.js            -> all 600 frames into build/frames/
//   node render.js 4.1,8.2    -> preview stills at those seconds into build/preview/
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FPS = 30, DUR = 20;

(async () => {
  const preview = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  const outDir = path.join(__dirname, 'build', preview ? 'preview' : 'frames');
  fs.mkdirSync(outDir, { recursive: true });
  const frames = preview ? preview.map(s => Math.round(s * FPS)) : [...Array(FPS * DUR).keys()];
  const workers = Math.min(Number(process.env.WORKERS || 4), frames.length);
  const lists = Array.from({ length: workers }, (_, w) => frames.filter((_, i) => i % workers === w));

  const browser = await chromium.launch();
  let done = 0;
  const t0 = Date.now();
  await Promise.all(lists.map(async list => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
    await page.goto('file://' + path.join(__dirname, 'scene.html'));
    const info = await page.evaluate(() => window.ready);
    if (done === 0) console.log('fonts', info);
    for (const f of list) {
      const b64 = await page.evaluate(t => {
        window.render(t);
        return window.canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
      }, f / FPS);
      fs.writeFileSync(path.join(outDir, String(f).padStart(4, '0') + '.jpg'), Buffer.from(b64, 'base64'));
      if (++done % 60 === 0) console.log(`${done}/${frames.length} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    await page.close();
  }));
  await browser.close();
  console.log(`done: ${done} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${outDir}`);
})();
