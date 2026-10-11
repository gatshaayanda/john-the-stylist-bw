import type {Metadata,Viewport} from "next";
import {headers} from "next/headers";
import Script from "next/script";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from "@vercel/speed-insights/next";
import PwaRegister from "@/app/pwa-register";
import JtsBrowserGate from "@/app/jts-browser-gate";
import {brand} from "@/config/brand";
import "./globals.css";
import "./pwa.css";
import "./jts-account.css";

const siteUrl=process.env.NEXT_PUBLIC_BASE_URL||"https://john-the-stylist-bw.vercel.app";
type HandoffContext="whatsapp"|"instagram"|"facebook"|"messenger"|"linkedin"|"embedded"|"browser";
const EMBEDDED_BROWSER_PATTERN=/WhatsApp|Instagram|FBAN|FBAV|Messenger|Line\/|Twitter|TikTok|Snapchat|LinkedInApp/i;
const REQUESTED_WITH_PATTERN=/^(com\.whatsapp|com\.instagram\.android|com\.facebook\.katana|com\.facebook\.lite|com\.facebook\.orca)$/i;
function detectContext(userAgent:string):HandoffContext {
 const value=userAgent.toLowerCase();
 if(value.includes("whatsapp"))return "whatsapp";
 if(value.includes("instagram"))return "instagram";
 if(value.includes("fban")||value.includes("fbav"))return "facebook";
 if(value.includes("messenger"))return "messenger";
 if(value.includes("linkedinapp"))return "linkedin";
 if(/line\/|twitter|tiktok|snapchat|; wv\)|\bwv\b|\bwebview\b/.test(value))return "embedded";
 return "browser";
}
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:brand.name,template:"%s | "+brand.name},description:brand.description,applicationName:brand.name,keywords:["John The Stylist Bw","hairstylist","barber shop","Gaborone","G West","Botswana"],alternates:{canonical:"/"},openGraph:{type:"website",url:siteUrl,siteName:"JTS Styles",title:"JTS Styles | John The Stylist Bw",description:"Book your next hairstyle with JTS Styles.",images:[{url:brand.logo,alt:"JTS Styles — Hair Stylist"}]},twitter:{card:"summary",title:"JTS Styles | John The Stylist Bw",description:"Book your next hairstyle with JTS Styles.",images:[brand.logo]},icons:{icon:[{url:brand.iconSvg,type:"image/svg+xml"},{url:brand.icon192,sizes:"192x192",type:"image/png"}],apple:brand.icon192},manifest:brand.manifest,appleWebApp:{capable:true,title:"JTS Styles",statusBarStyle:"black-translucent"}};
export const viewport:Viewport={themeColor:brand.themeColor,colorScheme:"light"};

export default async function RootLayout({children}:{children:React.ReactNode}){
 const requestHeaders=await headers();
 const userAgent=requestHeaders.get("user-agent")||"";
 const requestedWith=requestHeaders.get("x-requested-with")||"";
 // Match The Plug's proven server-first gate: the handoff is in the first HTML,
 // not delayed until a client effect runs after the customer sees the homepage.
 const embedded=EMBEDDED_BROWSER_PATTERN.test(userAgent)
   ||(/Android/i.test(userAgent)&&/; wv\)/i.test(userAgent))
   ||REQUESTED_WITH_PATTERN.test(requestedWith);
 const detectedContext=detectContext(userAgent);
 const initialContext=embedded?(detectedContext==="browser"?"embedded":detectedContext):"browser";
 const initialAndroid=/Android/i.test(userAgent);
 const initialIos=/iPhone|iPad|iPod/i.test(userAgent)||(/Macintosh/i.test(userAgent)&&/Mobile/i.test(userAgent));
 return <html lang="en"><body style={embedded?{overflow:"hidden"}:undefined}>
  <Script id="jts-embedded-browser-guard" strategy="beforeInteractive">{`(function(){var ua=navigator.userAgent||"";var lower=ua.toLowerCase();var embedded=/WhatsApp|Instagram|FBAN|FBAV|Messenger|Twitter|TikTok|Snapchat|LinkedInApp/i.test(ua)||lower.indexOf("line/")!==-1||(/Android/i.test(ua)&&lower.indexOf("; wv)")!==-1);var standalone=window.matchMedia("(display-mode: standalone)").matches||("standalone" in navigator&&Boolean(navigator.standalone));if(embedded&&!standalone)document.documentElement.classList.add("jts-embedded-pending");})();`}</Script>
  <Script id="jts-install-event-capture" strategy="beforeInteractive">{`window.addEventListener("beforeinstallprompt",function(event){event.preventDefault();window.jtsInstallPrompt=event;window.dispatchEvent(new Event("jts-install-available"));});`}</Script>
  <JtsBrowserGate initialContext={initialContext} initialAndroid={initialAndroid} initialIos={initialIos}/>
  {!embedded&&<><PwaRegister/>{children}<Analytics/><SpeedInsights/></>}
 </body></html>;
}