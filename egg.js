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

  // Configuração por tema: tamanho do ponto, grade, posição dos sprites, saltinho do bichinho
  function cfg() {
    if (T.mod()) return { m: true, cell: 10, g: 16, ox: 3, oy: 2, px: 2, py: 3, q: [-3, -1, -2, 0, -1, 0, 0, 0],
                          pet: T.moderno.pet, ovo: T.moderno.ovo, racha: T.moderno.racha, cores: T.cores(),
                          brilhos: [[0, 2], [15, 1], [1, 14], [14, 13]] };
    return { m: false, cell: 5, g: 32, ox: 7, oy: 5, px: 4, py: 5, q: [-5, -2, -3, 0, -2, 0, 0, 0],
             pet: T.classico.pet, ovo: T.classico.ovo, racha: T.classico.racha, cores: null,
             brilhos: [[2, 4], [29, 3], [3, 27], [28, 25]] };
  }
  function limpar(c) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (!c.m) T.fantasma(ctx, c.g, c.g, c.cell);
  }
  function ovo(dx, rachaduras) {
    const c = cfg();
    limpar(c);
    T.pintar(ctx, c.ovo, c.ox + dx, c.oy, c.cell, c.cores);
    ctx.fillStyle = c.m ? c.cores.k : T.cor();           // rachaduras: pontos escuros
    const gp = c.m ? 0 : 1;
    for (let i = 0; i < rachaduras && i < c.racha.length; i++) {
      ctx.fillRect((c.ox + dx + c.racha[i][0]) * c.cell, (c.oy + c.racha[i][1]) * c.cell, c.cell - gp, c.cell - gp);
    }
  }
  function brilhar(c) {
    ctx.fillStyle = c.m ? c.cores.p : T.cor();
    const forma = c.m ? [[0, 0]] : [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];   // clássico: "+" de 5 pontos
    const gp = c.m ? 0 : 1;
    c.brilhos.forEach(([x, y]) => forma.forEach(([dx, dy]) =>
      ctx.fillRect((x + dx) * c.cell, (y + dy) * c.cell, c.cell - gp, c.cell - gp)));
  }
  function nascer(pronto) {
    let k = 0;
    const t = setInterval(() => {
      const c = cfg();
      limpar(c);
      T.pintar(ctx, c.pet, c.px, c.py + c.q[k], c.cell, c.cores);
      if (k % 2 === 0) brilhar(c);
      if (++k >= c.q.length) {
        clearInterval(t); rodando = false;
        ultimo = () => { const z = cfg(); limpar(z); T.pintar(ctx, z.pet, z.px, z.py, z.cell, z.cores); };
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
