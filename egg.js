'use strict';
// Ovo de Tamagotchi: balança, racha, pisca a tela e "nasce" o bichinho do tema atual.
(() => {
  const cv = document.getElementById('egg');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const OVO = [
    '...####...', '..######..', '.########.', '.########.', '##########', '###.##.###',
    '##########', '##########', '.##.##.##.', '.########.', '..######..', '...####...'
  ];
  const RACHA = [[5, 2], [4, 3], [5, 4], [4, 5], [5, 6], [6, 7], [5, 8], [6, 9]];
  const parado = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rodando = false;
  let ultimo = () => ovo(0, 0);   // o que redesenhar ao trocar de tema

  const limpar = () => ctx.clearRect(0, 0, 16, 16);
  // Sprites do tema atual (clássico: um tom; moderno: paleta colorida)
  function sprites() {
    if (window.tamaModerno()) return { pet: window.TAMA_MODERNO.pet, ovo: window.TAMA_MODERNO.ovo, cores: window.tamaCores() };
    return { pet: window.TAMA_SPRITE || [], ovo: OVO, cores: null };
  }
  function pintar(rows, x, y, cores) {
    const cor = window.tamaCor();
    rows.forEach((r, j) => [...r].forEach((c, i) => {
      if (c === '.') return;
      ctx.fillStyle = cores ? cores[c] : cor;
      ctx.fillRect(x + i, y + j, 1, 1);
    }));
  }
  function ovo(dx, rachaduras) {
    const s = sprites();
    limpar();
    pintar(s.ovo, 3 + dx, 2, s.cores);
    for (let i = 0; i < rachaduras; i++) {
      const x = 3 + dx + RACHA[i][0], y = 2 + RACHA[i][1];
      if (s.cores) { ctx.fillStyle = s.cores.k; ctx.fillRect(x, y, 1, 1); }   // moderno: rachadura escura
      else ctx.clearRect(x, y, 1, 1);                                          // clássico: pixel apagado
    }
  }
  function nascer(pronto) {
    const quique = [-3, -1, -2, 0, -1, 0, 0, 0];
    const brilhos = [[0, 2], [15, 1], [1, 14], [14, 13]];
    let k = 0;
    const t = setInterval(() => {
      const s = sprites();
      limpar();
      pintar(s.pet, 2, 3 + quique[k], s.cores);
      if (k % 2 === 0) {
        ctx.fillStyle = s.cores ? s.cores.p : window.tamaCor();
        brilhos.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
      }
      if (++k >= quique.length) {
        clearInterval(t); rodando = false;
        ultimo = () => { const z = sprites(); limpar(); pintar(z.pet, 2, 3, z.cores); };
        pronto();
      }
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
    ultimo = () => ovo(0, 0);
    const dxs = [-1, 1, -1, 1, -1, 1, -1, 1, 0];
    let i = 0;
    const t = setInterval(() => {
      ovo(dxs[i], i);
      if (++i >= dxs.length) { clearInterval(t); piscar(pronto); }
    }, 130);
  };

  cv.addEventListener('click', () => document.getElementById('sortear').click());
  window.addEventListener('tema', () => { if (!rodando) ultimo(); });
  ovo(0, 0);
})();
