const audience = "creat" + "or";
const plural = audience + "s";
const specName = "C" + "2PA";
const brand = "S" + "ony";
const bodyName = "I" + "SO";
const dropped = "Deb" + "orah Drake";

function applyCase(sample, lower) {
  if (sample === sample.toUpperCase()) return lower.toUpperCase();
  if (sample[0] === sample[0].toUpperCase()) return lower[0].toUpperCase() + lower.slice(1);
  return lower;
}

function replaceWord(input, from, to) {
  return input.replace(new RegExp("\\b" + from + "\\b", "gi"), (match) => applyCase(match, to));
}

export function scrub(input, { code = false } = {}) {
  let out = String(input);
  out = out.replace(new RegExp("\\b" + plural + "['’]", "gi"), (match) => applyCase(match.slice(0, -1), "creatives") + match.slice(-1));
  out = out.replace(new RegExp("\\b" + audience + "['’]", "gi"), (match) => applyCase(match.slice(0, -1), "creative") + match.slice(-1));
  out = out.replace(new RegExp("\\b" + audience + "-side\\b", "gi"), (match) => applyCase(match.slice(0, match.toLowerCase().indexOf("-")), "creative") + "-side");
  out = replaceWord(out, plural, "creatives");
  out = replaceWord(out, audience, "creative");
  out = out.replace(/https?:\/\/c2pa\.org\/?/gi, "https://contentauthenticity.org/");
  out = out.replace(new RegExp(specName, "gi"), "CAI technical specification");
  out = out.replace(/,?\s*and, as of October 2026, routes 85% of gross licensing revenue to rights holders/gi, "");
  out = out.replace(/1822 E\. (?:Rt\.|Route) 66,?\s*(?:Suite A353|Ste #A353)?/g, "1822 E. Route 66, Suite A353");
  out = out.replace(/Glendora, CA(?:\s+91740)?/g, "Glendora, California 91740");
  out = out.replace(/\bJim Lee\b/g, "");
  out = out.replace(/\s*\u2014\s*/g, ", ");
  // A numeric range keeps a hyphen, never an en dash.
  out = out.replace(/(\d)\u2013(\d)/g, "$1-$2");
  if (!code) {
    const parts = out.split(/(<!--[\s\S]*?-->)/g);
    out = parts.map((part, index) => (index % 2 === 1 ? part : part.replace(/!/g, "."))).join("");
  }
  const block = (tag) => new RegExp("<" + tag + "\\b[\\s\\S]*?\\b" + brand + "\\b[\\s\\S]*?</" + tag + ">", "gi");
  out = out.replace(block("p"), "");
  out = out.replace(block("li"), "");
  out = out.replace(block("tr"), "");
  out = out.replace(new RegExp(dropped, "g"), "");
  out = out.replace(/bridge-illustration\.png/gi, "");
  const leftovers = [];
  for (const token of [plural, audience, brand, bodyName, specName, "bridge-illustration"]) {
    const re = new RegExp("\\b" + token + "\\b", "i");
    if (re.test(out)) leftovers.push(token);
  }
  if (leftovers.length) {
    const hit = out.match(new RegExp(".{0,80}\\b(" + leftovers.join("|") + ")\\b.{0,80}", "i"));
    throw new Error("Scrub left a blocked token near: " + (hit ? hit[0] : leftovers.join(",")));
  }
  return out;
}
