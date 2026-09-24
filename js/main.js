/* Runs immediately (the script tag goes in <head>) so there's no flash of the wrong theme. */
const root = document.documentElement;
root.classList.add('js');

const THEMES = ['teal', 'matrix', 'amber', 'red'];

/* ---------- Theme switcher ---------- */
function applyTheme(name) {
  if (!THEMES.includes(name)) return;
  root.setAttribute('data-theme', name);
  document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.dataset.setTheme === name));
  });
}

// Restore the saved theme right away
try {
  const saved = localStorage.getItem('theme');
  if (THEMES.includes(saved)) root.setAttribute('data-theme', saved);
} catch (e) {}

// One click listener for the whole page, so it works no matter when the buttons load
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-set-theme]');
  if (!btn) return;
  const name = btn.dataset.setTheme;
  applyTheme(name);
  try { localStorage.setItem('theme', name); } catch (err) {}
});

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => reduce ? Promise.resolve() : new Promise(r => setTimeout(r, ms));

/* ---------- Text scramble ("decrypt") effect ---------- */
const GLYPHS = '!<>-_\\/[]{}=+*^?#%&$0123456789';
const randGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

function setupScramble(el) {
  const text = el.textContent.trim();
  el.textContent = '';

  // The real text keeps the layout (and stays readable for screen readers)
  const real = document.createElement('span');
  real.className = 'scramble-real';
  real.textContent = text;

  // The overlay shows the shuffling characters
  const fx = document.createElement('span');
  fx.className = 'scramble-fx';
  fx.setAttribute('aria-hidden', 'true');

  el.classList.add('scramble');
  el.append(real, fx);
  return { el, text, fx, busy: false };
}

function runScramble(part, delay = 0, duration = 900) {
  if (part.busy) return;
  part.busy = true;

  const { el, text, fx } = part;
  el.classList.remove('done');

  const chars = [...text];
  // Each character locks in at its own time, roughly left to right
  const resolveAt = chars.map((_, i) =>
    (i / chars.length) * duration * 0.75 + Math.random() * duration * 0.25
  );
  let glyphs = chars.map(randGlyph);
  let lastSwap = 0;
  const start = performance.now() + delay;

  function frame(now) {
    const t = now - start;

    // Change the random symbols about 20 times a second
    if (now - lastSwap > 50) {
      glyphs = chars.map(randGlyph);
      lastSwap = now;
    }

    let out = '';
    let done = true;
    chars.forEach((ch, i) => {
      if (ch === ' ') out += ' ';
      else if (t >= resolveAt[i]) out += ch;
      else { out += glyphs[i]; done = false; }
    });
    fx.textContent = out;

    if (done) {
      el.classList.add('done');
      part.busy = false;
    } else {
      requestAnimationFrame(frame);
    }
  }
  requestAnimationFrame(frame);
}

/* ---------- Typing animation ---------- */
async function load() {
  const photo = document.getElementById('photo');
  const paras = [...document.querySelectorAll('[data-type]')];
  if (!photo && !paras.length) return;

  // Hide every paragraph until it's its turn, so there are no empty gaps
  const texts = paras.map(p => {
    const t = p.textContent.trim();
    p.textContent = '';
    p.hidden = true;
    return t;
  });

  await sleep(150);
  if (photo) {
    photo.classList.add('on');
    await sleep(400);
  }

  const cursor = document.createElement('span');
  cursor.className = 'cursor';

  for (let i = 0; i < paras.length; i++) {
    const node = document.createTextNode('');
    paras[i].hidden = false;
    paras[i].append(node, cursor);
    for (const ch of texts[i]) {
      node.data += ch;
      await sleep(6);
    }
    await sleep(150);
  }
}

/* ---------- Start once the page is ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(root.getAttribute('data-theme') || 'teal');

  // Scramble effect: name first, then the line under it. Hover replays it.
  if (!reduce) {
    document.querySelectorAll('[data-scramble]').forEach((el, i) => {
      const part = setupScramble(el);
      runScramble(part, 200 + i * 400, 900 + i * 300);
      el.addEventListener('mouseenter', () => runScramble(part, 0, 700));
    });
  }

  load();
});