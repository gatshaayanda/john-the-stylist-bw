"use client";

import Link from "next/link";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import CustomerStyleReview from "@/components/CustomerStyleReview";

type StylePost = {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  service?: string;
  tags?: string[];
  createdAt: string;
  kind?: "owner" | "customer";
  customerName?: string;
  rating?: number;
  comparison?: "first" | "happier" | "same" | "less-happy";
};

function comparisonText(value?: StylePost["comparison"]) {
  if (value === "happier") return "Happier than last time";
  if (value === "same") return "Just as happy as last time";
  if (value === "less-happy") return "Less happy than last time";
  return "";
}

export default function JtsFeedPage() {
  const [ownerPosts, setOwnerPosts] = useState<StylePost[]>([]);
  const [customerPosts, setCustomerPosts] = useState<StylePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const posts = [...ownerPosts, ...customerPosts]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 40);

  useEffect(() => {
    let ownerReady = false;
    let customersReady = false;
    const finishLoading = () => {
      if (ownerReady && customersReady) setLoading(false);
    };
    const stopOwner = onSnapshot(
      query(collection(db, "styleFeed"), where("published", "==", true), limit(30)),
      snapshot => {
        setOwnerPosts(snapshot.docs.map(item => ({ id: item.id, ...item.data(), kind: "owner" } as StylePost)));
        ownerReady = true;
        finishLoading();
        setUnavailable(false);
      },
      () => { setUnavailable(true); setLoading(false); }
    );
    const stopCustomers = onSnapshot(
      query(collection(db, "customerStyleReviews"), where("published", "==", true), limit(30)),
      snapshot => {
        setCustomerPosts(snapshot.docs.map(item => ({ id: item.id, ...item.data(), kind: "customer" } as StylePost)));
        customersReady = true;
        finishLoading();
        setUnavailable(false);
      },
      () => { setUnavailable(true); setLoading(false); }
    );
    return () => { stopOwner(); stopCustomers(); };
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
          <p>Fresh work from John and real looks from the JTS community. Share your picture, leave a review and keep your style journey growing.</p>
          <div className="jtsFeedHeroActions"><Link href="#share-your-look" className="jtsJourneyButton">Share my look ↗</Link><Link href="/order" className="jtsJourneySecondary">Plan your next look</Link></div>
        </header>

        <CustomerStyleReview />

        <section className="jtsFeedSection">
          <div className="jtsJourneySectionHead"><div><span className="jtsJourneyEyebrow">THE LATEST EDIT</span><h2>On the chair.</h2></div><span>{posts.length} {posts.length === 1 ? "look" : "looks"}</span></div>
          {loading ? <div className="jtsJourneyEmpty">Loading the latest looks…</div> : unavailable ? <div className="jtsJourneyEmpty">The feed is temporarily unavailable. Your booking options are still here.</div> : posts.length === 0 ? (
            <div className="jtsJourneyEmpty jtsFeedEmpty">
              <span className="jtsFeedEmptyMark">J✳</span>
              <h3>The first look is on its way.</h3>
              <p>John’s latest cuts and customer-shared looks will appear here. Share yours above or request your next appointment.</p>
              <Link href="/order" className="jtsJourneyButton">Book with John ↗</Link>
            </div>
          ) : <div className="jtsFeedGrid">{posts.map(post => (
            <article className="jtsFeedCard" key={post.kind + "-" + post.id}>
              <div className="jtsFeedImage">{post.imageUrl ? <img src={post.imageUrl} alt={post.title || "JTS Styles look"} loading="lazy" /> : <span>JTS ✳</span>}</div>
              <div className="jtsFeedCardBody">
                <span className="jtsJourneyEyebrow">{post.kind === "customer" ? "CUSTOMER LOOK" : (post.service || "JTS STYLE")}</span>
                <h3>{post.title || "A JTS look"}</h3>
                {post.kind === "customer" && <div className="jtsCustomerFeedRating"><span>{"★".repeat(Math.max(0, Math.min(5, post.rating || 0)))}{"☆".repeat(5 - Math.max(0, Math.min(5, post.rating || 0)))}</span><b>{post.rating || 0}/5</b></div>}
                {post.caption && <p>{post.caption}</p>}
                {post.kind === "customer" && <small className="jtsCustomerFeedByline">Shared by {post.customerName || "a JTS customer"}{comparisonText(post.comparison) ? " · " + comparisonText(post.comparison) : ""}</small>}
                {!!post.tags?.length && <div className="jtsFeedTags">{post.tags.map(tag => <span key={tag}>#{tag.replace(/^#/, "")}</span>)}</div>}
                <Link href={"/order?service=" + encodeURIComponent(post.service || post.title || "JTS look")} className="jtsFeedBookLink">Ask for this look ↗</Link>
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
