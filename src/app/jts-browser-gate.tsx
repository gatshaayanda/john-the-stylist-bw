"use client";

import {useEffect,useState} from "react";

type HandoffContext="whatsapp"|"instagram"|"facebook"|"messenger"|"linkedin"|"embedded"|"browser";
function detectContext(ua:string):HandoffContext{
 const value=ua.toLowerCase();
 if(value.includes("whatsapp"))return "whatsapp";
 if(value.includes("instagram"))return "instagram";
 if(value.includes("fban")||value.includes("fbav"))return "facebook";
 if(value.includes("messenger"))return "messenger";
 if(value.includes("linkedinapp"))return "linkedin";
 if(/; wv\)|\bwv\b|\bwebview\b|\bline\//.test(value))return "embedded";
 return "browser";
}
function isStandalone(){return window.matchMedia("(display-mode: standalone)").matches||("standalone" in navigator&&Boolean((navigator as Navigator&{standalone?:boolean}).standalone))}
export default function JtsBrowserGate(){
 const[context,setContext]=useState<HandoffContext>("browser");
 const[ready,setReady]=useState(false);
 const[showFallback,setShowFallback]=useState(false);
 useEffect(()=>{setContext(detectContext(navigator.userAgent));setReady(true)},[]);
 if(!ready||context==="browser"||isStandalone())return null;
 const currentUrl=typeof window!=="undefined"?window.location.href:"https://john-the-stylist-bw.vercel.app/";
 const isAndroid=/android/i.test(typeof navigator!=="undefined"?navigator.userAgent:"");
 const isIos=/iphone|ipad|ipod/i.test(typeof navigator!=="undefined"?navigator.userAgent:"");
 const chromeIntent=isAndroid?currentUrl.replace(/^https?:\/\//,"intent://")+"#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url="+encodeURIComponent(currentUrl)+";end":currentUrl;
 const names:Record<HandoffContext,string>={whatsapp:"WhatsApp",instagram:"Instagram",facebook:"Facebook",messenger:"Messenger",linkedin:"LinkedIn",embedded:"this in-app browser",browser:"your browser"};
 return <div className="jtsBrowserGate" role="dialog" aria-modal="true" aria-labelledby="jtsBrowserGateTitle">
  <section className="jtsBrowserGateCard">
   <div className="jtsBrowserGateBrand"><span>JTS</span><div><b>JTS STYLES</b><small>JOHN THE STYLIST BW</small></div></div>
   <span className="jtsBrowserGateEyebrow">ONE QUICK STEP</span>
   <h1 id="jtsBrowserGateTitle">Open JTS in your browser.</h1>
   <p>You opened this page inside {names[context]}. For the best experience and app installation, continue in your normal browser. We’ll keep the page you wanted to open.</p>
   <a className="jtsBrowserGatePrimary" href={chromeIntent} target={isAndroid?"_self":"_blank"} rel="noopener noreferrer">{isAndroid?"OPEN IN CHROME":"OPEN IN BROWSER"} <span aria-hidden="true">↗</span></a>
   <p className="jtsBrowserGateHint">{isIos?"If this does not open Safari, use the menu in this app and choose Open in Browser.":"If Chrome does not open, use the ⋮ menu and choose Open in browser."}</p>
   <button type="button" className="jtsBrowserGateFallbackToggle" onClick={()=>setShowFallback(value=>!value)}>{showFallback?"Hide help":"Browser did not open?"}</button>
   {showFallback&&<div className="jtsBrowserGateFallback"><p>Open the {context==="whatsapp"?"WhatsApp": "app"} menu and choose <b>Open in browser</b>. If that option is unavailable, copy this page’s link and paste it into Chrome or Safari.</p><button type="button" onClick={()=>void navigator.clipboard?.writeText(currentUrl).then(()=>setShowFallback(false)).catch(()=>setShowFallback(true))}>Copy this page link</button></div>}
  </section>
 </div>;
}
