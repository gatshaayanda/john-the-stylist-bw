"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";

type Message = { id: number; from: "guide" | "you"; text: string };
export default function JtsStyleGuide({ onNavigateAdmin }: { onNavigateAdmin?: (tab: "appointments" | "availability" | "services" | "styleFeed") => void } = {}) {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");
  const account = pathname.startsWith("/account");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const panel = useRef<HTMLElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const focus = window.setTimeout(() => panel.current?.querySelector<HTMLElement>('button:not([disabled]),a[href],input:not([disabled])')?.focus(), 0);
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); launcher.current?.focus(); return; }
      if (event.key !== "Tab") return;
      const nodes = panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled])');
      if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", keys);
    return () => { window.clearTimeout(focus); window.removeEventListener("keydown", keys); };
  }, [open]);

  if (!admin && !account) return null;
  function answer(text: string) {
    setMessages(current => [...current, { id: Date.now() + Math.random(), from: "guide" as const, text }].slice(-8));
  }
  function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages(current => [...current, { id: Date.now(), from: "you" as const, text }].slice(-8));
    setInput("");
    const query = text.toLowerCase();
    if (/weather|rain|hot|wind|sun|forecast/.test(query)) answer("The Gaborone forecast gives current conditions and the next few days. It can help you plan your visit, but it does not show appointment availability. John confirms the requested slot.");
    else if (/book|appointment|date|time|cut|colour|color|bleach|style/.test(query)) answer(admin ? "Review new requests in Appointment requests and use Date availability to block dates you cannot take. A customer request is not confirmed until you confirm the slot and deposit." : "Browse the services and prices, then request a date at least one day ahead. Your request is not confirmed until John confirms the slot and deposit.");
    else if (/account|history|status|update|my booking/.test(query)) answer(admin ? "Use Appointment requests to review the queue and update a request's status. Customer history stays private to each signed-in identity." : "Your account shows booking updates and past requests linked to your current guest or Google identity. Connecting Google is optional.");
    else if (/photo|picture|inspiration|feed|look/.test(query)) answer(admin ? "Use Services & prices to attach media to a service, or John's style feed to publish a look. Only published owner media appears publicly." : "Open the style feed to explore published work, or save your own reference through the customer look flow. Only public owner work is shown as John's portfolio.");
    else if (/contact|john|phone|human|help/.test(query)) answer("You can contact John through the verified contact details shown in the JTS site. I’m a scripted guide, not a live person, and this chat does not send messages or change bookings.");
    else answer("I’m JTS’s scripted style guide, not a live person or AI assistant. Try asking about booking, your account, the forecast, or style inspiration.");
  }
  const intro = admin ? "What needs your attention, Boss?" : "Dumela! Planning your next look?";
  return <div className="jtsGuideRoot">
    {open && <button type="button" className="jtsGuideBackdrop" aria-label="Close JTS style guide" onClick={() => { setOpen(false); launcher.current?.focus(); }} />}
    {open && <section ref={panel} className="jtsGuidePanel" role="dialog" aria-modal="true" aria-labelledby="jts-guide-title">
      <header className="jtsGuideHead"><div><span className="jtsEyebrow">JTS STYLES · PERSONAL STYLE GUIDE</span><h2 id="jts-guide-title">{admin ? "Operations sidekick" : "Your next step"}</h2><p>Quick help · Real page links</p></div><button type="button" aria-label="Close guide" onClick={() => { setOpen(false); launcher.current?.focus(); }}>×</button></header>
      <div className="jtsGuideIntro"><strong>{intro}</strong><p>{admin ? "Jump to a real salon tool or ask a quick question." : "Explore your booking, find a look or plan a visit. No pressure."}</p></div>
      <nav className="jtsGuideActions" aria-label="Style guide shortcuts">{admin ? <><button type="button" onClick={() => { onNavigateAdmin?.("appointments"); setOpen(false); }}>Review appointment requests ↗</button><button type="button" onClick={() => { onNavigateAdmin?.("availability"); setOpen(false); }}>Manage unavailable dates ↗</button><button type="button" onClick={() => { onNavigateAdmin?.("services"); setOpen(false); }}>Manage services &amp; prices ↗</button><button type="button" onClick={() => { onNavigateAdmin?.("styleFeed"); setOpen(false); }}>Publish photos &amp; videos ↗</button></> : <><Link href="/order" onClick={() => { track("jts_guide_shortcut_selected", { destination: "book_appointment" }); setOpen(false); }}>Request an appointment ↗</Link><Link href="/account" onClick={() => setOpen(false)}>My account & history ↗</Link><Link href="/feed" onClick={() => setOpen(false)}>Explore style inspiration ↗</Link></>}</nav>
      <div className="jtsGuideThread" aria-live="polite" aria-relevant="additions text">{messages.map(message => <p key={message.id} className={"jtsGuideMessage jtsGuideMessage-"+message.from}>{message.text}</p>)}</div>
      <form className="jtsGuideComposer" onSubmit={send}><input value={input} onChange={event => setInput(event.target.value)} aria-label="Ask the JTS style guide" placeholder="Ask about booking, styles or weather…" maxLength={300}/><button type="submit" disabled={!input.trim()} aria-label="Send message">↗</button></form>
      <p className="jtsGuideDisclaimer">Scripted guidance only. It does not send messages or change booking status.</p>
    </section>}
    <button ref={launcher} type="button" className={"jtsGuideLauncher"+(open ? " is-open" : "")} aria-expanded={open} aria-haspopup="dialog" aria-label={open ? "Close JTS style guide" : "Open JTS style guide"} onClick={() => { if (!open) track("jts_guide_opened", { page: admin ? "admin" : "account" }); setOpen(value => !value); if (!messages.length) answer("Hi! I can help you find a real page or understand the next step. I’m a scripted guide, not a live person or AI assistant."); }}>{open ? "×" : "✳"}<span>{open ? "Close" : "Need a hand?"}</span></button>
  </div>;
}
