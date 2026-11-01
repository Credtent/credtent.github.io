// node --test scripts/test-phone.mjs
// Phone-width regressions found on the 2026-10-29 previews. Reads the committed build in sites/.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const css = fs.readFileSync(path.join(ROOT, "src/styles/site.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const page = (site, rel) => fs.readFileSync(path.join(ROOT, "sites", site, rel), "utf8");

// The last rule in the file that matches the selector wins at phone width, so read every match.
function rulesFor(selector) {
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    if (m[1].split(",").map((s) => s.trim()).includes(selector)) out.push(m[2]);
  }
  return out.join(";");
}

test("brand badge art inside cards is shown whole at a fixed 96px, never cover-cropped", () => {
  const rule = rulesFor('.card img[src^="/brand/"]');
  assert.match(rule, /object-fit:\s*contain/);
  assert.match(rule, /width:\s*96px/);
  assert.match(rule, /height:\s*96px/);
});

test("standalone links, FAQ rows, and form checkboxes get a 44px touch target", () => {
  assert.match(rulesFor(".faq-list summary"), /min-height:\s*44px/);
  assert.match(rulesFor("main p > a:only-child"), /min-height:\s*44px/);
  assert.match(rulesFor(".form input[type=\"checkbox\"]"), /width:\s*24px/);
  assert.match(rulesFor(".skip-link"), /min-height:\s*44px/);
});

test("photo credit text is readable and its links have a taller hit area", () => {
  const rule = rulesFor("figcaption.credit");
  const size = Number((rule.match(/font-size:\s*(\d+)px/g) || []).pop()?.match(/\d+/)[0]);
  assert.ok(size >= 12, `credit font-size is ${size}px`);
  assert.match(rulesFor("figcaption.credit a"), /padding-block:\s*1[0-9]px/);
});

test("the photo credits page lists credits without stray figcaption tags", () => {
  for (const site of ["org", "com"]) {
    const html = page(site, "credits/index.html");
    assert.doesNotMatch(html, /<li><strong>[^<]*<\/strong> <figcaption/, `${site} credits page`);
  }
});

test("Abigail Cameron has a real headshot; a remaining placeholder is decorative, not labelled as a photo", () => {
  const about = page("com", "about/index.html");
  assert.doesNotMatch(about, /placeholder-ac\.svg/);
  assert.match(about, /\/media\/abigail-640\.webp/);
  const ea = about.match(/<img src="\/media\/placeholder-ea\.svg"[^>]*>/);
  if (ea) assert.match(ea[0], /alt=""/);
});
