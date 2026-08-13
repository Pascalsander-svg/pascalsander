/* Modeling page: portfolio images assemble from a scatter into the grid.
   Progressive enhancement: without JS (or with reduced motion) the grid is
   simply shown. Uses transform/opacity only (GPU friendly) and reveals each
   image once as it scrolls into view. */
(function () {
  "use strict";

  var grid = document.getElementById("pf-grid");
  if (!grid) return;

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // No animation: leave the grid fully visible.
  if (reduce || !("IntersectionObserver" in window)) return;

  var figs = Array.prototype.slice.call(grid.querySelectorAll("figure"));
  if (!figs.length) return;

  // Deterministic scatter per index so the layout is stable across reloads.
  figs.forEach(function (f, i) {
    var a = (((i * 1103515245 + 12345) >>> 8) % 1000) / 1000; // 0..1
    var b = (((i + 1) * 2654435761 >>> 5) % 1000) / 1000;     // 0..1
    var dx = Math.round((a * 2 - 1) * 70);   // -70..70 px sideways
    var dy = Math.round(50 + b * 90);        // 50..140 px from below
    var r = ((b * 2 - 1) * 7).toFixed(1);    // -7..7 deg tilt
    f.style.setProperty("--dx", dx + "px");
    f.style.setProperty("--dy", dy + "px");
    f.style.setProperty("--r", r + "deg");
  });

  // The portfolio sits well below the fold, so applying the hidden/scattered
  // state now (after the deferred parse) does not cause a visible flash.
  grid.classList.add("pf-anim");

  var io = new IntersectionObserver(function (entries) {
    var batch = 0;
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.style.setProperty("--d", batch * 55 + "ms"); // gentle stagger
      batch++;
      el.classList.add("in");
      io.unobserve(el);
      el.addEventListener("transitionend", function () {
        el.style.willChange = "auto";
      }, { once: true });
    });
  }, { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.08 });

  figs.forEach(function (f) { io.observe(f); });
})();
