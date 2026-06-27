/* CloudFen — shared site interactions (vanilla, no deps) */
(function () {
  "use strict";
  var body = document.body;

  // ---- preloader: real progress driven by image loading, then hand off on full load ----
  (function () {
    var pre = document.getElementById("cfPreload");
    if (!pre) return;
    var root = document.documentElement;
    root.classList.add("cf-locked");

    // full brand moment on first visit; snappier loader on in-session page-to-page
    var seen = false;
    try { seen = sessionStorage.getItem("cf_seen") === "1"; sessionStorage.setItem("cf_seen", "1"); } catch (e) {}

    var track = pre.querySelector(".cf-preload-track");
    var fill = track ? track.querySelector("span") : null;
    var txt = pre.querySelector(".cf-preload-txt");
    if (track) track.classList.add("cf-det");

    var imgs = Array.prototype.slice.call(document.images || []);
    var total = imgs.length + 1; // +1 step reserved for the final window 'load'
    var done = 0, pct = 0;
    function setPct(p) {
      p = Math.max(pct, Math.min(100, Math.round(p))); // monotonic — the bar never jumps backwards
      pct = p;
      if (fill) fill.style.width = p + "%";
      if (txt) txt.textContent = p + "%";
    }
    function bump() { done++; setPct(Math.min(96, done / total * 100)); } // hold the last 4% for 'load'
    imgs.forEach(function (img) {
      if (img.complete) bump();
      else { img.addEventListener("load", bump); img.addEventListener("error", bump); }
    });
    setPct(Math.min(96, done / total * 100)); // reflect already-cached images immediately

    var start = Date.now();
    var MIN = seen ? 280 : 650, hidden = false;
    function hide() {
      if (hidden) return; hidden = true;
      setPct(100); // fill to 100 before the curtain lifts
      var wait = Math.max(0, MIN - (Date.now() - start)); // avoid a jarring flash on fast loads
      setTimeout(function () {
        pre.classList.add("cf-done");
        root.classList.remove("cf-locked");
        setTimeout(function () { if (pre.parentNode) pre.parentNode.removeChild(pre); }, 750);
      }, wait);
    }
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide);
    setTimeout(hide, 4500); // safety: never trap the user behind the loader
  })();

  // ---- scroll progress bar ----
  var prog = document.createElement("div");
  prog.className = "cf-progress";
  prog.setAttribute("aria-hidden", "true");
  body.appendChild(prog);

  var menuBtn = document.querySelector(".menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      body.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded", body.classList.contains("menu-open") ? "true" : "false");
    });
  }
  // mobile dropdown accordions
  document.querySelectorAll(".nav .has > a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (window.matchMedia("(max-width:1040px)").matches) {
        e.preventDefault();
        a.parentElement.classList.toggle("open");
      }
    });
  });
  // close menu on real link tap
  document.querySelectorAll(".nav a").forEach(function (a) {
    a.addEventListener("click", function () {
      var href = a.getAttribute("href");
      if (href && href.charAt(0) !== "#" && window.matchMedia("(max-width:1040px)").matches) {
        body.classList.remove("menu-open");
      }
    });
  });
  // sticky header + back to top
  var hdr = document.querySelector(".hdr");
  var toTop = document.querySelector(".to-top");
  function onScroll() {
    if (hdr) hdr.classList.toggle("scrolled", window.scrollY > 12);
    if (toTop) toTop.classList.toggle("show", window.scrollY > 520);
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    prog.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  // reveal on scroll
  var rv = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && rv.length) {
    var io = new IntersectionObserver(function (es) {
      var shown = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        // cascade items that enter together (grids stagger instead of popping at once)
        e.target.style.transitionDelay = (Math.min(shown, 8) * 0.07) + "s";
        e.target.classList.add("in");
        io.unobserve(e.target);
        shown++;
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add("in"); }); }

  // ---- scroll-triggered word-by-word text animation (.tx) ----
  var txEls = document.querySelectorAll(".tx");
  txEls.forEach(function (el) {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach(function (word, i) {
      var w = document.createElement("span");
      w.className = "w";
      var inner = document.createElement("span");
      inner.textContent = word;
      inner.style.animationDelay = (i * 0.06) + "s";
      w.appendChild(inner);
      el.appendChild(w);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  });
  if ("IntersectionObserver" in window && txEls.length) {
    var txo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); txo.unobserve(e.target); } });
    }, { threshold: 0.2, rootMargin: "0px 0px -30px 0px" });
    txEls.forEach(function (el) { txo.observe(el); });
  } else { txEls.forEach(function (el) { el.classList.add("in"); }); }

  // ---- FAQ accordion ----
  document.querySelectorAll(".qa-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var qa = btn.closest(".qa");
      var panel = qa.querySelector(".qa-a");
      var open = qa.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0";
    });
  });
  // keep an open answer's height correct if the viewport reflows
  window.addEventListener("resize", function () {
    document.querySelectorAll(".qa.open .qa-a").forEach(function (p) { p.style.maxHeight = p.scrollHeight + "px"; });
  }, { passive: true });

  // ---- click-to-load embed facade (keeps the page fast, loads iframe on demand) ----
  document.querySelectorAll(".embed-facade button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var fac = btn.closest(".embed-facade");
      if (!fac || fac.classList.contains("loaded")) return;
      var fr = document.createElement("iframe");
      fr.src = fac.getAttribute("data-embed");
      fr.title = fac.getAttribute("data-embed-title") || "Embedded form";
      fr.loading = "eager";
      fr.style.height = (fac.getAttribute("data-embed-height") || "640") + "px";
      fr.setAttribute("frameborder", "0");
      fac.classList.add("loaded");
      fac.appendChild(fr);
    });
  });

  // current year
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---- hero 3D parallax (photo behaves like a 3D model) ----
  var heroC = document.querySelector(".hero-c");
  if (heroC && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.matchMedia("(hover: hover)").matches) {
    var bg = heroC.querySelector(".bg");
    var inner = heroC.querySelector(".inner");
    var sheen = heroC.querySelector(".sheen");
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function loop() {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      if (bg) bg.style.transform = "scale(1.06) translate(" + (cx * -26) + "px," + (cy * -20) + "px)";
      if (inner) inner.style.transform = "rotateY(" + (cx * 5) + "deg) rotateX(" + (cy * -5) + "deg) translateZ(40px) translate(" + (cx * 16) + "px," + (cy * 12) + "px)";
      if (sheen) sheen.style.transform = "translate(" + (cx * 40) + "px," + (cy * 30) + "px)";
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) raf = requestAnimationFrame(loop);
      else raf = null;
    }
    heroC.addEventListener("mousemove", function (e) {
      var r = heroC.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      heroC.classList.add("tilt");
      if (!raf) raf = requestAnimationFrame(loop);
    });
    heroC.addEventListener("mouseleave", function () {
      tx = 0; ty = 0; heroC.classList.remove("tilt");
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }

  // ---- page-transition fade on internal navigation ----
  (function () {
    var root = document.documentElement;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    function internal(a) {
      if (!a) return false;
      var t = a.getAttribute("target");
      if (t && t !== "_self") return false;            // new tab / frame
      if (a.hasAttribute("download")) return false;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#") return false;            // on-page anchor
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
      var url;
      try { url = new URL(a.href, window.location.href); } catch (e) { return false; }
      var same = url.origin === window.location.origin ||
                 (url.protocol === "file:" && window.location.protocol === "file:"); // works opened locally too
      if (!same) return false;
      if (url.href === window.location.href) return false;          // exact same page
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return false;
      return true;
    }
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!internal(a)) return;
      e.preventDefault();
      var href = a.href;
      root.classList.add("cf-leaving");
      setTimeout(function () { window.location.href = href; }, 280);
    });
    // restore visibility if the page is served from the back/forward cache
    window.addEventListener("pageshow", function () { root.classList.remove("cf-leaving"); });
  })();
})();
