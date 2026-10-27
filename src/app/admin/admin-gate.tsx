"use client";
import {GoogleAuthProvider,onAuthStateChanged,signInWithCustomToken,signInWithPopup,signOut,type User} from "firebase/auth";
import {doc,onSnapshot} from "firebase/firestore";
import {useEffect,useState} from "react";
import {auth,db} from "@/lib/firebase/client";

const ADMIN_GOOGLE_EMAILS = new Set(["gatshaayanda@gmail.com","chikohoraknowledge4@gmail.com"]);

function hasAdminRole(data:Record<string,unknown>|undefined){
 return ["owner","staff"].includes(String(data?.role??"").toLowerCase());
}

function friendlyAuthError(err:unknown){
 const code=typeof err==="object"&&err!==null&&"code" in err?String((err as {code?:unknown}).code):"";
 if(code==="auth/too-many-requests") return "Too many sign-in attempts. Wait a moment and try again.";
 if(code==="auth/network-request-failed") return "We could not reach Firebase. Check your internet connection and try again.";
 return err instanceof Error?err.message:"We could not sign you in. Please try Google sign-in again.";
}

export default function AdminGate({children}:{children:React.ReactNode}){
 const[user,setUser]=useState<User|null>(null),[checking,setChecking]=useState(true),[authorized,setAuthorized]=useState(false),[offline,setOffline]=useState(false),[error,setError]=useState(""),[busy,setBusy]=useState(false),[accessWord,setAccessWord]=useState("");

 useEffect(()=>{
  let stopAdmin:undefined|(()=>void);
  const stopAuth=onAuthStateChanged(auth,next=>{
   if(stopAdmin){stopAdmin();stopAdmin=undefined}
   setUser(next);
   setChecking(true);
   setOffline(false);
   if(!next){setAuthorized(false);setChecking(false);return}
   if(next.emailVerified&&ADMIN_GOOGLE_EMAILS.has((next.email??"").trim().toLowerCase())){
    setAuthorized(true);
    setChecking(false);
    return;
   }
   stopAdmin=onSnapshot(doc(db,"admins",next.uid),snapshot=>{
    const allowed=snapshot.exists()&&hasAdminRole(snapshot.data());
    setAuthorized(allowed);
    setOffline(false);
    setChecking(false);
    if(!allowed)void signOut(auth);
   },()=>{
    setOffline(true);
    setChecking(false);
   });
  });
  return ()=>{if(stopAdmin)stopAdmin();stopAuth()};
 },[]);

 async function finishSignIn(action:()=>Promise<User>){
  setBusy(true);setError("");
  try{
   const next=await action();
   const normalizedEmail=(next.email??"").trim().toLowerCase();
   if(!next.emailVerified||!ADMIN_GOOGLE_EMAILS.has(normalizedEmail)){
    setError("Use a verified Google account approved for JTS Operations.");
    await signOut(auth);
    return;
   }
   setAuthorized(true);
   setOffline(false);
   return;

  }catch(err){setError(friendlyAuthError(err))}
  finally{setBusy(false)}
 }

 async function google(){await finishSignIn(async()=> (await signInWithPopup(auth,new GoogleAuthProvider())).user)}

 async function signInWithWord(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");
  try{
   const response=await fetch("/api/admin-login",{method:"POST",headers:{"content-type":"application/json"},cache:"no-store",body:JSON.stringify({word:accessWord})});
   const payload=await response.json() as {token?:string;error?:string};
   if(!response.ok||!payload.token)throw new Error(payload.error??"Access denied. Check the access word and try again.");
   const credential=await signInWithCustomToken(auth,payload.token);
   const roleSnapshot=await new Promise<{exists:boolean;data:()=>Record<string,unknown>}|null>(resolve=>{
    const stop=onSnapshot(doc(db,"admins",credential.user.uid),snapshot=>{stop();resolve({exists:snapshot.exists(),data:()=>snapshot.data()??{}})},()=>{stop();resolve(null)});
   });
   if(!roleSnapshot||!roleSnapshot.exists||!hasAdminRole(roleSnapshot.data())){
    await signOut(auth);
    throw new Error("This access account is not authorized for JTS Operations.");
   }
   setUser(credential.user);setAuthorized(true);setOffline(false);setAccessWord("");
  }catch(err){setError(friendlyAuthError(err))}
  finally{setBusy(false)}
 }

 if(checking)return <main className="adminPage"><div className="adminShell"><div className="emptyState"><div>🔐</div><h1>Opening JTS Operations</h1><p>Checking access…</p></div></div></main>;
 if(user&&authorized)return <div className="adminAuthorized">{offline&&<div className="adminAccountBar"><span>JTS Operations · Offline mode · cached admin access</span><span>Changes will sync when connection returns.</span></div>}<div className="adminAccountBar"><span>JTS Operations · {user.email??"authorized staff"}</span><button className="button buttonLight" type="button" onClick={()=>void signOut(auth)}>Sign out</button></div>{children}</div>;
 return <main className="adminPage adminSignInPage"><div className="adminShell adminSignInShell"><section className="adminPanel adminSignInPanel" aria-labelledby="admin-signin-title"><div className="adminSignInBrand"><img src="/jts.jpg" alt="JTS Styles" /><span>JTS STYLES <i>·</i> OPERATIONS</span></div><div className="adminSignInIntro"><span className="kicker">OWNER &amp; STAFF ACCESS</span><h1 id="admin-signin-title">Operations sign in</h1><p>Use an approved Google account to manage appointment requests and customer reviews.</p></div><button className="googleSignInButton adminGoogleButton" type="button" onClick={()=>void google()} disabled={busy}><svg className="googleSignInMark" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.62 5.91c4.45-4.11 7.14-10.17 7.14-17.56z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.89l-7.62-5.91c-2.12 1.42-4.84 2.26-8.28 2.26-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg><span>{busy?"Signing in with Google…":"Continue with Google"}</span></button>
<div className="adminDivider" aria-hidden="true"><span>OR</span></div>
<form className="adminSignInForm" onSubmit={signInWithWord}>
 <label htmlFor="jts-admin-access-word">One-word admin access</label>
 <input id="jts-admin-access-word" type="password" value={accessWord} onChange={event=>setAccessWord(event.target.value)} autoComplete="current-password" required />
 <button className="adminEmailButton" type="submit" disabled={busy}>{busy?"Checking access…":"Enter"}</button>
</form>{error&&<p role="alert" className="notice adminSignInError">{error}{user&&<><br/><small>Firebase UID: {user.uid}</small></>}</p>}<p className="adminSignInSecurity">Google sign-in is restricted to approved JTS owner and staff accounts.</p></section></div></main>
}
