import type {Metadata,Viewport} from "next";
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
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:brand.name,template:"%s | "+brand.name},description:brand.description,applicationName:brand.name,keywords:["John The Stylist Bw","hairstylist","barber shop","Gaborone","G West","Botswana"],alternates:{canonical:"/"},openGraph:{type:"website",url:siteUrl,siteName:"John The Stylist Bw",title:"John The Stylist Bw",description:"Book your next hairstyle with John The Stylist Bw."},twitter:{card:"summary",title:"John The Stylist Bw",description:"Book your next hairstyle with John The Stylist Bw."},icons:{icon:brand.icon192,apple:brand.icon192},manifest:brand.manifest,appleWebApp:{capable:true,title:"JTS Styles",statusBarStyle:"black-translucent"}};
export const viewport:Viewport={themeColor:brand.themeColor,colorScheme:"light"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Script id="jts-install-event-capture" strategy="beforeInteractive">{`window.addEventListener("beforeinstallprompt",function(event){event.preventDefault();window.jtsInstallPrompt=event;window.dispatchEvent(new Event("jts-install-available"));});`}</Script><PwaRegister/><JtsBrowserGate/>{children}<Analytics/><SpeedInsights/></body></html>}