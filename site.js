(function () {
  /* Paste the form action URL from Brevo (Contacts > Forms > Share > HTML code) to activate signups. */
  var BREVO_FORM_URL = "https://253f151a.sibforms.com/serve/MUIFABXzD-B7kNbgUkeVGRwOWKZ83fWfd0_VfhhvlHX4y0awDB5fXIeu_I4_7jzA1t9iIU8yvd6QqiJxPyUXRXfGJuU10Bjm8O5hWZYJExhXVLzF4Ug7_M8aMip5C48N5J825UW7n3lHmQxx4KdmzvUHg8fk4_tAY4Re4WH9gghQYzBP-I6HJrcfs4j5vtqvATnDVVS6ZXMJ8ns1Ig==";
  var BREVO_DOUBLE_OPTIN = false;

  /* Add each published issue here, newest first. */
  var ISSUES = [
    /* { no: 1, date: "2026-11", title: { en: "Title", fr: "Titre" }, summary: { en: "...", fr: "..." }, url: "https://..." } */
  ];

  document.querySelectorAll(".page").forEach(function (p) {
    Array.prototype.filter.call(p.children, function (c) { return c.classList.contains("section"); })
      .forEach(function (s, i) { if (i % 2 === 0) s.classList.add("sand"); });
  });

  var root = document.documentElement;
  var pages = ["home", "about", "services", "newsletter", "contact", "legal"];
  var lang = "en";

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function setLang(l) {
    lang = l === "fr" ? "fr" : "en";
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    document.getElementById("lang-en").setAttribute("aria-pressed", String(lang === "en"));
    document.getElementById("lang-fr").setAttribute("aria-pressed", String(lang === "fr"));
    document.querySelectorAll("[data-ph-en]").forEach(function (el) {
      el.setAttribute("placeholder", el.getAttribute("data-ph-" + lang));
    });
    renderIssues();
    store("pheole-lang", lang);
  }

  function show(page, focus) {
    if (pages.indexOf(page) < 0) page = "home";
    document.querySelectorAll(".page").forEach(function (s) { s.hidden = s.getAttribute("data-page") !== page; });
    document.querySelectorAll(".nav a").forEach(function (a) {
      if (a.getAttribute("data-link") === page) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    document.getElementById("nav").classList.remove("open");
    document.getElementById("menu-btn").setAttribute("aria-expanded", "false");
    if (focus) window.scrollTo(0, 0);
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-link]");
    if (!a) return;
    e.preventDefault();
    var p = a.getAttribute("data-link");
    show(p, true);
    try { history.replaceState(null, "", "#" + p); } catch (err) {}
  });
  window.addEventListener("hashchange", function () { show(location.hash.slice(1), true); });

  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });

  var menuBtn = document.getElementById("menu-btn");
  menuBtn.addEventListener("click", function () {
    var nav = document.getElementById("nav");
    var open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var el = document.getElementById(b.getAttribute("data-copy"));
      var text = el.textContent.trim();
      var done = function () {
        var old = b.innerHTML;
        b.innerHTML = lang === "fr" ? "Copié" : "Copied";
        setTimeout(function () { b.innerHTML = old; }, 1600);
      };
      var fallback = function () {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      };
      try {
        navigator.clipboard.writeText(text).then(done, fallback);
      } catch (err) { fallback(); }
    });
  });

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function renderIssues() {
    var box = document.getElementById("issues");
    if (!ISSUES.length) {
      box.innerHTML = '<div class="empty">' + (lang === "fr"
        ? "Le premier numéro est en préparation. Les abonnés le recevront en premier, et il sera ensuite disponible ici."
        : "The first issue is in preparation. Subscribers receive it first, and it will then be available here.") + "</div>";
      return;
    }
    box.innerHTML = ISSUES.map(function (i) {
      var t = i.title[lang] || i.title.en, s = (i.summary && (i.summary[lang] || i.summary.en)) || "";
      return '<article class="issue"><span class="no">N° ' + esc(i.no) + " · " + esc(i.date) + '</span><div class="stack" style="gap:4px"><h3><a href="' + esc(i.url) + '" target="_blank" rel="noopener">' + esc(t) + "</a></h3><p>" + esc(s) + "</p></div></article>";
    }).join("");
  }

  var form = document.getElementById("nl-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var err = document.getElementById("nl-err");
    var status = document.getElementById("nl-status");
    var email = document.getElementById("nl-email");
    var consent = document.getElementById("nl-consent");
    err.textContent = "";
    status.hidden = true;
    if (!email.value || !email.checkValidity()) {
      err.textContent = lang === "fr" ? "Saisissez une adresse e-mail valide, par exemple nom@entreprise.com." : "Enter a valid email address, for example name@company.com.";
      email.focus();
      return;
    }
    if (!consent.checked) {
      err.textContent = lang === "fr" ? "Cochez la case de consentement pour vous abonner." : "Tick the consent box to subscribe.";
      consent.focus();
      return;
    }
    if (!BREVO_FORM_URL) {
      status.className = "status wait";
      status.textContent = lang === "fr"
        ? "Les inscriptions ouvrent très prochainement. En attendant, écrivez-nous depuis la page Contact."
        : "Signups open very soon. In the meantime, write to us from the Contact page.";
      status.hidden = false;
      return;
    }
    var btn = document.getElementById("nl-submit");
    btn.disabled = true;
    var fd = new FormData(form);
    fd.append("email_address_check", "");
    fd.append("locale", lang === "fr" ? "fr" : "en");
    fd.append("html_type", "simple");
    fetch(BREVO_FORM_URL, { method: "POST", mode: "no-cors", body: new URLSearchParams(fd) })
      .then(function () {
        status.className = "status ok";
        status.textContent = BREVO_DOUBLE_OPTIN
          ? (lang === "fr" ? "Merci. Consultez votre boîte de réception pour confirmer votre inscription." : "Thank you. Check your inbox to confirm your subscription.")
          : (lang === "fr" ? "Merci, votre inscription est enregistrée." : "Thank you, your subscription is registered.");
        status.hidden = false;
        form.reset();
      })
      .catch(function () {
        err.textContent = lang === "fr"
          ? "L’inscription n’a pas pu être envoyée. Vérifiez votre connexion puis réessayez."
          : "The signup could not be sent. Check your connection and try again.";
      })
      .then(function () { btn.disabled = false; });
  });

  var saved = read("pheole-lang");
  var initial = saved || ((navigator.language || "en").toLowerCase().indexOf("fr") === 0 ? "fr" : "en");
  setLang(initial);
  show(location.hash.slice(1) || "home", false);
})();
