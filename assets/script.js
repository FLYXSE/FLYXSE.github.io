(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Terminal typing ---------- */

  var output = document.getElementById("terminal-output");
  var status = document.getElementById("terminal-status");
  var cursor = document.querySelector(".terminal-cursor");

  var LINES = [
    { type: "cmd", text: "whoami" },
    { type: "out", text: "FLYXSE // Алексей" },
    { type: "dim", text: "username: @FLYXSE" },
    { type: "dim", text: "location: Belarus" },
    { type: "dim", text: "access: granted" },
    { type: "gap" },
    { type: "cmd", text: "cat role.txt" },
    { type: "out", text: "Python Backend Developer" },
    { type: "out", text: "Telegram Bot Developer" },
    { type: "gap" },
    { type: "cmd", text: "./contact" },
    { type: "out", text: "@FLYXSE — готов обсудить проект" }
  ];

  function makeLine(line) {
    var p = document.createElement("p");
    if (line.type === "gap") {
      p.innerHTML = "&nbsp;";
      return p;
    }

    if (line.type === "cmd") {
      var prompt = document.createElement("span");
      prompt.className = "t-prompt";
      prompt.textContent = "FLYXSE@dev:~$ ";
      p.appendChild(prompt);
      var cmd = document.createElement("span");
      cmd.className = "t-cmd";
      cmd.textContent = line.text;
      p.appendChild(cmd);
    } else {
      var body = document.createElement("span");
      body.className = "t-" + line.type;
      body.textContent = line.text;
      p.appendChild(body);
    }
    return p;
  }

  function buildTerminal(emptySpans) {
    var frag = document.createDocumentFragment();
    var segments = [];

    LINES.forEach(function (line) {
      var p = makeLine(line);
      frag.appendChild(p);

      if (line.type === "gap") return;

      var parts = [];
      p.childNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        parts.push({ span: n, text: n.textContent });
        if (emptySpans) n.textContent = "";
      });
      segments.push({ p: p, parts: parts });
    });

    output.appendChild(frag);
    return segments;
  }

  function renderTerminal() {
    buildTerminal(false);
    if (cursor) cursor.style.display = "none";
    if (status) status.textContent = "готово";
  }

  function typeTerminal() {
    var segments = buildTerminal(true);
    var si = 0;
    var pi = 0;
    var ci = 0;

    function lineDone() {
      if (status) status.textContent = "выполняется…";
      pi = 0;
      ci = 0;
      si++;
      if (si < segments.length) {
        setTimeout(step, 260);
      } else {
        if (status) status.textContent = "готово";
        if (cursor) cursor.style.display = "";
      }
    }

    function step() {
      if (si >= segments.length) return;

      var seg = segments[si];
      var part = seg.parts[pi];

      if (ci >= part.text.length) {
        pi++;
        ci = 0;
        if (pi < seg.parts.length) {
          setTimeout(step, 40);
        } else {
          lineDone();
        }
        return;
      }

      part.span.textContent = part.text.slice(0, ci + 1);
      ci++;
      setTimeout(step, 20);
    }

    setTimeout(step, 300);
  }

  if (output) {
    if (reduceMotion) {
      renderTerminal();
    } else {
      typeTerminal();
    }
  }

  /* ---------- Mobile menu ---------- */

  var navToggle = document.getElementById("nav-toggle");
  var mobileMenu = document.getElementById("mobile-menu");

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      mobileMenu.hidden = open;
      navToggle.setAttribute("aria-label", open ? "Открыть меню" : "Закрыть меню");
    });

    mobileMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        navToggle.setAttribute("aria-expanded", "false");
        mobileMenu.hidden = true;
      }
    });
  }

  /* ---------- Scroll reveal ---------- */

  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Copy email ---------- */

  var copyBtn = document.getElementById("copy-mail");

  if (copyBtn) {
    var labelEl = copyBtn.querySelector(".copy-label");
    var stateEl = copyBtn.querySelector(".copy-state");
    var mail = copyBtn.getAttribute("data-mail");

    copyBtn.addEventListener("click", function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(mail).then(
        function () {
          if (stateEl) stateEl.textContent = "скопировано ✓";
          if (labelEl) labelEl.style.display = "none";
          setTimeout(function () {
            if (stateEl) stateEl.textContent = "";
            if (labelEl) labelEl.style.display = "";
          }, 2200);
        },
        function () { /* clipboard unavailable */ }
      );
    });
  }

  /* ---------- Sticky header shadow ---------- */

  var header = document.querySelector(".site-header");

  if (header && "IntersectionObserver" in window) {
    var sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    header.parentNode.insertBefore(sentinel, header.nextSibling);

    new IntersectionObserver(function (entries) {
      header.style.boxShadow = entries[0].isIntersecting
        ? "none"
        : "0 10px 30px -18px rgba(0,0,0,0.8)";
    }).observe(sentinel);
  }
})();
