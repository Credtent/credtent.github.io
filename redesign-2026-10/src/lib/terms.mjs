// Terms of service at launch (EB decision cards, 2026-11-01 evening).
//
// Before the swap, /terms-of-service on both sites serves the CURRENT terms (effective May 27, 2025)
// verbatim from the repo's terms-of-service.html, which is the page live on credtent.org. Only link
// targets are rewritten for the new hosts; the text is not touched (no scrub). Cherryh's revised terms
// (EB-approved 2026-11-01) are served at /terms-of-service/upcoming: noindex, out of the sitemap and
// llms.txt, and linked from nowhere.
//
// Three recorded settings drive the swap:
// - TERMS_NOTICE_SENT: the date (YYYY-MM-DD) the section 12 notice email went out.
// - REVISED_TERMS_DATE: the effective date as it reads on the page (for example "December 15, 2026").
//   It must be at least 30 days after the notice. Once set, the upcoming page shows it instead of the placeholder.
// - TERMS_SWAP: true only on or after that date. The revised text then serves at /terms-of-service and
//   /terms-of-service/upcoming 301s to it. termsGuard() refuses an early or unnoticed swap; the build and
//   scripts/check-launch.mjs both run it.

export const CURRENT_TERMS_FILE = "terms-of-service.html";
export const CURRENT_TERMS_EFFECTIVE = "May 27, 2025";
export const TERMS_NOTICE_SENT = "";
export const REVISED_TERMS_DATE = "";
export const TERMS_SWAP = false;
export const UPCOMING_TERMS_PATH = "/terms-of-service/upcoming";
export const DATE_PLACEHOLDER = "EFFECTIVE-DATE-PENDING (30 days after the section 12 notice email)";
export const VERBATIM_START = "<!--legal:" + "current-terms:start-->";
export const VERBATIM_END = "<!--legal:" + "current-terms:end-->";

// Cherryh's rulings 1a to 1d (EB-approved 2026-11-01), applied only to the revised terms.
// The old strings are split so the copy checks do not match the text being replaced.
export const REVISED_CHANGES = [
  ["Register your name and creative works to be excluded from AI training data usage. We submit opt-out requests to AI developers and track " + "compliance on your behalf. This service is free and always will be.",
    "Register your name and creative works to record your opt-out from AI training. Each quarter, Credtent delivers the opt-out notice to AI companies, records each response, and follows up at 30, 60 and 90 days. Credtent relays and records opt-outs. It does not enforce them or monitor whether any company complies. Credtent does not plan to charge for the free opt-out."],
  ["<h3>Premium Opt-Out</h3>", "<h3>Opt-Out Premium</h3>"],
  ["Enhanced tracking of opt-out requests with detailed reporting, auditing, and compliance " + "monitoring. Available on paid plans.",
    "Opt-Out Premium enrolls your works in Credtent's periodic AI model audits, and Credtent records the results. Audit results are not proof of dataset inclusion or infringement. Available with Opt-Out Premium and every tier above it."],
  // EB card "Change to hello@" (2026-11-01): section 13 contact in the revised terms only.
  ['<a href="mailto:info@credtent.org" style="color:var(--c-purple)">info@credtent.org</a>',
    '<a href="mailto:hello@credtent.org" style="color:var(--c-purple)">hello@credtent.org</a>']
];

/**
 * Split the live terms page into its intro (eyebrow and one-line summary from the page hero) and the legal
 * body. Site chrome (nav and footer placeholders, scripts, styles) and the hero are removed from the body; the
 * new pages render the same eyebrow and summary once, in their own header.
 */
export function liveTermsParts(raw) {
  let body = (raw.split(/<body[^>]*>/i)[1] || "").split(/<\/body>/i)[0];
  body = body.replace(/<div id="nav-placeholder"[\s\S]*?<\/div>/i, "").replace(/<div id="footer-placeholder"[\s\S]*$/i, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  const hero = body.match(/<section class="page-hero"[\s\S]*?<\/section>/i);
  if (!hero) throw new Error("terms-of-service: page hero not found");
  const eyebrow = (hero[0].match(/<div class="eyebrow">([^<]*)<\/div>/) || [])[1];
  const capsule = (hero[0].match(/<p>([^<]*)<\/p>/) || [])[1];
  if (!eyebrow || !capsule) throw new Error("terms-of-service: hero eyebrow or summary not found");
  return { eyebrow, capsule, body: body.replace(hero[0], "") };
}

/** Apply the revised changes and the effective date to a terms body. Throws if any source text is missing. */
export function reviseTerms(body, effective = REVISED_TERMS_DATE || DATE_PLACEHOLDER) {
  const changes = [[`Effective Date: ${CURRENT_TERMS_EFFECTIVE}`, `Effective Date: ${effective}`], ...REVISED_CHANGES];
  for (const [from, to] of changes) {
    if (!body.includes(from)) throw new Error(`terms-of-service: expected text not found: ${from.slice(0, 60)}`);
    body = body.replace(from, to);
  }
  return body;
}

/** Visible text of an HTML fragment as trimmed, non-empty lines (tags become line breaks). */
export function termsText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** Errors that make the recorded terms settings unsafe to build or ship. Empty when they are consistent. */
export function termsGuard(today = new Date(), cfg = { TERMS_NOTICE_SENT, REVISED_TERMS_DATE, TERMS_SWAP }) {
  const errors = [];
  const day = 24 * 60 * 60 * 1000;
  const notice = /^\d{4}-\d{2}-\d{2}$/.test(cfg.TERMS_NOTICE_SENT) ? Date.parse(`${cfg.TERMS_NOTICE_SENT}T00:00:00Z`) : NaN;
  const effective = cfg.REVISED_TERMS_DATE ? Date.parse(`${cfg.REVISED_TERMS_DATE} 00:00:00 UTC`) : NaN;
  if (cfg.REVISED_TERMS_DATE || cfg.TERMS_SWAP) {
    if (Number.isNaN(notice)) errors.push("TERMS_NOTICE_SENT is not a recorded YYYY-MM-DD date");
    if (Number.isNaN(effective)) errors.push("REVISED_TERMS_DATE is not a readable date");
    if (!Number.isNaN(notice) && !Number.isNaN(effective) && effective - notice < 30 * day) errors.push("REVISED_TERMS_DATE is less than 30 days after TERMS_NOTICE_SENT (section 12)");
  }
  if (cfg.TERMS_SWAP && !Number.isNaN(effective) && effective > today.getTime()) errors.push("TERMS_SWAP is on before REVISED_TERMS_DATE");
  if (cfg.TERMS_SWAP && !cfg.REVISED_TERMS_DATE) errors.push("TERMS_SWAP is on without REVISED_TERMS_DATE");
  return errors;
}
