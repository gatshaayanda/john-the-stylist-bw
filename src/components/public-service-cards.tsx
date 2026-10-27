"use client";

import Link from "next/link";
import {doc,onSnapshot} from "firebase/firestore";
import {useEffect,useState} from "react";
import {db} from "@/lib/firebase/client";
import {DEFAULT_PUBLIC_SERVICES,normalizePublicServices,type PublicService} from "@/lib/jts/public-services";

export default function PublicServiceCards(){
 const [services,setServices]=useState<PublicService[]>(DEFAULT_PUBLIC_SERVICES);
 useEffect(()=>{
  const stop=onSnapshot(doc(db,"businessSettings","publicServices"),snapshot=>{
   if(snapshot.exists())setServices(normalizePublicServices(snapshot.data().services));
  },()=>{});
  return()=>stop();
 },[]);
 return <div className="jtsEditServiceGrid">
  {services.map((service,index)=><article className="jtsEditServiceCard" key={service.id}>
   <div className="jtsEditServiceCardTop"><span>{service.tag}</span><span>{String(index+1).padStart(2,"0")}</span></div>
   {service.media?.length ? <div className="jtsServiceMediaGallery">{service.media.slice(0,3).map((media,mediaIndex)=><div className="jtsServiceMediaItem" key={media.url}>{media.type === "video" ? <video src={media.url} controls playsInline preload="metadata" aria-label={service.name+" video "+(mediaIndex+1)} /> : <img src={media.url} alt={media.alt || service.name+" finished look"} loading="lazy" />}</div>)}</div> : <div className={"jtsEditServiceGlyph jtsEditServiceGlyph"+(index%4)}><span>{["J","S","C","↗"][index%4]}</span></div>}
   <h3>{service.name}</h3><p>{service.note}</p>
   <div className="jtsEditServiceFoot"><strong>{service.display}</strong><Link href={"/order?service="+encodeURIComponent(service.id)}>Choose service <span>↗</span></Link></div>
  </article>)}
  {services.length===0&&<div className="jtsJourneyEmpty">The service list is being updated. Contact John to ask about your look.</div>}
 </div>;
}
