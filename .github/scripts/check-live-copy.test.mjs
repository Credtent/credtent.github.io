import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { RULES, scanText, run, served, jekyllExcludes } from "./check-live-copy.mjs";
import { findNames, MISSING_MESSAGE } from "./private-names.mjs";

const hit = (html, id) => { const r = RULES.find((x) => x.id === id); const t = scanText(html); return r.test ? r.test(t) : r.re.test(t); };
// Ten synthetic entries: the loader treats a shorter list as missing.
const LIST = ["Example Corp", "Acmeworks", "Filler One", "Filler Two", "Filler Three", "Filler Four", "Filler Five", "Filler Six", "Filler Seven", "Filler Eight"].join("\n");
const tmp = (files) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "live-copy-"));
  for (const [rel, body] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.writeFileSync(path.join(dir, rel), body); }
  return dir;
};

test("fails closed with no names list", () => {
  const root = tmp({ "index.html": "<p>ok</p>" });
  assert.ok(run({ env: { CREDTENT_REVIEW_NAMES: "" }, localFile: null, root }).includes(MISSING_MESSAGE));
});
test("a listed name fails with file, line and rule only, never the name", () => {
  const root = tmp({ "a.html": "<p>ok</p>\n<p>Example Corp signed</p>", "notes/b.md": "Example Corp" });
  const fails = run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root });
  assert.deepEqual(fails.sort(), ["a.html:2: private-name", "notes/b.md:1: private-name"]);
  assert.ok(fails.every((f) => !/Example/.test(f)));
});
test("claim failures print no page text", () => {
  const root = tmp({ "p.html": "<p>Opt-Out Premium is $49 a year</p>" });
  assert.deepEqual(run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root }), ["p.html:1: hidden-49-premium"]);
});
test("coverage: _config.yml excludes are skipped; underscore, dot and unlisted files are scanned; include wins", () => {
  const root = tmp({ "_config.yml": "exclude:\n  - drafts\ninclude:\n  - drafts/keep.md\n", "drafts/x.md": "x", "drafts/keep.md": "k", ".well-known/y.txt": "y", "_includes/z.html": "z", "data.csv": "a,b", ".github/w.yml": "w" });
  assert.deepEqual(jekyllExcludes(root), ["drafts"]);
  assert.deepEqual(served(root), [".well-known/y.txt", "_config.yml", "_includes/z.html", "data.csv", "drafts/keep.md"]);
  // The name scan follows the S3 sync, which publishes excluded files too.
  assert.ok(served(root, { forNames: true }).includes("drafts/x.md"));
});
test("names in paths, includes, Markdown, CSV and escaped JSON are found; Liquid needs review", () => {
  const root = tmp({ "case-studies/acmeworks/index.html": "<p>ok</p>", "_includes/footer.html": "<p>Acmeworks</p>", "page.markdown": "Acmeworks", "data.csv": "x,Acmeworks", "data.json": '{"n":"\\u0041cmeworks"}', "liq.html": '---\n---\n<p>{{ "Acme" | append: "works" }}</p>' });
  const fails = run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root });
  for (const f of ["_includes/footer.html:1: private-name", "page.markdown:1: private-name", "data.csv:1: private-name", "data.json:1: private-name", "liq.html:0: liquid-needs-review", "liq.html:3: private-name"]) assert.ok(fails.includes(f), f);
  // A path that names a listed entry is printed only as a short hash.
  assert.ok(fails.some((f) => /^\[redacted:[0-9a-f]{12}\]:0: private-name-in-path$/.test(f)));
  assert.ok(fails.every((f) => !/acmeworks/i.test(f)));
});
test("markup that renders the same does not hide a claim", () => {
  assert.ok(hit("<p>The opt-out is al<b>ways</b> free.</p>", "free-forever-promise"));
  assert.ok(hit("<p>Opt-Out Pre<span>mium</span> is $49 a year</p>", "hidden-49-premium"));
  assert.ok(hit("<style>.p::after{content:'always free'}</style>", "free-forever-promise"));
  assert.ok(hit("<script>el.textContent='always free'</script>", "free-forever-promise"));
  assert.ok(hit("<p title=always&#32;free>x</p>", "free-forever-promise"));
  assert.ok(hit("<p>Under its terms, 85% of revenue goes to owners.</p>", "85-without-standard-terms"));
  assert.ok(hit("<p>Credtent also audits AI models periodically.</p>", "present-tense-audits"));
});
test("entities, attributes and JSON-LD are decoded and scanned", () => {
  assert.ok(hit("<p>a &mdash; b</p>", "em-dash"));
  assert.ok(hit("<p>a &#x2014 b</p>", "em-dash"));
  assert.ok(hit("<p>free&nbsp;forever</p>", "free-forever-promise"));
  assert.ok(hit("<img alt='Opt-Out Premium is &#x24;49 a year'>", "hidden-49-premium"));
  assert.ok(hit('<div data-x="legally obligates"></div>', "pbc-legal-duty-claim"));
  assert.ok(hit('<script type="application/ld+json">{"t":"85% of every deal"}</script>', "85-every-deal"));
});
test("the review's misses are caught", () => {
  assert.ok(hit("<p>take control with a free opt-out, forever.</p>", "forever-near-free"));
  assert.ok(hit("<p>Built into every contract.</p>", "every-contract-or-no-exceptions"));
  assert.ok(hit("<p>Every deal Credtent closes returns 85% of revenue.</p>", "every-contract-or-no-exceptions"));
  assert.ok(hit("<li>Everything in Opt-Out Premium</li>", "premium-included-in-49"));
  assert.ok(hit("<p>and credtent does not plan to charge</p>", "lowercase-brand"));
  assert.ok(!hit("<p>hello@credtent.org and credtent.com</p>", "lowercase-brand"));
  assert.ok(hit("<p>As a Delaware Public Benefit Corporation, Credtent acts as a neutral agent</p>", "pbc-as-cause-of-neutrality"));
});
test("the soft free line and standard-terms 85/15 pass", () => {
  assert.ok(!hit("<p>Credtent does not plan to charge for the free opt-out.</p>", "free-forever-promise"));
  assert.ok(!hit("<p>Under Credtent's standard terms, content partners keep 85% of each licensing deal.</p>", "85-every-deal"));
});
test("names hide in comments, scripts, data attributes, entities and split strings, and are still found", () => {
  const list = { names: ["Example Corp"], allow: new Set() };
  for (const raw of ["<!-- Example Corp -->", "<script>x='Example Corp'</script>", '<i data-x="Example Corp">', "Exa&#x6d;ple Corp", "Exam​ple Corp", "Ex<b>ample</b> Corp", '"Example" + " Corp"']) {
    assert.equal(findNames(raw, ["a.html"], list).length, 1, raw);
  }
});

test("round four: UTF-16, NUL bytes, duplicate config keys, Liquid without front matter, render-time text", () => {
  const root = tmp({ "_config.yml": "exclude: [a]\nexclude: [b]\n", "plain.md": "{{ site.title }}", "s.html": "<script>t=atob('QQ==')</script>" });
  fs.writeFileSync(path.join(root, "utf16.html"), Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from("<p>Acmeworks</p>", "utf16le")]));
  fs.writeFileSync(path.join(root, "nul.html"), "<p>ok<!-- \0 --> Acmeworks</p>");
  const fails = run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root });
  for (const f of ["_config.yml:0: duplicate-top-level-key (exclude)", "plain.md:0: liquid-needs-review", "s.html:0: render-time-text-needs-review", "utf16.html:1: private-name", "nul.html:0: nul-byte-in-text", "nul.html:1: private-name"]) assert.ok(fails.includes(f), f);
});
test("exempt live pages are pinned: any change fails until the pin is reviewed", () => {
  const root = tmp({ "lws.html": "<p>changed</p>" });
  assert.ok(run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root }).some((f) => f.startsWith("lws.html:0: exempt-page-changed")));
});
test("85/15 statements need the standard qualifier; bare figures do not", () => {
  assert.ok(hit("<p>Payments follow the 85/15 split.</p>", "85-without-standard-terms"));
  assert.ok(!hit("<p>Payments follow the standard 85/15 split.</p>", "85-without-standard-terms"));
  assert.ok(!hit('<div><span>85/15</span><span>+ premium</span></div>', "85-without-standard-terms"));
  assert.ok(hit("<p>a \u2015 b</p>", "em-dash"));
});
test("the names list ignores a local file in CI and counts unique entries", async () => {
  const { loadPrivateNames } = await import("./private-names.mjs");
  assert.equal(loadPrivateNames({ CI: "true", CREDTENT_REVIEW_NAMES: "" }).missing, true);
  assert.equal(loadPrivateNames({ CREDTENT_REVIEW_NAMES: Array(12).fill("Same Name").join("\n") }).missing, true);
});
test("rules ported from the new-sites gate: whatever the deal size; every deal near 85% needs standard terms", () => {
  assert.ok(hit("<p>Royalties are paid quarterly, whatever the deal size.</p>", "every-contract-split"));
  assert.ok(hit("<p>Owners get every deal at 85% of revenue.</p>", "every-contract-or-no-exceptions"));
  assert.ok(!hit("<p>Owners approve every deal before it executes, receive 85% of gross licensing revenue under standard terms.</p>", "every-contract-or-no-exceptions"));
});

// Round-four verify (2026-11-02).
test("redactLine hides a multi-word entry, even split by extra spaces, and keeps the rest of the line", async () => {
  const { loadPrivateNames, redactLine, findNames: fn } = await import("./private-names.mjs");
  const list = loadPrivateNames({ CREDTENT_REVIEW_NAMES: LIST });
  for (const line of ["FAIL page.html:3: thrown near Example Corp in the text", "error: Example  Corp, then more", "Example\tCorp", "x Example-Corp y"]) {
    const out = redactLine(line, list);
    assert.equal(fn(out, [], { ...list, allow: new Set() }).length, 0, out);
    assert.match(out, /\[redacted/);
  }
  assert.equal(redactLine("FAIL a.html:1: em-dash", list), "FAIL a.html:1: em-dash");
  assert.match(redactLine("FAIL a.html:1: near Example Corp", list), /^FAIL a\.html:1: near \[redacted:[0-9a-f]{12}\]$/);
  // Each line of a multi-line message is handled on its own.
  const multi = redactLine("build failed\nsaw Example Corp here\nexit 1", list);
  assert.equal(fn(multi, [], { ...list, allow: new Set() }).length, 0);
  assert.match(multi, /^build failed\n.*\nexit 1$/);
});
test("&horbar; is an em dash; JSON and CSS escapes in non-HTML files are decoded for the claim rules", () => {
  assert.ok(hit("<p>a &horbar; b</p>", "em-dash"));
  const root = tmp({ "site.webmanifest": '{"name":"Credtent \\u2014 x"}', "s.css": ".a::after{content:\"Credtent \\2014  x\"}", "d.json": '{"t":"Credtent Ae\\u0067is"}' });
  const fails = run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root });
  for (const f of ["site.webmanifest:1: em-dash", "s.css:1: em-dash", "d.json:1: product-name"]) assert.ok(fails.includes(f), `${f} in ${fails}`);
});
test("a UTF-16LE page that starts with FF FE 00 00 is read as UTF-16, as browsers do", () => {
  const root = tmp({});
  fs.writeFileSync(path.join(root, "u.html"), Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from("\0<p>Credtent Aegis</p>", "utf16le")]));
  assert.ok(run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root }).includes("u.html:1: product-name"));
});
test("Liquid in any served file with front matter needs review", () => {
  const root = tmp({ "llms.txt": "---\n---\n{{ 'a' | append: 'b' }}", "x.js": "---\n---\n{{ x }}", "plain.txt": "{{ not liquid without front matter }}" });
  const fails = run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root });
  assert.ok(fails.includes("llms.txt:0: liquid-needs-review"));
  assert.ok(fails.includes("x.js:0: liquid-needs-review"));
  assert.ok(!fails.includes("plain.txt:0: liquid-needs-review"));
});
test("_config.yml: quoted keys, a space before the colon, a second document and .nojekyll do not hide an exclude", () => {
  for (const cfg of ['exclude:\n  - p\n"exclude": []\n', "exclude:\n  - p\nexclude : []\n", "title: x\n---\nexclude:\n  - p\n"]) {
    const root = tmp({ "_config.yml": cfg, "p/a.html": "<p>Credtent Aegis</p>" });
    const fails = run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root });
    assert.ok(fails.some((f) => f.startsWith("_config.yml:0:")), `${JSON.stringify(cfg)} -> ${fails}`);
  }
  // With .nojekyll, Pages does not run Jekyll, so the exclude list does not apply and p/ is served.
  const root = tmp({ "_config.yml": "exclude:\n  - p\n", ".nojekyll": "", "p/a.html": "<p>Credtent Aegis</p>" });
  assert.ok(run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root }).includes("p/a.html:1: product-name"));
});
test("array joins and template interpolation in scripts are flagged for review", () => {
  const root = tmp({ "a.html": "<script>x=['Credtent ','Aegis'].join('')</script>", "b.html": "<script>x=`Credtent ${y}`</script>" });
  const fails = run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root });
  assert.ok(fails.includes("a.html:0: render-time-text-needs-review"));
  assert.ok(fails.includes("b.html:0: render-time-text-needs-review"));
});
test("85/15 variants: 85 percent of every deal, 85-15 and 85 / 15", () => {
  assert.ok(hit("<p>Owners keep 85 percent of every deal.</p>", "85-every-deal"));
  assert.ok(hit("<p>Payments follow the 85-15 split.</p>", "85-without-standard-terms"));
  assert.ok(hit("<p>Payments follow the 85 / 15 split.</p>", "85-without-standard-terms"));
});
test("names in binary files are found from their text runs (PDF text, XMP and similar)", () => {
  const root = tmp({});
  fs.writeFileSync(path.join(root, "deck.pdf"), Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.from([0, 1, 2, 3]), Buffer.from("(Example Corp) Tj")]));
  assert.ok(run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root }).includes("deck.pdf:0: private-name-in-binary"));
});
test("parking/lws.html is pinned like lws.html", () => {
  const root = tmp({ "parking/lws.html": "<p>changed</p>" });
  assert.ok(run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root }).some((f) => f.startsWith("parking/lws.html:0: exempt-page-changed")));
});
test("a render-time file a person has reviewed is pinned by hash; any change flags it again", async () => {
  const crypto = await import("node:crypto");
  const body = "x=`${base}a.html`";
  const root = tmp({ "c.js": body });
  const pin = crypto.createHash("sha256").update(body).digest("hex");
  assert.ok(!run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root, reviewed: new Map([["c.js", pin]]) }).includes("c.js:0: render-time-text-needs-review"));
  assert.ok(run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root, reviewed: new Map([["c.js", "0".repeat(64)]]) }).includes("c.js:0: render-time-text-needs-review"));
});
test("a claim soft-wrapped across a line break in a text file is still read", () => {
  const root = tmp({ "llms.txt": "About\nCredtent\nAegis is here" });
  assert.ok(run({ env: { CREDTENT_REVIEW_NAMES: LIST }, localFile: null, root }).some((f) => /^llms\.txt:\d+: product-name$/.test(f)));
});
