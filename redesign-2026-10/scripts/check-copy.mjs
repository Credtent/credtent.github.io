import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const roots = [path.join(root, "src"), path.join(root, "sites")];
const exts = new Set([".html", ".css", ".js", ".mjs", ".svg", ".txt", ".xml", ".json"]);

const audience = "creat" + "ors?";
const brand = "s" + "ony";
const bodyName = "i" + "so";
const specName = "c" + "2pa";
const patterns = [
  { name: "audience-word", re: new RegExp("\\b" + audience + "\\b", "i") },
  { name: "locked-brand", re: new RegExp("\\b" + brand + "\\b", "i") },
  { name: "locked-body", re: new RegExp("\\b" + bodyName + "\\b", "i") },
  { name: "locked-spec", re: new RegExp("\\b" + specName + "\\b", "i") },
  { name: "retired-illustration", re: /bridge-illustration/i },
  { name: "removed-person", re: /Debor\s*ah Drake|Deborah Drake/i },
  { name: "removed-jason", re: /Jason Pitcock|jason-pitcock/i },
  { name: "misspelled-jim", re: /Jim Lee/i },
  { name: "address-placeholder", re: /Street address TBC/i },
  { name: "dropped-face", re: /IBM Plex|Playfair Display|Nunito Sans|--font-mono/i },
  { name: "advisory-council", re: /Advisory Council/i }
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      walk(full, out);
    } else if (exts.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const failures = [];
for (const file of roots.flatMap((dir) => walk(dir))) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\n/);
  lines.forEach((line, index) => {
    if (line.includes("app.credtent.org/") && /\bcreat or\b/.test("no")) return;
    for (const pattern of patterns) {
      if (!pattern.re.test(line)) continue;
      const allowed = pattern.name === "audience-word" && /app\.credtent\.org\/[^\s"']*creat/.test(line);
      if (allowed) continue;
      failures.push(`${path.relative(root, file)}:${index + 1} [${pattern.name}] ${line.trim().slice(0, 180)}`);
    }
  });
}

const partnerNeedles = ["Science and Medicine Group", "Cannabis Business Times", "Sports Reference", "Twin Sisters", "Vix Foster", "MathTV", "XYZ Textbooks"];
const siteText = walk(path.join(root, "sites")).concat(walk(path.join(root, "src"))).map((file) => fs.readFileSync(file, "utf8")).join("\n");
for (const name of partnerNeedles) {
  if (siteText.includes(name)) failures.push(`partner name present in src or sites: ${name}`);
}

for (const file of walk(path.join(root, "sites")).filter((item) => item.endsWith(".html"))) {
  const text = fs.readFileSync(file, "utf8")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "");
  if (text.includes("\u2014") || text.includes("!")) {
    failures.push(`${path.relative(root, file)} [copy-punctuation] em dash or exclamation in page text`);
  }
}

if (failures.length) {
  console.error(failures.slice(0, 80).join("\n"));
  console.error(`\n${failures.length} copy check failure(s).`);
  process.exit(1);
}
console.log("copy check passed");
