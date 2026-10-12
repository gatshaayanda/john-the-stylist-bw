"use client";

type InstallPromptEvent = Event & {
 prompt: () => void | Promise<void>;
 userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
 interface Window {
  jtsInstallPrompt?: InstallPromptEvent | null;
  __jtsEarlyInstallPrompt?: Event | null;
  jtsInstallApp?: () => Promise<"accepted" | "dismissed" | "unavailable">;
 }
}

export default function JtsInstallButton() {
 function installFromClick() {
  // The early layout script can capture the browser event before PwaRegister's
  // React effect has installed its controller. Use that retained event directly
  // in this click rather than falling into the help modal during that race.
  const promptEvent = window.jtsInstallPrompt
   ?? (window.__jtsEarlyInstallPrompt as InstallPromptEvent | null | undefined)
   ?? null;

  if (promptEvent && typeof promptEvent.prompt === "function") {
   try {
    const promptResult = promptEvent.prompt();
    window.jtsInstallPrompt = null;
    window.__jtsEarlyInstallPrompt = null;
    window.dispatchEvent(new Event("jts-install-consumed"));
    void Promise.resolve(promptResult).then(() => promptEvent.userChoice).then((choice) => {
     if (choice.outcome === "accepted") window.dispatchEvent(new Event("jts-install-complete"));
    }).catch(() => {
     window.dispatchEvent(new Event("jts-open-install"));
    });
    return;
   } catch {
    window.jtsInstallPrompt = null;
    window.__jtsEarlyInstallPrompt = null;
    window.dispatchEvent(new Event("jts-install-consumed"));
   }
  }

  // Normal path: the PWA controller invokes prompt() before its first await.
  const install = window.jtsInstallApp;
  if (!install) {
   window.dispatchEvent(new Event("jts-open-install"));
   return;
  }
  void install().then((outcome) => {
   if (outcome === "unavailable") window.dispatchEvent(new Event("jts-open-install"));
  }).catch(() => window.dispatchEvent(new Event("jts-open-install")));
 }

 return <button
  type="button"
  className="jtsInstallButton"
  onClick={installFromClick}
  aria-label="Install JTS Styles"
 >
  <img src="/jts-logo.svg" alt="" aria-hidden="true" /> Install JTS Styles <span aria-hidden="true">→</span>
 </button>;
}
