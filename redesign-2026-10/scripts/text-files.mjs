// Shared by the gates: which files are text, and how to read them the way a browser would.
// Every file under sites/ and src/ is scanned unless it is binary by extension or by its first bytes.
import crypto from "node:crypto";

export const BINARY_EXT = /\.(png|jpe?g|gif|webp|avif|ico|bmp|tiff?|woff2?|ttf|otf|eot|pdf|mp4|mov|webm|mp3|wav|zip|gz|tgz|br)$/i;
export const TEXT_EXT = /\.(html?|svg|css|scss|sass|js|mjs|cjs|md|markdown|txt|xml|json|ya?ml|webmanifest|csv|map)$/i;
const MAGIC = [[0x89, 0x50, 0x4e, 0x47], [0xff, 0xd8, 0xff], [0x47, 0x49, 0x46, 0x38], [0x25, 0x50, 0x44, 0x46], [0x50, 0x4b, 0x03, 0x04], [0x52, 0x49, 0x46, 0x46], [0x00, 0x00, 0x00]];

/** True for a binary file: a binary extension, or no text extension and a known binary signature. */
export const isBinary = (rel, buf) => BINARY_EXT.test(rel) || (!TEXT_EXT.test(rel) && MAGIC.some((m) => m.every((b, i) => buf[i] === b)));

/** A UTF-16 byte-order mark is decoded as browsers do (the WHATWG Encoding standard has no UTF-32, so FF FE 00 00
 * is UTF-16LE); otherwise UTF-8. A NUL is reported, then removed. */
export function readText(buf) {
  let text, bom = true;
  if (buf[0] === 0xff && buf[1] === 0xfe) text = new TextDecoder("utf-16le").decode(buf.subarray(2));
  else if (buf[0] === 0xfe && buf[1] === 0xff) text = new TextDecoder("utf-16be").decode(buf.subarray(2));
  else { text = new TextDecoder("utf-8").decode(buf); bom = false; }
  const nul = text.includes("\0");
  return { text: text.replace(/\0/g, ""), bom, nul };
}

export const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

/** Em dash and its look-alikes (U+2014, U+2015, U+2E3A, U+2E3B). */
export const EM_DASH = /[\u2014\u2015\u2e3a\u2e3b]/;
