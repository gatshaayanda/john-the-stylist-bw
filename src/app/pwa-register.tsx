"use client";

import {useEffect,useRef,useState} from "react";
import {getIdToken,onAuthStateChanged} from "firebase/auth";
import {auth} from "@/lib/firebase/client";

type InstallPromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:"accepted"|"dismissed";platform:string}>};

export default function PwaRegister(){
 const[offline,setOffline]=useState(false),[reconnecting,setReconnecting]=useState(false),[installPrompt,setInstallPrompt]=useState<InstallPromptEvent|null>(null),[updateReady,setUpdateReady]=useState<ServiceWorker|null>(null),[iosInstall,setIosInstall]=useState(false),[installed,setInstalled]=useState(false);
 const reloadForUpdate=useRef(false);

 useEffect(()=>{
  const standalone=window.matchMedia("(display-mode: standalone)").matches||("standalone" in navigator&&Boolean((navigator as Navigator&{standalone?:boolean}).standalone));
  setInstalled(standalone);setOffline(!navigator.onLine);

  const retryPendingBookingNotifications=async()=>{
   const user=auth.currentUser;if(!user)return;
   const idToken=await getIdToken(user).catch(()=>null);if(!idToken)return;
   const pendingKeys=Object.keys(localStorage).filter(key=>key.startsWith("jts-pending-booking-notification-"));
   for(const key of pendingKeys){
    const bookingId=key.replace("jts-pending-booking-notification-","");
    try{
     const response=await fetch("/api/notifications/order-created",{method:"POST",headers:{Authorization:"Bearer "+idToken,"Content-Type":"application/json"},body:JSON.stringify({bookingId})});
     if(response.ok)localStorage.removeItem(key);
    }catch{}
   }
  };

  const online=()=>{setOffline(false);setReconnecting(true);window.setTimeout(()=>{setReconnecting(false);void retryPendingBookingNotifications()},1200)};
  const off=()=>{setReconnecting(false);setOffline(true)};
  const install=(event:Event)=>{event.preventDefault();setInstallPrompt(event as InstallPromptEvent)};
  const appinstalled=()=>{setInstalled(true);setInstallPrompt(null);setIosInstall(false)};
  window.addEventListener("online",online);window.addEventListener("offline",off);window.addEventListener("beforeinstallprompt",install);window.addEventListener("appinstalled",appinstalled);

  const isIos=/iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari=/safari/i.test(navigator.userAgent)&&!/crios|fxios|edgios|chrome|android/i.test(navigator.userAgent);
  if(isIos&&isSafari&&!standalone)setIosInstall(true);

  let registration:ServiceWorkerRegistration|null=null;
  const inspect=()=>{if(registration?.waiting&&navigator.serviceWorker.controller)setUpdateReady(registration.waiting)};
  const register=async()=>{
   if(!("serviceWorker" in navigator))return;
   try{
    registration=await navigator.serviceWorker.register("/sw-jts.js",{scope:"/"});
    inspect();
    registration.addEventListener("updatefound",()=>{
     const worker=registration?.installing;if(!worker)return;
     worker.addEventListener("statechange",inspect);
    });
    await registration.update();inspect();
   }catch{}
  };
  void register();void retryPendingBookingNotifications();
  const stopPendingAuth=onAuthStateChanged(auth,()=>{void retryPendingBookingNotifications()});
  const controllerChange=()=>{if(reloadForUpdate.current)window.location.reload()};
  navigator.serviceWorker?.addEventListener("controllerchange",controllerChange);
  return()=>{window.removeEventListener("online",online);window.removeEventListener("offline",off);window.removeEventListener("beforeinstallprompt",install);window.removeEventListener("appinstalled",appinstalled);navigator.serviceWorker?.removeEventListener("controllerchange",controllerChange);stopPendingAuth()};
 },[]);

 async function install(){if(!installPrompt)return;await installPrompt.prompt();await installPrompt.userChoice;setInstallPrompt(null)}
 function applyUpdate(){if(!updateReady)return;reloadForUpdate.current=true;updateReady.postMessage({type:"SKIP_WAITING"})}

 return <>
  {offline&&<div className="offlineBanner" role="status" aria-live="polite"><span aria-hidden="true">⚡</span> Offline · JTS Styles is still available. Booking requests can be saved on this device and sync when you reconnect.</div>}
  {!offline&&reconnecting&&<div className="offlineBanner reconnectingBanner" role="status" aria-live="polite"><span aria-hidden="true">↻</span> Reconnected · JTS Styles is syncing your saved booking data.</div>}
  {installPrompt&&!installed&&<button className="pwaInstall" type="button" onClick={()=>void install()}><span aria-hidden="true">✦</span> Install JTS Styles</button>}
  {iosInstall&&!installed&&!installPrompt&&<div className="pwaIosInstall" role="dialog" aria-label="Install JTS Styles on iPhone or iPad"><strong>Install JTS Styles</strong><span>In Safari, tap Share, then <b>Add to Home Screen</b>.</span><button type="button" onClick={()=>setIosInstall(false)}>Got it</button></div>}
  {updateReady&&<div className="pwaUpdate" role="status" aria-live="polite"><div><strong>JTS Styles update ready</strong><span>Refresh when you are ready.</span></div><button type="button" className="button buttonPrimary" onClick={applyUpdate}>Refresh</button></div>}
 </>;
}
