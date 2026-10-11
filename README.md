# Creacom – landningssida (väntelista)

Statisk sida på svenska för att validera Creacom (en tjänst från Creacom Consulting AB). Ren HTML/CSS + lite JS, inget byggsteg – passar GitHub Pages direkt.

## Filer
- `index.html` – hela sidan (hero, problem, kravtester, Butikskollen, flöde/vision, ansvar, preliminära priser, FAQ, väntelista)
- `integritetspolicy.html` – integritetspolicy (svenska, GDPR) för väntelistan; länkas från formuläret, FAQ och sidfoten
- `en/index.html`, `en/privacy.html` – engelsk version (https://pistpejl.github.io/creacom/en/), samma design och sektioner; återanvänder `../assets/`
- `assets/styles.css`, `assets/app.js`
- `assets/logo.svg`, `assets/logo-light.svg` – ordmärke (text konverterad till kurvor)
- `favicon.svg`, `assets/favicon-32.png`, `assets/apple-touch-icon.png`, `assets/og.png` (1200×630, svenska), `assets/og-en.png` (1200×630, engelska, samma stil)
- `assets/fonts/` – självhostade typsnitt (Bricolage Grotesque, Inter; SIL OFL, licenser bifogade). Inga externa anrop.
- `screenshots/` – kontrollbilder (desktop 1280 px, mobil 390 px), ignoreras av git

## Formuläret
Konfigureras högst upp i `assets/app.js`:

```js
const FORM_ENDPOINT = "";   // t.ex. "https://formspree.io/f/xxxxxxxx"
const CONTACT_EMAIL = "info@creacom.se";   // kontaktadress i sidfot/integritetspolicy
```

- **Tom `FORM_ENDPOINT` (nu):** inget skickas eller sparas. Besökaren ser en bekräftelse med en liten notis om att formuläret inte är kopplat än.
- **Ifylld:** POST med JSON (`email`, `built`, `interests` = kommaseparerad lista av valda intressen, t.ex. "Testpaket, Butikskollen", `source`) och `Accept: application/json` – fungerar med Formspree (och liknande tjänster som tar emot JSON). Fältet `_gotcha` är en bot-fälla. Knappar med `data-interest="testpaket|butikskollen|bevakning|publicering"` kryssar i motsvarande intresse i formuläret.
- Kontaktadressen finns även som statisk reservlänk i HTML (sidfoten i båda sidorna samt i integritetspolicyn), så den syns utan JS. Byts adressen: ändra `CONTACT_EMAIL` **och** HTML-länkarna (`data-contact-email`).

## Språk (svenska / engelska)
- Svenska är huvudspråk (`/`, `x-default`), engelska ligger under `/en/`. Sidpar: `index.html` ↔ `en/index.html`, `integritetspolicy.html` ↔ `en/privacy.html`.
- Alla fyra sidor har en liten **SV / EN**-växlare i sidhuvudet, korrekt `<html lang>`, `<link rel="canonical">` och `<link rel="alternate" hreflang="sv|en|x-default">` med absoluta URL:er. Ingen automatisk omdirigering efter webbläsarspråk och inga cookies.
- På smala skärmar (≤ 480 px) visar sidhuvudets knapp kortversionen ("Väntelista" / "Waitlist"); navigationslänkarna döljs ≤ 980 px så att växlaren får plats.
- `assets/app.js` väljer formulärtexter (fel, tack, förhandsvisning, "skickar…") efter `document.documentElement.lang` (`TEXTS.sv` / `TEXTS.en`). Intressenas `value` är samma svenska nycklar på båda språken (data blir jämförbar); bekräftelsen visar etiketten på sidans språk. JSON-posten innehåller även `lang` ("sv"/"en").
- Engelska produktnamn: Kravtester = Requirement tests, Butikskollen = Store Check, Testpaket = Test Pack, Bevakning = Monitoring, Publicering = Publishing.
- Priser på engelska sidan: samma SEK-priser (excl. VAT) + ungefärligt belopp i EUR i liten text ("approx. €26"). Kurs: ECB:s referenskurs 2026-10-09, 1 EUR = 11,1675 SEK; under 100 € avrundat till heltal, däröver till närmaste 5 €. Ändras priser eller vill ni uppdatera kursen: ändra både beloppen och noten (`.fx-note`) i `en/index.html`.
- **Ändrar ni text på en sida – ändra motsvarande sida på det andra språket också.** Kontaktadressen finns i båda språkens HTML (`data-contact-email`).

## Integritet / GDPR
- `integritetspolicy.html` beskriver behandlingen för väntelistan: personuppgiftsansvarig Creacom Consulting AB (info@creacom.se), uppgifter (e-post, frivilligt "Vad har du byggt?", valda intressen, tidpunkt), syfte, rättslig grund samtycke (art. 6.1 a), lagring tills avregistrering men högst 24 månader, mottagare, GitHub Pages (IP-loggning, EU–US Data Privacy Framework), inga cookies, rättigheter och IMY.
- Under knappen i formuläret står en informationsrad med länk till policyn. Att skicka formuläret = samtycke med tydlig information (ingen extra kryssruta).
- Sidan använder inga cookies, ingen analys/spårning och inga externa typsnitt eller skript. **Lägger ni till något sådant måste policyn (och ev. samtyckesbanner) uppdateras.**
- **TODO när formuläret kopplas in:** välj en formulärtjänst med lagring inom EU/EES (t.ex. Tally), teckna personuppgiftsbiträdesavtal och namnge tjänsten i policyn (se HTML-kommentaren `TODO` i `integritetspolicy.html`). Samma sak för e-posttjänsten som används för utskick.
- Den engelska policyn (`en/privacy.html`) har samma innehåll och samma `TODO`-kommentarer; hänvisar till "the Swedish Authority for Privacy Protection (IMY)" och nämner rätten att klaga hos tillsynsmyndigheten i det EU/EES-land där man bor. Uppdatera båda policyerna samtidigt.
- Uppdatera "Senast uppdaterad" i policyn vid varje ändring. Radera anmälningar som är äldre än 24 månader om tjänsten inte lanserats/används.

## Köra lokalt
```
python3 -m http.server 8765
```
och öppna http://127.0.0.1:8765/ (engelska: http://127.0.0.1:8765/en/)

## Före publicering
- `og:image`/`twitter:image`/`og:url`, `canonical` och `hreflang` är absoluta URL:er till GitHub Pages – byt domän om ni flyttar till egen domän.
- Vid egen domän på GitHub Pages: lägg till en `CNAME`-fil.
- Priserna är preliminära (exkl. moms) och märkta så på sidan.

## Lösenordsskyddade dokument (`docs/`)
- `docs/index.html` ("Dokument") är en lösenordsskyddad sida för interna dokument (affärsplan och business case). Den har `noindex, nofollow` och länkas diskret från sidfoten ("Dokument" / "Documents").
- **Repot är publikt – därför ligger filerna bara krypterade i repot.** `docs/files/*.enc` är krypterade med AES-256-GCM; nyckeln härleds ur lösenordet med PBKDF2-HMAC-SHA256 (600 000 iterationer), med eget slumpmässigt 16-byte salt och 12-byte IV per fil. `docs/manifest.json` innehåller bara filnamn, visningsnamn, MIME-typ, storlek, salt, IV och iterationer – inga hemligheter.
- Dekrypteringen sker i webbläsaren med Web Crypto (`docs/docs.js`). Lösenordet skickas inte någonstans och sparas inte (inga cookies eller localStorage). Fel lösenord ger "Fel lösenord" (GCM-taggen stämmer inte).
- **Kryptera om / byta filer eller lösenord** (klartextfilerna ska ligga utanför repot):
  ```
  pip install cryptography
  export CREACOM_DOCS_PASSWORD='…'   # skriv aldrig lösenordet i en fil i repot
  python3 tools/encrypt_docs.py --affarsplan /sökväg/creacom-affarsplan-v3.pdf --business-case /sökväg/creacom-business-case.xlsx
  ```
  Skriptet skriver om `docs/files/*.enc` och `docs/manifest.json` (nytt salt och ny IV varje gång). Checka in och pusha.
- Byte av lösenord: kör skriptet med det nya lösenordet. Observera att gamla krypterade versioner finns kvar i git-historiken och fortfarande kan låsas upp med det gamla lösenordet.
- `.gitignore` stoppar PDF/Excel-filer (och allt utom `.enc` i `docs/files/`) från att checkas in. Använd aldrig `git add -f` på klartextfiler.
- Säkerheten vilar helt på lösenordets styrka: vem som helst kan ladda ner `.enc`-filerna och försöka gissa offline. Använd ett långt, slumpmässigt lösenord.
