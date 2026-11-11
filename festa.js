'use strict';
// Comemoração ao marcar uma tarefa como feita: fogos de artifício em pixels + mensagem.
// Chamada: window.festa(x, y, ultima)  (x, y = posição na tela; ultima = acabou o sorteio)
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { window.festa = () => {}; return; }
  const CORES = ['#ff4fa3', '#ff8a3d', '#ffd23f', '#4fd67d', '#3fb7ff', '#8a63ff'];
  const MSG = ['Boa!', 'Feito!', 'Isso aí!', 'Mandou bem!', 'Arrasou!'];
  let cv, ctx, parts = [], agenda = [], textos = [], rodando = false, antes = 0;

  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const moderno = () => document.documentElement.dataset.tema === 'moderno';

  function ajustar() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = innerWidth * d; cv.height = innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  function garantir() {
    if (cv) return;
    cv = document.createElement('canvas');
    cv.id = 'festa';
    cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    ctx = cv.getContext('2d');
    window.addEventListener('resize', ajustar);
    ajustar();
  }

  function explodir(x, y, n) {
    const m = moderno(), tinta = css('--px') || '#2b3322';
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.35;
      const v = 1.6 + Math.random() * 3.6;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 0, dur: 42 + Math.random() * 28,
                   tam: m ? 5 + Math.random() * 3 : 6, g: m ? 1 : 3,
                   cor: m ? CORES[(Math.random() * CORES.length) | 0] : tinta });
    }
  }
  function texto(txt, x, y) {
    ctx.font = (moderno() ? '800 24px ' : '24px ') + getComputedStyle(document.body).fontFamily;
    const w = ctx.measureText(txt).width;
    textos.push({ txt, x: Math.max(10, Math.min(innerWidth - w - 10, x - w / 2)), y, vida: 0, dur: 75 });
  }

  function quadro(ts) {
    const dt = Math.min(3, (ts - (antes || ts)) / 16.67); antes = ts;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    agenda = agenda.filter(a => { if (ts < a.em) return true; a.fn(); return false; });

    parts = parts.filter(p => {
      p.vida += dt;
      if (p.vida >= p.dur) return false;
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.06 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.globalAlpha = 1 - p.vida / p.dur;
      ctx.fillStyle = p.cor;
      ctx.fillRect(Math.round(p.x / p.g) * p.g, Math.round(p.y / p.g) * p.g, p.tam, p.tam);   // clássico: anda "em degraus"
      return true;
    });

    const m = moderno();
    textos = textos.filter(t => {
      t.vida += dt;
      if (t.vida >= t.dur) return false;
      const y = t.y - t.vida * 0.7;
      ctx.globalAlpha = Math.min(1, (t.dur - t.vida) / 20);
      ctx.font = (m ? '800 24px ' : '24px ') + getComputedStyle(document.body).fontFamily;
      ctx.lineJoin = 'round'; ctx.lineWidth = 7;
      ctx.strokeStyle = m ? css('--px') : css('--bg');
      ctx.strokeText(t.txt, t.x, y);
      ctx.fillStyle = m ? '#ffd95a' : css('--px');
      ctx.fillText(t.txt, t.x, y);
      return true;
    });
    ctx.globalAlpha = 1;

    if (parts.length || agenda.length || textos.length) requestAnimationFrame(quadro);
    else { rodando = false; antes = 0; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  window.festa = function (x, y, ultima) {
    garantir();
    const agora = performance.now();
    const em = (ms, fn) => agenda.push({ em: agora + ms, fn });
    explodir(x, y, 30);
    em(220, () => explodir(Math.max(20, x - 70 + Math.random() * 140), Math.max(20, y - 60 - Math.random() * 60), 26));
    texto(ultima ? 'Backlog zerado!' : MSG[(Math.random() * MSG.length) | 0], x, y - 20);
    if (ultima) {   // gran finale: vários fogos pela tela
      for (let i = 0; i < 5; i++) {
        em(350 + i * 230, () => explodir(40 + Math.random() * (innerWidth - 80), 80 + Math.random() * innerHeight * 0.4, 34));
      }
    }
    if (!rodando) { rodando = true; requestAnimationFrame(quadro); }
  };
})();
