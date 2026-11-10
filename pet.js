'use strict';
// Sprites e funções de desenho do TamaTask.
//  - CLÁSSICO: LCD de pontos (24x26 para o bichinho, 18x22 para o ovo). '#' = aceso, '+' = meio-tom, '.' = apagado.
//  - MODERNO: pixel art colorida (12x12). Letras = cores da paleta --m-* do style.css.
(() => {
  /* ===== CLÁSSICO (pode editar os desenhos à mão) ===== */
  const C_PET = [
    '.......#...##...#.......',
    '.......#...##...#.......',
    '......#.#.#..#.#.#......',
    '.....#...#....#...#.....',
    '.....#............#.....',
    '.....#............#.....',
    '....#..............#....',
    '...#....##.....##...#...',
    '...#...###....###...#...',
    '...#...###....###...#...',
    '...#...###....###...#...',
    '...#.++..........++.#...',
    '....#++..#....#..++#....',
    '.....#....####....#.....',
    '......##........##......',
    '...###..########..###...',
    '..#........++........#..',
    '..##.....++++++.....##..',
    '....#...++++++++...#....',
    '.....#..++++++++..#.....',
    '......#.++++++++...##...',
    '.......#.++++++.....###.',
    '......#...........##....',
    '......#....##....#......',
    '......#...#..#...#......',
    '......#####..#####......'
  ];
  const C_PET_PISCA = [
    '.......#...##...#.......',
    '.......#...##...#.......',
    '......#.#.#..#.#.#......',
    '.....#...#....#...#.....',
    '.....#............#.....',
    '.....#............#.....',
    '....#..............#....',
    '...#................#...',
    '...#................#...',
    '...#...###....###...#...',
    '...#................#...',
    '...#.++..........++.#...',
    '....#++..#....#..++#....',
    '.....#....####....#.....',
    '......##........##......',
    '...###..########..###...',
    '..#........++........#..',
    '..##.....++++++.....##..',
    '....#...++++++++...#....',
    '.....#..++++++++..#.....',
    '......#.++++++++...##...',
    '.......#.++++++.....###.',
    '......#...........##....',
    '......#....##....#......',
    '......#...#..#...#......',
    '......#####..#####......'
  ];
  const C_OVO = [
    '..................',
    '......######......',
    '.....#......#.....',
    '....#........#....',
    '...#..........#...',
    '...#..........#...',
    '..#............#..',
    '..#..##....##..#..',
    '.#...##....##...#.',
    '.#..............#.',
    '.#..............#.',
    '.#..............#.',
    '.##.#.#.#.#.#.#.#.',
    '.#.#.#.#.#.#.#.##.',
    '.#..............#.',
    '.#..............#.',
    '.#..##.....##...#.',
    '..#.##.....##..#..',
    '..#............#..',
    '...##........##...',
    '.....###..###.....',
    '........##........'
  ];
  const C_RACHA = [[9, 5], [8, 6], [9, 7], [10, 8], [9, 9], [8, 10], [9, 11], [10, 12], [9, 13]];

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
  const M_RACHA = [[5, 2], [4, 3], [5, 4], [4, 5], [5, 6], [6, 7], [5, 8], [6, 9]];

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
    // Clássico: cada ponto é um quadradinho separado (efeito LCD). Moderno: pixels sólidos.
    pintar(ctx, rows, x0, y0, cell, cores) {
      const cor = cores ? null : TAMA.cor();
      const gap = !cores && cell >= 3 ? 1 : 0;
      rows.forEach((r, j) => {
        for (let i = 0; i < r.length; i++) {
          const c = r[i];
          if (c === '.') continue;
          if (c === '+' && (x0 + i + y0 + j) % 2) continue;      // meio-tom em xadrez
          ctx.fillStyle = cores ? cores[c] : cor;
          ctx.fillRect((x0 + i) * cell, (y0 + j) * cell, cell - gap, cell - gap);
        }
      });
    },
    // Pontos "apagados" da tela de LCD (bem fracos)
    fantasma(ctx, cols, linhas, cell) {
      ctx.globalAlpha = 0.09;
      ctx.fillStyle = TAMA.cor();
      for (let y = 0; y < linhas; y++) for (let x = 0; x < cols; x++) ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
      ctx.globalAlpha = 1;
    },
    classico: { pet: C_PET, pisca: C_PET_PISCA, ovo: C_OVO, racha: C_RACHA },
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
    let rows = t.pet;
    if (f) rows = m ? t.pet.map((r, i) => (i === 5 ? r.replace(/e/g, 'c') : r)) : t.pisca;
    const larg = m ? 72 : 96, alt = m ? 81 : 108;          // tamanho do canvas por tema
    if (cv.width !== larg || cv.height !== alt) { cv.width = larg; cv.height = alt; }
    ctx.clearRect(0, 0, cv.width, cv.height);
    TAMA.pintar(ctx, rows, 0, f, m ? 6 : 4, m ? TAMA.cores() : null);
  }
  desenhar();
  window.addEventListener('tema', desenhar);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => { f = 1 - f; desenhar(); }, 700);
  }
})();
