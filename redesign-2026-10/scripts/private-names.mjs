// Names that must not appear on the public sites (counterparties, prospects, accounts without public
// clearance, and the brand and standards-body names the build drops). The list is NOT stored in this public
// repository. It comes from the CREDTENT_REVIEW_NAMES environment variable (entries separated by newlines or
// "|"), or from the gitignored file review-names.local.txt next to this module. Every gate fails closed
// without it, and no gate ever prints a matched name: failures show the file, line and rule only.
//
// Entry forms (one per line):
//   Name                  a name the gates fail on
//   drop: Name            also a name; the redesign build removes any paragraph, list item or table row naming it
//   block: Name           also a name; the redesign build stops if any page it builds still names it
//   strip: Name           also a name; the redesign build deletes the text wherever it appears (former team names)
//   allow: <where> Name   Name may appear at <where> (for example "org/standards/index.html" or "root/standards.html"):
//                         public-market context, or an account EB has cleared by name on public pages
//                         (/Users/ericburgess/claudia/context/credtent-accounts-canonical.md is the record)
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// A list shorter than this is treated as missing (a stale or truncated secret must not pass as present).
export const MIN_ENTRIES = 10;
export const LOCAL_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "review-names.local.txt");

export function loadPrivateNames(env = process.env, localFile = LOCAL_FILE) {
  // In CI only the secret counts: a local file there would come from the pull request itself.
  const useLocal = !env.CI && localFile && fs.existsSync(localFile);
  const src = env.CREDTENT_REVIEW_NAMES || (useLocal ? fs.readFileSync(localFile, "utf8") : "");
  const lines = src.split(/[\n|]/).map((s) => s.trim()).filter((s) => s && !s.startsWith("#"));
  const allow = new Set();
  const names = [];
  const drop = [];
  const block = [];
  const strip = [];
  for (const line of lines) {
    const m = line.match(/^(allow|drop|block|strip):\s*(.+)$/i);
    if (!m) { names.push(line); continue; }
    const kind = m[1].toLowerCase();
    if (kind === "allow") allow.add(m[2].toLowerCase().replace(/\s+/g, " "));
    else { names.push(m[2]); ({ drop, block, strip })[kind].push(m[2]); }
  }
  const unique = [...new Set(names.map((n) => n.toLowerCase().replace(/\s+/g, " ")))];
  return { names, drop, block, strip, allow, missing: unique.length < MIN_ENTRIES };
}

// HTML5 named entities that matter for text, including the legacy forms browsers accept without a semicolon.
const NAMED = { amp: "&", nbsp: " ", quot: '"', apos: "'", lt: "<", gt: ">", mdash: "—", ndash: "–", shy: "", dollar: "$",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…", zwj: "", zwnj: "", copy: "©", reg: "®",
  trade: "™", ensp: " ", emsp: " ", thinsp: " ", hairsp: " ", numsp: " ", puncsp: " ", emsp13: " ", emsp14: " ", nbspace: " ",
  zerowidthspace: "", nobreak: "", invisibletimes: "", invisiblecomma: "", invisibleplus: "", applyfunction: "", lrm: "", rlm: "",
  hyphen: "-", dash: "-", minus: "-", period: ".", comma: ",", colon: ":", semi: ";", excl: "!", quest: "?", num: "#", percnt: "%",
  lpar: "(", rpar: ")", lowbar: "_", sol: "/", bsol: "\\", plus: "+", equals: "=", commat: "@", verbar: "|", grave: "`", acute: "´",
  middot: "·", bull: "•", lsaquo: "‹", rsaquo: "›", laquo: "«", raquo: "»" };
const LEGACY = /&(amp|nbsp|lt|gt|quot|copy|reg|shy)(?!;)/gi;
// Common Cyrillic and Greek letters that render like Latin ones.
const HOMOGLYPHS = { "А": "A", "В": "B", "Е": "E", "К": "K", "М": "M", "Н": "H", "О": "O", "Р": "P",
  "С": "C", "Т": "T", "Х": "X", "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y",
  "х": "x", "і": "i", "ј": "j", "ѕ": "s", "Ι": "I", "Ο": "O", "Α": "A", "Β": "B", "Ε": "E",
  "Ζ": "Z", "Η": "H", "Κ": "K", "Μ": "M", "Ν": "N", "Ρ": "P", "Τ": "T", "Χ": "X", "Υ": "Y",
  "ο": "o", "ν": "v", "Α": "A",
  "\u03b1": "a", "\u03b5": "e", "\u03b9": "i", "\u03ba": "k", "\u03c1": "p", "\u03c4": "t", "\u03c5": "u", "\u03c7": "x", "\u0251": "a", "\u0501": "d", "\u04bb": "h", "\u04cf": "l", "\u0131": "i", "\u0405": "S", "\u0406": "I", "\u0408": "J", "\u04ae": "Y", "\u0432": "b", "\u043a": "k", "\u043c": "m", "\u043d": "h", "\u0442": "t", "\u0457": "i", "\u0454": "e", "\u0261": "g", "\u026a": "i", "\u1d0f": "o", "\u1d1c": "u" };

/** Decode named (full text set, legacy forms without ";"), decimal and hex entities, three passes. */
export function decodeAll(s) {
  let out = String(s);
  for (let i = 0; i < 3; i++) {
    out = out
      .replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCodePoint(Math.min(parseInt(h, 16), 0x10ffff)))
      .replace(/&#(\d+);?/g, (_, d) => String.fromCodePoint(Math.min(Number(d), 0x10ffff)))
      .replace(/&([a-z][a-z0-9]*);/gi, (m, n) => (n.toLowerCase() in NAMED ? NAMED[n.toLowerCase()] : m))
      .replace(LEGACY, (m, n) => NAMED[n.toLowerCase()]);
  }
  return out.replace(/[​-‍⁠﻿­]/g, "").replace(/ /g, " ");
}

/** Everything a browser or a search engine resolves before display, folded so look-alike forms compare equal. */
export function normalizeText(s) {
  let out = decodeAll(s);
  // Percent-encoding (links, data: URIs), JS and CSS escapes, and String.fromCharCode.
  out = out.replace(/(?:%[0-9a-f]{2})+/gi, (m) => { try { return decodeURIComponent(m); } catch { return m; } });
  out = out.replace(/\\u\{([0-9a-f]+)\}|\\u([0-9a-f]{4})|\\x([0-9a-f]{2})/gi, (_, a, b, c) => String.fromCodePoint(parseInt(a || b || c, 16)));
  out = out.replace(/\\([0-9a-f]{1,6}) ?/gi, (_, h) => String.fromCodePoint(Math.min(parseInt(h, 16), 0x10ffff)));
  out = out.replace(/String\.from(?:CharCode|CodePoint)\(([\dxa-f\s,]+)\)/gi, (_, list) => `'${list.split(",").map((n) => String.fromCodePoint(Number(n.trim()))).join("")}'`);
  out = out.replace(/atob\(\s*["'`]([A-Za-z0-9+/=\s]+)["'`]\s*\)/g, (m, b) => { try { return `'${Buffer.from(b.replace(/\s+/g, ""), "base64").toString("utf8")}'`; } catch { return m; } });
  out = out.replace(/["'`]([^"'`]*)["'`]\.split\(\s*["'`]{2}\s*\)\.reverse\(\)\.join\(\s*["'`]{2}\s*\)/g, (_, t) => `'${[...t].reverse().join("")}'`);
  out = out.replace(/["'`]\.concat\(\s*["'`]/g, "");
  out = out.normalize("NFKC").normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  out = out.replace(/\p{Cf}/gu, "");
  out = [...out].map((ch) => HOMOGLYPHS[ch] || ch).join("");
  out = out.replace(/[‘’ʼ′`´]/g, "'").replace(/[‐-―−]/g, "-");
  return out.replace(/[\s\p{Zs}]+/gu, " ");
}

const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const esc = (n) => normalizeText(n).trim().split(/\s+(?:and|&)\s+|\s*&\s*/i).map((part) => reEsc(part).replace(/\s+/g, "[\\s\\-_.+/]*").replace(/'/g, "'?")).join("\\s*(?:&|and)\\s*");
export function nameRegex(name, flags = "i") { return new RegExp(`(?<![A-Za-z0-9])${esc(name)}(?:'s)?(?![A-Za-z0-9])`, flags); }
const compact = (s) => normalizeText(s).toLowerCase().replace(/[^a-z0-9]/g, "");

// Tags removed without splitting on a ">" inside a quoted attribute; comments removed first.
const TAG = /<(?:[^>"']|"[^"]*"|'[^']*')*>/g;
const stripTags = (s, sep) => s.replace(/<!--[\s\S]*?-->/g, sep).replace(TAG, sep);
// Literal joins in JS, CSS and Liquid: 'a' + 'b', ['a','b'].join(''), `${'a'}b`, 'a' 'b', "a" | append: "b".
const joinLiterals = (s) => s
  .replace(/(["'])([^"']*)\1\s*\|\s*prepend:\s*(["'])([^"']*)\3/g, "'$4$2'")
  .replace(/["'`]\s*\+\s*["'`]/g, "").replace(/["']\s*,\s*["']/g, "").replace(/\$\{\s*["']([^"']*)["']\s*\}/g, "$1")
  .replace(/(["'])\s+\1/g, "").replace(/["']\s*\|\s*(?:append|prepend):\s*["']/g, "");

/** Every view a name could hide in. */
export function nameViews(raw) {
  const base = normalizeText(raw);
  const views = [base, joinLiterals(base), stripTags(base, ""), stripTags(base, " ")];
  // data: URIs carry their own markup (an SVG <text>, for example); decode and add them.
  for (const m of base.matchAll(/data:[^,"')]*;base64,([A-Za-z0-9+/=\s]+)/g)) {
    try { const inner = normalizeText(Buffer.from(m[1].replace(/\s+/g, ""), "base64").toString("utf8")); views.push(inner, stripTags(inner, "")); } catch { /* not text */ }
  }
  views.push(stripTags(joinLiterals(base), " ").replace(/[-_+./]+/g, " "));
  return views;
}

/** Names found in raw file content that are not allowed at any of the given locations. Callers never print them. */
export function findNames(raw, wheres, list) {
  const keys = (Array.isArray(wheres) ? wheres : [wheres]).map((w) => w.toLowerCase());
  const views = nameViews(raw);
  const flat = compact(stripTags(joinLiterals(normalizeText(raw)), " "));
  const found = [];
  for (const name of list.names) {
    const re = nameRegex(name);
    const c = compact(name);
    // The compact match (all separators removed) catches slugs and run-together forms; it is used only for
    // names long enough that a stray substring is unlikely.
    if (!views.some((v) => re.test(v)) && !(c.length >= 7 && flat.includes(c))) continue;
    if (keys.some((k) => list.allow.has(`${k} ${name}`.toLowerCase().replace(/\s+/g, " ")))) continue;
    found.push(name);
  }
  return found;
}

/** 1-based line numbers of the first hit for each found name, so callers can report a line without the name. */
export function nameLines(raw, list, names) {
  const lines = String(raw).split("\n");
  const out = new Set();
  for (const name of names) {
    const one = { names: [name], allow: new Set() };
    const i = lines.findIndex((l) => findNames(l, [], one).length > 0);
    out.add(i >= 0 ? i + 1 : 0);
  }
  return [...out].sort((a, b) => a - b);
}

export const MISSING_MESSAGE = "private names list missing: set CREDTENT_REVIEW_NAMES or create review-names.local.txt next to private-names.mjs (gitignored). Failing closed.";

/** A location string safe for a public log: unchanged unless it contains a listed name, else a short hash. */
export function redact(text, list) {
  if (!list || list.missing || !findNames(String(text), [], { ...list, allow: new Set() }).length) return String(text);
  return `[redacted:${crypto.createHash("sha256").update(String(text)).digest("hex").slice(0, 12)}]`;
}
/** A failure line safe for a public log: any word that names a listed entry becomes a short hash. */
export function redactLine(line, list) {
  // Keep a trailing ":<line>:" so the rule and line number stay readable after the path is hashed.
  return String(line).split(/(\s+)/).map((part) => {
    if (/\s/.test(part)) return part;
    const m = part.match(/^(.*?)(:\d+:?)$/);
    return m && m[1] ? redact(m[1], list) + m[2] : redact(part, list);
  }).join("");
}
