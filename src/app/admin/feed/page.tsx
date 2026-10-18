"use client";

import AdminGate from "@/app/admin/admin-gate";
import { auth, db } from "@/lib/firebase/client";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type StylePost = { id: string; title: string; caption: string; imageUrl: string; service: string; tags: string[]; published: boolean; createdAt?: string };

function FeedManager() {
  const [posts, setPosts] = useState<StylePost[]>([]);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [service, setService] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => onSnapshot(query(collection(db, "styleFeed"), orderBy("createdAt", "desc")), snapshot => {
    setPosts(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as StylePost)));
  }, () => setNotice("The feed could not load. Check that this account has the owner/staff role and the Firestore rules are published.")), []);

  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) { setNotice("Sign in again before publishing."); return; }
    if (!title.trim() || !imageUrl.trim()) { setNotice("Add a title and the public image URL before saving."); return; }
    try {
      setBusy(true); setNotice("");
      await addDoc(collection(db, "styleFeed"), {
        title: title.trim().slice(0, 100),
        caption: caption.trim().slice(0, 700),
        imageUrl: imageUrl.trim(),
        service: service.trim().slice(0, 60),
        tags: tags.split(",").map(tag => tag.trim().replace(/^#/, "").slice(0, 24)).filter(Boolean).slice(0, 8),
        published,
        createdAt: new Date().toISOString(),
        createdAtServer: serverTimestamp(),
        createdBy: user.uid,
      });
      setTitle(""); setCaption(""); setImageUrl(""); setService(""); setTags(""); setPublished(false);
      setNotice(published ? "Look published to the customer feed." : "Draft saved privately. Publish it when you are ready.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The look could not be saved.");
    } finally { setBusy(false); }
  }

  async function setPostPublished(post: StylePost, next: boolean) {
    try { await updateDoc(doc(db, "styleFeed", post.id), { published: next, updatedAt: new Date().toISOString() }); setNotice(next ? "Look published." : "Look removed from the public feed."); }
    catch { setNotice("That change was not saved. Check your connection and access."); }
  }

  async function removePost(post: StylePost) {
    if (!window.confirm("Delete this feed post? This does not delete the image from UploadThing.")) return;
    try { await deleteDoc(doc(db, "styleFeed", post.id)); setNotice("Feed post deleted. The uploaded image remains in UploadThing until removed there."); }
    catch { setNotice("The feed post could not be deleted."); }
  }

  return <main className="jtsJourneyPage"><div className="jtsJourneyShell">
    <nav className="jtsJourneyNav"><Link href="/" className="jtsJourneyBrand"><img src="/jts.jpg" alt="" /> JTS STYLES</Link><div><Link href="/feed">View public feed ↗</Link><Link href="/admin">Operations</Link></div></nav>
    <header className="jtsAdminFeedHero"><span className="jtsJourneyEyebrow">OWNER WORKSPACE · PUBLISHING</span><h1>Set the <em>next look.</em></h1><p>Publish real JTS work, give each look context, and keep control of what customers see.</p></header>
    <section className="jtsFeedManagerGrid">
      <form className="jtsFeedEditor" onSubmit={createPost}>
        <span className="jtsJourneyEyebrow">NEW FEED POST</span><h2>Publish a look.</h2>
        <label>Title<input value={title} onChange={event => setTitle(event.target.value)} maxLength={100} required placeholder="e.g. Clean pixie with a sharp finish" /></label>
        <label>Photo URL<input value={imageUrl} onChange={event => setImageUrl(event.target.value)} type="url" required placeholder="Paste the public URL from UploadThing" /><small>Upload the photo to your existing UploadThing workspace, then paste its public URL here. This repository does not yet include UploadThing’s in-app upload SDK.</small></label>
        {imageUrl && <div className="jtsFeedEditorPreview"><img src={imageUrl} alt="Feed photo preview" /></div>}
        <label>Service / style<input value={service} onChange={event => setService(event.target.value)} maxLength={60} placeholder="Pixie cut, colour, barbering…" /></label>
        <label>Caption<textarea value={caption} onChange={event => setCaption(event.target.value)} maxLength={700} rows={4} placeholder="Describe the look or share an update." /></label>
        <label>Tags <small>Separate with commas</small><input value={tags} onChange={event => setTags(event.target.value)} placeholder="pixie, colour, freshcut" /></label>
        <label className="jtsFeedPublishToggle"><input type="checkbox" checked={published} onChange={event => setPublished(event.target.checked)} /> Publish immediately to the public feed</label>
        <button className="jtsJourneyButton" disabled={busy}>{busy ? "Saving…" : published ? "Publish this look ↗" : "Save as draft"}</button>
        {notice && <p className="jtsFeedNotice" role="status">{notice}</p>}
      </form>
      <section className="jtsFeedPostsAdmin"><div className="jtsJourneySectionHead"><div><span className="jtsJourneyEyebrow">CONTENT CONTROL</span><h2>Published & drafts.</h2></div><span>{posts.length} posts</span></div>
        {!posts.length ? <div className="jtsJourneyEmpty">Your published looks and drafts will appear here.</div> : posts.map(post => <article className="jtsFeedAdminRow" key={post.id}>
          {post.imageUrl && <img src={post.imageUrl} alt="" />}
          <div className="jtsFeedAdminCopy"><span className={post.published ? "jtsFeedStatus isPublished" : "jtsFeedStatus"}>{post.published ? "Published" : "Draft"}</span><strong>{post.title}</strong><small>{post.service || "JTS Styles"}{post.tags?.length ? " · " + post.tags.map(tag => "#" + tag).join(" ") : ""}</small>
            <div className="jtsFeedAdminActions"><button type="button" onClick={() => void setPostPublished(post, !post.published)}>{post.published ? "Unpublish" : "Publish"}</button><button type="button" onClick={() => void removePost(post)}>Delete post</button></div>
          </div>
        </article>)}
      </section>
    </section>
  </div></main>;
}

export default function AdminFeedPage() {
  return <AdminGate><FeedManager /></AdminGate>;
}
