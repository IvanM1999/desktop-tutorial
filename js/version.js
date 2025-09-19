// version.js — versão central da plataforma (seguir versionamento semântico)
// Atualize aqui sempre que houver mudanças significativas no front/back.
const APP_VERSION = "2.0.0";
document.addEventListener('DOMContentLoaded', ()=>{
  const el = document.getElementById('appVersion');
  if(el) el.textContent = APP_VERSION;
});