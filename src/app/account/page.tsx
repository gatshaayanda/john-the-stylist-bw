"use client";
import Link from "next/link";
import { GoogleAuthProvider, browserLocalPersistence, linkWithPopup, onAuthStateChanged, setPersistence, signInAnonymously, type User } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase/client";
import StyleStudio from "@/app/style-studio";
import { getCustomerOrders, type FoodOrder } from "@/lib/firebase/data";

function label(status: string) {
  return status === "New" ? "Request received" : status === "Collected" || status === "Delivered" ? "Completed" : status;
}
function dateText(value: string) {
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : value;
}
function isPastAppointment(order: FoodOrder) {
  return new Date(order.scheduledFor).getTime() < Date.now() && order.status !== "Cancelled";
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stop = onAuthStateChanged(auth, next => {
      setUser(next);
      if (next) {
        void getCustomerOrders(next.uid).then(setOrders).catch(() => setError("Your bookings could not be loaded right now.")).finally(() => setReady(true));
      } else setReady(true);
    });
    return stop;
  }, []);

  async function startGuest() {
    setError(""); setMessage("");
    try {
      const next = (await signInAnonymously(auth)).user;
      setUser(next);
      setOrders(await getCustomerOrders(next.uid));
    } catch {
      setError("We couldn't start your private booking session. Please try again.");
    }
  }

  async function saveStyleHistory() {
    if (!user) return;
    setBusy(true); setError(""); setMessage("");
    try {
      if (!user.isAnonymous) {
        setMessage("Your JTS account is already connected. Keep using this account to find your history on this device and other signed-in devices.");
        return;
      }
      await setPersistence(auth, browserLocalPersistence);
      const result = await linkWithPopup(user, new GoogleAuthProvider());
      setUser(result.user);
      setMessage("Your Google account is connected to this booking identity. Future bookings can stay with the same account.");
    } catch (cause) {
      const code = typeof cause === "object" && cause && "code" in cause ? String((cause as { code?: unknown }).code) : "";
      if (code === "auth/credential-already-in-use" || code === "auth/account-exists-with-different-credential" || code === "auth/email-already-in-use") {
        setError("That Google account already has a separate JTS sign-in. Your current booking history has not been merged automatically. Keep this session available and contact John before switching accounts.");
      } else if (code === "auth/popup-closed-by-user") setMessage("Google connection was cancelled. Your current booking session is unchanged.");
      else if (code === "auth/popup-blocked") setError("Your browser blocked the sign-in window. Allow pop-ups for JTS Styles and try again.");
      else setError("We couldn't connect Google right now. Your current booking session is unchanged.");
    } finally { setBusy(false); }
  }

  const pastOrders = useMemo(() => orders.filter(isPastAppointment), [orders]);
  const nextOrder = useMemo(() => orders.filter(order => new Date(order.scheduledFor).getTime() >= Date.now() && !["Cancelled", "Collected", "Delivered"].includes(order.status)).sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))[0], [orders]);

  return <main className="jtsBookingPage jtsStyleAccount"><div className="jtsContainer jtsBookingWrap">
    <div className="jtsBookingTop"><Link href="/" className="jtsBack">← JTS Styles</Link><div className="jtsAccountTopLinks"><Link href="/feed" className="jtsGhost">Style feed ↗</Link><Link href="/order" className="jtsGhost">Book appointment</Link></div></div>
    <header className="jtsAccountHero"><span className="jtsEyebrow">YOUR JTS STYLE JOURNEY</span><h1>My style.<br /><em>My history.</em></h1><p>Your bookings, previous looks and new inspiration—ready whenever you want your next cut.</p><div className="jtsAccountHeroActions"><Link href="/order" className="jtsButton jtsButtonGold">Plan my next look ↗</Link><Link href="/feed" className="jtsGhost">Explore the JTS feed</Link></div></header>

    <section className="jtsAccountStudioIntro"><span className="jtsEyebrow">YOUR PERSONAL STYLE PLAYGROUND</span><h2>Try a new direction.</h2><p>Build a look, test it against a style brief, and carry your choices into your next appointment request.</p></section>
    <StyleStudio />

    <section className="jtsStyleStats" aria-label="Your style summary"><article><span>BOOKINGS</span><strong>{orders.length}</strong><small>Requests in this account</small></article><article><span>PAST DATES</span><strong>{pastOrders.length}</strong><small>Previous appointment dates</small></article><article><span>ACCOUNT</span><strong>{user && !user.isAnonymous ? "SAVED" : "GUEST"}</strong><small>{user && !user.isAnonymous ? "Connected sign-in" : "This device session"}</small></article></section>

    {!user && <section className="jtsStylePanel jtsStyleWelcome"><span className="jtsEyebrow">YOUR PRIVATE SPACE</span><h2>Start with your booking history.</h2><p>Open the private session on this device to see appointments linked to it. You can still browse the style feed without signing in.</p><button className="jtsButton jtsButtonGold" type="button" onClick={() => void startGuest()} disabled={!ready}>Open my bookings</button><Link href="/feed" className="jtsStyleTextLink">Browse the JTS feed ↗</Link></section>}

    {user && user.isAnonymous && <section className="jtsStylePanel jtsStyleConnect" id="save-style-history"><div><span className="jtsEyebrow">KEEP YOUR STYLE HISTORY</span><h2>Make it easier to find next time.</h2><p>Optionally connect Google to this same guest identity so your booking history can follow you across visits and devices. This does not confirm or change any appointment.</p></div><button className="jtsButton jtsButtonGold" type="button" onClick={() => void saveStyleHistory()} disabled={busy}>{busy ? "Connecting…" : "Save my style history with Google"}</button></section>}
    {user && !user.isAnonymous && <section className="jtsStylePanel jtsStyleConnect"><div><span className="jtsEyebrow">YOUR ACCOUNT IS CONNECTED</span><h2>Your history has a home.</h2><p>Keep using this sign-in when you return to JTS Styles. Bookings created under a different guest session are not merged automatically.</p></div><span className="jtsStyleConnected">✓ Connected</span></section>}

    {nextOrder && <section className="jtsStyleNext"><div><span className="jtsEyebrow">UP NEXT</span><h2>{nextOrder.items.map(item => item.name).join(" · ")}</h2><p>{dateText(nextOrder.scheduledFor)} · {label(nextOrder.status)}</p><small>Reference #{nextOrder.id.slice(0, 8).toUpperCase()} · A request is not confirmed until John confirms the slot and deposit.</small></div><Link href={"/orders/" + nextOrder.id} className="jtsButton jtsButtonGold">View booking ↗</Link></section>}

    <section className="jtsStyleHistory"><div className="jtsStyleSectionHead"><div><span className="jtsEyebrow">YOUR PERSONAL RECORD</span><h2>Booking history.</h2><p>Use previous requests as a reference when planning your next look.</p></div><Link href="/order" className="jtsStyleTextLink">New booking ↗</Link></div>
      {user && !ready ? <div className="jtsStyleEmpty">Loading your bookings…</div> : user && orders.length > 0 ? <div className="jtsStyleBookingList">{[...orders].sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor)).map(order => <article key={order.id} className="jtsBookingRow jtsStyleBookingRow"><div><span className="jtsEyebrow">{label(order.status)}</span><h3>{order.items.map(item => item.name).join(" · ")}</h3><p>{dateText(order.scheduledFor)}</p><small>Reference #{order.id.slice(0, 8).toUpperCase()} · {order.status}</small></div><Link href={"/orders/" + order.id} className="jtsGhost">View booking ↗</Link></article>)}</div> : user ? <div className="jtsStyleEmpty"><span className="jtsEyebrow">NO BOOKINGS YET</span><h3>Your first look starts here.</h3><p>Choose a service, request a future date and keep your reference here.</p><Link href="/order" className="jtsButton jtsButtonGold">Book your first look ↗</Link></div> : <div className="jtsStyleEmpty"><p>Open your private booking session above to load its history.</p></div>}
    </section>

    <section className="jtsStyleFeedInvite"><div><span className="jtsEyebrow">INSPIRATION BETWEEN VISITS</span><h2>See what’s next.</h2><p>Explore John’s work, share your own photo and keep a record of how happy you are with each look.</p></div><Link href="/feed" className="jtsButton jtsButtonGold">Share a look & review ↗</Link></section>
    <div className="jtsAccountNote"><strong>Appointment truth:</strong> submitting a request does not confirm the slot or mean a deposit has been received. John confirms the appointment and deposit separately. For help, use your JTS booking history and appointment request details.</div>
    {(error || message) && <p className={error ? "jtsFormError" : "jtsStyleStatus"} role="status">{error || message}</p>}
  </div></main>;
}
