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
 if(/; wv\)|\bwv\b|\bwebview\b|\bline\//.test(value))return "embedded";
 return "browser";
}

export default function JtsInstallButton(){
 const[available,setAvailable]=useState(false);
 const[installed,setInstalled]=useState(false);
 const[mobile,setMobile]=useState(false);
 const[ios,setIos]=useState(false);
 const[android,setAndroid]=useState(false);
 const[busy,setBusy]=useState(false);
 const[showHelp,setShowHelp]=useState(false);
 const[browserContext,setBrowserContext]=useState<BrowserContext>("browser");

 useEffect(()=>{
  const standalone=window.matchMedia("(display-mode: standalone)").matches||("standalone" in navigator&&Boolean((navigator as Navigator&{standalone?:boolean}).standalone));
  const ua=navigator.userAgent;
  setInstalled(standalone);
  setMobile(/android|iphone|ipad|ipod|mobile/i.test(ua));
  setIos(/iphone|ipad|ipod/i.test(ua)&&!standalone);
  setAndroid(/android/i.test(ua));
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
  const prompt=window.jtsInstallPrompt;
  const runInstall=window.jtsInstallApp;
  if(prompt&&runInstall){
   setBusy(true);
   try{
    const outcome=await runInstall();
    if(outcome==="accepted")setInstalled(true);
    if(outcome==="unavailable")setShowHelp(true);
   }catch{
    setShowHelp(true);
   }finally{
    setBusy(false);
   }
   return;
  }
  setShowHelp(true);
 }

 if(installed||(!mobile&&!available))return null;
 const embedded=browserContext!=="browser";
 const contextNames:Record<Exclude<BrowserContext,"embedded"|"browser">,string>={whatsapp:"WhatsApp",instagram:"Instagram",facebook:"Facebook",messenger:"Messenger",linkedin:"LinkedIn"};
 const contextName=browserContext in contextNames?contextNames[browserContext as keyof typeof contextNames]:"this in-app browser";
 const buttonLabel=available?"Install JTS Styles":embedded?"Open in browser to install":"Install JTS Styles";
 const fallbackTitle=ios?"Add JTS Styles to your Home Screen":android?"Install JTS Styles in Chrome":"Install JTS Styles in Chrome or Edge";
 return <div className="jtsInstallWrap">
  <button type="button" className="jtsInstallButton" onClick={()=>void install()} disabled={busy} aria-label={buttonLabel}>
   {busy?"Opening install…":<><span aria-hidden="true">⌂</span> {buttonLabel}</>}
  </button>
  {showHelp&&<div className="pwaInstallHelp" role="dialog" aria-label="Install JTS Styles" aria-live="polite">
   <strong>{embedded?"Open JTS Styles in your browser":ios?"Add JTS Styles to your Home Screen":fallbackTitle}</strong>
   {embedded
    ? <span>You opened this link inside <b>{contextName}</b>. Use its menu and choose <b>Open in browser</b> first. The app works here, but installation belongs in your normal browser.</span>
    : ios
      ? <span>In <b>Safari</b>, tap <b>Share</b>, choose <b>Add to Home Screen</b>, then tap <b>Add</b>. This browser did not provide a native install prompt.</span>
      : android
       ? <span>The native install prompt is unavailable right now. In <b>Chrome</b>, open the <b>⋮</b> menu and choose <b>Install app</b> or <b>Add to Home screen</b>. If that option is missing, check that the page is online and the app has finished loading.</span>
       : <span>The native install prompt is unavailable right now. In <b>Chrome or Edge</b>, open the browser menu and choose <b>Install JTS Styles</b> or <b>Apps → Install this site as an app</b> if offered.</span>}
   <button type="button" onClick={()=>setShowHelp(false)}>Got it</button>
  </div>}
 </div>;
}
