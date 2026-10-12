"use client";

export default function JtsInstallButton(){
 return <button
  type="button"
  className="jtsInstallButton"
  onClick={()=>window.dispatchEvent(new Event("jts-open-install"))}
  aria-label="Install JTS Styles"
 >
  <img src="/jts-logo.svg" alt="" aria-hidden="true" /> Install JTS Styles <span aria-hidden="true">→</span>
 </button>;
}
