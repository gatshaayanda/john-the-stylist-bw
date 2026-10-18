"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, getDocs, limit, query, where } from "firebase/firestore";
import { getIdToken, onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { useUploadThing } from "@/lib/uploadthing";

type StyleReview = {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  caption: string;
  imageUrl: string;
  rating: number;
  comparison: "first" | "happier" | "same" | "less-happy";
  createdAt: string;
  published: boolean;
  status: string;
};

function comparisonLabel(value: StyleReview["comparison"]) {
  if (value === "happier") return "Happier than last time";
  if (value === "same") return "Just as happy as last time";
  if (value === "less-happy") return "Less happy than last time";
  return "First JTS review";
}

function shortDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : value;
}

export default function CustomerStyleReview() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [reviews, setReviews] = useState<StyleReview[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);
  const [comparison, setComparison] = useState<"happier" | "same" | "less-happy">("same");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [service, setService] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const { startUpload, isUploading } = useUploadThing("customerStyleImage", {
    headers: async () => {
      const current = auth.currentUser;
      if (!current) throw new Error("Open your JTS session before uploading.");
      return { Authorization: "Bearer " + await getIdToken(current) };
    },
  });

  useEffect(() => onAuthStateChanged(auth, next => {
    setUser(next);
    if (next?.displayName) setCustomerName(current => current || next.displayName || "");
    setAuthReady(true);
  }), []);

  useEffect(() => {
    if (!user) {
      setReviews([]);
      return;
    }
    let cancelled = false;
    void getDocs(query(collection(db, "customerStyleReviews"), where("customerId", "==", user.uid), limit(40)))
      .then(snapshot => {
        if (cancelled) return;
        setReviews(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as StyleReview))
          .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")));
      })
      .catch(() => {
        if (!cancelled) setError("Your earlier reviews could not be loaded. You can still browse the feed.");
      });
    return () => { cancelled = true; };
  }, [user]);

  const previousReview = useMemo(() => reviews[0], [reviews]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!photo) {
      setError("Choose a photo of your look before publishing.");
      return;
    }
    if (!caption.trim()) {
      setError("Add a few words about your experience with John.");
      return;
    }
    if (photo.size > 4 * 1024 * 1024) {
      setError("Choose a photo smaller than 4 MB.");
      return;
    }
    if (!photo.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setBusy(true);
    try {
      let current = auth.currentUser;
      if (!current) current = (await signInAnonymously(auth)).user;
      setUser(current);
      const uploadResult = await startUpload([photo]);
      const uploaded = uploadResult?.[0];
      const imageUrl = uploaded?.ufsUrl || uploaded?.url;
      const imageKey = uploaded?.key;
      if (!imageUrl || !imageKey) throw new Error("The photo did not finish uploading. Please try again.");

      const existing = await getDocs(query(collection(db, "customerStyleReviews"), where("customerId", "==", current.uid), limit(40)));
      const history = existing.docs
        .map(item => ({ id: item.id, ...item.data() } as StyleReview))
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      const previous = history[0];
      const nextComparison = previous ? comparison : "first";
      const createdAt = new Date().toISOString();
      const nextReview = {
        customerId: current.uid,
        customerName: customerName.trim().slice(0, 60) || current.displayName || "JTS customer",
        title: title.trim().slice(0, 80) || "My JTS look",
        caption: caption.trim().slice(0, 700),
        imageUrl,
        imageKey,
        service: service.trim().slice(0, 80),
        rating,
        comparison: nextComparison,
        previousReviewId: previous?.id || "",
        createdAt,
        published: true,
        status: "published",
      };
      await addDoc(collection(db, "customerStyleReviews"), nextReview);
      setReviews(currentReviews => [{ ...nextReview, id: "local-" + createdAt, } as StyleReview, ...currentReviews]);
      setTitle("");
      setCaption("");
      setService("");
      setPhoto(null);
      const input = document.getElementById("jts-customer-style-photo") as HTMLInputElement | null;
      if (input) input.value = "";
      setMessage(previous
        ? "Your look and repeat review are published. We’ve saved how you feel compared with your last review."
        : "Your look and first review are published to the JTS Style Feed.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn’t publish your look. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="jtsCustomerReview" id="share-your-look">
    <div className="jtsCustomerReviewIntro">
      <span className="jtsJourneyEyebrow">YOUR LOOK, YOUR WORDS</span>
      <h2>Show the cut.<br /><em>Tell the story.</em></h2>
      <p>Share a photo of your JTS look and leave an honest review. When you come back, your next review records whether you feel happier, just as happy, or less happy than last time.</p>
      <small>Only share photos you have permission to post. Your picture and review are public on the JTS Style Feed.</small>
    </div>
    <form className="jtsCustomerReviewForm" onSubmit={submit}>
      <label>Photo of your look
        <input id="jts-customer-style-photo" type="file" accept="image/*" capture="environment" onChange={event => setPhoto(event.target.files?.[0] || null)} />
        <small>One image · maximum 4 MB · JPG, PNG or another supported image format.</small>
      </label>
      {photo && <div className="jtsCustomerPhotoSelected"><span>{photo.name}</span><small>{(photo.size / 1024 / 1024).toFixed(2)} MB selected</small></div>}
      <label>Your name (optional)
        <input value={customerName} maxLength={60} onChange={event => setCustomerName(event.target.value)} placeholder="Name to show with your review" />
      </label>
      <label>Give your look a title
        <input value={title} maxLength={80} onChange={event => setTitle(event.target.value)} placeholder="Fresh fade, new colour, clean finish…" />
      </label>
      <label>Service (optional)
        <input value={service} maxLength={80} onChange={event => setService(event.target.value)} placeholder="e.g. Fade, braids, colour" />
      </label>
      <label>Your review
        <textarea value={caption} maxLength={700} onChange={event => setCaption(event.target.value)} required rows={4} placeholder="How did John do? What do you love about the result?" />
        <small>{caption.length}/700 characters</small>
      </label>
      <fieldset className="jtsCustomerRating">
        <legend>How happy are you with your look?</legend>
        <div className="jtsCustomerStars" role="radiogroup" aria-label="Rating out of five">
          {[1, 2, 3, 4, 5].map(value => <button key={value} type="button" aria-pressed={rating === value} className={rating >= value ? "isSelected" : ""} onClick={() => setRating(value)}>{rating >= value ? "★" : "☆"}<span className="jtsVisuallyHidden">{value} out of 5</span></button>)}
          <strong>{rating}/5</strong>
        </div>
      </fieldset>
      {previousReview ? <fieldset className="jtsCustomerComparison">
        <legend>Compared with your last review</legend>
        <p>Your last review was on {shortDate(previousReview.createdAt)} with {previousReview.rating}/5.</p>
        {([
          ["happier", "Happier than last time"],
          ["same", "Just as happy as last time"],
          ["less-happy", "Less happy than last time"],
        ] as const).map(([value, label]) => <label key={value} className="jtsCustomerComparisonOption">
          <input type="radio" name="jts-review-comparison" checked={comparison === value} onChange={() => setComparison(value)} />
          <span>{label}</span>
        </label>)}
      </fieldset> : <p className="jtsCustomerFirstReview">This will be your first JTS review. Your next one can be compared with this review.</p>}
      <button className="jtsJourneyButton" type="submit" disabled={!authReady || busy || isUploading}>{busy || isUploading ? "Publishing your look…" : "Publish my look & review ↗"}</button>
      {(error || message) && <p className={error ? "jtsCustomerReviewError" : "jtsCustomerReviewSuccess"} role="status">{error || message}</p>}
    </form>
    {reviews.length > 0 && <div className="jtsCustomerReviewHistory">
      <div className="jtsJourneySectionHead"><div><span className="jtsJourneyEyebrow">YOUR STYLE JOURNAL</span><h3>Reviews over time.</h3></div><span>{reviews.length} saved</span></div>
      <div className="jtsCustomerReviewList">{reviews.map(review => <article key={review.id} className="jtsCustomerReviewRow">
        {review.imageUrl && <img src={review.imageUrl} alt="" loading="lazy" />}
        <div><span className="jtsJourneyEyebrow">{shortDate(review.createdAt)} · {review.rating}/5</span><h4>{review.title}</h4><p>{review.caption}</p><small>{comparisonLabel(review.comparison)} · {review.status === "published" ? "Published" : "Awaiting review"}</small></div>
      </article>)}</div>
    </div>}
  </section>;
}
