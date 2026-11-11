'use strict';
// Alterna entre "classico" (LCD verde) e "moderno" (colorido). A escolha fica salva no aparelho.
(() => {
  const KEY = 'tamatask.tema';
  const CORES = { classico: '#c4cfa1', moderno: '#f1e8ff' };   // cor da barra do iOS
  const raiz = document.documentElement;
  let atual = 'classico';
  try { if (localStorage.getItem(KEY) === 'moderno') atual = 'moderno'; } catch {}
  raiz.dataset.tema = atual;   // aplica antes da primeira pintura

  // O logo (SVG) se mede depois de desenhado e ajusta a área visível: assim nada é cortado,
  // qualquer que seja a largura da fonte arredondada do aparelho.
  function ajustarLogo() {
    const svg = document.querySelector('.logo-svg');
    if (!svg || getComputedStyle(svg).display === 'none') return;
    const g = svg.querySelector('#logo-g');
    let bb;
    try { bb = g.getBBox(); } catch { return; }
    if (!bb.width || !bb.height) return;
    const m = 10;   // folga para contorno, anel e sombra
    svg.setAttribute('viewBox', [bb.x - m, bb.y - m, bb.width + 2 * m + 5, bb.height + 2 * m + 5].join(' '));
    const lg = svg.querySelector('#lg');
    lg.setAttribute('x1', bb.x); lg.setAttribute('x2', bb.x + bb.width);
    svg.querySelector('.l-star').setAttribute('transform', 'translate(' + (bb.x + bb.width + 2) + ' ' + (bb.y + 2) + ')');
  }
  window.ajustarLogo = ajustarLogo;

  function aplicar() {
    raiz.dataset.tema = atual;
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', CORES[atual]);
    window.dispatchEvent(new Event('tema'));
    requestAnimationFrame(ajustarLogo);
  }
  document.addEventListener('DOMContentLoaded', () => {
    aplicar();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarLogo);
    window.addEventListener('load', ajustarLogo);
    document.getElementById('tema').addEventListener('click', () => {
      atual = atual === 'moderno' ? 'classico' : 'moderno';
      try { localStorage.setItem(KEY, atual); } catch {}
      aplicar();
    });
  });
})();
