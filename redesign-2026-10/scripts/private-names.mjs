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
//   allow: <where> Name   Name may appear at <where> (for example "org/standards/index.html" or "root/standards.html")
//                         as public-market context, never as a customer or partner claim
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const LOCAL_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "review-names.local.txt");

export function loadPrivateNames(env = process.env, localFile = LOCAL_FILE) {
  const src = env.CREDTENT_REVIEW_NAMES || (localFile && fs.existsSync(localFile) ? fs.readFileSync(localFile, "utf8") : "");
  const lines = src.split(/[\n|]/).map((s) => s.trim()).filter((s) => s && !s.startsWith("#"));
  const allow = new Set();
  const names = [];
  const drop = [];
  const block = [];
  for (const line of lines) {
    const m = line.match(/^(allow|drop|block):\s*(.+)$/i);
    if (!m) { names.push(line); continue; }
    const kind = m[1].toLowerCase();
    if (kind === "allow") allow.add(m[2].toLowerCase().replace(/\s+/g, " "));
    else { names.push(m[2]); (kind === "drop" ? drop : block).push(m[2]); }
  }
  return { names, drop, block, allow, missing: names.length === 0 };
}

const NAMED = { amp: "&", nbsp: " ", quot: '"', apos: "'", lt: "<", gt: ">", mdash: "\u2014", ndash: "\u2013", shy: "", dollar: "$",
  rsquo: "\u2019", lsquo: "\u2018", rdquo: "\u201d", ldquo: "\u201c", hellip: "\u2026", zwj: "", zwnj: "", copy: "\u00a9", reg: "\u00ae", trade: "\u2122" };

/** Decode named, decimal and hex entities (with or without the semicolon) and drop invisible characters. */
export function decodeAll(s) {
  let out = String(s);
  for (let i = 0; i < 2; i++) {
    out = out
      .replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);?/g, (_, d) => String.fromCodePoint(Number(d)))
      .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in NAMED ? NAMED[n.toLowerCase()] : m));
  }
  return out.replace(/[\u200b-\u200d\u2060\ufeff\u00ad]/g, "").replace(/\u00a0/g, " ");
}

const esc = (n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+").replace(/&/g, "(?:&|and)");
export function nameRegex(name, flags = "i") { return new RegExp(`(?<![A-Za-z0-9])${esc(name)}(?![A-Za-z0-9])`, flags); }

/** Every view a name could hide in: tags removed with and without a space, string concatenations joined. */
export function nameViews(raw) {
  const decoded = decodeAll(raw);
  const joined = decoded.replace(/["'`]\s*\+\s*["'`]/g, "");
  return [decoded, joined, decoded.replace(/<[^>]*>/g, ""), decoded.replace(/<[^>]*>/g, " ")];
}

/** Names found in raw file content that are not allowed at any of the given locations. Callers never print them. */
export function findNames(raw, wheres, list) {
  const keys = (Array.isArray(wheres) ? wheres : [wheres]).map((w) => w.toLowerCase());
  const views = nameViews(raw);
  const found = [];
  for (const name of list.names) {
    const re = nameRegex(name);
    if (!views.some((v) => re.test(v))) continue;
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
    const re = nameRegex(name);
    const i = lines.findIndex((l) => nameViews(l).some((v) => re.test(v)));
    out.add(i >= 0 ? i + 1 : 0);
  }
  return [...out].sort((a, b) => a - b);
}

export const MISSING_MESSAGE = "private names list missing: set CREDTENT_REVIEW_NAMES or create review-names.local.txt next to private-names.mjs (gitignored). Failing closed.";
