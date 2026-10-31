import { ADDRESS_HTML, ADDRESS_LINE } from "./copy.mjs";

export function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const ORG_ID = "https://credtent.com/#organization";

export function bcorpBadge() {
  return `<p class="bcorp-badge" role="img" aria-label="Credtent is a Certified B Corporation."><span>Certified</span><strong>B Corp</strong></p>`;
}

export function organizationNode(site) {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Credtent",
    legalName: "Credtent, Inc.",
    url: "https://credtent.com/",
    logo: "https://credtent.com/brand/shield.svg",
    email: site.email,
    foundingDate: "2023",
    description: "Credtent, Inc. is a Delaware Public Benefit Corporation and a certified B Corp, a neutral marketplace connecting content owners and AI companies through consent, licensing, and compensation.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1822 E. Route 66, Suite A353",
      addressLocality: "Glendora",
      addressRegion: "California",
      postalCode: "91740",
      addressCountry: "US"
    },
    founder: [
      { "@id": "https://credtent.com/about#eric-r-burgess" },
      { "@id": "https://credtent.com/about#galen-buckwalter" }
    ],
    sameAs: [
      "https://credtent.org/",
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
  return `<figcaption class="credit">Photo: ${who}${lic ? ` / ${lic}` : ""}</figcaption>`;
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
  const short = site.cta.shortLabel
    ? `<span class="btn-nav-short">${esc(site.cta.shortLabel)}</span>`
    : "";
  const shortClass = site.cta.shortLabel ? " has-short" : "";
  const login = site.login
    ? `<a class="nav-login" href="${esc(site.login.href)}">${esc(site.login.label)}</a>`
    : "";
  const mobileLogin = site.login
    ? `<a class="nav-login-mobile" href="${esc(site.login.href)}">${esc(site.login.label)}</a>`
    : "";
  return `<header class="site-header">
    <div class="header-inner">
      <a class="brand" href="/" aria-label="Credtent home">
        <img class="shield" src="/brand/shield.svg" width="32" height="36" alt="">
        <img class="word" src="/brand/wordmark.svg" width="148" height="27" alt="Credtent">
      </a>
      <nav class="site-nav site-nav-desktop" aria-label="Primary">${links}</nav>
      <div class="header-tools">
        ${login}
        <a class="btn btn-nav${shortClass}" href="${esc(site.cta.href)}"${ctaExternal}><span class="btn-nav-full">${esc(site.cta.label)}</span>${short}</a>
        <details class="nav-details">
          <summary class="nav-summary">Menu</summary>
          <nav class="site-nav site-nav-mobile" aria-label="Primary">${links}${mobileLogin}</nav>
        </details>
      </div>
    </div>
  </header>`;
}

function footer(site, cookieSettings, disclosures = "") {
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
        <p>Certified B Corp</p>
        ${bcorpBadge()}
        <p><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
      </div>
      <div>
        <p class="footer-title">For creatives</p>
        <ul>
          <li><a href="https://credtent.org/opt-out">Free opt-out</a></li>
          <li><a href="https://credtent.org/resources/auditing">Auditing</a></li>
          <li><a href="https://credtent.org/creative-consent">Creative Consent</a></li>
          <li><a href="https://credtent.org/resources">Resources</a></li>
        </ul>
      </div>
      <div>
        <p class="footer-title">For companies</p>
        <ul>
          <li><a href="https://credtent.com/valuation">Valuation</a></li>
          <li><a href="https://credtent.com/ai-training">AI training</a></li>
          <li><a href="https://credtent.com/citation-licensing">Citations</a></li>
          <li><a href="https://credtent.com/services">Services</a></li>
        </ul>
      </div>
      <div>
        <p class="footer-title">Company</p>
        <ul>
          <li><a href="https://credtent.com/about">About</a></li>
          <li><a href="https://tally.so/r/2ExeBp" target="_blank" rel="noopener">Investors</a></li>
          <li><a href="${contact}">Contact</a></li>
          <li><a href="${sitemap}">Sitemap</a></li>
          <li><a href="${privacy}">Privacy</a></li>
          ${cookieSettings}
          <li><a href="${terms}">Terms</a></li>
          <li><a href="${credits}">Photo credits</a></li>
        </ul>
      </div>
    </div>
    ${disclosures}
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
      <h2>Frequently Asked Questions</h2>
      <div class="faq-list">${items}</div>
    </div>
  </section>`;
}

function consentUi(site) {
  const id = site.measurementId || "";
  const enabled = process.env.SITE_ENV === "production" && /^G-[A-Z0-9]+$/.test(id);
  if (!enabled) return { head: "", banner: "", footerItem: "" };
  const privacy = site.id === "com" ? "https://credtent.com/privacy-policy" : "https://credtent.org/privacy-policy";
  const options = {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  };
  const head = `<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });
    (function () {
      var gaId = ${JSON.stringify(id)};
      var storageKey = 'credtent_cookie_consent';
      var gaOptions = ${JSON.stringify(options)};
      var denied = {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      };
      function loadGtag() {
        gtag('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
        if (document.querySelector('script[data-ga="1"]')) return;
        gtag('js', new Date());
        gtag('config', gaId, gaOptions);
        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
        script.setAttribute('data-ga', '1');
        document.head.appendChild(script);
      }
      function setChoice(value) {
        try { localStorage.setItem(storageKey, value); } catch (error) {}
        if (value === 'accepted') loadGtag();
        else gtag('consent', 'update', denied);
        var banner = document.getElementById('cookie-banner');
        if (banner) banner.hidden = true;
        var settings = document.getElementById('cookie-settings');
        if (settings) settings.focus();
      }
      function showBanner() {
        var banner = document.getElementById('cookie-banner');
        if (!banner) return;
        banner.hidden = false;
        var accept = document.getElementById('cookie-accept');
        if (accept) accept.focus();
      }
      document.addEventListener('DOMContentLoaded', function () {
        var stored = '';
        try { stored = localStorage.getItem(storageKey) || ''; } catch (error) {}
        var accept = document.getElementById('cookie-accept');
        var decline = document.getElementById('cookie-decline');
        var settings = document.getElementById('cookie-settings');
        if (accept) accept.addEventListener('click', function () { setChoice('accepted'); });
        if (decline) decline.addEventListener('click', function () { setChoice('declined'); });
        if (settings) settings.addEventListener('click', function (event) {
          event.preventDefault();
          showBanner();
        });
        if (stored === 'accepted') loadGtag();
        else if (stored !== 'declined') showBanner();
      });
    })();
  </script>`;
  const banner = `<div id="cookie-banner" class="cookie-banner" role="dialog" aria-modal="false" aria-labelledby="cookie-banner-title" aria-describedby="cookie-banner-text" hidden>
    <div class="cookie-banner-inner">
      <div>
        <p id="cookie-banner-title"><strong>Cookies</strong></p>
        <p id="cookie-banner-text">We use Google Analytics to understand how this site is used. Analytics stays off unless you accept. <a href="${privacy}">Privacy Policy</a></p>
      </div>
      <div class="cookie-banner-actions">
        <button type="button" class="btn" id="cookie-accept">Accept</button>
        <button type="button" class="btn btn-ghost" id="cookie-decline">Decline</button>
      </div>
    </div>
  </div>`;
  return {
    head,
    banner,
    footerItem: `<li><a href="#cookie-banner" id="cookie-settings">Cookie settings</a></li>`
  };
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
  const capsule = page.capsule && !page.capsuleOutsideHero ? `<p class="capsule">${esc(page.capsule)}</p>` : "";
  const lede = page.lede ? `<p class="lede">${page.lede}</p>` : "";
  const actions = page.actions || "";
  const intro = `${crumbBlock}${eyebrow}${h1}${capsule}${lede}${actions}`;
  const top = page.media && page.heroBand
    ? `<div class="hero-band"><div class="hero hero-home"><div class="hero-copy">${intro}</div>${page.media}</div></div>`
    : page.media
    ? `<div class="wrap"><div class="hero"><div>${intro}</div>${page.media}</div></div>`
    : `<div class="wrap section-tight">${intro}</div>`;

  const graph = [];
  graph.push(organizationNode(site));
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
  const preload = page.preload || "";
  const production = process.env.SITE_ENV === "production";
  const noindex = page.noindex || !production;
  const robots = noindex
    ? `<meta name="robots" content="noindex, nofollow">`
    : "";
  const canonical = page.file === "404.html" ? "" : `<link rel="canonical" href="${esc(pageUrl)}">`;
  const previewBar = production
    ? ""
    : `<p class="preview-bar"><strong>Preview.</strong> This build is noindex until Eric publishes.</p>`;
  const consent = consentUi(site);

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
  ${consent.head}
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
  ${footer(site, consent.footerItem, page.disclosures?.length ? `<div class="wrap footer-disclosures" aria-label="Disclosures">${page.disclosures.map((d) => `<p>${d}</p>`).join("")}</div>` : "")}
  ${consent.banner}
</body>
</html>
`;
}

export function diagramHtml() {
  return `<div class="diagram">
    <ol class="diagram-inputs">
      <li><svg class="diagram-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg><h3>Intended AI use</h3><p>Training, answers, or both</p></li>
      <li><svg class="diagram-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H5a2 2 0 0 0 0 4h3M16 6h3a2 2 0 0 1 0 4h-3"/><path d="M12 13v4M8 21h8M9 17h6"/></svg><h3>Evidence of success</h3><p>Audience reception and awards</p></li>
      <li><svg class="diagram-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18M4 10h16M12 3l9 5H3l9-5z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/></svg><h3>Cultural significance</h3><p>Context and distinctive contribution</p></li>
      <li><svg class="diagram-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9L12 3z"/></svg><h3>Quality and expertise</h3><p>The work and its specialist value</p></li>
      <li><svg class="diagram-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg><h3>Rights and scope</h3><p>Permissions, limits, and exclusivity</p></li>
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
  </div>`;
}

const SALES_EMAIL = "sales@credtent.com";

// Eric: put a real Tally id in one of these strings to replace that page's mailto form.
// Leave "" and the mailto:sales@credtent.com form stays. An empty value never renders an embed.
// orgContact: Credtent.org Contact, on sites/org/contact.
// consentClarification: Creative Consent platform clarification, on sites/org/creative-consent.
// consentUpdates: Creative Consent updates, on sites/org/creative-consent.
export const TALLY_FORM_IDS = {
  orgContact: "",
  consentClarification: "",
  consentUpdates: ""
};

// Ids this generator may embed. 2ExeBp is the investor form link, not an embed.
// VL10Ga is a real Content Partner Inquiry, and content-partner CTAs go to the app instead.
const KNOWN_TALLY_IDS = new Set(
  ["BzbXK7", "2ExeBp", ...Object.values(TALLY_FORM_IDS)].filter((id) => /^[A-Za-z0-9]+$/.test(id))
);

// Embed document height at a 640px column, measured 2026-10-26 with hideTitle=1.
// BzbXK7 body scrollHeight was 747. A new id uses that reservation until its own height is added here.
const TALLY_MIN_HEIGHT = {
  BzbXK7: 747
};
const TALLY_DEFAULT_MIN_HEIGHT = 747;

function reservedTallyHeight(id, minHeight) {
  const height = minHeight || TALLY_MIN_HEIGHT[id] || TALLY_DEFAULT_MIN_HEIGHT;
  if (!Number.isInteger(height) || height < 320) {
    throw new Error(`Tally id ${id} needs an integer reserved height.`);
  }
  return height;
}

const TALLY_LOADER = `<script>var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}</script>`;

export function tallyEmbed({ id, title, minHeight }) {
  if (!KNOWN_TALLY_IDS.has(id)) {
    throw new Error(`Refusing Tally id ${id}. Add a real id to TALLY_FORM_IDS or leave that slot empty.`);
  }
  const height = reservedTallyHeight(id, minHeight);
  const embed = `https://tally.so/embed/${id}?hideTitle=1&transparentBackground=1&dynamicHeight=1`;
  const fallback = `https://tally.so/r/${id}`;
  return `<div class="tally-embed">
          <iframe data-tally-src="${embed}" loading="lazy" width="640" height="${height}" style="min-height:${height}px" title="${esc(title)}"></iframe>
          ${TALLY_LOADER}
          <noscript><p class="small"><a href="${fallback}">${fallback}</a></p></noscript>
          <p class="small">Prefer email? <a href="mailto:${SALES_EMAIL}">${SALES_EMAIL}</a></p>
        </div>`;
}

export function formSlot({ id, title, minHeight, ...inquiry }) {
  if (!id) return inquiryForm(inquiry);
  return tallyEmbed({ id, title, minHeight });
}

export function inquiryForm({ subject, fields, submitLabel, note, style, todo }) {
  const mailto = `mailto:${SALES_EMAIL}`;
  const styleAttr = style ? ` style="${style}"` : "";
  const noteHtml = note ? `\n          <p class="small">${note}</p>` : "";
  const todoHtml = todo ? `<!-- TODO(Eric): ${todo} -->\n        ` : "";
  return `${todoHtml}<form class="form" action="${mailto}" method="post" enctype="text/plain" data-subject="${esc(subject)}"${styleAttr}>
          ${fields}
          <button class="btn" type="submit">${submitLabel}</button>${noteHtml}
          <noscript><p class="small"><a href="${mailto}">Email ${SALES_EMAIL}</a></p></noscript>
          <script>
          (function () {
            var form = document.currentScript.parentElement;
            form.addEventListener("submit", function (event) {
              event.preventDefault();
              var lines = [];
              var labels = form.querySelectorAll("label");
              for (var i = 0; i < labels.length; i++) {
                var field = labels[i].querySelector("input, textarea, select");
                if (!field || !field.name) continue;
                var copy = labels[i].cloneNode(true);
                var controls = copy.querySelectorAll("input, textarea, select");
                for (var j = 0; j < controls.length; j++) controls[j].remove();
                var name = copy.textContent.replace(/\\s+/g, " ").trim().replace(/[.]\\s*$/, "");
                var value = field.type === "checkbox" ? (field.checked ? "Yes" : "No") : field.value;
                lines.push(name + ": " + value);
              }
              var mailSubject = form.getAttribute("data-subject") || "Credtent inquiry";
              var topic = form.querySelector("[name=topic]");
              if (topic && topic.value) mailSubject += ": " + topic.value;
              window.location.href = "${mailto}?subject=" + encodeURIComponent(mailSubject) + "&body=" + encodeURIComponent(lines.join("\\n"));
            });
          })();
          </script>
        </form>`;
}

export { ADDRESS_HTML, ORG_ID };
