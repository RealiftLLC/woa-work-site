/* WOA for Work — page behavior: mobile menu, break-even calculator, lead form. */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
     LEAD FORM SETTINGS
     Leave FORM_ENDPOINT empty and the form opens a pre-filled email
     to LEAD_EMAIL. Paste a form endpoint (Formspree, Klaviyo, AWS
     Lambda URL, etc.) to send submissions there instead.
     --------------------------------------------------------------- */
  var FORM_ENDPOINT = "";
  var LEAD_EMAIL = "ron@tailorstep.co";
  var PAIR_PRICE = 185;
  var EMPLOYER_SHARE = 0.25;

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");
  if (toggle && menu) {
    var setOpen = function (open) {
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", function () {
      setOpen(!menu.classList.contains("open"));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------- Break-even calculator ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var inputs = ["calc-employees", "calc-turnover", "calc-salary", "calc-share"].map($);
  var num = function (el) {
    var n = parseFloat(String(el.value).replace(/[^0-9.]/g, ""));
    return isFinite(n) && n > 0 ? n : 0;
  };
  var money = function (v) { return "$" + Math.round(v).toLocaleString("en-US"); };

  function recalc() {
    var n = num(inputs[0]);
    var t = num(inputs[1]) / 100;
    var perLeaver = num(inputs[2]) * (num(inputs[3]) / 100);
    var departures = Math.round(n * t);
    var turnoverCost = n * t * perLeaver;
    var programCost = n * PAIR_PRICE * EMPLOYER_SHARE;
    var breakEven = perLeaver > 0 ? Math.ceil(programCost / perLeaver) : 0;
    var pct = turnoverCost > 0 ? (programCost / turnoverCost) * 100 : 0;
    $("out-turnover").textContent = money(turnoverCost);
    $("out-program").textContent = money(programCost);
    $("out-pct").textContent = (pct >= 10 ? Math.round(pct) : pct.toFixed(1)) + "%";
    $("out-breakeven").textContent = breakEven.toLocaleString("en-US");
    $("out-departures").textContent = departures.toLocaleString("en-US");
  }
  if (inputs.every(Boolean)) {
    inputs.forEach(function (el) { el.addEventListener("input", recalc); });
    recalc();
  }

  var printBtn = $("print-btn");
  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

  /* ---------- Video: make sure it starts muted on iOS ---------- */
  var video = document.querySelector(".video-box video");
  if (video) {
    video.muted = true;
    var p = video.play && video.play();
    if (p && p.catch) p.catch(function () {});
  }

  /* ---------- Lead form ---------- */
  var form = $("lead-form");
  var status = $("form-status");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var missing = ["name", "title", "organization", "email"].filter(function (k) {
        return !String(data.get(k) || "").trim();
      });
      var email = String(data.get("email") || "").trim();
      if (missing.length || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        status.textContent = "Please fill in your name, title, organization and a valid work email.";
        var first = form.querySelector(missing.length ? "[name=" + missing[0] + "]" : "[name=email]");
        if (first) first.focus();
        return;
      }

      if (FORM_ENDPOINT) {
        status.textContent = "Sending…";
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: data
        }).then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          form.reset();
          status.textContent = "Thanks. We'll be in touch within one business day to book your call.";
        }).catch(function () {
          status.textContent = "Something went wrong. Please email " + LEAD_EMAIL + " and we'll get back to you.";
        });
        return;
      }

      var lines = [];
      data.forEach(function (v, k) { lines.push(k.charAt(0).toUpperCase() + k.slice(1) + ": " + v); });
      var subject = "WOA for Work: call request from " + (data.get("organization") || "");
      window.location.href = "mailto:" + LEAD_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      status.textContent = "Your email app should open with your details filled in. Just press send.";
    });
  }
})();
