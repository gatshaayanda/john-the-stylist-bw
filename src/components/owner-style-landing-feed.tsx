"use client";

import Link from "next/link";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";

type StylePost = { id: string; title?: string; caption?: string; imageUrl?: string; mediaUrl?: string; mediaType?: "image" | "video"; service?: string; tags?: string[]; createdAt?: string };

export default function OwnerStyleLandingFeed() {
  const [posts, setPosts] = useState<StylePost[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => onSnapshot(query(collection(db, "styleFeed"), where("published", "==", true), limit(6)), snapshot => {
    setPosts(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as StylePost)).sort((a,b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))));
    setLoaded(true);
  }, () => setLoaded(true)), []);
  if (!loaded || posts.length === 0) return null;
  return <section className="jtsStyleLanding" id="johns-edit">
    <div className="jtsEditContainer">
      <div className="jtsEditSectionHead"><div><span className="jtsEditEyebrow">02 / JOHN&apos;S STYLE FEED</span><h2>Fresh from <em>the chair.</em></h2></div><p>Real cuts, colour work and style ideas from John. Find a direction for your next appointment.</p></div>
      <div className="jtsStyleLandingGrid">{posts.map(post => {
        const media = post.mediaUrl || post.imageUrl || "";
        const isVideo = post.mediaType === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(media);
        return <article className="jtsStyleLandingCard" key={post.id}>
          <div className="jtsStyleLandingMedia">{media ? isVideo ? <video src={media} controls playsInline preload="metadata" aria-label={post.title || "JTS style video"} /> : <img src={media} alt={post.title || "JTS finished look"} loading="lazy" /> : <span>JTS ✳</span>}</div>
          <div className="jtsStyleLandingCopy"><span className="jtsEditEyebrow">{post.service || "JTS STYLE"}</span><h3>{post.title || "A look by John"}</h3>{post.caption && <p>{post.caption}</p>}<Link href={"/order?service="+encodeURIComponent(post.service || "")}>Discuss this look ↗</Link></div>
        </article>;
      })}</div>
      <div className="jtsStyleLandingFooter"><span>Save a look you like for your next visit.</span><Link href="/feed">Explore the full style feed ↗</Link></div>
    </div>
  </section>;
}
