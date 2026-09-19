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

/* ---------- Typing animation ---------- */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => reduce ? Promise.resolve() : new Promise(r => setTimeout(r, ms));

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

  await sleep(300);
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
      await sleep(14);
    }
    await sleep(300);
  }
}

/* ---------- Start once the page is ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(root.getAttribute('data-theme') || 'teal');
  load();
});