"use client";

import Link from "next/link";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";

type StylePost = {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  service?: string;
  tags?: string[];
  createdAt: string;
};

export default function JtsFeedPage() {
  const [posts, setPosts] = useState<StylePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const feedQuery = query(
      collection(db, "styleFeed"),
      where("published", "==", true),
      limit(30)
    );
    return onSnapshot(feedQuery, snapshot => {
      setPosts(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as StylePost)).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 30));
      setLoading(false);
      setUnavailable(false);
    }, () => {
      setUnavailable(true);
      setLoading(false);
    });
  }, []);

  return (
    <main className="jtsJourneyPage">
      <div className="jtsJourneyShell">
        <nav className="jtsJourneyNav">
          <Link href="/" className="jtsJourneyBrand"><img src="/jts.jpg" alt="" /> JTS STYLES</Link>
          <div><Link href="/account">My style</Link><Link href="/order" className="jtsJourneyButton">Book a look ↗</Link></div>
        </nav>
        <header className="jtsFeedHero">
          <span className="jtsJourneyEyebrow">THE JTS STYLE FEED · GABORONE</span>
          <h1>Looks worth<br /><em>coming back for.</em></h1>
          <p>Fresh work, colour ideas and styles from John. Save a look in your mind, then bring it to your next appointment.</p>
          <Link href="/order" className="jtsJourneyButton">Plan your next look ↗</Link>
        </header>
        <section className="jtsFeedSection">
          <div className="jtsJourneySectionHead"><div><span className="jtsJourneyEyebrow">THE LATEST EDIT</span><h2>On the chair.</h2></div><span>{posts.length} {posts.length === 1 ? "look" : "looks"}</span></div>
          {loading ? <div className="jtsJourneyEmpty">Loading the latest looks…</div> : unavailable ? <div className="jtsJourneyEmpty">The feed is temporarily unavailable. Your booking options are still here.</div> : posts.length === 0 ? (
            <div className="jtsJourneyEmpty jtsFeedEmpty">
              <span className="jtsFeedEmptyMark">J✳</span>
              <h3>The first look is on its way.</h3>
              <p>John’s latest cuts and colour work will appear here. Until then, explore the services or request your next appointment.</p>
              <Link href="/order" className="jtsJourneyButton">Book with John ↗</Link>
            </div>
          ) : <div className="jtsFeedGrid">{posts.map(post => (
            <article className="jtsFeedCard" key={post.id}>
              <div className="jtsFeedImage">{post.imageUrl ? <img src={post.imageUrl} alt={post.title || "JTS Styles look"} loading="lazy" /> : <span>JTS ✳</span>}</div>
              <div className="jtsFeedCardBody">
                {post.service && <span className="jtsJourneyEyebrow">{post.service}</span>}
                <h3>{post.title}</h3>
                {post.caption && <p>{post.caption}</p>}
                {!!post.tags?.length && <div className="jtsFeedTags">{post.tags.map(tag => <span key={tag}>#{tag.replace(/^#/, "")}</span>)}</div>}
                <Link href={"/order?service=" + encodeURIComponent(post.service || post.title)} className="jtsFeedBookLink">Ask for this look ↗</Link>
              </div>
            </article>
          ))}</div>}
        </section>
        <section className="jtsFeedReturn">
          <div><span className="jtsJourneyEyebrow">YOUR NEXT CHAPTER</span><h2>Your look.<br /><em>Your record.</em></h2><p>Keep your appointment history close and make the next visit easier.</p></div>
          <div className="jtsFeedReturnActions"><Link href="/account" className="jtsJourneyButton">Open My Style ↗</Link><Link href="/order" className="jtsJourneySecondary">Request an appointment</Link></div>
        </section>
        <footer className="jtsJourneyFooter"><span>JTS STYLES · JOHN THE STYLIST BW</span><div><Link href="/account">My style</Link><a href="https://wa.me/26778053564">WhatsApp John</a></div></footer>
      </div>
    </main>
  );
}
