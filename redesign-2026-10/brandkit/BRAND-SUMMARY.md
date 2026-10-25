# Credtent brand summary for the .com / .org rebuild (pulled 2026-10-25, read-only from Drive)

## Sources (Drive IDs)
- [G] Credtent Brand Kit Guide (Sales & Marketing), Google Doc 1plcfG2d55LXCEcTswgi51sZnrtIcyQHUTEbO2S0ZqKk -> docs/Credtent-Brand-Kit-Guide.docx. This is the canonical guide the pointer doc targets. Its "02 Colors and Typography" section says the governing type and color spec is credtent-design-system.pdf.
- [P] brand-kit-guide-canonical-pointer-PROPOSAL.md (1mPK0BLv...). Its Parts A and B are already in the live Guide.
- [DS] credtent-design-system.pdf (1-9m6AgJ...) and the Google Doc "Credtent Design System 3.2026" (1FxMYupv...). Both carry the same text.
- [CSS] Credtent Design System.zip (11JDHPPi..., Sep 16 2026) -> design-system/extracted/: colors_and_type.css, fonts/fonts.css, README.md, logos, previews and the marketing UI kit. I left out its iso-deck/ and investor deck/pptx folders.
- [B] 2026-06-19-brand-kit-badge-update-brief.md and [S] 2026-07-06-brand-portal-spec.md.
- _brandkit-staging folder (11j_x295...): it holds only 6 Creative Origin badge PNGs (HC/AA/AG at 512 and 1001), copied to brandkit-staging/. There are no style docs and no SVGs in it.

## Fonts: CONFLICT with Source Serif 4 + Inter
- [DS] Display/headlines: **Playfair Display**. Body/UI: **Nunito Sans**. Accent/labels/data/badge labels: **IBM Plex Mono**.
- [CSS] Same set, plus **Sora** for the product UI (`.ui-product`). The fonts load from the Google Fonts CDN, and no TTF/WOFF files are vendored. The CredtentOne app itself uses Geist Sans/Mono.
- Eric's Oct 25 pick (Source Serif 4 + Inter) replaces both the headline and body faces. Both roles are similar (editorial serif + humanist/neutral sans), so it is a swap, not a clash of intent, but the brand docs need updating or an explicit override note. Open question: keep IBM Plex Mono for eyebrows/stats/badge labels? The docs lean on it heavily as the "trust-signal" look. Self-host all of them (fonts.css uses the CDN today).

## Colors [DS] tokens (exact)
| Token | Name | Hex | Usage |
|---|---|---|---|
| color-brand-primary | Credtent Indigo | #290099 | Brand purple. Never substitute (Tailwind purple-600 etc.) [G] |
| color-interaction-primary | Credtent Orange | #EC5A00 | CTAs, links, hovers, focus ring, H2 rail |
| (CSS) orange-700 | CTA hover | #D14A00 | hover |
| color-text-headline | Headline Deep | #1C2340 | headings |
| color-text-body | Body Indigo Slate | #3B4261 | body |
| color-text-muted | Muted Lavender | #696D87 | muted/subtitles/eyebrows |
| color-text-data | Data Accent | #EB8D1E | stats/data, distinct from CTA orange |
| color-surface-default | Surface Default | #F7F8FC | page surface |
| color-border-subtle | Border Subtle | #EAEBF4 | hairlines |
| color-border-default | Border Default | #C8CADE | inputs |
| color-neutral-dark | Neutral Dark | #152153 | hero/dark sections |
| (CSS) navy-darkest | Footer | #0D1529 | footer |
| (CSS) indigo-600 / 400 / 50 | | #1E0073 / #5552B8 / #EEECF9 | tints |
| (CSS) orange-50 | | #FEF2E7 | tint |
| semantic | Success / Info / Warning / Error | #27AE74 / #3498EF / #F4D053 / #E74C50 | states |

**Creative Origin badges (canonical, [G]/[P]/[B])**: Human Composed HC **#290099**, AI-Assisted AA **#208354**, AI-Generated AG **#C94F03**. Only HC and AA can be CERTIFIED (corner ribbon), and there is no certified AG. HCC/AAC/ACC naming is retired. The plain-language label is primary, and the 2-letter code is a small secondary mark.
- CONFLICT: [CSS] and the zip README still map the legacy badges (HCC=forest #27AE74, AAC=#5552B8, ACC=orange "AI-Composed", plus a Legacy grey badge). Use the canonical hexes above, not the zip.

## Logo usage
- [G] Shield for square/avatar, horizontal for banners, inverted on dark backgrounds. SVG for web. Canonical logo and badge SVGs live in the Drive Brand Kit "01 Logos" folder (not pulled; the staging folder has only the badge PNGs).
- [CSS README] Marketing wordmark is CREDTENT in ALL CAPS, tracked 0.1 to 0.15em. The nav shows the small mark plus the wordmark, and the footer/hero show the wordmark alone. The zip assets are credtent-wordmark.svg, credtent-logo-official.png and credtent-logo-reverse.png.
- [DS] "The badge is a credential, not a logo." Give it the gravity of an official seal.

## Spacing / layout [CSS]
4px-based scale: 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4 and 6rem. Radii: 6px for buttons/inputs, 8px for marketing cards, 12px for product cards/modals, and 20px pills for badges only. Type scale: display 56, h1 40, h2 28, h3 24, h4 20 and body 16px, with line-height 1.6 to 1.7. Signature section H2 has a 4px orange left rail. Eyebrows are uppercase mono with 0.08em tracking. Icons are 1.5px stroke, indigo. [DS] principles: lead with white space, grid structure, real human photography over AI illustration, and data as design.

## Voice
- [DS] Sage with a pinch of Champion. Definitive, empathetic, clear, measured, educational. Rigorous but not cold.
- [CSS README] Use "we" for Credtent and "you" for the reader. Never "I", never faux-casual. Write like a publication, not a startup landing page.
- [G] One-liner: "The neutral licensing infrastructure for the AI economy." Credtent is a Delaware PBC and B Corp certified. The revenue split is 85/15. Partner language: "over a dozen enterprise content partners and hundreds of individual creatives". Don't name partners without approval. WGA "reviewed and accepted" the certification process (no partnership/endorsement claim).
- [P] house rules: no em dashes, no exclamation points.
- CONFLICT: [DS] taglines and personas say "creators" ("Campaign: For Creators", "Independent Creator"). Per Eric, site copy must say "creatives".
- [DS] Taglines: "Your Work. Certified Credible. Licensed Fairly." / "The Standard for Content in the Age of AI".

## Glendora address
No Drive document I found states a Credtent street address in Glendora. The full-text search for "Glendora, CA" returned only unrelated old spreadsheets/resumes and a Niven audit. Keep the footer placeholder.
