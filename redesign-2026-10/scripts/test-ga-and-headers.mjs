// node --test scripts/test-ga-and-headers.mjs
// GA4 must load only on the real production hostnames, and only after Accept.
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { consentUi } from "../src/lib/render.mjs";
import { securityHeaders } from "../src/lib/security-headers.mjs";

const ORG = { id: "org", measurementId: "G-3BJJV0MSLW" };
const COM = { id: "com", measurementId: "G-3BJJV0MSLW" };

function withEnv(env, fn) {
  const saved = { SITE_ENV: process.env.SITE_ENV, GA_CONSENT_PREVIEW: process.env.GA_CONSENT_PREVIEW };
  delete process.env.SITE_ENV;
  delete process.env.GA_CONSENT_PREVIEW;
  Object.assign(process.env, env);
  try { return fn(); } finally {
    for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  }
}

// Runs the inline head script in a fake browser, clicks Accept, and reports whether gtag.js was injected.
function acceptOn(hostname, head, stored = "") {
  const code = head.replace(/^\s*<script>/, "").replace(/<\/script>\s*$/, "");
  const appended = [];
  const handlers = {};
  const el = (id) => ({ id, hidden: true, focus() {}, addEventListener(type, fn) { handlers[id] = fn; } });
  const nodes = { "cookie-banner": el("cookie-banner"), "cookie-accept": el("cookie-accept"), "cookie-decline": el("cookie-decline"), "cookie-settings": el("cookie-settings") };
  let ready;
  const store = new Map(stored ? [["credtent_cookie_consent", stored]] : []);
  const sandbox = {
    location: { hostname },
    localStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
    document: {
      getElementById: (id) => nodes[id] || null,
      querySelector: () => null,
      createElement: () => ({ setAttribute() {} }),
      head: { appendChild: (s) => appended.push(s) },
      addEventListener: (type, fn) => { if (type === "DOMContentLoaded") ready = fn; }
    }
  };
  sandbox.window = sandbox;
  vm.runInNewContext(code, sandbox);
  ready();
  if (!stored && handlers["cookie-accept"]) handlers["cookie-accept"]();
  return { loaded: appended.some((s) => String(s.src || "").includes("googletagmanager.com/gtag/js")), bannerShown: nodes["cookie-banner"].hidden === false || !stored, dataLayer: sandbox.dataLayer || [] };
}

test("preview build without the QA flag ships no GA code or banner", () => {
  withEnv({}, () => {
    const ui = consentUi(ORG);
    assert.equal(ui.head, "");
    assert.equal(ui.banner, "");
  });
});

test("GA_CONSENT_PREVIEW=1 renders the banner on a preview build", () => {
  withEnv({ GA_CONSENT_PREVIEW: "1" }, () => {
    const ui = consentUi(ORG);
    assert.match(ui.banner, /cookie-banner/);
    assert.match(ui.head, /G-3BJJV0MSLW/);
  });
});

test("Accept on a vercel.app preview host never loads gtag.js", () => {
  withEnv({ SITE_ENV: "production" }, () => {
    const r = acceptOn("credtent-site-abc123-erburgess-projects.vercel.app", consentUi(ORG).head);
    assert.equal(r.loaded, false);
  });
});

test("stored accepted consent on a preview host never loads gtag.js", () => {
  withEnv({ SITE_ENV: "production" }, () => {
    const r = acceptOn("localhost", consentUi(COM).head, "accepted");
    assert.equal(r.loaded, false);
  });
});

test("Accept on credtent.org and www.credtent.org loads gtag.js", () => {
  withEnv({ SITE_ENV: "production" }, () => {
    assert.equal(acceptOn("credtent.org", consentUi(ORG).head).loaded, true);
    assert.equal(acceptOn("www.credtent.org", consentUi(ORG).head).loaded, true);
  });
});

test("the .org build does not load on credtent.com, and the .com build does not load on credtent.org", () => {
  withEnv({ SITE_ENV: "production" }, () => {
    assert.equal(acceptOn("credtent.com", consentUi(ORG).head).loaded, false);
    assert.equal(acceptOn("credtent.org", consentUi(COM).head).loaded, false);
    assert.equal(acceptOn("credtent.com", consentUi(COM).head).loaded, true);
  });
});

test("Decline never loads gtag.js, even on the production host", () => {
  withEnv({ SITE_ENV: "production" }, () => {
    const r = acceptOn("credtent.org", consentUi(ORG).head, "declined");
    assert.equal(r.loaded, false);
  });
});

test("security headers cover the baseline set and do not ship an enforcing CSP", () => {
  const h = securityHeaders();
  assert.equal(h.source, "/(.*)");
  const map = Object.fromEntries(h.headers.map((x) => [x.key, x.value]));
  assert.equal(map["X-Content-Type-Options"], "nosniff");
  assert.equal(map["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.equal(map["X-Frame-Options"], "SAMEORIGIN");
  assert.match(map["Permissions-Policy"], /camera=\(\)/);
  assert.match(map["Permissions-Policy"], /microphone=\(\)/);
  assert.match(map["Permissions-Policy"], /geolocation=\(\)/);
  assert.equal(map["Content-Security-Policy"], undefined);
  assert.match(map["Content-Security-Policy-Report-Only"], /frame-ancestors 'self'/);
  assert.match(map["Content-Security-Policy-Report-Only"], /https:\/\/tally\.so/);
  assert.match(map["Content-Security-Policy-Report-Only"], /https:\/\/www\.googletagmanager\.com/);
});
