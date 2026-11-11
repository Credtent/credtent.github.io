// Sentence-level edits to ported legacy pages, applied after scrub(). The live root pages are left untouched;
// only the new sites change. Source: Vonnegut's copy review of 2026-11-10
// (agents/vonnegut/2026-11-10-new-sites-copy-review.md in the Claudia repo), applied on EB's card "Apply, legal
// ones to Cherryh" (2026-11-10). Each `from` must appear exactly `count` times (default 1) or the build fails, so
// a change to the legacy page cannot silently skip an edit.

import { SERVICE_PROVIDERS, privacyDate } from "./privacy.mjs";

const PRIVACY_PROVIDERS_LIVE = "We use trusted third-party service providers to operate our platform, including Google Analytics for usage analytics. These providers access your information only to perform services on our behalf.";

// Privacy policy launch edits (Cherryh 2026-11-10, section 7). Keyed by site, since only .com has a live Tally form.
function privacyEdits(siteId) {
  return [
    ["Last Updated: April 9, 2025", `Last Updated: ${privacyDate()}`],
    [PRIVACY_PROVIDERS_LIVE, SERVICE_PROVIDERS[siteId]]
  ];
}

export const PAGE_EDITS = {
  "/standards": [
    // B9: no Authors Guild alignment claim (messaging spec 8.1).
    ['The Authors Guild\'s "Human Authored" certification converged on the same definitional ground our standard already occupied (the de minimis exception, the editor-test framing, the requirement for written agreements with ghostwriters and developmental editors), and our v3.1 standard (May 2026) makes that common ground explicit.',
      "The Authors Guild's Human Authored certification covers the body text of books and includes a de minimis exception for trivial AI tool use. Our v3.1 Human Composed standard (May 2026) takes that certification into account."],
    ["We are aligning with the Authors Guild's Human Authored certification rather than competing with it. ", ""],
    // B10: no named people or pipeline organizations until EB approves each name.
    ["We work the same way with the Tabletop Game Designers Guild, co-defining the Human Composed, AI-Assisted, and AI-Generated tiers for game design with designers Elizabeth Hargrave and Matt Leacock, and we are in conversation with the Creative Coalition on AI (where Ted Tremper is the executive responsible) and with music industry organizations to ensure the standards reflect the realities of each medium.",
      "We are developing medium-specific versions of the tiers with working practitioners in game design, film, and music, so the standard reflects how each medium is made."],
    [" We work with the Creative Coalition on AI, the Tabletop Game Designers Guild, music industry organizations, and others to make sure the standards we publish reflect the realities of each medium.", ""],
    // B11: the future-tense sentence is cut (Cherryh 2026-11-10, section 6: Article 50's date is unconfirmed, and
    // Asimov re-pulls SB 942 and Article 53 from primary sources before any replacement is published).
    [" By August 2, 2026, both California and the European Union will require some form of AI disclosure for covered providers.", ""],
    // V26: no clipped punch lines.
    ["We give them away. ", ""],
    [" That is not how trust gets built.", ""],
    // V27: no negation-then-correction.
    ["We did not build it to argue against the other efforts. We built it because most of them are addressing real problems,",
      "We built this catalog because most of these efforts address real problems,"],
    ["The answer is convergence, not addition.", "Audiences need fewer marks to learn."],
    ["The point is layered trust, not a single answer.", "These layers work together."],
    ["These are not badges. They are rules set by", "These are rules set by"],
    // V28 and V29: no strut, no posture.
    ["We launched our Creative Origin badges in early 2024. They have been on physical products for over a year. We did the work first because someone had to, and we did it as a Public Benefit Corporation because we believe the architecture of trust should not depend on celebrity attention or grant funding to survive. If you are working on a standard in this space and you want to talk, we are easy to find.",
      "We launched the Creative Origin badges in early 2024 as a Public Benefit Corporation, and we charge for certification so the work can sustain itself."],
    [" We are not afraid to share the alternatives.", ""],
    // V30: filler.
    ["what each one actually does", "what each one does"],
    ["can actually carry", "can carry"],
    ["can actually navigate", "can navigate"],
    // V31: one public mailbox (LD-043).
    ["mailto:feedback@credtent.org", "mailto:hello@credtent.org"]
  ],
  "/guides/ai-training-data-licensing-companies/": [
    // B14: "Independent Creative Registry" is a product category, not a brand name.
    ["Runs the Independent Creative Registry, where creatives and rights holders register works", "Runs a registry where creatives and rights holders register works"],
    // V15: the dangling clause the scrub left.
    ["with a manifest and a disclosure pack; under its standard terms. It also certifies", "with a manifest and a disclosure pack. It also certifies"],
    // V16.
    ["We would rather you read ours than take our word for it.", "Please read ours before you decide."],
    // Cherryh 2026-11-10 implementation check, item B: per-deal approval is not in every agreement (EB).
    ["Creatives and rights holders register works for a free opt-out, licensing, or both, and approve every deal before it executes.",
      "Creatives and rights holders register works for a free opt-out, licensing, or both, and set the limits Credtent licenses within."]
  ]
};

export function applyPageEdits(pagePath, body, siteId) {
  let out = body;
  const edits = [...(PAGE_EDITS[pagePath] || []), ...(pagePath === "/privacy-policy" ? privacyEdits(siteId) : [])];
  for (const [from, to, count = 1] of edits) {
    const found = out.split(from).length - 1;
    if (found !== count) throw new Error(`page edit for ${pagePath} expected ${count} match(es), found ${found}: ${from.slice(0, 60)}`);
    out = out.split(from).join(to);
  }
  return out;
}
