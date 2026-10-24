"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const briefs = [
  { title: "Icy confidence", note: "A sharp, bright look with a clean finish.", cut: "pixie", colour: "ice", finish: "defined" },
  { title: "Soft statement", note: "Keep the shape expressive, with a warm colour story.", cut: "shape", colour: "warm", finish: "soft" },
  { title: "After-dark edit", note: "A bold, high-contrast look with a precise silhouette.", cut: "pixie", colour: "contrast", finish: "defined" },
];

const cuts = [
  { id: "pixie", label: "Precision pixie", detail: "Short · sculpted", symbol: "✂" },
  { id: "shape", label: "Cut & shape", detail: "Form · balance", symbol: "◒" },
  { id: "change", label: "A full change", detail: "Colour · character", symbol: "✳" },
];
const colours = [
  { id: "ice", label: "Pure white", tone: "ice" },
  { id: "warm", label: "Warm blonde", tone: "warm" },
  { id: "contrast", label: "High contrast", tone: "contrast" },
  { id: "natural", label: "Keep it natural", tone: "natural" },
];
const finishes = [
  { id: "defined", label: "Defined", note: "Crisp, deliberate lines" },
  { id: "soft", label: "Soft", note: "Movement and texture" },
  { id: "bold", label: "Bold", note: "Make the detail stand out" },
];

export default function StyleStudio() {
  const [briefIndex, setBriefIndex] = useState(0);
  const [cut, setCut] = useState("pixie");
  const [colour, setColour] = useState("ice");
  const [finish, setFinish] = useState("defined");
  const [scored, setScored] = useState(false);
  const brief = briefs[briefIndex];
  const score = useMemo(() => {
    let points = 40;
    if (cut === brief.cut) points += 20;
    if (colour === brief.colour) points += 25;
    if (finish === brief.finish) points += 15;
    return points;
  }, [brief, cut, colour, finish]);
  const service = cut === "pixie" ? "pixie-cut" : cut === "shape" ? "cut-pixie" : colour === "ice" || colour === "warm" || colour === "contrast" ? "pure-white" : "cut-bleach";
  const description = `${cuts.find(item => item.id === cut)?.label}; ${colours.find(item => item.id === colour)?.label}; ${finishes.find(item => item.id === finish)?.label} finish. Style Studio brief: ${brief.title}.`;
  const nextBrief = () => {
    setBriefIndex(index => (index + 1) % briefs.length);
    setCut("pixie"); setColour("ice"); setFinish("defined"); setScored(false);
  };

  return <section id="style-studio" className="jtsStudioSection">
    <div className="jtsEditContainer">
      <div className="jtsStudioHeader">
        <div><span className="jtsEditEyebrow">02 / THE STYLE STUDIO</span><h2>A look is <em>made.</em></h2></div>
        <p>A little style exercise between visits. Read the brief, build a look and see how closely your choices match the mood.</p>
      </div>
      <div className="jtsStudioBoard">
        <div className="jtsStudioCanvas">
          <div className="jtsStudioCanvasTop"><span>JTS / STYLE STUDY</span><span>NO. 00{briefIndex + 1}</span></div>
          <div className={`jtsStudioPortrait jtsStudioHair-${colour} jtsStudioCut-${cut} jtsStudioFinish-${finish}`} aria-hidden="true">
            <div className="jtsStudioPortraitHalo" />
            <div className="jtsStudioFace"><div className="jtsStudioHairShape" /><div className="jtsStudioEar left" /><div className="jtsStudioEar right" /><div className="jtsStudioNeck" /><div className="jtsStudioFaceShape"><i className="jtsStudioEye left" /><i className="jtsStudioEye right" /><i className="jtsStudioNose" /><i className="jtsStudioMouth" /></div><div className="jtsStudioBody" /></div>
            <span className="jtsStudioPortraitLabel">THE PERSONAL EDIT</span>
          </div>
          <div className="jtsStudioCanvasFoot"><span>FORM / COLOUR / CHARACTER</span><span>JTS STYLES · BW</span></div>
        </div>
        <div className="jtsStudioControls">
          <div className="jtsStudioBrief"><span>YOUR BRIEF</span><h3>{brief.title}</h3><p>{brief.note}</p></div>
          <fieldset><legend>01 · Choose the cut</legend><div className="jtsStudioCutChoices">{cuts.map(item => <button type="button" key={item.id} className={cut === item.id ? "active" : ""} onClick={() => {setCut(item.id);setScored(false)}}><span>{item.symbol}</span><b>{item.label}</b><small>{item.detail}</small></button>)}</div></fieldset>
          <fieldset><legend>02 · Set the colour</legend><div className="jtsStudioColourChoices">{colours.map(item => <button type="button" key={item.id} className={`jtsStudioSwatch jtsStudioSwatch-${item.tone} ${colour === item.id ? "active" : ""}`} onClick={() => {setColour(item.id);setScored(false)}} aria-pressed={colour === item.id}><span />{item.label}</button>)}</div></fieldset>
          <fieldset><legend>03 · Choose the finish</legend><div className="jtsStudioFinishChoices">{finishes.map(item => <button type="button" key={item.id} className={finish === item.id ? "active" : ""} onClick={() => {setFinish(item.id);setScored(false)}}><b>{item.label}</b><small>{item.note}</small></button>)}</div></fieldset>
          {scored ? <div className="jtsStudioResult" aria-live="polite"><span>YOUR STYLE SCORE</span><strong>{score}<small>/100</small></strong><p>{score >= 85 ? "A close match. You read the brief beautifully." : score >= 65 ? "A strong start. One or two details would shift the mood." : "Interesting direction. Try another combination to match the brief."}</p><div><button type="button" onClick={nextBrief} className="jtsStudioTextButton">Try another brief ↻</button><Link href={`/order?service=${encodeURIComponent(service)}&style=${encodeURIComponent(description)}`} className="jtsEditPrimary">Book this look ↗</Link></div></div> : <button type="button" className="jtsStudioScoreButton" onClick={() => setScored(true)}>Score my look <span>↗</span></button>}
          <p className="jtsStudioDisclaimer">A playful style exercise—not a haircut simulation or a promise of a specific result. John can discuss what suits your hair in person.</p>
        </div>
      </div>
    </div>
  </section>;
}
