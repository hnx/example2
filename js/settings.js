const VIEWS={root:['Settings',null],account:['Account','root'],data:['Data Management','root'],appearance:['Appearance','root'],about:['About','root'],identities:['Digital Identities Under Instrumentorum','about'],platforms:['Official Digital Platform Identities','identities'],websites:['Official Websites','identities']};
function setView(v){
  document.querySelectorAll('[data-view]').forEach(e=>e.hidden=e.dataset.view!==v);
  $('settingsTitle').textContent=VIEWS[v][0];
  $('setBack').hidden=!VIEWS[v][1];$('setBack').dataset.to=VIEWS[v][1]||'';
}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>setView(b.dataset.go));
$('setBack').onclick=e=>setView(e.currentTarget.dataset.to);
$('settingsBtn').onclick=()=>{nav(false);setView('root');open('settingsModal')};
document.querySelectorAll('.acc-head').forEach(h=>h.onclick=()=>{
  const a=h.parentElement,o=!a.classList.contains('open');
  a.classList.toggle('open',o);h.setAttribute('aria-expanded',o);
});
document.querySelectorAll('.themes button').forEach(b=>b.onclick=()=>{
  const root=document.documentElement;root.classList.add('theming');clearTimeout(window.__th);window.__th=setTimeout(()=>root.classList.remove('theming'),800);
  root.dataset.theme=b.dataset.theme;
  document.querySelectorAll('.themes button').forEach(x=>x.setAttribute('aria-pressed',x===b));
});
