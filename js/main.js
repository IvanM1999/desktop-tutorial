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