/* Credtent motion, round three. No libraries. Search-safe: no text is ever hidden or injected.
   - header shadow on scroll
   - scroll reveal on cards and photos only (never headings or paragraphs); base style stays visible, the class is added here
   - the steps arrows draw when the steps enter the viewport
   - the creative marquee gets a hidden clone so the loop is seamless (the text stays once in the HTML)
   Does nothing but the header shadow under prefers-reduced-motion or without IntersectionObserver. */
(function () {
  var d = document, root = d.documentElement;
  var h = d.querySelector('.site-header');
  function onScroll() { if (h) h.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.classList.add('motion');
  var marq = d.querySelector('.marq');
  if (marq) {
    var items = [].slice.call(marq.children);
    for (var k = 0; k < 2; k++) items.forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); marq.appendChild(c); });
  }
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  var cards = 'main .card, main .step, main .fact, main .person, main .photo-band figure, main .media-wide figure, main .diagram, main .resource-card';
  [].forEach.call(d.querySelectorAll(cards), function (el) {
    if (el.closest('.hero-l')) return;
    var i = [].indexOf.call(el.parentElement.children, el);
    el.style.setProperty('--d', Math.min(i, 5) * 70 + 'ms');
    el.classList.add('reveal');
    io.observe(el);
  });
  [].forEach.call(d.querySelectorAll('main .steps'), function (el) { io.observe(el); });
})();
