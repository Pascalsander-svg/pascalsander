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
  function yn(id, activeIsFirst) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = activeIsFirst
      ? "<b>" + el.textContent.trim().charAt(0) + "</b>&nbsp;&nbsp;" + el.textContent.trim().slice(-1)
      : el.textContent.trim().charAt(0) + "&nbsp;&nbsp;<b>" + el.textContent.trim().slice(-1) + "</b>";
  }
  function bindToggle(btnId, ynId, apply, initialFirst) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    var state = initialFirst; // true => first letter active
    var render = function () {
      var el = document.getElementById(ynId);
      var a = el.getAttribute("data-a") || el.textContent.trim().charAt(0);
      var b = el.getAttribute("data-b") || el.textContent.trim().slice(-1);
      el.setAttribute("data-a", a); el.setAttribute("data-b", b);
      el.innerHTML = state ? "<b>" + a + "</b>&nbsp;&nbsp;" + b : a + "&nbsp;&nbsp;<b>" + b + "</b>";
      btn.setAttribute("aria-pressed", String(!state === false ? state : state));
    };
    render();
    btn.addEventListener("click", function () {
      state = !state;
      apply(state);
      render();
    });
  }
  // Dark: first=N (light). toggling to second => dark on.
  bindToggle("t-dark", "yn-dark", function (first) {
    document.documentElement.classList.toggle("dark", !first);
  }, true);
  // Monochrome: first=Y (mono on = default). second => color on.
  bindToggle("t-mono", "yn-mono", function (first) {
    document.body.classList.toggle("color", !first);
  }, true);
  // Grain: first=N (off). second => grain on.
  bindToggle("t-grain", "yn-grain", function (first) {
    document.body.classList.toggle("grain", !first);
  }, true);

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

  /* ---- 4. Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- 5. Editorial image mask-wipe ---- */
  var figImgs = document.querySelectorAll("main figure img, .thumb img");
  if (figImgs.length && "IntersectionObserver" in window && !reducedMotion) {
    figImgs.forEach(function (img) { img.classList.add("img-wipe"); });
    var revealImg = function (img) { img.classList.add("img-in"); ioFig.unobserve(img); };
    var ioFig = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) revealImg(en.target); });
    }, { threshold: 0.15 });
    figImgs.forEach(function (img) { ioFig.observe(img); });
    requestAnimationFrame(function () {
      figImgs.forEach(function (img) {
        var r = img.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) revealImg(img);
      });
    });
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
