#!/usr/bin/env python3
"""Syncs types/registry.json with the /types folder tree (for hosts without directory listing, e.g. GitHub Pages).
Adds every .html found at any depth, removes entries whose file no longer exists, never touches existing entries.
Run from project root: python3 tools/scan-types.py"""
import json, os, re
p='types/registry.json'
r=json.load(open(p)) if os.path.exists(p) else {}
r.setdefault('title','Workspace Types'); r.setdefault('folders',{}); r.setdefault('types',[])
pretty=lambda s: re.sub(r'\b\w',lambda m:m.group().upper(),re.sub(r'[-_]+',' ',s))
files=[]
for d,_,fs in os.walk('types'):
    for f in fs:
        if f.lower().endswith('.html') and not (d=='types' and f.lower()=='index.html'):
            files.append(os.path.join(d,f).replace(os.sep,'/'))
before=len(r['types'])
r['types']=[t for t in r['types'] if t['src'] in files]
print('removed',before-len(r['types']),'stale')
have={t['src'] for t in r['types']}; ids={t['id'] for t in r['types']}
for src in sorted(files):
    if src in have: continue
    rel=src[len('types/'):]; stem=os.path.basename(rel)[:-5]; i=stem.lower()
    if i in ids: i=rel[:-5].lower().replace('/','--')
    ids.add(i); r['types'].append({'id':i,'name':pretty(stem),'src':src,'featured':True}); print('added',src)
json.dump(r,open(p,'w'),indent=2)
