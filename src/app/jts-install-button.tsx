"use client";

declare global {
 interface Window {
  jtsInstallApp?:()=>Promise<"accepted"|"dismissed"|"unavailable">;
 }
}

export default function JtsInstallButton(){
 function installFromClick(){
  // Invoke the retained beforeinstallprompt controller in this exact user gesture.
  // The controller calls prompt() before its first await, preserving browser activation.
  const install=window.jtsInstallApp;
  if(!install){window.dispatchEvent(new Event("jts-open-install"));return}
  void install().then((outcome)=>{
   if(outcome==="unavailable")window.dispatchEvent(new Event("jts-open-install"));
  }).catch(()=>window.dispatchEvent(new Event("jts-open-install")));
 }
 return <button
  type="button"
  className="jtsInstallButton"
  onClick={installFromClick}
  aria-label="Install JTS Styles"
 >
  <img src="/jts-logo.svg" alt="" aria-hidden="true" /> Install JTS Styles <span aria-hidden="true">→</span>
 </button>;
}
