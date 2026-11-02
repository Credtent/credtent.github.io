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
