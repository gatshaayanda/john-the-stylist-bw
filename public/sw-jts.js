const CACHE_VERSION="jts-shell-v1";
const SHELL=["/","/order","/account","/admin","/offline","/icon.svg"];
self.addEventListener("install",event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE_VERSION);for(const path of SHELL){try{const response=await fetch(path,{cache:"reload"});if(response.ok)await cache.put(path,response.clone())}catch{}}await self.skipWaiting()})()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith("boemo-shell-")||key.startsWith("jts-shell-")&&key!==CACHE_VERSION).map(key=>caches.delete(key)));await self.clients.claim()})()));
self.addEventListener("fetch",event=>{if(event.request.method!=="GET"||new URL(event.request.url).origin!==self.location.origin)return;if(event.request.mode==="navigate")event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(r=>r||caches.match("/offline"))));});
