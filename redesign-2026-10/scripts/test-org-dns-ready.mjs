// Tests for the credtent.org DNS gate (legal hold item 11). Run: node --test scripts/test-org-dns-ready.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { clearanceNote } from "./check-org-dns-ready.mjs";

const NOW = new Date("2026-12-01T12:00:00Z");
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
test("a dated item-11 clearance note allows it", () => {
  const dir = dirWith({ "2026-11-20-item-11-lws-clearance.md": "Legal hold item 11 is cleared as of 2026-11-20." });
  const r = clearanceNote(dir, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.note, "2026-11-20-item-11-lws-clearance.md");
});
test("a clearance note dated in the future blocks it", () => {
  const dir = dirWith({ "2026-12-20-item-11-lws-clearance.md": "Legal hold item 11 is cleared." });
  assert.equal(clearanceNote(dir, NOW).ok, false);
});
test("a clearance-named note whose text says not cleared blocks it", () => {
  const dir = dirWith({ "2026-11-20-item-11-clearance.md": "Item 11 is not cleared yet; the upload is missing." });
  assert.equal(clearanceNote(dir, NOW).ok, false);
});
test("a note dated before the 2026-11-01 capture blocks it", () => {
  const dir = dirWith({ "2026-10-30-item-11-clearance.md": "Item 11 is cleared." });
  assert.equal(clearanceNote(dir, NOW).ok, false);
});
