"use client";
import { useEffect, useState } from "react";

type Service = { id: string; name: string; price: string; picture: string; published: boolean };
type Appointment = { id: string; customer: string; service: string; date: string; time: string; status: string; deposit: string };
const starterServices: Service[] = [
  { id: "pixie", name: "Pixie Cut", price: "P350–P400", picture: "", published: true },
  { id: "cut-pixie", name: "Cut + Pixie Cut", price: "P200", picture: "", published: true },
  { id: "white", name: "Pure White", price: "P300", picture: "", published: true },
  { id: "bleach", name: "Cut + Bleach", price: "P250", picture: "", published: true },
];
const starterAppointments: Appointment[] = [
  { id: "DEMO-001", customer: "Example customer", service: "Pixie Cut", date: "2026-10-20", time: "10:00", status: "Requested", deposit: "Pending" },
  { id: "DEMO-002", customer: "Sample booking", service: "Pure White", date: "2026-10-21", time: "13:30", status: "Deposit pending", deposit: "Pending" },
];
const serviceKey = "jts-admin-demo-services-v1";
const appointmentKey = "jts-admin-demo-appointments-v1";

export default function JtsAdminDemo({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState<"appointments" | "services">("appointments");
  const [services, setServices] = useState<Service[]>(starterServices);
  const [appointments, setAppointments] = useState<Appointment[]>(starterAppointments);
  const [draft, setDraft] = useState<Service>({ id: "", name: "", price: "", picture: "", published: true });
  const [notice, setNotice] = useState("Demo mode: changes are stored only in this browser.");
  useEffect(() => {
    try {
      const s = localStorage.getItem(serviceKey), a = localStorage.getItem(appointmentKey);
      if (s) setServices(JSON.parse(s) as Service[]);
      if (a) setAppointments(JSON.parse(a) as Appointment[]);
    } catch { setNotice("Demo data could not be loaded. Reset the sample data to continue."); }
  }, []);
  function persistServices(next: Service[]) { setServices(next); try { localStorage.setItem(serviceKey, JSON.stringify(next)); setNotice("Demo service saved locally; the live site is unchanged."); } catch { setNotice("Browser storage is full. Remove the demo picture and try again."); } }
  function persistAppointments(next: Appointment[]) { setAppointments(next); try { localStorage.setItem(appointmentKey, JSON.stringify(next)); setNotice("Demo appointment updated locally; no real booking was changed."); } catch { setNotice("Could not save the demo appointment in this browser."); } }
  function saveService(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim() || !draft.price.trim()) { setNotice("Enter a service name and price."); return; }
    const item = { ...draft, id: draft.id || "demo-" + Date.now(), name: draft.name.trim(), price: draft.price.trim() };
    persistServices([...services.filter(s => s.id !== item.id), item]);
    setDraft({ id: "", name: "", price: "", picture: "", published: true });
  }
  function reset() {
    setServices(starterServices); setAppointments(starterAppointments);
    try { localStorage.removeItem(serviceKey); localStorage.removeItem(appointmentKey); } catch {}
    setDraft({ id: "", name: "", price: "", picture: "", published: true });
    setNotice("Sample data reset. Live data was not touched.");
  }
  return <main className="adminPage"><div className="adminShell">
    <header className="adminHeader"><div><span className="kicker">JTS STYLES · OPERATIONS DEMO</span><h1>John The Stylist Bw</h1><p>Sample appointments, hairstyle pictures and prices.</p></div><button className="button buttonLight" onClick={onExit}>Exit demo</button></header>
    <div className="notice adminNotice" role="status">{notice}</div>
    <div className="notice" role="note"><strong>DEMO ONLY.</strong> Sample records only. This screen cannot read or change live bookings, Firebase records, public prices or uploaded media.</div>
    <nav className="adminTabs" aria-label="Demo sections"><button className={tab === "appointments" ? "active" : ""} onClick={() => setTab("appointments")}>Appointments ({appointments.length})</button><button className={tab === "services" ? "active" : ""} onClick={() => setTab("services")}>Styles & prices ({services.length})</button></nav>
    {tab === "appointments" && <section className="adminPanel"><div className="panelHeading"><div><h2>Appointment requests</h2><p>A request is not a confirmed appointment or proof of deposit.</p></div><button className="button buttonPrimary" onClick={() => persistAppointments([{ id: "DEMO-" + Date.now().toString().slice(-6), customer: "Example customer", service: services[0]?.name ?? "Example style", date: "2026-10-22", time: "11:00", status: "Requested", deposit: "Pending" }, ...appointments])}>+ Sample request</button></div><div className="queue">{appointments.map(a => <article className="queueRow" key={a.id}><div><strong>{a.customer}</strong><small>{a.id} · {a.service}</small><small>{a.date} · {a.time}</small></div><div className="queueActions"><label>Status<select value={a.status} onChange={e => persistAppointments(appointments.map(x => x.id === a.id ? { ...x, status: e.target.value } : x))}><option>Requested</option><option>Deposit pending</option><option>Confirmed</option><option>In service</option><option>Completed</option><option>Cancelled</option></select></label><label>Deposit<select value={a.deposit} onChange={e => persistAppointments(appointments.map(x => x.id === a.id ? { ...x, deposit: e.target.value } : x))}><option>Pending</option><option>Received (demo)</option><option>Not received</option></select></label></div></article>)}</div></section>}
    {tab === "services" && <section className="adminPanel"><div className="panelHeading"><div><h2>Styles, pictures & prices</h2><p>Create, edit, hide or delete sample catalogue items.</p></div><button className="button buttonLight" onClick={() => setDraft({ id: "", name: "", price: "", picture: "", published: true })}>+ New style</button></div><div className="adminTwoCol"><form className="adminForm" onSubmit={saveService}><h3>{draft.id ? "Edit style" : "New style"}</h3><label>Style name<input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} required /></label><label>Displayed price<input value={draft.price} onChange={e => setDraft({ ...draft, price: e.target.value })} placeholder="e.g. P350–P400" required /></label><label>Picture URL<input type="url" value={draft.picture} onChange={e => setDraft({ ...draft, picture: e.target.value })} placeholder="https://…" /></label>{draft.picture && <img src={draft.picture} alt="Style preview" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8 }} />}<label className="checkRow"><input type="checkbox" checked={draft.published} onChange={e => setDraft({ ...draft, published: e.target.checked })} /> Published in demo</label><button className="button buttonPrimary" type="submit">Save demo style</button></form><div className="menuAdminList"><div className="menuListHeading"><strong>Sample catalogue</strong><span>Not the public catalogue</span></div>{services.map(s => <article key={s.id}><div>{s.picture && <img className="menuThumb" src={s.picture} alt="" />}<strong>{s.name}</strong><small>{s.price} · {s.published ? "Shown in demo" : "Hidden in demo"}</small></div><div><button className="button buttonLight" onClick={() => { setDraft({ ...s }); setTab("services"); }}>Edit</button><button className="button buttonLight" onClick={() => persistServices(services.map(x => x.id === s.id ? { ...x, published: !x.published } : x))}>{s.published ? "Hide" : "Publish"}</button><button className="button buttonDanger" onClick={() => persistServices(services.filter(x => x.id !== s.id))}>Delete</button></div></article>)}</div></div></section>}
    <div className="saveAction"><button className="button buttonLight" onClick={reset}>Reset sample data</button><span className="saveHint">Demo edits do not publish to the customer app.</span></div>
  </div></main>;
}
