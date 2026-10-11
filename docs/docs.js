/* Creacom – lösenordsskyddade dokument.
   Filerna i docs/files/*.enc är krypterade med AES-256-GCM. Nyckeln härleds ur
   lösenordet med PBKDF2-SHA256 (parametrar i manifest.json). Allt sker lokalt i
   webbläsaren; lösenordet skickas inte och sparas inte (inga cookies/localStorage). */
(function () {
  "use strict";
  var form = document.getElementById("unlock-form");
  var input = document.getElementById("docs-password");
  var btn = document.getElementById("unlock-btn");
  var msg = document.getElementById("docs-msg");
  var panel = document.getElementById("docs-unlocked");
  var list = document.getElementById("docs-list");
  var lockBtn = document.getElementById("lock-btn");
  var urls = [];

  function setMsg(text, isError) {
    msg.textContent = text;
    msg.classList.toggle("is-error", !!isError);
  }
  function b64(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function fmtSize(n) {
    return n >= 1048576 ? (n / 1048576).toFixed(1).replace(".", ",") + " MB"
                        : Math.max(1, Math.round(n / 1024)) + " kB";
  }
  async function deriveKey(password, salt, kdf) {
    var base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password),
      "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", hash: kdf.hash || "SHA-256", salt: salt, iterations: kdf.iterations },
      base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  }
  async function fetchBytes(url) {
    var r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error("fetch " + r.status);
    return r.arrayBuffer();
  }
  function lock() {
    urls.forEach(function (u) { URL.revokeObjectURL(u); });
    urls = [];
    list.textContent = "";
    panel.hidden = true;
    form.hidden = false;
    input.value = "";
    setMsg("");
    input.focus();
  }

  function render(docs) {
    list.textContent = "";
    docs.forEach(function (d) {
      var url = URL.createObjectURL(d.blob);
      urls.push(url);
      var li = document.createElement("li");
      var name = document.createElement("span");
      name.className = "doc-name";
      name.textContent = d.name;
      var dl = document.createElement("a");
      dl.className = "btn btn-sm btn-ink";
      dl.href = url;
      dl.download = d.filename;
      dl.textContent = "Ladda ner";
      dl.setAttribute("aria-label", "Ladda ner " + d.name);
      dl.dataset.docId = d.id;
      li.appendChild(name);
      if (d.mime === "application/pdf") {
        var view = document.createElement("a");
        view.className = "btn btn-sm btn-ghost";
        view.href = url;
        view.target = "_blank";
        view.rel = "noopener";
        view.textContent = "Visa PDF";
        li.appendChild(view);
      }
      li.appendChild(dl);
      var size = document.createElement("span");
      size.className = "doc-size";
      size.textContent = d.filename + " · " + fmtSize(d.blob.size);
      li.appendChild(size);
      list.appendChild(li);
    });
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var password = input.value;
    if (!password) {
      input.setAttribute("aria-invalid", "true");
      setMsg("Skriv in lösenordet.", true);
      return;
    }
    if (!window.crypto || !crypto.subtle) {
      setMsg("Din webbläsare saknar stöd för dekryptering (Web Crypto). Prova en annan webbläsare.", true);
      return;
    }
    btn.disabled = true;
    input.removeAttribute("aria-invalid");
    setMsg("Låser upp…");
    try {
      var r = await fetch("manifest.json", { cache: "no-store" });
      if (!r.ok) throw new Error("manifest " + r.status);
      var manifest = await r.json();
      var out = [];
      for (var i = 0; i < manifest.files.length; i++) {
        var f = manifest.files[i];
        var salt = b64(f.salt), iv = b64(f.iv);
        var key = await deriveKey(password, salt, manifest.kdf);
        var data = await fetchBytes(f.file);
        var plain;
        try {
          plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
        } catch (err) {
          var wrong = new Error("wrong-password");
          wrong.wrongPassword = true;
          throw wrong;
        }
        out.push({ id: f.id, name: f.name, filename: f.filename, mime: f.mime,
                   blob: new Blob([plain], { type: f.mime }) });
      }
      password = null;
      input.value = "";
      render(out);
      form.hidden = true;
      panel.hidden = false;
      setMsg("");
    } catch (err) {
      if (err && err.wrongPassword) {
        input.setAttribute("aria-invalid", "true");
        setMsg("Fel lösenord. Försök igen.", true);
        input.select();
      } else {
        setMsg("Kunde inte hämta dokumenten. Kontrollera anslutningen och försök igen.", true);
      }
    } finally {
      btn.disabled = false;
    }
  });
  lockBtn.addEventListener("click", lock);
})();
