/* Creacom landing – minimal JS */

/* ===================== KONFIGURATION =====================
 * FORM_ENDPOINT: URL som formuläret skickas till (t.ex. Formspree:
 *   "https://formspree.io/f/xxxxxxxx"). Tom sträng = INGET skickas eller
 *   sparas; besökaren får bara en vänlig bekräftelse (förhandsvisningsläge).
 * CONTACT_EMAIL: visas i sidfoten när den är ifylld. Tom = dold.
 * ========================================================= */
const FORM_ENDPOINT = "";
const CONTACT_EMAIL = "";

(function () {
  "use strict";

  // Sticky header border on scroll
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Contact e-mail (only if configured)
  if (CONTACT_EMAIL) {
    const wrap = document.getElementById("contact");
    const link = document.getElementById("contact-link");
    if (wrap && link) {
      link.href = "mailto:" + CONTACT_EMAIL;
      link.textContent = CONTACT_EMAIL;
      wrap.hidden = false;
    }
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

    const interests = interestBoxes.filter((b) => b.checked).map((b) => b.value);
    const thanks =
      "<strong>Tack! Du står på väntelistan.</strong>" +
      (interests.length ? "Vi har noterat ditt intresse för: " + esc(interests.join(", ")) + ". " : "") +
      "Vi hör av oss när du kan testa din app.";

    if (!FORM_ENDPOINT) {
      // Preview mode: nothing is sent or stored.
      console.info("[Creacom] FORM_ENDPOINT är inte satt – formulärdata skickades inte och sparades inte.");
      show(thanks + "<small>Förhandsvisning: formuläret är inte kopplat ännu, så inget sparades.</small>");
      form.reset();
      return;
    }

    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = "Skickar…";
    try {
      const data = {
        email: email.value.trim(),
        built: form.built.value.trim(),
        interests: interests.join(", "),
        source: "creacom-landing",
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
      show("<strong>Något gick fel.</strong>Det gick inte att skicka just nu. Försök igen om en stund.", true);
    } finally {
      submit.disabled = false;
      submit.textContent = original;
    }
  });
})();
