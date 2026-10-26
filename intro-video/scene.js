// DANNY name-reveal intro — 1080x1920, 20 s. Every frame is a pure function of t,
// so frames can be rendered in any order / in parallel. Timeline matches audio.py.

const W = 1080, H = 1920, CX = W / 2, CY = H / 2;
const LIME = '#C6FF00', WHITE = '#F4F4F0', BLACK = '#060606', RED = '#ff1f4b', CYAN = '#00e1ff';
const NAME = 'DANNY';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const tmp = mk(), tmpX = tmp.getContext('2d');
const layer = mk(), layerX = layer.getContext('2d');
const chR = mk(), chRX = chR.getContext('2d');
const chC = mk(), chCX = chC.getContext('2d');

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eOutExpo = x => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const eInExpo = x => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10));
const eOutCubic = x => 1 - Math.pow(1 - x, 3);
const eInOutCubic = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
const rnd = (seed, i) => hash(seed * 13.37 + i * 7.919);
function since(t, times) { // time since the latest event <= t
  let best = Infinity, idx = -1;
  times.forEach((e, i) => { if (e <= t && t - e < best) { best = t - e; idx = i; } });
  return [best, idx];
}

// ---------- timeline (mirrors audio.py) ----------
const BLIPS = [0.6, 1.4, 1.45, 2.2, 2.9, 3.3, 3.35, 3.4, 3.6, 3.62];
const LETTER_HITS = [4.0, 4.5, 5.0, 5.5, 6.0];
const ROLL = [];
for (let k = 0; k < 4; k++) ROLL.push(6.5 + k * 0.125);
for (let k = 0; k < 8; k++) ROLL.push(7.0 + k * 0.0625);
for (let k = 0; k < 8; k++) ROLL.push(7.5 + k * 0.03125);
const KICKS = [], CLAPS = [];
for (let b = 0; b < 4; b++) {
  [0, 0.75, 1.5].forEach(o => KICKS.push(8 + b * 2 + o));
  CLAPS.push(8 + b * 2 + 1);
}
const MEL_STEPS = [0, 3, 6, 8, 10, 12, 14, 16, 19, 22, 24, 26, 28, 30];
const COWBELLS = [];
for (let rep = 0; rep < 2; rep++) MEL_STEPS.forEach(s => COWBELLS.push(12 + rep * 4 + s * 0.125));
const STUTTER = [];
{
  let p = 16;
  [[4, 0.25], [4, 0.125], [6, 0.0625]].forEach(([n, ln]) => { for (let i = 0; i < n; i++) { STUTTER.push(p); p += ln; } });
}
const STUTTER_END = 17.875;
const FINAL_BLIPS = [19.2, 19.25, 19.3, 19.33, 19.4];

// ---------- text ----------
let CAP = 0.73; // Anton cap-height / font-size, measured after load
let HERO = 400; // font size that fits NAME to the hero width

function textC(c, str, x, y, size, o = {}) {
  c.font = `${size}px ${o.family || 'Anton'}`;
  c.letterSpacing = (o.ls || 0) + 'px';
  c.textAlign = o.align || 'center';
  c.textBaseline = 'alphabetic';
  const m = c.measureText(str);
  const yy = y + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  const xx = x + (o.align === 'left' ? 0 : (o.ls || 0) / 2);
  if (o.outline) {
    c.lineWidth = o.lw || 6; c.lineJoin = 'miter'; c.strokeStyle = o.color; c.strokeText(str, xx, yy);
  } else {
    c.fillStyle = o.color; c.fillText(str, xx, yy);
  }
  return m;
}

// red/cyan split behind the main glyphs (dark backgrounds only)
function textRGB(c, str, x, y, size, split, o) {
  if (split > 0.5) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    textC(c, str, x - split, y, size, { ...o, color: RED });
    textC(c, str, x + split, y + split * 0.25, size, { ...o, color: CYAN });
    c.restore();
  }
  textC(c, str, x, y, size, o);
}

// ---------- post fx ----------
function chroma(px) {
  if (px < 0.5) return;
  chRX.globalCompositeOperation = 'copy'; chRX.drawImage(canvas, 0, 0);
  chRX.globalCompositeOperation = 'multiply'; chRX.fillStyle = '#ff0000'; chRX.fillRect(0, 0, W, H);
  chCX.globalCompositeOperation = 'copy'; chCX.drawImage(canvas, 0, 0);
  chCX.globalCompositeOperation = 'multiply'; chCX.fillStyle = '#00ffff'; chCX.fillRect(0, 0, W, H);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(chR, -px, 0);
  ctx.drawImage(chC, px, px * 0.3);
  ctx.restore();
}

function glitch(amount, seed) {
  if (amount <= 0.01) return;
  tmpX.globalCompositeOperation = 'copy'; tmpX.drawImage(canvas, 0, 0);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const n = Math.floor(5 + amount * 16);
  for (let i = 0; i < n; i++) {
    const y = Math.floor(rnd(seed, i) * H);
    const h = Math.floor(6 + rnd(seed, i + 50) * 160 * amount);
    const dx = (rnd(seed, i + 100) - 0.5) * 320 * amount;
    ctx.drawImage(tmp, 0, y, W, h, dx, y, W, h);
    if (rnd(seed, i + 150) < 0.3 * amount) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = rnd(seed, i + 200) < 0.6 ? LIME : WHITE;
      ctx.fillRect(rnd(seed, i + 250) * W, y, 30 + rnd(seed, i + 300) * 320, Math.max(3, h * 0.3));
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
}

let GRAINS = [], VIGNETTE = null, SCAN = null;
function buildTextures() {
  GRAINS = [0, 1, 2, 3].map(k => {
    const c = mk(), x = c.getContext('2d');
    const id = x.createImageData(W, H), d = id.data;
    let s = k * 7919 + 17;
    for (let i = 0; i < d.length; i += 4) {
      s = (s * 16807) % 2147483647;
      const v = s & 255;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    x.putImageData(id, 0, 0);
    return c;
  });
  VIGNETTE = mk();
  const vx = VIGNETTE.getContext('2d');
  const g = vx.createRadialGradient(CX, CY, 300, CX, CY, 1150);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.75)');
  vx.fillStyle = g; vx.fillRect(0, 0, W, H);
  SCAN = mk();
  const sx = SCAN.getContext('2d');
  sx.fillStyle = 'rgba(0,0,0,0.22)';
  for (let y = 0; y < H; y += 4) sx.fillRect(0, y, W, 1);
}

// ---------- shared elements ----------
function shakeAt(t) {
  let s = 0;
  for (const h of LETTER_HITS) { const lt = t - h; if (lt >= 0 && lt < 0.5) s = Math.max(s, 30 * Math.exp(-lt * 10)); }
  if (t > 6.5 && t < 7.75) s = Math.max(s, 3 + 22 * Math.pow(prog(t, 6.5, 7.75), 2));
  if (t >= 8) s = Math.max(s, 60 * Math.exp(-(t - 8) * 6));
  if (t >= 8 && t < 16) { const [k] = since(t, KICKS); s = Math.max(s, 12 * Math.exp(-k * 18)); }
  if (t >= 16 && t < STUTTER_END) { const [k] = since(t, STUTTER); s = Math.max(s, 14 * Math.exp(-k * 25)); }
  if (t >= 18) s = Math.max(s, 50 * Math.exp(-(t - 18) * 6));
  const f = Math.floor(t * 60);
  return [(hash(f) - 0.5) * 2 * s, (hash(f + 0.5) - 0.5) * 2 * s];
}

function shockwave(t, t0, color = LIME, maxR = 1500) {
  const p = prog(t, t0, t0 + 0.9);
  if (p <= 0 || p >= 1) return;
  ctx.save();
  ctx.strokeStyle = color; ctx.globalAlpha = 1 - p;
  ctx.lineWidth = 70 * (1 - p) + 2;
  ctx.beginPath(); ctx.arc(CX, CY, eOutExpo(p) * maxR, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 3; ctx.globalAlpha = (1 - p) * 0.6;
  ctx.beginPath(); ctx.arc(CX, CY, eOutExpo(prog(t, t0 + 0.06, t0 + 1.1)) * maxR * 0.75, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function burst(t, t0, seed, count = 140) {
  const lt = t - t0;
  if (lt < 0 || lt > 2.2) return;
  ctx.save();
  for (let i = 0; i < count; i++) {
    const life = 0.7 + rnd(seed, i) * 1.4;
    if (lt > life) continue;
    const ang = rnd(seed, i + 1000) * Math.PI * 2;
    const spd = 500 + rnd(seed, i + 2000) * 2600;
    const k = 3.2;
    const d = spd * (1 - Math.exp(-k * lt)) / k;
    const x = CX + Math.cos(ang) * d, y = CY + Math.sin(ang) * d * 1.15;
    const a = 1 - lt / life;
    ctx.globalAlpha = a;
    ctx.fillStyle = ctx.strokeStyle = rnd(seed, i + 3000) < 0.55 ? LIME : WHITE;
    if (rnd(seed, i + 4000) < 0.5) {
      const len = 10 + spd * 0.04 * Math.exp(-k * lt);
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(ang) * len, y - Math.sin(ang) * len); ctx.stroke();
    } else {
      const s = 4 + rnd(seed, i + 5000) * 12;
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
  }
  ctx.restore();
}

function dust(t, alpha) {
  ctx.save();
  ctx.fillStyle = WHITE;
  for (let i = 0; i < 70; i++) {
    const sp = 30 + rnd(9, i) * 90;
    const x = rnd(3, i) * W + Math.sin(t * 0.8 + i) * 12;
    const y = ((rnd(5, i) * H - t * sp) % H + H) % H;
    ctx.globalAlpha = alpha * (0.15 + rnd(7, i) * 0.45);
    const s = 1.5 + rnd(11, i) * 3.5;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

function ring(t, r, alpha, rot) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(CX, CY); ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = LIME; ctx.lineWidth = 3;
  ctx.setLineDash([26, 18]);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2, l = i % 15 === 0 ? 34 : 12;
    ctx.lineWidth = i % 15 === 0 ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (r + 22), Math.sin(a) * (r + 22));
    ctx.lineTo(Math.cos(a) * (r + 22 + l), Math.sin(a) * (r + 22 + l));
    ctx.stroke();
  }
  ctx.restore();
}

function marquee(t, alpha, startY, rows, rowGap, size, speed) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${size}px Anton`; ctx.letterSpacing = '6px';
  const unit = NAME + '   ';
  const uw = ctx.measureText(unit).width;
  for (let r = 0; r < rows; r++) {
    const dir = r % 2 ? 1 : -1;
    const off = ((dir * t * speed * (1 + r * 0.07)) % uw + uw) % uw;
    const y = startY + r * rowGap;
    for (let x = -uw + off; x < W + uw; x += uw) {
      textC(ctx, unit, x, y, size, { align: 'left', ls: 6, outline: true, lw: 2, color: '#3a3a3a' });
    }
  }
  ctx.restore();
}

function hud(t, label, bright) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'difference';
  const col = '#ffffff';
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3;
  const m = 64, top = 150, bot = H - 210, L = 56;
  [[m, top, 1, 1], [W - m, top, -1, 1], [m, bot, 1, -1], [W - m, bot, -1, -1]].forEach(([x, y, sx, sy]) => {
    ctx.beginPath(); ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); ctx.stroke();
  });
  ctx.globalAlpha = 0.85;
  const ss = String(Math.floor(t)).padStart(2, '0'), ff = String(Math.floor((t % 1) * 30)).padStart(2, '0');
  textC(ctx, 'DANNY.SYS', m + 18, top + 40, 30, { family: 'SpaceG', align: 'left', ls: 4, color: col });
  textC(ctx, `00:00:${ss}:${ff}`, W - m - 250, top + 40, 30, { family: 'SpaceG', align: 'left', ls: 3, color: col });
  textC(ctx, label, m + 18, bot - 40, 30, { family: 'SpaceG', align: 'left', ls: 4, color: col });
  if (Math.floor(t * 2) % 2 === 0) { ctx.beginPath(); ctx.arc(W - m - 150, bot - 41, 9, 0, Math.PI * 2); ctx.fill(); }
  textC(ctx, 'REC', W - m - 128, bot - 40, 30, { family: 'SpaceG', align: 'left', ls: 4, color: col });
  ctx.restore();
}

// ---------- scenes ----------
const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@$0123456789';

function intro(t, P) {
  // drifting grid
  ctx.save();
  ctx.strokeStyle = 'rgba(198,255,0,0.07)'; ctx.lineWidth = 1;
  const off = (t * 30) % 120;
  for (let x = -120 + off; x < W + 120; x += 120) { ctx.beginPath(); ctx.moveTo(x, -100); ctx.lineTo(x, H + 100); ctx.stroke(); }
  for (let y = -120 + off; y < H + 120; y += 120) { ctx.beginPath(); ctx.moveTo(-100, y); ctx.lineTo(W + 100, y); ctx.stroke(); }
  ctx.restore();

  // central glow rising toward the first hit
  const g = prog(t, 0, 4);
  const rg = ctx.createRadialGradient(CX, CY, 0, CX, CY, 900);
  rg.addColorStop(0, `rgba(198,255,0,${0.22 * g * g})`); rg.addColorStop(1, 'rgba(198,255,0,0)');
  ctx.fillStyle = rg; ctx.fillRect(-100, -100, W + 200, H + 200);

  // scan line that thickens into a bar
  const [sb] = since(t, BLIPS);
  const flick = sb < 0.06 ? 0.3 + hash(Math.floor(t * 60)) * 0.7 : 1;
  const lw = eOutExpo(prog(t, 0.3, 1.5)) * 840;
  const th = 4 + eInExpo(prog(t, 3.0, 4.0)) * 120;
  ctx.save();
  ctx.globalAlpha = flick;
  ctx.fillStyle = LIME; ctx.shadowColor = LIME; ctx.shadowBlur = 40;
  ctx.fillRect(CX - lw / 2, CY - th / 2, lw, th);
  ctx.shadowBlur = 0;
  if (lw > 20) { ctx.fillRect(CX - lw / 2 - 4, CY - 22, 4, 44); ctx.fillRect(CX + lw / 2, CY - 22, 4, 44); }
  ctx.restore();

  // typed question, then a scramble of unknown letters
  if (t > 1.6 && t < 2.85) {
    const msg = 'WHO IS IT?';
    const n = Math.floor(prog(t, 1.6, 2.3) * msg.length + 0.001);
    const cur = Math.floor(t * 4) % 2 ? '_' : ' ';
    textC(ctx, msg.slice(0, n) + (n < msg.length ? cur : ''), CX, CY + 110, 60, { family: 'SpaceG', ls: 16, color: WHITE });
  }
  if (t >= 2.85) {
    const f = Math.floor(t * 15);
    let s = '';
    for (let i = 0; i < 5; i++) s += SCRAMBLE[Math.floor(hash(f * 5 + i) * SCRAMBLE.length)];
    const a = prog(t, 2.85, 3.0);
    ctx.globalAlpha = a;
    textC(ctx, s, CX, CY - 260, 210, { ls: 20, outline: true, lw: 3, color: WHITE });
    ctx.globalAlpha = 1;
  }

  // percentage loader
  const pct = Math.floor(eInOutCubic(prog(t, 0.5, 3.85)) * 100);
  textC(ctx, `${String(pct).padStart(3, '0')}%`, CX, CY + 230, 44, { family: 'SpaceG', ls: 10, color: LIME });
  ctx.fillStyle = 'rgba(244,244,240,0.18)'; ctx.fillRect(CX - 220, CY + 290, 440, 6);
  ctx.fillStyle = LIME; ctx.fillRect(CX - 220, CY + 290, 440 * pct / 100, 6);

  if (sb < 0.067) { P.glitch = 0.55; P.chroma = 14; }
  P.flash = eInExpo(prog(t, 3.55, 4.0)) * 0.6;
  P.label = 'IDENTITY_SCAN';
}

const LETTER_STYLE = [
  { bg: BLACK, color: WHITE },
  { bg: LIME, color: BLACK, rot: true },
  { bg: BLACK, color: LIME, outline: true },
  { bg: WHITE, color: BLACK, slices: true },
  { bg: BLACK, color: WHITE, glow: true },
];

function letters(t, P) {
  const [lt, i] = since(t, LETTER_HITS);
  const st = LETTER_STYLE[i];
  const ch = NAME[i];
  ctx.fillStyle = st.bg; ctx.fillRect(-200, -200, W + 400, H + 400);
  const dark = st.bg === BLACK;

  const size = 1150 / CAP;
  let sc = lerp(1.4, 1.0, eOutExpo(prog(lt, 0, 0.35))) * (1 + lt * 0.08);
  if (i === 4) sc *= 1 + eInExpo(prog(t, 6.2, 6.5)) * 7; // dive into the Y
  const split = dark ? lerp(55, 3, eOutExpo(prog(lt, 0, 0.3))) : 0;

  ctx.save();
  ctx.translate(CX, CY);
  if (st.rot) ctx.rotate(lerp(-0.14, 0, eOutExpo(prog(lt, 0, 0.4))));
  ctx.scale(sc, sc);
  if (st.outline) {
    for (let k = 3; k >= 1; k--) {
      ctx.save(); ctx.globalAlpha = 0.5 / k; const s = 1 + k * 0.1 * eOutCubic(prog(lt, 0, 0.4));
      ctx.scale(s, s); textC(ctx, ch, 0, 0, size, { outline: true, lw: 5 / s, color: LIME }); ctx.restore();
    }
    textRGB(ctx, ch, 0, 0, size, split, { outline: true, lw: 10, color: LIME });
  } else {
    if (st.glow) { ctx.shadowColor = LIME; ctx.shadowBlur = 90; }
    if (dark) textRGB(ctx, ch, 0, 0, size, split, { color: st.color });
    else textC(ctx, ch, 0, 0, size, { color: st.color });
  }
  ctx.restore();

  if (i === 4) { shockwave(t, 6.0); burst(t, 6.0, 31, 90); }

  // progress word + index
  if (sc < 3) {
    const word = NAME.slice(0, i + 1) + (Math.floor(t * 6) % 2 ? '_' : '');
    const c = st.bg === BLACK ? LIME : BLACK;
    textC(ctx, word, CX, CY + 780, 56, { family: 'SpaceG', ls: 30, color: c });
    textC(ctx, `0${i + 1} / 05`, CX, CY - 780, 34, { family: 'SpaceG', ls: 10, color: c });
  }

  if (lt < 0.034) P.invert = true;
  if (st.slices) P.glitch = 0.7 * (1 - prog(lt, 0, 0.22));
  else if (lt < 0.1) P.glitch = 0.35;
  P.chroma = dark ? 10 * (1 - prog(lt, 0, 0.2)) : 0;
  if (i === 4 && t > 6.2) P.flash = eInExpo(prog(t, 6.3, 6.5)) * 0.8;
  P.label = 'DECODING ' + (i + 1) + '/5';
}

function tunnelPhase(t) { const x = t - 6.5; return 0.9 * x + 0.9 * x * x * x; }

function build(t, P) {
  if (t >= 7.75) { // pre-drop silence
    const p = prog(t, 7.75, 8.0);
    ctx.fillStyle = LIME;
    ctx.beginPath(); ctx.arc(CX, CY, lerp(14, 3, p), 0, Math.PI * 2); ctx.fill();
    P.label = 'STANDBY';
    return;
  }
  const p = prog(t, 6.5, 7.75);
  const phase = tunnelPhase(t);

  // radial speed lines
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 90; i++) {
    const ang = rnd(41, i) * Math.PI * 2;
    const base = ((rnd(43, i) + phase * (0.6 + rnd(47, i))) % 1);
    const r0 = 120 + base * 1300;
    const len = 40 + p * 360 * base;
    ctx.globalAlpha = (0.15 + 0.6 * p) * base;
    ctx.strokeStyle = i % 3 ? WHITE : LIME; ctx.lineWidth = 2 + base * 3;
    ctx.beginPath();
    ctx.moveTo(CX + Math.cos(ang) * r0, CY + Math.sin(ang) * r0);
    ctx.lineTo(CX + Math.cos(ang) * (r0 + len), CY + Math.sin(ang) * (r0 + len));
    ctx.stroke();
  }
  ctx.restore();

  // tunnel of outlined names flying at the camera
  const L = 12;
  const layers = [];
  for (let k = 0; k < L; k++) layers.push([k, ((k / L + phase) % 1 + 1) % 1]);
  layers.sort((a, b) => a[1] - b[1]);
  for (const [k, d] of layers) {
    const s = 0.05 * Math.pow(45, d);
    const a = clamp(d * 6) * (1 - clamp((d - 0.85) / 0.15));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(CX, CY); ctx.scale(s, s);
    textC(ctx, NAME, 0, 0, HERO, { ls: 8, outline: true, lw: 3 / s, color: k % 2 ? LIME : WHITE });
    ctx.restore();
  }

  // subliminal solid frames on some roll hits
  const [rl, ri] = since(t, ROLL);
  if (rl < 0.034) {
    P.flash = 0.15 + 0.35 * p;
    if (ri % 4 === 3) textRGB(ctx, NAME, CX, CY, HERO * 0.9, 20, { ls: 8, color: WHITE });
  }
  P.chroma = 3 + p * 18;
  P.label = 'LOCKING_TARGET';
}

function heroText(t, sc, ls, split, color, sweep) {
  layerX.setTransform(1, 0, 0, 1, 0, 0);
  layerX.globalCompositeOperation = 'source-over';
  layerX.clearRect(0, 0, W, H);
  layerX.save();
  layerX.translate(CX, CY); layerX.scale(sc, sc);
  textRGB(layerX, NAME, 0, 0, HERO, split, { ls, color });
  layerX.restore();
  if (sweep > 0 && sweep < 1) {
    const x = lerp(-500, W + 500, eInOutCubic(sweep));
    const g = layerX.createLinearGradient(x - 220, 0, x + 220, 0);
    g.addColorStop(0, 'rgba(198,255,0,0)'); g.addColorStop(0.5, 'rgba(198,255,0,1)'); g.addColorStop(1, 'rgba(198,255,0,0)');
    layerX.globalCompositeOperation = 'source-atop';
    layerX.setTransform(1, 0, -0.35, 1, 0, 0);
    layerX.fillStyle = g; layerX.fillRect(-1000, 0, W + 2000, H);
    layerX.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.drawImage(layer, 0, 0);
}

function sweepAt(t, windows) {
  for (const [a, b] of windows) if (t >= a && t <= b) return prog(t, a, b);
  return 0;
}

function hero(t, P, variant) {
  const t0 = variant === 1 ? 8 : 14;
  const ent = eOutExpo(prog(t, t0, t0 + (variant === 1 ? 0.6 : 0.3)));
  const [kk] = since(t, KICKS);
  const [cc] = since(t, CLAPS);
  const pulse = Math.exp(-kk * 16);
  const clapHit = cc < 0.12 ? 1 - cc / 0.12 : 0;

  if (variant === 1) {
    marquee(t, 0.9 * prog(t, 8.2, 8.8), 140, 10, 182, 150, 90);
  } else {
    // perspective floor grid
    ctx.save();
    ctx.strokeStyle = 'rgba(198,255,0,0.22)'; ctx.lineWidth = 2;
    const hz = CY + 380;
    for (let i = -14; i <= 14; i++) {
      ctx.beginPath(); ctx.moveTo(CX + i * 18, hz); ctx.lineTo(CX + i * 260, H + 100); ctx.stroke();
    }
    const scroll = (t * 0.9) % 1;
    for (let j = 0; j < 12; j++) {
      const z = (j + scroll) / 12;
      const y = hz + Math.pow(z, 2.4) * (H - hz + 100);
      ctx.globalAlpha = z;
      ctx.beginPath(); ctx.moveTo(-100, y); ctx.lineTo(W + 100, y); ctx.stroke();
    }
    ctx.restore();
    // mirrored ceiling, faint
    ctx.save(); ctx.globalAlpha = 0.5; ctx.translate(0, H); ctx.scale(1, -1);
    ctx.strokeStyle = 'rgba(198,255,0,0.12)'; ctx.lineWidth = 2;
    for (let i = -14; i <= 14; i++) { ctx.beginPath(); ctx.moveTo(CX + i * 18, CY + 380); ctx.lineTo(CX + i * 260, H + 100); ctx.stroke(); }
    ctx.restore();
  }

  dust(t, prog(t, t0 + 0.3, t0 + 1));
  ring(t, 470 + pulse * 12, 0.55 * ent, t * 0.35 * (variant === 1 ? 1 : -1));

  if (variant === 1) { shockwave(t, 8.0); burst(t, 8.0, 17, 160); }
  else { shockwave(t, 14.0, WHITE, 1200); }

  const sc = lerp(variant === 1 ? 1.8 : 1.25, 1, ent) * (1 + 0.045 * pulse);
  const ls = lerp(variant === 1 ? 110 : 40, 8, ent);
  const split = lerp(70, 5, ent) + clapHit * 26;
  const sweep = sweepAt(t, [[9.9, 10.6], [11.4, 12.0], [14.6, 15.2]]);
  if (variant === 2) { ctx.save(); ctx.shadowColor = LIME; ctx.shadowBlur = 50 + pulse * 40; }
  heroText(t, sc, ls, split, WHITE, sweep);
  if (variant === 2) ctx.restore();

  // supers
  const capH = HERO * CAP * sc;
  if (variant === 1) {
    const intro = 'INTRODUCING';
    const n = Math.floor(prog(t, 8.5, 9.0) * intro.length + 0.001);
    textC(ctx, intro.slice(0, n), CX, CY - capH / 2 - 80, 40, { family: 'SpaceG', ls: 22, color: LIME });
  }
  const bw = eOutExpo(prog(t, t0 + 0.6, t0 + 1.1)) * 300;
  ctx.fillStyle = LIME; ctx.fillRect(CX - bw / 2, CY + capH / 2 + 60, bw, 10);
  if (bw > 290) textC(ctx, '// 2026', CX, CY + capH / 2 + 125, 34, { family: 'SpaceG', ls: 14, color: WHITE });

  if (variant === 1 && t < 8.5) P.flash = 1 - eOutCubic(prog(t, 8.0, 8.45));
  if (variant === 2 && t < 14.1) P.flash = 0.6 * (1 - prog(t, 14.0, 14.1));
  if (clapHit > 0) { P.glitch = 0.75 * clapHit; P.chroma = 18 * clapHit; }
  if (cc < 0.034 && variant === 2) P.invert = true;
  P.label = variant === 1 ? 'NAME_REVEAL' : 'NAME_CONFIRMED';
}

function rows(t, P) {
  const N = 9, rowH = H / N;
  const size = (rowH * 0.86) / CAP;
  const inv = t >= 13.0 && t < 13.5;
  ctx.fillStyle = inv ? LIME : BLACK; ctx.fillRect(-200, -200, W + 400, H + 400);
  const [cb, ci] = since(t, COWBELLS);
  const hotRow = cb < 0.12 ? Math.floor(rnd(77, ci) * N) : -1;
  const [kk] = since(t, KICKS);
  const squash = 1 - 0.06 * Math.exp(-kk * 16);
  const speedUp = 1 + eInExpo(prog(t, 13.5, 14.0)) * 5;

  ctx.font = `${size}px Anton`; ctx.letterSpacing = '10px';
  const unit = NAME + ' ';
  const uw = ctx.measureText(unit).width;
  for (let r = 0; r < N; r++) {
    const dir = r % 2 ? 1 : -1;
    const enter = (1 - eOutExpo(prog(t, 12.0 + r * 0.02, 12.35 + r * 0.02))) * W * 1.2 * dir;
    const travel = (t - 12) * (160 + Math.abs(r - 4) * 70) * speedUp * dir;
    const off = ((enter + travel) % uw + uw) % uw;
    const y = rowH * (r + 0.5);
    const mid = r === 4, hot = r === hotRow;
    for (let x = -uw + off; x < W + uw; x += uw) {
      ctx.save();
      ctx.translate(0, y); ctx.scale(1, squash);
      if (mid || hot) {
        const col = inv ? BLACK : (mid ? LIME : WHITE);
        textC(ctx, unit, x, 0, size, { align: 'left', ls: 10, color: col });
      } else {
        textC(ctx, unit, x, 0, size, { align: 'left', ls: 10, outline: true, lw: 3, color: inv ? BLACK : 'rgba(244,244,240,0.75)' });
      }
      ctx.restore();
    }
  }
  if (t < 12.05) P.flash = 0.7 * (1 - prog(t, 12.0, 12.05));
  const [cc] = since(t, CLAPS);
  if (cc < 0.1) { P.glitch = 0.6 * (1 - cc / 0.1); P.chroma = 14; }
  P.label = 'NAME_LOOP';
}

function breakdown(t, P) {
  if (t >= STUTTER_END) { P.label = '...'; return; }
  const [lt, k] = since(t, STUTTER);
  const inv = k % 2 === 1;
  ctx.fillStyle = inv ? LIME : BLACK; ctx.fillRect(-200, -200, W + 400, H + 400);
  if (k >= 8) { // fastest chops: spell the name letter by letter
    const ch = NAME[(k - 8) % 5];
    const size = 1100 / CAP;
    textC(ctx, ch, CX, CY, size, { color: inv ? BLACK : WHITE });
  } else {
    marquee(t, inv ? 0 : 0.6, 140, 10, 182, 150, 90);
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate((rnd(91, k) - 0.5) * 0.12);
    ctx.scale(1 + k * 0.07, 1 + k * 0.07);
    ctx.translate(-CX, -CY);
    if (inv) {
      ctx.save(); ctx.translate(CX, CY); textC(ctx, NAME, 0, 0, HERO, { ls: 8, color: BLACK }); ctx.restore();
    } else {
      heroText(t, 1, 8, 6 + k * 3, WHITE, 0);
    }
    ctx.restore();
  }
  if (lt < 0.07) P.glitch = 0.35 + k * 0.04;
  P.chroma = inv ? 0 : 8 + k * 2;
  P.dim = prog(t, 16, STUTTER_END) * 0.35;
  P.label = 'SIGNAL_' + String(k + 1).padStart(2, '0');
}

function finale(t, P) {
  const ent = eOutExpo(prog(t, 18, 18.5));
  shockwave(t, 18.0);
  burst(t, 18.0, 59, 170);
  dust(t, ent);
  ring(t, 470, 0.5 * ent * (1 - prog(t, 19.2, 19.4)), -t * 0.3);

  let sy = 1;
  if (t > 19.45) sy = lerp(1, 0.015, eInExpo(prog(t, 19.45, 19.62)));
  const sc = lerp(0.55, 1, ent) * (1 + 0.05 * prog(t, 18.4, 19.4));
  const lineW = t > 19.62 ? 1 - eOutCubic(prog(t, 19.62, 19.8)) : 1;
  if (t < 19.8) {
    ctx.save();
    ctx.translate(CX, CY); ctx.scale(lineW, sy); ctx.translate(-CX, -CY);
    ctx.save(); ctx.shadowColor = LIME; ctx.shadowBlur = 40;
    heroText(t, sc, 8, lerp(40, 4, ent), WHITE, sweepAt(t, [[18.5, 19.1]]));
    ctx.restore();
    const capH = HERO * CAP * sc;
    const bw = eOutExpo(prog(t, 18.25, 18.7)) * 520;
    ctx.fillStyle = LIME; ctx.fillRect(CX - bw / 2, CY + capH / 2 + 60, bw, 12);
    const sub = 'NAME REVEALED';
    const n = Math.floor(prog(t, 18.45, 18.85) * sub.length + 0.001);
    textC(ctx, sub.slice(0, n), CX, CY + capH / 2 + 130, 36, { family: 'SpaceG', ls: 20, color: WHITE });
    ctx.restore();
  }
  if (t < 18.4) P.flash = 1 - eOutCubic(prog(t, 18.0, 18.4));
  const [fb] = since(t, FINAL_BLIPS);
  if (fb < 0.05) { P.glitch = 0.8; P.chroma = 24; }
  P.hudAlpha = 1 - prog(t, 19.4, 19.7);
  P.label = 'END_OF_LINE';
}

// ---------- frame ----------
function render(t) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = BLACK; ctx.fillRect(0, 0, W, H);

  const P = { glitch: 0, chroma: 0, flash: 0, invert: false, dim: 0, label: '', hudAlpha: 1 };
  const [dx, dy] = shakeAt(t);
  ctx.translate(dx, dy);
  if (t < 4) intro(t, P);
  else if (t < 6.5) letters(t, P);
  else if (t < 8) build(t, P);
  else if (t < 12) hero(t, P, 1);
  else if (t < 14) rows(t, P);
  else if (t < 16) hero(t, P, 2);
  else if (t < 18) breakdown(t, P);
  else finale(t, P);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.shadowBlur = 0;

  if (P.hudAlpha > 0 && !(t >= 7.75 && t < 8) && !(t >= STUTTER_END && t < 18)) {
    ctx.globalAlpha = P.hudAlpha; hud(t, P.label); ctx.globalAlpha = 1;
  }

  chroma(P.chroma);
  glitch(P.glitch, Math.floor(t * 30) + 1);
  if (P.invert) {
    ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (P.flash > 0) { ctx.globalAlpha = clamp(P.flash); ctx.fillStyle = WHITE; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (P.dim > 0) { ctx.globalAlpha = P.dim; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }

  // film finish: grain, scanlines, vignette
  const gr = GRAINS[Math.floor(t * 30) % GRAINS.length];
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.16; ctx.drawImage(gr, 0, 0);
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.04; ctx.drawImage(gr, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.drawImage(SCAN, 0, 0);
  ctx.drawImage(VIGNETTE, 0, 0);
  // fade to black at the very end
  if (t > 19.8) { ctx.fillStyle = '#000'; ctx.globalAlpha = 1; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}

window.render = render;
window.canvas = canvas;
window.ready = (async () => {
  await document.fonts.load('100px Anton');
  await document.fonts.load('40px SpaceG');
  ctx.font = '1000px Anton';
  ctx.letterSpacing = '0px';
  CAP = ctx.measureText('D').actualBoundingBoxAscent / 1000;
  ctx.letterSpacing = '8px';
  const w = ctx.measureText(NAME).width;
  HERO = Math.floor(1000 * 900 / w);
  buildTextures();
  return { CAP, HERO };
})();
