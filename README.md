# Credtent

Neutral licensing infrastructure for the AI economy.

**Live site:** https://credtent.github.io/

---

## Tech stack

Plain HTML + CSS + vanilla JavaScript. No build step. Deployed via GitHub Pages from `main`.

## Project structure

```
├── index.html                  # Home
├── about.html                  # About / team
├── faq.html                    # FAQ
├── pricing.html                # Pricing (3 hash-routed tabs)
├── for-ai-companies.html       # AI Companies landing
├── for-content-owners.html     # Content Owners landing
├── privacy-policy.html
├── terms-of-service.html
├── styles.css                  # All styles. CSS custom properties at top.
├── components.js               # Injects nav + footer, GA + cookie consent
├── favicon/                    # Icons + site.webmanifest
├── team/                       # Team photos
├── parking/                    # Unfinished pages (excluded via robots.txt)
└── robots.txt
```

## Local development

```bash
python3 -m http.server 8787
# open http://localhost:8787
```

## Deployment

Push to `main` → GitHub Pages rebuilds automatically. No CI, no build step.

## Conventions & gotchas

- **Nav and footer are injected by `components.js`** into `<div id="nav-placeholder">` and `<div id="footer-placeholder">`. Edit them in `components.js`, not in each HTML file.
- **Favicon paths are absolute** (`/favicon/...`). This works because the site is served at the root of `credtent.github.io` (no subpath).
- **Google Analytics** (ID `G-3BJJV0MSLW`) only loads after the user accepts the cookie banner. Consent is stored in `localStorage` under `credtent_cookie_consent`.
- **Pricing tabs** are hash-routed: `#ai-companies`, `#content-partners`, `#creators`. The tab bar is sticky and syncs with the mobile nav's show/hide state.
- **H2 type scale** has three tiers:
  - Section titles: `clamp(1.8rem, 3vw, 2.5rem)` (≤ 40px)
  - Subsection headings: `clamp(1.4rem, 2.5vw, 2rem)` (≤ 32px)
  - Prose headings: `1.5rem` (24px)
  - `.cta-banner h2` is an intentional exception at 36px max.
- **Section header measure:** `.section-header` blocks (eyebrow + h2 + description paragraph) are constrained to `max-width: 720px` (≈ 80ch at 16px body) for typographic readability. `.pricing-section-header .section-header` overrides to 640px and `text-align: left` because it sits in a two-column flex layout.
- **`components.js` base path** auto-computes `../` prefixes by directory depth so subdirectory pages (`/parking/`, `/parking/blog/`, future deeper paths) get correct nav links without an allowlist.
- **Photos live at the repo root** with Unsplash filenames preserved, referenced from `styles.css` as CSS backgrounds.
- **`/parking/`** holds unfinished pages. Excluded via both `robots.txt` (`Disallow: /parking/`) and per-page `<meta name="robots" content="noindex, nofollow">`.

## Credits

- Fonts: Source Serif 4, Nunito Sans, IBM Plex Mono (Google Fonts)
- Photography: Alexander Korte, Yuanzhe Ma (Unsplash)

## License

© Credtent. All rights reserved.
