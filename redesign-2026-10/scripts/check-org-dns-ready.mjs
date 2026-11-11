// Legal hold item 11 gate for credtent.org only (Cherryh 2026-11-10, section 5; implementation check item F as amended,
// Amendment 1). The cutover replaces the live /lws page, which lives on credtent.org, so:
//   - the credtent.org production build (npm run check:production:org) requires the committed, redacted copy
//     launch/lws-item-11-clearance.md, and checks its format and date (--build);
//   - the runbook's DNS step 7 (npm run check:org-dns, run locally) also recomputes the sha256 of Cherryh's original
//     in the Claudia repo and blocks if it differs from the copy's.
// credtent.com never runs this. It reads files only. Clarke commits the copy only after Cherryh's original exists.
//   node scripts/check-org-dns-ready.mjs [--build] [path to agents/cherryh]
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_CHERRYH_DIR = "/Users/ericburgess/claudia/agents/cherryh";
export const DEFAULT_COPY = path.resolve(import.meta.dirname, "..", "launch", "lws-item-11-clearance.md");
// The LWS capture is dated 2026-11-01; a clearance cannot predate it.
const EARLIEST = "2026-11-01";
const NAME = /^(\d{4}-\d{2}-\d{2})-lws-item-11-cleared\.md$/;
// The original (authoritative, private): these lines at line start, and neither "NOT CLEARED" nor "Status: HELD".
export const REQUIRED_LINES = [
  "Status: CLEARED",
  "Scope: item 11 only",
  "Bucket: credtent-legal-hold-registry-20260926",
  "Listing verified: 11 of 11 hashes equal MANIFEST.txt"
];
// The committed copy (public): exactly these six fields, in this order, and nothing else.
const COPY_FIELDS = [
  ["Status", /^CLEARED$/],
  ["Scope", /^item 11 only$/],
  ["Cleared", /^\d{4}-\d{2}-\d{2}$/],
  ["Original", /^agents\/cherryh\/\d{4}-\d{2}-\d{2}-lws-item-11-cleared\.md$/],
  ["Original sha256", /^[0-9a-f]{64}$/],
  ["Listing verified", /^11 of 11 hashes equal MANIFEST\.txt$/]
];

const inWindow = (date, now) => date >= EARLIEST && date <= now.toISOString().slice(0, 10);

export function clearanceNote(dir = DEFAULT_CHERRYH_DIR, now = new Date()) {
  if (!fs.existsSync(dir)) return { ok: false, reason: `${dir} not found` };
  for (const name of fs.readdirSync(dir).sort().reverse()) {
    const match = name.match(NAME);
    if (!match || !inWindow(match[1], now)) continue;
    const text = fs.readFileSync(path.join(dir, name), "utf8");
    const lines = text.split(/\r?\n/);
    if (!REQUIRED_LINES.every((req) => lines.some((line) => line.startsWith(req)))) continue;
    if (/NOT CLEARED|Status: HELD/.test(text)) continue;
    return { ok: true, note: name, date: match[1] };
  }
  return { ok: false, reason: `no YYYY-MM-DD-lws-item-11-cleared.md dated ${EARLIEST} to today, with ${REQUIRED_LINES.map((l) => `"${l}"`).join(", ")}, in ${dir}` };
}

export function readCopy(file = DEFAULT_COPY) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter((line) => line.trim() !== "");
  return { lines, fields: Object.fromEntries(lines.map((line) => [line.slice(0, line.indexOf(":")), line.slice(line.indexOf(":") + 1).trim()])) };
}

// What the credtent.org Vercel build checks: format, date, Status: CLEARED, no registry details.
export function attestationProblems(file = DEFAULT_COPY, now = new Date()) {
  if (!fs.existsSync(file)) return [`${path.basename(file)} is missing: legal hold item 11 is not cleared (Cherryh writes the original; Clarke commits the redacted copy)`];
  const { lines, fields } = readCopy(file);
  const problems = [];
  if (lines.length !== COPY_FIELDS.length) problems.push(`the copy must hold exactly ${COPY_FIELDS.length} lines, found ${lines.length}`);
  COPY_FIELDS.forEach(([key, re], i) => {
    if (!(lines[i] || "").startsWith(`${key}:`)) problems.push(`line ${i + 1} must be "${key}: ..."`);
    else if (!re.test(fields[key] || "")) problems.push(`"${key}" is malformed`);
  });
  if (fields.Cleared && !inWindow(fields.Cleared, now)) problems.push(`"Cleared" must fall between ${EARLIEST} and today`);
  if (/credtent-legal-hold|637423235393|bucket|account/i.test(lines.join("\n"))) problems.push("the public copy must not name the bucket, the account, or registry details");
  return problems;
}

// What the local DNS step 7 checks: the copy, plus the original exists, meets its contract, and hashes the same.
export function dnsStepProblems(file = DEFAULT_COPY, cherryhDir = DEFAULT_CHERRYH_DIR, now = new Date()) {
  const problems = attestationProblems(file, now);
  if (problems.length) return problems;
  const { fields } = readCopy(file);
  const original = path.join(cherryhDir, path.basename(fields.Original));
  if (!fs.existsSync(original)) return [`the original ${fields.Original} is not in ${cherryhDir}`];
  const note = clearanceNote(cherryhDir, now);
  if (!note.ok || note.note !== path.basename(fields.Original)) return [`the original does not meet its contract: ${note.reason || `latest clearance note is ${note.note}`}`];
  const actual = crypto.createHash("sha256").update(fs.readFileSync(original)).digest("hex");
  if (actual !== fields["Original sha256"]) return [`the original's sha256 is ${actual}, the copy says ${fields["Original sha256"]}: the original changed or the copy is wrong`];
  return [];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const build = process.argv.includes("--build");
  const dir = process.argv.slice(2).find((a) => !a.startsWith("--")) || DEFAULT_CHERRYH_DIR;
  const problems = build ? attestationProblems() : dnsStepProblems(DEFAULT_COPY, dir);
  if (problems.length) {
    console.error(`BLOCKED (${build ? "credtent.org production build" : "credtent.org DNS step"}): ${problems.join("; ")}`);
    process.exit(1);
  }
  console.log(build ? "item 11 attestation present and well formed; the credtent.org build may proceed" : "item 11 cleared and the original matches the copy; the credtent.org DNS step may proceed");
}
