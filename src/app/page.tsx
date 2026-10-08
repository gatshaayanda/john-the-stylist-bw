"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {getMenuItems,readCachedMenuItems,type MenuItem} from "@/lib/firebase/data";
import JtsInstallButton from "@/app/jts-install-button";

const services=[
  {name:"Pixie Cut",price:"P350–P400",copy:"A precise, tailored short cut with a polished finish."},
  {name:"Cut + Pixie Cut",price:"P200",copy:"A focused cut appointment for a clean, confident shape."},
  {name:"Pure White",price:"P300",copy:"Bleach / colour work for a bold, high-impact finish."},
  {name:"Cut + Bleach",price:"P250",copy:"A cut paired with bleach for a complete colour change."}
];
function Logo(){return <Link href="/" className="jtsLogo" aria-label="John The Stylist Bw home"><span className="jtsMark">JTS</span><span><b>STYLES</b><small>HAIRSTYLIST</small></span></Link>}

export default function Home(){
 const[menu,setMenu]=useState<MenuItem[]>([]);
 useEffect(()=>{void getMenuItems().then(setMenu).catch(()=>setMenu(readCachedMenuItems()))},[]);
 const published=menu.filter(item=>item.available);
 return <main className="jtsSite">
  <header className="jtsHeader"><div className="jtsContainer jtsHeaderInner"><Logo/><nav className="jtsNav"><a href="#services">Services</a><a href="#how">How it works</a><a href="#visit">Find us</a></nav><div className="jtsHeaderActions"><JtsInstallButton/><Link href="/account" className="jtsGhost">My booking</Link><Link href="/order" className="jtsButton jtsButtonBlue">Book appointment</Link></div></div></header>
  <section className="jtsHero"><div className="jtsContainer jtsHeroGrid"><div className="jtsHeroCopy"><span className="jtsEyebrow">JTS STYLES · GABORONE</span><h1>Hair that<br/><em>looks like you.</em></h1><p>Precision cuts, colour, bleach and statement styles by John The Stylist Bw.</p><div className="jtsHeroActions"><Link href="/order" className="jtsButton jtsButtonGold">Book your appointment <span>→</span></Link><a href="#services" className="jtsTextButton">Explore services</a></div><div className="jtsTrustLine"><span>50% deposit</span><i/><span>Book 1 day ahead</span><i/><span>Orange Money</span></div></div><div className="jtsHeroVisual"><div className="jtsHalo"/><div className="jtsHeroMonogram">JTS</div><div className="jtsHeroSub">STYLES &amp; BARBER SHOP</div><span className="jtsScissor">✂</span></div></div></section>
  <section className="jtsIntro"><div className="jtsContainer jtsIntroGrid"><div><span className="jtsEyebrow">THE EXPERIENCE</span><h2>Come in with an idea.<br/><em>Leave with a look.</em></h2></div><p>Whether you want a sharp pixie, a fresh fade, vivid colour or a special-event finish, the appointment starts with choosing the service that matches the look you want.</p></div></section>
  <section id="services" className="jtsSection"><div className="jtsContainer"><div className="jtsSectionHead"><div><span className="jtsEyebrow">SERVICES</span><h2>Choose your look.</h2></div><span className="jtsSectionNote">Supplied prices are shown. Ask about a style if it is not listed.</span></div><div className="jtsServiceGrid">{services.map((service,index)=><article className="jtsServiceCard" key={service.name}><span className="jtsServiceNo">0{index+1}</span><div><h3>{service.name}</h3><p>{service.copy}</p></div><strong>{service.price}</strong><Link href="/order" className="jtsCardLink">Choose service →</Link></article>)}</div>{published.length>0&&<p className="jtsDataNote">{published.length} live catalogue item{published.length===1?"":"s"} are also available through the booking system.</p>}</div></section>
  <section id="how" className="jtsProcess"><div className="jtsContainer"><div className="jtsSectionHead"><div><span className="jtsEyebrow">BOOKING</span><h2>Simple on purpose.</h2></div></div><div className="jtsSteps"><article><span>01</span><h3>Pick a service</h3><p>Start with the hairstyle or treatment you want. Explain the exact look in your notes if you need to.</p></article><article><span>02</span><h3>Choose a time</h3><p>Appointments are requested at least one day in advance, so the slot can be planned properly.</p></article><article><span>03</span><h3>Secure your spot</h3><p>A 50% deposit is required. Pay through Orange Money and send your name, date, time and desired hairstyle.</p></article></div></div></section>
  <section id="visit" className="jtsVisit"><div className="jtsContainer jtsVisitGrid"><div><span className="jtsEyebrow">FIND JOHN</span><h2>G West.<br/><em>Look for the purple door.</em></h2><p>G West shops, upstairs at Star Tattoos parlor and boutique, inside the salon with the purple door labelled “miss Emma”.</p><a className="jtsPhone" href="tel:+26778053564">+267 78 053 564</a></div><div className="jtsVisitCard"><span>OPEN</span><strong>08:00 — 18:00</strong><small>Appointment-based styling</small><div className="jtsDeposit"><b>50%</b><span>deposit to secure your appointment</span></div><p>Orange Money · <strong>75720306</strong><br/>Account name · <strong>John SHUMBA</strong></p></div></div></section>
  <footer className="jtsFooter"><div className="jtsContainer jtsFooterInner"><Logo/><div><span>John The Stylist Bw</span><small>Beauty · Colour · Cuts · Barbering</small></div><Link href="/order" className="jtsButton jtsButtonGold">Book now →</Link></div></footer>
  <div className="jtsMobileCta"><Link href="/order" className="jtsButton jtsButtonGold">Book appointment <span>→</span></Link></div>
 </main>;
}