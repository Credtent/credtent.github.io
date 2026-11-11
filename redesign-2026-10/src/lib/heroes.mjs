// Home-page heroes from Brackett's round three (agents/brackett/2026-11-10-site-refinement/r3/ in the Claudia repo),
// ported on EB's card "Yes, port this" (2026-11-10). The words are the build's own; only the markup changed.
// Every image keeps width, height, AVIF and WebP; the first image is the only fetchpriority="high" one.
// Decorative strokes are aria-hidden SVG. No text starts hidden: hero text uses the transform-only .lift entrance.
import { creditLine, esc, picture } from "./render.mjs";

const lift = (n, cls, html, tag = "p") => `<${tag} class="${cls ? cls + " " : ""}lift" style="--n:${n}">${html}</${tag}>`;
const lines = (texts, start) => texts.map((text, i) => `<span class="ln lift" style="--n:${start + i}">${text}</span>`).join(" ");

const BRUSH = `<svg class="brush draw" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path pathLength="100" d="M 4 14 C 50 4, 110 20, 170 9 S 270 8, 296 13"></path></svg>`;
const CTA_ARROW = `<svg class="cta-arrow draw" viewBox="0 0 210 84" aria-hidden="true" focusable="false"><path pathLength="100" d="M 196 10 C 188 52, 120 78, 44 62 C 36 60, 30 56, 26 50"></path><path pathLength="100" class="head" d="M 14 62 L 26 48 L 42 56"></path></svg>`;
const SPARK = `<svg class="spark draw" viewBox="0 0 60 60" aria-hidden="true" focusable="false"><path pathLength="100" d="M 30 4 L 30 24 M 30 36 L 30 56 M 4 30 L 24 30 M 36 30 L 56 30 M 12 12 L 24 24 M 36 36 L 48 48 M 48 12 L 36 24 M 24 36 L 12 48"></path></svg>`;
const STEP_ARROW = (n) => `<svg class="sarrow s${n} draw" viewBox="0 0 100 44" aria-hidden="true" focusable="false"><path pathLength="100" d="M 6 38 C 20 6, 62 0, 88 30"></path><path pathLength="100" class="head" d="M 74 32 L 89 32 L 90 17"></path></svg>`;

// The two drawn arrows between the three steps of "How your opt-out works" (desktop only, per refine.css).
export const STEP_ARROWS = STEP_ARROW(1) + STEP_ARROW(2);

// Vonnegut's creative strip list (copy review addendum, 2026-11-10). The moving strip is aria-hidden; the same list
// is plain text on the page (CREATIVE_SENTENCE), and the two must change together.
export const CREATIVE_KINDS = ["Writers", "Filmmakers", "Musicians", "Poets", "Artists", "Photographers", "Illustrators", "Screenwriters", "Songwriters", "Journalists"];
export const CREATIVE_SENTENCE = "Credtent's free opt-out is open to writers, filmmakers, musicians, poets, artists, photographers, illustrators, screenwriters, songwriters, and journalists.";

export const ORG_HERO_CARDS = [
  { key: "editor", cls: "pc1", r: "-6deg" },
  { key: "podcast", cls: "pc2", r: "5deg" },
  { key: "resourceOptout", cls: "pc4", r: "-3deg" },
  { key: "resourceJudgment", cls: "pc3", r: "4deg" }
];
export const ORG_HERO_SIZES = "(min-width: 1000px) 24vw, 46vw";

export function orgHero(images, { eyebrow, capsule, lede, actions }) {
  const cards = ORG_HERO_CARDS.map((card, n) => {
    const img = images[card.key];
    return `<figure class="pc ${card.cls}" style="--r:${card.r};--n:${n}">${picture(img, { sizes: ORG_HERO_SIZES, priority: n === 0, eager: true })}${creditLine(img)}</figure>`;
  }).join("");
  const h1 = `<h1>${lines(["Your work.", "Your choices."], 1)} <span class="ln u lift" style="--n:3"><span>Your terms.</span>${BRUSH}</span></h1>`;
  const strip = `<div class="marquee" aria-hidden="true"><ul class="marq">${CREATIVE_KINDS.map((k) => `<li>${k}</li>`).join("")}</ul></div>`;
  return `<div class="hero-l hero-org hero-org3"><div class="hero-l-inner">
<div class="hero-l-copy">${lift(0, "eyebrow", esc(eyebrow))}${h1}${lift(4, "lede", lede)}${lift(5, "capsule", esc(capsule))}<div class="btn-row lift" style="--n:6">${actions}${CTA_ARROW}</div></div>
<div class="collage3"><i class="blob" aria-hidden="true"></i>${cards}
<div class="keep"><strong>Keep creating.</strong><span>We'll help with the AI questions.</span></div>${SPARK}</div>
</div></div>
${strip}`;
}

export const COM_HERO_SLIDES = ["filmmaker", "writer", "resourceJudgment"];
export const COM_HERO_SIZES = "(min-width: 1000px) 40vw, 90vw";

export function comHero(images, { eyebrow, lede, actions }) {
  const slides = COM_HERO_SLIDES.map((key, s) => `<figure class="slide" style="--s:${s}">${picture(images[key], { sizes: COM_HERO_SIZES, priority: s === 0, eager: true })}${creditLine(images[key])}</figure>`).join("");
  const team = images.training;
  const h1 = `<h1>${lines(["Creative work.", "Clear AI permissions.", "Value for both."], 1)}</h1>`;
  return `<div class="hero-l hero-com"><div class="hero-l-inner">
<div class="hero-l-copy">${lift(0, "eyebrow", esc(eyebrow))}${h1}${lift(4, "lede", lede)}<div class="btn-row lift" style="--n:5">${actions}</div></div>
<div class="duo grow" style="--n:2">
<div class="stage a k3">${slides}</div>
<figure class="b">${picture(team, { sizes: "(min-width: 1000px) 24vw, 50vw", eager: true })}${creditLine(team)}</figure>
<svg class="link" viewBox="0 0 120 100" aria-hidden="true" focusable="false"><path pathLength="100" d="M 84 30 C 108 30, 110 38, 98 47"></path></svg><i class="node n1" aria-hidden="true"></i><i class="node n2" aria-hidden="true"></i>
</div></div></div>`;
}
