/* main.js — manipulação de temas, carregamento de posts e formulário de contato
   Objetivo: código pequeno, sem dependências externas, pronto para SPCK/editor local. */

(function(){
  const themeOrder = ['theme-default','theme-dark','theme-neon','theme-ac'];
  let current = 0;

  function applyTheme(idx){
    document.body.classList.remove(...themeOrder);
    const cls = themeOrder[idx] || 'theme-default';
    document.body.classList.add(cls);
    localStorage.setItem('ds_theme', idx);
  }

  function initTheme(){
    const stored = localStorage.getItem('ds_theme');
    current = stored !== null ? Number(stored) : 0;
    applyTheme(current);
    document.getElementById('themeToggle').addEventListener('click', ()=>{
      current = (current + 1) % themeOrder.length;
      applyTheme(current);
    });
  }

  /* Carregamento de posts (tenta fetch local, com fallback embutido) */
  async function loadPosts(){
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '<div class="post loading">Carregando posts…</div>';
    try{
      const resp = await fetch('data/posts.json', {cache: "no-store"});
      if(!resp.ok) throw new Error('Falha ao carregar posts');
      const posts = await resp.json();
      renderPosts(posts);
    }catch(e){
      // fallback embutido (caso o fetch local falhe)
      const fallback = [
        {"id":1,"title":"Post (fallback)","summary":"Conteúdo local temporário.","date":"2025-01-01"}
      ];
      renderPosts(fallback);
      console.warn('Usando fallback posts:', e);
    }
  }

  function renderPosts(posts){
    const node = document.getElementById('posts');
    node.innerHTML = '';
    posts.forEach(p=>{
      const div = document.createElement('article');
      div.className = 'post';
      div.innerHTML = `
        <h3>${escapeHtml(p.title)}</h3>
        <p class="muted">${escapeHtml(p.date)}</p>
        <p>${escapeHtml(p.summary)}</p>
        <a class="btn btn-outline" href="#blog" onclick="alert('Leia o post completo no seu CMS')">Ler mais</a>
      `;
      node.appendChild(div);
    });
  }

  // Simple escaping helper
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (m)=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // contact form: abre mailto com os dados (compatível offline). Também exibe status.
  window.handleContact = function handleContact(ev){
    ev.preventDefault();
    const f = ev.target;
    const name = f.name.value.trim();
    const email = f.email.value.trim();
    const subject = f.subject.value.trim() || 'Contato via site';
    const message = f.message.value.trim();

    if(!name || !email || !message){
      showStatus('Preencha os campos obrigatórios.', true);
      return;
    }

    const body = encodeURIComponent(`Nome: ${name}\nEmail: ${email}\n\n${message}`);
    const mailto = `mailto:imperiobinario@hotmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    // tentativa de abrir cliente de e-mail
    window.location.href = mailto;
    showStatus('Abrindo seu cliente de e-mail... Se nada acontecer, envie para imperiobinario@hotmail.com', false);
    f.reset();
  }

  function showStatus(msg, isError){
    const el = document.getElementById('contactStatus');
    el.textContent = msg;
    el.style.color = isError ? 'crimson' : '';
  }

  // set year in footer
  function setYear(){
    const y = new Date().getFullYear();
    const el = document.getElementById('year');
    if(el) el.textContent = y;
  }

  // init
  document.addEventListener('DOMContentLoaded', ()=>{
    initTheme(); loadPosts(); setYear();
  });

})();

// Configuração da meta em dinheiro
const CONFIG = {
  toyMeta: 500,
  moneyMeta: 5000.00
};

const moneyEl = document.getElementById('moneyBar');
const moneyText = document.getElementById('moneyText');

function formatMoney(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function updateMoney() {
  let receivedMoney = Number(localStorage.getItem('moneyReceived')) || 0;
  let percent = Math.min((receivedMoney / CONFIG.moneyMeta) * 100, 100);
  if(moneyEl){
    moneyEl.style.width = percent + '%';
  }
  const receivedEl = document.getElementById('receivedMoney');
  const metaEl = document.getElementById('metaMoney');
  if(receivedEl) receivedEl.textContent = formatMoney(receivedMoney);
  if(metaEl) metaEl.textContent = formatMoney(CONFIG.moneyMeta);
  if(moneyText) moneyText.textContent = `${formatMoney(receivedMoney)} / ${formatMoney(CONFIG.moneyMeta)}`;
}

// Ler valor inicial de money.txt
fetch('money.txt')
  .then(r => r.text())
  .then(t => {
    let v = parseFloat(t.trim().replace(',', '.'));
    if(!isNaN(v)) localStorage.setItem('moneyReceived', v);
    updateMoney();
  })
  .catch(e => console.warn('Erro ao carregar money.txt', e));



// ---- Money progress (inserido automaticamente) ----
if (typeof CONFIG === 'undefined') {
  window.CONFIG = window.CONFIG || {};
  CONFIG.toyMeta = CONFIG.toyMeta || 500;
  CONFIG.moneyMeta = CONFIG.moneyMeta || 1000.00;
} else {
  CONFIG.moneyMeta = CONFIG.moneyMeta || 1000.00;
}

(function initMoneyProgress(){
  const moneyEl = document.getElementById('moneyBar');
  const moneyText = document.getElementById('moneyText');

  function formatMoney(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function updateMoney(receivedMoney) {
    const percent = Math.min((receivedMoney / CONFIG.moneyMeta) * 100, 100);
    if (moneyEl) moneyEl.style.width = percent + '%';
    const receivedEl = document.getElementById('receivedMoney');
    const metaEl = document.getElementById('metaMoney');
    if (receivedEl) receivedEl.textContent = formatMoney(receivedMoney);
    if (metaEl) metaEl.textContent = formatMoney(CONFIG.moneyMeta);
    if (moneyText) moneyText.textContent = `${formatMoney(receivedMoney)} / ${formatMoney(CONFIG.moneyMeta)}`;
  }

  // Try fetch money.txt, fallback to localStorage
  fetch('money.txt?ts=' + Date.now())
    .then(r => {
      if(!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(t => {
      const v = parseFloat((t||'').trim().replace(',', '.'));
      if(!isNaN(v)) {
        localStorage.setItem('moneyReceived', String(v));
        updateMoney(v);
      } else {
        console.warn('money.txt não contém número válido:', JSON.stringify(t));
        const stored = Number(localStorage.getItem('moneyReceived')) || 0;
        updateMoney(stored);
      }
    })
    .catch(err => {
      console.warn('Erro ao carregar money.txt', err);
      const stored = Number(localStorage.getItem('moneyReceived')) || 0;
      updateMoney(stored);
    });
})(); 
// ---- fim money ----
