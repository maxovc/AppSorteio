'use strict';
// Bichinhos em pixel art 12x12, desenhados em canvas (sem imagens externas).
// Clássico: um só tom (cor do tema). Moderno: colorido, com paleta lida das variáveis --m-* do style.css.
(() => {
  const CLASSICO = [
    '....####....', '..########..', '.##########.', '############', '###.####.###', '###.####.###',
    '############', '##.######.##', '###......###', '.##########.', '..########..', '.##......##.'
  ];
  // k = corpo escuro, c = rosto creme, e = olhos/boca, p = bochechas, y = amarelo (orelhas por dentro, pezinhos)
  const MODERNO = [
    '..kk....kk..', '.kyyk..kyyk.', '.kkkkkkkkkk.', 'kkkkkkkkkkkk', 'kkcccccccckk', 'kcceccccecck',
    'kcceccccecck', 'kcpccccccpck', 'kkccceeccckk', '.kkccccccck.', '..kkkkkkkk..', '..yy....yy..'
  ];
  const OVO_MODERNO = [
    '...kkkk...', '..kyyyyk..', '.kyyyyyyk.', '.kywyyyyk.', 'kyyyyyyyyk', 'kypyyyyyyk',
    'kyyyyyypyk', 'kyyyyyyyyk', '.kyypyyyk.', '.kyyyyyyk.', '..kyyyyk..', '...kkkk...'
  ];
  window.TAMA_SPRITE = CLASSICO;                         // usado pelo ovo clássico
  window.TAMA_MODERNO = { pet: MODERNO, ovo: OVO_MODERNO };
  window.tamaModerno = () => document.documentElement.dataset.tema === 'moderno';
  window.tamaCor = () => getComputedStyle(document.documentElement).getPropertyValue('--pet').trim() || '#2b3322';
  window.tamaCores = () => {
    const cs = getComputedStyle(document.documentElement);
    const g = (v, d) => cs.getPropertyValue(v).trim() || d;
    return { k: g('--m-k', '#2d2a55'), e: g('--m-e', '#14122b'), c: g('--m-c', '#fff1cf'),
             y: g('--m-y', '#ffd95a'), p: g('--m-p', '#ff8f8f'), w: '#ffffff' };
  };

  const cv = document.getElementById('pet');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let f = 0;   // 0 = normal, 1 = piscando e 1px mais baixo

  function quadro(rows, mod) {
    if (!f) return rows;
    return rows.map((r, i) => (mod ? (i === 5 ? r.replace(/e/g, 'c') : r) : (i === 4 ? '############' : r)));
  }
  function desenhar() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    const mod = window.tamaModerno();
    const cores = mod ? window.tamaCores() : null;
    const cor = window.tamaCor();
    quadro(mod ? MODERNO : CLASSICO, mod).forEach((r, y) => [...r].forEach((c, x) => {
      if (c === '.') return;
      ctx.fillStyle = cores ? cores[c] : cor;
      ctx.fillRect(x, y + f, 1, 1);
    }));
  }
  desenhar();
  window.addEventListener('tema', desenhar);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => { f = 1 - f; desenhar(); }, 700);
  }
})();
