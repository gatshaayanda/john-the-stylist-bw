"use client";

import {useEffect,useState} from "react";

export default function JtsInstallButton(){
 const[available,setAvailable]=useState(false);
 const[installed,setInstalled]=useState(false);
 const[mobile,setMobile]=useState(false);
 const[ios,setIos]=useState(false);
 const[busy,setBusy]=useState(false);
 const[showHelp,setShowHelp]=useState(false);

 useEffect(()=>{
  const standalone=window.matchMedia("(display-mode: standalone)").matches||("standalone" in navigator&&Boolean((navigator as Navigator&{standalone?:boolean}).standalone));
  setInstalled(standalone);

  const ua=navigator.userAgent;
  const isIos=/iphone|ipad|ipod/i.test(ua);
  const isMobile=/android|iphone|ipad|ipod|mobile/i.test(ua);
  setMobile(isMobile);
  setIos(isIos&&!standalone);

  const availableEvent=()=>setAvailable(Boolean(window.jtsInstallPrompt)&&!standalone);
  const consumed=()=>setAvailable(false);
  const complete=()=>{setAvailable(false);setInstalled(true);setIos(false);setShowHelp(false)};

  window.addEventListener("jts-install-available",availableEvent);
  window.addEventListener("jts-install-consumed",consumed);
  window.addEventListener("jts-install-complete",complete);
  availableEvent();

  return()=>{
   window.removeEventListener("jts-install-available",availableEvent);
   window.removeEventListener("jts-install-consumed",consumed);
   window.removeEventListener("jts-install-complete",complete);
  };
 },[]);

 async function install(){
  if(busy)return;
  if(window.jtsInstallPrompt&&window.jtsInstallApp){
   setBusy(true);
   const outcome=await window.jtsInstallApp();
   setBusy(false);
   if(outcome==="accepted")setInstalled(true);
   return;
  }
  setShowHelp(true);
 }

 if(installed||(!mobile&&!available))return null;

 return <div className="jtsInstallWrap">
  <button type="button" className="jtsInstallButton" onClick={()=>void install()} disabled={busy} aria-label="Install JTS Styles">
   {busy?"Installing…":<><span aria-hidden="true">⌂</span> Install app</>}
  </button>
  {showHelp&&<div className="pwaInstallHelp" role="dialog" aria-label="Install JTS Styles">
   <strong>Install JTS Styles</strong>
   {ios
    ? <span>Tap your browser&apos;s <b>Share</b> button, then choose <b>Add to Home Screen</b>. If that option is not shown, open this page in Safari.</span>
    : <span>Open your browser menu <b>⋮</b> and choose <b>Install app</b> or <b>Add to Home screen</b>. If you see an install option in the address bar, you can use that too.</span>}
   <button type="button" onClick={()=>setShowHelp(false)}>Got it</button>
  </div>}
 </div>;
}
