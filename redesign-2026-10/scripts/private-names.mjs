// Names that must not appear on the public sites (counterparties, prospects, accounts without public
// clearance). The list is NOT stored in this public repository. It comes from the CREDTENT_REVIEW_NAMES
// environment variable (names separated by newlines or "|"), or from the gitignored file
// scripts/review-names.local.txt. Lines starting with "allow:" pair a page with a name that may appear there
// as public-market context, for example "allow: org/standards/index.html <name>". The gates fail closed:
// with no list, every check that needs it fails.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LOCAL = path.join(path.dirname(fileURLToPath(import.meta.url)), "review-names.local.txt");

export function loadPrivateNames(env = process.env) {
  const src = env.CREDTENT_REVIEW_NAMES || (fs.existsSync(LOCAL) ? fs.readFileSync(LOCAL, "utf8") : "");
  const lines = src.split(/[\n|]/).map((s) => s.trim()).filter((s) => s && !s.startsWith("#"));
  const allow = new Set(lines.filter((l) => /^allow:/i.test(l)).map((l) => l.replace(/^allow:\s*/i, "").toLowerCase()));
  const names = lines.filter((l) => !/^allow:/i.test(l));
  return { names, allow, missing: names.length === 0 };
}

const esc = (n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+").replace(/&/g, "(?:&|&amp;|and)");

/** Every listed name found in text, minus allowed pairs for this location. Names are not echoed by callers. */
export function findNames(text, where, list) {
  const found = [];
  for (const name of list.names) {
    if (new RegExp(`\\b${esc(name)}\\b`, "i").test(text) && !list.allow.has(`${where} ${name}`.toLowerCase())) found.push(name);
  }
  return found;
}

export const MISSING_MESSAGE = "private names list missing: set CREDTENT_REVIEW_NAMES or create scripts/review-names.local.txt (gitignored). Failing closed.";
