import { ADDRESS_HTML, ADDRESS_LINE } from "./copy.mjs";

export function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const ORG_ID = "https://credtent.com/#organization";

export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Credtent",
    legalName: "Credtent, Inc.",
    url: ["https://credtent.com/", "https://credtent.org/"],
    logo: "https://credtent.com/brand/shield.svg",
    email: "hello@credtent.com",
    foundingDate: "2023",
    description: "Credtent, Inc. is a Delaware Public Benefit Corporation and a neutral marketplace connecting content owners and AI companies through consent, licensing, and compensation.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1822 E. Route 66, Suite A353",
      addressLocality: "Glendora",
      addressRegion: "California",
      postalCode: "91740",
      addressCountry: "US"
    },
    founder: { "@id": "https://credtent.com/about#eric-r-burgess" },
    sameAs: [
      "https://www.linkedin.com/company/credtent",
      "https://www.cbinsights.com/company/credtent"
    ]
  };
}

function websiteNode(site) {
  return {
    "@type": "WebSite",
    "@id": site.origin + "/#website",
    url: site.origin + "/",
    name: "Credtent",
    description: site.id === "com"
      ? "Credtent for content owners and AI companies."
      : "Credtent for creatives: opt-out, Creative Consent, and resources.",
    publisher: { "@id": ORG_ID }
  };
}

function faqNode(pageUrl, faq) {
  return {
    "@type": "FAQPage",
    "@id": pageUrl + "#faq",
    url: pageUrl,
    isPartOf: { "@id": pageUrl.split("/").slice(0, 3).join("/") + "/#website" },
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a }
    }))
  };
}

function crumbNode(site, crumbs, pageUrl) {
  const items = [{ name: "Home", href: site.origin + "/" }, ...crumbs];
  return {
    "@type": "BreadcrumbList",
    "@id": pageUrl + "#breadcrumb",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href || pageUrl
    }))
  };
}

export function picture(img, { sizes = "100vw", priority = false, className = "" } = {}) {
  const avif = img.widths.map((w) => `${img.base}-${w}.avif ${w}w`).join(", ");
  const webp = img.widths.map((w) => `${img.base}-${w}.webp ${w}w`).join(", ");
  const displayWidth = img.widths[img.widths.length - 1];
  const displayHeight = Math.round(img.height * (displayWidth / img.width));
  const src = `${img.base}-${displayWidth}.webp`;
  const fp = priority ? ' fetchpriority="high"' : "";
  const loading = priority ? "eager" : "lazy";
  const cls = className ? ` class="${className}"` : "";
  return `<picture>
    <source type="image/avif" srcset="${avif}" sizes="${sizes}">
    <source type="image/webp" srcset="${webp}" sizes="${sizes}">
    <img src="${src}" width="${displayWidth}" height="${displayHeight}" alt="${esc(img.alt)}"${fp} loading="${loading}" decoding="async"${cls}>
  </picture>`;
}

export function creditLine(img) {
  if (!img.credit) return "";
  const who = img.creditHref
    ? `<a href="${esc(img.creditHref)}">${esc(img.credit)}</a>`
    : esc(img.credit);
  const lic = img.licenseHref
    ? `<a href="${esc(img.licenseHref)}">${esc(img.license)}</a>`
    : esc(img.license || "");
  return `<figcaption>Photo: ${who}${lic ? ` / ${lic}` : ""}</figcaption>`;
}

export function figure(img, opts = {}) {
  const caption = opts.caption ? opts.caption : creditLine(img);
  return `<figure class="${opts.className || "shot"}">${picture(img, opts)}${caption}</figure>`;
}

function nav(site, path) {
  const links = site.nav.map((item) => {
    const current = item.href === path ? ' aria-current="page"' : "";
    const external = item.href.startsWith("http") ? ' rel="noopener"' : "";
    return `<a href="${esc(item.href)}"${current}${external}>${esc(item.label)}</a>`;
  }).join("");
  const ctaExternal = site.cta.href.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
  return `<header class="site-header">
    <div class="header-inner">
      <a class="brand" href="/" aria-label="Credtent home">
        <img class="shield" src="/brand/shield.svg" width="32" height="36" alt="">
        <img class="word" src="/brand/wordmark.svg" width="148" height="27" alt="Credtent">
      </a>
      <div class="header-tools">
        <a class="btn btn-nav" href="${esc(site.cta.href)}"${ctaExternal}>${esc(site.cta.label)}</a>
        <details class="nav-details">
          <summary class="nav-summary">Menu</summary>
          <nav class="site-nav" aria-label="Primary">${links}</nav>
        </details>
      </div>
    </div>
  </header>`;
}

function footer(site) {
  const contact = site.id === "com" ? "https://credtent.com/contact" : "https://credtent.org/contact";
  const sitemap = site.id === "com" ? "https://credtent.com/sitemap" : "https://credtent.org/sitemap";
  const privacy = site.id === "com" ? "https://credtent.com/privacy-policy" : "https://credtent.org/privacy-policy";
  const terms = site.id === "com" ? "https://credtent.com/terms-of-service" : "https://credtent.org/terms-of-service";
  const credits = site.id === "com" ? "https://credtent.com/credits" : "https://credtent.org/credits";
  return `<footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <img class="word" src="/brand/wordmark-white.svg" width="160" height="30" alt="Credtent">
        <p>Credtent helps creatives and AI companies navigate consent, credit, and compensation.</p>
        <p>Credtent, Inc. is a Delaware Public Benefit Corporation.</p>
        <p><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
      </div>
      <div>
        <h2>For creatives</h2>
        <ul>
          <li><a href="https://credtent.org/opt-out">Free opt-out</a></li>
          <li><a href="https://credtent.org/resources/auditing">Auditing</a></li>
          <li><a href="https://credtent.org/creative-consent">Creative Consent</a></li>
          <li><a href="https://credtent.org/resources">Resources</a></li>
        </ul>
      </div>
      <div>
        <h2>For companies</h2>
        <ul>
          <li><a href="https://credtent.com/valuation">Valuation</a></li>
          <li><a href="https://credtent.com/ai-training">AI training</a></li>
          <li><a href="https://credtent.com/citation-licensing">Citations</a></li>
          <li><a href="https://credtent.com/services">Services</a></li>
        </ul>
      </div>
      <div>
        <h2>Company</h2>
        <ul>
          <li><a href="https://credtent.com/about">About</a></li>
          <li><a href="${contact}">Contact</a></li>
          <li><a href="${sitemap}">Sitemap</a></li>
          <li><a href="${privacy}">Privacy</a></li>
          <li><a href="${terms}">Terms</a></li>
          <li><a href="${credits}">Photo credits</a></li>
        </ul>
      </div>
    </div>
    <div class="wrap footer-base">
      <span>${ADDRESS_LINE}</span>
      <span>© ${new Date().getFullYear()} Credtent, Inc.</span>
    </div>
  </footer>`;
}

function faqHtml(faq) {
  if (!faq?.length) return "";
  const items = faq.map((item) => `<details open>
    <summary>${esc(item.q)}</summary>
    <p>${esc(item.a)}</p>
  </details>`).join("");
  return `<section class="section section-tight" id="faq">
    <div class="wrap">
      <h2>Questions</h2>
      <div class="faq-list">${items}</div>
    </div>
  </section>`;
}

export function renderPage(site, page) {
  const path = page.path.endsWith("/") && page.path !== "/" ? page.path.replace(/\/$/, "") : page.path;
  const canonicalPath = page.path === "/" ? "/" : path + (page.trailingSlash ? "/" : "");
  const pageUrl = site.origin + (canonicalPath === "/" ? "/" : canonicalPath);
  const crumbs = (page.crumbs || []).map((item, index, all) => {
    const last = index === all.length - 1;
    return last
      ? `<span>${esc(item.name)}</span>`
      : `<a href="${esc(item.href)}">${esc(item.name)}</a> / `;
  }).join("");
  const crumbBlock = crumbs ? `<p class="crumbs">${crumbs}</p>` : "";
  const eyebrow = page.eyebrow ? `<p class="eyebrow">${esc(page.eyebrow)}</p>` : "";
  const h1 = `<h1>${page.h1}</h1>`;
  const capsule = page.capsule ? `<p class="capsule">${esc(page.capsule)}</p>` : "";
  const lede = page.lede ? `<p class="lede">${page.lede}</p>` : "";
  const actions = page.actions || "";
  const intro = `${crumbBlock}${eyebrow}${h1}${capsule}${lede}${actions}`;
  const top = page.media
    ? `<div class="wrap"><div class="hero"><div>${intro}</div>${page.media}</div></div>`
    : `<div class="wrap section-tight">${intro}</div>`;

  const graph = [];
  graph.push(organizationNode());
  graph.push(websiteNode(site));
  const pageNode = {
    "@type": page.pageType || "WebPage",
    "@id": pageUrl + "#page",
    url: pageUrl,
    name: page.title,
    description: page.description,
    isPartOf: { "@id": site.origin + "/#website" },
    about: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    inLanguage: "en"
  };
  if (page.mainEntity) pageNode.mainEntity = page.mainEntity;
  graph.push(pageNode);
  if (page.faq?.length) graph.push(faqNode(pageUrl, page.faq));
  if (page.path !== "/") graph.push(crumbNode(site, page.crumbs || [{ name: page.crumbName || page.title, href: pageUrl }], pageUrl));
  if (page.extraLd) graph.push(...page.extraLd);

  if (!page.capsule) throw new Error(`Missing answer-first summary: ${site.id} ${page.path}`);
  if (!page.faq?.length) throw new Error(`Missing FAQ: ${site.id} ${page.path}`);
  const preload = page.preload || "";
  const production = process.env.SITE_ENV === "production";
  const noindex = page.noindex || !production;
  const robots = noindex
    ? `${production ? "" : "<!-- TODO(launch): this noindex meta is for preview builds. SITE_ENV=production omits it on pages that are allowed to be indexed. -->\n  "}<meta name="robots" content="noindex, nofollow">`
    : "";
  const canonical = page.file === "404.html" ? "" : `<link rel="canonical" href="${esc(pageUrl)}">`;
  const previewBar = production
    ? ""
    : `<p class="preview-bar"><strong>Preview.</strong> This build is noindex until Eric publishes.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${robots}
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">
  ${canonical}
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:url" content="${esc(pageUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Credtent">
  <meta name="twitter:card" content="summary">
  <link rel="preload" href="/fonts/inter-latin-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/source-serif-4-latin-700.woff2" as="font" type="font/woff2" crossorigin>
  ${preload}
  <link rel="stylesheet" href="/css/tokens.css">
  <link rel="stylesheet" href="/css/site.css">
  <link rel="icon" href="/favicon/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
  <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png">
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>
</head>
<body>
  <a class="skip-link" href="#content">Skip to content</a>
  ${previewBar}
  ${nav(site, path)}
  <main id="content">
    ${top}
    ${page.main || ""}
    ${faqHtml(page.faq)}
  </main>
  ${footer(site)}
</body>
</html>
`;
}

export function diagramHtml() {
  return `<div class="diagram">
    <ol class="diagram-inputs">
      <li><h3>Intended AI use</h3><p>Training, answers, or both</p></li>
      <li><h3>Evidence of success</h3><p>Audience reception and awards</p></li>
      <li><h3>Cultural significance</h3><p>Context and distinctive contribution</p></li>
      <li><h3>Quality and expertise</h3><p>The work and its specialist value</p></li>
      <li><h3>Rights and scope</h3><p>Permissions, limits, and exclusivity</p></li>
    </ol>
    <svg class="diagram-lines" viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true">
      <line x1="10" y1="0" x2="50" y2="36"></line>
      <line x1="30" y1="0" x2="50" y2="36"></line>
      <line x1="50" y1="0" x2="50" y2="36"></line>
      <line x1="70" y1="0" x2="50" y2="36"></line>
      <line x1="90" y1="0" x2="50" y2="36"></line>
    </svg>
    <div class="diagram-hub">
      <h3>A neutral assessment</h3>
      <p>An informed starting point for what to charge.</p>
    </div>
    <p class="fine">Illustrative inputs, not a formula. Evidence, assumptions, and intended use inform the assessment; the parties agree the final price.</p>
  </div>`;
}

export { ADDRESS_HTML, ORG_ID };
