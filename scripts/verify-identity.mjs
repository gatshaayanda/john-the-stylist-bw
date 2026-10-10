import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const identityFiles=[
  "src/app/layout.tsx",
  "src/app/manifest.ts",
  "public/sw-jts.js",
  "README.md",
  "AGENTS.md"
];
const required=[
  ["src/app/layout.tsx","/icon-192.png"],
  ["src/app/layout.tsx","/manifest.webmanifest"],
  ["src/app/manifest.ts","/icon-192.png"],
  ["src/app/manifest.ts","/icon-512.png"],
  ["src/app/manifest.ts","John The Stylist Bw"],
  ["public/sw-jts.js","jts-shell-v6"],
  ["public/sw-jts.js","/icon-192.png"],
  ["public/sw-jts.js","/icon-512.png"]
];
const forbiddenPatterns=[
  /boemo-shell-/i,
  /meating[ -]?place/i,
  /boemo/i
];

const failures=[];
for(const [file,needle] of required){
  const content=fs.readFileSync(path.join(root,file),"utf8");
  if(!content.includes(needle)) failures.push(file+" must contain "+needle);
}
for(const file of identityFiles){
  const content=fs.readFileSync(path.join(root,file),"utf8");
  for(const pattern of forbiddenPatterns){
    if(pattern.test(content) && file!=="AGENTS.md") failures.push(file+" contains inherited identity: "+pattern);
  }
}
for(const file of ["public/boemo-assets","public/icon.svg"]){
  if(fs.existsSync(path.join(root,file))) failures.push("inherited branded asset remains: "+file);
}
const manifest=fs.readFileSync(path.join(root,"src/app/manifest.ts"),"utf8");
if(manifest.includes("/icon.svg")) failures.push("manifest still references /icon.svg");
const layout=fs.readFileSync(path.join(root,"src/app/layout.tsx"),"utf8");
if(layout.includes("/icon.svg")) failures.push("metadata still references /icon.svg");

if(failures.length){
  console.error("JTS identity verification FAILED");
  for(const failure of failures) console.error(" - "+failure);
  process.exit(1);
}
console.log("JTS identity verification passed.");
