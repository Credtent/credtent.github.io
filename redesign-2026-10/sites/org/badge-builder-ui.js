(function () {
  'use strict';
  var Builder = window.CredtentBadgeBuilder;

  var BASE_SVG_URLS = {
    hcc: '/badges/creative-origin-human-composed.svg',
    aac: '/badges/creative-origin-ai-assisted.svg',
    acc: '/badges/creative-origin-ai-generated.svg',
    // Legacy art by Brackett in the 4.0 plain-language style.
    legacy: '/badges/creative-origin-legacy.svg'
  };
  var baseSvgCache = {};

  function fetchBaseSvg(tier) {
    if (baseSvgCache[tier]) return Promise.resolve(baseSvgCache[tier]);
    return fetch(BASE_SVG_URLS[tier]).then(function (res) {
      if (!res.ok) throw new Error('badge art fetch failed: ' + res.status);
      return res.text();
    }).then(function (text) {
      baseSvgCache[tier] = text;
      return text;
    });
  }

  var selected = 'hcc';
  var group = document.getElementById('tier-group');
  var rows = Array.prototype.slice.call(document.querySelectorAll('.tier-row'));

  function selectTier(tier) {
    selected = tier;
    rows.forEach(function (row) {
      var isSel = row.dataset.tier === tier;
      row.classList.toggle('is-selected', isSel);
      row.setAttribute('aria-checked', String(isSel));
    });
  }

  rows.forEach(function (row) {
    row.addEventListener('click', function () { selectTier(row.dataset.tier); });
  });

  // Keyboard support for the radiogroup: arrow keys move selection.
  if (group) {
    group.addEventListener('keydown', function (e) {
      var idx = rows.findIndex(function (r) { return r.dataset.tier === selected; });
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        var next = rows[(idx + 1) % rows.length];
        selectTier(next.dataset.tier);
        next.focus();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var prev = rows[(idx - 1 + rows.length) % rows.length];
        selectTier(prev.dataset.tier);
        prev.focus();
      }
    });
  }

  // PNG size options carried over from the original registry badge builder
  // (Large / Medium / Small).
  var PNG_SIZES = [
    { id: 'download-png-large', size: 1000 },
    { id: 'download-png-medium', size: 400 },
    { id: 'download-png-small', size: 200 }
  ];

  function svgToPngDataUrls(svg, sizes) {
    return new Promise(function (resolve, reject) {
      var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var img = new Image();
      img.onload = function () {
        try {
          var out = sizes.map(function (size) {
            var canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            var ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('no canvas context');
            ctx.drawImage(img, 0, 0, size, size);
            return canvas.toDataURL('image/png');
          });
          URL.revokeObjectURL(url);
          resolve(out);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('svg rasterize failed'));
      };
      img.src = url;
    });
  }

  var btn = document.getElementById('generate-btn');
  var resultStep = document.getElementById('result-step');
  var preview = document.getElementById('result-preview');
  var classLine = document.getElementById('result-class');
  var statusPill = document.getElementById('status-pill');
  var dlSvg = document.getElementById('download-svg');
  var pngLinks = PNG_SIZES.map(function (opt) {
    return { el: document.getElementById(opt.id), size: opt.size };
  });

  function setPngLinksHidden(hidden) {
    pngLinks.forEach(function (link) {
      if (link.el) link.el.hidden = hidden;
    });
  }

  // ── Skippable email-capture gate (EB decision 2026-07-11) ──────
  // Intercepts the FIRST download only, shows an optional Tally email
  // form with a which-badge hidden field, and always offers "Skip and
  // download". Dormant while EMAIL_GATE_TALLY_FORM_ID is empty.
  // NEEDS-EB: create the Tally form (email field + hidden field "badge"),
  // then set its ID here (the token in tally.so/r/XXXXXX).
  var EMAIL_GATE_TALLY_FORM_ID = '';
  var GATE_DONE_KEY = 'credtent_badge_email_gate_v1';
  var gateOverlay = document.getElementById('email-gate');
  var gateFrame = document.getElementById('email-gate-frame');
  var gateSkip = document.getElementById('email-gate-skip');
  var gatePendingLink = null;
  var gateBypass = false;

  function gateAlreadyDone() {
    try { return localStorage.getItem(GATE_DONE_KEY) === 'done'; }
    catch (e) { return true; }
  }
  function markGateDone() {
    try { localStorage.setItem(GATE_DONE_KEY, 'done'); } catch (e) { /* ignore */ }
  }
  function openGate(link) {
    gatePendingLink = link;
    gateFrame.src = 'https://tally.so/embed/' + EMAIL_GATE_TALLY_FORM_ID +
      '?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&badge=' +
      encodeURIComponent(selected);
    gateOverlay.classList.add('open');
    gateSkip.focus();
  }
  function closeGate(resumeDownload) {
    gateOverlay.classList.remove('open');
    var link = gatePendingLink;
    gatePendingLink = null;
    if (resumeDownload && link) {
      gateBypass = true;
      link.click();
      gateBypass = false;
    }
  }
  function wireEmailGate(downloadEls) {
    if (!gateOverlay || !gateFrame || !gateSkip) return;
    downloadEls.forEach(function (el) {
      if (!el) return;
      el.addEventListener('click', function (e) {
        if (!EMAIL_GATE_TALLY_FORM_ID || gateBypass || gateAlreadyDone()) return;
        e.preventDefault();
        openGate(el);
      });
    });
    gateSkip.addEventListener('click', function () {
      markGateDone();
      closeGate(true);
    });
    gateOverlay.addEventListener('click', function (e) {
      if (e.target === gateOverlay) closeGate(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && gateOverlay.classList.contains('open')) closeGate(false);
    });
    window.addEventListener('message', function (e) {
      if (e.origin !== 'https://tally.so' || typeof e.data !== 'string') return;
      try {
        var payload = JSON.parse(e.data);
        if (payload && payload.event === 'Tally.FormSubmitted' &&
            gateOverlay.classList.contains('open')) {
          markGateDone();
          closeGate(true);
        }
      } catch (err) { /* not a Tally event */ }
    });
  }

  wireEmailGate([dlSvg].concat(pngLinks.map(function (link) { return link.el; })));

  if (btn) btn.addEventListener('click', function () {
    btn.setAttribute('aria-busy', 'true');
    btn.disabled = true;
    var original = btn.textContent;
    btn.textContent = 'Generating';
    var tier = selected;

    fetchBaseSvg(tier).then(function (baseSvg) {
      var result = Builder.generateBadge(tier, baseSvg);

      if (preview) preview.innerHTML = result.svg;
      if (classLine) classLine.textContent = result.label + ', self declared';
      if (statusPill) {
        statusPill.classList.remove('error');
        statusPill.textContent = result.statusLine;
      }

      if (dlSvg) {
        dlSvg.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(result.svg);
        dlSvg.download = 'creative-origin-' + tier + '.svg';
        dlSvg.hidden = false;
      }

      var pngStep = svgToPngDataUrls(
        result.svg,
        pngLinks.map(function (link) { return link.size; })
      ).then(function (urls) {
        pngLinks.forEach(function (link, i) {
          if (!link.el) return;
          link.el.href = urls[i];
          link.el.download = 'creative-origin-' + tier + '-' + link.size + 'x' + link.size + '.png';
          link.el.hidden = false;
        });
      }).catch(function () {
        // PNG is a nicety; if rasterization fails, hide it and keep SVG.
        setPngLinksHidden(true);
      });

      return pngStep.then(function () {
        if (resultStep) {
          resultStep.hidden = false;
          resultStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }).catch(function () {
      if (statusPill) {
        statusPill.classList.add('error');
        statusPill.textContent = 'Something went wrong loading the badge art. Please reload the page and try again.';
      }
      if (classLine) classLine.textContent = '';
      if (preview) preview.innerHTML = '';
      if (dlSvg) dlSvg.hidden = true;
      setPngLinksHidden(true);
      if (resultStep) resultStep.hidden = false;
    }).then(function () {
      btn.setAttribute('aria-busy', 'false');
      btn.disabled = false;
      btn.textContent = original;
    });
  });
})();
