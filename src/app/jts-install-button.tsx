"use client";

import {useEffect,useState} from "react";

type BrowserContext="whatsapp"|"instagram"|"facebook"|"messenger"|"linkedin"|"embedded"|"browser";

function detectBrowserContext(ua:string):BrowserContext{
 const value=ua.toLowerCase();
 if(value.includes("whatsapp"))return "whatsapp";
 if(value.includes("instagram"))return "instagram";
 if(value.includes("fban")||value.includes("fbav"))return "facebook";
 if(value.includes("messenger"))return "messenger";
 if(value.includes("linkedinapp"))return "linkedin";
 if(/; wv\)|\bwv\b|\bwebview\b/.test(value))return "embedded";
 return "browser";
}

export default function JtsInstallButton(){
 const[available,setAvailable]=useState(false);
 const[installed,setInstalled]=useState(false);
 const[mobile,setMobile]=useState(false);
 const[ios,setIos]=useState(false);
 const[busy,setBusy]=useState(false);
 const[showHelp,setShowHelp]=useState(false);
 const[browserContext,setBrowserContext]=useState<BrowserContext>("browser");

 useEffect(()=>{
  const standalone=window.matchMedia("(display-mode: standalone)").matches||("standalone" in navigator&&Boolean((navigator as Navigator&{standalone?:boolean}).standalone));
  setInstalled(standalone);
  const ua=navigator.userAgent;
  const isIos=/iphone|ipad|ipod/i.test(ua);
  setMobile(/android|iphone|ipad|ipod|mobile/i.test(ua));
  setIos(isIos&&!standalone);
  setBrowserContext(detectBrowserContext(ua));

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

 if(installed)return null;

 const embedded=browserContext!=="browser";
 const contextNames:Record<Exclude<BrowserContext,"embedded"|"browser">,string>={whatsapp:"WhatsApp",instagram:"Instagram",facebook:"Facebook",messenger:"Messenger",linkedin:"LinkedIn"};
 const contextName=browserContext in contextNames ? contextNames[browserContext as keyof typeof contextNames] : "this in-app browser";
 const buttonLabel=available?"Install app":embedded?"Open in browser to install":ios?"How to install":"Install app";

 return <div className="jtsInstallWrap">
  <button type="button" className="jtsInstallButton" onClick={()=>void install()} disabled={busy} aria-label={buttonLabel}>
   {busy?"Installing…":<><span aria-hidden="true">⌂</span> {buttonLabel}</>}
  </button>
  {showHelp&&<div className="pwaInstallHelp" role="dialog" aria-label="Install JTS Styles">
   <strong>{embedded?"Open JTS Styles in your browser":ios?"Add JTS Styles to your Home Screen":available?"Install JTS Styles":"Install JTS Styles"}</strong>
   {embedded
    ? <span>You opened this link inside <b>{contextName}</b>. JTS Styles works here, but this browser may not expose the native install prompt. Use <b>Open in browser</b> from the app&apos;s menu, then install JTS Styles from Chrome, Edge or Safari.</span>
    : ios
      ? <span>In Safari, tap <b>Share</b>, choose <b>Add to Home Screen</b>, then tap <b>Add</b>. If you are already in Safari, you can use that menu now.</span>
      : available
        ? <span>JTS Styles can install directly from this browser. Choose <b>Install</b> in the browser prompt.</span>
        : <span>Installation is not available through this page&apos;s native prompt right now. Open the browser menu <b>⋮</b> and choose <b>Install app</b> or <b>Add to Home screen</b>.</span>}
   <button type="button" onClick={()=>setShowHelp(false)}>Got it</button>
  </div>}
 </div>;
}
