// 근육 총람 PWA 서비스워커 — 앱별 독립 캐시
const CACHE_PREFIX='muscle-atlas-claude-';
const V=CACHE_PREFIX+'v7-20260924';
const FILES=['./','./index.html','./manifest.webmanifest',
  './icon-192.png','./icon-512.png','./icon-180.png','./icon-maskable-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==V).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      const copy=res.clone();
      caches.open(V).then(c=>c.put(e.request,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});