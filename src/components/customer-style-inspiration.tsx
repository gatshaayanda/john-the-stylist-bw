"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, doc, limit, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { DEFAULT_PUBLIC_SERVICES, normalizePublicServices, type PublicService } from "@/lib/jts/public-services";

type StylePost = { id: string; title?: string; caption?: string; imageUrl?: string; mediaUrl?: string; mediaType?: "image" | "video"; service?: string };

export default function CustomerStyleInspiration() {
  const [services, setServices] = useState<PublicService[]>(DEFAULT_PUBLIC_SERVICES);
  const [posts, setPosts] = useState<StylePost[]>([]);
  useEffect(() => {
    const stopServices = onSnapshot(doc(db, "businessSettings", "publicServices"), snapshot => {
      if (snapshot.exists()) setServices(normalizePublicServices(snapshot.data().services));
    }, () => {});
    const stopPosts = onSnapshot(query(collection(db, "styleFeed"), where("published", "==", true), limit(8)), snapshot => {
      setPosts(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as StylePost)));
    }, () => {});
    return () => { stopServices(); stopPosts(); };
  }, []);
  const serviceMedia = services.flatMap(service => (service.media || []).map((media, index) => ({
    key: service.id + "-" + index, title: service.name, caption: service.note,
    url: media.url, type: media.type, serviceId: service.id,
  })));
  const feedMedia = posts.map(post => ({
    key: "feed-" + post.id, title: post.title || "A look by John",
    caption: post.caption || "", url: post.mediaUrl || post.imageUrl || "",
    type: post.mediaType || "image" as const, serviceId: post.service || post.title || "",
  })).filter(item => item.url);
  const items = [...serviceMedia, ...feedMedia].slice(0, 12);
  return <section className="jtsCustomerInspiration" aria-labelledby="jts-customer-inspiration-title">
    <div className="jtsCustomerInspirationHead"><div><span className="jtsEyebrow">YOUR STYLE REFERENCE</span><h2 id="jts-customer-inspiration-title">Looks to keep in mind.</h2><p>Browse the service examples and John&apos;s latest published work before your next appointment.</p></div><Link href="/feed" className="jtsStyleTextLink">Explore all looks ↗</Link></div>
    {items.length ? <div className="jtsCustomerInspirationGrid">{items.map(item => <article className="jtsCustomerInspirationCard" key={item.key}><div className="jtsCustomerInspirationMedia">{item.type === "video" ? <video src={item.url} controls playsInline preload="metadata" aria-label={item.title} /> : <img src={item.url} alt={item.title} loading="lazy" />}</div><div><span className="jtsEyebrow">{item.serviceId}</span><h3>{item.title}</h3>{item.caption && <p>{item.caption}</p>}<Link href={"/order?service="+encodeURIComponent(item.serviceId)}>Discuss this look ↗</Link></div></article>)}</div> : <div className="jtsStyleEmpty"><p>John&apos;s service photos and published looks will appear here as they are added.</p><Link href="/order" className="jtsButton jtsButtonGold">Request an appointment ↗</Link></div>}
  </section>;
}
