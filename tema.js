'use strict';
// Alterna entre "classico" (LCD verde) e "moderno" (colorido). A escolha fica salva no aparelho.
(() => {
  const KEY = 'tamatask.tema';
  const CORES = { classico: '#c4cfa1', moderno: '#f1e8ff' };   // cor da barra do iOS
  const raiz = document.documentElement;
  let atual = 'classico';
  try { if (localStorage.getItem(KEY) === 'moderno') atual = 'moderno'; } catch {}
  raiz.dataset.tema = atual;   // aplica antes da primeira pintura

  function aplicar() {
    raiz.dataset.tema = atual;
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', CORES[atual]);
    window.dispatchEvent(new Event('tema'));
  }
  document.addEventListener('DOMContentLoaded', () => {
    aplicar();
    document.getElementById('tema').addEventListener('click', () => {
      atual = atual === 'moderno' ? 'classico' : 'moderno';
      try { localStorage.setItem(KEY, atual); } catch {}
      aplicar();
    });
  });
})();
