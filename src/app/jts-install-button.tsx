"use client";

import {useEffect,useState} from "react";
import {createPortal} from "react-dom";

export default function JtsInstallButton(){
 const [headerTarget,setHeaderTarget]=useState<HTMLElement|null>(null);
 useEffect(()=>{
  setHeaderTarget(document.querySelector<HTMLElement>(".jtsEditHeaderActions"));
 },[]);
 if(!headerTarget)return null;
 return createPortal(
  <button
   type="button"
   className="jtsInstallButton"
   onClick={()=>window.dispatchEvent(new Event("jts-open-install"))}
   aria-label="Install JTS Styles"
  >
   <img src="/jts-logo.svg" alt="" aria-hidden="true" /> Install app
  </button>,
  headerTarget
 );
}
