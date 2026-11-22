# WP 6: publicering (klar 2026-11-22)

Sajten är publicerad på `https://www.ambrosias.se/`. Det som återstår står sist i dokumentet.

## Gjort

- **GitHub Pages påslaget** för `rsandell/www.ambrosias.se` med källa **GitHub Actions** (`gh api -X POST repos/rsandell/www.ambrosias.se/pages -f build_type=workflow`). Ingen anpassad domän är satt än.
- **`static/CNAME`** (`www.ambrosias.se`) och en svensk **404-sida** (`content/404.md`, byggs till `404.html`, inte med i sitemap) är tillagda.
- **WP 0 och WP 1 dokumenterade** i `docs/wp0-wp1-beslut.md` (rekonstruerat från historiken).

## Push och första bygget (2026-11-22)

- `master` pushades (`3f928d7..4b9d066`). Arbetsflödet "Publicera sajten" gick grönt och sajten ligger på `http://rsandell.com/www.ambrosias.se/`.
- Genomgång av den publicerade sajten: 40 sidor och tillgångar hämtades via länkarna från startsidan, 0 felaktiga länkar, inga absoluta länkar till fel domän. Startsidan, recept, ett recept, albumsidor (även `/album/nyar/` med 136 KB data), klädkod, info, om, 404-sidan, favicon, sitemap och `robots.txt` svarar 200 och bilder laddas. `/blogg/` ger 404, som det ska (utkast).
- **Bara HTTP på testadressen.** `https://rsandell.com/...` ger certifikatfel (domänen tillhör användarsajten, inte den här sajten), och `https://rsandell.github.io/www.ambrosias.se/` omdirigerar till `http://rsandell.com/...`. Det påverkar bara testet. Med `www.ambrosias.se` som anpassad domän får sajten eget certifikat.
- Dependabot körde sina första uppdateringskontroller direkt efter pushen och kan öppna pull requests. De tidigare säkerhetslarmen gällde den gamla `node/package.json` (express, mysql) och står som åtgärdade.
- Bildvisaren, bildspelet och helskärm är inte provade på den publicerade sajten (bara hämtning av sidorna). Titta på dem en gång för hand.

## Domänbytet (2026-11-22)

- **Dependabot:** PR #2 (GitHub Actions: checkout 7, configure-pages 6, upload-pages-artifact 5, deploy-pages 5) mergades och deployen gick grönt. PR #1 (Python 3.12 till 3.15 i `Dockerfile`) stängdes **utan merge**: provbygget gick sönder eftersom `Pillow==11.0.0` saknar färdigt paket för Python 3.15. `.github/dependabot.yml` tillåter nu bara patch-uppdateringar av `python`-basbilden. README förklarar hur ett medvetet byte görs.
- **Anpassad domän** `www.ambrosias.se` sattes med `gh api -X PUT repos/rsandell/www.ambrosias.se/pages -f cname=www.ambrosias.se`. **Sajten måste byggas om efter det** (`gh workflow run pages.yml`): bygget som låg ute var gjort för testadressen och hade `/www.ambrosias.se/` som sökvägsprefix i alla länkar. Arbetsflödet hämtar baseURL från Pages, så den nya körningen fick rätt rot.
- **DNS hos Loopia** (ägaren ändrade): `www` CNAME till `rsandell.github.io.`, apex A-poster ändrade till GitHubs fyra (`185.199.108-111.153`) och fyra AAAA-poster, plus GitHubs verifierings-TXT (`_github-pages-challenge-rsandell`). **Orört:** MX (Google Workspace), SPF, DKIM, `calendar/docs/mail/sites/start` (ghs.google.com) och jokertecknet `*` (`cern.dyndns.org`, så `api.ambrosias.se` m.fl. går fortfarande till hemservern). Före ändringen: `www` var CNAME till `cern.dyndns.org.` och apex A `85.231.65.47` (för återgång).
- **HTTPS-certifikatet dröjde.** Efter DNS-ändringen låg certifikatet på "inget" i över en timme (GitHub serverade bara `*.github.io`). Det som löste det var att **ta bort och lägga till den anpassade domänen igen** (`{"cname":null}` och sedan `cname=www.ambrosias.se`). Då gick tillståndet `authorization_created` till `approved` på några minuter. Certifikatet gäller `www.ambrosias.se` och `ambrosias.se` till 2027-02-20 och förnyas av GitHub.
- **"Enforce HTTPS"** sattes med `{"https_enforced": true}`. Omdirigeringen från `http://` kom inte direkt: det behövdes en av/på-växling och några minuters väntan.
- **Kontroll:** `https://www.ambrosias.se/` ger 200 med giltigt certifikat, `ambrosias.se` (http och https) skickas vidare till `www`, och startsidan, recept, album, klädkod, info och om fungerar. Okänd adress ger den nya 404-sidan. MX-posterna är oförändrade.
- **Lokal DNS-cache:** ägarens hemnätverk serverade en tid det gamla svaret (`cern.dyndns.org`) trots att alla publika resolvers och Loopias servrar visade det nya. Det försvann av sig självt. Testa från mobilnät om det händer igen.
- **Blogger-nyckeln** hittades inte i något konto. Beslut: ignoreras (Blogger API v2 är avvecklat och sidan använder den inte längre). Nyckeln finns kvar i den gamla git-historiken.
- **Dependabot-inställningar på GitHub:** alerts är påslagna, "security updates", secret scanning och push protection är av.

## Att veta

- **Testadressen är inte `rsandell.github.io/...`.** GitHub visar `http://rsandell.com/www.ambrosias.se/`, eftersom användarsajten har en egen domän. Arbetsflödet sätter baseURL automatiskt från Pages, så det spelar ingen roll för bygget, men testa på den adress GitHub anger.
- **Med GitHub Actions som källa ignorerar GitHub filen `static/CNAME`.** Domänen sätts under Settings, Pages. Filen är kvar som dokumentation.
- **Inget av Hugo-sajten är pushat.** GitHub har bara den gamla sajten (`3f928d7`) och taggen `legacy-angularjs-2014`. `master` ligger flera commits före. Första pushen startar arbetsflödet (`on: push` till `master`).

## Kvar

1. Titta själv på sajten på riktigt: menyn, ett album med bildspel och helskärm (även på telefon), Drive-länkarna.
2. Behåll den gamla servern en tid. Radera inte `api/db/` (den har också de andra databaserna). När hemservern tas bort: ta bort jokertecknet `*` och poster som pekar på `cern.dyndns.org`.
3. Valfritt: slå på secret scanning och push protection (gratis för publika repon) och Dependabot security updates. Granska även om `ambrosias.se` i Google Search Console behövs.
4. Det som sparats lokalt men inte finns i repot: originalfotona (zip), `migration/db/` och `api/`. Se till att de finns i din backup.
