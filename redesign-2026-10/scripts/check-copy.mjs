import fs from "node:fs";
import path from "node:path";
import { loadPrivateNames, findNames, nameLines, decodeAll, redactLine, binaryText, MISSING_MESSAGE } from "./private-names.mjs";
import { isBinary, readText, EM_DASH } from "./text-files.mjs";
import { audienceWordOutsideCharter } from "./charter-quote.mjs";

const root = path.resolve(import.meta.dirname, "..");
const roots = [path.join(root, "src"), path.join(root, "sites")];

const audience = "creat" + "ors?";
const specName = "c" + "2pa";
const patterns = [
  { name: "audience-word", re: new RegExp("\\b" + audience + "\\b", "i") },
  { name: "locked-spec", re: new RegExp("\\b" + specName + "\\b", "i") },
  { name: "retired-illustration", re: /bridge-illustration/i },
  { name: "address-placeholder", re: /Street address TBC/i },
  { name: "dropped-face", re: /IBM Plex|Playfair Display|Nunito Sans|--font-mono/i },
  { name: "advisory-council", re: /Advisory Council/i },
  // EB rulings 2026-10-31 and LD-049: Credtent relays and records opt-outs and never enforces them;
  // audits are periodic and come with Opt-Out Premium; the $249 rights-holder price is superseded.
  { name: "barred-249", re: /US\$249|\$249\b|"249"/ },
  { name: "monthly-audit", re: /monthly\s+(premium\s+)?(audit|auditing|observation)/i },
  { name: "continuous-audit", re: /continuous(ly)?\s+(audit|auditing|monitor)/i },
  { name: "opt-out-enforcement", re: /enforc\w*\s+(your\s+|the\s+|an\s+)?opt-?outs?|opt-?outs?\s+enforcement/i },
  { name: "round-the-clock", re: /24\/7|around-the-clock/i },
  { name: "compliance-monitoring", re: /compliance\s+monitoring|track(s|ing)?\s+compliance/i },
  { name: "bylaw-claim", re: /bylaw|acquisition-proof/i },
  { name: "product-name", re: /Credtent Aegis/i }
];

// Claims removed on Vonnegut's 2026-11-10 review (EB card "Apply", 2026-11-10). They are checked on the built
// sites only: build.mjs keeps the exact old sentences in its page-edit table so it can fail loudly when a legacy
// page changes, and that table is not served.
const retiredClaims = [
  { name: "retired-sports-tokens", re: /800B\+|Structured sports tokens/i },
  { name: "retired-healthcare-count", re: /135K\+|Healthcare articles/i },
  { name: "retired-deal-speed", re: /most deals close/i },
  { name: "retired-founding-date", re: /foundingDate/ },
  { name: "retired-ag-alignment", re: /aligning with the Authors Guild|converged on the same definitional ground/i }
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      walk(full, out);
    } else out.push(full);
  }
  return out;
}

const failures = [];
// Every non-binary file is text to check, whatever its extension (Vercel serves them all). Read once, as a browser would.
const texts = new Map();
for (const file of roots.flatMap((dir) => walk(dir))) {
  const buf = fs.readFileSync(file);
  if (isBinary(file, buf)) continue;
  const { text, nul } = readText(buf);
  if (nul) failures.push(`${path.relative(root, file)}:0 [nul-byte-in-text]`);
  texts.set(file, text);
}
// The current terms are served verbatim on /terms-of-service until the swap (EB 2026-11-01). check-launch proves
// that block equals the live terms-of-service.html, so the copy rules skip it; line numbers are kept.
const VERBATIM = /<!--legal:current-terms:start-->[\s\S]*?<!--legal:current-terms:end-->/g;
for (const [file, original] of texts) {
  let text = original;
  if (VERBATIM.test(text)) {
    VERBATIM.lastIndex = 0;
    if (!/sites\/(com|org)\/terms-of-service\/index\.html$/.test(file.split(path.sep).join("/"))) failures.push(`${path.relative(root, file)} [verbatim-block] current-terms block outside /terms-of-service`);
    else text = text.replace(VERBATIM, (block) => block.replace(/[^\n]/g, ""));
  }
  VERBATIM.lastIndex = 0;
  const lines = text.split(/\n/);
  lines.forEach((line, index) => {
    const decoded = decodeAll(line);
    for (const pattern of patterns) {
      if (!pattern.re.test(line) && !pattern.re.test(decoded)) continue;
      // The only allowance is the exact charter phrase (charter-quote.mjs).
      if (pattern.name === "audience-word" && !audienceWordOutsideCharter(line)) continue;
      // File, line and rule only: page text is never printed, so no name can reach a log.
      failures.push(`${path.relative(root, file)}:${index + 1} [${pattern.name}]`);
    }
    if (!/^sites\//.test(path.relative(root, file).split(path.sep).join("/"))) return;
    for (const claim of retiredClaims) {
      if (claim.re.test(line) || claim.re.test(decoded)) failures.push(`${path.relative(root, file)}:${index + 1} [${claim.name}]`);
    }
  });
}

// Names stay out of this public repo: they come from the private list (scripts/private-names.mjs), fail closed.
const privateNames = loadPrivateNames();
if (privateNames.missing) failures.push(MISSING_MESSAGE);
for (const file of roots.flatMap((dir) => walk(dir))) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  // A file or folder name is published too (it is the URL).
  if (!privateNames.missing && findNames(rel, [rel.replace(/^sites\//, "")], privateNames).length) failures.push(`${rel}:0 [private-name-in-path]`);
  if (!texts.has(file)) {
    // Text runs inside a binary (PDF text, XMP and EXIF strings); entries under five letters are skipped here.
    if (!privateNames.missing && findNames(binaryText(fs.readFileSync(file)), [rel.replace(/^sites\//, "")], privateNames, { compactMatch: false, minLength: 5 }).length) failures.push(`${rel}:0 [private-name-in-binary]`);
    continue;
  }
  const raw = texts.get(file);
  const found = privateNames.missing ? [] : findNames(raw, [rel.replace(/^sites\//, "")], privateNames);
  for (const line of found.length ? nameLines(raw, privateNames, found) : []) failures.push(`${rel}:${line} [private-name]`);
}

for (const file of [...texts.keys()].filter((item) => /^sites\//.test(path.relative(root, item).split(path.sep).join("/")) && /\.html?$/i.test(item))) {
  const text = texts.get(file)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "");
  if (EM_DASH.test(text) || text.includes("!")) {
    failures.push(`${path.relative(root, file)} [copy-punctuation] em dash or exclamation in page text`);
  }
}

if (failures.length) {
  // Never print a path or token that names a listed entry: it becomes a short hash.
  console.error(failures.slice(0, 80).map((f) => redactLine(f, privateNames)).join("\n"));
  console.error(`\n${failures.length} copy check failure(s).`);
  process.exit(1);
}
console.log("copy check passed");
