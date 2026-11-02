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
import { loadPrivateNames, findNames, nameLines, decodeAll, LOCAL_FILE, MISSING_MESSAGE } from "./private-names.mjs";

// CHECK_ROOT lets CI run the gate scripts from main against a pull request's tree.
export const ROOT = process.env.CHECK_ROOT ? path.resolve(process.env.CHECK_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
// The current terms and privacy policy stay verbatim until the revised terms take effect (EB 2026-11-01).
// lws.html and parking/lws.html are under legal hold item 11 and are not edited until Cherryh clears it.
// Cherryh's hold item 11 covers credtent.org/lws (lws.html) only; the parked page is checked like any other.
const EXEMPT = new Set(["terms-of-service.html", "privacy-policy.html", "lws.html"]);
const CLAIMS = /\.(html?|txt|md|markdown|svg|css|js|mjs)$/i;

export const RULES = [
  { id: "em-dash", re: /—/ },
  { id: "spaced-en-dash", re: /\s–\s/ },
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
  { id: "85-every-deal", re: /85\s?%\s+of\s+(every|all)\b|\bevery\s+(licensing\s+)?deal\s+(Credtent|we)\s+closes?\s+(sends|routes|pays|returns)\s+85|85\s?%\s+of\s+gross\s+revenue\s+from\s+every\b|85\s?%\s+on\s+every\b/i },
  { id: "every-contract-or-no-exceptions", re: /\bevery contract\b|\bNo exceptions\b|\breturns 85\s?%/i },
  { id: "wga-discount-widened", re: /WGA members receive a discount|discount on certification fees|^WGA members:/i },
  { id: "lowercase-brand", re: /(^|[\s(,;:])credtent(?![.\-@/\w])/ },
  // Third review round (2026-11-01): 85% only with Credtent's standard terms in the same sentence; audits are an
  // enrollment, not a present-tense service (LD-067 item 6); the product-name and 24/7 rules from the redesign copy check.
  // A bare stat numeral ("85%" above its label) is not a sentence; the label next to it carries the qualifier.
  { id: "85-without-standard-terms", test: (text) => text.split(/(?<=[.?!])\s+/).some((x) => /\b85\s?(%|percent)/i.test(x) && x.trim().split(/\s+/).length > 2 && !/standard terms/i.test(x)) },
  { id: "present-tense-audits", re: /\bCredtent (also )?audits AI models\b|\baudits AI models periodically\b/i },
  { id: "product-name", re: /Credtent Aegis/i },
  { id: "round-the-clock", re: /24\/7|around-the-clock/i }
];
const ruleHit = (r, text) => (r.test ? r.test(text) : r.re.test(text));

// Entities, compatibility forms (fullwidth digits and signs) and invisible format characters. Dashes are kept,
// so the em-dash rule still sees them.
export const decode = (s) => decodeAll(s).normalize("NFKC").replace(/\p{Cf}/gu, "");

const TAG = /<(?:[^>"']|"[^"]*"|'[^']*')*>/g;
const INLINE = "a|abbr|b|bdi|bdo|cite|code|em|font|i|kbd|label|mark|q|s|samp|small|span|strong|sub|sup|time|u|var|wbr";
export function visibleText(html) {
  return decode(html
    .replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ")
    // Inline tags render no gap, so they are removed without one; only block boundaries end a sentence.
    .replace(new RegExp(`</?(?:${INLINE})\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, "gi"), "")
    .replace(/<\/(p|div|li|h[1-6]|section|article|header|footer|nav|aside|td|th|dd|dt|figcaption|blockquote|tr|ul|ol|table)>|<br\s*\/?>/gi, " . ")
    .replace(TAG, " "));
}

function jsonStrings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => jsonStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => jsonStrings(v, out));
  return out;
}

const cssContent = (css) => [...css.matchAll(/content\s*:\s*(["'])((?:\\.|(?!\1).)*)\1/g)]
  .map((m) => decode(m[2].replace(/\\([0-9a-f]{1,6}) ?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))))).join(" . ");
const jsStrings = (js) => [...js.matchAll(/`((?:\\.|[^`])*)`|"((?:\\.|[^"\n])*)"|'((?:\\.|[^'\n])*)'/g)]
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
  const i = raw.split("\n").findIndex((l) => ruleHit(rule, visibleText(l)) || ruleHit(rule, decode(l)));
  return i >= 0 ? i + 1 : 0;
}

// Text a claim rule should read, by file type.
function claimText(rel, raw) {
  if (/\.html?$|\.svg$/i.test(rel)) return scanText(raw);
  if (/\.(md|markdown)$/i.test(rel)) return scanText(raw.replace(/^[#>*\-+\s]+/gm, " ").replace(/[*_`]/g, ""));
  if (/\.css$/i.test(rel)) return cssContent(raw);
  if (/\.m?js$/i.test(rel)) return scanText(jsStrings(raw));
  return decode(raw);
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

function tracked(root) {
  try { return execFileSync("git", ["-C", root, "ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean); }
  catch {
    const out = [];
    const walk = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (e.name === ".git") continue; const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else out.push(path.relative(root, p).split(path.sep).join("/")); } };
    walk(root);
    return out;
  }
}

export function served(root = ROOT) {
  const excludes = jekyllExcludes(root);
  const includes = configList(root, "include");
  const under = (rel, x) => rel === x || rel.startsWith(`${x}/`);
  return tracked(root).filter((rel) => {
    if (rel.startsWith(".github/") || rel.startsWith(".git/") || rel === "_config.yml") return false;
    if (includes.some((x) => under(rel, x))) return true;
    return !excludes.some((x) => under(rel, x));
  }).sort();
}

const isBinary = (buf) => buf.subarray(0, 8192).includes(0);

export function run({ env = process.env, localFile = LOCAL_FILE, root = ROOT } = {}) {
  const fails = [];
  const names = loadPrivateNames(env, localFile);
  if (names.missing) fails.push(MISSING_MESSAGE);
  for (const rel of served(root)) {
    if (!names.missing && findNames(rel, [rel, `root/${rel}`], names).length) fails.push(`${rel}:0: private-name-in-path`);
    const buf = fs.readFileSync(path.join(root, rel));
    if (isBinary(buf)) continue;
    const raw = buf.toString("utf8");
    if (!names.missing) {
      const found = findNames(raw, [rel, `root/${rel}`], names);
      for (const line of found.length ? nameLines(raw, names, found) : []) fails.push(`${rel}:${line}: private-name`);
    }
    if (/^---\s*\n/.test(raw) && /\{\{|\{%/.test(raw)) fails.push(`${rel}:0: liquid-needs-review`);
    if (EXEMPT.has(rel) || !CLAIMS.test(rel)) continue;
    const text = claimText(rel, raw);
    for (const r of RULES) if (ruleHit(r, text)) fails.push(`${rel}:${lineOf(raw, r)}: ${r.id}`);
  }
  return fails;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const fails = run();
  for (const f of fails) console.log(`FAIL ${f}`);
  console.log(`live copy check: ${fails.length} fail`);
  process.exit(fails.length ? 1 : 0);
}
