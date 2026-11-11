'use strict';

const KEY = 'sorteio.v1';
const NOMES = ['Fácil', 'Moderada', 'Difícil'];
const ICO_PIX = ['\uE000', '\uE001', '\uE002'];   // ícones da fonte pixel (visual clássico)
const ICO_EMO = ['🌱', '⚡', '🔥'];               // visual moderno
const ABAS = ['inicio', 'backlog'];
const $ = id => document.getElementById(id);

const novoId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2));

// Valida e normaliza qualquer dado vindo do armazenamento ou de arquivo importado
function limpar(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .slice(0, 5000)
    .filter(t => t && typeof t.titulo === 'string' && t.titulo.trim())
    .map(t => {
      const feita = t.feita === true;
      const criadaEm = Number.isFinite(t.criadaEm) ? t.criadaEm : Date.now();
      return {
        id: typeof t.id === 'string' && t.id ? t.id.slice(0, 60) : novoId(),
        titulo: t.titulo.trim().slice(0, 200),
        dificuldade: [0, 1, 2].includes(t.dificuldade) ? t.dificuldade : 1,
        feita,
        criadaEm,
        feitaEm: feita ? (Number.isFinite(t.feitaEm) ? t.feitaEm : criadaEm) : 0
      };
    });
}

function carregar() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? limpar(JSON.parse(raw)) : [];
  } catch { return []; }
}

function salvar() {
  try { localStorage.setItem(KEY, JSON.stringify(tarefas)); }
  catch { alert('Não foi possível salvar. Exporte um backup assim que puder.'); }
}

let tarefas = carregar();
let sorteadas = [];   // sempre 0 ou 1 tarefa
let dif = 1;
let revelar = false;

function embaralhar(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Todo texto do usuário entra via textContent (nunca innerHTML)
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function item(t, acoes) {
  const li = el('li', 'item d' + t.dificuldade);
  const info = el('div', 'info');
  info.append(el('strong', '', t.titulo));
  const rotulo = el('small');
  rotulo.append(el('span', 'ic-p', ICO_PIX[t.dificuldade]), el('span', 'ic-e', ICO_EMO[t.dificuldade]),
                NOMES[t.dificuldade] + (t.feita ? ' ✓' : ''));
  info.append(rotulo);
  li.append(info);
  if (acoes.length) {
    const box = el('div', 'acoes');
    acoes.forEach(a => {
      const b = el('button', '', a.txt);
      b.addEventListener('click', a.fn);
      box.append(b);
    });
    li.append(box);
  }
  return li;
}

function marcarFeita(t, ev) {
  const r = ev.currentTarget.getBoundingClientRect();   // posição do botão, antes de ele sumir
  t.feita = true;
  t.feitaEm = Date.now();
  sorteadas = sorteadas.filter(x => x.id !== t.id);
  salvar(); renderTudo();
  const zerou = !tarefas.some(x => !x.feita);
  if (typeof window.festa === 'function') window.festa(r.left + r.width / 2, r.top + r.height / 2, zerou);
}

// Cartão em destaque da tarefa sorteada
function carta(t) {
  const li = el('li', 'carta');
  li.append(el('div', 'faixa', 'Tarefa sorteada!'));
  li.append(el('p', 'tit', t.titulo));
  const base = el('div', 'base');
  const rotulo = el('small');
  rotulo.append(el('span', 'ic-p', ICO_PIX[t.dificuldade]), el('span', 'ic-e', ICO_EMO[t.dificuldade]), NOMES[t.dificuldade]);
  const b = el('button', '', 'Feita ✓');
  b.addEventListener('click', ev => marcarFeita(t, ev));
  base.append(rotulo, b);
  li.append(base);
  return li;
}

// "Roleta": o título troca rápido entre as tarefas e vai desacelerando até parar na sorteada
function roleta(pend, alvo, fim) {
  const outros = embaralhar(pend.filter(x => x.id !== alvo.id).map(x => x.titulo));
  const atrasos = [55, 55, 60, 70, 90, 120, 170, 250, 360];
  let i = 0;
  (function passo() {
    const c = document.querySelector('#sorteadas .carta');
    if (!c || i >= atrasos.length) { fim(); return; }
    c.querySelector('.faixa').textContent = 'Sorteando...';
    c.querySelector('.tit').textContent = outros[i % outros.length];
    setTimeout(passo, atrasos[i++]);
  })();
}

function renderTudo() {
  const pend = tarefas.filter(t => !t.feita).sort((a, b) => b.criadaEm - a.criadaEm);
  const feitas = tarefas.filter(t => t.feita).sort((a, b) => b.feitaEm - a.feitaEm);

  $('cnt').textContent = pend.length ? String(pend.length) : '';
  $('vazio').hidden = pend.length > 0;
  $('vazio').textContent = feitas.length ? 'Nenhuma tarefa pendente.' : 'Backlog vazio. Adicione tarefas na aba Início.';
  $('lista').replaceChildren(...pend.map(t => item(t, [{
    txt: 'Apagar',
    fn: () => {
      if (!confirm('Apagar esta tarefa?')) return;
      tarefas = tarefas.filter(x => x.id !== t.id);
      sorteadas = sorteadas.filter(x => x.id !== t.id);
      salvar(); renderTudo();
    }
  }])));

  // Concluídas: continuam na lista, separadas e com aparência apagada
  $('blocoFeitas').hidden = feitas.length === 0;
  $('cntFeitas').textContent = feitas.length ? '(' + feitas.length + ')' : '';
  $('feitas').replaceChildren(...feitas.map(t => { const li = item(t, []); li.classList.add('feita'); return li; }));

  // Tarefa sorteada (cartão em destaque)
  $('sorteadas').replaceChildren(...sorteadas.map(t => {
    const li = carta(t);
    if (revelar) li.classList.add('rodando');
    return li;
  }));
}

// Abas
document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('on', x === b));
  ABAS.forEach(id => { $(id).hidden = id !== b.dataset.tab; });
  if (typeof window.voltarOvo === 'function') window.voltarOvo(false);
}));

// Complexidade
document.querySelectorAll('#dif button').forEach(b => b.addEventListener('click', () => {
  dif = Number(b.dataset.d);
  document.querySelectorAll('#dif button').forEach(x => x.classList.toggle('on', x === b));
}));

// Adicionar
$('add').addEventListener('click', () => {
  const titulo = $('titulo').value.trim();
  if (!titulo) { $('titulo').focus(); return; }
  tarefas.push({
    id: novoId(),
    titulo: titulo.slice(0, 200),
    dificuldade: dif,
    feita: false,
    criadaEm: Date.now(),
    feitaEm: 0
  });
  salvar();
  $('titulo').value = '';
  $('ok').textContent = 'Adicionada ao backlog ✓';
  setTimeout(() => { $('ok').textContent = ''; }, 2000);
  renderTudo();
});

// Sortear: sempre uma tarefa (o ovo choca, a roleta gira e o cartão aparece em destaque)
const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
let timerOvo = null;
$('sortear').addEventListener('click', () => {
  const pend = tarefas.filter(t => !t.feita);
  $('aviso').textContent = pend.length ? '' : 'Seu backlog está vazio.';
  if (!pend.length) return;
  clearTimeout(timerOvo);
  const alvo = embaralhar(pend)[0];
  sorteadas = [];
  renderTudo();
  $('sortear').disabled = true;

  const mostrar = () => {
    sorteadas = [alvo];
    revelar = true; renderTudo(); revelar = false;
    const c = document.querySelector('#sorteadas .carta');
    if (c && c.offsetParent !== null) c.scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth', block: 'center' });

    const fim = () => {
      const cc = document.querySelector('#sorteadas .carta');
      $('sortear').disabled = false;
      if (!cc) return;
      cc.classList.remove('rodando');
      cc.classList.add('pousou');
      cc.querySelector('.tit').textContent = alvo.titulo;
      cc.querySelector('.faixa').textContent = 'Tarefa sorteada!';
      if (cc.offsetParent !== null && typeof window.festa === 'function') {
        const r = cc.getBoundingClientRect();
        window.festa(r.left + r.width / 2, r.top + r.height / 2, false, true);   // brilho de "ta-da"
      }
      // depois de um instante, o bichinho volta a ser um ovo
      timerOvo = setTimeout(() => { if (typeof window.voltarOvo === 'function') window.voltarOvo(true); }, 1800);
    };
    if (!c || reduzido || pend.length < 2) fim(); else roleta(pend, alvo, fim);
  };
  if (typeof window.chocar === 'function') window.chocar(mostrar); else mostrar();
});

// Limpar concluídas
$('limpar').addEventListener('click', () => {
  const n = tarefas.filter(t => t.feita).length;
  if (!n || !confirm('Apagar ' + n + ' tarefa(s) concluída(s)?')) return;
  tarefas = tarefas.filter(t => !t.feita);
  salvar(); renderTudo();
});

// Backup: exportar
$('exportar').addEventListener('click', async () => {
  const json = JSON.stringify({ versao: 1, tarefas }, null, 2);
  const nome = 'sorteio-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  const arquivo = new File([json], nome, { type: 'application/json' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      await navigator.share({ files: [arquivo] });
      return;
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(arquivo);
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

// Backup: importar (mescla sem duplicar)
$('importar').addEventListener('change', async e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  if (f.size > 5e6) { alert('Arquivo grande demais.'); return; }
  try {
    const dados = JSON.parse(await f.text());
    const ids = new Set(tarefas.map(t => t.id));
    const novas = limpar(dados && dados.tarefas).filter(t => !ids.has(t.id));
    tarefas = tarefas.concat(novas);
    sorteadas = [];
    salvar(); renderTudo();
    alert(novas.length + ' tarefa(s) importada(s).');
  } catch { alert('Arquivo inválido.'); }
});

$('titulo').addEventListener('keydown', e => { if (e.key === 'Enter') $('add').click(); });

if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

renderTudo();
