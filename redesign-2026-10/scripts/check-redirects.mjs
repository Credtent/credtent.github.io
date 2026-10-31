import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { TALLY_FORM_IDS } from "../src/lib/render.mjs";

const root = path.resolve(import.meta.dirname, "..");
const sites = {
  "https://credtent.com": path.join(root, "sites/com"),
  "https://credtent.org": path.join(root, "sites/org")
};

const failures = [];
function fail(message) {
  failures.push(message);
}

const previewBuild = process.env.SITE_ENV !== "production";
const HIDDEN_RESOURCES = [
  "/resources/what-an-opt-out-can-do",
  "/resources/how-to-read-platform-terms",
  "/resources/use-ai-without-giving-up-judgment"
];
const ORG_WITHHELD = [
  "/creative-consent",
  "/creative-consent/platforms",
  "/creative-consent/guide"
];

function staysNoindex(rel) {
  if (rel === "404.html" || rel.startsWith("parking/")) return true;
  if (HIDDEN_RESOURCES.some((item) => rel === `${item.slice(1)}/index.html`)) return true;
  if (ORG_WITHHELD.some((item) => rel === `${item.slice(1)}/index.html`)) return true;
  return false;
}

function hostGateValue(origin) {
  return origin.endsWith(".com") ? "(www\\.)?credtent\\.com" : "(www\\.)?credtent\\.org";
}

function unconditionalSitewide(config) {
  return (config.headers || []).some((item) => item.source === "/(.*)" && !item.missing && (item.headers || []).some((h) => h.key === "X-Robots-Tag"));
}

function assertHostGate(origin, config) {
  const first = (config.headers || [])[0];
  const expected = hostGateValue(origin);
  if (!first || first.source !== "/(.*)" || !Array.isArray(first.missing) || !first.missing.length) {
    fail(`${origin} first header is not the non-production host noindex rule`);
    return;
  }
  const missing = first.missing[0];
  if (missing.type !== "host" || missing.value !== expected) {
    fail(`${origin} host noindex value is ${missing.value}, expected ${expected}`);
  }
  const tag = (first.headers || []).find((item) => item.key === "X-Robots-Tag");
  if (!tag || tag.value !== "noindex, nofollow") fail(`${origin} host gate is missing X-Robots-Tag noindex, nofollow`);
  for (const rule of config.headers || []) {
    for (const header of rule.headers || []) {
      if (/content-security-policy/i.test(header.key)) {
        const value = header.value || "";
        if (!value.includes("googletagmanager.com") || !value.includes("google-analytics.com")) {
          fail(`${origin} CSP does not allow googletagmanager.com and google-analytics.com`);
        }
      }
    }
  }
}

function expectSlot(html, label, id) {
  if (!id) return 1;
  const embed = `https://tally.so/embed/${id}?hideTitle=1&transparentBackground=1&dynamicHeight=1`;
  if (!html.includes(`data-tally-src="${embed}"`)) fail(`${label} is missing the Tally embed for ${id}`);
  if (!html.includes(`https://tally.so/r/${id}`)) fail(`${label} is missing the noscript link for ${id}`);
  if (!html.includes('loading="lazy"') || !/style="min-height:\d+px"/.test(html)) {
    fail(`${label} embed for ${id} is missing lazy loading or a reserved min-height`);
  }
  return 0;
}

function fileFor(originDir, urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (clean === "/" || clean === "") return path.join(originDir, "index.html");
  const rel = clean.replace(/^\//, "").replace(/\/$/, "");
  const asFile = path.join(originDir, rel);
  const asIndex = path.join(originDir, rel, "index.html");
  if (fs.existsSync(asFile) && fs.statSync(asFile).isFile()) return asFile;
  if (fs.existsSync(asIndex)) return asIndex;
  return null;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const moved = [
  ["/for-ai-companies", "https://credtent.com/ai-companies"],
  ["/for-content-owners", "https://credtent.com/content-owners"],
  ["/pricing", "https://credtent.com/pricing"],
  ["/about", "https://credtent.com/about"],
  ["/faq", "https://credtent.com/faq"],
  ["/certified-publisher", "https://credtent.com/certified-publisher"]
];

const orgConfig = JSON.parse(fs.readFileSync(path.join(sites["https://credtent.org"], "vercel.json"), "utf8"));
const comConfig = JSON.parse(fs.readFileSync(path.join(sites["https://credtent.com"], "vercel.json"), "utf8"));

function indexRules(config) {
  const map = new Map();
  for (const rule of config.redirects || []) {
    if (map.has(rule.source)) fail(`duplicate redirect ${rule.source}`);
    map.set(rule.source, rule);
    if (rule.source === "/(.*)" || rule.source.includes("*") || rule.source.includes(":")) {
      fail(`blanket or patterned redirect: ${rule.source}`);
    }
  }
  return map;
}

const orgRules = indexRules(orgConfig);
const comRules = indexRules(comConfig);

for (const [stem, destination] of moved) {
  for (const source of [stem, `${stem}/`, `${stem}.html`]) {
    const rule = orgRules.get(source);
    if (!rule) fail(`missing .org redirect ${source}`);
    else if (rule.destination !== destination || rule.statusCode !== 301) {
      fail(`${source} -> ${rule.destination} status ${rule.statusCode}, expected 301 ${destination}`);
    }
  }
}

const guide = "https://credtent.com/guides/ai-training-data-licensing-companies/";
for (const source of [
  "/guides/ai-training-data-licensing-companies",
  "/guides/ai-training-data-licensing-companies/",
  "/guides/ai-training-data-licensing-companies.html",
  "/guides/ai-training-data-licensing-companies/index.html"
]) {
  const rule = orgRules.get(source);
  if (!rule) fail(`missing .org redirect ${source}`);
  else if (rule.destination !== guide || rule.statusCode !== 301) {
    fail(`${source} -> ${rule.destination} status ${rule.statusCode}`);
  }
}

for (const rules of [orgRules, comRules]) {
  if (rules.has("/creative-origin")) fail("/creative-origin must stay a page, not a redirect");
}
const originSlash = orgRules.get("/creative-origin/");
if (!originSlash || originSlash.destination !== "https://credtent.org/creative-origin" || originSlash.statusCode !== 301) {
  fail("/creative-origin/ must 301 to the .org page");
}
const originIndex = orgRules.get("/creative-origin/index.html");
if (!originIndex || originIndex.destination !== "https://credtent.org/creative-origin" || originIndex.statusCode !== 301) {
  fail("/creative-origin/index.html must 301 to the .org page");
}
if (!fileFor(sites["https://credtent.org"], "/creative-origin")) fail("missing /creative-origin page on .org");

for (const [label, rules] of [["com", comRules], ["org", orgRules]]) {
  for (const source of ["/partners", "/partners/", "/partners.html"]) {
    const rule = rules.get(source);
    if (!rule) fail(`missing ${label} /partners redirect ${source}`);
    else if (rule.destination !== "/" || rule.statusCode !== 302 || rule.permanent === true) {
      fail(`${label} ${source} must 302 to / (got ${JSON.stringify(rule)})`);
    }
  }
}

for (const [origin, dir] of Object.entries(sites)) {
  const config = origin.endsWith(".com") ? comConfig : orgConfig;
  for (const rule of config.redirects) {
    const destination = rule.destination.startsWith("http") ? rule.destination : origin + (rule.destination.startsWith("/") ? rule.destination : `/${rule.destination}`);
    const url = new URL(destination);
    const local = sites[url.origin];
    if (!local) {
      fail(`redirect leaves the two marketing hosts: ${rule.source} -> ${destination}`);
      continue;
    }
    if (!fileFor(local, url.pathname)) fail(`redirect target missing: ${rule.source} -> ${destination}`);
  }
  assertHostGate(origin, config);
  if (previewBuild) {
    if (!unconditionalSitewide(config)) fail(`${origin} preview vercel.json is missing the sitewide X-Robots-Tag`);
  } else if (unconditionalSitewide(config)) {
    fail(`${origin} production vercel.json still sends a sitewide X-Robots-Tag`);
  }

  const robots = fs.readFileSync(path.join(dir, "robots.txt"), "utf8");
  const productionRobots = fs.readFileSync(path.join(dir, "robots.production.txt"), "utf8");
  if (previewBuild) {
    if (!/Disallow:\s*\//.test(robots)) fail(`${origin} preview robots.txt does not disallow /`);
  } else {
    if (robots !== productionRobots) fail(`${origin} production build does not serve robots.production.txt`);
    if (/^Disallow:\s*\/\s*$/m.test(robots)) fail(`${origin} production robots.txt still disallows the whole site`);
  }
  if (!/Allow:\s*\//.test(productionRobots)) fail(`${origin} robots.production.txt is not ready to allow crawling`);
  if (!productionRobots.includes(`Sitemap: ${origin}/sitemap.xml`)) fail(`${origin} production robots missing sitemap`);

  const xml = fs.readFileSync(path.join(dir, "sitemap.xml"), "utf8");
  const parsed = spawnSync("python3", ["-c", "import sys,xml.etree.ElementTree as ET; ET.parse(sys.argv[1])", path.join(dir, "sitemap.xml")], { encoding: "utf8" });
  if (parsed.status !== 0) fail(`${origin} sitemap.xml is not well-formed XML\n${parsed.stderr}`);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (!locs.length) fail(`${origin} sitemap has no URLs`);
  if (locs.some((loc) => loc.includes("/partners"))) fail(`${origin} sitemap still lists /partners`);
  if (locs.some((loc) => loc.includes("/parking"))) fail(`${origin} sitemap lists a parked URL`);
  if (locs.some((loc) => loc.includes("2ExeBp") || loc.includes("/investors"))) {
    fail(`${origin} sitemap lists the investor form`);
  }
  for (const hidden of HIDDEN_RESOURCES) {
    if (locs.some((loc) => loc.endsWith(hidden))) fail(`${origin} sitemap lists coming-soon URL ${hidden}`);
  }
  if (origin.endsWith(".org")) {
    for (const hidden of ORG_WITHHELD) {
      if (locs.some((loc) => loc === `${origin}${hidden}` || loc === `${origin}${hidden}/`)) {
        fail(`${origin} sitemap lists withheld URL ${hidden}`);
      }
    }
    if (locs.length !== 21) {
      fail(`${origin} sitemap has ${locs.length} URLs, expected 21 after dropping parked, coming-soon, and Creative Consent draft pages`);
    }
  }
  for (const loc of locs) {
    const url = new URL(loc);
    if (url.origin !== origin) fail(`sitemap loc on the wrong host: ${loc}`);
    if (!fileFor(dir, url.pathname)) fail(`sitemap loc missing file: ${loc}`);
  }

  const llms = fs.readFileSync(path.join(dir, "llms.txt"), "utf8");
  if (/\/partners\b/i.test(llms)) fail(`${origin} llms.txt mentions /partners`);
  for (const match of llms.matchAll(/\]\((https:\/\/credtent\.(?:com|org)[^)\s]+)\)/g)) {
    const link = match[1];
    const url = new URL(link);
    if (url.origin !== origin) continue;
    const target = fileFor(dir, url.pathname);
    if (!target) {
      fail(`${origin} llms.txt points at a missing page ${link}`);
      continue;
    }
    const canonical = fs.readFileSync(target, "utf8").match(/<link rel="canonical" href="([^"]+)"/);
    if (!canonical || canonical[1] !== link) fail(`${origin} llms.txt ${link} does not match canonical ${canonical && canonical[1]}`);
  }

  const hiddenPaths = [
    "/resources/what-an-opt-out-can-do",
    "/resources/how-to-read-platform-terms",
    "/resources/use-ai-without-giving-up-judgment"
  ];
  const pages = walk(dir).filter((file) => file.endsWith(".html"));
  for (const file of pages) {
    const html = fs.readFileSync(file, "utf8");
    const rel = path.relative(dir, file).split(path.sep).join("/");
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
    const is404 = rel === "404.html";
    if (is404) {
      if (canonical) fail(`${path.relative(root, file)} should not have a canonical`);
    } else if (!canonical) fail(`${path.relative(root, file)} missing canonical`);
    else if (!canonical[1].startsWith(origin)) fail(`${path.relative(root, file)} canonical ${canonical[1]}`);
    const investor = 'href="https://tally.so/r/2ExeBp" target="_blank" rel="noopener"';
    if (!html.includes(investor)) fail(`${path.relative(root, file)} is missing the investor link`);
    if (html.includes("nroELN")) fail(`${path.relative(root, file)} still references the dead Tally id`);
    if (/\bAlmond\b/.test(html)) fail(`${path.relative(root, file)} spells Allmond as Almond`);
    const loadsGtagNow = /src="https:\/\/www\.googletagmanager\.com\/gtag\/js/.test(html);
    if (previewBuild) {
      if (!/name="robots" content="noindex, nofollow"/.test(html)) fail(`${path.relative(root, file)} missing preview noindex`);
      if (/googletagmanager\.com|google-analytics\.com|id="cookie-banner"|id="cookie-settings"/.test(html)) {
        fail(`${path.relative(root, file)} loads analytics or a cookie banner in preview`);
      }
    } else {
      if (html.includes("preview-bar")) fail(`${path.relative(root, file)} still shows the preview bar`);
      if (loadsGtagNow) fail(`${path.relative(root, file)} loads gtag.js before consent`);
      {
        if (!html.includes("https://www.googletagmanager.com/gtag/js?id=")) fail(`${path.relative(root, file)} is missing the consent-gated GA loader`);
        if (!html.includes('"anonymize_ip":true') || !html.includes('"allow_ad_personalization_signals":false')) {
          fail(`${path.relative(root, file)} is missing anonymized GA defaults`);
        }
        if (!html.includes("analytics_storage: 'denied'") || !html.includes("ad_personalization: 'denied'")) {
          fail(`${path.relative(root, file)} is missing Consent Mode defaults`);
        }
        if (!html.includes('id="cookie-banner"') || !html.includes('id="cookie-accept"') || !html.includes('id="cookie-decline"')) {
          fail(`${path.relative(root, file)} is missing the cookie banner`);
        }
        if (!html.includes('id="cookie-settings"')) fail(`${path.relative(root, file)} is missing Cookie settings`);
      }
      if (staysNoindex(rel)) {
        if (!/name="robots" content="noindex, nofollow"/.test(html)) fail(`${path.relative(root, file)} is missing its noindex meta`);
      } else if (/name="robots" content="noindex/.test(html)) {
        fail(`${path.relative(root, file)} still has a preview noindex meta`);
      }
    }
    if (/href="[^"]*\/partners\/?"/.test(html) || /https:\/\/credtent\.com\/partners/.test(html)) {
      fail(`${path.relative(root, file)} still links to /partners`);
    }
    const ownStub = hiddenPaths.find((item) => rel === `${item.slice(1)}/index.html`);
    if (!ownStub) {
      for (const item of hiddenPaths) {
        if (html.includes(item)) fail(`${path.relative(root, file)} still links to ${item}`);
      }
    }
  }

  const fonts = walk(path.join(dir, "fonts")).filter((file) => file.endsWith(".woff2"));
  const css = fs.readFileSync(path.join(dir, "css/tokens.css"), "utf8");
  if (!css.includes('font-family: "Source Serif 4"') || !css.includes('font-family: "Inter"')) {
    fail(`${origin} fonts are not Source Serif 4 and Inter`);
  }
  if (/fonts\.google|fonts\.gstatic/.test(css)) fail(`${origin} fonts are not self-hosted`);
  if (fonts.length < 2) fail(`${origin} missing self-hosted font files`);
  console.log(`${origin}: ${locs.length} sitemap URLs, ${pages.length} html files, ${config.redirects.length} redirects, ${fonts.length} font files`);
}

const kept = [];
const audience = new RegExp("\\bcreat" + "ors?\\b", "i");
for (const file of Object.values(sites).flatMap((dir) => walk(dir)).filter((file) => /\.(html|txt|json|xml)$/.test(file))) {
  const text = fs.readFileSync(file, "utf8");
  if (audience.test(text)) fail(`${path.relative(root, file)} still says creator/creators`);
  for (const name of ["Creator Licensing", "ICR Creator"]) {
    if (text.includes(name)) kept.push(`${name} in ${path.relative(root, file)}`);
  }
}
console.log(kept.length ? `kept product names:\n${kept.join("\n")}` : "kept product names: none");

const home = fs.readFileSync(path.join(sites["https://credtent.com"], "index.html"), "utf8");
if (!/src="\/media\/bridge-1600\.webp" width="1600"/.test(home)) fail("com home hero width is not 1600");
const premium = fs.readFileSync(path.join(sites["https://credtent.org"], "premium/index.html"), "utf8");
if (!premium.includes('"@type":"Offer"') || !premium.includes('"price":"49"') || !premium.includes('"minPrice":"299"')) {
  fail("org premium is missing Offer markup for 49 and 299+");
}
const contact = fs.readFileSync(path.join(sites["https://credtent.com"], "contact/index.html"), "utf8");
if (/TODO\(Eric\)/.test(contact)) fail("com contact still has a TODO");
if (/VL10Ga/.test(contact)) fail("com contact still references the content partner Tally form");
if (!contact.includes("https://tally.so/embed/BzbXK7?hideTitle=1&transparentBackground=1&dynamicHeight=1")) {
  fail("com contact is missing the AI Company Licensing Inquiry embed");
}
if (!contact.includes("https://tally.so/r/BzbXK7")) fail("com contact is missing the AI licensing Tally fallback link");
if (!contact.includes('href="https://app.credtent.org/inquiries/content-partner"')) {
  fail("com contact is missing the content partner inquiry link");
}
if (!contact.includes("Prefer email? <a href=\"mailto:sales@credtent.com\">sales@credtent.com</a>")) {
  fail("com contact is missing the sales@ email line");
}
if (!contact.includes('action="mailto:sales@credtent.com"')) fail("com contact is missing the remaining mailto form");
const owners = fs.readFileSync(path.join(sites["https://credtent.com"], "content-owners/index.html"), "utf8");
if (!owners.includes('href="https://app.credtent.org/inquiries/content-partner"')) fail("content owners CTA does not open the app inquiry page");
if (owners.includes("#content-partners") || owners.includes("VL10Ga")) fail("content owners CTA still points at the Tally section");
const orgContact = fs.readFileSync(path.join(sites["https://credtent.org"], "contact/index.html"), "utf8");
const consent = fs.readFileSync(path.join(sites["https://credtent.org"], "creative-consent/index.html"), "utf8");
if (/TODO\(Eric\): No Tally/.test(orgContact) || /TODO\(Eric\): No Tally/.test(consent)) {
  fail("mailto pages still have a Tally TODO");
}
const orgMailto = expectSlot(orgContact, "org contact", TALLY_FORM_IDS.orgContact);
if ((orgContact.match(/action="mailto:sales@credtent.com"/g) || []).length !== orgMailto) {
  fail("org contact form does not match its Tally slot");
}
const consentMailto = expectSlot(consent, "creative consent clarification", TALLY_FORM_IDS.consentClarification)
  + expectSlot(consent, "creative consent updates", TALLY_FORM_IDS.consentUpdates);
if ((consent.match(/action="mailto:sales@credtent.com"/g) || []).length !== consentMailto) {
  fail("creative consent forms do not match their Tally slots");
}
if (!/name="robots" content="noindex, nofollow"/.test(consent)) fail("creative consent is missing noindex");
const renderSrc = fs.readFileSync(path.join(root, "src/lib/render.mjs"), "utf8");
if (renderSrc.includes("nroELN")) fail("dead Tally id is still allowlisted");
for (const [origin, dir] of Object.entries(sites)) {
  for (const rel of ["sitemap/index.html", "credits/index.html", "404.html"]) {
    const html = fs.readFileSync(path.join(dir, rel), "utf8");
    if (html.includes('\"@type\":\"FAQPage\"') || html.includes("Is this the XML sitemap?") || html.includes("Which licenses apply?")) {
      fail(`${origin} ${rel} still has a thin FAQ`);
    }
  }
  const privacy = fs.readFileSync(path.join(dir, "privacy-policy/index.html"), "utf8");
  if (privacy.includes("preview port") || privacy.includes("Is this the current public page?")) {
    fail(`${origin} privacy policy still has the preview FAQ`);
  }
  if (!/analytics/i.test(privacy)) fail(`${origin} privacy policy does not mention analytics`);
  if (!privacy.includes("stays off until you choose Accept")) {
    fail(`${origin} privacy policy does not mention the analytics consent choice`);
  }
}
const standards = fs.readFileSync(path.join(sites["https://credtent.org"], "standards/index.html"), "utf8");
const standardsDescription = (standards.match(/name="description" content="([^"]*)"/) || [,""])[1];
if (standardsDescription.length > 155) fail(`standards description is ${standardsDescription.length} characters`);
const comAboutSlash = comRules.get("/about/");
if (!comAboutSlash || comAboutSlash.destination !== "https://credtent.com/about" || comAboutSlash.statusCode !== 301) {
  fail("/about/ must 301 to https://credtent.com/about");
}
const comGuide = "https://credtent.com/guides/ai-training-data-licensing-companies/";
const comGuideBare = comRules.get("/guides/ai-training-data-licensing-companies");
if (!comGuideBare || comGuideBare.destination !== comGuide || comGuideBare.statusCode !== 301) {
  fail("the company-map guide must keep its slash canonical");
}
if (comRules.has("/guides/ai-training-data-licensing-companies/")) {
  fail("the slashed company-map canonical must not redirect");
}
const orgGuideBare = orgRules.get("/guides/ai-training-data-licensing");
if (!orgGuideBare || orgGuideBare.destination !== "https://credtent.org/guides/ai-training-data-licensing/" || orgGuideBare.statusCode !== 301) {
  fail("the creative licensing guide must keep its slash canonical");
}
const about = fs.readFileSync(path.join(sites["https://credtent.com"], "about/index.html"), "utf8");
if (/TODO\(Eric\)/.test(about)) fail("com about still has a hidden TODO");

function assertProduction(outDir) {
  const hosts = {
    "https://credtent.com": path.join(outDir, "com"),
    "https://credtent.org": path.join(outDir, "org")
  };
  for (const [origin, dir] of Object.entries(hosts)) {
    const robots = fs.readFileSync(path.join(dir, "robots.txt"), "utf8");
    const ready = fs.readFileSync(path.join(dir, "robots.production.txt"), "utf8");
    if (robots !== ready) fail(`${origin} production build does not serve robots.production.txt`);
    if (/^Disallow:\s*\/\s*$/m.test(robots)) fail(`${origin} production robots.txt still disallows the whole site`);
    const config = JSON.parse(fs.readFileSync(path.join(dir, "vercel.json"), "utf8"));
    assertHostGate(origin, config);
    if (unconditionalSitewide(config)) {
      fail(`${origin} production vercel.json still sends a sitewide X-Robots-Tag`);
    }
    const indexable = fs.readFileSync(path.join(dir, "index.html"), "utf8");
    if (/name="robots" content="noindex/.test(indexable)) fail(`${origin} production home still has a noindex meta tag`);
    if (indexable.includes("preview-bar")) fail(`${origin} production home still shows the preview bar`);
    const loadsGtagNow = /src="https:\/\/www\.googletagmanager\.com\/gtag\/js/.test(indexable);
    if (loadsGtagNow) fail(`${origin} production home loads gtag.js before consent`);
    {
      if (!indexable.includes("https://www.googletagmanager.com/gtag/js?id=") || !indexable.includes('"anonymize_ip":true') || !indexable.includes('"allow_ad_personalization_signals":false')) {
        fail(`${origin} production home is missing anonymized GA4`);
      }
      if (!indexable.includes("analytics_storage: 'denied'") || !indexable.includes('id="cookie-banner"') || !indexable.includes('id="cookie-settings"')) {
        fail(`${origin} production home is missing the consent banner`);
      }
    }
    const hostGate = `var gaHosts = ${JSON.stringify(origin.endsWith(".com") ? ["credtent.com", "www.credtent.com"] : ["credtent.org", "www.credtent.org"])};`;
    if (!indexable.includes(hostGate)) fail(`${origin} production home is missing the GA hostname allowlist`);
    const missing = fs.readFileSync(path.join(dir, "404.html"), "utf8");
    if (/rel="canonical"/.test(missing)) fail(`${origin} production 404 still has a canonical`);
    if (!/name="robots" content="noindex, nofollow"/.test(missing)) fail(`${origin} production 404 is missing noindex`);
  }
  const parked = fs.readFileSync(path.join(outDir, "org/parking/badges/index.html"), "utf8");
  if (!/name="robots" content="noindex, nofollow"/.test(parked)) fail("production parking page is missing noindex");
  const stub = fs.readFileSync(path.join(outDir, "org/resources/how-to-read-platform-terms/index.html"), "utf8");
  if (!/name="robots" content="noindex, nofollow"/.test(stub)) fail("production coming-soon page is missing noindex");
  if (!stub.includes("Coming soon.")) fail("coming-soon page is missing the Coming soon line");
  if (/TODO\(Eric\)/.test(stub)) fail("coming-soon page still shows a TODO");
  for (const rel of ["creative-consent/index.html", "creative-consent/platforms/index.html", "creative-consent/guide/index.html"]) {
    const withheld = fs.readFileSync(path.join(outDir, "org", rel), "utf8");
    if (!/name="robots" content="noindex, nofollow"/.test(withheld)) fail(`production ${rel} is missing noindex`);
    if (withheld.includes("preview-bar")) fail(`production ${rel} still shows the preview bar`);
  }
  const orgConfig = JSON.parse(fs.readFileSync(path.join(outDir, "org/vercel.json"), "utf8"));
  for (const source of ["/parking/(.*)", "/resources/how-to-read-platform-terms", "/creative-consent", "/creative-consent/platforms", "/creative-consent/guide"]) {
    const rule = (orgConfig.headers || []).find((item) => item.source === source);
    if (!rule || !/noindex/.test(JSON.stringify(rule))) fail(`production org vercel.json missing noindex for ${source}`);
  }
}

const prodOut = "/tmp/credtent-prod-robots";
const produced = spawnSync("node", ["src/build.mjs"], {
  cwd: root,
  env: { ...process.env, SITE_ENV: "production", SITE_OUT: prodOut },
  encoding: "utf8"
});
if (produced.status !== 0) {
  fail(`production build failed\n${produced.stdout || ""}\n${produced.stderr || ""}`);
} else {
  assertProduction(prodOut);
  console.log("production mode: robots.production.txt is served, indexable pages have no noindex meta or sitewide X-Robots-Tag");
}

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`\n${failures.length} redirect/sitemap check failure(s).`);
  process.exit(1);
}
console.log("redirect, sitemap, canonical, and robots checks passed");
