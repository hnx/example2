/* Types come from the /types folder tree (see main.js). Folder = accordion, .html file = workspace type. */
const PRETTY=s=>s.replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const TYPES=(window.__TYPES||[]).map(t=>{
  const rel=String(t.src||'').replace(/^types\//,'').split('/');rel.pop();
  return {id:t.id,name:t.name||t.id,src:t.src,path:Array.isArray(t.path)?t.path:rel,featured:t.featured!==false};
});
const $=id=>document.getElementById(id);
let spaces=[];
try{spaces=JSON.parse(localStorage.getItem('instrumentorum:workspaces')||'[]')}catch(e){}
const save=()=>{try{localStorage.setItem('instrumentorum:workspaces',JSON.stringify(spaces))}catch(e){}};

const DOTS='<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>';
const closeRowMenus=()=>document.querySelectorAll('.item .menu').forEach(m=>m.hidden=true);
function renderList(){
  const list=$('list');list.textContent='';
  spaces.forEach(w=>{
    const item=document.createElement('div');item.className='item';
    const b=document.createElement('button');b.className='row';
    const n=document.createElement('div');n.textContent=w.name;
    const t=document.createElement('span');t.textContent=(TYPES.find(x=>x.id===w.type)||{}).name||'Unavailable type';
    b.append(n,t);b.onclick=()=>openSession(w);
    const d=document.createElement('button');d.className='icon-btn';d.setAttribute('aria-label','Workspace options');d.innerHTML=DOTS;
    const m=document.createElement('div');m.className='menu';m.hidden=true;m.setAttribute('role','menu');
    const rn=document.createElement('button');rn.textContent='Rename Workspace';
    const dl=document.createElement('button');dl.textContent='Delete Workspace';
    m.append(rn,dl);
    d.onclick=e=>{e.stopPropagation();const o=m.hidden;closeRowMenus();toggleMenu(false);m.hidden=!o};
    rn.onclick=()=>startRename(w,item,b);
    dl.onclick=()=>askDelete(w);
    item.append(b,d,m);list.append(item);
  });
}
function startRename(w,item,row){
  closeRowMenus();
  const i=document.createElement('input');i.className='field rename';i.value=w.name;i.maxLength=60;i.setAttribute('aria-label','Workspace name');
  row.replaceWith(i);i.focus();i.select();
  let done=false;
  const finish=ok=>{if(done)return;done=true;const v=i.value.trim();if(ok&&v){w.name=v;save()}renderList()};
  i.onkeydown=e=>{if(e.key==='Enter')finish(true);else if(e.key==='Escape'){e.stopPropagation();finish(false)}};
  i.onblur=()=>finish(false);
}
let pendingDel=null;
function askDelete(w){closeRowMenus();pendingDel=w;$('delText').textContent='Delete \u201c'+w.name+'\u201d?';open('delModal')}
$('delOk').onclick=()=>{
  if(pendingDel){
    try{localStorage.removeItem('ws:'+pendingDel.id)}catch(e){}
    spaces=spaces.filter(x=>x!==pendingDel);save();renderList();
  }
  pendingDel=null;shut('delModal');
};

/* Slider */
const drawer=$('drawer'),scrim=$('scrim'),menuBtn=$('menuBtn');
function nav(o){drawer.classList.toggle('on',o);scrim.classList.toggle('on',o);menuBtn.setAttribute('aria-expanded',o)}
menuBtn.onclick=()=>nav(!drawer.classList.contains('on'));
scrim.onclick=()=>nav(false);
function show(page){$('home').hidden=page!=='home';$('wsPage').hidden=page!=='ws';toggleMenu(false)}
$('navWs').onclick=()=>{nav(false);closeSession();show('ws')};
$('toHome').onclick=()=>show('home');

/* Three-dot menu */
const menu=$('menu'),dots=$('dots');
function toggleMenu(o){menu.hidden=!o;dots.setAttribute('aria-expanded',o)}
dots.onclick=e=>{e.stopPropagation();closeRowMenus();toggleMenu(menu.hidden)};
document.addEventListener('click',()=>{toggleMenu(false);closeRowMenus()});

/* Modals */
const open=id=>$(id).classList.add('on'),shut=id=>$(id).classList.remove('on');
document.querySelectorAll('.modal').forEach(m=>{
  m.onclick=e=>{if(e.target===m||e.target.closest('[data-close]'))m.classList.remove('on')};
});
/* Create workspace */
let pickedType=null;
$('createBtn').onclick=()=>{
  toggleMenu(false);pickedType=null;
  const step=$('typeStep');step.textContent='';step.hidden=false;$('nameStep').hidden=true;
  const pick=t=>{pickedType=t;step.hidden=true;$('nameStep').hidden=false;$('createTitle').textContent=t.name;
    const i=$('nameInput');i.value='';i.placeholder='Workspace name';i.focus()};
  const mkAcc=(label,level)=>{
    const acc=document.createElement('div');acc.className='acc acc-'+Math.min(level,3);
    const head=document.createElement('button');head.className='acc-head';head.setAttribute('aria-expanded','false');head.textContent=label;
    const panel=document.createElement('div');panel.className='acc-panel';
    const inner=document.createElement('div');inner.className='acc-inner';
    panel.append(inner);acc.append(head,panel);
    head.onclick=()=>{const o=!acc.classList.contains('open');acc.classList.toggle('open',o);head.setAttribute('aria-expanded',o)};
    return {acc,inner};
  };
  /* Build folder tree from each type's folder path */
  const tree={dirs:{},items:[]};
  TYPES.filter(t=>t.featured).forEach(t=>{let n=tree;t.path.forEach(seg=>{n=n.dirs[seg]||(n.dirs[seg]={dirs:{},items:[]})});n.items.push(t)});
  const FOLDERS=window.__FOLDERS||{};
  const fill=(node,host,level,prefix)=>{
    Object.keys(node.dirs).sort().forEach(seg=>{
      const key=prefix+seg,cfg=FOLDERS[key]||{};
      if(cfg.hidden)return;
      const sub=mkAcc(cfg.name||PRETTY(seg),level);
      fill(node.dirs[seg],sub.inner,level+1,key+'/');
      if(sub.inner.childElementCount)host.append(sub.acc);
    });
    node.items.sort((x,y)=>x.name.localeCompare(y.name)).forEach(t=>{
      const b=document.createElement('button');b.className='row';b.textContent=t.name;b.onclick=()=>pick(t);host.append(b);
    });
  };
  const top=mkAcc(window.__TITLE||'Workspace Types',1);
  fill(tree,top.inner,2,'');
  step.append(top.acc);
  $('createTitle').textContent='Create Workspace';open('createModal');
};
$('nameInput').addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;
  const name=e.target.value.trim();if(!name||!pickedType)return;
  const w={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),name,type:pickedType.id};
  spaces.push(w);save();renderList();shut('createModal');openSession(w);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.modal').forEach(m=>m.classList.remove('on'));nav(false);toggleMenu(false)}});

/* Session: the workspace runs inside this file */
let clearT;
function openSession(w){
  clearTimeout(clearT);
  $('sessionName').textContent=w.name;
  const t=TYPES.find(x=>x.id===w.type);
  $('frame').src=(t&&t.src)?t.src+'?ws='+encodeURIComponent(w.id):'about:blank';
  $('session').hidden=false;document.body.classList.add('in-session');
}
function closeSession(){
  $('session').hidden=true;document.body.classList.remove('in-session');
  clearTimeout(clearT);clearT=setTimeout(()=>{if($('session').hidden)$('frame').src='about:blank'},700);
}
$('back').onclick=closeSession;
renderList();

/* Home chat */
const chatLog=$('chatLog'),chatInput=$('chatInput');
function addBubble(text,who){
  const b=document.createElement('div');b.className='bubble '+who;b.textContent=text;
  chatLog.append(b);chatLog.scrollTop=chatLog.scrollHeight;return b;
}
function sendChat(){
  const text=chatInput.value.trim();if(!text)return;
  addBubble(text,'user');chatInput.value='';chatInput.focus();
  const t=document.createElement('div');t.className='bubble bot typing';t.innerHTML='<i></i><i></i><i></i>';
  chatLog.append(t);chatLog.scrollTop=chatLog.scrollHeight;
  setTimeout(()=>{t.remove();addBubble('How can I help you?','bot')},800);
}
$('chatSend').onclick=sendChat;
chatInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();sendChat()}});
