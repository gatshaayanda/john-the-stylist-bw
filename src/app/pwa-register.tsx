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
 const[installReady,setInstallReady]=useState(false),[installed,setInstalled]=useState(false),[installOpen,setInstallOpen]=useState(false),[installHelp,setInstallHelp]=useState(false),[isIOS,setIsIOS]=useState(false),[isAndroid,setIsAndroid]=useState(false);
 const reloadForUpdate=useRef(false);

 useEffect(()=>{
  setOffline(!navigator.onLine);
  const standalone=window.matchMedia("(display-mode: standalone)").matches||("standalone" in navigator&&Boolean((navigator as Navigator&{standalone?:boolean}).standalone));
  const ua=navigator.userAgent||"";
  setInstalled(standalone);setIsIOS(/iPad|iPhone|iPod/i.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1));setIsAndroid(/Android/i.test(ua));setInstallReady(true);
  const openInstall=()=>{setInstallHelp(false);setInstallOpen(true)};
  window.addEventListener("jts-open-install",openInstall);

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

  const appinstalled=()=>{
   window.jtsInstallPrompt=null;setInstalled(true);setInstallOpen(false);setInstallHelp(false);
   window.dispatchEvent(new Event("jts-install-complete"));
  };

  window.jtsInstallApp=async()=>{
   const promptEvent=window.jtsInstallPrompt;
   if(!promptEvent)return "unavailable";
   try{
    // Invoke the browser prompt synchronously in the click's user-activation
    // window, then await its result before reading the user's choice.
    const promptResult=promptEvent.prompt();
    window.jtsInstallPrompt=null;
    window.dispatchEvent(new Event("jts-install-consumed"));
    await promptResult;
    const choice=await promptEvent.userChoice;
    return choice.outcome;
   }catch{
    // beforeinstallprompt is one-shot: never keep a stale event after an error.
    window.jtsInstallPrompt=null;
    window.dispatchEvent(new Event("jts-install-consumed"));
    return "unavailable";
   }
  };

  window.addEventListener("online",online);
  window.addEventListener("offline",off);
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
   window.removeEventListener("appinstalled",appinstalled);
   window.removeEventListener("jts-open-install",openInstall);
   if(window.jtsInstallApp)delete window.jtsInstallApp;
   if(window.jtsInstallPrompt)window.jtsInstallPrompt=null;
   navigator.serviceWorker?.removeEventListener("controllerchange",controllerChange);
   stopPendingAuth();
  };
 },[]);

 async function startInstall(){
  const runInstall=window.jtsInstallApp;
  if(!runInstall){setInstallHelp(true);return}
  const outcome=await runInstall();
  if(outcome==="accepted"){setInstalled(true);setInstallOpen(false);setInstallHelp(false)}
  else if(outcome==="unavailable"){setInstallHelp(true)}
  else {setInstallOpen(false);setInstallHelp(false)}
 }
 function openInstallEntry(){
  if(window.jtsInstallPrompt&&window.jtsInstallApp){void startInstall();return}
  setInstallHelp(false);setInstallOpen(true);
 }
 function applyUpdate(){if(!updateReady)return;reloadForUpdate.current=true;updateReady.postMessage({type:"SKIP_WAITING"})}

 return <>
  {installReady&&!installed&&<button type="button" className="jtsPersistentInstall" onClick={openInstallEntry}><img src="/jts-logo.svg" alt="" aria-hidden="true"/> Install JTS Styles <span aria-hidden="true">↓</span></button>}
  {installOpen&&!installed&&<div className="jtsInstallPanel" role="presentation"><section className="jtsInstallPanelCard" role="dialog" aria-modal="false" aria-labelledby="jts-install-panel-title" aria-describedby="jts-install-panel-message"><div className="jtsInstallPanelTop"><img src="/jts-logo.svg" alt="" aria-hidden="true"/><span>JTS STYLES · GABORONE</span><button type="button" aria-label="Close install panel" onClick={()=>{setInstallOpen(false);setInstallHelp(false)}}>×</button></div><span className="jtsInstallPanelKicker">YOUR STYLING APP</span><h2 id="jts-install-panel-title">Your next look.<br/><em>One tap away.</em></h2><p id="jts-install-panel-message">Add JTS Styles to your home screen for a direct shortcut to appointments, booking history and John’s updates.</p>{installHelp?<div className="jtsInstallPanelHelp" role="status" aria-live="polite">{isIOS?<><strong>Add JTS Styles from Safari</strong><p>Open this page in <b>Safari</b>, tap <b>Share</b>, choose <b>Add to Home Screen</b>, then tap <b>Add</b>.</p></>:isAndroid?<><strong>Add JTS Styles from Chrome</strong><p>In <b>Chrome</b>, tap the <b>⋮ menu</b> and choose <b>Install app</b> or <b>Add to Home screen</b>. The wording depends on your browser version.</p></>:<><strong>Install JTS Styles from your browser</strong><p>In <b>Chrome or Edge</b>, open the browser menu and choose <b>Install JTS Styles</b> or <b>Install page as app</b>, if offered.</p></>}<button type="button" className="jtsInstallPanelPrimary" onClick={()=>{setInstallOpen(false);setInstallHelp(false)}}>Got it</button></div>:<><div className="jtsInstallPanelBenefits"><span><b>01</b><strong>Quick access</strong><small>Open JTS from your home screen.</small></span><span><b>02</b><strong>Your appointments</strong><small>Return to booking and appointment history.</small></span><span><b>03</b><strong>Useful updates</strong><small>Keep up with your appointment details.</small></span></div><button type="button" className="jtsInstallPanelPrimary" onClick={()=>void startInstall()}>Install JTS Styles <span aria-hidden="true">→</span></button><button type="button" className="jtsInstallPanelSecondary" onClick={()=>setInstallOpen(false)}>Not now</button></>}<p className="jtsInstallPanelFootnote">Your browser handles the installation securely.</p></section></div>}
  {offline&&<div className="offlineBanner" role="status" aria-live="polite"><span aria-hidden="true">⚡</span> Offline · JTS Styles is still available. Booking requests can be saved on this device and sync when you reconnect.</div>}
  {!offline&&reconnecting&&<div className="offlineBanner reconnectingBanner" role="status" aria-live="polite"><span aria-hidden="true">↻</span> Reconnected · JTS Styles is syncing your saved booking data.</div>}
  {updateReady&&<div className="pwaUpdate" role="status" aria-live="polite"><div><strong>JTS Styles update ready</strong><span>Refresh when you are ready.</span></div><button type="button" className="button buttonPrimary" onClick={applyUpdate}>Refresh</button></div>}
 </>;
}
