"use client";

import {useEffect,useState} from "react";

export default function JtsInstallButton(){
 const[available,setAvailable]=useState(false);
 const[installed,setInstalled]=useState(false);
 const[ios,setIos]=useState(false);
 const[busy,setBusy]=useState(false);

 useEffect(()=>{
  const standalone=window.matchMedia("(display-mode: standalone)").matches||("standalone" in navigator&&Boolean((navigator as Navigator&{standalone?:boolean}).standalone));
  setInstalled(standalone);

  const availableEvent=()=>setAvailable(Boolean(window.jtsInstallPrompt)&&!standalone);
  const consumed=()=>setAvailable(false);
  const complete=()=>{setAvailable(false);setInstalled(true);setIos(false)};

  window.addEventListener("jts-install-available",availableEvent);
  window.addEventListener("jts-install-consumed",consumed);
  window.addEventListener("jts-install-complete",complete);

  const isIos=/iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari=/safari/i.test(navigator.userAgent)&&!/crios|fxios|edgios|chrome|android/i.test(navigator.userAgent);
  if(isIos&&isSafari&&!standalone)setIos(true);
  availableEvent();

  return()=>{
   window.removeEventListener("jts-install-available",availableEvent);
   window.removeEventListener("jts-install-consumed",consumed);
   window.removeEventListener("jts-install-complete",complete);
  };
 },[]);

 async function install(){
  if(!window.jtsInstallApp||busy)return;
  setBusy(true);
  const outcome=await window.jtsInstallApp();
  setBusy(false);
  if(outcome==="accepted")setInstalled(true);
 }

 if(installed||(!available&&!ios))return null;

 if(ios&&!available){
  return <button type="button" className="jtsInstallButton" onClick={()=>setIos(false)} aria-label="How to install JTS Styles on iPhone or iPad"><span aria-hidden="true">⌂</span> Install app</button>;
 }

 return <button type="button" className="jtsInstallButton" onClick={()=>void install()} disabled={busy} aria-label="Install JTS Styles">{busy?"Installing…":<><span aria-hidden="true">⌂</span> Install app</>}</button>;
}
