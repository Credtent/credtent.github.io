import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sites = {
  "https://credtent.com": path.join(root, "sites/com"),
  "https://credtent.org": path.join(root, "sites/org")
};

const failures = [];
function fail(message) {
  failures.push(message);
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

for (const source of ["/creative-origin", "/creative-origin/"]) {
  if (orgRules.has(source) || comRules.has(source)) fail(`${source} must stay a page, not a redirect`);
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
  const header = (config.headers || []).flatMap((item) => item.headers || []).find((item) => item.key === "X-Robots-Tag");
  if (!header || !/noindex/i.test(header.value)) fail(`${origin} missing preview X-Robots-Tag noindex`);

  const robots = fs.readFileSync(path.join(dir, "robots.txt"), "utf8");
  if (!/Disallow:\s*\//.test(robots)) fail(`${origin} preview robots.txt does not disallow /`);
  const production = fs.readFileSync(path.join(dir, "robots.production.txt"), "utf8");
  if (!/Allow:\s*\//.test(production)) fail(`${origin} robots.production.txt is not ready to allow crawling`);
  if (!production.includes(`Sitemap: ${origin}/sitemap.xml`)) fail(`${origin} production robots missing sitemap`);

  const xml = fs.readFileSync(path.join(dir, "sitemap.xml"), "utf8");
  const parsed = spawnSync("python3", ["-c", "import sys,xml.etree.ElementTree as ET; ET.parse(sys.argv[1])", path.join(dir, "sitemap.xml")], { encoding: "utf8" });
  if (parsed.status !== 0) fail(`${origin} sitemap.xml is not well-formed XML\n${parsed.stderr}`);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (!locs.length) fail(`${origin} sitemap has no URLs`);
  if (locs.some((loc) => loc.includes("/partners"))) fail(`${origin} sitemap still lists /partners`);
  if (locs.some((loc) => loc.includes("/parking"))) fail(`${origin} sitemap lists a parked URL`);
  for (const hidden of [
    "/resources/what-an-opt-out-can-do",
    "/resources/how-to-read-platform-terms",
    "/resources/use-ai-without-giving-up-judgment"
  ]) {
    if (locs.some((loc) => loc.endsWith(hidden))) fail(`${origin} sitemap lists coming-soon URL ${hidden}`);
  }
  if (origin.endsWith(".org") && locs.length !== 24) {
    fail(`${origin} sitemap has ${locs.length} URLs, expected 24 after dropping parked and coming-soon pages`);
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
    if (!/name="robots" content="noindex, nofollow"/.test(html)) fail(`${path.relative(root, file)} missing preview noindex`);
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
if (!premium.includes('"@type":"Offer"') || !premium.includes('"price":"49"') || !premium.includes('"minPrice":"249"')) {
  fail("org premium is missing Offer markup for 49 and 249+");
}
const contact = fs.readFileSync(path.join(sites["https://credtent.com"], "contact/index.html"), "utf8");
const contactVisible = contact.replace(/<!--[\s\S]*?-->/g, "");
if (/TODO\(Eric\)/.test(contactVisible)) fail("com contact still has a visible TODO on the page");
if (!contact.includes("https://tally.so/embed/BzbXK7?hideTitle=1&transparentBackground=1&dynamicHeight=1")) {
  fail("com contact is missing the AI Company Licensing Inquiry embed");
}
if (!contact.includes("https://tally.so/embed/VL10Ga?hideTitle=1&transparentBackground=1&dynamicHeight=1")) {
  fail("com contact is missing the Content Partner Inquiry embed");
}
if (!contact.includes("https://tally.so/r/BzbXK7") || !contact.includes("https://tally.so/r/VL10Ga")) {
  fail("com contact is missing a Tally fallback link");
}
if (!contact.includes("Prefer email? <a href=\"mailto:sales@credtent.com\">sales@credtent.com</a>")) {
  fail("com contact is missing the sales@ email line");
}
if (!/<!-- TODO\(Eric\): No Tally form in this repo matches valuation/.test(contact)) {
  fail("com contact is missing the TODO for topics without a Tally form");
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
    if ((config.headers || []).some((item) => item.source === "/(.*)")) {
      fail(`${origin} production vercel.json still sends a sitewide X-Robots-Tag`);
    }
    const indexable = fs.readFileSync(path.join(dir, "index.html"), "utf8");
    if (/name="robots" content="noindex/.test(indexable)) fail(`${origin} production home still has a noindex meta tag`);
    if (indexable.includes("preview-bar")) fail(`${origin} production home still shows the preview bar`);
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
  const orgConfig = JSON.parse(fs.readFileSync(path.join(outDir, "org/vercel.json"), "utf8"));
  for (const source of ["/parking/(.*)", "/resources/how-to-read-platform-terms"]) {
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
