"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, updateDoc, doc, setDoc, deleteDoc, type Unsubscribe } from "firebase/firestore";
import AdminGate from "@/app/admin/admin-gate";
import { auth, db } from "@/lib/firebase/client";

type Appointment = {
  id: string;
  customerName?: string;
  phone?: string;
  scheduledFor?: string;
  createdAt?: string;
  status?: string;
  items?: Array<{ name?: string; price?: number; quantity?: number }>;
  total?: number;
  instructions?: string;
  deliveryLocation?: string;
};
type CustomerReview = {
  id: string;
  customerName?: string;
  title?: string;
  caption?: string;
  imageUrl?: string;
  service?: string;
  rating?: number;
  comparison?: string;
  createdAt?: string;
  published?: boolean;
  status?: string;
};

const dateText = (value?: string) => {
  if (!value) return "Date not provided";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Gaborone" }) : value;
};
const money = (value?: number) => "P" + (Number(value) || 0).toFixed(0);

function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [tab, setTab] = useState<"appointments" | "availability" | "reviews">("appointments");
  const [unavailableDates, setUnavailableDates] = useState<Array<{id:string;date:string;reason:string;updatedAt?:string}>>([]);
  const [closureDate, setClosureDate] = useState("");
  const [closureReason, setClosureReason] = useState("");
  const [availabilityNotice, setAvailabilityNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let ready = 0;
    const done = () => { ready += 1; if (ready >= 2) setLoading(false); };
    const stopAppointments: Unsubscribe = onSnapshot(collection(db, "orders"), snapshot => {
      setAppointments(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as Appointment))
        .sort((a, b) => (a.scheduledFor || "").localeCompare(b.scheduledFor || "")));
      done();
    }, () => { setNotice("Appointment requests could not be loaded. Check Firebase access and connection."); done(); });
    const stopReviews: Unsubscribe = onSnapshot(collection(db, "customerStyleReviews"), snapshot => {
      setReviews(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as CustomerReview))
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")));
      done();
    }, () => { setNotice("Customer reviews could not be loaded. Check Firebase access and connection."); done(); });
    return () => { stopAppointments(); stopReviews(); };
  }, []);

  useEffect(() => {
    const stop = onSnapshot(collection(db, "appointmentAvailability"), snapshot => {
      setUnavailableDates(snapshot.docs.map(item => ({ id: item.id, date: String(item.data().date || item.id), reason: String(item.data().reason || "Unavailable"), updatedAt: String(item.data().updatedAt || "") })).sort((a,b) => a.date.localeCompare(b.date)));
      setAvailabilityNotice("");
    }, () => setAvailabilityNotice("Availability settings could not be loaded. Check Firebase access and connection."));
    return () => stop();
  }, []);

  async function markDateUnavailable(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!closureDate) { setAvailabilityNotice("Choose a date first."); return; }
    setAvailabilityNotice("");
    try {
      await setDoc(doc(db, "appointmentAvailability", closureDate), { date: closureDate, available: false, reason: closureReason.trim() || "Unavailable", updatedAt: new Date().toISOString() });
      setAvailabilityNotice(closureDate + " is now marked unavailable to new appointment requests.");
      setClosureDate(""); setClosureReason("");
    } catch {
      setAvailabilityNotice("That date was not saved. Check your admin permissions and try again.");
    }
  }

  async function reopenDate(item: {id:string;date:string}) {
    setAvailabilityNotice("");
    try {
      await deleteDoc(doc(db, "appointmentAvailability", item.id));
      setAvailabilityNotice(item.date + " is available for new requests again.");
    } catch {
      setAvailabilityNotice("That date could not be reopened. Check your admin permissions and try again.");
    }
  }

  const openAppointments = useMemo(() => appointments.filter(item => !["Cancelled", "Completed"].includes(item.status || "")), [appointments]);

  async function setAppointmentStatus(item: Appointment, status: string) {
    setNotice("");
    try {
      await updateDoc(doc(db, "orders", item.id), { status });
      setNotice("Appointment #" + item.id.slice(0, 8).toUpperCase() + " updated to " + status + ".");
    } catch {
      setNotice("That appointment update was not saved. Check Firebase rules and try again.");
    }
  }

  async function setReviewPublished(item: CustomerReview, published: boolean) {
    setNotice("");
    try {
      await updateDoc(doc(db, "customerStyleReviews", item.id), {
        published,
        status: published ? "published" : "hidden",
        moderatedAt: new Date().toISOString()
      });
      setNotice(published ? "Customer look is visible in the public feed." : "Customer look is hidden from the public feed.");
    } catch {
      setNotice("Review moderation was not saved. Check Firebase rules and try again.");
    }
  }

  return <main className="adminPage"><div className="adminShell">
    <header className="adminHeader">
      <div><span className="kicker">JTS STYLES · OPERATIONS</span><h1>Run the appointments.</h1><p>Review requests, update appointment status and moderate customer looks.</p></div>
      <Link href="/" className="button buttonLight">View customer app</Link>
    </header>
    {notice && <div className="notice adminNotice" role="status" aria-live="polite">{notice}</div>}
    <section className="stats">
      <article><span>Appointment requests</span><strong>{appointments.length}</strong></article>
      <article><span>Needs attention</span><strong>{appointments.filter(item => !item.status || item.status === "New").length}</strong></article>
      <article><span>Customer looks</span><strong>{reviews.length}</strong></article>
      <article><span>Published reviews</span><strong>{reviews.filter(item => item.published !== false).length}</strong></article>
    </section>
    <nav className="adminTabs" aria-label="Operations sections">
      <button className={tab === "appointments" ? "active" : ""} onClick={() => setTab("appointments")}>Appointment requests</button>
      <button className={tab === "availability" ? "active" : ""} onClick={() => setTab("availability")}>Date availability</button>
      <button className={tab === "reviews" ? "active" : ""} onClick={() => setTab("reviews")}>Customer looks & reviews</button>
    </nav>
    {loading ? <section className="adminPanel"><p>Loading JTS operations…</p></section> : tab === "appointments" ? <section className="adminPanel">
      <div className="panelHeading"><div><span className="kicker">THE APPOINTMENT QUEUE</span><h2>Customer requests</h2></div><span>{openAppointments.length} open</span></div>
      {appointments.length === 0 ? <div className="emptyState"><h3>No appointment requests yet</h3><p>New requests submitted through the JTS booking form will appear here.</p></div> : <div className="queue">
        {appointments.map(item => <article className="queueRow" key={item.id}>
          <div>
            <span className="kicker">#{item.id.slice(0, 8).toUpperCase()} · {item.status || "New"}</span>
            <h3>{item.customerName || "Customer"}</h3>
            <p>{(item.items || []).map(service => service.name || "Service").join(" · ") || "Appointment request"}</p>
            <small>{dateText(item.scheduledFor)} · {money(item.total)}</small>
            {item.phone && <small>Customer contact: {item.phone}</small>}
            {item.instructions && <p>{item.instructions}</p>}
          </div>
          <div className="queueActions">
            <select aria-label={"Update appointment " + item.id} value={item.status || "New"} onChange={event => void setAppointmentStatus(item, event.target.value)}>
              <option value="New">New request</option>
              <option value="Reviewing">Reviewing</option>
              <option value="Accepted">Accepted</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </article>)}
      </div>}
    </section> : tab === "availability" ? <section className="adminPanel">
      <div className="panelHeading"><div><span className="kicker">CUSTOMER BOOKING CALENDAR</span><h2>Manage unavailable dates</h2></div><span>{unavailableDates.length} closed date{unavailableDates.length===1?"":"s"}</span></div>
      <p className="availabilityIntro">Dates you add here are blocked in the customer calendar. Customers can see the closure reason and the next nearest date they can request. This does not cancel or change existing requests already in the appointment queue.</p>
      <form className="availabilityForm" onSubmit={markDateUnavailable}>
        <label>Mark a date unavailable<input type="date" value={closureDate} min={new Date(Date.now()+86400000).toISOString().slice(0,10)} onChange={event=>setClosureDate(event.target.value)} required /></label>
        <label>Reason shown to customers <span>(optional)</span><input value={closureReason} onChange={event=>setClosureReason(event.target.value)} maxLength={120} placeholder="e.g. Fully booked, personal day, salon closed" /></label>
        <button className="button buttonLight" type="submit">Save unavailable date</button>
      </form>
      {availabilityNotice && <p className="notice" role="status">{availabilityNotice}</p>}
      {unavailableDates.length===0 ? <div className="emptyState"><h3>No unavailable dates recorded</h3><p>All future dates remain available to request, subject to John confirming the exact time.</p></div> : <div className="queue">{unavailableDates.map(item=><article className="queueRow" key={item.id}><div><span className="kicker">UNAVAILABLE DATE</span><h3>{dateText(item.date+"T12:00:00+02:00")}</h3><p>{item.reason}</p><small>Customers cannot select this date in the booking calendar.</small></div><div className="queueActions"><button type="button" className="button buttonLight" onClick={()=>void reopenDate(item)}>Reopen date</button></div></article>)}</div>}
      <p className="availabilityFootnote">The calendar controls which dates can be requested; it does not auto-confirm time slots. Appointment requests still need your review and confirmation.</p>
    </section> : <section className="adminPanel">
      <div className="panelHeading"><div><span className="kicker">COMMUNITY STYLE FEED</span><h2>Customer photos & reviews</h2></div><Link href="/feed" className="button buttonLight">View public feed</Link></div>
      {reviews.length === 0 ? <div className="emptyState"><h3>No customer reviews yet</h3><p>Customer-submitted looks and reviews will appear here for moderation.</p></div> : <div className="queue">
        {reviews.map(item => <article className="queueRow" key={item.id}>
          {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" style={{ width: 100, height: 120, objectFit: "cover", borderRadius: 10 }} />}
          <div>
            <span className="kicker">{item.published === false ? "Hidden" : "Published"} · {item.rating || 0}/5</span>
            <h3>{item.title || "Customer look"}</h3>
            <p>{item.caption || ""}</p>
            <small>{item.customerName || "JTS customer"} · {item.service || "JTS Styles"} · {dateText(item.createdAt)}</small>
            {item.comparison && <small>Repeat review: {item.comparison}</small>}
          </div>
          <div className="queueActions"><button className="button buttonLight" onClick={() => void setReviewPublished(item, item.published === false)}>{item.published === false ? "Publish" : "Hide from feed"}</button></div>
        </article>)}
      </div>}
    </section>}
    <p style={{ color: "#938c82", fontSize: ".8rem", marginTop: 18 }}>A request is not confirmed until John confirms the slot and deposit. Customer photos and reviews are public only while published.</p>
  </div></main>;
}

export default function AdminPage() {
  return <AdminGate><Dashboard /></AdminGate>;
}
