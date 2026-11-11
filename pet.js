'use strict';
// Sprites e funções de desenho do TamaTask (pixel art 12x12, desenhada em canvas, sem imagens externas).
//  - CLÁSSICO: um só tom (cor do tema LCD).
//  - MODERNO: colorido. As letras são as cores da paleta --m-* do style.css.
(() => {
  /* ===== CLÁSSICO ===== */
  const C_PET = [
    '....####....', '..########..', '.##########.', '############', '###.####.###', '###.####.###',
    '############', '##.######.##', '###......###', '.##########.', '..########..', '.##......##.'
  ];
  const C_OVO = [
    '...####...', '..######..', '.########.', '.########.', '##########', '###.##.###',
    '##########', '##########', '.##.##.##.', '.########.', '..######..', '...####...'
  ];
  const C_RACHA = [[5, 2], [4, 3], [5, 4], [4, 5], [5, 6], [6, 7], [5, 8], [6, 9]];

  /* ===== MODERNO ===== */
  // k = corpo escuro, c = rosto creme, e = olhos/boca, p = bochechas, y = amarelo, w = brilho
  const M_PET = [
    '..kk....kk..', '.kyyk..kyyk.', '.kkkkkkkkkk.', 'kkkkkkkkkkkk', 'kkcccccccckk', 'kcceccccecck',
    'kcceccccecck', 'kcpccccccpck', 'kkccceeccckk', '.kkccccccck.', '..kkkkkkkk..', '..yy....yy..'
  ];
  const M_OVO = [
    '...kkkk...', '..kyyyyk..', '.kyyyyyyk.', '.kywyyyyk.', 'kyyyyyyyyk', 'kypyyyyyyk',
    'kyyyyyypyk', 'kyyyyyyyyk', '.kyypyyyk.', '.kyyyyyyk.', '..kyyyyk..', '...kkkk...'
  ];
  const M_RACHA = C_RACHA;

  const raiz = document.documentElement;
  const TAMA = window.TAMA = {
    mod: () => raiz.dataset.tema === 'moderno',
    cor: () => getComputedStyle(raiz).getPropertyValue('--pet').trim() || '#2b3322',
    cores() {
      const cs = getComputedStyle(raiz);
      const g = (v, d) => cs.getPropertyValue(v).trim() || d;
      return { k: g('--m-k', '#2d2a55'), e: g('--m-e', '#14122b'), c: g('--m-c', '#fff1cf'),
               y: g('--m-y', '#ffd95a'), p: g('--m-p', '#ff8f8f'), w: '#ffffff' };
    },
    pintar(ctx, rows, x0, y0, cell, cores) {
      const cor = cores ? null : TAMA.cor();
      rows.forEach((r, j) => {
        for (let i = 0; i < r.length; i++) {
          if (r[i] === '.') continue;
          ctx.fillStyle = cores ? cores[r[i]] : cor;
          ctx.fillRect((x0 + i) * cell, (y0 + j) * cell, cell, cell);
        }
      });
    },
    classico: { pet: C_PET, ovo: C_OVO, racha: C_RACHA },
    moderno: { pet: M_PET, ovo: M_OVO, racha: M_RACHA }
  };

  /* ===== Bichinho do cabeçalho ===== */
  const cv = document.getElementById('pet');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let f = 0;   // 0 = normal, 1 = piscando e 1 ponto mais baixo

  function desenhar() {
    const m = TAMA.mod();
    const t = m ? TAMA.moderno : TAMA.classico;
    const cell = m ? 6 : 5;
    let rows = t.pet;
    if (f) rows = rows.map((r, i) => (m ? (i === 5 ? r.replace(/e/g, 'c') : r) : (i === 4 ? '############' : r)));
    const larg = 12 * cell, alt = 13.5 * cell | 0;             // 60x65 (clássico) | 72x81 (moderno)
    if (cv.width !== larg || cv.height !== alt) { cv.width = larg; cv.height = alt; }
    ctx.clearRect(0, 0, cv.width, cv.height);
    TAMA.pintar(ctx, rows, 0, f, cell, m ? TAMA.cores() : null);
  }
  desenhar();
  window.addEventListener('tema', desenhar);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => { f = 1 - f; desenhar(); }, 700);
  }
})();
