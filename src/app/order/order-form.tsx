"use client";
import Link from "next/link";
import {FormEvent,useMemo,useState} from "react";
import {signInAnonymously} from "firebase/auth";
import {auth} from "@/lib/firebase/client";
import {createFoodOrder} from "@/lib/firebase/data";

const SERVICES=[
 {id:"pixie-cut",name:"Pixie Cut",price:350,maxPrice:400,display:"P350–P400",detail:"Precision short cut"},
 {id:"cut-pixie",name:"Cut + Pixie Cut",price:200,display:"P200",detail:"Cut and shape"},
 {id:"pure-white",name:"Pure White",price:300,display:"P300",detail:"Bleach / colour"},
 {id:"cut-bleach",name:"Cut + Bleach",price:250,display:"P250",detail:"Cut + bleach"}
];

const gaboroneDateKey=(date=new Date())=>new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Gaborone",year:"numeric",month:"2-digit",day:"2-digit"}).format(date);
const minDate=()=>{const parts=gaboroneDateKey().split("-").map(Number);const d=new Date(Date.UTC(parts[0],parts[1]-1,parts[2]+1));return d.toISOString().slice(0,10)};
const money=(value:number)=>"P"+value.toFixed(0);

export default function OrderForm(){
 const[serviceId,setServiceId]=useState(""),[date,setDate]=useState(""),[time,setTime]=useState(""),[name,setName]=useState(""),[phone,setPhone]=useState(""),[style,setStyle]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[submitted,setSubmitted]=useState(false),[reference,setReference]=useState(""),[offlinePending,setOfflinePending]=useState(false);
 const service=useMemo(()=>SERVICES.find(item=>item.id===serviceId),[serviceId]);
 const deposit=service?service.price*.5:0;
 const depositText=service?.maxPrice?money(deposit)+"–"+money(service.maxPrice*.5):money(deposit);

 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setError("");
  if(!service||!date||!time||!name.trim()||!phone.trim()){setError("Choose a service, date, time, name and WhatsApp/phone number.");return}
  const chosen=new Date(date+"T"+time+":00+02:00"),min=new Date(minDate()+"T00:00:00+02:00");
  if(chosen<min){setError("Appointments need to be booked at least one day in advance.");return}
  const hour=Number(time.slice(0,2));
  if(hour<8||hour>18||(hour===18&&time.slice(3)!=="00")){setError("Choose a time between 08:00 and 18:00.");return}
  setBusy(true);
  try{
   const user=(await signInAnonymously(auth)).user;
   const bookingData={
    customerId:user.uid,createdAt:new Date().toISOString(),customerName:name.trim(),phone:phone.trim(),
    mode:"pickup" as const,scheduledFor:chosen.toISOString(),
    deliveryLocation:"G West shops — inside the salon with the purple door labelled “miss Emma”",
    instructions:"APPOINTMENT REQUEST. Service: "+service.name+". Desired style: "+(style.trim()||"Not specified")+". Deposit required: "+depositText+" (50%). Deposit method: Orange Money 75720306, account name John SHUMBA. Booking is a request, not confirmed until John confirms the slot and deposit.",
    items:[{name:service.name,price:service.price,quantity:1}],total:service.price,status:"New" as const
   };
   const result=createFoodOrder(bookingData);
   try{window.localStorage.setItem("jts-booking-"+result.id,JSON.stringify({id:result.id,...bookingData}))}catch{}
   if(navigator.onLine){await result.writePromise;setOfflinePending(false)}else{setOfflinePending(true);void result.writePromise.catch(()=>{})}
   setReference(result.id);setSubmitted(true);
  }catch(err){console.error(err);setError("We couldn't send the booking request. Please check your connection or call John on +267 78 053 564.")}finally{setBusy(false)}
 }
 if(submitted)return <main className="jtsBookingPage"><div className="jtsContainer jtsBookingWrap"><Link href="/" className="jtsBack">← JTS Styles</Link><section className="jtsConfirmation"><span className="jtsEyebrow">{offlinePending?"SAVED FOR SYNC":"REQUEST SENT"}</span><div className="jtsConfirmIcon">✓</div><h1>{offlinePending?"Your request is saved on this device.":"Your appointment request is in."}</h1><p>{offlinePending?"JTS Styles is offline. The saved request is not a confirmed appointment and no deposit has been received. Reconnect to sync it with the business.":"John still needs to confirm the slot and receive the 50% deposit."} Your reference is <strong>#{reference.slice(0,8).toUpperCase()}</strong>.</p><div className="jtsPaymentCard"><span>YOUR NEXT STEP</span><strong>Send {depositText} via Orange Money</strong><p><b>75720306</b> · John SHUMBA</p><small>{offlinePending?"When you reconnect, keep this reference and check My bookings for synchronization.":"Then send your full name, requested date, preferred time and desired hairstyle by WhatsApp to +267 78 053 564."}</small><div className="jtsConfirmActions"><a href={"https://wa.me/26778053564?text=Hi%20John%2C%20I%20have%20submitted%20an%20appointment%20request.%20My%20reference%20is%20%23"+reference.slice(0,8).toUpperCase()} className="jtsButton jtsButtonBlue">WhatsApp John →</a><a href="tel:+26778053564" className="jtsGhost">Call John</a></div></div><div className="jtsConfirmActions"><Link href="/" className="jtsButton jtsButtonGold">Back to JTS Styles</Link><Link href="/account" className="jtsGhost">View my booking</Link></div></section></div></main>;
 return <main className="jtsBookingPage"><div className="jtsContainer jtsBookingWrap"><div className="jtsBookingTop"><Link href="/" className="jtsBack">← JTS Styles</Link><span>Appointment · Guest first</span></div><div className="jtsBookingIntro"><span className="jtsEyebrow">BOOK AN APPOINTMENT</span><h1>Let&apos;s plan your look.</h1><p>Choose the service, then tell John when you want to come in. No account or password is required.</p></div><form onSubmit={submit} className="jtsBookingGrid"><section className="jtsBookingMain"><div className="jtsBookingStep"><span>01</span><div><h2>What are you having done?</h2><p>Start with the result you want. You can explain more below.</p></div></div><div className="jtsChoiceGrid">{SERVICES.map(item=><button type="button" key={item.id} className={"jtsChoice "+(serviceId===item.id?"selected":"")} onClick={()=>setServiceId(item.id)}><span>{item.detail}</span><strong>{item.name}</strong><b>{item.display}</b>{serviceId===item.id&&<i>✓</i>}</button>)}</div><div className="jtsBookingStep"><span>02</span><div><h2>When should John expect you?</h2><p>Appointments must be requested at least one day in advance · 08:00–18:00.</p></div></div><div className="jtsDateGrid"><label>Date<span>Appointment date</span><input type="date" min={minDate()} value={date} onChange={e=>setDate(e.target.value)} required/></label><label>Time<span>08:00 – 18:00</span><input type="time" min="08:00" max="18:00" step="1800" value={time} onChange={e=>setTime(e.target.value)} required/></label></div><div className="jtsBookingStep"><span>03</span><div><h2>Tell us about you.</h2><p>Only the details needed to identify your request and contact you.</p></div></div><div className="jtsFields"><label>Full name<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" required/></label><label>WhatsApp / phone<input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" autoComplete="tel" required/></label><label>Desired hairstyle <em>optional</em><textarea value={style} onChange={e=>setStyle(e.target.value)} placeholder="e.g. short pixie, bright colour, similar to a photo..." rows={4}/></label></div>{error&&<p className="jtsFormError" role="alert">⚠ {error}</p>}<button className="jtsButton jtsButtonGold jtsSubmit" disabled={busy}>{busy?"Sending request…":"Request this appointment →"}</button></section><aside className="jtsBookingSide"><div className="jtsSummary"><span className="jtsEyebrow">YOUR REQUEST</span>{service?<><strong>{service.name}</strong><p>{date?new Date(date+"T12:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"}):"Choose a date"}{time?" · "+time:""}</p><div className="jtsPriceRow"><span>Service</span><b>{service.display}</b></div><div className="jtsPriceRow"><span>50% deposit</span><b>{depositText}</b></div></>:<p>Select a service to see your booking summary.</p>}</div><div className="jtsDepositCard"><span>SECURE YOUR SLOT</span><h3>50% deposit</h3><p>After you submit, send the deposit through Orange Money.</p><strong>75720306</strong><small>John SHUMBA</small></div><div className="jtsLocationMini"><span>G WEST SHOPS</span><strong>Purple door · “miss Emma”</strong><p>Upstairs at Star Tattoos parlor and boutique, inside the salon.</p><a href="tel:+26778053564">+267 78 053 564</a></div></aside></form></div></main>;
}
