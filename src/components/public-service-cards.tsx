"use client";

import Link from "next/link";
import {doc,onSnapshot} from "firebase/firestore";
import {useEffect,useMemo,useState} from "react";
import {db} from "@/lib/firebase/client";
import {DEFAULT_PUBLIC_SERVICES,normalizePublicServices,type PublicService} from "@/lib/jts/public-services";

const ALL = "ALL SERVICES";
export default function PublicServiceCards(){
 const [services,setServices]=useState<PublicService[]>(DEFAULT_PUBLIC_SERVICES);
 const [query,setQuery]=useState("");
 const [category,setCategory]=useState(ALL);
 const [showAll,setShowAll]=useState(false);
 useEffect(()=>{
  const stop=onSnapshot(doc(db,"businessSettings","publicServices"),snapshot=>{
   if(snapshot.exists())setServices(normalizePublicServices(snapshot.data().services));
  },()=>{});
  return()=>stop();
 },[]);
 const categories=useMemo(()=>[ALL,...Array.from(new Set(services.map(item=>item.tag)))],[services]);
 const filtered=useMemo(()=>{
  const term=query.trim().toLowerCase();
  return services.filter(item=>(category===ALL||item.tag===category)&&(!term||[item.name,item.detail,item.note,item.tag].join(" ").toLowerCase().includes(term)));
 },[services,category,query]);
 const visible=showAll||query.trim()||category!==ALL?filtered:filtered.slice(0,6);
 return <div className="jtsServiceFinder">
  <div className="jtsServiceFinderTools">
   <label className="jtsServiceSearch"><span className="srOnly">Search services</span><span aria-hidden="true">⌕</span><input value={query} onChange={e=>{setQuery(e.target.value);setShowAll(true)}} placeholder="Search cuts, fades, tint, curls…" type="search"/></label>
   {query&&<button type="button" className="jtsServiceClear" onClick={()=>setQuery("")}>Clear search</button>}
  </div>
  <div className="jtsServiceFilters" aria-label="Filter services by category">
   {categories.map(item=><button type="button" key={item} className={category===item?"active":""} aria-pressed={category===item} onClick={()=>{setCategory(item);setShowAll(true)}}>{item}</button>)}
  </div>
  <div className="jtsServiceResultsMeta"><span>{filtered.length} {filtered.length===1?"service":"services"}</span><span>Published prices · BWP</span></div>
  <div className="jtsServiceCompactList">
   {visible.map((service,index)=><article className="jtsServiceCompactRow" key={service.id}>
    <div className="jtsServiceCompactIdentity"><span className="jtsServiceCompactNumber">{String(services.indexOf(service)+1).padStart(2,"0")}</span><div><small>{service.tag}</small><strong>{service.name}</strong><p>{service.note}</p></div></div>
    <div className="jtsServiceCompactAction"><b>{service.display}</b><Link href={"/order?service="+encodeURIComponent(service.id)}>Choose <span>↗</span></Link></div>
   </article>)}
   {filtered.length===0&&<div className="jtsServiceNoResults"><strong>No exact match yet.</strong><p>Try another word or ask John about a custom style and price.</p><Link href="/order">Ask about another style ↗</Link></div>}
  </div>
  {!query.trim()&&category===ALL&&filtered.length>6&&<button type="button" className="jtsServiceShowAll" onClick={()=>setShowAll(value=>!value)}>{showAll?"Show fewer services":"View all 17 services"} <span>{showAll?"↑":"↓"}</span></button>}
 </div>;
}
