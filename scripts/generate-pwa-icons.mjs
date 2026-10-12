import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = path.join(root, "public/icon-512.png");
const target = path.join(root, "public/icon-192.png");
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const sourceBytes = await fs.readFile(source);
if (!sourceBytes.subarray(0, 8).equals(pngSignature)) {
  throw new Error("PWA icon source public/icon-512.png is not a valid PNG.");
}
const sourceMetadata = await sharp(sourceBytes).metadata();
if (sourceMetadata.width !== 512 || sourceMetadata.height !== 512) {
  throw new Error(`Expected a 512x512 source icon; got ${sourceMetadata.width}x${sourceMetadata.height}.`);
}

const temporary = target + ".generated";
await sharp(sourceBytes)
  .resize(192, 192, { fit: "contain", background: "#050505" })
  .png({ compressionLevel: 9 })
  .toFile(temporary);
await fs.rename(temporary, target);

const outputBytes = await fs.readFile(target);
const outputMetadata = await sharp(outputBytes).metadata();
if (!outputBytes.subarray(0, 8).equals(pngSignature) || outputMetadata.width !== 192 || outputMetadata.height !== 192) {
  throw new Error("Generated icon-192.png failed PNG signature/dimension verification.");
}
console.log("Generated and verified public/icon-192.png (192x192 PNG).");
