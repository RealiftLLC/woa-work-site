/* WOA for Work — page behavior: mobile menu, break-even calculator, lead form. */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
     LEAD FORM SETTINGS
     Submissions go to Klaviyo as a "WOA for Work Call Request" event
     on the visitor's profile. A Klaviyo flow triggered by that event
     emails the team. KLAVIYO_SITE_ID is the account's PUBLIC site ID,
     made for use in website code (never put a private key here).
     If Klaviyo can't be reached, the form falls back to opening a
     pre-filled email to LEAD_EMAIL.
     --------------------------------------------------------------- */
  var KLAVIYO_SITE_ID = "XBCc5e";
  var KLAVIYO_EVENT = "WOA for Work Call Request";
  var KLAVIYO_REVISION = "2026-07-15";
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

      var lead = {
        name: String(data.get("name") || "").trim(),
        title: String(data.get("title") || "").trim(),
        organization: String(data.get("organization") || "").trim(),
        email: email,
        employees: String(data.get("employees") || "").trim() || "Not given",
        program: String(data.get("program") || "").trim() || "Not sure"
      };
      var parts = lead.name.split(/\s+/);
      var firstName = parts.shift() || "";
      var lastName = parts.join(" ");
      var button = form.querySelector("button[type=submit]");
      if (button) button.disabled = true;
      status.textContent = "Sending…";

      var payload = {
        data: {
          type: "event",
          attributes: {
            properties: {
              Name: lead.name,
              Title: lead.title,
              Organization: lead.organization,
              Email: lead.email,
              Employees: lead.employees,
              Program: lead.program,
              Page: window.location.href
            },
            metric: { data: { type: "metric", attributes: { name: KLAVIYO_EVENT } } },
            profile: {
              data: {
                type: "profile",
                attributes: {
                  email: lead.email,
                  first_name: firstName,
                  last_name: lastName,
                  title: lead.title,
                  organization: lead.organization,
                  properties: {
                    "B2B Lead": true,
                    "B2B Employees On Their Feet": lead.employees,
                    "B2B Program Of Interest": lead.program,
                    "B2B Lead Source": "work.woashoes.com"
                  }
                }
              }
            }
          }
        }
      };

      fetch("https://a.klaviyo.com/client/events/?company_id=" + encodeURIComponent(KLAVIYO_SITE_ID), {
        method: "POST",
        headers: {
          "Accept": "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          "revision": KLAVIYO_REVISION
        },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        status.textContent = "Thanks, " + (firstName || "we got it") + ". We'll be in touch within one business day to book your call.";
      }).catch(function () {
        var lines = [
          "Name: " + lead.name, "Title: " + lead.title, "Organization: " + lead.organization,
          "Work email: " + lead.email, "Employees on their feet: " + lead.employees, "Program of interest: " + lead.program
        ];
        window.location.href = "mailto:" + LEAD_EMAIL +
          "?subject=" + encodeURIComponent("WOA for Work: call request from " + lead.organization) +
          "&body=" + encodeURIComponent(lines.join("\n"));
        status.textContent = "Your email app should open with your details filled in. Just press send.";
      }).then(function () {
        if (button) button.disabled = false;
      });
    });
  }
})();
