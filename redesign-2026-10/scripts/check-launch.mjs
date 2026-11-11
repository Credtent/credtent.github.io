// Launch gate for the two built sites. Run: node scripts/check-launch.mjs <preview|production> [comDir] [orgDir]
// The mode is required and is asserted (robots, noindex, headers). Defaults to sites/com and sites/org.
// Exits 1 on any FAIL. Launch preconditions FAIL in production mode and WARN in preview mode.
// Names never live in this file: see scripts/private-names.mjs (fails closed without the private list).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CURRENT_TERMS_FILE, CURRENT_TERMS_EFFECTIVE, REVISED_TERMS_DATE, TERMS_SWAP, UPCOMING_TERMS_PATH, DATE_PLACEHOLDER, VERBATIM_START, VERBATIM_END, REVISED_CHANGES, termsText, reviseTerms, termsGuard, liveTermsParts } from "../src/lib/terms.mjs";
import { loadPrivateNames, findNames, nameLines, decodeAll, redactLine, binaryText, MISSING_MESSAGE } from "./private-names.mjs";
import { isBinary, readText, sha256, EM_DASH } from "./text-files.mjs";
import { audienceWordOutsideCharter } from "./charter-quote.mjs";
import { PRIVACY_DATE_PLACEHOLDER } from "../src/lib/privacy.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO = path.resolve(ROOT, "..");
const MODES = ["preview", "production"];
const MODE = process.argv[2];
const dirs = {
  com: path.resolve(process.argv[3] || path.join(ROOT, "sites/com")),
  org: path.resolve(process.argv[4] || path.join(ROOT, "sites/org"))
};
const HOST = { com: "credtent.com", org: "credtent.org" };

// Claims removed from the live site in #23 and #24, plus standing locks (LD-006, LD-049, accounts canonical).
export const BANNED = [
  { id: "em-dash", re: EM_DASH },
  { id: "spaced-en-dash", re: /\s\u2013\s/ },
  { id: "superseded-249", re: /(US)?\$\s?249\b|\b249\+/ },
  { id: "continuous-auditing", re: /continuous(ly)?\s+(audit|monitor)/i },
  { id: "opt-out-enforcement", re: /opt-?out\s+enforcement|enforc\w*\s+(of\s+)?(the\s+|your\s+)?opt-?outs?\b/i },
  { id: "bylaw-acquisition", re: /bylaw|cannot be acquired|can't be acquired|legally enforced/i },
  { id: "premium-auditing-system", re: /access to the (opt-out )?auditing system/i },
  { id: "premium-adds-auditing", re: /\badds? (access to )?auditing\b/i },
  { id: "held-sign-up", re: /registry\.credtent\.org\/auth\/sign-up/i },
  { id: "wga-partner", re: /WGA[^.<]{0,60}\b(partner|endorse)/i },
  { id: "comma-artifact", re: /\S\s+,\s/ },
  { id: "copyright-alliance-member", re: /member of (the )?Copyright Alliance|Copyright Alliance member/i },
  // 2026-10-31 rulings and the adversarial review of the launch branch.
  { id: "monthly-audit", re: /monthly\s+(premium\s+)?(audit|auditing|observation|runs?)\b|audits?[^.<]{0,60}\bmonthly\b/i },
  { id: "compliance-monitoring", re: /compliance\s+monitoring|track(s|ing)?\s+compliance/i },
  { id: "every-contract-split", re: /written into every|whatever the deal size|built in, not aspirational/i },
  { id: "written-into-company", re: /written into the company/i },
  { id: "old-wga-price", re: /\$149\b|\$298\b/ },
  { id: "rounded-book-price", re: /\$(15|25|50)(?![\d.,])/ },
  { id: "hidden-49-premium", re: /Opt-Out Premium[^.<]{0,80}\$\s?49\b|\$\s?49[^.<]{0,30}\bfor individuals\b/i },
  { id: "leading-authority", re: /leading authority/i },
  // Cherryh 2026-11-01, EB-approved: no permanent free promise; only "Credtent does not plan to charge for the free opt-out."
  { id: "free-forever-promise", re: /always free|free,? always|(will )?stays? free|always will be|free forever|\$0<\/span>\s*forever/i },
  { id: "pbc-legal-duty-claim", re: /legally (obligat|bound)\w*/i },
  // Review round 2026-11-01: 85/15 is Credtent's standard terms, not every deal; the WGA discount is screenplay-only.
  // Same rule as the live-copy gate.
  { id: "85-every-deal", re: /85\s?(%|percent)\s+of\s+(every|all)\b|\bevery\s+(licensing\s+)?deal\s+(Credtent|we)\s+closes?\s+(sends|routes|pays|returns)\s+85|85\s?%\s+of\s+gross\s+revenue\s+from\s+every\b|85\s?(%|percent)\s+on\s+every\b/i },
  // Ported from the live-copy gate so the two gates carry the same claim rules.
  { id: "licensing-99-without-promo", re: /Creator Licensing[^.<]{0,40}\$\s?99/i },
  { id: "written-into", re: /written into (every|its corporate|the company|our corporate)/i },
  { id: "pbc-as-cause-of-neutrality", re: /(As a|as a) Delaware Public Benefit Corporation, Credtent (acts|is) (as )?a neutral|Public Benefit Corporation, structurally (neutral|independent)/ },
  { id: "wga-discount-widened", re: /WGA members receive a discount|discount on certification fees/i },
  // Review round 2026-11-01 (second pass).
  // "Every deal" near 85% is a claim about every deal unless the sentence says standard terms
  // ("approve every deal ... receive 85% ... under standard terms" is not).
  { id: "every-contract-or-no-exceptions", test: (text) => /\bevery contract\b|\bNo exceptions\b|\breturns 85\s?%/i.test(text) ||
    text.split(/(?<=[.?!])\s+/).some((x) => /\bevery deal\b[^.<]{0,60}\b85\s?%/i.test(x) && !/standard terms/i.test(x)) },
  { id: "forever-near-free", re: /\b(free|opt-?out)\b[^.<]{0,30}\bforever\b|\bforever\b[^.<]{0,30}\b(free|opt-?out)\b/i },
  { id: "premium-included-in-49", re: /Everything in Opt-Out Premium/i },
  { id: "lowercase-brand", re: /(^|[\s(,;:])credtent(?![.\-@/\w])/, cs: true },
  // Third review round (2026-11-01).
  // 85% needs "standard terms" in the same sentence and 85/15 needs "standard"; a bare figure or price label
  // ("85%", "85/15 + premium") is not a statement, anything with two words is (same rule as the live-copy gate).
  { id: "85-without-standard-terms", test: (text) => text.split(/(?<=[.?!])\s+/).some((x) => {
    const words = x.split(/\s+/).filter((w) => /[a-z]/i.test(w)).length;
    return words >= 2 && ((/\b85\s?(%|percent)/i.test(x) && !/standard terms/i.test(x)) || (/\b85\s?[\/\-\u2013]\s?15\b/.test(x) && !/\bstandard\b/i.test(x)));
  }) },
  { id: "present-tense-audits", re: /\bCredtent (also )?audits AI models\b|\baudits AI models periodically\b/i },
  // Ported from check-copy so they also run on decoded text; new-site pages only (the live site still says "creators").
  { id: "product-name", re: /Credtent Aegis/i, siteOnly: true },
  { id: "round-the-clock", re: /24\/7|around-the-clock/i, siteOnly: true },
  { id: "advisory-council", re: /Advisory Council/i, siteOnly: true },
  { id: "audience-word", test: (text) => audienceWordOutsideCharter(text), siteOnly: true },
  { id: "locked-spec", re: /\bc2pa\b/i, siteOnly: true }
];
export const ruleHit = (r, text) => (r.test ? r.test(text) : r.re.test(text));
// Served pages of the live site (GitHub Pages from main) are scanned too until the DNS cutover.
// The current terms and privacy policy stay verbatim (EB 2026-11-01); lws.html and parking/lws.html stay
// untouched while Cherryh's legal hold item 11 is open (the 2026-11-01 capture covers both pages). Each exempt page
// is pinned to its sha256 on main: a change fails until someone re-reviews it and updates the pin (the same pins
// as the live-copy gate).
export const ROOT_SCAN = true;
export const ROOT_EXEMPT = new Map([
  ["terms-of-service.html", "2a43523f0631d87f383a10b992129b8b9db86e7801be6059e08fdb65e838e635"],
  ["privacy-policy.html", "d3c53c6fc6b27bf011e5920dfda1742cf4674d37e10bb06fd8ca1b7e8fe84d07"],
  ["lws.html", "315a2fd0423a37d47f5347899c71956c656d1430f6c8751fb0a6e5f66242324a"],
  ["parking/lws.html", "485df8ee612ecdd82b77f366c72ae35336b598cc43dc66b2bcfc0494b611fac0"]
]);
// Root files the copy rules read (what Pages renders as text); every non-binary root file gets the names checks.
const ROOT_RULE_FILES = /\.(html?|md|markdown|txt)$/i;
const ROOT_SKIP_DIRS = new Set([".git", ".github", ".claude", "redesign-2026-10", "node_modules", ".worktrees"]);
// Pages that stay noindex in production.
// The privacy policy's "Last Updated" is the launch date (Cherryh 2026-11-10, section 7); the placeholder must not ship.
export function privacyDateProblem(html) {
  return html.includes(PRIVACY_DATE_PLACEHOLDER);
}
export function staysNoindex(rel) {
  // standards/index.html: held out of the index until Vonnegut B9 to B12 are resolved (Niven 2026-11-10, drop-in 4).
  return rel === "404.html" || rel.startsWith("parking/") || rel === "lws/index.html" || rel === "standards/index.html" || rel.startsWith("terms-of-service/upcoming/") ||
    /^resources\/(what-an-opt-out-can-do|how-to-read-platform-terms|use-ai-without-giving-up-judgment)\/index\.html$/.test(rel) ||
    /^creative-consent(\/(platforms|guide))?\/index\.html$/.test(rel);
}
// Hard launch preconditions that no file can prove. Each needs an explicit, dated confirmation in the environment.
export const PRECONDITIONS = [
  {
    env: "AUDITOR_RESUMED",
    // The last scheduled audit before the pause ran 2026-10-05 (Dick's incident record); a resume date must follow it.
    after: "2026-10-05",
    why: "EB 2026-11-01: launch waits until Credtent's Auditor is running again (Premium copy says works are enrolled in periodic AI model audits). Set AUDITOR_RESUMED=YYYY-MM-DD, the date the first post-pause audit completed."
  }
];
// EB rulings relayed 2026-11-02 ("Keep the claim", "Every paid tier", then "Yes, included"): the new site says every
// plan for creatives and content owners except the free opt-out includes AI model audits, so launch waits until
// every such signer is placed in an audit run: every catalog paid tier from Opt-Out Premium up (optout_premium,
// optout_premium_rh, creator_licensing, rights_holder_licensing, game_industry), every contracted content partner
// (Starter Partner, Organization License, Enterprise) and every org on a paying audit-tier flag. The audit
// lane writes this attestation from Aegis; it is committed here before DNS (runbook) and holds counts only, because
// this repo is public. It is enforced in production mode, which is what the cutover build runs
// (npm run check:production); preview mode, the everyday CI run, only warns.
export const AUDIT_COVERAGE_FILE = path.join(ROOT, "launch", "audit-coverage.json");
export const AUDIT_COVERAGE_SCHEMA = "credtent-audit-coverage/1";
export const AUDIT_COVERAGE_MAX_AGE_HOURS = 72;
const COVERAGE_KEYS = ["schema", "generatedAt", "aegisCommit", "signersTotal", "placedInRun", "missing", "heldByRuling"];
/** Problems with the audit-coverage attestation; an empty list means launch may proceed. Fails closed. */
export function auditCoverageProblems(file = AUDIT_COVERAGE_FILE, now = new Date()) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  if (!fs.existsSync(file)) return [`${rel} is missing: run the Aegis audit-coverage script and commit its output (runbook, step before DNS)`];
  let a;
  const bytes = fs.readFileSync(file, "utf8");
  try { a = JSON.parse(bytes); } catch { return [`${rel} is not valid JSON`]; }
  // JSON.parse keeps the last of duplicated keys, so a reader and the gate could see different values.
  const keyCounts = {};
  for (const m of bytes.matchAll(/"((?:\\.|[^"\\])*)"\s*:/g)) keyCounts[m[1]] = (keyCounts[m[1]] || 0) + 1;
  if (Object.values(keyCounts).some((n) => n > 1)) return [`${rel} has a duplicate key; each field must appear once`];
  if (!a || typeof a !== "object" || Array.isArray(a)) return [`${rel} is not a JSON object`];
  const out = [];
  const extra = Object.keys(a).filter((k) => !COVERAGE_KEYS.includes(k));
  // Counts only: any other field (a name, an id, an email) is refused in this public repo.
  if (extra.length) out.push(`${rel} has fields outside the schema (${extra.length}); it may hold counts only`);
  if (a.schema !== AUDIT_COVERAGE_SCHEMA) out.push(`${rel} schema is not ${AUDIT_COVERAGE_SCHEMA}`);
  if (typeof a.aegisCommit !== "string" || !/^[0-9a-f]{7,40}$/i.test(a.aegisCommit)) out.push(`${rel} aegisCommit is not a commit sha`);
  else if (/^(.)\1+$/.test(a.aegisCommit)) out.push(`${rel} aegisCommit is a placeholder, not a commit sha`);
  const counts = ["signersTotal", "placedInRun", "missing", "heldByRuling"];
  const bad = counts.filter((k) => !Number.isInteger(a[k]) || a[k] < 0);
  if (bad.length) out.push(`${rel} ${bad.join(", ")} must be whole numbers, zero or more`);
  else {
    if (a.signersTotal <= 0) out.push(`${rel} signersTotal is 0: there is no signer count to attest`);
    if (a.placedInRun !== a.signersTotal) out.push(`${rel} placedInRun (${a.placedInRun}) is not signersTotal (${a.signersTotal})`);
    if (a.missing !== 0) out.push(`${rel} missing is ${a.missing}, not 0`);
    if (a.heldByRuling !== 0) out.push(`${rel} heldByRuling is ${a.heldByRuling}, not 0 (signers held off until EB rules, LD-067 ruling 6)`);
  }
  // UTC only: a time without "Z" would be read in the local time zone, so the Mac and Vercel could disagree.
  const t = typeof a.generatedAt === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?Z$/.test(a.generatedAt) ? Date.parse(a.generatedAt) : NaN;
  if (Number.isNaN(t)) out.push(`${rel} generatedAt is not a UTC timestamp (YYYY-MM-DDTHH:MM:SSZ)`);
  else if (t > now.getTime() + 5 * 60 * 1000) out.push(`${rel} generatedAt is in the future`);
  else if (now.getTime() - t > AUDIT_COVERAGE_MAX_AGE_HOURS * 3600 * 1000) out.push(`${rel} is stale: generatedAt is more than ${AUDIT_COVERAGE_MAX_AGE_HOURS} hours old`);
  return out;
}
// Old live URLs that must keep resolving on credtent.org after the DNS move (copied or 301'd).
export const LEGACY_ORG_PATHS = [
  "/licensing", "/team/eric-burgess.jpg", "/images/credtent-logo-indigo.svg", "/images/b-corp-logo.svg",
  "/badges/legacy-creation-badge.svg", "/badges/creative-origin-legacy.svg", "/badges/ai-composed-creation-badge.svg",
  "/credtent-logo-mark.svg", "/credtent-wordmark.svg", "/shield-check.svg", "/parking/services"
];
// (The review-name list moved to the private source; see scripts/private-names.mjs.)

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

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

// Every string in every CSS content value (a value may hold several), escapes decoded. Same as the live gate.
const cssContent = (css) => [...css.matchAll(/content\s*:\s*([^;}]*)/g)]
  .map((m) => [...m[1].matchAll(/(["'])((?:\\.|(?!\1).)*)\1/g)].map((x) => x[2]).join(""))
  .map((t) => decode(t.replace(/\\([0-9a-f]{1,6}) ?/gi, (_, h) => String.fromCodePoint(Math.min(parseInt(h, 16), 0x10ffff))))).join(" . ");
// JS, JSON and CSS escapes, as a browser or a JSON parser would read them.
export const unescapeText = (t) => String(t)
  .replace(/\\u\{([0-9a-f]+)\}|\\u([0-9a-f]{4})|\\x([0-9a-f]{2})/gi, (_, a, b, c) => String.fromCodePoint(Math.min(parseInt(a || b || c, 16), 0x10ffff)))
  .replace(/\\([0-9a-f]{1,6}) ?/gi, (_, h) => String.fromCodePoint(Math.min(parseInt(h, 16), 0x10ffff)));
// Script forms that assemble text at run time: decoding, reversing, concatenation, array joins of string
// literals, and template interpolation. A person reviews any file that uses them.
export const RENDER_TIME = /\batob\(|fromCodePoint\(|fromCharCode\(|\.split\([^)]*\)\.reverse\(\)|["'`]\.concat\(|["'`]\s*\]\s*\.join\(|`[^`]*\$\{/;
// String literals joined with + are read as one string.
const jsStrings = (js) => [...js.replace(/["'`]\s*\+\s*["'`]/g, "").matchAll(/`((?:\\.|[^`])*)`|"((?:\\.|[^"\n])*)"|'((?:\\.|[^'\n])*)'/g)]
  .map((m) => (m[1] ?? m[2] ?? m[3]).replace(/\\u\{([0-9a-f]+)\}|\\u([0-9a-f]{4})|\\x([0-9a-f]{2})/gi, (_, a, b, c) => String.fromCodePoint(parseInt(a || b || c, 16)))).join(" . ");

/** Text a claim rule reads, by file type: pages and SVG as rendered, CSS content strings, JS and JSON strings,
 * and every other text file with JS and CSS escapes decoded. */
export function claimText(rel, raw) {
  if (/\.(html?|svg)$/i.test(rel)) return scanText(raw);
  if (/\.css$/i.test(rel)) return cssContent(raw);
  if (/\.(m?js|cjs)$/i.test(rel)) return scanText(jsStrings(raw));
  if (/\.(json|webmanifest)$/i.test(rel)) { try { return jsonStrings(JSON.parse(raw)).map(decode).join(" . "); } catch { /* fall through */ } }
  // Line breaks in plain text do not end a sentence for a reader, so a wrapped claim is read as one line.
  return decode(unescapeText(raw)).replace(/\s+/g, " ");
}

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


// The first raw line where a rule matches, so a failure can name a line without printing page text.
function lineOf(raw, re) {
  const lines = raw.split("\n");
  // re is a RegExp or a rule with a test function; both expose test(text).
  const i = lines.findIndex((l) => re.test(visibleText(l)) || re.test(decode(l)) || re.test(decode(unescapeText(l))) || re.test(cssContent(l)));
  return i >= 0 ? i + 1 : 0;
}

function metaContent(html, attr, name) {
  const m = html.match(new RegExp(`<meta[^>]+${attr}="${name}"[^>]*content="([^"]*)"`, "i"));
  return m ? m[1] : null;
}

function loadSite(id) {
  const dir = dirs[id];
  const files = walk(dir).map((f) => path.relative(dir, f).split(path.sep).join("/"));
  let redirects = [];
  const vj = path.join(dir, "vercel.json");
  if (fs.existsSync(vj)) redirects = (JSON.parse(fs.readFileSync(vj, "utf8")).redirects || []).map((r) => r.source);
  return { id, dir, files: new Set(files), redirects };
}

function resolves(site, urlPath) {
  const p = decodeURI(urlPath.split("#")[0].split("?")[0]).replace(/^\//, "");
  if (p === "") return site.files.has("index.html");
  const bare = p.replace(/\/$/, "");
  if (site.files.has(p) || site.files.has(`${bare}/index.html`) || site.files.has(`${bare}.html`)) return true;
  return site.redirects.some((src) => src === `/${p}` || src === `/${bare}` || (src.includes("(") && new RegExp(`^${src}$`).test(`/${p}`)));
}

// EB 2026-11-01: until the swap, /terms-of-service is the current terms verbatim and the revised text lives
// only on the noindex, unlinked upcoming page. After the swap the revised text, with its date, is the main page.
export function checkTerms(sites, fails) {
  for (const e of termsGuard()) fails.push(`terms settings: ${e}`);
  const liveRaw = fs.readFileSync(path.join(REPO, CURRENT_TERMS_FILE), "utf8");
  const live = liveTermsParts(liveRaw);
  const liveBody = live.body;
  const liveText = termsText(liveBody);
  const expectedRevised = termsText(reviseTerms(liveBody));
  const revisedOnly = REVISED_CHANGES.map(([, to]) => termsText(to).join(" ")).filter((t) => t.length > 40);
  const upcomingRel = UPCOMING_TERMS_PATH.replace(/^\//, "") + "/index.html";
  const forms = [UPCOMING_TERMS_PATH, `${UPCOMING_TERMS_PATH}/`, `${UPCOMING_TERMS_PATH}/index.html`];
  const sameLines = (got, want, label) => {
    const diff = got.findIndex((line, i) => line !== want[i]);
    if (got.length !== want.length || diff >= 0) fails.push(`${label} at text line ${diff >= 0 ? diff + 1 : Math.min(got.length, want.length) + 1}`);
  };
  const legalBlock = (html) => {
    const m = html.match(/<div class="wrap legacy">([\s\S]*?)<\/div><\/section>/);
    return m ? m[1] : "";
  };
  for (const site of Object.values(sites)) {
    const mainFile = path.join(site.dir, "terms-of-service/index.html");
    if (!fs.existsSync(mainFile)) { fails.push(`${site.id}: /terms-of-service is missing`); continue; }
    const main = fs.readFileSync(mainFile, "utf8");
    const mainText = termsText(main).join(" ");
    const upcomingFile = path.join(site.dir, upcomingRel);
    const config = JSON.parse(fs.readFileSync(path.join(site.dir, "vercel.json"), "utf8"));
    const headerFor = (src) => (config.headers || []).find((h) => h.source === src && (h.headers || []).some((x) => x.key === "X-Robots-Tag" && /noindex/.test(x.value)));
    const redirectFor = (src) => (config.redirects || []).find((r) => r.source === src);
    if (!TERMS_SWAP) {
      const a = main.indexOf(VERBATIM_START), b = main.indexOf(VERBATIM_END);
      if (a < 0 || b < a) fails.push(`${site.id}/terms-of-service: the current terms are not served verbatim (markers missing)`);
      else {
        sameLines(termsText(main.slice(a, b)), liveText, `${site.id}/terms-of-service: current terms differ from ${CURRENT_TERMS_FILE}`);
        // The copy rules skip this block, so its raw markup must equal the live page's: only link targets may differ.
        const hrefsAside = (h) => h.replace(/\bhref="[^"]*"/g, 'href=""');
        if (hrefsAside(main.slice(a + VERBATIM_START.length, b)) !== hrefsAside(liveBody)) fails.push(`${site.id}/terms-of-service: the current terms block is not the live markup byte for byte (link targets aside)`);
      }
      const intro = termsText(main.slice(0, main.indexOf(VERBATIM_START)));
      if (intro.filter((l) => l === live.eyebrow).length !== 1 || !intro.includes(live.capsule.replace(/&#39;/g, "'"))) fails.push(`${site.id}/terms-of-service: the live intro (eyebrow and summary) is not shown exactly once`);
      if (!mainText.includes(`Effective Date: ${CURRENT_TERMS_EFFECTIVE}`)) fails.push(`${site.id}/terms-of-service: does not show Effective Date: ${CURRENT_TERMS_EFFECTIVE}`);
      revisedOnly.forEach((needle, i) => { if (mainText.includes(needle)) fails.push(`${site.id}/terms-of-service: revised-only change ${i + 1} shown before the swap`); });
      if (mainText.includes("EFFECTIVE-DATE-PENDING")) fails.push(`${site.id}/terms-of-service: date placeholder shown before the swap`);
      if (!fs.existsSync(upcomingFile)) { fails.push(`${site.id}: ${UPCOMING_TERMS_PATH} is missing`); continue; }
      const up = fs.readFileSync(upcomingFile, "utf8");
      if (!/<meta name="robots" content="noindex/i.test(up)) fails.push(`${site.id}${UPCOMING_TERMS_PATH}: not noindex`);
      // The upcoming page is the live terms with exactly the approved changes and the effective date applied.
      sameLines(termsText(legalBlock(up)), expectedRevised, `${site.id}${UPCOMING_TERMS_PATH}: differs from the live terms plus the approved changes`);
      if (up.includes("info@credtent.org") || !/13\. Contact[\s\S]*?mailto:hello@credtent\.org/.test(up)) fails.push(`${site.id}${UPCOMING_TERMS_PATH}: section 13 contact is not hello@credtent.org`);
      for (const f of ["sitemap.xml", "llms.txt"]) {
        if (fs.readFileSync(path.join(site.dir, f), "utf8").includes(UPCOMING_TERMS_PATH)) fails.push(`${site.id}/${f}: lists ${UPCOMING_TERMS_PATH}`);
      }
      for (const src of forms) {
        const r = redirectFor(src);
        // The slash and index.html forms may 301 to the bare upcoming URL (the site's slash convention); nothing may leave it.
        const toBare = r && r.statusCode === 301 && r.destination.endsWith(UPCOMING_TERMS_PATH) && src !== UPCOMING_TERMS_PATH;
        if (r && !toBare) fails.push(`${site.id}/vercel.json: ${src} redirects away before the swap`);
        if (!toBare && !headerFor(src)) fails.push(`${site.id}/vercel.json: no X-Robots-Tag noindex rule for ${src}`);
      }
      for (const other of Object.values(sites)) {
        for (const rel of other.files) {
          if (!rel.endsWith(".html") || rel === upcomingRel) continue;
          if (fs.readFileSync(path.join(other.dir, rel), "utf8").includes(UPCOMING_TERMS_PATH)) fails.push(`${other.id}/${rel}: links to ${UPCOMING_TERMS_PATH}`);
        }
      }
    } else {
      sameLines(termsText(legalBlock(main)), expectedRevised, `${site.id}/terms-of-service: after the swap it differs from the live terms plus the approved changes`);
      if (!mainText.includes(`Effective Date: ${REVISED_TERMS_DATE}`)) fails.push(`${site.id}/terms-of-service: does not show Effective Date: ${REVISED_TERMS_DATE}`);
      if (main.includes(VERBATIM_START) || mainText.includes("EFFECTIVE-DATE-PENDING")) fails.push(`${site.id}/terms-of-service: still the pre-swap page`);
      if (fs.existsSync(upcomingFile)) fails.push(`${site.id}${UPCOMING_TERMS_PATH}: still built after the swap`);
      for (const src of forms) {
        const r = redirectFor(src);
        if (!r || r.statusCode !== 301 || r.destination !== `https://${HOST[site.id]}/terms-of-service`) fails.push(`${site.id}/vercel.json: ${src} does not 301 to /terms-of-service after the swap`);
        if (headerFor(src)) fails.push(`${site.id}/vercel.json: ${src} still has its pre-swap noindex rule`);
      }
    }
  }
  // The placeholder may appear only on the upcoming page, and only before the swap.
  for (const site of Object.values(sites)) {
    for (const rel of site.files) {
      if (!rel.endsWith(".html") || (!TERMS_SWAP && rel === upcomingRel)) continue;
      if (fs.readFileSync(path.join(site.dir, rel), "utf8").includes(DATE_PLACEHOLDER.split(" ")[0])) fails.push(`${site.id}/${rel}: effective-date placeholder outside the upcoming terms page`);
    }
  }
}

// Vercel honors build settings in vercel.json (buildCommand, ignoreCommand and the rest), which would override
// the dashboard Build Command that runs this gate. Only the routing keys the sites use are allowed.
const VERCEL_KEYS = new Set(["$schema", "headers", "redirects", "cleanUrls", "trailingSlash"]);
export const vercelConfigProblems = (config) => Object.keys(config || {}).filter((k) => !VERCEL_KEYS.has(k)).map((k) => `vercel.json key "${k}" is not allowed (it can change how Vercel builds or serves the site)`);

function checkMode(site, fails) {
  const robots = fs.readFileSync(path.join(site.dir, "robots.txt"), "utf8");
  const ready = fs.readFileSync(path.join(site.dir, "robots.production.txt"), "utf8");
  const config = JSON.parse(fs.readFileSync(path.join(site.dir, "vercel.json"), "utf8"));
  for (const problem of vercelConfigProblems(config)) fails.push(`${site.id}/${problem}`);
  const sitewide = (config.headers || []).filter((h) => h.source === "/(.*)" && !h.missing && (h.headers || []).some((x) => x.key === "X-Robots-Tag"));
  const hostGate = (config.headers || [])[0];
  if (!hostGate || !hostGate.missing || !(hostGate.headers || []).some((x) => x.key === "X-Robots-Tag" && /noindex/.test(x.value))) fails.push(`${site.id}/vercel.json: the first header rule is not the host-gated noindex`);
  if (MODE === "preview") {
    if (!/^Disallow:\s*\/\s*$/m.test(robots)) fails.push(`${site.id}/robots.txt: preview build does not disallow crawling`);
    if (!sitewide.length) fails.push(`${site.id}/vercel.json: preview build has no sitewide X-Robots-Tag`);
  } else {
    if (robots !== ready) fails.push(`${site.id}/robots.txt: production build does not serve robots.production.txt`);
    if (sitewide.length) fails.push(`${site.id}/vercel.json: production build still sends a sitewide X-Robots-Tag`);
  }
}

function rootServed(dir = REPO, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = path.relative(REPO, p).split(path.sep).join("/");
    if (e.isDirectory()) { if (!ROOT_SKIP_DIRS.has(e.name)) rootServed(p, out); }
    else out.push(rel);
  }
  return out;
}

export function run() {
  const sites = { com: loadSite("com"), org: loadSite("org") };
  const fails = [];
  const reviews = [];
  const warns = [];
  const names = loadPrivateNames();
  if (names.missing) fails.push(MISSING_MESSAGE);
  for (const site of Object.values(sites)) checkMode(site, fails);
  if (ROOT_SCAN) {
    for (const rel of rootServed()) {
      if (!names.missing && findNames(rel, [`root/${rel}`, rel], names).length) fails.push(`root/${rel}:0: private-name-in-path`);
      const buf = fs.readFileSync(path.join(REPO, rel));
      if (isBinary(rel, buf)) {
        if (!names.missing && findNames(binaryText(buf), [`root/${rel}`, rel], names, { compactMatch: false, minLength: 5 }).length) fails.push(`root/${rel}:0: private-name-in-binary`);
        continue;
      }
      const { text: raw, nul } = readText(buf);
      if (nul) fails.push(`root/${rel}:0: nul-byte-in-text`);
      const text = /\.html?$/i.test(rel) ? scanText(raw) : decode(raw);
      if (!names.missing) {
        const found = findNames(raw, [`root/${rel}`, rel], names);
        for (const line of found.length ? nameLines(raw, names, found) : []) fails.push(`root/${rel}:${line}: private-name`);
      }
      if (ROOT_EXEMPT.has(rel)) {
        if (sha256(buf) !== ROOT_EXEMPT.get(rel)) fails.push(`root/${rel}:0: exempt-page-changed (re-review it, then update its pin)`);
        continue;
      }
      if (!ROOT_RULE_FILES.test(rel)) continue;
      for (const b of BANNED) {
        if (b.id === "comma-artifact" || b.id === "rounded-book-price") continue;
        if (b.siteOnly) continue;
        if (ruleHit(b, text)) fails.push(`root/${rel}:${lineOf(raw, b.re || b)}: ${b.id}`);
      }
    }
  }
  for (const site of Object.values(sites)) {
    for (const req of ["404.html", "robots.txt", "robots.production.txt", "sitemap.xml", "llms.txt", "vercel.json"]) {
      if (!site.files.has(req)) fails.push(`${site.id}: missing ${req}`);
    }
    for (const rel of site.files) {
      // The path is the URL, so it is checked like text; then every non-binary file, whatever its extension.
      if (!names.missing && findNames(rel, [`${site.id}/${rel}`], names).length) fails.push(`${site.id}/${rel}:0: private-name-in-path`);
      const buf = fs.readFileSync(path.join(site.dir, rel));
      if (isBinary(rel, buf)) {
        // Text runs inside a binary (PDF text, XMP and EXIF strings) are published too. Entries shorter than five
        // letters are skipped here, because they turn up by chance in compressed image data.
        if (!names.missing && findNames(binaryText(buf), [`${site.id}/${rel}`], names, { compactMatch: false, minLength: 5 }).length) fails.push(`${site.id}/${rel}:0: private-name-in-binary`);
        continue;
      }
      const { text: raw, nul } = readText(buf);
      if (nul) fails.push(`${site.id}/${rel}:0: nul-byte-in-text`);
      // The current terms are served verbatim (EB 2026-11-01); checkTerms proves that block equals the live
      // page, so copy rules apply to everything outside it. The block may appear only on /terms-of-service.
      const hasVerbatim = raw.includes(VERBATIM_START);
      if (hasVerbatim && rel !== "terms-of-service/index.html") fails.push(`${site.id}/${rel}: verbatim terms block outside /terms-of-service`);
      const checked = hasVerbatim ? raw.slice(0, raw.indexOf(VERBATIM_START)) + raw.slice(raw.indexOf(VERBATIM_END) + VERBATIM_END.length) : raw;
      const text = claimText(rel, checked);
      if (/\.(html?|m?js)$/i.test(rel) && RENDER_TIME.test(checked)) fails.push(`${site.id}/${rel}:0: render-time-text-needs-review`);
      for (const b of BANNED) {
        // Script and JSON strings are fragments joined for scanning, so a space before a comma there is an
        // artifact of the join, not of the page.
        if (b.id === "comma-artifact" && /\.(m?js|cjs|json|webmanifest)$/i.test(rel)) continue;
        const m = ruleHit(b, text);
        // File, line and rule only: page text is never printed, so no name can reach a log.
        if (m) fails.push(`${site.id}/${rel}:${lineOf(checked, b.re || b)}: ${b.id}`);
      }
      if (!names.missing) {
        const found = findNames(raw, [`${site.id}/${rel}`], names);
        for (const line of found.length ? nameLines(raw, names, found) : []) fails.push(`${site.id}/${rel}:${line}: private-name`);
      }
      if (!rel.endsWith(".html")) continue;
      const noindex = /<meta name="robots" content="noindex/i.test(raw);
      if (MODE === "preview" && !noindex) fails.push(`${site.id}/${rel}: preview page is missing its noindex meta`);
      if (MODE === "production" && noindex !== staysNoindex(rel)) fails.push(`${site.id}/${rel}: production noindex is ${noindex ? "on" : "off"}, expected ${staysNoindex(rel) ? "on" : "off"}`);
      const isParkedOr404 = rel === "404.html" || rel.startsWith("parking/");
      if (!/<title>[^<]+<\/title>/.test(raw)) fails.push(`${site.id}/${rel}: no <title>`);
      if (!metaContent(raw, "name", "description")) fails.push(`${site.id}/${rel}: no meta description`);
      const canon = (raw.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
      if (!isParkedOr404) {
        if (!canon) fails.push(`${site.id}/${rel}: no canonical`);
        else if (!canon.startsWith(`https://${HOST[site.id]}/`) && !canon.startsWith("https://registry.credtent.org/")) fails.push(`${site.id}/${rel}: canonical on the wrong host`);
        for (const og of ["og:title", "og:description", "og:url"]) if (!metaContent(raw, "property", og)) fails.push(`${site.id}/${rel}: no ${og}`);
        const ogImage = metaContent(raw, "property", "og:image");
        if (!ogImage) fails.push(`${site.id}/${rel}: no og:image`);
        else if (!ogImage.startsWith("https://")) fails.push(`${site.id}/${rel}: og:image is not absolute`);
      }
      if (!noindex && isParkedOr404) fails.push(`${site.id}/${rel}: parked or 404 page is indexable`);
      for (const [, href] of raw.matchAll(/href="([^"]+)"/g)) {
        const m = href.match(/^https:\/\/(credtent\.com|credtent\.org|www\.credtent\.(com|org))(\/[^"]*)?$/);
        if (m) {
          const target = m[1].endsWith("com") ? sites.com : sites.org;
          if (m[1].startsWith("www.")) fails.push(`${site.id}/${rel}: www link`);
          if (!resolves(target, m[3] || "/")) fails.push(`${site.id}/${rel}: cross-site link does not resolve`);
          if (/\.html(#|$)/.test(href)) fails.push(`${site.id}/${rel}: legacy .html link`);
        }
        if (/sign-up/i.test(href) && /registry\.credtent\.org/.test(href)) fails.push(`${site.id}/${rel}: held sign-up link`);
        if (/tally\.so\/r\/2ExeBp/.test(href)) fails.push(`${site.id}/${rel}: investor link bypasses the D10 cutover`);
        if (/^mailto:[^"]*@credtent\.com/i.test(href)) fails.push(`${site.id}/${rel}: contact address is not @credtent.org`);
      }
    }
  }
  checkTerms(sites, fails);
  for (const site of Object.values(sites)) {
    const privacy = fs.readFileSync(path.join(site.dir, "privacy-policy", "index.html"), "utf8");
    if (privacyDateProblem(privacy)) (MODE === "production" ? fails : warns).push(`${site.id}/privacy-policy: "Last Updated" still shows ${PRIVACY_DATE_PLACEHOLDER}; set PRIVACY_LAST_UPDATED in src/lib/privacy.mjs to the launch date`);
  }
  // Review round 2026-11-01: the .org home never shows US$49 as an Opt-Out Premium price.
  const orgHome = fs.readFileSync(path.join(sites.org.dir, "index.html"), "utf8");
  const premium = (orgHome.match(/<section[^>]*id="premium"[\s\S]*?<\/section>/) || [""])[0];
  const premiumText = visibleText(premium).replace(/\s+/g, " ");
  // Copy rewrite 2026-11-10 (Vonnegut H6): the promo label may read "(promo)" or "a year" with "Promotional price" on the next line.
  if (!/Licensing for individuals \. US\$49 (\(promo\)|a year[ .]*Promotional price)/.test(premiumText) || !/Opt-Out Premium for rights holders \. from US\$299/.test(premiumText)) fails.push("org/index.html: the #premium prices are not labeled \"Licensing for individuals US$49 (promo)\" and \"Opt-Out Premium for rights holders from US$299\"");
  for (const p of LEGACY_ORG_PATHS) if (!resolves(sites.org, p)) fails.push(`org: legacy URL no longer resolves: ${p}`);
  for (const pre of PRECONDITIONS) {
    const v = process.env[pre.env] || "";
    const t = /^\d{4}-\d{2}-\d{2}$/.test(v) ? Date.parse(`${v}T00:00:00Z`) : NaN;
    const ok = !Number.isNaN(t) && t <= Date.now() && (!pre.after || t > Date.parse(`${pre.after}T00:00:00Z`));
    if (!ok) (MODE === "production" ? fails : warns).push(`precondition ${pre.env} not confirmed (a YYYY-MM-DD date after ${pre.after || "the pause"} and not in the future): ${pre.why}`);
  }
  for (const problem of auditCoverageProblems()) (MODE === "production" ? fails : warns).push(`precondition audit coverage: ${problem}`);
  return { fails, reviews, warns };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!MODES.includes(MODE)) {
    console.error(`usage: node scripts/check-launch.mjs <${MODES.join("|")}> [comDir] [orgDir]`);
    process.exit(2);
  }
  const { fails, reviews, warns } = run();
  for (const r of reviews) console.log(redactLine(`REVIEW ${r}`, loadPrivateNames()));
  for (const w of warns) console.log(redactLine(`WARN ${w}`, loadPrivateNames()));
  // Never print a path, URL or token that names a listed entry: it becomes a short hash.
  const names = loadPrivateNames();
  for (const f of fails) console.log(redactLine(`FAIL ${f}`, names));
  console.log(`launch check: ${fails.length} fail, ${reviews.length} review, ${warns.length} warn`);
  process.exit(fails.length ? 1 : 0);
}
