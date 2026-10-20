/* Language handling: EN lives in the root, DE under /de/.
   Explicit choice (click on the language switch) is remembered in localStorage;
   without a choice, German browsers are sent to the German version once per page load. */
(function () {
  var KEY = "ps-lang";
  var here = document.documentElement.lang === "de" ? "de" : "en";
  var path = location.pathname;
  var inDe = /^\/de(\/|$)/.test(path);

  function target(lang) {
    if (lang === "de") return inDe ? null : path.replace(/^\//, "/de/");
    return inDe ? path.replace(/^\/de\/?/, "/") : null;
  }

  var pref = null;
  try { pref = localStorage.getItem(KEY); } catch (e) {}
  var want = (pref === "de" || pref === "en") ? pref : null;
  if (!want) {
    var l = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    if (/^de(\b|-)/i.test(l) && here === "en") want = "de";
  }
  if (want && want !== here) {
    var t = target(want);
    if (t) location.replace(t + location.search + location.hash);
  }

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[data-lang]") : null;
    if (!a) return;
    try { localStorage.setItem(KEY, a.getAttribute("data-lang")); } catch (x) {}
  });
})();
