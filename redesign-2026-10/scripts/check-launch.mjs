// Launch gate for the two built sites. Run: node scripts/check-launch.mjs [comDir] [orgDir]
// Defaults to sites/com and sites/org. Exits 1 on any FAIL; REVIEW lines need a human read.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dirs = {
  com: path.resolve(process.argv[2] || path.join(ROOT, "sites/com")),
  org: path.resolve(process.argv[3] || path.join(ROOT, "sites/org"))
};
const HOST = { com: "credtent.com", org: "credtent.org" };

// Claims removed from the live site in #23 and #24, plus standing locks (LD-006, LD-049, accounts canonical).
export const BANNED = [
  { id: "em-dash", re: /\u2014/ },
  { id: "spaced-en-dash", re: /\s\u2013\s/ },
  { id: "superseded-249", re: /(US)?\$\s?249\b|\b249\+/ },
  { id: "continuous-auditing", re: /continuous(ly)?\s+(audit|monitor)/i },
  { id: "opt-out-enforcement", re: /opt-?out\s+enforcement|enforc\w*\s+(of\s+)?(the\s+|your\s+)?opt-?outs?\b/i },
  { id: "bylaw-acquisition", re: /bylaw|cannot be acquired|can't be acquired|legally enforced/i },
  { id: "premium-auditing-system", re: /access to the (opt-out )?auditing system/i },
  { id: "premium-adds-auditing", re: /\badds? (access to )?auditing\b/i },
  { id: "held-sign-up", re: /registry\.credtent\.org\/auth\/sign-up/i },
  { id: "rosen-public", re: /\bRosen\b/ },
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
  { id: "pbc-legal-duty-claim", re: /legally obligat\w*/i },
  // The revised terms take effect 30 days after the section 12 notice email; the date is set when it is sent.
  { id: "tos-effective-date-placeholder", re: /EFFECTIVE-DATE-PENDING/ }
];
// Hard launch preconditions that no file can prove. Each needs an explicit, dated confirmation in the environment.
export const PRECONDITIONS = [
  {
    env: "AUDITOR_RESUMED",
    why: "EB 2026-11-01: launch waits until Credtent's Auditor is running again (Premium copy says works are enrolled in periodic AI model audits). Set AUDITOR_RESUMED=YYYY-MM-DD, the date the first post-pause audit completed."
  }
];
// Old live URLs that must keep resolving on credtent.org after the DNS move (copied or 301'd).
export const LEGACY_ORG_PATHS = [
  "/licensing", "/team/eric-burgess.jpg", "/images/credtent-logo-indigo.svg", "/images/b-corp-logo.svg",
  "/badges/legacy-creation-badge.svg", "/badges/creative-origin-legacy.svg", "/badges/ai-composed-creation-badge.svg",
  "/credtent-logo-mark.svg", "/credtent-wordmark.svg", "/shield-check.svg", "/parking/services"
];
// Names that may appear only as public-market context, never as customers or partners. A human reads each hit.
export const REVIEW_NAMES = /\b(APM Music|Barnes (&amp;|&|and) Noble|Macmillan|Toronto Star|Gannett|Houghton Mifflin|Springer|CEDRO|USA Today|Whistling Woods|Whispering Woods|SOFA Entertainment|Oracle|BBC Studios|Helium Media|EDM Ghost|XYZ Textbooks)\b/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

export function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(a|strong|em|span|b|i|code|cite)>/gi, "")
    .replace(/<[^>]+>/g, " ");
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

export function run() {
  const sites = { com: loadSite("com"), org: loadSite("org") };
  const fails = [];
  const reviews = [];
  const warns = [];
  for (const site of Object.values(sites)) {
    for (const req of ["404.html", "robots.txt", "robots.production.txt", "sitemap.xml", "llms.txt", "vercel.json"]) {
      if (!site.files.has(req)) fails.push(`${site.id}: missing ${req}`);
    }
    for (const rel of site.files) {
      if (!/\.(html|txt|xml|json|css|js)$/.test(rel) || rel.startsWith("fonts/")) continue;
      const raw = fs.readFileSync(path.join(site.dir, rel), "utf8");
      const text = rel.endsWith(".html") ? visibleText(raw) + " " + (raw.match(/content="[^"]*"/g) || []).join(" ") : raw;
      for (const b of BANNED) {
        const m = text.match(b.re);
        if (m) fails.push(`${site.id}/${rel}: ${b.id}: "${text.slice(Math.max(0, m.index - 50), m.index + 60).replace(/\s+/g, " ").trim()}"`);
      }
      const n = rel.endsWith(".html") ? visibleText(raw).match(REVIEW_NAMES) : null;
      if (n) reviews.push(`${site.id}/${rel}: names "${n[1]}"`);
      if (!rel.endsWith(".html")) continue;
      const noindex = /<meta name="robots" content="noindex/i.test(raw);
      const isParkedOr404 = rel === "404.html" || rel.startsWith("parking/");
      if (!/<title>[^<]+<\/title>/.test(raw)) fails.push(`${site.id}/${rel}: no <title>`);
      if (!metaContent(raw, "name", "description")) fails.push(`${site.id}/${rel}: no meta description`);
      const canon = (raw.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
      if (!isParkedOr404) {
        if (!canon) fails.push(`${site.id}/${rel}: no canonical`);
        else if (!canon.startsWith(`https://${HOST[site.id]}/`) && !canon.startsWith("https://registry.credtent.org/")) fails.push(`${site.id}/${rel}: canonical on wrong host ${canon}`);
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
          if (m[1].startsWith("www.")) fails.push(`${site.id}/${rel}: www link ${href}`);
          if (!resolves(target, m[3] || "/")) fails.push(`${site.id}/${rel}: cross-site link does not resolve: ${href}`);
          if (/\.html(#|$)/.test(href)) fails.push(`${site.id}/${rel}: legacy .html link ${href}`);
        }
        if (/sign-up/i.test(href) && /registry\.credtent\.org/.test(href)) fails.push(`${site.id}/${rel}: held sign-up link ${href}`);
        if (/tally\.so\/r\/2ExeBp/.test(href)) fails.push(`${site.id}/${rel}: investor link bypasses the D10 cutover ${href}`);
        if (/^mailto:[^"]*@credtent\.com/i.test(href)) fails.push(`${site.id}/${rel}: contact address is not @credtent.org ${href}`);
      }
    }
  }
  for (const p of LEGACY_ORG_PATHS) if (!resolves(sites.org, p)) fails.push(`org: legacy URL no longer resolves: ${p}`);
  for (const pre of PRECONDITIONS) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(process.env[pre.env] || "")) fails.push(`precondition ${pre.env} not confirmed: ${pre.why}`);
  }
  return { fails, reviews, warns };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { fails, reviews, warns } = run();
  for (const r of reviews) console.log(`REVIEW ${r}`);
  for (const w of warns) console.log(`WARN ${w}`);
  for (const f of fails) console.log(`FAIL ${f}`);
  console.log(`launch check: ${fails.length} fail, ${reviews.length} review, ${warns.length} warn`);
  process.exit(fails.length ? 1 : 0);
}
