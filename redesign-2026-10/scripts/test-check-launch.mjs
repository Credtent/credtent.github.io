// Tests for the launch gate's scanning and the terms swap guard. Run: node --test scripts/test-check-launch.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { BANNED, scanText, staysNoindex } from "./check-launch.mjs";
import { termsGuard } from "../src/lib/terms.mjs";
import { findNames } from "./private-names.mjs";

const hits = (html, id) => BANNED.find((b) => b.id === id).re.test(scanText(html));

test("an entity-encoded em dash is caught", () => assert.ok(hits("<p>a &mdash; b</p>", "em-dash")));
test("a free-forever promise hidden by &nbsp; is caught", () => assert.ok(hits("<p>free&nbsp;forever</p>", "free-forever-promise")));
test("a claim in alt text is caught", () => assert.ok(hits('<img alt="Opt-Out Premium is $49 a year">', "hidden-49-premium")));
test("a claim in a JSON-LD string is caught", () => assert.ok(hits('<script type="application/ld+json">{"a":{"text":"legally obligated to"}}</script>', "pbc-legal-duty-claim")));
test("85% of every deal is caught, standard-terms wording passes", () => {
  assert.ok(hits("<p>Content partners keep 85% of every licensing deal.</p>", "85-every-deal"));
  assert.ok(!hits("<p>Under Credtent's standard terms, content partners keep 85% of each licensing deal.</p>", "85-every-deal"));
});
test("a claim rule does not run across two cards", () => assert.ok(!hits("<div><h3>Opt-Out Premium</h3></div><div><p>US$49 licensing</p></div>", "hidden-49-premium")));
test("the widened WGA discount is caught", () => assert.ok(hits("<p>WGA members receive a discount on certification fees.</p>", "wga-discount-widened")));
test("upcoming terms and /lws stay noindex in production", () => {
  assert.ok(staysNoindex("terms-of-service/upcoming/index.html"));
  assert.ok(staysNoindex("lws/index.html"));
  assert.ok(!staysNoindex("terms-of-service/index.html"));
});
test("names: found unless allowed for that page", () => {
  const list = { names: ["Example Corp"], allow: new Set(["org/a.html example corp"]) };
  assert.deepEqual(findNames("Example Corp licensed", "org/b.html", list), ["Example Corp"]);
  assert.deepEqual(findNames("Example Corp licensed", "org/a.html", list), []);
});
test("terms guard: the defaults are consistent", () => assert.deepEqual(termsGuard(new Date("2026-11-02T00:00:00Z")), []));
test("terms guard: a date under 30 days after the notice fails", () => {
  const e = termsGuard(new Date("2027-01-01T00:00:00Z"), { TERMS_NOTICE_SENT: "2026-11-10", REVISED_TERMS_DATE: "December 1, 2026", TERMS_SWAP: false });
  assert.ok(e.some((x) => /30 days/.test(x)));
});
test("terms guard: swapping before the effective date fails", () => {
  const e = termsGuard(new Date("2026-12-01T00:00:00Z"), { TERMS_NOTICE_SENT: "2026-11-10", REVISED_TERMS_DATE: "December 15, 2026", TERMS_SWAP: true });
  assert.ok(e.some((x) => /before REVISED_TERMS_DATE/.test(x)));
});
test("terms guard: swapping without a recorded notice fails", () => {
  const e = termsGuard(new Date("2027-01-01T00:00:00Z"), { TERMS_NOTICE_SENT: "", REVISED_TERMS_DATE: "December 15, 2026", TERMS_SWAP: true });
  assert.ok(e.some((x) => /TERMS_NOTICE_SENT/.test(x)));
});
test("terms guard: a noticed swap on or after the date passes", () => {
  assert.deepEqual(termsGuard(new Date("2026-12-16T00:00:00Z"), { TERMS_NOTICE_SENT: "2026-11-10", REVISED_TERMS_DATE: "December 15, 2026", TERMS_SWAP: true }), []);
});

test("hex and named entities are decoded before the rules run", () => {
  assert.ok(hits("<p>Opt-Out Premium is &#x24;49 a year</p>", "hidden-49-premium"));
  assert.ok(hits("<p>Opt-Out Premium is &dollar;49 a year</p>", "hidden-49-premium"));
  assert.ok(hits("<p>a &#x2014 b</p>", "em-dash"));
});
test("single-quoted and data-* attributes are scanned", () => {
  assert.ok(hits("<img alt='free forever'>", "free-forever-promise"));
  assert.ok(hits('<div data-note="legally obligated"></div>', "pbc-legal-duty-claim"));
});
test("forever near the free opt-out is caught", () => assert.ok(hits("<p>take control with a free opt-out, forever.</p>", "forever-near-free")));
test("a lowercase brand mid-sentence is caught, URLs and addresses are not", () => {
  assert.ok(hits("<p>Yes, and credtent does not plan to charge.</p>", "lowercase-brand"));
  assert.ok(!hits('<p>Write to hello@credtent.org or visit credtent.com.</p>', "lowercase-brand"));
});
test("names hide in comments, scripts, data attributes, entities and split strings, and are still found", () => {
  const list = { names: ["Example Corp"], allow: new Set() };
  for (const raw of ["<!-- Example Corp -->", "<script>x='Example Corp'</script>", '<i data-x="Example Corp">', "Exa&#x6d;ple Corp", "Exam\u200bple Corp", "Ex<b>ample</b> Corp", '"Example" + " Corp"']) {
    assert.equal(findNames(raw, ["org/a.html"], list).length, 1, raw);
  }
});

test("third round: 85% needs standard terms, audits are an enrollment, ported copy rules run decoded", async () => {
  const { ruleHit } = await import("./check-launch.mjs");
  const r = (id) => BANNED.find((b) => b.id === id);
  assert.ok(ruleHit(r("85-without-standard-terms"), scanText("<p>Owners keep 85% of revenue.</p>")));
  assert.ok(!ruleHit(r("85-without-standard-terms"), scanText("<p>Under standard terms, owners keep 85% of revenue.</p>")));
  assert.ok(ruleHit(r("present-tense-audits"), scanText("<p>Credtent audits AI models periodically.</p>")));
  assert.ok(ruleHit(r("product-name"), scanText("<p>Credtent&nbsp;Aegis</p>")));
  assert.ok(ruleHit(r("round-the-clock"), scanText("<p>24&#47;7</p>")));
  assert.ok(ruleHit(r("audience-word"), scanText("<p>For crea<b>tors</b></p>")));
  assert.ok(!ruleHit(r("audience-word"), scanText("<p>protect creators of original works</p>")));
  assert.ok(ruleHit(r("free-forever-promise"), scanText("<p>al<wbr>ways free</p>")));
  assert.ok(ruleHit(r("free-forever-promise"), scanText("<style>.x::after{content:'always free'}</style>")));
});

// Audit-coverage attestation (EB ruling relayed 2026-11-02, "Keep the claim"): fails closed in every bad case.
test("audit coverage: a complete, fresh attestation passes; every failure case, a stale, missing or malformed file fails", async () => {
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const { auditCoverageProblems } = await import("./check-launch.mjs");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "coverage-"));
  const now = new Date("2026-11-20T12:00:00Z");
  const good = { schema: "credtent-audit-coverage/1", generatedAt: "2026-11-19T12:00:00Z", aegisCommit: "0123abcd", signersTotal: 12, placedInRun: 12, missing: 0, heldByRuling: 0 };
  const check = (value, raw) => {
    const file = path.join(dir, `c-${Math.random().toString(36).slice(2)}.json`);
    fs.writeFileSync(file, raw ?? JSON.stringify(value));
    return auditCoverageProblems(file, now);
  };
  assert.deepEqual(check(good), []);
  const fails = (patch, re) => { const p = check({ ...good, ...patch }); assert.ok(p.some((x) => re.test(x)), `${JSON.stringify(patch)} -> ${p}`); };
  fails({ schema: "credtent-audit-coverage/2" }, /schema/);
  fails({ signersTotal: 0, placedInRun: 0 }, /signersTotal is 0/);
  fails({ placedInRun: 11, missing: 1 }, /placedInRun/);
  fails({ missing: 1 }, /missing is 1/);
  fails({ heldByRuling: 2 }, /heldByRuling is 2/);
  fails({ placedInRun: "12" }, /whole numbers/);
  fails({ missing: -1 }, /whole numbers/);
  fails({ aegisCommit: "main" }, /commit sha/);
  fails({ generatedAt: "2026-11-17T11:59:00Z" }, /stale/);
  fails({ generatedAt: "2026-11-21T12:00:00Z" }, /future/);
  fails({ generatedAt: "yesterday" }, /not a UTC timestamp/);
  fails({ signers: ["a@example.com"] }, /counts only/);
  assert.ok(auditCoverageProblems(path.join(dir, "absent.json"), now).some((x) => /missing/.test(x)));
  assert.ok(check(null, "{not json").some((x) => /not valid JSON/.test(x)));
  assert.ok(check(null, "[1,2]").some((x) => /not a JSON object/.test(x)));
  // Exactly 72 hours old still passes; the limit is "no more than 72 hours".
  assert.deepEqual(check({ ...good, generatedAt: "2026-11-17T12:00:00Z" }), []);
});

test("round four: paths, UTF-16, NUL bytes, the raw terms block and redaction, end to end", async () => {
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const { spawnSync } = await import("node:child_process");
  const here = path.dirname(new URL(import.meta.url).pathname);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "launch-"));
  for (const id of ["com", "org"]) fs.cpSync(path.join(here, "..", "sites", id), path.join(tmp, id), { recursive: true });
  const terms = path.join(tmp, "com", "terms-of-service", "index.html");
  // Same visible text, different markup inside the verbatim block: the raw comparison must catch it.
  fs.writeFileSync(terms, fs.readFileSync(terms, "utf8").replace("<!--legal:current-terms:start-->", "<!--legal:current-terms:start--><span data-x=\"free forever\"></span>"));
  fs.mkdirSync(path.join(tmp, "com", "example-corp"));
  fs.writeFileSync(path.join(tmp, "com", "example-corp", "x.txt"), "ok");
  fs.writeFileSync(path.join(tmp, "org", "u16.html"), Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from("<p>Example Corp</p>", "utf16le")]));
  fs.writeFileSync(path.join(tmp, "org", "nul.data"), "a\0b Example Corp");
  const list = ["Example Corp", "Filler One", "Filler Two", "Filler Three", "Filler Four", "Filler Five", "Filler Six", "Filler Seven", "Filler Eight", "Filler Nine"].join("\n");
  const r = spawnSync(process.execPath, [path.join(here, "check-launch.mjs"), "preview", path.join(tmp, "com"), path.join(tmp, "org")], { env: { ...process.env, CREDTENT_REVIEW_NAMES: list, CI: "" }, encoding: "utf8" });
  const out = r.stdout;
  assert.match(out, /com\/terms-of-service: the current terms block is not the live markup/);
  assert.match(out, /\[redacted:[0-9a-f]{12}\]:0: private-name-in-path/);
  assert.match(out, /org\/u16\.html:1: private-name/);
  assert.match(out, /org\/nul\.data:0: nul-byte-in-text/);
  assert.match(out, /org\/nul\.data:1: private-name/);
  assert.doesNotMatch(out, /example[\s-]?corp/i);
});
test("every deal near 85% needs standard terms in the same sentence", async () => {
  const { ruleHit } = await import("./check-launch.mjs");
  const r = BANNED.find((b) => b.id === "every-contract-or-no-exceptions");
  assert.ok(ruleHit(r, scanText("<p>Owners get every deal at 85% of revenue.</p>")));
  assert.ok(!ruleHit(r, scanText("<p>Owners approve every deal before it executes, receive 85% of gross licensing revenue under standard terms.</p>")));
  assert.ok(ruleHit(r, scanText("<p>No exceptions.</p>")));
});

// Round-four verify (2026-11-02), written before the fixes.
test("non-HTML site files are read with CSS, JS and JSON escapes decoded (escaped em dash, escaped claim)", async () => {
  const { claimText, ruleHit } = await import("./check-launch.mjs");
  const r = (id) => BANNED.find((b) => b.id === id);
  assert.ok(ruleHit(r("em-dash"), claimText("css/site.css", ".a::after{content:\"x \\2014  y\"}")));
  assert.ok(ruleHit(r("em-dash"), claimText("app.js", "const t = 'a \\u2014 b';")));
  assert.ok(ruleHit(r("em-dash"), claimText("site.webmanifest", '{"name":"Credtent \\u2014 x"}')));
  assert.ok(ruleHit(r("product-name"), claimText("data.json", '{"t":"Credtent Ae\\u0067is"}')));
  assert.ok(ruleHit(r("product-name"), claimText("app.js", "const t = 'Credtent ' + 'Aegis';")));
  assert.ok(ruleHit(r("product-name"), claimText("css/site.css", ".a::after{content:\"Credtent \" \"Aegis\"}")));
  assert.ok(ruleHit(r("em-dash"), scanText("<p>a &horbar; b</p>")));
});
test("the launch gate agrees with the live gate on every-deal and carries its live-only rules", async () => {
  const { ruleHit } = await import("./check-launch.mjs");
  const r = (id) => BANNED.find((b) => b.id === id);
  assert.ok(ruleHit(r("85-every-deal"), scanText("<p>Under standard terms, owners get 85% on every deal.</p>")));
  assert.ok(ruleHit(r("85-every-deal"), scanText("<p>Owners keep 85 percent of every deal.</p>")));
  assert.ok(ruleHit(r("85-without-standard-terms"), scanText("<p>Payments follow the 85-15 split.</p>")));
  for (const id of ["licensing-99-without-promo", "written-into", "pbc-as-cause-of-neutrality"]) assert.ok(r(id), id);
});
test("redactLine hides a two-word entry in a build error line", async () => {
  const { loadPrivateNames, redactLine, findNames: fn } = await import("./private-names.mjs");
  const list = loadPrivateNames({ CREDTENT_REVIEW_NAMES: ["Example Corp", "Filler One", "Filler Two", "Filler Three", "Filler Four", "Filler Five", "Filler Six", "Filler Seven", "Filler Eight", "Filler Nine"].join("\n") });
  const out = redactLine("Error: leftover token near ...signed with Example Corp last year...", list);
  assert.equal(fn(out, [], { ...list, allow: new Set() }).length, 0);
  assert.match(out, /^Error: leftover token near .*\[redacted:[0-9a-f]{12}\]/);
});
test("audit coverage: duplicate keys, a time without Z and a placeholder sha fail", async () => {
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const { auditCoverageProblems } = await import("./check-launch.mjs");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "coverage2-"));
  const now = new Date("2026-11-20T12:00:00Z");
  const write = (raw) => { const f = path.join(dir, `c-${Math.random().toString(36).slice(2)}.json`); fs.writeFileSync(f, raw); return auditCoverageProblems(f, now); };
  const good = { schema: "credtent-audit-coverage/1", generatedAt: "2026-11-19T12:00:00Z", aegisCommit: "0123abcd", signersTotal: 12, placedInRun: 12, missing: 0, heldByRuling: 0 };
  assert.deepEqual(write(JSON.stringify(good, null, 2) + "\n"), []);
  assert.ok(write(JSON.stringify(good).replace('"missing":0', '"missing":3,"missing":0')).some((x) => /duplicate/.test(x)));
  assert.ok(write(JSON.stringify(good).replace('"schema":"credtent-audit-coverage/1"', '"schema":"Example Corp","schema":"credtent-audit-coverage/1"')).some((x) => /duplicate/.test(x)));
  assert.ok(write(JSON.stringify({ ...good, generatedAt: "2026-11-19T12:00:00" })).some((x) => /UTC/.test(x)));
  assert.ok(write(JSON.stringify({ ...good, aegisCommit: "0000000" })).some((x) => /placeholder/.test(x)));
});
test("vercel.json may hold only headers, redirects and the URL settings; a build override fails", async () => {
  const { vercelConfigProblems } = await import("./check-launch.mjs");
  assert.deepEqual(vercelConfigProblems({ headers: [], redirects: [], cleanUrls: true, trailingSlash: false }), []);
  for (const k of ["buildCommand", "ignoreCommand", "installCommand", "outputDirectory", "framework", "rewrites"]) assert.ok(vercelConfigProblems({ headers: [], [k]: "x" }).length, k);
});
test("render-time text, binary names and parking/lws pin, end to end", async () => {
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const { spawnSync } = await import("node:child_process");
  const { ROOT_EXEMPT } = await import("./check-launch.mjs");
  assert.ok(ROOT_EXEMPT.has("parking/lws.html"));
  const here = path.dirname(new URL(import.meta.url).pathname);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "launch2-"));
  for (const id of ["com", "org"]) fs.cpSync(path.join(here, "..", "sites", id), path.join(tmp, id), { recursive: true });
  fs.writeFileSync(path.join(tmp, "com", "r.js"), "x = atob('QQ==');");
  fs.writeFileSync(path.join(tmp, "com", "deck.pdf"), Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.from([0, 1, 2]), Buffer.from("(Example Corp) Tj")]));
  const list = ["Example Corp", "Filler One", "Filler Two", "Filler Three", "Filler Four", "Filler Five", "Filler Six", "Filler Seven", "Filler Eight", "Filler Nine"].join("\n");
  const out = spawnSync(process.execPath, [path.join(here, "check-launch.mjs"), "preview", path.join(tmp, "com"), path.join(tmp, "org")], { env: { ...process.env, CREDTENT_REVIEW_NAMES: list, CI: "" }, encoding: "utf8" }).stdout;
  assert.match(out, /com\/r\.js:0: render-time-text-needs-review/);
  assert.match(out, /com\/deck\.pdf:0: private-name-in-binary/);
  assert.doesNotMatch(out, /example[\s-]?corp/i);
});
test("a claim soft-wrapped across a line break in a text file is still read", async () => {
  const { claimText, ruleHit } = await import("./check-launch.mjs");
  assert.ok(ruleHit(BANNED.find((b) => b.id === "product-name"), claimText("llms.txt", "About\nCredtent\nAegis is here")));
});
test("the audience-word allowance covers only the exact charter phrase", async () => {
  const { audienceWordOutsideCharter } = await import("./charter-quote.mjs");
  const w = "creat" + "ors";
  assert.equal(audienceWordOutsideCharter(`to empower and protect ${w} of original works in the marketplace`), false);
  assert.equal(audienceWordOutsideCharter(`protect ${w} of original works, and other ${w} too`), true);
  assert.equal(audienceWordOutsideCharter(`<a href="https://app.credtent.org/${w}">For ${w}</a>`), true);
  assert.equal(audienceWordOutsideCharter(`${w} of original works and creat&#111;rs`), true);
  assert.equal(audienceWordOutsideCharter("For creatives"), false);
});
test("check-launch's audience-word rule allows only the exact charter phrase", async () => {
  const { ruleHit } = await import("./check-launch.mjs");
  const rule = BANNED.find((b) => b.id === "audience-word");
  const w = "creat" + "ors";
  assert.equal(ruleHit(rule, `protect ${w} of original works in the AI marketplace`), false);
  assert.equal(ruleHit(rule, `see https://app.credtent.org/${w}`), true);
  assert.equal(ruleHit(rule, `protect ${w} of artistic, scholastic, scientific, journalistic, and other original works`), true);
});
test("a dropped name removes only its own paragraph, list item or table row", async () => {
  const { dropBlocks } = await import("./scrub.mjs");
  const html = `<p>Intro.</p><div class="a"><div><p>Zorblax Qentwell is listed.</p><p>Keep me.</p></div></div><ul><li>One</li><li>Zorblax Qentwell</li></ul><table><tr><td>A</td></tr><tr><td>Zorblax Qentwell</td></tr></table>`;
  assert.equal(dropBlocks(html, ["Zorblax Qentwell"]), `<p>Intro.</p><div class="a"><div><p>Keep me.</p></div></div><ul><li>One</li></ul><table><tr><td>A</td></tr></table>`);
});
test("the charter phrase is erased only as whole words", async () => {
  const { audienceWordOutsideCharter } = await import("./charter-quote.mjs");
  const w = "creat" + "ors";
  assert.equal(audienceWordOutsideCharter(`${w} of original worksheets`), true);
  assert.equal(audienceWordOutsideCharter(`the ${w} of original works.`), false);
});

// Round 2026-11-10 (Cherryh section 7, Niven drop-in 4).
test("the privacy launch-date placeholder is caught on a privacy page and nowhere else matters", async () => {
  const { privacyDateProblem } = await import("./check-launch.mjs");
  assert.ok(privacyDateProblem("<p>Last Updated: LAUNCH-DATE-PENDING</p>"));
  assert.equal(privacyDateProblem("<p>Last Updated: December 7, 2026</p>"), false);
});
test("org/standards stays noindex in production until Vonnegut B9 to B12 clear", () => {
  assert.ok(staysNoindex("standards/index.html"));
});
test("the built privacy pages carry PRIVACY_LAST_UPDATED (or its placeholder) from src/lib/privacy.mjs", async () => {
  // The production build differs from preview only in robots and headers (src/build.mjs PRODUCTION); the privacy
  // text comes from the same privacyDate() call in both, so the built pages prove the wiring.
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { privacyDate } = await import("../src/lib/privacy.mjs");
  const root = path.resolve(import.meta.dirname, "..");
  const build = fs.readFileSync(path.join(root, "src/build.mjs"), "utf8");
  assert.ok(!/PRODUCTION[^\n]*privacy|privacy[^\n]*PRODUCTION/i.test(build), "privacy text must not branch on SITE_ENV");
  for (const id of ["com", "org"]) {
    const html = fs.readFileSync(path.join(root, "sites", id, "privacy-policy", "index.html"), "utf8");
    assert.ok(html.includes(`Last Updated: ${privacyDate()}`), `${id} privacy page does not show Last Updated: ${privacyDate()}`);
  }
  const comIntro = fs.readFileSync(path.join(root, "sites/com/privacy-policy/index.html"), "utf8");
  assert.ok(comIntro.includes(`Last updated ${privacyDate()}.`), "com privacy intro does not use privacyDate()");
});
