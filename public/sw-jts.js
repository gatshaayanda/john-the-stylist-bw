importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-app-compat.js","https://www.gstatic.com/firebasejs/11.9.0/firebase-messaging-compat.js");

firebase.initializeApp({apiKey:"AIzaSyD5_rgSQq1-ZlBH6GlkAmX88MvTId8bNog",authDomain:"stylist-36204.firebaseapp.com",projectId:"stylist-36204",storageBucket:"stylist-36204.firebasestorage.app",messagingSenderId:"622468889009",appId:"1:622468889009:web:0579e49d766c6e81a1a590",measurementId:"G-5LDNFHCC53"});

const CACHE_VERSION="jts-shell-v5";
const STATIC_LIMIT=120;
const PAGE_LIMIT=20;
const SHELL=["/","/order","/account","/offline","/manifest.webmanifest","/icon-192.png","/icon-512.png"];

firebase.messaging().onBackgroundMessage((payload)=>{
 const title=payload.notification?.title||payload.data?.title||"JTS Styles";
 const body=payload.notification?.body||payload.data?.body||"You have an appointment update.";
 const link=payload.fcmOptions?.link||payload.data?.link||"/account";
 self.registration.showNotification(title,{body,icon:"/icon-192.png",badge:"/icon-192.png",tag:payload.data?.appointmentId?"jts-appointment-"+payload.data.appointmentId:"jts-notification",data:{link}});
});

self.addEventListener("notificationclick",(event)=>{
 event.notification.close();
 const link=event.notification.data?.link||"/account";
 event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
  for(const client of list){if("focus" in client){if("navigate" in client)client.navigate(link);return client.focus();}}
  return clients.openWindow(link);
 }));
});

async function precache(){
 const cache=await caches.open(CACHE_VERSION);
 for(const path of SHELL){try{const response=await fetch(new Request(path,{cache:"reload"}));if(response.ok)await cache.put(path,response.clone())}catch{}}
 const discovered=new Set();
 for(const path of ["/","/order","/account","/offline"]){
  const response=await cache.match(path);if(!response)continue;
  const html=await response.text();
  for(const match of html.matchAll(/(?:src|href)=["'](\/\_next\/static\/[^"']+)["']/g))discovered.add(match[1]);
 }
 await Promise.all([...discovered].map(async path=>{try{const response=await fetch(new Request(path,{cache:"reload"}));if(response.ok)await cache.put(path,response.clone())}catch{}}));
}
self.addEventListener("install",event=>event.waitUntil(precache().then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>(key.startsWith("boemo-shell-")||key.startsWith("jts-shell-"))&&key!==CACHE_VERSION).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
self.addEventListener("message",event=>{if(event.data?.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET"||new URL(request.url).origin!==self.location.origin)return;
 const url=new URL(request.url);
 if(url.pathname.startsWith("/api/"))return;
 const isNavigation=request.mode==="navigate"||request.headers.get("accept")?.includes("text/html");
 const isStatic=url.pathname.startsWith("/_next/static/")||url.pathname==="/manifest.webmanifest"||/^\/.*\.(?:css|js|woff2?|ttf|otf|png|jpe?g|webp|svg|ico|avif)$/i.test(url.pathname);
 if(isStatic){
  event.respondWith((async()=>{const cached=await caches.match(request);if(cached)return cached;try{const response=await fetch(request);if(response.ok)void caches.open(CACHE_VERSION).then(cache=>cache.put(request,response.clone()));return response}catch{return Response.error()}})());
  return;
 }
 if(isNavigation){
  const isPrivate=url.pathname.startsWith("/account")||url.pathname.startsWith("/orders/")||url.pathname.startsWith("/admin");
  event.respondWith(fetch(request).then(async response=>{
   if(response.ok&&!isPrivate){const cache=await caches.open(CACHE_VERSION);await cache.put(request,response.clone());const keys=await cache.keys();if(keys.length>PAGE_LIMIT+STATIC_LIMIT){await Promise.all(keys.slice(0,keys.length-(PAGE_LIMIT+STATIC_LIMIT)).map(key=>cache.delete(key)))}}
   return response;
  }).catch(async()=>await caches.match(request)||await caches.match("/offline")||Response.error()));
 }
});