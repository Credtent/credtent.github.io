import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { PHOTOS } from "../scripts/assets.mjs";
import { scrub } from "../scripts/scrub.mjs";
import { comPages } from "./lib/com.mjs";
import { ADDRESS_HTML, CAPSULE, LICENSE_SENTENCE } from "./lib/copy.mjs";
import { orgPages } from "./lib/org.mjs";
import { ORG_ID, creditLine, renderPage } from "./lib/render.mjs";
import { securityHeaders } from "./lib/security-headers.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const REPO = path.resolve(ROOT, "..");
const PRODUCTION = process.env.SITE_ENV === "production";

const OUT_ROOT = process.env.SITE_OUT
  ? path.resolve(process.env.SITE_OUT)
  : path.join(ROOT, "sites");

const SITES = {
  com: {
    id: "com",
    origin: "https://credtent.com",
    email: "hello@credtent.com",
    dir: path.join(OUT_ROOT, "com"),
    // G-3BJJV0MSLW is the current public site's only GA4 id (components.js on credtent.org).
    // Reused for credtent.com per EB's 2026-10-29 ask for GA on both hosts; one property, split
    // by hostname in reports. Swap in a separate G- id here if EB wants .com in its own stream.
    measurementId: "G-3BJJV0MSLW",
    cta: { href: "https://app.credtent.org/", label: "Sign up" },
    nav: [
      { href: "/content-owners", label: "Content owners" },
      { href: "/ai-companies", label: "AI companies" },
      { href: "/services", label: "Services" },
      { href: "/about", label: "About" }
    ]
  },
  org: {
    id: "org",
    origin: "https://credtent.org",
    email: "hello@credtent.org",
    dir: path.join(OUT_ROOT, "org"),
    measurementId: "G-3BJJV0MSLW",
    cta: { href: "https://app.credtent.org/opt-out", label: "Free opt-out", shortLabel: "Opt out" },
    nav: [
      { href: "/opt-out", label: "Opt-Out" },
      { href: "/creative-consent", label: "Creative Consent" },
      { href: "/resources", label: "Resources" },
      { href: "https://credtent.com/about", label: "About" }
    ]
  }
};

function photoSource(photo) {
  if (photo.abs) return path.join(REPO, photo.abs);
  if (photo.absTeam) return path.join(ROOT, "inputs/assets/team", photo.absTeam);
  return path.join(ROOT, "inputs/assets/photos", photo.file);
}

async function buildImages(dir) {
  const media = path.join(dir, "media");
  fs.mkdirSync(media, { recursive: true });
  const images = {};
  for (const photo of PHOTOS) {
    const src = photoSource(photo);
    const meta = await sharp(src).rotate().metadata();
    const widths = photo.widths.filter((w) => w <= meta.width);
    const use = widths.length ? widths : [meta.width];
    const name = photo.out || photo.key;
    for (const width of use) {
      const pipeline = () => sharp(src).rotate().resize({ width, withoutEnlargement: true });
      await pipeline().avif({ quality: 50 }).toFile(path.join(media, `${name}-${width}.avif`));
      await pipeline().webp({ quality: 74 }).toFile(path.join(media, `${name}-${width}.webp`));
    }
    images[photo.key] = {
      ...photo,
      base: `/media/${name}`,
      width: meta.width,
      height: meta.height,
      widths: use
    };
  }
  return images;
}

function placeholder(initials) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480" role="img">
    <rect width="480" height="480" fill="#E7E0D6"/>
    <circle cx="240" cy="180" r="68" fill="#C9C0B4"/>
    <ellipse cx="240" cy="400" rx="116" ry="86" fill="#C9C0B4"/>
    <text x="240" y="196" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" fill="#3A342C">${initials}</text>
  </svg>`;
}

function copyShared(dir) {
  const css = path.join(dir, "css");
  fs.mkdirSync(css, { recursive: true });
  fs.copyFileSync(path.join(ROOT, "src/styles/tokens.css"), path.join(css, "tokens.css"));
  fs.copyFileSync(path.join(ROOT, "src/styles/site.css"), path.join(css, "site.css"));
  const fonts = path.join(dir, "fonts");
  fs.mkdirSync(fonts, { recursive: true });
  for (const file of fs.readdirSync(path.join(ROOT, "src/fonts"))) {
    fs.copyFileSync(path.join(ROOT, "src/fonts", file), path.join(fonts, file));
  }
  const brand = path.join(dir, "brand");
  fs.mkdirSync(brand, { recursive: true });
  const svg = path.join(ROOT, "inputs/assets/svg");
  fs.copyFileSync(path.join(svg, "shield.svg"), path.join(brand, "shield.svg"));
  const kit = path.join(ROOT, "src/brand");
  fs.copyFileSync(path.join(kit, "wordmark.svg"), path.join(brand, "wordmark.svg"));
  fs.copyFileSync(path.join(kit, "wordmark-white.svg"), path.join(brand, "wordmark-white.svg"));
  fs.copyFileSync(path.join(kit, "logo-official.png"), path.join(brand, "logo-official.png"));
  fs.copyFileSync(path.join(kit, "logo-reverse.png"), path.join(brand, "logo-reverse.png"));
  const badgeDir = path.join(brand, "badges");
  fs.mkdirSync(badgeDir, { recursive: true });
  for (const file of fs.readdirSync(path.join(kit, "badges"))) {
    fs.copyFileSync(path.join(kit, "badges", file), path.join(badgeDir, file));
  }
  for (const name of ["consent-full.svg", "consent-optional.svg", "consent-none.svg"]) {
    const raw = fs.readFileSync(path.join(svg, name), "utf8").replaceAll("Nunito" + " Sans", "Inter");
    fs.writeFileSync(path.join(brand, name), raw);
  }
  const fav = path.join(dir, "favicon");
  fs.mkdirSync(fav, { recursive: true });
  for (const file of fs.readdirSync(path.join(REPO, "favicon"))) {
    fs.copyFileSync(path.join(REPO, "favicon", file), path.join(fav, file));
  }
  const media = path.join(dir, "media");
  fs.mkdirSync(media, { recursive: true });
  fs.writeFileSync(path.join(media, "placeholder-ea.svg"), placeholder("EA"));
  fs.writeFileSync(path.join(media, "placeholder-ac.svg"), placeholder("AC"));
}

function writePage(dir, site, page) {
  const html = renderPage(site, page);
  const rel = page.file
    ? page.file
    : page.path === "/"
      ? "index.html"
      : path.join(page.path.replace(/^\//, "").replace(/\/$/, ""), "index.html");
  const dest = path.join(dir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
}

function hostLabel(site) {
  return site.id === "com" ? "Credtent for companies" : "Credtent for creatives";
}

function sitemapPage(site, pages) {
  const links = pages
    .filter((page) => !page.file && !page.noindex)
    .map((page) => {
      const href = site.origin + (page.path === "/" ? "/" : page.path);
      return `<li><a href="${href}">${page.title}</a></li>`;
    })
    .join("");
  return {
    path: "/sitemap",
    title: `Sitemap | ${hostLabel(site)}`,
    description: `HTML sitemap for ${site.origin.replace("https://", "")}.`,
    eyebrow: "Sitemap",
    h1: "Sitemap",
    capsule: `Every public page on ${site.origin.replace("https://", "")}.`,
    crumbs: [{ name: "Sitemap", href: site.origin + "/sitemap" }],
    faq: [],
    main: `<section class="section"><div class="wrap"><ul class="sitemap-cols">${links}<li><a href="${site.origin}/sitemap">Sitemap</a></li></ul></div></section>`
  };
}

function creditsPage(site, images, keys) {
  const items = keys.map((key) => {
    const img = images[key];
    return `<li><strong>${img.alt}.</strong> ${creditLine(img).replace(/<\/?figcaption>/g, "")}</li>`;
  }).join("");
  return {
    path: "/credits",
    title: `Photo credits | ${hostLabel(site)}`,
    description: "Photo credits and licenses for images on this Credtent site.",
    eyebrow: "Credits",
    h1: "Photo credits",
    capsule: "Stock photographs are not pictures of Credtent customers, staff, or partners.",
    crumbs: [{ name: "Photo credits", href: site.origin + "/credits" }],
    faq: [],
    main: `<section class="section"><div class="wrap prose"><ul>${items}</ul><p>Pexels license: <a href="https://www.pexels.com/license/">pexels.com/license</a>. Unsplash license: <a href="https://unsplash.com/license">unsplash.com/license</a>.</p></div></section>`
  };
}

function notFound(site) {
  return {
    file: "404.html",
    noindex: true,
    path: "/404.html",
    title: "Page not found | Credtent",
    description: "That page is not on this preview.",
    eyebrow: "404",
    h1: "Page not found.",
    capsule: "The link may have moved. Use the sitemap to continue.",
    faq: [],
    main: `<section class="section"><div class="wrap"><a class="btn" href="/">Back home</a></div></section>`
  };
}

function extractLegacy(file) {
  const raw = fs.readFileSync(file, "utf8");
  const title = (raw.match(/<title>([^<]*)<\/title>/i) || [,"Credtent"])[1];
  const description = (raw.match(/name="description" content="([^"]*)"/i) || [,"Ported Credtent page."])[1];
  let body = (raw.split(/<body[^>]*>/i)[1] || "").split(/<\/body>/i)[0];
  body = body.replace(/<div id="nav-placeholder"[\s\S]*?<\/div>/i, "");
  body = body.replace(/<div id="footer-placeholder"[\s\S]*$/i, "");
  body = body.replace(/<script[\s\S]*?<\/script>/gi, "");
  body = body.replace(/<style[\s\S]*?<\/style>/gi, "");
  body = body.replace(/<img\b[^>]*>/gi, "");
  return { title, description, body };
}

function rewriteLinks(html, origin) {
  const rules = [
    [/href="(?:\.\.\/|\.\/|\/)*for-ai-companies(?:\.html)?"/g, 'href="https://credtent.com/ai-companies"'],
    [/href="(?:\.\.\/|\.\/|\/)*for-content-owners(?:\.html)?"/g, 'href="https://credtent.com/content-owners"'],
    [/href="(?:\.\.\/|\.\/|\/)*pricing(?:\.html)?[^"]*"/g, 'href="https://credtent.com/pricing"'],
    [/href="(?:\.\.\/|\.\/|\/)*about(?:\.html)?"/g, 'href="https://credtent.com/about"'],
    [/href="(?:\.\.\/|\.\/|\/)*faq(?:\.html)?"/g, 'href="https://credtent.com/faq"'],
    [/href="(?:\.\.\/|\.\/|\/)*standards(?:\.html)?"/g, 'href="https://credtent.org/standards"'],
    [/href="(?:\.\.\/|\.\/|\/)*certified-publisher(?:\.html)?[^"]*"/g, 'href="https://credtent.com/certified-publisher"'],
    [/href="(?:\.\.\/|\.\/|\/)*guides\/ai-training-data-licensing-companies\/?"/g, 'href="https://credtent.com/guides/ai-training-data-licensing-companies/"'],
    [/href="(?:\.\.\/|\.\/|\/)*guides\/ai-training-data-licensing\/?"/g, 'href="https://credtent.org/guides/ai-training-data-licensing/"'],
    [/href="(?:\.\.\/|\.\/|\/)*guides\/?"/g, 'href="https://credtent.org/guides/"'],
    [/href="(?:\.\.\/|\.\/|\/)*privacy-policy(?:\.html)?"/g, `href="${origin}/privacy-policy"`],
    [/href="(?:\.\.\/|\.\/|\/)*terms-of-service(?:\.html)?"/g, `href="${origin}/terms-of-service"`],
    [/href="(?:\.\.\/|\.\/|\/)*opt-out(?:\.html)?"/g, 'href="https://credtent.org/opt-out"'],
    [/href="(?:\.\.\/|\.\/|\/)*badge-builder(?:\.html)?"/g, 'href="https://credtent.org/badge-builder"'],
    [/href="(?:\.\.\/|\.\/|\/)*badges\/?"/g, 'href="https://credtent.org/badges/"'],
    [/href="(?:\.\.\/|\.\/|\/)*blog(?:\.html)?"/g, 'href="https://credtent.org/blog"'],
    [/href="(?:\.\.\/|\.\/|\/)*wga(?:\.html)?"/g, 'href="https://credtent.org/wga"'],
    [/href="(?:\.\.\/|\.\/|\/)*lws(?:\.html)?"/g, 'href="https://credtent.org/lws"']
  ];
  let out = rules.reduce((acc, [re, to]) => acc.replace(re, to), html);
  const absolute = [
    ["https://credtent.org/about.html", "https://credtent.com/about"],
    ["https://credtent.org/for-ai-companies.html", "https://credtent.com/ai-companies"],
    ["https://credtent.org/for-content-owners.html", "https://credtent.com/content-owners"],
    ["https://credtent.org/pricing.html", "https://credtent.com/pricing"],
    ["https://credtent.org/faq.html", "https://credtent.com/faq"],
    ["https://credtent.org/certified-publisher.html", "https://credtent.com/certified-publisher"],
    ["https://credtent.org/standards.html", "https://credtent.org/standards"],
    ['href="blog/disneys-ai-gambit-how-a-billion-dollar.html"', 'href="https://credtent.org/parking/blog/disneys-ai-gambit-how-a-billion-dollar"']
  ];
  for (const [from, to] of absolute) out = out.replaceAll(from, to);
  return out;
}

function legacyPage(site, file, pagePath, opts = {}) {
  const extracted = extractLegacy(path.join(REPO, file));
  let body = scrub(rewriteLinks(extracted.body, site.origin));
  if (site.id === "com") body = body.replaceAll("hello@credtent.org", "hello@credtent.com");
  if (site.id === "com" && (pagePath === "/privacy-policy" || pagePath === "/terms-of-service")) {
    body = body.replace(/\b([A-Za-z0-9._%+-]+)@credtent\.org\b/g, "$1@credtent.com");
  }
  if (pagePath === "/privacy-policy") {
    body = body.replace(
      "We use cookies and similar technologies to improve your experience, analyze usage, and support our Services. You can control cookie preferences through your browser settings, though disabling some cookies may affect functionality.",
      "We use cookies and similar technologies to improve your experience, analyze usage, and support our Services. On pages that use Google Analytics, it stays off until you choose Accept. Decline keeps it off. Cookie settings in the footer lets you change that choice later. You can also control cookies in your browser."
    );
  }
  body = body.replace(/<h1\b[\s\S]*?<\/h1>/i, "");
  const title = scrub(extracted.title).replace(/\(PBC\)/g, "").replace(/\s+/g, " ").trim();
  const description = scrub(extracted.description).replace(/\(PBC\)/g, "").slice(0, 220);
  return {
    path: pagePath,
    trailingSlash: pagePath.endsWith("/"),
    title: opts.title || title || "Credtent",
    description: opts.description || description || "Credtent page.",
    eyebrow: opts.eyebrow || "From the current site",
    h1: opts.h1 || opts.title || "Credtent",
    capsule: opts.capsule || description || "Ported page.",
    noindex: Boolean(opts.noindex) || pagePath.startsWith("/parking"),
    crumbs: [{ name: opts.crumb || "Page", href: site.origin + pagePath }],
    faq: opts.faq || [],
    main: `<section class="section"><div class="wrap legacy">${opts.intro || ""}${body}</div></section>`
  };
}

function copyBadges(dir) {
  const dest = path.join(dir, "badges");
  fs.mkdirSync(dest, { recursive: true });
  for (const file of fs.readdirSync(path.join(REPO, "badges"))) {
    if (!file.endsWith(".svg")) continue;
    if (/legacy|ai-composed/i.test(file)) continue;
    const raw = fs.readFileSync(path.join(REPO, "badges", file), "utf8");
    fs.writeFileSync(path.join(dest, file), scrub(raw));
  }
}

function copyBuilder(dir) {
  const engine = scrub(fs.readFileSync(path.join(REPO, "badge-builder.js"), "utf8"), { code: true });
  fs.writeFileSync(path.join(dir, "badge-builder.js"), engine);
  const html = fs.readFileSync(path.join(REPO, "badge-builder.html"), "utf8");
  const inline = html.split("<script>\n(function () {")[1].split("</script>")[0];
  const ui = "(function () {" + inline;
  const fixed = ui.replace(/badges\//g, "/badges/");
  fs.writeFileSync(path.join(dir, "badge-builder-ui.js"), scrub(fixed, { code: true }));
}

function robotsPreview(origin) {
  return `# TODO(launch): replace this file with robots.production.txt when SITE_ENV=production.
# Do not remove Disallow until Eric publishes AND credtent.com returns production 200s.
# Preview builds stay noindex via this file, the meta robots tag, and X-Robots-Tag.
User-agent: *
Disallow: /

Sitemap: ${origin}/sitemap.xml
`;
}

function robotsProduction(site) {
  if (site.id === "com") {
    return `User-agent: *
Allow: /

Sitemap: https://credtent.com/sitemap.xml
`;
  }
  return `User-agent: GPTBot
Allow: /
Disallow: /parking/

User-agent: OAI-SearchBot
Allow: /
Disallow: /parking/

User-agent: ChatGPT-User
Allow: /
Disallow: /parking/

User-agent: ClaudeBot
Allow: /
Disallow: /parking/

User-agent: Claude-SearchBot
Allow: /
Disallow: /parking/

User-agent: PerplexityBot
Allow: /
Disallow: /parking/

User-agent: Google-Extended
Allow: /
Disallow: /parking/

User-agent: *
Allow: /
Disallow: /parking/

Sitemap: https://credtent.org/sitemap.xml
`;
}

function writeSitemapXml(dir, site, pages) {
  const urls = pages.filter((page) => !page.file && !page.noindex).map((page) => {
    const loc = site.origin + (page.path === "/" ? "/" : page.path);
    return `  <url><loc>${loc}</loc><lastmod>2026-10-25</lastmod></url>`;
  }).join("\n");
  fs.writeFileSync(path.join(dir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
}

function writeLlms(dir, site) {
  const body = site.id === "com"
    ? `# Credtent
> Delaware Public Benefit Corporation and a certified B Corp. Corporate site for content owners and AI companies.

${LICENSE_SENTENCE}

## Licensing
- [Home](https://credtent.com/): ${CAPSULE.comHome}
- [AI companies](https://credtent.com/ai-companies): License a defined corpus with a named manifest and a disclosure pack. The statutes still bind the developer.
- [Content owners](https://credtent.com/content-owners): Choose what to license, agree terms, and get paid. Valuation can stand on its own.
- [AI training](https://credtent.com/ai-training): License content from creatives and subject-matter experts, with a named list of works and separate training and display rights.
- [Citation licensing](https://credtent.com/citation-licensing): Set excerpt limits, support visits to the source, and agree compensation for licensed appearances in AI answers.
- [Valuation](https://credtent.com/valuation): Understand your content's value for AI licensing. An estimate supports a conversation. It is not a guaranteed price.
- [Company map](https://credtent.com/guides/ai-training-data-licensing-companies/): A neutral map of public licensing programs, marketplaces, and registries. It is not a list of Credtent customers.

## Company
- [About](https://credtent.com/about): Credtent, Inc. is a Delaware Public Benefit Corporation and a certified B Corp, founded by Eric R. Burgess and Dr. Galen Buckwalter.
- [FAQ](https://credtent.com/faq): Answers for AI companies and content owners on licensing scope, documentation, and valuation limits.
- [Pricing](https://credtent.com/pricing): Opt-Out Premium is US$49 for individuals and US$299+ for organizations. The Collaborithmic Age lists its published book prices.
- [Contact](https://credtent.com/contact): AI companies can use the licensing form. Content owners start an inquiry in the app. Other questions open an email.

Opt-out and Creative Consent: see https://credtent.org/llms.txt
`
    : `# Credtent
> Delaware Public Benefit Corporation and a certified B Corp. Resources for creatives.

${CAPSULE.orgHome}

## For creatives
- [Home](https://credtent.org/): ${CAPSULE.orgHome}
- [Free opt-out](https://credtent.org/opt-out): Register preferences once. Credtent records the reservation and sends notices to AI companies. Free, and not a guarantee.
- [Creative Consent](https://credtent.org/creative-consent): Full Protection means consent comes first. See how Credtent describes Full, Optional, and No Protection.
- [Auditing](https://credtent.org/resources/auditing): Monthly audits record observable model responses. They are not proof of dataset inclusion.
- [Opt-out limitations](https://credtent.org/resources/opt-out-limitations): What Credtent's free opt-out does not do: it cannot force every company to act, and it does not erase datasets.
- [Licensing guide](https://credtent.org/guides/ai-training-data-licensing/): What a training license grants, what it does not grant, and how rights holders keep the choice to opt out.
- [Premium](https://credtent.org/premium): Monthly audits of observable model responses. US$49 annually for individuals and US$299+ for organizations.
- [Standards](https://credtent.org/standards): A working catalog of AI disclosure standards: badges, registries, watermarks, and protocols maintained by Credtent.
- [Blog](https://credtent.org/blog): Writing on AI, creative rights, and copyright, published on Substack and Medium.
- [Contact](https://credtent.org/contact): Contact Credtent about opt-out, Creative Consent, and resources.

Corporate licensing, valuation, and the company map: see https://credtent.com/llms.txt
`;
  fs.writeFileSync(path.join(dir, "llms.txt"), body);
}

function redirectRule(source, destination, statusCode) {
  return { source, destination, statusCode };
}

function crossHostVariants(stem, destination) {
  return [
    redirectRule(stem, destination, 301),
    redirectRule(`${stem}/`, destination, 301),
    redirectRule(`${stem}.html`, destination, 301)
  ];
}

function holdPartners() {
  return ["/partners", "/partners/", "/partners.html"].map((source) => redirectRule(source, "/", 302));
}

function noindexHeader(source) {
  return { source, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] };
}

function hostNoindex(site) {
  const host = site.id === "com" ? "credtent\\.com" : "credtent\\.org";
  return {
    source: "/(.*)",
    missing: [{ type: "host", value: `(www\\.)?${host}` }],
    headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
  };
}

function slashRedirects(site, pages, reserved) {
  const rules = [];
  for (const page of pages) {
    if (page.file || !page.path || page.path === "/") continue;
    const keepSlash = Boolean(page.trailingSlash) || page.path.endsWith("/");
    const bare = page.path.replace(/\/$/, "");
    const source = keepSlash ? bare : `${bare}/`;
    if (reserved.has(source)) continue;
    const destination = site.origin + (keepSlash ? `${bare}/` : bare);
    rules.push(redirectRule(source, destination, 301));
  }
  return rules;
}

function vercel(site, pages) {
  // The host gate is first in both modes: every host except the real one stays noindex.
  // Preview builds also send an unconditional sitewide noindex. Production does not.
  // trailingSlash is left unset. Vercel's trailingSlash:false 308s every slash URL,
  // including /guides/*/, and a redirect back to the slash form loops. Slash duplicates
  // are 301s instead, and guide canonicals keep their slash.
  // The host gate stays first (check-redirects asserts it); the security headers follow and apply sitewide.
  const headers = [hostNoindex(site), securityHeaders()];
  if (!PRODUCTION) headers.push(noindexHeader("/(.*)"));
  if (site.id === "org") {
    for (const source of [
      "/parking/(.*)",
      "/resources/what-an-opt-out-can-do",
      "/resources/what-an-opt-out-can-do/",
      "/resources/how-to-read-platform-terms",
      "/resources/how-to-read-platform-terms/",
      "/resources/use-ai-without-giving-up-judgment",
      "/resources/use-ai-without-giving-up-judgment/",
      "/creative-consent",
      "/creative-consent/",
      "/creative-consent/platforms",
      "/creative-consent/platforms/",
      "/creative-consent/guide",
      "/creative-consent/guide/"
    ]) headers.push(noindexHeader(source));
  }
  // /creative-origin stays a page on this host. Do not send it to the registry until Eric decides.
  // /partners is withheld (302 to home) so the path can return after names are reconfirmed.
  const specific = site.id === "org" ? [
    ...crossHostVariants("/for-ai-companies", "https://credtent.com/ai-companies"),
    ...crossHostVariants("/for-content-owners", "https://credtent.com/content-owners"),
    ...crossHostVariants("/pricing", "https://credtent.com/pricing"),
    ...crossHostVariants("/about", "https://credtent.com/about"),
    ...crossHostVariants("/faq", "https://credtent.com/faq"),
    ...crossHostVariants("/certified-publisher", "https://credtent.com/certified-publisher"),
    redirectRule("/guides/ai-training-data-licensing-companies", "https://credtent.com/guides/ai-training-data-licensing-companies/", 301),
    redirectRule("/guides/ai-training-data-licensing-companies/", "https://credtent.com/guides/ai-training-data-licensing-companies/", 301),
    redirectRule("/guides/ai-training-data-licensing-companies.html", "https://credtent.com/guides/ai-training-data-licensing-companies/", 301),
    redirectRule("/guides/ai-training-data-licensing-companies/index.html", "https://credtent.com/guides/ai-training-data-licensing-companies/", 301),
    redirectRule("/privacy-policy.html", "https://credtent.org/privacy-policy", 301),
    redirectRule("/terms-of-service.html", "https://credtent.org/terms-of-service", 301),
    redirectRule("/opt-out.html", "https://credtent.org/opt-out", 301),
    redirectRule("/blog.html", "https://credtent.org/blog", 301),
    redirectRule("/wga.html", "https://credtent.org/wga", 301),
    redirectRule("/badge-builder.html", "https://credtent.org/badge-builder", 301),
    redirectRule("/lws.html", "https://credtent.org/lws", 301),
    redirectRule("/standards.html", "https://credtent.org/standards", 301),
    redirectRule("/index.html", "https://credtent.org/", 301),
    redirectRule("/guides/index.html", "https://credtent.org/guides/", 301),
    redirectRule("/guides/ai-training-data-licensing/index.html", "https://credtent.org/guides/ai-training-data-licensing/", 301),
    redirectRule("/badges/index.html", "https://credtent.org/badges/", 301),
    redirectRule("/creative-origin/index.html", "https://credtent.org/creative-origin", 301),
    redirectRule("/post/unfair-use-denormalizing-ai-theft.html", "https://credtent.org/post/unfair-use-denormalizing-ai-theft", 301),
    redirectRule("/parking/badges.html", "https://credtent.org/parking/badges", 301),
    redirectRule("/parking/blog.html", "https://credtent.org/parking/blog", 301),
    redirectRule("/parking/blog/disneys-ai-gambit-how-a-billion-dollar.html", "https://credtent.org/parking/blog/disneys-ai-gambit-how-a-billion-dollar", 301),
    redirectRule("/parking/lws.html", "https://credtent.org/parking/lws", 301)
  ] : [];
  const partners = holdPartners();
  const reserved = new Set([...specific, ...partners].map((rule) => rule.source));
  const redirects = [...specific, ...slashRedirects(site, pages, reserved), ...partners];
  fs.writeFileSync(path.join(site.dir, "vercel.json"), JSON.stringify({ headers, redirects }, null, 2) + "\n");
}

function reset(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  const imagesFor = {};
  for (const site of Object.values(SITES)) {
    reset(site.dir);
    copyShared(site.dir);
    imagesFor[site.id] = await buildImages(site.dir);
  }
  copyBadges(SITES.org.dir);
  copyBuilder(SITES.org.dir);

  const com = [
    ...comPages(imagesFor.com),
    legacyPage(SITES.com, "privacy-policy.html", "/privacy-policy", {
      title: `Privacy Policy | ${hostLabel(SITES.com)}`,
      description: "How Credtent collects, uses, and shares personal information when you use credtent.com, and how to contact the company about a privacy request.",
      h1: "Privacy Policy",
      eyebrow: "Legal",
      capsule: "How Credtent collects, uses, and protects information.",
      crumb: "Privacy Policy",
      intro: `<p>Last updated April 9, 2025. On this host, also write to <a href="mailto:hello@credtent.com">hello@credtent.com</a>.</p>${ADDRESS_HTML}`
    }),
    legacyPage(SITES.com, "terms-of-service.html", "/terms-of-service", {
      title: `Terms of Service | ${hostLabel(SITES.com)}`,
      description: "These terms govern use of credtent.com, Credtent's site for content owners and AI companies, including the services described on these pages.",
      h1: "Terms of Service",
      eyebrow: "Legal",
      capsule: "The agreement governing use of Credtent's website, platform, and services.",
      crumb: "Terms of Service"
    }),
    legacyPage(SITES.com, "guides/ai-training-data-licensing-companies/index.html", "/guides/ai-training-data-licensing-companies/", {
      title: "AI training data licensing companies | Credtent",
      h1: "Who licenses AI training data",
      eyebrow: "Guide",
      capsule: "A neutral map of public licensing programs, marketplaces, and registries. It is not a list of Credtent customers.",
      crumb: "Company map",
      faq: [{ q: "Is every company here a Credtent partner?", a: "No. This is a map of the public market, described from each company's own pages." }]
    })
  ];
  const org = [
    ...orgPages(imagesFor.org),
    legacyPage(SITES.org, "standards.html", "/standards", {
      title: "AI disclosure standards | Credtent",
      description: "A working catalog of AI disclosure standards: badges, registries, watermarks, and protocols maintained by Credtent.",
      h1: "A working catalog of AI disclosure standards",
      eyebrow: "Standards",
      capsule: "A catalog of disclosure badges, registries, watermarks, and protocols maintained by Credtent.",
      crumb: "Standards",
      faq: [{ q: "Does this catalog certify the listed projects?", a: "No. It describes public standards. It is not an endorsement, and it is not a Credtent certification." }]
    }),
    legacyPage(SITES.org, "privacy-policy.html", "/privacy-policy", {
      title: `Privacy Policy | ${hostLabel(SITES.org)}`,
      description: "How Credtent collects, uses, and shares personal information on credtent.org for creatives, and how to contact the company about a privacy request.",
      h1: "Privacy Policy",
      eyebrow: "Legal",
      capsule: "How Credtent collects, uses, and protects information.",
      crumb: "Privacy Policy",
      intro: ADDRESS_HTML
    }),
    legacyPage(SITES.org, "terms-of-service.html", "/terms-of-service", {
      title: `Terms of Service | ${hostLabel(SITES.org)}`,
      description: "These terms govern use of credtent.org, including the free opt-out, Creative Consent, and the other resources Credtent publishes for creatives.",
      h1: "Terms of Service",
      eyebrow: "Legal",
      capsule: "The agreement governing use of Credtent's website, platform, and services.",
      crumb: "Terms of Service"
    }),
    legacyPage(SITES.org, "post/unfair-use-denormalizing-ai-theft.html", "/post/unfair-use-denormalizing-ai-theft", {
      title: "Unfair Use | Credtent",
      description: "An archived Credtent essay titled Unfair Use, kept at its previous address. The canonical copy is the version published on Credtent's Substack.",
      h1: "Unfair Use",
      eyebrow: "Archive",
      capsule: "An archived Credtent essay. The canonical copy is also on Substack.",
      crumb: "Unfair Use"
    }),
    legacyPage(SITES.org, "parking/badges.html", "/parking/badges", {
      title: "Parked badge page | Credtent",
      h1: "Parked badge page",
      eyebrow: "Parked",
      capsule: "This URL is retained from the previous site and is excluded from the production crawl.",
      crumb: "Parked badges"
    }),
    legacyPage(SITES.org, "parking/blog.html", "/parking/blog", {
      title: "Parked blog | Credtent",
      h1: "Parked blog",
      eyebrow: "Parked",
      capsule: "Older blog index retained so the previous URL still resolves.",
      crumb: "Parked blog"
    }),
    legacyPage(SITES.org, "parking/blog/disneys-ai-gambit-how-a-billion-dollar.html", "/parking/blog/disneys-ai-gambit-how-a-billion-dollar", {
      title: "Archived essay | Credtent",
      h1: "Archived essay",
      eyebrow: "Parked",
      capsule: "Archived essay retained at its previous URL.",
      crumb: "Archived essay"
    }),
    legacyPage(SITES.org, "parking/lws.html", "/parking/lws", {
      title: "Parked member page | Credtent",
      h1: "Parked member page",
      eyebrow: "Parked",
      capsule: "Older member page retained at its previous URL.",
      crumb: "Parked member page"
    })
    // The parked services page was removed from the live site in #24 (2026-10-31) and is not rebuilt here.
  ];

  const bundles = { com, org };
  for (const site of Object.values(SITES)) {
    const pages = bundles[site.id];
    const withMeta = [
      ...pages,
      sitemapPage(site, pages),
      creditsPage(site, imagesFor[site.id], site.id === "com"
        ? ["bridge", "editor", "aiTeam", "podcast", "citation", "training", "galen", "eric", "carmen", "freddy", "michael", "raymond", "jim", "colin"]
        : ["creative", "writer", "filmmaker", "resourceOptout", "resourceTerms", "resourceJudgment", "eric", "galen"])
    ];
    for (const page of withMeta) writePage(site.dir, site, page);
    writePage(site.dir, site, notFound(site));
    const productionRobots = robotsProduction(site);
    fs.writeFileSync(path.join(site.dir, "robots.production.txt"), productionRobots);
    fs.writeFileSync(path.join(site.dir, "robots.txt"), PRODUCTION ? productionRobots : robotsPreview(site.origin));
    writeSitemapXml(site.dir, site, withMeta);
    writeLlms(site.dir, site);
    vercel(site, withMeta);
    fs.writeFileSync(path.join(site.dir, "credits.json"), JSON.stringify({
      generatedFrom: "build manifest",
      note: "Filmmaker credit uses an ID-only photo URL.",
      photos: (site.id === "com"
        ? ["bridge", "editor", "aiTeam", "podcast", "citation", "training", "galen", "eric", "carmen", "freddy", "michael", "raymond", "jim", "colin"]
        : ["creative", "writer", "filmmaker", "resourceOptout", "resourceTerms", "resourceJudgment", "eric", "galen"]
      ).map((key) => {
        const img = imagesFor[site.id][key];
        return { alt: img.alt, credit: img.credit, creditHref: img.creditHref || null, license: img.license, licenseHref: img.licenseHref || null };
      })
    }, null, 2));
  }
  console.log(PRODUCTION ? "Built with production robots." : "Built preview (noindex).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
