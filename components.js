// Shared Nav & Footer components injected into every page
// Usage: add <script src="../components.js"></script> and
// <div id="nav-placeholder"></div> / <div id="footer-placeholder"></div>

(function () {
  // Detect if page is in a subdirectory (e.g. /blog/) and set base path accordingly
  const _parts = window.location.pathname.split('/').filter(Boolean);
  const _subDirs = ['blog', 'team'];
  const base = (_parts.length >= 2 && _subDirs.includes(_parts[_parts.length - 2])) ? '../' : '';

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const pages = [
    { href: `${base}index.html`, label: 'Home' },
    { href: `${base}for-ai-companies.html`, label: 'AI Companies' },
    { href: `${base}for-content-owners.html`, label: 'Content Owners' },
    // { href: `${base}services.html`, label: 'Services' },
    { href: `${base}about.html`, label: 'About' },
    { href: `${base}faq.html`, label: 'FAQ' },
    // { href: `${base}blog.html`, label: 'Blog' },
    { href: `${base}pricing.html`, label: 'Pricing' },
  ];

  const navLinks = pages.map(p => {
    const active = p.href.endsWith(currentPage) ? ' class="active"' : '';
    return `<a href="${p.href}"${active}>${p.label}</a>`;
  }).join('');

  const mobileLinks = pages.map(p => {
    const active = p.href.endsWith(currentPage) ? ' class="active"' : '';
    return `<a href="${p.href}"${active}>${p.label}</a>`;
  }).join('');

  const navHTML = `
<nav class="nav">
  <div class="nav-inner">
    <a href="${base}index.html" class="nav-logo">
      <div class="nav-logo-mark">
        <img src="${base}credtent-logo-mark.svg" alt="" width="32" height="37">
      </div>
      <div class="nav-wordmark">
        <img src="${base}credtent-wordmark.svg" alt="Credtent" width="130" height="25">
      </div>
    </a>
    <div class="nav-links">${navLinks}</div>
    <div class="nav-auth">
      <a href="https://tally.so/r/2ExeBp" class="signup" target="_blank" rel="noopener">Investor Inquiries</a>
    </div>
    <button class="nav-hamburger" id="nav-hamburger-btn" aria-label="Open menu" aria-expanded="false">
      <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0"  width="21" height="2" rx="1" fill="currentColor"/>
        <rect x="0" y="7"  width="21" height="2" rx="1" fill="currentColor"/>
        <rect x="0" y="14" width="21" height="2" rx="1" fill="currentColor"/>
      </svg>
    </button>
  </div>
</nav>
<div class="nav-mobile-menu" id="nav-mobile-menu" aria-hidden="true">
  <div class="nav-mobile-links">${mobileLinks}</div>
  <div class="nav-mobile-divider"></div>
  <div class="nav-mobile-auth">
    <a href="https://tally.so/r/2ExeBp" class="signup" target="_blank" rel="noopener">Investor Inquiries</a>
  </div>
</div>`;

  const footerHTML = `
<footer class="footer">
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="footer-logo">
        <div class="footer-logo-mark">
          <img src="${base}credtent-logo-mark.svg" alt="" width="32" height="37">
        </div>
        <div class="footer-wordmark">
          <img src="${base}credtent-wordmark.svg" alt="Credtent" width="130" height="25">
        </div>
      </div>
      <p>Credtent Inc. is a Delaware Public Benefit Corporation — a neutral, third-party utility uniting creatives and AI for mutual prosperity.</p>
      <div class="footer-social">
        <a href="https://bsky.app/profile/credtent.bsky.social" title="Bluesky" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.299-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/></svg>
        </a>
        <a href="https://www.linkedin.com/company/credtent/" title="LinkedIn" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
        <a href="https://x.com/credtent" title="X / Twitter" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="https://www.instagram.com/credtentofficial/" title="Instagram" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        </a>
        <a href="https://www.facebook.com/profile.php?id=61554185681148" title="Facebook" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a href="https://credtent.substack.com/" title="Substack" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>
        </a>
      </div>
    </div>
    <div class="footer-col footer-quicklinks">
      <h5>Quick Links</h5>
      <div class="footer-quicklinks-grid">
        <ul>
          <li><a href="${base}index.html">Home</a></li>
          <li><a href="${base}for-ai-companies.html">AI Companies</a></li>
          <li><a href="${base}for-content-owners.html">Content Owners</a></li>
        </ul>
        <ul>
          <li><a href="${base}about.html">About</a></li>
          <li><a href="${base}faq.html">FAQ</a></li>
          <li><a href="${base}pricing.html">Pricing</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-col">
      <h5>Services</h5>
      <ul>
        <li><a href="${base}for-ai-companies.html">Licensing-as-a-Service</a></li>
        <li><a href="${base}for-ai-companies.html">Compliance-as-a-Service</a></li>
        <li><a href="${base}for-content-owners.html">Enterprise Solutions</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h5>Talk to Us</h5>
      <ul>
        <li><a href="${base}for-content-owners.html#talk-content">Content Partners</a></li>
        <li><a href="${base}for-ai-companies.html#talk-licensing">AI Companies</a></li>
        <li><a href="https://tally.so/r/2ExeBp" target="_blank" rel="noopener">Investors</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span class="footer-copyright">© 2026 Credtent Inc. All rights reserved.</span>
    <div class="footer-legal">
      <a href="${base}privacy-policy.html">Privacy Policy</a>
      <a href="${base}terms-of-service.html">Terms of Service</a>
    </div>
  </div>
</footer>`;

  function inject(id, html) {
    const el = document.getElementById(id);
    if (el) el.outerHTML = html;
  }

  // ── Hero gradient injection ──────────────────────────────────
  // Each pair defines opposite starting corners for purple + orange.
  // Positions are expressed as CSS top/right/bottom/left values.
  const GRAD_PAIRS = [
    { p: { top: '-160px', right: '-110px' }, o: { bottom: '-100px', left:  '-80px'  } }, // TR / BL
    { p: { top: '-140px', left:  '-100px' }, o: { bottom:  '-80px', right: '-60px'  } }, // TL / BR
    { p: { bottom:'-110px', right:'-90px' }, o: { top:    '-120px', left:  '-75px'  } }, // BR / TL
    { p: { bottom:'-100px', left: '-110px'}, o: { top:    '-100px', right: '-70px'  } }, // BL / TR
    { p: { top:  '-130px', right:  '28%'  }, o: { bottom:  '-90px', left:   '22%'  } }, // top-centre / bottom-centre
    { p: { top:   '15%',   right: '-120px'}, o: { top:     '20%',   left:  '-90px' } }, // mid-right / mid-left
    { p: { top:  '-120px', left:   '35%'  }, o: { bottom:  '-75px', right:  '30%'  } }, // top-centre-left / bottom-centre-right
    { p: { bottom: '-90px', right: '40%'  }, o: { top:    '-110px', left:   '35%'  } }, // bottom-centre / top-centre
  ];

  function applyHeroGradients() {
    document.querySelectorAll('.hero-dark, .page-hero').forEach(function (hero) {
      const pair = GRAD_PAIRS[Math.floor(Math.random() * GRAD_PAIRS.length)];

      // Randomise animation duration slightly so every hero feels unique
      const pDur = (18 + Math.random() * 8).toFixed(1) + 's';
      const oDur = (22 + Math.random() * 9).toFixed(1) + 's';
      const pDel = (Math.random() * 4).toFixed(1) + 's';
      const oDel = (Math.random() * 6).toFixed(1) + 's';

      function makeGrad(type, pos, dur, delay) {
        const el = document.createElement('div');
        el.className = 'hero-grad hero-grad-' + type;
        Object.assign(el.style, {
          top:    pos.top    || 'auto',
          right:  pos.right  || 'auto',
          bottom: pos.bottom || 'auto',
          left:   pos.left   || 'auto',
          animation: 'drift-' + type + ' ' + dur + ' ease-in-out ' + delay + ' infinite',
        });
        return el;
      }

      hero.appendChild(makeGrad('purple', pair.p, pDur, pDel));
      hero.appendChild(makeGrad('orange', pair.o, oDur, oDel));
    });
  }

  function inject(id, html) {
    const el = document.getElementById(id);
    if (el) el.outerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', function () {
    inject('nav-placeholder', navHTML);
    inject('footer-placeholder', footerHTML);
    applyHeroGradients();

    // Hide-on-scroll-down / reveal-on-scroll-up (mobile only)
    (function () {
      var lastY   = window.scrollY;
      var ticking = false;

      function update() {
        var nav  = document.querySelector('.nav');
        var menu = document.getElementById('nav-mobile-menu');
        var btn  = document.getElementById('nav-hamburger-btn');
        if (!nav) { ticking = false; return; }

        var currentY = window.scrollY;

        // Only apply on mobile
        if (window.innerWidth > 640) {
          nav.classList.remove('nav--hidden');
          ticking = false;
          return;
        }

        if (currentY > lastY && currentY > 60) {
          // Scrolling down — hide nav and close any open menu
          nav.classList.add('nav--hidden');
          if (menu) { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); }
          if (btn)  { btn.setAttribute('aria-expanded', 'false'); }
        } else if (currentY < lastY) {
          // Scrolling up — reveal nav
          nav.classList.remove('nav--hidden');
        }

        lastY   = currentY;
        ticking = false;
      }

      window.addEventListener('scroll', function () {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
      }, { passive: true });

      window.addEventListener('resize', function () {
        if (window.innerWidth > 640) {
          var nav = document.querySelector('.nav');
          if (nav) nav.classList.remove('nav--hidden');
        }
      }, { passive: true });
    }());

    // ── Cookie consent & Google Analytics ───────────────────────
    (function () {
      var GA_ID       = 'G-3BJJV0MSLW';
      var CONSENT_KEY = 'credtent_cookie_consent';

      function loadGA() {
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_ID);
      }

      function showBanner() {
        var el = document.createElement('div');
        el.id = 'cookie-banner';
        el.innerHTML =
          '<div class="cookie-banner-inner">' +
            '<p class="cookie-banner-text">We use cookies to understand how visitors use our site. ' +
              '<a href="' + base + 'privacy-policy.html">Privacy Policy</a>' +
            '</p>' +
            '<div class="cookie-banner-actions">' +
              '<button id="cookie-accept" class="btn btn-primary">Accept</button>' +
              '<button id="cookie-decline" class="btn btn-outline-white">Decline</button>' +
            '</div>' +
          '</div>';
        document.body.appendChild(el);

        document.getElementById('cookie-accept').addEventListener('click', function () {
          localStorage.setItem(CONSENT_KEY, 'accepted');
          el.remove();
          loadGA();
        });
        document.getElementById('cookie-decline').addEventListener('click', function () {
          localStorage.setItem(CONSENT_KEY, 'declined');
          el.remove();
        });
      }

      var consent = localStorage.getItem(CONSENT_KEY);
      if (consent === 'accepted') {
        loadGA();
      } else if (!consent) {
        showBanner();
      }
    }());

    // Mobile hamburger toggle
    const hamburgerBtn = document.getElementById('nav-hamburger-btn');
    const mobileMenu   = document.getElementById('nav-mobile-menu');
    if (hamburgerBtn && mobileMenu) {
      hamburgerBtn.addEventListener('click', function () {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburgerBtn.setAttribute('aria-expanded', isOpen);
        mobileMenu.setAttribute('aria-hidden', !isOpen);
      });
      // Close menu on link click
      mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileMenu.classList.remove('open');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          mobileMenu.setAttribute('aria-hidden', 'true');
        });
      });
    }
  });
})();
