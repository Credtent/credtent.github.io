const audience = "creat" + "or";
const plural = audience + "s";
const specName = "C" + "2PA";
// Names come from the private list (scripts/private-names.mjs); none are written in this public file.
// "drop:" entries lose any paragraph, list item or table row naming them; "block:" entries stop the build.
import { loadPrivateNames, MISSING_MESSAGE } from "./private-names.mjs";
const NAMES = loadPrivateNames();
const reName = (n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function applyCase(sample, lower) {
  if (sample === sample.toUpperCase()) return lower.toUpperCase();
  if (sample[0] === sample[0].toUpperCase()) return lower[0].toUpperCase() + lower.slice(1);
  return lower;
}

function replaceWord(input, from, to) {
  return input.replace(new RegExp("\\b" + from + "\\b", "gi"), (match) => applyCase(match, to));
}

// Each match is one element: it starts at the last opening tag before the name and never crosses that
// element's closing tag, so a drop cannot swallow the markup between an earlier element and the name.
export function dropBlocks(html, names) {
  let out = String(html);
  for (const name of names) {
    for (const tag of ["p", "li", "tr"]) {
      const re = new RegExp("<" + tag + "\\b[^>]*>(?:(?!<" + tag + "\\b|</" + tag + ">)[\\s\\S])*?\\b" + reName(name) + "\\b[\\s\\S]*?</" + tag + ">", "gi");
      out = out.replace(re, "");
    }
  }
  return out;
}

export function scrub(input, { code = false } = {}) {
  if (NAMES.missing) throw new Error(MISSING_MESSAGE);
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
  out = out.replace(/\s*\u2014\s*/g, ", ");
  // A numeric range keeps a hyphen, never an en dash.
  out = out.replace(/(\d)\u2013(\d)/g, "$1-$2");
  if (!code) {
    const parts = out.split(/(<!--[\s\S]*?-->)/g);
    out = parts.map((part, index) => (index % 2 === 1 ? part : part.replace(/!/g, "."))).join("");
  }
  out = dropBlocks(out, NAMES.drop);
  for (const name of NAMES.strip) out = out.replace(new RegExp("\\b" + reName(name) + "\\b", "g"), "");
  out = out.replace(/bridge-illustration\.png/gi, "");
  const leftovers = [];
  for (const token of [plural, audience, specName, "bridge-illustration"]) {
    const re = new RegExp("\\b" + token + "\\b", "i");
    if (re.test(out)) leftovers.push(token);
  }
  if (leftovers.length) {
    // The token only, never the page text around it (which could carry a name into a build log).
    throw new Error("Scrub left a blocked token: " + leftovers.join(","));
  }
  // A private-list name left after scrubbing stops the build; the message never names it.
  if ([...NAMES.drop, ...NAMES.block].some((n) => new RegExp("\\b" + reName(n) + "\\b", "i").test(out))) {
    throw new Error("Scrub left a name from the private list (withheld)");
  }
  return out;
}
