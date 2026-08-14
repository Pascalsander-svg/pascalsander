/* Portfolio lightbox: click an image to view it large, navigate with the
   arrow buttons or keyboard (left/right/Esc). Progressive enhancement:
   without JS the images simply stay as a normal grid. */
(function () {
  "use strict";

  var grid = document.getElementById("pf-grid");
  if (!grid) return;
  var imgs = Array.prototype.slice.call(grid.querySelectorAll("img"));
  if (!imgs.length) return;

  var lb = document.createElement("div");
  lb.className = "lb";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-hidden", "true");
  lb.innerHTML =
    '<button class="lb-x" aria-label="Schliessen">\u00d7</button>' +
    '<button class="lb-nav lb-prev" aria-label="Zur\u00fcck">\u2039</button>' +
    '<figure class="lb-stage"><img alt=""><figcaption class="lb-cap"></figcaption></figure>' +
    '<button class="lb-nav lb-next" aria-label="Weiter">\u203a</button>';
  document.body.appendChild(lb);

  var lbImg = lb.querySelector("img");
  var lbCap = lb.querySelector(".lb-cap");
  var idx = -1;
  var lastFocus = null;

  function show(i) {
    idx = (i + imgs.length) % imgs.length;
    var el = imgs[idx];
    lbImg.src = el.currentSrc || el.src;
    lbImg.alt = el.alt || "";
    lbCap.textContent = el.alt || "";
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    lb.querySelector(".lb-x").focus();
  }
  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    lbImg.removeAttribute("src");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  imgs.forEach(function (im, i) {
    im.addEventListener("click", function () { open(i); });
  });
  lb.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
  lb.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
  lb.querySelector(".lb-x").addEventListener("click", close);
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(idx + 1);
    else if (e.key === "ArrowLeft") show(idx - 1);
  });
})();
