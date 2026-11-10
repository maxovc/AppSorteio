'use strict';
// Ovo de Tamagotchi: balança, racha, pisca a tela e "nasce" o bichinho (tudo em canvas, sem imagens).
(() => {
  const cv = document.getElementById('egg');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const COR = getComputedStyle(document.documentElement).getPropertyValue('--px').trim() || '#2b3322';
  const OVO = [
    '...####...', '..######..', '.########.', '.########.', '##########', '###.##.###',
    '##########', '##########', '.##.##.##.', '.########.', '..######..', '...####...'
  ];
  const RACHA = [[5, 2], [4, 3], [5, 4], [4, 5], [5, 6], [6, 7], [5, 8], [6, 9]];
  const PET = window.TAMA_SPRITE || [];
  const parado = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rodando = false;

  const limpar = () => ctx.clearRect(0, 0, 16, 16);
  function pintar(rows, x, y) {
    ctx.fillStyle = COR;
    rows.forEach((r, j) => [...r].forEach((c, i) => { if (c === '#') ctx.fillRect(x + i, y + j, 1, 1); }));
  }
  function ovo(dx, rachaduras) {
    limpar();
    pintar(OVO, 3 + dx, 2);
    for (let i = 0; i < rachaduras; i++) ctx.clearRect(3 + dx + RACHA[i][0], 2 + RACHA[i][1], 1, 1);
  }
  function nascer(pronto) {
    const quique = [-3, -1, -2, 0, -1, 0, 0, 0];
    const brilhos = [[0, 2], [15, 1], [1, 14], [14, 13]];
    let k = 0;
    const t = setInterval(() => {
      limpar();
      pintar(PET, 2, 3 + quique[k]);
      if (k % 2 === 0) brilhos.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
      if (++k >= quique.length) { clearInterval(t); rodando = false; pronto(); }
    }, 110);
  }
  function piscar(pronto) {
    let n = 0;
    const t = setInterval(() => {
      cv.classList.toggle('flash');
      if (++n >= 4) { clearInterval(t); cv.classList.remove('flash'); nascer(pronto); }
    }, 90);
  }

  window.chocar = function (pronto) {
    if (rodando) return;
    if (parado) { pronto(); return; }
    rodando = true;
    const dxs = [-1, 1, -1, 1, -1, 1, -1, 1, 0];
    let i = 0;
    const t = setInterval(() => {
      ovo(dxs[i], i);
      if (++i >= dxs.length) { clearInterval(t); piscar(pronto); }
    }, 130);
  };

  cv.addEventListener('click', () => document.getElementById('sortear').click());
  ovo(0, 0);
})();
