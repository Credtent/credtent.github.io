// Every photo a built page shows is credited on that site's /credits page and in credits.json.
// Run after a build: node --test scripts/test-credits.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PHOTOS } from "./assets.mjs";

const root = path.resolve(import.meta.dirname, "..");

function htmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

for (const id of ["com", "org"]) {
  test(`${id}: every photo shown on a page is in credits.json and on /credits`, () => {
    const dir = path.join(root, "sites", id);
    const credits = JSON.parse(fs.readFileSync(path.join(dir, "credits.json"), "utf8")).photos;
    const creditsPage = fs.readFileSync(path.join(dir, "credits", "index.html"), "utf8");
    const used = new Set();
    for (const file of htmlFiles(dir)) {
      for (const m of fs.readFileSync(file, "utf8").matchAll(/\/media\/([A-Za-z-]+?)-\d+\.(?:avif|webp)/g)) used.add(m[1]);
    }
    assert.ok(used.size, "no photos found");
    for (const base of used) {
      const photo = PHOTOS.find((p) => (p.out || p.key) === base);
      assert.ok(photo, `${base} is not in scripts/assets.mjs`);
      assert.ok(credits.some((c) => c.alt === photo.alt && c.credit === photo.credit), `${id}/credits.json is missing ${base} (${photo.credit})`);
      assert.ok(creditsPage.includes(photo.credit.replace(/&/g, "&amp;")), `${id}/credits page is missing ${photo.credit}`);
    }
  });
}
