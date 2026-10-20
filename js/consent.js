/* Cookie consent + Google Analytics 4
   - GA loads ONLY after the visitor clicks "Accept".
   - Google Consent Mode v2: everything denied by default, ads signals stay denied.
   - The footer link [data-consent-open] reopens the banner so the choice can be changed. */
(function () {
  "use strict";
  var GA_ID = "G-RX5C03J5HG";          // GA4 measurement ID (Admin > Data streams)
  var KEY = "ps-consent-v2";           // "granted" | "denied" in localStorage
  var DE = document.documentElement.lang === "de";
  var T = DE ? {
    text: "Mit deiner Einwilligung nutzt diese Website Google Analytics, um zu verstehen, wie sie genutzt wird. Dabei werden Cookies gesetzt und Daten an Google übermittelt. Mehr dazu in der ",
    link: "Datenschutzerklärung", accept: "Akzeptieren", decline: "Ablehnen", label: "Cookie-Einwilligung"
  } : {
    text: "With your consent, this website uses Google Analytics to understand how it is used. This sets cookies and sends data to Google. Details in the ",
    link: "privacy policy", accept: "Accept", decline: "Decline", label: "Cookie consent"
  };

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    analytics_storage: "denied", wait_for_update: 500
  });

  var loaded = false;
  function loadGA() {
    gtag("consent", "update", { analytics_storage: "granted" });
    if (loaded || !/^G-[A-Z0-9]+$/.test(GA_ID)) return;
    loaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  }
  function clearGaCookies() {
    var host = location.hostname;
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (!/^_ga/.test(n)) return;
      ["", host, "." + host, "." + host.replace(/^www\./, "")].forEach(function (d) {
        document.cookie = n + "=; Max-Age=0; path=/" + (d ? "; domain=" + d : "");
      });
    });
  }
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var box = null;
  function css() {
    if (document.getElementById("ps-consent-css")) return;
    var st = document.createElement("style");
    st.id = "ps-consent-css";
    st.textContent =
      ".ps-consent{position:fixed;left:1rem;right:1rem;bottom:1rem;z-index:9999;max-width:34rem;margin-left:auto;" +
      "padding:1.1rem 1.2rem;background:var(--color-paper,#fff);color:var(--color-ink,#0b0b0c);" +
      "border:1px solid color-mix(in srgb,transparent,var(--color-ink,#0b0b0c) 18%);border-radius:14px;" +
      "box-shadow:0 10px 30px rgba(0,0,0,.18);font-size:.86rem;line-height:1.5}" +
      ".ps-consent p{margin:0 0 .85rem}" +
      ".ps-consent a{color:inherit;text-decoration:underline;text-underline-offset:3px}" +
      ".ps-consent .ps-row{display:flex;gap:.6rem;flex-wrap:wrap}" +
      ".ps-consent button{font:inherit;font-weight:600;cursor:pointer;border-radius:999px;padding:.55rem 1.3rem;" +
      "border:1px solid var(--color-ink,#0b0b0c);min-width:8.5rem}" +
      ".ps-consent .ps-accept{background:var(--color-ink,#0b0b0c);color:var(--color-paper,#fff)}" +
      ".ps-consent .ps-decline{background:transparent;color:var(--color-ink,#0b0b0c)}" +
      ".ps-consent button:focus-visible{outline:2px solid var(--color-signal,#ff5a3c);outline-offset:2px}";
    document.head.appendChild(st);
  }
  function hide() { if (box) { box.remove(); box = null; } }
  function show() {
    if (box) return;
    css();
    box = document.createElement("div");
    box.className = "ps-consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-live", "polite");
    box.setAttribute("aria-label", T.label);
    var p = document.createElement("p");
    p.appendChild(document.createTextNode(T.text));
    var a = document.createElement("a");
    a.href = "datenschutz.html"; a.textContent = T.link;
    p.appendChild(a); p.appendChild(document.createTextNode("."));
    var row = document.createElement("div"); row.className = "ps-row";
    var ok = document.createElement("button"); ok.type = "button"; ok.className = "ps-accept"; ok.textContent = T.accept;
    var no = document.createElement("button"); no.type = "button"; no.className = "ps-decline"; no.textContent = T.decline;
    ok.addEventListener("click", function () { set("granted"); hide(); loadGA(); });
    no.addEventListener("click", function () {
      set("denied"); hide();
      gtag("consent", "update", { analytics_storage: "denied" });
      clearGaCookies();
    });
    row.appendChild(ok); row.appendChild(no);
    box.appendChild(p); box.appendChild(row);
    document.body.appendChild(box);
  }

  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-consent-open]") : null;
    if (!t) return;
    e.preventDefault();
    show();
  });

  /* External video embeds (SRF): load the iframe only after a click */
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("button[data-embed-src]") : null;
    if (!b) return;
    var f = document.createElement("iframe");
    f.src = b.getAttribute("data-embed-src");
    f.title = b.getAttribute("data-embed-title") || "";
    f.setAttribute("allow", "autoplay; encrypted-media *; fullscreen");
    f.setAttribute("allowfullscreen", "");
    f.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;border:0";
    b.replaceWith(f);
    f.focus();
  });

  var state = get();
  if (state === "granted") loadGA();
  else if (state !== "denied") show();
})();
