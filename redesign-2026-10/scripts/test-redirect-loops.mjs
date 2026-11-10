// Trailing-slash and chain checks over the built vercel.json files (Niven 2026-11-10, launch-blocking item 4).
// This simulates Vercel's redirect matching from the config; it does not prove runtime behavior, which still needs
// the header test on a preview deployment. Run: node --test scripts/test-redirect-loops.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const SITE_DIRS = { "credtent.com": path.join(root, "sites/com"), "credtent.org": path.join(root, "sites/org") };

// First matching rule for a request, as Vercel applies redirects in order. Only literal sources and the
// host-scoped www rule exist (check-redirects refuses any other pattern).
export function matchRedirect(configs, host, pathname) {
  const apex = host.replace(/^www\./, "");
  for (const rule of configs[apex]?.redirects || []) {
    if (rule.has) {
      if (rule.source === "/(.*)" && rule.has.every((h) => h.type === "host" && h.value === host)) {
        return rule.destination.replace("$1", pathname.replace(/^\//, ""));
      }
      continue;
    }
    if (host === apex && rule.source === pathname) return rule.destination.startsWith("http") ? rule.destination : `https://${apex}${rule.destination}`;
  }
  return null;
}

// Every problem with following redirects from a start URL: a loop, or more than one hop before a non-redirect.
export function redirectProblems(configs, startUrl, maxHops = 1) {
  const seen = new Set();
  let url = new URL(startUrl);
  for (let hop = 0; ; hop++) {
    const key = url.host + url.pathname;
    if (seen.has(key)) return [`loop at ${key}`];
    seen.add(key);
    const next = matchRedirect(configs, url.host, url.pathname);
    if (!next) return [];
    if (hop + 1 > maxHops) return [`${startUrl} takes more than ${maxHops} hop(s)`];
    url = new URL(next);
  }
}

function load() {
  const configs = {};
  const locs = {};
  for (const [host, dir] of Object.entries(SITE_DIRS)) {
    configs[host] = JSON.parse(fs.readFileSync(path.join(dir, "vercel.json"), "utf8"));
    locs[host] = [...fs.readFileSync(path.join(dir, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  }
  return { configs, locs };
}

test("the simulator catches a slash loop and a chain", () => {
  const configs = {
    "credtent.org": { redirects: [{ source: "/a", destination: "/a/", statusCode: 301 }, { source: "/a/", destination: "/a", statusCode: 301 }, { source: "/b", destination: "/c", statusCode: 301 }, { source: "/c", destination: "/d", statusCode: 301 }] }
  };
  assert.ok(redirectProblems(configs, "https://credtent.org/a", 5).some((p) => p.startsWith("loop")));
  assert.ok(redirectProblems(configs, "https://credtent.org/b").length);
});

test("every sitemap URL is served with no redirect", () => {
  const { configs, locs } = load();
  for (const [host, list] of Object.entries(locs)) {
    assert.ok(list.length, `${host} sitemap is empty`);
    for (const loc of list) assert.equal(matchRedirect(configs, new URL(loc).host, new URL(loc).pathname), null, `${loc} is redirected`);
  }
});

test("the other slash form of every sitemap URL reaches it in one hop", () => {
  const { configs, locs } = load();
  for (const list of Object.values(locs)) {
    for (const loc of list) {
      const u = new URL(loc);
      if (u.pathname === "/") continue;
      const other = u.pathname.endsWith("/") ? u.pathname.slice(0, -1) : `${u.pathname}/`;
      const start = `${u.origin}${other}`;
      assert.equal(matchRedirect(configs, u.host, other), loc, `${start} does not 301 to ${loc}`);
      assert.deepEqual(redirectProblems(configs, start), [], start);
    }
  }
});

test("www reaches the apex page in one hop, then stops", () => {
  const { configs, locs } = load();
  for (const list of Object.values(locs)) {
    for (const loc of list) {
      const u = new URL(loc);
      const start = `https://www.${u.host}${u.pathname}`;
      assert.equal(matchRedirect(configs, `www.${u.host}`, u.pathname), loc, `${start} does not 301 to ${loc}`);
      assert.deepEqual(redirectProblems(configs, start), [], start);
    }
  }
});

test("no redirect chains or loops from any literal source", () => {
  const { configs } = load();
  for (const [host, config] of Object.entries(configs)) {
    for (const rule of config.redirects) {
      if (rule.has) continue;
      assert.deepEqual(redirectProblems(configs, `https://${host}${rule.source}`), [], `${host}${rule.source}`);
    }
  }
});
