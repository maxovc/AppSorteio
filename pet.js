'use strict';
// Bichinho em pixel art (12x12), desenhado em canvas: sem imagens externas.
(() => {
  const cv = document.getElementById('pet');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const base = [
    '....####....',
    '..########..',
    '.##########.',
    '############',
    '###.####.###',
    '###.####.###',
    '############',
    '##.######.##',
    '###......###',
    '.##########.',
    '..########..',
    '.##......##.'
  ];
  const frames = [
    { rows: base, dy: 0 },
    { rows: base.map((r, i) => (i === 4 ? '############' : r)), dy: 1 } // piscando
  ];
  const cor = getComputedStyle(document.documentElement).getPropertyValue('--px').trim() || '#2b3322';
  let f = 0;
  function desenhar() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = cor;
    const { rows, dy } = frames[f];
    rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') ctx.fillRect(x, y + dy, 1, 1); }));
  }
  desenhar();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => { f = 1 - f; desenhar(); }, 700);
  }
})();
