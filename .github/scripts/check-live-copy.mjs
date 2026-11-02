// Copy gate for the live credtent.org pages that GitHub Pages serves from main (root *.html, guides,
// parking, post, badges, llms.txt). Run: node .github/scripts/check-live-copy.mjs
//
// Counterparty and prospect names are NOT listed in this public repository. The gate reads them from
// the CREDTENT_REVIEW_NAMES environment variable (one name per line, or separated by "|"), or from the
// gitignored file .github/scripts/review-names.local.txt. It fails closed when neither is present.
// Any listed name found on a served page fails the gate, unless the private file also carries a signed-off
// line "allow: <path> <name>" for that page (public-market context, never a customer or partner claim).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
// The current terms and privacy policy stay verbatim until the revised terms take effect (EB 2026-11-01).
// lws.html and parking/lws.html are under legal hold item 11 and are not edited until Cherryh clears it.
const EXEMPT = new Set(["terms-of-service.html", "privacy-policy.html", "lws.html", "parking/lws.html"]);
const SKIP_DIRS = new Set([".git", ".github", ".claude", "redesign-2026-10", "node_modules", ".worktrees"]);

export const RULES = [
  { id: "em-dash", re: /—/ },
  { id: "spaced-en-dash", re: /\s–\s/ },
  // LD-015 item 1.2, EB card "Hide Premium" (2026-10-31): no $49 Opt-Out Premium offer on public pages until 2026-12-31.
  { id: "hidden-49-premium", re: /Opt-Out Premium[^.<]{0,80}\$\s?49\b|\$\s?49[^.<]{0,40}Opt-Out Premium/i },
  // LD-058 as amended 2026-10-31 and 2026-11-01: Creator Licensing is not shown at $99 without the $49 promo.
  { id: "licensing-99-without-promo", re: /Creator Licensing[^.<]{0,40}\$\s?99/i },
  { id: "free-forever-promise", re: /always free|free,? (always|forever)|(will )?stays? free|remain free permanently|always will be|free forever|\.\s*Forever\./i },
  { id: "pbc-legal-duty-claim", re: /legally (obligat|bound)\w*/i },
  { id: "written-into", re: /written into (every|its corporate|the company|our corporate)/i },
  { id: "old-wga-price", re: /\$149\b|\$298\b/ },
  { id: "superseded-249", re: /\$\s?249\b/ },
  // 85/15 is Credtent's standard terms, not every deal; the WGA discount is screenplay-only.
  { id: "85-every-deal", re: /85\s?%\s+of\s+(every|all)\b|\bevery\s+(licensing\s+)?deal\s+(Credtent|we)\s+closes?\s+(sends|routes|pays)\s+85|85\s?%\s+of\s+gross\s+revenue\s+from\s+every\b/i },
  { id: "wga-discount-widened", re: /WGA members receive a discount|discount on certification fees/i }
];

export function decode(s) {
  return s
    .replace(/&nbsp;|&#160;|&#xa0;/gi, " ")
    .replace(/&mdash;|&#8212;|&#x2014;/gi, "—")
    .replace(/&ndash;|&#8211;|&#x2013;/gi, "–")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

// Visible text, every attribute value and every JSON-LD string, entities decoded.
export function scanText(raw) {
  const jsonld = [...raw.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join(" ");
  const attrs = [...raw.matchAll(/\s(?:content|alt|title|aria-label|placeholder|value)="([^"]*)"/gi)].map((m) => m[1]).join(" ");
  const body = raw.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(a|strong|em|span|b|i|code|cite)>/gi, "").replace(/<[^>]+>/g, " ");
  return decode(`${body} ${attrs} ${jsonld}`).replace(/\s+/g, " ");
}

export function loadNames(env = process.env) {
  let src = env.CREDTENT_REVIEW_NAMES || "";
  const local = path.join(ROOT, ".github/scripts/review-names.local.txt");
  if (!src && fs.existsSync(local)) src = fs.readFileSync(local, "utf8");
  const lines = src.split(/[\n|]/).map((s) => s.trim()).filter((s) => s && !s.startsWith("#"));
  const allow = new Set(lines.filter((l) => /^allow:/i.test(l)).map((l) => l.replace(/^allow:\s*/i, "").toLowerCase()));
  const names = lines.filter((l) => !/^allow:/i.test(l));
  names.allow = allow;
  return names;
}

function served(dir = ROOT, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = path.relative(ROOT, p).split(path.sep).join("/");
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) served(p, out); }
    else if (/\.html$/.test(e.name) || rel === "llms.txt") out.push(rel);
  }
  return out;
}

export function run(env = process.env) {
  const fails = [];
  const names = loadNames(env);
  if (!names.length) fails.push("names list missing: set CREDTENT_REVIEW_NAMES or create .github/scripts/review-names.local.txt (gitignored). The gate fails closed without it.");
  const nameRe = names.length ? new RegExp(`\\b(${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+")).join("|")})\\b`, "i") : null;
  for (const rel of served()) {
    const raw = fs.readFileSync(path.join(ROOT, rel), "utf8");
    const text = rel.endsWith(".html") ? scanText(raw) : decode(raw);
    if (nameRe) {
      for (const m of text.matchAll(new RegExp(nameRe.source, "gi"))) {
        const name = names.find((n) => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+")}$`, "i").test(m[0]));
        if (!names.allow.has(`${rel} ${name}`.toLowerCase())) { fails.push(`${rel}: lists a name from the private review list (match withheld from the log)`); break; }
      }
    }
    if (EXEMPT.has(rel)) continue;
    for (const r of RULES) {
      const m = text.match(r.re);
      if (m) fails.push(`${rel}: ${r.id}: "${text.slice(Math.max(0, m.index - 40), m.index + 60).trim()}"`);
    }
  }
  return fails;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const fails = run();
  for (const f of fails) console.log(`FAIL ${f}`);
  console.log(`live copy check: ${fails.length} fail`);
  process.exit(fails.length ? 1 : 0);
}
