/* MANNA — interactions: scroll reveal, nav, form validation */
(function () {
  "use strict";

  /* ---- Scroll reveal ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---- Smooth scroll for in-page links (account for sticky nav) ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      ev.preventDefault();
      var y = t.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  /* ---- Contact form validation ---- */
  var form = document.getElementById("bookForm");
  if (!form) return;

  function setErr(name, msg) {
    var field = form.querySelector('[data-field="' + name + '"]');
    if (!field) return;
    field.classList.toggle("field--err", !!msg);
    var err = field.querySelector(".field__err");
    if (err) err.textContent = msg || "";
  }

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    var ok = true;
    var data = {};
    [["name", "Bitte teile uns deinen Namen mit."],
     ["email", "Bitte eine gültige E-Mail-Adresse angeben."],
     ["eventType", "Bitte einen Service auswählen."],
     ["message", "Eine kurze Notiz hilft uns bei der Vorbereitung."]].forEach(function (pair) {
      var name = pair[0];
      var el = form.elements[name];
      var v = (el.value || "").trim();
      data[name] = v;
      var msg = "";
      if (!v) msg = pair[1];
      else if (name === "email" && !emailRe.test(v)) msg = "Diese E-Mail-Adresse sieht nicht richtig aus.";
      if (msg) ok = false;
      setErr(name, msg);
    });
    return ok;
  }

  // clear error on input
  ["name", "email", "eventType", "message"].forEach(function (name) {
    var el = form.elements[name];
    if (el) el.addEventListener("input", function () { setErr(name, ""); });
    if (el) el.addEventListener("change", function () { setErr(name, ""); });
  });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!validate()) {
      var firstErr = form.querySelector(".field--err input, .field--err select, .field--err textarea");
      if (firstErr) firstErr.focus();
      return;
    }
    form.classList.add("sent");
    var nameVal = (form.elements.name.value || "").trim().split(" ")[0];
    var hi = document.getElementById("successName");
    if (hi && nameVal) hi.textContent = ", " + nameVal;
  });

  var resetBtn = document.getElementById("formReset");
  if (resetBtn) resetBtn.addEventListener("click", function () {
    form.reset();
    form.classList.remove("sent");
    ["name", "email", "eventType", "message"].forEach(function (n) { setErr(n, ""); });
  });
})();
