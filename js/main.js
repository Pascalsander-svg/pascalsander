/* pascalsander.ch — shared behavior. No dependencies. */
(function () {
  "use strict";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---- 1. Live viewport readout + CET clock (meta bar) ---- */
  var vp = document.getElementById("vp");
  function setVp() { if (vp) vp.textContent = window.innerWidth + "\u00d7" + window.innerHeight; }
  setVp();
  window.addEventListener("resize", setVp);

  function tickClock() {
    var el = document.getElementById("clock");
    if (!el) return;
    var fmt = new Intl.DateTimeFormat("de-CH", { timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit", hour12: false });
    el.textContent = "CET " + fmt.format(new Date());
  }
  tickClock();
  setInterval(tickClock, 30000);

  /* ---- 2. Mode toggles: Dark / Monochrome / Grain ---- */
  function setupToggle(btnId, ynId, cls, onRoot) {
    var btn = document.getElementById(btnId), yn = document.getElementById(ynId);
    if (!btn || !yn) return;
    var target = onRoot ? document.documentElement : document.body;
    var on = false;
    function render() {
      yn.innerHTML = on ? "N&nbsp;&nbsp;<b>Y</b>" : "<b>N</b>&nbsp;&nbsp;Y";
      btn.setAttribute("aria-pressed", String(on));
    }
    render();
    btn.addEventListener("click", function () {
      on = !on;
      target.classList.toggle(cls, on);
      render();
    });
  }
  setupToggle("t-dark", "yn-dark", "dark", true);   // default light

  /* ---- 2b. Wordmark: cursor-driven ink ----
     Letters fill with ink based on how close the pointer is, so the name
     "develops" under the cursor. Falls back to the CSS hover reveal when
     there is no fine pointer or motion is reduced. */
  var wordmark = document.querySelector(".wordmark");
  var wmLetters = wordmark ? Array.prototype.slice.call(wordmark.querySelectorAll(".wm-l")) : [];
  if (wordmark && wmLetters.length && finePointer && !reducedMotion) {
    wordmark.classList.add("ink-live");
    var GHOST = 0.34, INK_R = 340;
    var measureWM = function () {
      wmLetters.forEach(function (l) {
        var r = l.getBoundingClientRect();
        l._cx = r.left + r.width / 2;
        l._cy = r.top + r.height / 2;
      });
    };
    measureWM();
    window.addEventListener("resize", measureWM);
    window.addEventListener("scroll", measureWM, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureWM);

    var wmRAF = null, wmx = 0, wmy = 0;
    var paintWM = function () {
      wmRAF = null;
      wmLetters.forEach(function (l) {
        var dx = l._cx - wmx, dy = l._cy - wmy;
        var t = 1 - Math.sqrt(dx * dx + dy * dy) / INK_R;
        if (t < 0) t = 0;
        t = t * t * (3 - 2 * t); // smoothstep
        l.style.opacity = (GHOST + t * (1 - GHOST)).toFixed(3);
        l.style.transform = "translateY(" + ((1 - t) * 0.05).toFixed(3) + "em)";
      });
    };
    wordmark.addEventListener("pointermove", function (e) {
      wmx = e.clientX; wmy = e.clientY;
      if (wmRAF === null) wmRAF = requestAnimationFrame(paintWM);
    });
    wordmark.addEventListener("pointerleave", function () {
      wmLetters.forEach(function (l) { l.style.opacity = ""; l.style.transform = ""; });
    });
  }

  /* ---- 3. Custom cursor ---- */
  var cur = document.getElementById("cursor");
  if (cur && finePointer) {
    var cx = -50, cy = -50, tx = -50, ty = -50;
    document.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      cx += (tx - cx) * 0.3; cy += (ty - cy) * 0.3;
      cur.style.transform = "translate(" + cx + "px," + cy + "px)";
      requestAnimationFrame(loop);
    })();
  } else if (cur) {
    cur.style.display = "none";
    document.body.style.cursor = "auto";
  }

  /* ---- 4. Scroll reveal (robust, scroll-based) ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && !reducedMotion) {
    document.documentElement.classList.add("reveal-on");
    var revealReveals = function () {
      var vh = window.innerHeight;
      revealEls.forEach(function (el) {
        if (el.classList.contains("is-in")) return;
        var r = el.getBoundingClientRect();
        if (r.height !== 0 && r.top < vh * 0.95 && r.bottom > 0) el.classList.add("is-in");
      });
    };
    revealReveals();
    var rRAF = null;
    var onRevScroll = function () { if (rRAF) return; rRAF = requestAnimationFrame(function () { rRAF = null; revealReveals(); }); };
    window.addEventListener("scroll", onRevScroll, { passive: true });
    window.addEventListener("resize", onRevScroll);
  }

  /* ---- 5. Editorial image mask-wipe (robust scroll reveal) ---- */
  var figImgs = document.querySelectorAll("main figure img, .thumb img");
  if (figImgs.length && !reducedMotion) {
    figImgs.forEach(function (img) { img.classList.add("img-wipe"); });
    var revealVisible = function () {
      var vh = window.innerHeight;
      figImgs.forEach(function (img) {
        if (img.classList.contains("img-in")) return;
        var r = img.getBoundingClientRect();
        if (r.height === 0) return; // hidden (e.g. collapsed chapter)
        if (r.top < vh * 0.92 && r.bottom > 0) img.classList.add("img-in");
      });
    };
    revealVisible();
    var rvRAF = null;
    var onScroll = function () { if (rvRAF) return; rvRAF = requestAnimationFrame(function () { rvRAF = null; revealVisible(); }); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  } else {
    document.querySelectorAll("main figure img, .thumb img").forEach(function (img) { img.classList.add("img-in"); });
  }

  /* ---- 6. FAQ accordion ---- */
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.style.maxHeight = open ? "0px" : panel.scrollHeight + "px";
    });
  });

  /* ---- 7. Chapter accordion: expand/collapse all ---- */
  var toggleAll = document.getElementById("toggle-all-chapters");
  if (toggleAll) {
    var chapters = document.querySelectorAll("details.chapter");
    toggleAll.addEventListener("click", function () {
      var expand = toggleAll.getAttribute("data-state") !== "expanded";
      chapters.forEach(function (ch) { ch.open = expand; });
      toggleAll.setAttribute("data-state", expand ? "expanded" : "collapsed");
      toggleAll.textContent = expand ? "Collapse all" : "Expand all";
    });
    chapters.forEach(function (ch) {
      ch.addEventListener("toggle", function () {
        if (ch.open) ch.querySelectorAll("figure img.img-wipe").forEach(function (img) { img.classList.add("img-in"); });
        var allOpen = Array.prototype.every.call(chapters, function (c) { return c.open; });
        var allClosed = Array.prototype.every.call(chapters, function (c) { return !c.open; });
        if (allOpen) { toggleAll.setAttribute("data-state", "expanded"); toggleAll.textContent = "Collapse all"; }
        else if (allClosed) { toggleAll.setAttribute("data-state", "collapsed"); toggleAll.textContent = "Expand all"; }
      });
    });
  }

  /* ---- 7b. Autoplay reel videos only while in view ---- */
  var vids = document.querySelectorAll("video[data-autoplay]");
  if (vids.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      vids.forEach(function (v) { v.controls = true; });
    } else {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
          else { v.pause(); }
        });
      }, { threshold: 0.35 });
      vids.forEach(function (v) { vio.observe(v); });
    }
  }

  /* ---- 8. Contact form via Web3Forms ---- */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("form-status");
      var button = form.querySelector('button[type="submit"]');
      if (form.querySelector('[name="botcheck"]').value !== "") return;
      var services = Array.prototype.map.call(form.querySelectorAll('input[name="service"]:checked'), function (c) { return c.value; }).join(", ");
      if (services === "") { status.textContent = "Please select at least one service."; return; }
      button.disabled = true;
      status.textContent = "Sending\u2026";
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: form.querySelector('[name="access_key"]').value,
          subject: "New inquiry via pascalsander.ch",
          name: form.querySelector('[name="name"]').value,
          email: form.querySelector('[name="email"]').value,
          services: services,
          message: form.querySelector('[name="message"]').value
        })
      }).then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.success) { form.reset(); status.textContent = "Message sent. I will get back to you soon."; }
          else { status.textContent = "Sending failed. Write to pascal.sander@bluewin.ch instead."; }
        })
        .catch(function () { status.textContent = "Sending failed. Write to pascal.sander@bluewin.ch instead."; })
        .finally(function () { button.disabled = false; });
    });
  }
})();
