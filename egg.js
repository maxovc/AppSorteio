'use strict';
// Ovo de Tamagotchi: balança, racha, pisca a tela e "nasce" o bichinho do tema atual.
(() => {
  const cv = document.getElementById('egg');
  if (!cv || !window.TAMA) return;
  const T = window.TAMA;
  const ctx = cv.getContext('2d');
  const parado = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rodando = false;
  let ultimo = () => ovo(0, 0);   // o que redesenhar ao trocar de tema

  function cfg() {
    const m = T.mod(), t = m ? T.moderno : T.classico;
    return { m, cell: 10, ox: 3, oy: 2, px: 2, py: 3, q: [-3, -1, -2, 0, -1, 0, 0, 0],
             pet: t.pet, ovo: t.ovo, racha: t.racha, cores: m ? T.cores() : null,
             brilhos: [[0, 2], [15, 1], [1, 14], [14, 13]] };
  }
  const limpar = () => ctx.clearRect(0, 0, cv.width, cv.height);

  function ovo(dx, rachaduras) {
    const c = cfg();
    limpar();
    T.pintar(ctx, c.ovo, c.ox + dx, c.oy, c.cell, c.cores);
    for (let i = 0; i < rachaduras && i < c.racha.length; i++) {
      const x = (c.ox + dx + c.racha[i][0]) * c.cell, y = (c.oy + c.racha[i][1]) * c.cell;
      if (c.m) { ctx.fillStyle = c.cores.k; ctx.fillRect(x, y, c.cell, c.cell); }   // moderno: rachadura escura
      else ctx.clearRect(x, y, c.cell, c.cell);                                      // clássico: ponto apagado
    }
  }
  function nascer(pronto) {
    let k = 0;
    const t = setInterval(() => {
      const c = cfg();
      limpar();
      T.pintar(ctx, c.pet, c.px, c.py + c.q[k], c.cell, c.cores);
      if (k % 2 === 0) {
        ctx.fillStyle = c.m ? c.cores.p : T.cor();
        c.brilhos.forEach(([x, y]) => ctx.fillRect(x * c.cell, y * c.cell, c.cell, c.cell));
      }
      if (++k >= c.q.length) {
        clearInterval(t); rodando = false;
        ultimo = () => { const z = cfg(); limpar(); T.pintar(ctx, z.pet, z.px, z.py, z.cell, z.cores); };
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
