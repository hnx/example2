/* Loads workspace types (from the /types folder tree), then the HTML pieces, then the scripts (in order). */
(function(){
  const parts=['html/landing.html','html/app.html','html/settings.html'];
  const scripts=['js/app.js','js/landing.js','js/settings.js'];
  const pretty=s=>s.replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  const ROOT='types/';

  /* Crawl /types recursively via the server's directory listing. Returns {ok, files:[relative paths]}. */
  async function crawl(dir,depth,out){
    let html='';
    try{const r=await fetch(dir,{cache:'no-store'});if(r.ok)html=await r.text()}catch(e){}
    const base=new URL(dir,location.href);const re=/href=["']([^"'#?]+)["']/gi;let m,any=false;const subs=[];
    while((m=re.exec(html))){
      let u;try{u=new URL(m[1],base)}catch(e){continue}
      if(u.origin!==base.origin||!u.pathname.startsWith(base.pathname)||u.pathname===base.pathname)continue;
      const rel=decodeURIComponent(u.pathname.slice(base.pathname.length));
      if(rel.endsWith('/')){if(rel.split('/').length===2)subs.push(rel);any=true}
      else if(/\.html$/i.test(rel)&&rel.indexOf('/')<0){any=true;if(rel.toLowerCase()!=='index.html')out.push(dir+rel)}
    }
    if(depth<6)for(const s of subs)await crawl(dir+s,depth+1,out);
    return any;
  }

  const reg=(async()=>{
    let j={};try{const r=await fetch(ROOT+'registry.json',{cache:'no-store'});if(r.ok)j=await r.json()}catch(e){}
    const found=[];const listed=await crawl(ROOT,0,found);
    let types=(j.types||[]).map(t=>Object.assign({},t));
    if(listed)types=types.filter(t=>found.includes(t.src)); /* listing available: deleted files disappear on their own */
    const known=new Set(types.map(t=>t.src)),ids=new Set(types.map(t=>t.id));
    found.forEach(src=>{
      if(known.has(src))return;
      const rel=src.slice(ROOT.length),stem=rel.split('/').pop().replace(/\.html$/i,'');
      let id=stem.toLowerCase();if(ids.has(id))id=rel.replace(/\.html$/i,'').toLowerCase().replace(/\//g,'--');
      ids.add(id);types.push({id,name:pretty(stem),src,featured:true});
    });
    window.__TITLE=j.title||'Workspace Types';
    window.__FOLDERS=j.folders||{};
    window.__TYPES=types;
  })();

  Promise.all([reg].concat(parts.map(p=>fetch(p,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(p);return r.text()}))))
  .then(t=>{t.shift();
    document.body.insertAdjacentHTML('beforeend',t.join('\n'));
    scripts.reduce((chain,src)=>chain.then(()=>new Promise((ok,fail)=>{
      const s=document.createElement('script');s.src=src+'?v='+Date.now();s.onload=ok;s.onerror=()=>fail(new Error(src));
      document.body.appendChild(s);
    })),Promise.resolve());
  })
  .catch(()=>{
    document.body.insertAdjacentHTML('beforeend','<p style="position:fixed;inset:0;display:grid;place-items:center;padding:24px;text-align:center;font:14px sans-serif;color:#8a8a8a">This page loads its parts with fetch(), so it must be served over http(s) (e.g. GitHub Pages or a local server), not opened as a file.</p>');
  });
})();
