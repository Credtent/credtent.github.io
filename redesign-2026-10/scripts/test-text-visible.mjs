// Niven's search constraint (2026-11-10 review, section 6, points 1 and 2): no heading or paragraph starts at
// opacity 0 or hidden by default. "Default" is the page as served, before any script runs: classes that only
// motion.js adds (.motion, .reveal, .in, .is-scrolled) are not in the HTML, so rules scoped to them are exempt, and
// so are hover and focus states. A rule hides text if it sets opacity 0, visibility hidden, or display none (outside
// a media query), or runs an animation whose first frame is opacity 0, on an element that is or contains an h1 to
// h6 or a p in any built page. The check is static (no browser), so it runs in test:gates on Vercel too.
// Run after a build: node --test scripts/test-text-visible.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const JS_ONLY_CLASSES = ["motion", "reveal", "in", "is-scrolled"];
const STATE = /:(hover|focus|focus-visible|focus-within|active|target|checked)\b/;
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr", "path"]);

// ---------- CSS: a small parser that keeps the at-rule context of each rule ----------
export function parseCss(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [];
  const keyframes = new Map();
  function walk(text, context) {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf("{", i);
      if (open < 0) break;
      const prelude = text.slice(i, open).trim();
      let depth = 1, j = open + 1;
      while (j < text.length && depth) { if (text[j] === "{") depth++; else if (text[j] === "}") depth--; j++; }
      const body = text.slice(open + 1, j - 1);
      if (prelude.startsWith("@keyframes")) keyframes.set(prelude.split(/\s+/)[1], body);
      else if (prelude.startsWith("@")) walk(body, [...context, prelude]);
      else rules.push({ selectors: splitSelectors(prelude), decls: body, context });
      i = j;
    }
  }
  walk(css, []);
  return { rules, keyframes };
}

function splitSelectors(list) {
  const out = []; let depth = 0, cur = "";
  for (const ch of list) {
    if (ch === "(") depth++; else if (ch === ")") depth--;
    if (ch === "," && !depth) { out.push(cur.trim()); cur = ""; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function firstFrameHides(body) {
  const m = body.match(/(?:^|})\s*(from|0%)[^{]*\{([^}]*)\}/);
  return Boolean(m && /opacity\s*:\s*0(?![.\d])/.test(m[2]));
}

export function hidingRules({ rules, keyframes }) {
  const hiding = [];
  for (const rule of rules) {
    const inMedia = rule.context.some((c) => c.startsWith("@media"));
    const reasons = [];
    if (/(^|;)\s*opacity\s*:\s*0(?![.\d])/.test(rule.decls)) reasons.push("opacity 0");
    if (/visibility\s*:\s*hidden/.test(rule.decls)) reasons.push("visibility hidden");
    if (!inMedia && /(^|;)\s*display\s*:\s*none/.test(rule.decls)) reasons.push("display none");
    const anim = rule.decls.match(/animation(?:-name)?\s*:\s*([^;]+)/);
    if (anim && !rule.context.some((c) => /prefers-reduced-motion/.test(c))) {
      for (const name of anim[1].split(",").map((part) => part.trim().split(/\s+/)[0])) {
        if (keyframes.has(name) && firstFrameHides(keyframes.get(name))) reasons.push(`animation ${name} starts at opacity 0`);
      }
    }
    if (!reasons.length) continue;
    for (const selector of rule.selectors) hiding.push({ selector, reasons, context: rule.context });
  }
  return hiding;
}

// The compound selector that names the styled element, or null when the rule cannot apply by default.
export function subject(selector) {
  if (/::?(before|after|placeholder|marker|selection|backdrop)\b/.test(selector)) return null;
  if (STATE.test(selector)) return null;
  const classes = [...selector.replace(/:not\([^)]*\)/g, "").matchAll(/\.([A-Za-z0-9_-]+)/g)].map((m) => m[1]);
  if (classes.some((c) => JS_ONLY_CLASSES.includes(c))) return null;
  if (/\[hidden\]|\[aria-hidden/.test(selector)) return null;
  const parts = selector.replace(/\([^)]*\)/g, "()").split(/\s*[\s>+~]\s*/).filter(Boolean);
  const last = parts[parts.length - 1];
  return {
    tag: (last.match(/^[a-z][a-z0-9]*/) || [null])[0],
    classes: [...last.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((m) => m[1]),
    id: (last.match(/#([A-Za-z0-9_-]+)/) || [null, null])[1]
  };
}

// ---------- HTML: every element, and whether it is or contains a heading or paragraph ----------
export function elements(html) {
  html = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, "");
  const all = [], stack = [];
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g)) {
    const [, close, rawTag, attrs] = m;
    const tag = rawTag.toLowerCase();
    if (close) {
      const at = stack.map((e) => e.tag).lastIndexOf(tag);
      if (at >= 0) stack.length = at;
      continue;
    }
    const cls = (attrs.match(/\bclass="([^"]*)"/) || [, ""])[1].split(/\s+/).filter(Boolean);
    const id = (attrs.match(/\bid="([^"]*)"/) || [, null])[1];
    const role = (attrs.match(/\brole="([^"]*)"/) || [, null])[1];
    const el = { tag, classes: cls, id, role, text: /^(h[1-6]|p)$/.test(tag) };
    if (el.text) for (const anc of stack) anc.text = true;
    all.push(el);
    if (!VOID.has(tag) && !attrs.trim().endsWith("/")) stack.push(el);
  }
  return all;
}

export function matches(el, s) {
  return (!s.tag || s.tag === el.tag) && s.classes.every((c) => el.classes.includes(c)) && (!s.id || s.id === el.id);
}

export function problems(cssText, htmlByFile) {
  const hiding = hidingRules(parseCss(cssText));
  const els = Object.entries(htmlByFile).map(([file, html]) => [file, elements(html)]);
  const out = [];
  for (const rule of hiding) {
    const s = subject(rule.selector);
    if (!s) continue;
    for (const [file, list] of els) {
      // A dialog (role="dialog", such as the badge builder's email gate) is closed until the visitor opens it.
      const hit = list.find((el) => el.text && el.role !== "dialog" && matches(el, s));
      if (hit) { out.push(`${rule.selector} (${rule.reasons.join(", ")}) hides <${hit.tag}> text on ${file}`); break; }
    }
  }
  return out;
}

function builtHtml(id) {
  const dir = path.join(root, "sites", id);
  const out = {};
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p); else if (e.name.endsWith(".html")) out[path.relative(dir, p)] = fs.readFileSync(p, "utf8");
    }
  })(dir);
  return out;
}

test("the checker catches text that starts hidden, and ignores JS-only and hover states", () => {
  const html = { "a.html": '<div class="card"><h3>T</h3></div><p class="lede">x</p><figure class="pc"><img alt=""></figure>' };
  assert.equal(problems(".lede { opacity: 0 }", html).length, 1);
  assert.equal(problems("@keyframes rise { from { opacity: 0 } to { opacity: 1 } } .card { animation: rise 1s both }", html).length, 1);
  assert.equal(problems(".card { display: none }", html).length, 1);
  assert.equal(problems(".motion .reveal { opacity: 0 } .card:hover { opacity: 0 } .pc { opacity: 0 }", html).length, 0);
  assert.equal(problems("@media (max-width: 999px) { .card { display: none } }", html).length, 0);
  assert.equal(problems("@keyframes lift { from { translate: 0 26px } } .lede { animation: lift 1s backwards }", html).length, 0);
});

for (const id of ["com", "org"]) {
  test(`${id}: no heading or paragraph starts at opacity 0 or hidden by default`, () => {
    const dir = path.join(root, "sites", id, "css");
    const css = fs.readdirSync(dir).filter((f) => f.endsWith(".css")).map((f) => fs.readFileSync(path.join(dir, f), "utf8")).join("\n");
    assert.deepEqual(problems(css, builtHtml(id)), []);
  });
}
