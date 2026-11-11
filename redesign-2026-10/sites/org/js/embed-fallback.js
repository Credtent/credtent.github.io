/* Contact form embed states (Brackett round five, adapted by Clarke). Runs only on pages with a Tally embed.
   The box starts as embed-pending (a short loading line drawn by CSS, the frame loading behind it). A message from the Tally frame
   marks it embed-ready. If none arrives within 4 seconds the box becomes embed-failed: the frame is hidden and the
   "Email us" link becomes a full-width button. A late message still switches it to ready. No text is hidden. */
(function () {
  var boxes = document.querySelectorAll('.tally-embed');
  if (!boxes.length) return;
  function set(box, state) { box.classList.remove('embed-pending', 'embed-ready', 'embed-failed'); box.classList.add(state); }
  [].forEach.call(boxes, function (box) { set(box, 'embed-pending'); });
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://tally.so') return;
    [].forEach.call(boxes, function (box) {
      var frame = box.querySelector('iframe');
      if (frame && frame.contentWindow === e.source) set(box, 'embed-ready');
    });
  });
  setTimeout(function () {
    [].forEach.call(boxes, function (box) { if (box.classList.contains('embed-pending')) set(box, 'embed-failed'); });
  }, 4000);
})();
