// Tests for the credtent.org gate on legal hold item 11. Run: node --test scripts/test-org-dns-ready.mjs
// Contract: Cherryh's 2026-11-10 implementation check, item F as amended (Amendment 1).
//  - Original: agents/cherryh/YYYY-MM-DD-lws-item-11-cleared.md in the Claudia repo (authoritative, with the bucket).
//  - Copy: launch/lws-item-11-clearance.md in this public repo, a redacted attestation with exactly six fields.
//  - The credtent.org production build checks the copy; the local DNS step 7 also recomputes the original's sha256.
import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { attestationProblems, clearanceNote, dnsStepProblems } from "./check-org-dns-ready.mjs";

const NOW = new Date("2026-12-01T12:00:00Z");
const ORIGINAL_NAME = "2026-11-20-lws-item-11-cleared.md";
const ORIGINAL = ["# Legal hold item 11", "Status: CLEARED", "Scope: item 11 only", "Bucket: credtent-legal-hold-registry-20260926", "Listing verified: 11 of 11 hashes equal MANIFEST.txt", ""].join("\n");
const sha = (text) => crypto.createHash("sha256").update(text).digest("hex");
const copyText = (hash = sha(ORIGINAL), extra = []) => [
  "Status: CLEARED",
  "Scope: item 11 only",
  "Cleared: 2026-11-20",
  `Original: agents/cherryh/${ORIGINAL_NAME}`,
  `Original sha256: ${hash}`,
  "Listing verified: 11 of 11 hashes equal MANIFEST.txt",
  ...extra,
  ""
].join("\n");
function tmp(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "item11-"));
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text);
  return dir;
}

// ---------- The committed copy (what the credtent.org Vercel build checks) ----------
test("a missing copy blocks the org build", () => assert.ok(attestationProblems("/nonexistent/lws-item-11-clearance.md", NOW).length));
test("the exact copy passes", () => {
  const dir = tmp({ "c.md": copyText() });
  assert.deepEqual(attestationProblems(path.join(dir, "c.md"), NOW), []);
});
for (const field of ["Status: CLEARED", "Scope: item 11 only", "Cleared: 2026-11-20", "Listing verified: 11 of 11 hashes equal MANIFEST.txt"]) {
  test(`a copy missing "${field}" blocks it`, () => {
    const dir = tmp({ "c.md": copyText().replace(`${field}\n`, "") });
    assert.ok(attestationProblems(path.join(dir, "c.md"), NOW).length);
  });
}
test("a copy with the bucket name, the account id, or any extra line blocks it", () => {
  for (const extra of ["Bucket: credtent-legal-hold-registry-20260926", "Account: 637423235393", "Note: see the registry"]) {
    const dir = tmp({ "c.md": copyText(undefined, [extra]) });
    assert.ok(attestationProblems(path.join(dir, "c.md"), NOW).length, extra);
  }
});
test("a copy dated in the future or before the 2026-11-01 capture blocks it", () => {
  for (const date of ["2026-12-20", "2026-10-30"]) {
    const dir = tmp({ "c.md": copyText().replace("Cleared: 2026-11-20", `Cleared: ${date}`) });
    assert.ok(attestationProblems(path.join(dir, "c.md"), NOW).length, date);
  }
});
test("a copy with a malformed hash or original path blocks it", () => {
  for (const [from, to] of [[`Original sha256: ${sha(ORIGINAL)}`, "Original sha256: abc"], [`Original: agents/cherryh/${ORIGINAL_NAME}`, "Original: notes.md"]]) {
    const dir = tmp({ "c.md": copyText().replace(from, to) });
    assert.ok(attestationProblems(path.join(dir, "c.md"), NOW).length, to);
  }
});

// ---------- The original (Cherryh's note; read only by the local DNS step) ----------
test("the original note contract still holds", () => {
  assert.equal(clearanceNote(tmp({ [ORIGINAL_NAME]: ORIGINAL }), NOW).ok, true);
  assert.equal(clearanceNote(tmp({ [ORIGINAL_NAME]: ORIGINAL + "Status: HELD\n" }), NOW).ok, false);
  assert.equal(clearanceNote(tmp({ "2026-11-20-item-11-lws-clearance.md": ORIGINAL }), NOW).ok, false);
});

// ---------- The local DNS step: copy plus original, hashes equal ----------
test("the DNS step passes when the copy matches the original byte for byte", () => {
  const cherryh = tmp({ [ORIGINAL_NAME]: ORIGINAL });
  const copy = path.join(tmp({ "c.md": copyText() }), "c.md");
  assert.deepEqual(dnsStepProblems(copy, cherryh, NOW), []);
});
test("the DNS step blocks when the original changed after the copy was made", () => {
  const cherryh = tmp({ [ORIGINAL_NAME]: ORIGINAL + "edited\n" });
  const copy = path.join(tmp({ "c.md": copyText() }), "c.md");
  assert.ok(dnsStepProblems(copy, cherryh, NOW).some((p) => /sha256/.test(p)));
});
test("the DNS step blocks a copy with no original", () => {
  const copy = path.join(tmp({ "c.md": copyText() }), "c.md");
  assert.ok(dnsStepProblems(copy, tmp({}), NOW).length);
});
test("today the repo has no copy, so both the org build and the DNS step are blocked", async () => {
  const { DEFAULT_COPY } = await import("./check-org-dns-ready.mjs");
  assert.ok(attestationProblems(DEFAULT_COPY).length);
});
