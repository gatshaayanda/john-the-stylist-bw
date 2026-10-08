"use client";

import {useEffect,useRef,useState} from "react";
import {getIdToken,onAuthStateChanged} from "firebase/auth";
import {auth} from "@/lib/firebase/client";

type InstallPromptEvent=Event&{prompt:()=>void|Promise<void>;userChoice:Promise<{outcome:"accepted"|"dismissed";platform:string}>};

declare global {
 interface Window {
  jtsInstallPrompt?:InstallPromptEvent|null;
  jtsInstallApp?:()=>Promise<"accepted"|"dismissed"|"unavailable">;
 }
}

export default function PwaRegister(){
 const[offline,setOffline]=useState(false),[reconnecting,setReconnecting]=useState(false),[updateReady,setUpdateReady]=useState<ServiceWorker|null>(null);
 const reloadForUpdate=useRef(false);

 useEffect(()=>{
  setOffline(!navigator.onLine);

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

  const install=(event:Event)=>{
   event.preventDefault();
   const promptEvent=event as InstallPromptEvent;
   window.jtsInstallPrompt=promptEvent;
   window.dispatchEvent(new Event("jts-install-available"));
  };

  const appinstalled=()=>{
   window.jtsInstallPrompt=null;
   window.dispatchEvent(new Event("jts-install-complete"));
  };

  window.jtsInstallApp=async()=>{
   const promptEvent=window.jtsInstallPrompt;
   if(!promptEvent)return "unavailable";
   try{
    promptEvent.prompt();
    window.jtsInstallPrompt=null;
    window.dispatchEvent(new Event("jts-install-consumed"));
    const choice=await promptEvent.userChoice;
    return choice.outcome;
   }catch{
    window.jtsInstallPrompt=promptEvent;
    window.dispatchEvent(new Event("jts-install-available"));
    return "unavailable";
   }
  };

  window.addEventListener("online",online);
  window.addEventListener("offline",off);
  window.addEventListener("beforeinstallprompt",install);
  window.addEventListener("appinstalled",appinstalled);

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

  return()=>{
   window.removeEventListener("online",online);
   window.removeEventListener("offline",off);
   window.removeEventListener("beforeinstallprompt",install);
   window.removeEventListener("appinstalled",appinstalled);
   if(window.jtsInstallApp)delete window.jtsInstallApp;
   if(window.jtsInstallPrompt)window.jtsInstallPrompt=null;
   navigator.serviceWorker?.removeEventListener("controllerchange",controllerChange);
   stopPendingAuth();
  };
 },[]);

 function applyUpdate(){if(!updateReady)return;reloadForUpdate.current=true;updateReady.postMessage({type:"SKIP_WAITING"})}

 return <>
  {offline&&<div className="offlineBanner" role="status" aria-live="polite"><span aria-hidden="true">⚡</span> Offline · JTS Styles is still available. Booking requests can be saved on this device and sync when you reconnect.</div>}
  {!offline&&reconnecting&&<div className="offlineBanner reconnectingBanner" role="status" aria-live="polite"><span aria-hidden="true">↻</span> Reconnected · JTS Styles is syncing your saved booking data.</div>}
  {updateReady&&<div className="pwaUpdate" role="status" aria-live="polite"><div><strong>JTS Styles update ready</strong><span>Refresh when you are ready.</span></div><button type="button" className="button buttonPrimary" onClick={applyUpdate}>Refresh</button></div>}
 </>;
}
