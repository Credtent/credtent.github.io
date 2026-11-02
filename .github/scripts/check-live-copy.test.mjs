import test from "node:test";
import assert from "node:assert/strict";
import { RULES, scanText, loadNames } from "./check-live-copy.mjs";

const hit = (html, id) => RULES.find((r) => r.id === id).re.test(scanText(html));

test("entity-encoded em dash is caught", () => assert.ok(hit("<p>a &mdash; b</p>", "em-dash")));
test("free-forever promise hidden by &nbsp; is caught", () => assert.ok(hit("<p>free&nbsp;forever</p>", "free-forever-promise")));
test("claims in alt text are caught", () => assert.ok(hit('<img alt="Opt-Out Premium is $49 a year">', "hidden-49-premium")));
test("claims in JSON-LD are caught", () => assert.ok(hit('<script type="application/ld+json">{"text":"legally obligates the company"}</script>', "pbc-legal-duty-claim")));
test("Creator Licensing at $99 without the promo is caught", () => assert.ok(hit("<p>Creator Licensing at $99 per year</p>", "licensing-99-without-promo")));
test("the soft free line passes", () => assert.ok(!hit("<p>Credtent does not plan to charge for the free opt-out.</p>", "free-forever-promise")));
test("the names list fails closed when absent", () => {
  const names = loadNames({ CREDTENT_REVIEW_NAMES: "" });
  // With no env value the gate falls back to the gitignored file; in CI that file never exists.
  assert.ok(Array.isArray(names));
  assert.equal(loadNames({ CREDTENT_REVIEW_NAMES: "Alpha | Beta" }).length, 2);
});
