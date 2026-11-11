// Tests for the credtent.org DNS gate (legal hold item 11). Run: node --test scripts/test-org-dns-ready.mjs
// The contract is Cherryh's 2026-11-10 implementation check, item F.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { clearanceNote } from "./check-org-dns-ready.mjs";

const NOW = new Date("2026-12-01T12:00:00Z");
const GOOD = [
  "# Legal hold item 11",
  "Status: CLEARED",
  "Scope: item 11 only",
  "Bucket: credtent-legal-hold-registry-20260926",
  "Listing verified: 11 of 11 hashes equal MANIFEST.txt",
  ""
].join("\n");
function dirWith(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "item11-"));
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text);
  return dir;
}

test("no folder blocks the DNS step", () => assert.equal(clearanceNote("/nonexistent/cherryh", NOW).ok, false));
test("today's rulings file, which says item 11 is NOT cleared, blocks it", () => {
  const dir = dirWith({ "2026-11-10-new-sites-legal-rulings.md": "Ruling: item 11 is NOT cleared." });
  assert.equal(clearanceNote(dir, NOW).ok, false);
});
test("the exact clearance note allows it", () => {
  const dir = dirWith({ "2026-11-20-lws-item-11-cleared.md": GOOD });
  const r = clearanceNote(dir, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.note, "2026-11-20-lws-item-11-cleared.md");
});
test("a loosely named note with the right lines blocks it", () => {
  const dir = dirWith({ "2026-11-20-item-11-lws-clearance.md": GOOD });
  assert.equal(clearanceNote(dir, NOW).ok, false);
});
test("a note that says it will be cleared later blocks it", () => {
  const dir = dirWith({ "2026-11-20-lws-item-11-cleared.md": "Item 11 will be cleared when the upload lands." });
  assert.equal(clearanceNote(dir, NOW).ok, false);
});
for (const line of ["Status: CLEARED", "Scope: item 11 only", "Bucket: credtent-legal-hold-registry-20260926", "Listing verified: 11 of 11 hashes equal MANIFEST.txt"]) {
  test(`a note missing "${line}" blocks it`, () => {
    const dir = dirWith({ "2026-11-20-lws-item-11-cleared.md": GOOD.replace(`${line}\n`, "") });
    assert.equal(clearanceNote(dir, NOW).ok, false);
  });
}
test("a required line that does not start the line blocks it", () => {
  const dir = dirWith({ "2026-11-20-lws-item-11-cleared.md": GOOD.replace("Status: CLEARED", "Not yet. Status: CLEARED") });
  assert.equal(clearanceNote(dir, NOW).ok, false);
});
test("NOT CLEARED or Status: HELD anywhere blocks it", () => {
  for (const extra of ["Earlier draft: NOT CLEARED", "Status: HELD"]) {
    const dir = dirWith({ "2026-11-20-lws-item-11-cleared.md": `${GOOD}${extra}\n` });
    assert.equal(clearanceNote(dir, NOW).ok, false, extra);
  }
});
test("a clearance note dated in the future blocks it", () => {
  const dir = dirWith({ "2026-12-20-lws-item-11-cleared.md": GOOD });
  assert.equal(clearanceNote(dir, NOW).ok, false);
});
test("a note dated before the 2026-11-01 capture blocks it", () => {
  const dir = dirWith({ "2026-10-30-lws-item-11-cleared.md": GOOD });
  assert.equal(clearanceNote(dir, NOW).ok, false);
});
