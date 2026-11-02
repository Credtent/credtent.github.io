// Copy gate for everything GitHub Pages publishes from main for credtent.org.
// Run: node .github/scripts/check-live-copy.mjs
//
// Coverage follows the legacy Jekyll build: every file except paths with a segment starting "." or "_" and the
// entries in _config.yml "exclude". Every served text file is checked for private-list names; served .html
// and .txt pages are also checked against the claim rules (visible text, attribute values and JSON-LD, with
// entities decoded).
//
// Names are NOT listed in this public repository (see private-names.mjs): the gate reads the
// CREDTENT_REVIEW_NAMES secret or the gitignored .github/scripts/review-names.local.txt, and fails closed
// without either. Failures print the file, line and rule only, never page text, so no name reaches a log.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPrivateNames, findNames, nameLines, decodeAll, LOCAL_FILE, MISSING_MESSAGE } from "./private-names.mjs";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
// The current terms and privacy policy stay verbatim until the revised terms take effect (EB 2026-11-01).
// lws.html and parking/lws.html are under legal hold item 11 and are not edited until Cherryh clears it.
const EXEMPT = new Set(["terms-of-service.html", "privacy-policy.html", "lws.html", "parking/lws.html"]);
const TEXT = /\.(html?|txt|md|json|js|mjs|xml|css|svg|yml|yaml|webmanifest)$/i;
const CLAIMS = /\.(html?|txt)$/i;

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
  { id: "lowercase-brand", re: /(^|[\s(,;:])credtent(?![.\-@/\w])/ }
];

export const decode = decodeAll;

export function visibleText(html) {
  return decode(html
    .replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(a|strong|em|span|b|i|code|cite)>/gi, "")
    .replace(/<\/(p|div|li|h[1-6]|section|article|td|th|dd|dt|figcaption)>|<br\s*\/?>/gi, " . ")
    .replace(/<[^>]+>/g, " "));
}

function jsonStrings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => jsonStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => jsonStrings(v, out));
  return out;
}

// Visible text, every human-facing or data attribute value, and every JSON-LD string, entities decoded.
export function scanText(html) {
  const attrs = [...html.matchAll(/\s(?:content|alt|title|aria-label|placeholder|value|data-[\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map((m) => decode(m[1] ?? m[2]));
  const ld = [];
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { ld.push(...jsonStrings(JSON.parse(m[1]))); } catch { ld.push(m[1]); }
  }
  return `${visibleText(html)} . ${attrs.join(" . ")} . ${ld.map(decode).join(" . ")}`.replace(/\s+/g, " ");
}

function lineOf(raw, re) {
  const i = raw.split("\n").findIndex((l) => re.test(decode(l.replace(/<[^>]*>/g, " "))));
  return i >= 0 ? i + 1 : 0;
}

export function jekyllExcludes(root = ROOT) {
  const cfg = path.join(root, "_config.yml");
  if (!fs.existsSync(cfg)) return [];
  const lines = fs.readFileSync(cfg, "utf8").split("\n");
  const out = [];
  let inExclude = false;
  for (const line of lines) {
    if (/^exclude:\s*$/.test(line)) { inExclude = true; continue; }
    const inline = line.match(/^exclude:\s*\[(.*)\]\s*$/);
    if (inline) { out.push(...inline[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean)); continue; }
    if (inExclude) {
      const m = line.match(/^\s+-\s*["']?([^"'#]+?)["']?\s*$/);
      if (m) out.push(m[1].replace(/\/$/, ""));
      else if (/^\S/.test(line)) inExclude = false;
    }
  }
  return out;
}

export function served(root = ROOT) {
  const excludes = jekyllExcludes(root);
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith(".") || e.name.startsWith("_") || e.name === "node_modules") continue;
      const p = path.join(dir, e.name);
      const rel = path.relative(root, p).split(path.sep).join("/");
      if (excludes.some((x) => rel === x || rel.startsWith(`${x}/`))) continue;
      if (e.isDirectory()) walk(p);
      else if (TEXT.test(e.name)) out.push(rel);
    }
  };
  walk(root);
  return out;
}

export function run({ env = process.env, localFile = LOCAL_FILE, root = ROOT } = {}) {
  const fails = [];
  const names = loadPrivateNames(env, localFile);
  if (names.missing) fails.push(MISSING_MESSAGE);
  for (const rel of served(root)) {
    const raw = fs.readFileSync(path.join(root, rel), "utf8");
    if (!names.missing) {
      const found = findNames(raw, [rel, `root/${rel}`], names);
      for (const line of found.length ? nameLines(raw, names, found) : []) fails.push(`${rel}:${line}: private-name`);
    }
    if (EXEMPT.has(rel) || !CLAIMS.test(rel)) continue;
    const text = /\.html?$/i.test(rel) ? scanText(raw) : decode(raw);
    for (const r of RULES) if (r.re.test(text)) fails.push(`${rel}:${lineOf(raw, r.re)}: ${r.id}`);
  }
  return fails;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const fails = run();
  for (const f of fails) console.log(`FAIL ${f}`);
  console.log(`live copy check: ${fails.length} fail`);
  process.exit(fails.length ? 1 : 0);
}
