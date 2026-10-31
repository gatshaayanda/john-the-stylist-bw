"use client";

import Link from "next/link";
import {doc,onSnapshot} from "firebase/firestore";
import {useEffect,useState} from "react";
import {db} from "@/lib/firebase/client";
import {DEFAULT_PUBLIC_SERVICES,normalizePublicServices,type PublicService} from "@/lib/jts/public-services";

export default function PublicServiceCards(){
 const [services,setServices]=useState<PublicService[]>(DEFAULT_PUBLIC_SERVICES);
 const [showPriceList,setShowPriceList]=useState(false);
 useEffect(()=>{
  const stop=onSnapshot(doc(db,"businessSettings","publicServices"),snapshot=>{
   if(snapshot.exists())setServices(normalizePublicServices(snapshot.data().services));
  },()=>{});
  return()=>stop();
 },[]);
 useEffect(()=>{
  if(!showPriceList)return;
  const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setShowPriceList(false)};
  window.addEventListener("keydown",close);
  return()=>window.removeEventListener("keydown",close);
 },[showPriceList]);
 const groups=Array.from(new Set(DEFAULT_PUBLIC_SERVICES.map(service=>service.tag)));
 return <>
  <div className="jtsEditServiceGrid">
   {services.map((service,index)=><article className="jtsEditServiceCard" key={service.id}>
    <div className="jtsEditServiceCardTop"><span>{service.tag}</span><span>{String(index+1).padStart(2,"0")}</span></div>
    {service.media?.length ? <div className="jtsServiceMediaGallery">{service.media.slice(0,3).map((media,mediaIndex)=><div className="jtsServiceMediaItem" key={media.url}>{media.type === "video" ? <video src={media.url} controls playsInline preload="metadata" aria-label={service.name+" video "+(mediaIndex+1)} /> : <img src={media.url} alt={media.alt || service.name+" finished look"} loading="lazy" />}</div>)}</div> : <div className={"jtsEditServiceGlyph jtsEditServiceGlyph"+(index%4)}><span>{["J","S","C","↗"][index%4]}</span></div>}
    <h3>{service.name}</h3><p>{service.note}</p>
    <div className="jtsEditServiceFoot"><strong>{service.display}</strong><Link href={"/order?service="+encodeURIComponent(service.id)}>Choose service <span>↗</span></Link></div>
   </article>)}
   {services.length===0&&<div className="jtsJourneyEmpty">The service list is being updated. Contact John to ask about your look.</div>}
  </div>
  <div className="jtsFullPriceListLink"><button type="button" onClick={()=>setShowPriceList(true)}>View full price list <span>↗</span></button></div>
  {showPriceList&&<div className="jtsPriceModalBackdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setShowPriceList(false)}}>
   <section className="jtsPriceModal" role="dialog" aria-modal="true" aria-labelledby="jts-price-modal-title" aria-describedby="jts-price-modal-description">
    <div className="jtsPriceModalHead"><div><span className="jtsEditEyebrow">JTS STYLES · SERVICE MENU</span><h2 id="jts-price-modal-title">The full price list.</h2><p id="jts-price-modal-description">All listed services and prices in Botswana pula.</p></div><button type="button" className="jtsPriceModalClose" onClick={()=>setShowPriceList(false)} aria-label="Close full price list">×</button></div>
    <div className="jtsPriceModalContent">{groups.map(group=><section className="jtsPriceGroup" key={group}><h3>{group}</h3><ul>{DEFAULT_PUBLIC_SERVICES.filter(service=>service.tag===group).map(service=><li key={service.id}><span>{service.name}</span><strong>{service.display}</strong></li>)}</ul></section>)}</div>
    <div className="jtsPriceModalFoot"><span>Have a reference image? Share it with John when you request your look.</span><Link href="/order">Request an appointment ↗</Link></div>
   </section>
  </div>}
 </>;
}
