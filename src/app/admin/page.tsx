"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, updateDoc, doc, type Unsubscribe } from "firebase/firestore";
import AdminGate from "@/app/admin/admin-gate";
import { db } from "@/lib/firebase/client";

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
  const [tab, setTab] = useState<"appointments" | "reviews">("appointments");
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
