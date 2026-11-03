// Copy gate for everything GitHub Pages publishes from main for credtent.org.
// Run: node .github/scripts/check-live-copy.mjs
//
// Coverage: every tracked file except .github/ and the _config.yml "exclude" entries ("include" entries are
// always kept). Underscore and dot paths are scanned too, because _includes, _layouts and _data render into
// served pages. Every file path and every non-binary file is checked for private-list names; pages, Markdown,
// text, SVG, CSS content strings and JS string literals are also checked against the claim rules. A served
// file with front matter that uses Liquid fails until a person reviews what it renders.
//
// Names are NOT listed in this public repository (see private-names.mjs): the gate reads the
// CREDTENT_REVIEW_NAMES secret or the gitignored .github/scripts/review-names.local.txt, and fails closed
// without either. Failures print the file, line and rule only, never page text, so no name reaches a log.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import { loadPrivateNames, findNames, nameLines, decodeAll, redactLine, binaryText, LOCAL_FILE, MISSING_MESSAGE } from "./private-names.mjs";

// CHECK_ROOT lets CI run the gate scripts from main against a pull request's tree.
export const ROOT = process.env.CHECK_ROOT ? path.resolve(process.env.CHECK_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
// Exempt from the claim rules, each pinned to the sha256 of the version on main: the current terms and privacy
// policy stay verbatim until the revised terms take effect (EB 2026-11-01), and lws.html and parking/lws.html
// stay untouched while Cherryh's legal hold item 11 is open (the 2026-11-01 capture covers both pages). Any
// change to a pinned file fails until the pin is reviewed and updated.
export const EXEMPT = new Map([
  ["terms-of-service.html", "2a43523f0631d87f383a10b992129b8b9db86e7801be6059e08fdb65e838e635"],
  ["privacy-policy.html", "d3c53c6fc6b27bf011e5920dfda1742cf4674d37e10bb06fd8ca1b7e8fe84d07"],
  ["lws.html", "315a2fd0423a37d47f5347899c71956c656d1430f6c8751fb0a6e5f66242324a"],
  ["parking/lws.html", "485df8ee612ecdd82b77f366c72ae35336b598cc43dc66b2bcfc0494b611fac0"]
]);
// Files that assemble text at run time and that a person has read, pinned to the sha256 reviewed (Clarke,
// 2026-11-02: components.js builds nav links from ${base} and literal labels, which the claim rules read).
export const REVIEWED_RENDER_TIME = new Map([
  ["components.js", "8370d89f4275032c4280513886d1cf0f0dd18e78d5dd7118cb834ff301ddd370"]
]);
const CLAIMS = /\.(html?|txt|md|markdown|svg|css|scss|sass|js|mjs|xml|json|ya?ml|webmanifest)$/i;
// Real binaries, by extension or magic bytes. Anything else is read as text.
const BINARY_EXT = /\.(png|jpe?g|gif|webp|avif|ico|bmp|tiff?|woff2?|ttf|otf|eot|pdf|mp4|mov|webm|mp3|wav|zip|gz|tgz|br)$/i;
const TEXT_EXT = /\.(html?|svg|css|scss|sass|js|mjs|md|markdown|txt|xml|json|ya?ml|webmanifest|csv)$/i;

export const RULES = [
  { id: "em-dash", re: /[\u2014\u2015\u2e3a\u2e3b]/ },
  { id: "spaced-en-dash", re: /\s\u2013\s/ },
  // LD-015 item 1.2, EB card "Hide Premium" (2026-10-31): no $49 Opt-Out Premium offer on public pages until 2026-12-31.
  { id: "hidden-49-premium", re: /Opt-Out Premium[^.<]{0,80}\$\s?49\b|\$\s?49[^.<]{0,40}Opt-Out Premium/i },
  { id: "premium-included-in-49", re: /Everything in Opt-Out Premium/i },
  // LD-058 as amended 2026-10-31 and 2026-11-01: Creator Licensing is not shown at $99 without the $49 promo.
  { id: "licensing-99-without-promo", re: /Creator Licensing[^.<]{0,40}\$\s?99/i },
  { id: "free-forever-promise", re: /always free|free,? (always|forever)|(will )?stays? free|remain free permanently|always will be|free forever|\.\s*Forever\./i },
  { id: "forever-near-free", re: /\b(free|opt-?out)\b[^.<]{0,30}\bforever\b|\bforever\b[^.<]{0,30}\b(free|opt-?out)\b/i },
  { id: "pbc-legal-duty-claim", re: /legally (obligat|bound)\w*/i },
  { id: "written-into", re: /written into (every|its corporate|the company|our corporate)/i },
  { id: "pbc-as-cause-of-neutrality", re: /(As a|as a) Delaware Public Benefit Corporation, Credtent (acts|is) (as )?a neutral|Public Benefit Corporation, structurally (neutral|independent)/ },
  { id: "old-wga-price", re: /\$149\b|\$298\b/ },
  { id: "superseded-249", re: /\$\s?249\b/ },
  // 85/15 is Credtent's standard terms, not every deal; the WGA discount is screenplay-only and WGA West-only.
  { id: "85-every-deal", re: /85\s?(%|percent)\s+of\s+(every|all)\b|\bevery\s+(licensing\s+)?deal\s+(Credtent|we)\s+closes?\s+(sends|routes|pays|returns)\s+85|85\s?%\s+of\s+gross\s+revenue\s+from\s+every\b|85\s?(%|percent)\s+on\s+every\b/i },
  // "Every deal" near 85% is a claim about every deal unless the sentence says standard terms
  // ("approve every deal ... receive 85% ... under standard terms" is not).
  { id: "every-contract-or-no-exceptions", test: (text) => /\bevery contract\b|\bNo exceptions\b|\breturns 85\s?%/i.test(text) ||
    text.split(/(?<=[.?!])\s+/).some((x) => /\bevery deal\b[^.<]{0,60}\b85\s?%/i.test(x) && !/standard terms/i.test(x)) },
  // Ported from the new-sites launch gate so both gates agree (claims removed in #23).
  { id: "every-contract-split", re: /written into every|whatever the deal size|built in, not aspirational/i },
  { id: "wga-discount-widened", re: /WGA members receive a discount|discount on certification fees|^WGA members:/i },
  { id: "lowercase-brand", re: /(^|[\s(,;:])credtent(?![.\-@/\w])/ },
  // Third review round (2026-11-01): 85% only with Credtent's standard terms in the same sentence; audits are an
  // enrollment, not a present-tense service (LD-067 item 6); the product-name and 24/7 rules from the redesign copy check.
  // A bare stat numeral ("85%" above its label) is not a sentence; the label next to it carries the qualifier.
  { id: "85-without-standard-terms", test: (text) => text.split(/(?<=[.?!])\s+/).some((x) => {
    // A bare figure or price label ("85%", "85/15 + premium") is not a statement; anything with two words is.
    const words = x.split(/\s+/).filter((w) => /[a-z]/i.test(w)).length;
    return words >= 2 && ((/\b85\s?(%|percent)/i.test(x) && !/standard terms/i.test(x)) || (/\b85\s?[\/\-\u2013]\s?15\b/.test(x) && !/\bstandard\b/i.test(x)));
  }) },
  { id: "present-tense-audits", re: /\bCredtent (also )?audits AI models\b|\baudits AI models periodically\b/i },
  { id: "product-name", re: /Credtent Aegis/i },
  { id: "round-the-clock", re: /24\/7|around-the-clock/i }
];
const ruleHit = (r, text) => (r.test ? r.test(text) : r.re.test(text));

// Entities, compatibility forms (fullwidth digits and signs) and invisible format characters. Dashes are kept,
// so the em-dash rule still sees them.
export const decode = (s) => decodeAll(s).normalize("NFKC").replace(/\p{Cf}/gu, "");

const TAG = /<(?:[^>"']|"[^"]*"|'[^']*')*>/g;
// Block elements end a sentence; every other tag (inline, custom or unknown) is removed with no gap.
const BLOCK = "p|div|li|h[1-6]|section|article|header|footer|nav|aside|main|td|th|dd|dt|dl|figure|figcaption|blockquote|tr|ul|ol|table|form|fieldset|details|summary|pre|hr|br|address|body|html|head|title|option|button";
export function visibleText(html) {
  return decode(html
    .replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ")
    .replace(new RegExp(`</?(?:${BLOCK})\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, "gi"), " . ")
    .replace(TAG, ""));
}

function jsonStrings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => jsonStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => jsonStrings(v, out));
  return out;
}

// Every string in every CSS content value (a value may hold several), escapes decoded.
const cssContent = (css) => [...css.matchAll(/content\s*:\s*([^;}]*)/g)]
  .map((m) => [...m[1].matchAll(/(["'])((?:\\.|(?!\1).)*)\1/g)].map((x) => x[2]).join(""))
  .map((t) => decode(t.replace(/\\([0-9a-f]{1,6}) ?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))))).join(" . ");
const jsStrings = (js) => [...js.replace(/["'`]\s*\+\s*["'`]/g, "").matchAll(/`((?:\\.|[^`])*)`|"((?:\\.|[^"\n])*)"|'((?:\\.|[^'\n])*)'/g)]
  .map((m) => (m[1] ?? m[2] ?? m[3]).replace(/\\u\{([0-9a-f]+)\}|\\u([0-9a-f]{4})|\\x([0-9a-f]{2})/gi, (_, a, b, c) => String.fromCodePoint(parseInt(a || b || c, 16)))).join(" . ");

// Visible text, every attribute value except URLs, every JSON-LD string, inline script string literals and CSS
// content strings (style blocks and style attributes), entities decoded.
export function scanText(html) {
  // Every attribute value except URLs, quoted or not.
  const attrs = [...html.matchAll(/\s([a-z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi)]
    .filter((m) => !/^(href|src|srcset|action|poster|xmlns|xmlns:\w+|data-src|integrity|class|id|rel|type|target|crossorigin|loading|width|height|viewbox|d|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|points|x\d?|y\d?|cx|cy|r|transform)$/i.test(m[1]))
    .map((m) => (/^style$/i.test(m[1]) ? cssContent(decode(m[2] ?? m[3] ?? m[4])) : decode(m[2] ?? m[3] ?? m[4])));
  const ld = [];
  const scripts = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/ld\+json/i.test(decode(m[1]))) {
      try { ld.push(...jsonStrings(JSON.parse(m[2]))); } catch { ld.push(m[2]); }
    } else scripts.push(jsStrings(m[2]));
  }
  const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => cssContent(m[1]));
  return `${visibleText(html)} . ${attrs.join(" . ")} . ${ld.map(decode).join(" . ")} . ${scripts.map((x) => visibleText(x)).join(" . ")} . ${styles.join(" . ")}`.replace(/\s+/g, " ");
}

function lineOf(raw, rule) {
  const i = raw.split("\n").findIndex((l) => ruleHit(rule, visibleText(l)) || ruleHit(rule, decode(l)) || ruleHit(rule, decode(unescapeText(l))) || ruleHit(rule, cssContent(l)));
  return i >= 0 ? i + 1 : 0;
}

// JS, JSON and CSS escapes, as a browser or a JSON parser would read them.
export const unescapeText = (t) => String(t)
  .replace(/\\u\{([0-9a-f]+)\}|\\u([0-9a-f]{4})|\\x([0-9a-f]{2})/gi, (_, a, b, c) => String.fromCodePoint(Math.min(parseInt(a || b || c, 16), 0x10ffff)))
  .replace(/\\([0-9a-f]{1,6}) ?/gi, (_, h) => String.fromCodePoint(Math.min(parseInt(h, 16), 0x10ffff)));
// Script forms that assemble text at run time: decoding, reversing, concatenation, array joins of string
// literals, and template interpolation.
const RENDER_TIME = /\batob\(|fromCodePoint\(|fromCharCode\(|\.split\([^)]*\)\.reverse\(\)|["'`]\.concat\(|["'`]\s*\]\s*\.join\(|`[^`]*\$\{/;
// Text a claim rule should read, by file type.
function claimText(rel, raw) {
  if (/\.html?$|\.svg$/i.test(rel)) return scanText(raw);
  if (/\.(md|markdown)$/i.test(rel)) return scanText(raw.replace(/^[#>*\-+\s]+/gm, " ").replace(/[*_`]/g, ""));
  if (/\.css$/i.test(rel)) return cssContent(raw);
  if (/\.m?js$/i.test(rel)) return scanText(jsStrings(raw));
  if (/\.(json|webmanifest)$/i.test(rel)) { try { return jsonStrings(JSON.parse(raw)).map(decode).join(" . "); } catch { /* fall through */ } }
  return decode(unescapeText(raw));
}

function configList(root, key) {
  const cfg = path.join(root, "_config.yml");
  if (!fs.existsSync(cfg)) return [];
  const out = [];
  let inList = false;
  for (const line of fs.readFileSync(cfg, "utf8").split("\n")) {
    if (new RegExp(`^${key}:\\s*$`).test(line)) { inList = true; continue; }
    const inline = line.match(new RegExp(`^${key}:\\s*\\[(.*)\\]\\s*$`));
    if (inline) { out.push(...inline[1].split(",").map((x) => x.trim().replace(/^["']|["']$/g, "")).filter(Boolean)); continue; }
    if (inList) {
      const m = line.match(/^\s+-\s*["']?([^"'#]+?)["']?\s*$/);
      if (m) out.push(m[1].replace(/\/$/, ""));
      else if (/^\S/.test(line)) inList = false;
    }
  }
  return out;
}
export const jekyllExcludes = (root = ROOT) => configList(root, "exclude");
// Jekyll keeps only the last of duplicated top-level keys; this parser would merge them, so duplicates fail.
export function configDuplicates(root = ROOT) {
  const cfg = path.join(root, "_config.yml");
  if (!fs.existsSync(cfg)) return [];
  const lines = fs.readFileSync(cfg, "utf8").split("\n");
  // A quoted key or a space before the colon is the same key to YAML; a second document is a second config.
  const keys = lines.map((l) => (l.match(/^(["']?)([A-Za-z_][\w-]*)\1\s*:/) || [])[2]).filter(Boolean);
  const dups = keys.filter((k, i) => keys.indexOf(k) !== i);
  if (lines.slice(1).some((l) => /^(---|\.\.\.)\s*$/.test(l))) dups.push("second YAML document");
  return [...new Set(dups)];
}

function tracked(root) {
  try { return execFileSync("git", ["-C", root, "ls-files", "-z"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\0").filter(Boolean); }
  catch {
    const out = [];
    const walk = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (e.name === ".git") continue; const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else out.push(path.relative(root, p).split(path.sep).join("/")); } };
    walk(root);
    return out;
  }
}

// What is published. Pages: every tracked file except _config.yml excludes (include always wins). The S3 sync
// in deploy-main.yml publishes everything except .git/, .github/ and README.md, excluded files included, so the
// name scan reads every tracked file; the claim rules follow the Pages view.
export function served(root = ROOT, { forNames = false } = {}) {
  // With .nojekyll, Pages does not run Jekyll: the exclude list does not apply and everything is served.
  const excludes = forNames || fs.existsSync(path.join(root, ".nojekyll")) ? [] : jekyllExcludes(root);
  const includes = configList(root, "include");
  const under = (rel, x) => rel === x || rel.startsWith(`${x}/`);
  return tracked(root).filter((rel) => {
    if (rel.startsWith(".git/")) return false;
    if (includes.some((x) => under(rel, x))) return true;
    if (rel.startsWith(".github/")) return false;
    return !excludes.some((x) => under(rel, x));
  }).sort();
}

const MAGIC = [[0x89, 0x50, 0x4e, 0x47], [0xff, 0xd8, 0xff], [0x47, 0x49, 0x46, 0x38], [0x25, 0x50, 0x44, 0x46], [0x50, 0x4b, 0x03, 0x04], [0x52, 0x49, 0x46, 0x46], [0x00, 0x00, 0x00]];
const isBinary = (rel, buf) => BINARY_EXT.test(rel) || (!TEXT_EXT.test(rel) && MAGIC.some((m) => m.every((b, i) => buf[i] === b)));
// A UTF-16 byte-order mark is decoded as browsers do (the WHATWG Encoding standard has no UTF-32, so FF FE 00 00
// is UTF-16LE); otherwise UTF-8.
function readText(buf) {
  if (buf[0] === 0xff && buf[1] === 0xfe) return { text: new TextDecoder("utf-16le").decode(buf.subarray(2)), bom: true };
  if (buf[0] === 0xfe && buf[1] === 0xff) return { text: new TextDecoder("utf-16be").decode(buf.subarray(2)), bom: true };
  return { text: new TextDecoder("utf-8").decode(buf), bom: false };
}
const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

export function run({ env = process.env, localFile = LOCAL_FILE, root = ROOT, reviewed = REVIEWED_RENDER_TIME } = {}) {
  const fails = [];
  const names = loadPrivateNames(env, localFile);
  if (names.missing) fails.push(MISSING_MESSAGE);
  for (const k of configDuplicates(root)) fails.push(`_config.yml:0: duplicate-top-level-key (${k})`);
  const claimSet = new Set(served(root));
  for (const rel of served(root, { forNames: true })) {
    if (!names.missing && findNames(rel, [rel, `root/${rel}`], names).length) fails.push(`${rel}:0: private-name-in-path`);
    const buf = fs.readFileSync(path.join(root, rel));
    if (isBinary(rel, buf)) {
      // Text runs inside a binary (PDF text, XMP and EXIF in images) are published too. Entries shorter than five
      // letters are skipped here, because they turn up by chance in the printable runs of compressed image data.
      if (!names.missing && findNames(binaryText(buf), [rel, `root/${rel}`], names, { compactMatch: false, minLength: 5 }).length) fails.push(`${rel}:0: private-name-in-binary`);
      continue;
    }
    let { text: raw, bom } = readText(buf);
    if (raw.includes("\0")) {
      // A NUL byte in a text file is not a reason to skip it: report it and scan the rest.
      if (!bom) fails.push(`${rel}:0: nul-byte-in-text`);
      raw = raw.replace(/\0/g, "");
    }
    if (!names.missing) {
      const found = findNames(raw, [rel, `root/${rel}`], names);
      for (const line of found.length ? nameLines(raw, names, found) : []) fails.push(`${rel}:${line}: private-name`);
    }
    // Liquid renders in _layouts, _includes and _sass, and in Markdown and HTML with or without front matter.
    // Only Jekyll renders Liquid, so this applies to what Pages builds (the S3 copy serves the raw text, which the scans above read).
    if (claimSet.has(rel) && (/^_(layouts|includes|sass)\//.test(rel) || /\.(md|markdown|html?)$/i.test(rel) || /^\uFEFF?---\s*\r?\n/.test(raw)) && /\{\{|\{%/.test(raw)) fails.push(`${rel}:0: liquid-needs-review`);
    // Text assembled by script at render time is beyond what this gate can evaluate; a person reviews it.
    // Pages-served html, js and mjs are checked; for files only the S3 sync publishes, html and js (a build script's
    // .mjs is not loaded by any page).
    if ((claimSet.has(rel) ? /\.(html?|js|mjs)$/i : /\.(html?|js)$/i).test(rel) && RENDER_TIME.test(raw) && reviewed.get(rel) !== sha256(buf)) fails.push(`${rel}:0: render-time-text-needs-review`);
    if (EXEMPT.has(rel)) {
      if (sha256(buf) !== EXEMPT.get(rel)) fails.push(`${rel}:0: exempt-page-changed (re-review, then update its pin)`);
      continue;
    }
    if (!claimSet.has(rel) || !CLAIMS.test(rel)) continue;
    const text = claimText(rel, raw);
    for (const r of RULES) if (ruleHit(r, text)) fails.push(`${rel}:${lineOf(raw, r)}: ${r.id}`);
    if (/\.html?$/i.test(rel) && /"price"\s*:\s*"?249"?\b/.test(raw)) fails.push(`${rel}:0: superseded-249`);
  }
  // Never print a path, URL or line that names a listed entry: such text is replaced by a short hash.
  return fails.map((f) => redactLine(f, names));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const fails = run();
  for (const f of fails) console.log(`FAIL ${f}`);
  console.log(`live copy check: ${fails.length} fail`);
  process.exit(fails.length ? 1 : 0);
}
