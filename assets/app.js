/* Creacom landing – minimal JS */

/* ===================== KONFIGURATION =====================
 * FORM_ENDPOINT: URL som formuläret skickas till (t.ex. Formspree:
 *   "https://formspree.io/f/xxxxxxxx"). Tom sträng = INGET skickas eller
 *   sparas; besökaren får bara en vänlig bekräftelse (förhandsvisningsläge).
 * CONTACT_EMAIL: kontaktadress. Sidfoten (och integritetspolicyn) har en
 *   statisk reservlänk i HTML till samma adress, så den syns även utan JS.
 *   Byter ni adress: ändra här OCH i HTML (index.html, integritetspolicy.html,
 *   en/index.html, en/privacy.html).
 * Texter: formulärets meddelanden finns på svenska och engelska i TEXTS nedan.
 *   Språket väljs utifrån <html lang="..."> (en* = engelska, annars svenska).
 * ========================================================= */
const FORM_ENDPOINT = "";
const CONTACT_EMAIL = "info@creacom.se";

(function () {
  "use strict";

  const TEXTS = {
    sv: {
      thanks: "Tack! Du står på väntelistan.",
      noted: "Vi har noterat ditt intresse för: ",
      followUp: "Vi hör av oss när du kan testa din app.",
      preview: "Förhandsvisning: formuläret är inte kopplat ännu, så inget sparades.",
      previewLog: "[Creacom] FORM_ENDPOINT är inte satt – formulärdata skickades inte och sparades inte.",
      sending: "Skickar…",
      errorTitle: "Något gick fel.",
      errorBody: "Det gick inte att skicka just nu. Försök igen om en stund.",
      invalidEmail: "Skriv en giltig e-postadress.",
    },
    en: {
      thanks: "Thanks! You're on the waitlist.",
      noted: "We've noted your interest in: ",
      followUp: "We'll be in touch when you can test your app.",
      preview: "Preview: the form isn't connected yet, so nothing was saved.",
      previewLog: "[Creacom] FORM_ENDPOINT is not set – form data was not sent or stored.",
      sending: "Sending…",
      errorTitle: "Something went wrong.",
      errorBody: "We couldn't send your sign-up right now. Please try again in a moment.",
      invalidEmail: "Please enter a valid email address.",
    },
  };
  const LANG = /^en\b/i.test(document.documentElement.lang || "") ? "en" : "sv";
  const T = TEXTS[LANG];

  // Sticky header border on scroll
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Contact e-mail: keeps every [data-contact-email] link in sync with CONTACT_EMAIL
  // (the HTML already contains a static fallback with the same address).
  if (CONTACT_EMAIL) {
    document.querySelectorAll("[data-contact-email]").forEach((link) => {
      link.href = "mailto:" + CONTACT_EMAIL;
      link.textContent = CONTACT_EMAIL;
    });
    const wrap = document.getElementById("contact");
    if (wrap) wrap.hidden = false;
  }

  const form = document.getElementById("waitlist-form");
  if (!form) return;
  const email = form.querySelector("#email");
  const emailErr = form.querySelector("#email-err");
  const interestBoxes = Array.from(form.querySelectorAll('input[name="interests"]'));
  const status = document.getElementById("form-status");
  const submit = form.querySelector('button[type="submit"]');

  // Buttons with data-interest="testpaket|butikskollen|bevakning|publicering" pre-tick that interest
  document.querySelectorAll("[data-interest]").forEach((el) =>
    el.addEventListener("click", () => {
      const box = interestBoxes.find((b) => b.dataset.key === el.dataset.interest);
      if (box) box.checked = true;
    })
  );

  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  const setError = (on) => {
    email.setAttribute("aria-invalid", on ? "true" : "false");
    if (on) emailErr.textContent = T.invalidEmail;
    emailErr.hidden = !on;
  };
  email.addEventListener("input", () => { if (email.getAttribute("aria-invalid") === "true" && validEmail(email.value)) setError(false); });

  const esc = (t) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const show = (html, isError) => {
    status.innerHTML = html;
    status.classList.toggle("is-error", !!isError);
    status.focus({ preventScroll: true });
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validEmail(email.value)) { setError(true); email.focus(); return; }
    setError(false);
    if (form._gotcha && form._gotcha.value) return; // bot trap

    const checked = interestBoxes.filter((b) => b.checked);
    // Data: samma nycklar (value) på alla språk. Visning: etiketten på sidans språk.
    const interests = checked.map((b) => b.value);
    const labels = checked.map((b) => (b.closest("label") ? b.closest("label").textContent.trim() : b.value));
    const thanks =
      "<strong>" + T.thanks + "</strong>" +
      (labels.length ? T.noted + esc(labels.join(", ")) + ". " : "") +
      T.followUp;

    if (!FORM_ENDPOINT) {
      // Preview mode: nothing is sent or stored.
      console.info(T.previewLog);
      show(thanks + "<small>" + T.preview + "</small>");
      form.reset();
      return;
    }

    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = T.sending;
    try {
      const data = {
        email: email.value.trim(),
        built: form.built.value.trim(),
        interests: interests.join(", "),
        source: "creacom-landing",
        lang: LANG,
      };
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      show(thanks);
      form.reset();
    } catch (err) {
      show("<strong>" + T.errorTitle + "</strong>" + T.errorBody, true);
    } finally {
      submit.disabled = false;
      submit.textContent = original;
    }
  });
})();
