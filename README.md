# Creacom – landningssida (väntelista)

Statisk sida på svenska för att validera Creacom (en tjänst från Creacom Consulting AB). Ren HTML/CSS + lite JS, inget byggsteg – passar GitHub Pages direkt.

## Filer
- `index.html` – hela sidan (hero, problem, flöde, värde, preliminära priser, FAQ, väntelista)
- `assets/styles.css`, `assets/app.js`
- `assets/logo.svg`, `assets/logo-light.svg` – ordmärke (text konverterad till kurvor)
- `favicon.svg`, `assets/favicon-32.png`, `assets/apple-touch-icon.png`, `assets/og.png` (1200×630)
- `assets/fonts/` – självhostade typsnitt (Bricolage Grotesque, Inter; SIL OFL, licenser bifogade). Inga externa anrop.
- `screenshots/` – kontrollbilder (desktop 1280 px, mobil 390 px)

## Formuläret
Konfigureras högst upp i `assets/app.js`:

```js
const FORM_ENDPOINT = "";   // t.ex. "https://formspree.io/f/xxxxxxxx"
const CONTACT_EMAIL = "";   // visas i sidfoten när den är ifylld
```

- **Tom `FORM_ENDPOINT` (nu):** inget skickas eller sparas. Besökaren ser en bekräftelse med en liten notis om att formuläret inte är kopplat än.
- **Ifylld:** POST med JSON (`email`, `built`, `prebook_founder` = ja/nej, `source`) och `Accept: application/json` – fungerar med Formspree (och liknande tjänster som tar emot JSON). Fältet `_gotcha` är en bot-fälla.
- Tänk på GDPR: välj en tjänst med EU-lagring eller avtal, och lägg gärna till en kort integritetstext.

## Köra lokalt
```
python3 -m http.server 8765
```
och öppna http://127.0.0.1:8765/

## Före publicering
- Byt `og:image`/`twitter:image` till absolut URL (`https://<domän>/assets/og.png`) och lägg till `og:url`.
- Vid egen domän på GitHub Pages: lägg till en `CNAME`-fil.
- Priserna är preliminära (exkl. moms) och märkta så på sidan.
