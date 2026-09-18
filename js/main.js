const THEMES = ['teal', 'matrix', 'amber', 'red'];

try {
  const saved = localStorage.getItem('theme');
  if (THEMES.includes(saved)) root.dataset.theme = saved;
} catch (e) {}

/* ---------- Typing animation ---------- */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => reduce ? Promise.resolve() : new Promise(r => setTimeout(r, ms));

async function load() {
  const photo = document.getElementById('photo');
  const paras = [...document.querySelectorAll('[data-type]')];
  if (!photo && !paras.length) return;


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


document.addEventListener('DOMContentLoaded', () => {
  // Theme dots
  document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      root.dataset.theme = btn.dataset.setTheme;
      try { localStorage.setItem('theme', btn.dataset.setTheme); } catch (e) {}
    });
  });

  load();
});