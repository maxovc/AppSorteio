'use strict';

const KEY = 'sorteio.v1';
const NOMES = ['Fácil', 'Mediana', 'Difícil'];
const $ = id => document.getElementById(id);

const novoId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2));

// Valida e normaliza qualquer dado vindo do armazenamento ou de arquivo importado
function limpar(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .slice(0, 5000)
    .filter(t => t && typeof t.titulo === 'string' && t.titulo.trim())
    .map(t => ({
      id: typeof t.id === 'string' && t.id ? t.id.slice(0, 60) : novoId(),
      titulo: t.titulo.trim().slice(0, 120),
      detalhes: typeof t.detalhes === 'string' ? t.detalhes.slice(0, 1000) : '',
      dificuldade: [0, 1, 2].includes(t.dificuldade) ? t.dificuldade : 1,
      feita: t.feita === true,
      criadaEm: Number.isFinite(t.criadaEm) ? t.criadaEm : Date.now()
    }));
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
let sorteadas = [];
let dif = 1;

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
  if (t.detalhes) info.append(el('p', '', t.detalhes));
  info.append(el('small', '', NOMES[t.dificuldade]));
  li.append(info);
  const box = el('div', 'acoes');
  acoes.forEach(a => {
    const b = el('button', '', a.txt);
    b.addEventListener('click', a.fn);
    box.append(b);
  });
  li.append(box);
  return li;
}

function renderTudo() {
  const pend = tarefas.filter(t => !t.feita).sort((a, b) => b.criadaEm - a.criadaEm);
  $('cnt').textContent = pend.length ? '(' + pend.length + ')' : '';
  $('vazio').hidden = pend.length > 0;
  $('lista').replaceChildren(...pend.map(t => item(t, [{
    txt: 'Apagar',
    fn: () => {
      if (!confirm('Apagar esta tarefa?')) return;
      tarefas = tarefas.filter(x => x.id !== t.id);
      sorteadas = sorteadas.filter(x => x.id !== t.id);
      salvar(); renderTudo();
    }
  }])));
  $('sorteadas').replaceChildren(...sorteadas.map(t => item(t, [{
    txt: 'Feita ✓',
    fn: () => {
      t.feita = true;
      sorteadas = sorteadas.filter(x => x.id !== t.id);
      salvar(); renderTudo();
    }
  }])));
}

// Abas
document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('on', x === b));
  ['nova', 'backlog', 'sorteio'].forEach(id => { $(id).hidden = id !== b.dataset.tab; });
}));

// Dificuldade
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
    titulo: titulo.slice(0, 120),
    detalhes: $('detalhes').value.trim().slice(0, 1000),
    dificuldade: dif,
    feita: false,
    criadaEm: Date.now()
  });
  salvar();
  $('titulo').value = '';
  $('detalhes').value = '';
  $('ok').textContent = 'Adicionada ao backlog ✓';
  setTimeout(() => { $('ok').textContent = ''; }, 2000);
  renderTudo();
});

// Sortear
$('sortear').addEventListener('click', () => {
  const pend = tarefas.filter(t => !t.feita);
  sorteadas = embaralhar(pend).slice(0, Number($('qtd').value));
  $('aviso').textContent = pend.length ? '' : 'Seu backlog está vazio.';
  renderTudo();
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

if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

renderTudo();
