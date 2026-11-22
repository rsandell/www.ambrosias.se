# Migration to Hugo: analysis of ambrosias.se

Status: analysis and export only. No Hugo site has been created. This document is the main instruction for the build session.
Everything in `migration/db/` is git-ignored (`.gitignore` at the project root) and must never be committed.

## 0. How we work (decided after the analysis)

- **Single source of truth:** this file in the repository (`docs/migration.md`). The copy in the parent folder outside the repository is only a pointer and must not be edited.
- **Branch:** all work is committed directly on `master`. The old local branch `hugo` is stale and unused.
- **No push to GitHub** until the site works end to end (builds with `./dev build`, looks right, all work packages done or consciously deferred). Pushing, enabling Pages and the DNS switch are confirmed with the owner (work package 6). The tag `legacy-angularjs-2014` is already created locally and is pushed together with `master`.
- **One decisions document per stage:** every work package (and sub-stage) writes `docs/<stage>.md` (for example `docs/wp2-wp3-decisions.md`, `docs/wp4-logo.md`) listing, briefly, **what deviates from this plan, what was decided differently and why, and what is missing or deferred**. This file (the plan) is not rewritten to hide deviations; the stage documents are the record. A new stage starts by reading this file and all existing stage documents.
- **Commit per work package** (small, with a clear message), so nothing exists only in an uncommitted working tree.

## 1. Technical summary of the current site

| Part | What it is |
|---|---|
| Frontend (`www.ambrosias.se/`) | **AngularJS 1.2.7** (not Angular 2) single-page app, Bootstrap 3.0.3, jQuery. Hash routing (`#/...`), templates in `views/*.html`, all logic in `js/modules/ambrosias-app.js`. Libraries load from CDNs. The Swedish site title is `Ambrosiasorden - Att njuta är att leva`. |
| API (`www.ambrosias.se/node/`, Docker image `api/node/`) | Node (`node:lts`), Express 3, mysql 2.18. Routes: `/recept-types`, `/recept-types/:id`, `/recept-types/:id/recept`, `/recept`, `/recept/:id`, `/recept/:id/types`, `/styrelse`, `/album/categories`, `/album/categories/:cat`, `/album/categories/:cat/:sub`, `/album/:id`. Served at `https://api.ambrosias.se`. |
| Database (`api/docker-compose.yml`, `api/db/`) | `mysql:5.7`, data directory bind-mounted. The server holds 8 databases. The site uses `ambrosiasrecept` and `ambrosiasalbum2`. |
| `/styrelse` | Not in the database. It is a hard-coded list of board members (names, titles, phone, mail) in `node/routes/styrelse.js`. It is personal data. |
| Blog | Fetched in the browser from the Google Blogger API. **It is already broken** (see screenshot 04). |
| Photos | `/album/:id` proxied the Picasa Web feed, which is dead. The album thumbnails still point at `lh*.ggpht.com` and show as broken images (screenshots 10 to 13). |
| Static assets | `img/` (logos, background textures), `foto/067.JPG` (home page photo), `doc/*.pdf` (2021 annual meeting minutes, plus two interim statutes drafts that are not migrated). |
| Not part of the site | `gallery/fgallery*`, `gallery/view/`, `gallery/nyår_2004_bosse/` (55 photos), `www.ambrosias.se/nyår-2004-bosse/` (fgallery experiments, ignored). |

Notes:
- Secrets exist in the source (database passwords in `node/routes/conf.js`, a Blogger API key in `ambrosias-app.js`, Picasa auth keys in the `album` table). None are copied here. Do not carry them into the new repo.
- Correction to an earlier draft: `views/dresscode/*.html` (16 files) **do exist locally** and are tracked in the old repository. They are byte-identical to the live copies, which were also downloaded to `migration/live-views/views/dresscode/`. All `views/*.html` equal the live ones.
- The database files were used as a copy: a throwaway `mysql:5.7` container (`--skip-grant-tables`) was run directly on `api/db/` and removed afterwards. Because MySQL writes to its data files when running, `api/db/` may have changed (InnoDB logs). Treat it as the copy you said it was.

## 2. Site map and page types

All routes are client-side (`#/...`). Screenshots are from the live site, in `migration/screenshots/`.

| Route | Template | Shows | API / tables | Screenshot | Hugo |
|---|---|---|---|---|---|
| `#/home` (default) | `home.html` | Intro text, one photo (`foto/067.JPG`) | none | `01-home.png` | Home page |
| `#/info` | `info.html` | Membership fee, bank giro (**to be removed**) and org number, document links (statutes, 2011 to 2013 and 2021 minutes), board table | `/styrelse` (hard-coded in code) | `02-info.png` | Static page. Board table kept as is, from `data/styrelse.yaml` (see section 4) |
| `#/about` | `about.html` | Copyright, licences, list of technologies | none | `03-about.png` | Static page |
| `#/blog` | `blog.html` | Blogger posts | Blogger API (dead, shows "-3 fler poster...") | `04-blog.png` | Menu item "Blogg" linking to the external blog; Hugo blog section prepared, see "Blog" in section 4 |
| `#/recept` | `recept-types.html` | Course tabs with counts (Förrätt, Mellanrätt, Huvudrätt, Efterrätt, Till Kaffet) | `/recept-types`; tables `type`, `recept_types` | `05-recept-list.png` | Recipe section list, taxonomy `courses` |
| `#/recept/:typeId/` | same | Recipes of one course | `/recept-types/:id/recept` | `06-recept-type.png` | Taxonomy term page |
| `#/recept/:typeId/:receptId` | same | One recipe: pretext, ingredients, method, drink suggestion | `/recept/:id`; table `recept` | `07-recept-single.png` | Recipe page |
| `#/dresscode/` and 16 sub pages (`festklanningar`, `militar`, `frack`, `frackklanning`, `jackett`, `jackettkvinna`, `aftonklanning`, `smoking`, `smokingklanning`, `morkkostym`, `morkkostymkvinna`, `kavaj`, `kavajkvinna`, `casual`, `vardaglig`) | `views/dresscode/*.html` | Static dress-code text quoting etikettsdoktorn.se and DN | none | `08-dresscode-index.png`, `09-dresscode-sub.png` | Section `klädkod`, 17 pages. Internal links like `frackklanning.php` are stale and must be remapped |
| `#/album` | `album.html` | Categories Nyår, Valborg | `/album/categories`; table `album` | `10-album-categories.png` | Albums section |
| `#/album/:cat` | same | Years (subcategory) | `/album/categories/:cat` | `11-album-subcategories.png` | Taxonomy `categories` |
| `#/album/:cat/:year` | same | Albums of that year with author | `/album/categories/:cat/:sub` | `12-album-albums.png` | Year list |
| `#/album/:cat/:year/:id?photo=` | same | Photo carousel plus fullscreen view (Picasa) | `/album/:id` (Picasa, dead) | `13-album-single.png` | Album page with gallery built from zip photos |

Navigation: Hem, Info, Recept, Klädkod, Fotoalbum, Blog, Om. Footer: "© 2005-2014, Is fecit, cui prodest."

Albumadmin quirk (`node/routes/album.js`): the rule for "midsommar" assigns category `Valborg`.

## 3. Table classification

Scope: `ambrosiasrecept`, `ambrosiasalbum2`, `ambrosiasgallery` (45 tables). The other databases on the server are **out of scope, not exported**: `evas` (12 tables), `likstrom` (67, phpBB-like), `mosms` (1), `nos_wiki` (52), `vampiredb` (29). Exact row counts: `migration/db/row_counts.txt`. Schema: `migration/db/schema.sql`. One JSON file per table: `migration/db/tables/<db>.<table>.json`, produced by `migration/scripts/export_tables`. JSON row counts match the `COUNT(*)` values for all 45 tables.

### KEEP

| Table | Rows | Notes |
|---|---|---|
| `ambrosiasrecept.recept` | 6 | ids 1, 2, 3, 4, 6, 7 (id 5 does not exist). Columns `name`, `pretext`, `ingredienser`, `tillredning`, `dryck` (HTML fragments) |
| `ambrosiasrecept.type` | 5 | Courses: Huvudrätt, Efterrätt, Förrätt, Mellanrätt, Till Kaffet |
| `ambrosiasrecept.recept_types` | 8 | Recipe to course links (a recipe can have several courses) |
| `ambrosiasalbum2.album` | 18 | Album metadata: `category`, `subcategory` (year), `authorname`, `title`, `summary` (all empty). Columns `picasa_*` and `icon` are dead and must be dropped. There is **no date column** |

### UNCLEAR, now decided (all in `ambrosiasgallery`, an old Gallery2 install, last data from 2009)

| Table | Rows | Why unclear | Best guess |
|---|---|---|---|
| `g2_item`, `g2_albumitem`, `g2_entity`, `g2_childentity` | 741, 22, 2088, 2082 | Hold an album tree (22 albums, 716 photos) with titles such as `Fotograf: Mogge`, photographer, and creation timestamps. Photo counts match the zips (section 5). Also holds a Midsommar 2008 album that has no zip. Sample: `g_id 2540, "Midsommar 08", description "fotogarf:Mogge", 19 photos` | Use only as a cross-check for the album/zip matching and for the Midsommar album. Do not migrate the tree. |
| `g2_photoitem`, `g2_filesystementity` | 716, 741 | Photo file names (`0001.jpg`...) and 8 photos with captions (e.g. "Hallå Börje!", "Mer Öl"), plus the logo | **Decided: DROP.** Captions are not migrated |

### DROP

- 35 remaining `ambrosiasgallery.g2_*` tables: permissions, users (`guest`, `admin` only), plugin config, derivatives, mime maps, locks, sequence, schema. Gallery2 is not coming back. `g2_comment` has 0 rows.
- Everything else: nothing in `ambrosiasrecept` or `ambrosiasalbum2` is a leftover. There are no users, sessions or settings tables there.

## 4. Proposed Hugo data model

### Recipes (`content/recept/<slug>.md`, all 6 migrated; more will be added later)

```yaml
title: "Lyxpizza"           # recept.name (trimmed; double spaces collapsed, e.g. "Ambrosia  Tårta")
slug: "lyxpizza"
legacy_id: 2                # recept.id (only on migrated recipes; new recipes have none)
courses: ["Huvudrätt", "Förrätt"]   # taxonomy "courses", from recept_types + type.name
servings: "2"               # optional, only if it can be read from the pretext ("Till 2st.", "6 personer")
time: "30 min"              # optional, same
draft: false
```

**Format: Markdown, not HTML.** Hugo renders the Markdown to HTML at build time, so the content files hold clean Markdown only. Body layout, the same for migrated and new recipes:

```markdown
Short intro (the old `pretext`, may be missing)

## Ingredienser
- 1 pkt. Kungsörnen snabbpizza
- 4 msk. Passerade tomater

## Tillredning
1. Ställ ugnen på 200°.
2. Genomstek filéerna ...

## Dryckesförslag      (only when the recipe has a drink suggestion)
Rosévin, eller ett lättare rödvin
```

**Conversion of the 6 existing recipes** (the source text is HTML with entities, `<br />`, `<p>`, `&nbsp;`, double spaces and `\r\n` line breaks):
1. A script (`migration/scripts/convert_recipes`, e.g. Python with `html.parser`, or `pandoc -f html -t gfm`) turns each field into Markdown: entities decoded to real å/ä/ö, `<br>` and line breaks into list items or paragraphs, `<p>` into paragraphs, stray `&nbsp;` and double spaces removed.
2. Ingredients become a bullet list, one item per line. The method becomes a numbered list when the source lines are steps, otherwise paragraphs.
3. **The text itself is not rewritten.** The wording stays as written, only formatting is cleaned.
4. Because there are only 6 recipes, each converted file is **read through once by a person** (you) before publishing; the script's output is a first draft.
5. The script should print a diff-friendly report of what it changed (plain text before and after), so mistakes such as a lost line are easy to spot.

**Future recipes:** add `archetypes/recept.md` with the front matter and the three headings above, so `hugo new recept/<name>.md` gives a ready template. Recipes are written directly in Markdown, no HTML and no database. The list, course pages and search/filter work from front matter only.

### Albums (`content/album/<kategori>/<year>/<photographer-slug>/index.md`, leaf bundles)

Albums are organised by **type (kategori), year and photographer**: three levels in the URL and in the list pages (`/album/nyar/2005/mark/`), and as taxonomies so each can also be browsed on its own.

```yaml
title: "Nyår 2005 Mark"      # album.title (keep the original text)
category: "Nyår"             # album.category -> taxonomy "kategorier": Nyår | Valborg | Midsommar
year: 2005                   # album.subcategory -> taxonomy "ar"
date: 2005-12-30             # derived, see rules below
photographer: "Mark"         # album.authorname -> taxonomy "fotografer" ("Bobby" is written "Robert Sandell")
legacy_id: 6                 # album.id
photo_count: 18              # filled in by the import script
cover: "<first or chosen photo>"  # replaces the dead Picasa `icon`
original_zip: "Nyår 2005 Mark.zip"  # name of the source archive, for the optional download link
```

**Date rules (confirmed by you):** Nyår = 30 December of the album year, Valborg = 30 April. Midsommar has no rule and nothing is computed: its date is simply given per album. The only known Midsommar album, Midsommar 2008 (deferred, no photos yet), has the date **2008-06-20** (Midsommarafton 2008). For any future Midsommar album the webadmin gives the date explicitly. Any album can override its date in front matter.

**Photographer:** use `Robert Sandell` for everything the zips call `Bobby` (confirmed, same person). The zip file name is only used for matching.

Albums with no photos (see section 5 and "Deferred albums" below) are **not migrated in this phase**.
Do not migrate `picasa_userId`, `picasa_albumId`, `picasa_authKey`, `authoruri`, `icon`.

### Photos: resized copies on the site, originals elsewhere

The originals (about 1.5 GB) are **not** put in the Git repository or on GitHub Pages. The site gets only resized copies, produced by the import script (below):
- web size: **maximum** long edge 1600 px. **Never upscale:** if the original's long edge is 1600 px or less, keep its dimensions. Only re-encode it (JPEG quality about 82, orientation applied, metadata stripped) if that makes the file smaller. If the re-encoded file would be larger than the original, copy the original as is (metadata stripping is then skipped, unless it can be done without re-encoding, for example with `jpegtran`/`exiftool`). Photos may be reduced further only if the measured total is too large for the site (see below);
- thumbnail: long edge about 400 px, with the same never-upscale rule (an original smaller than 400 px is its own thumbnail and no second file is made);
- expected result: roughly 0.3 to 0.4 MB per photo including thumbnail, so about 450 to 600 MB for about 1,500 photos (an estimate, not measured). The build session should measure one album first. If the total is too big, lower to 1400 px and quality 78, still never upscaling.

**Where the originals live: decided.** In your own backup only. They are not served from the site, the repository or a subdomain for now. Do not implement any download link in the first build. The album front matter keeps `original_zip` (the file name) as a note only; a later optional `originals_base_url` site setting could add a "Hämta originalen (zip)" link if you ever host them, but that is out of scope now.

### Import script (`migration/scripts/import_album`, reusable)

One script used for the 17 existing zips now and for any future album:
- Input: a zip file plus (optional) `--category --year --photographer`; if omitted it parses the file name (`<Category> <Year> <Photographer>.zip` and `<Title>-Bobby.zip` are both accepted; `Nyårsafton` means category Nyår).
- Checks: reject unsafe paths (`..`, absolute), non-images (the one AVI in "Nyår 2005 Mark" is copied as is, or skipped with a warning).
- Resizing: the rules in "Photos: resized copies" above, including never upscaling and never producing a file larger than the original.
- Output: `content/album/<kategori>/<year>/<photographer-slug>/index.md` (front matter above, with `date` from the Nyår/Valborg rules, or from `--date YYYY-MM-DD` when given; Midsommar and other categories require `--date`) and the resized images in the same bundle; stable file names (`001.jpg`, `002.jpg`, ...) in the original sort order; keeps the original file name in a `photos:` list (so the original can be found again).
- Idempotent: running it twice on the same zip gives the same result, and it never touches the zip. It must run unattended and print a summary (photo count, bytes before and after).
- Dependencies: Python 3 with Pillow, or ImageMagick (document which one is chosen). It runs **inside the build container** (see "Containerised tooling"), so nobody needs these installed locally. It is started with `./dev import-album "<zip>" [options]`.
- Works for a future `draft: true` album: running it on the zip later fills in the photos and removes `draft`.

### Board data (`data/styrelse.yaml`)

Published as is, no obfuscation. The source is the array in `www.ambrosias.se/node/routes/styrelse.js` (the document intentionally does not repeat the values). When creating the file:
- fields per person: `name`, `title`, `mail`, and an optional `replacer` with `name` and `mail`. **Do not copy the `phone` field** (decided: phone numbers are removed);
- the mail addresses are stored there as arrays of single characters (to hide them from scrapers): join them into a normal string;
- skip empty deputy entries (three of four people have an empty `replacer`);
- render with a Hugo shortcode or template on the info page, same layout as today but without the "Tel" row (name, title, mail, deputy), as `mailto:` links;
- the board list is a snapshot as of the last code change; check with the association that the names and titles are still current before publishing (it is not known when they were last updated).

### Blog

Decided: for now the menu item **Blogg** links to the existing external blog `http://ambrosiasorden.blogspot.se/` (it is still online, HTTP 200; use https if it redirects). The Blogger API page, its key and `BlogPostsFactory` are not migrated. The site is also **prepared for a Hugo-native blog** later, without publishing anything now:
- site parameter `blog.external_url` (the blogspot address). The menu entry points to it while `blog.native` is `false`;
- when `blog.native` is `true` the same menu entry points to the local `/blogg/` section instead, and the external blog is shown as a small "Äldre inlägg på Blogspot" link at the bottom of that section;
- create the section skeleton now: `content/blogg/_index.md` (title "Blogg", `draft: true` so it is not published yet), `layouts/blogg/list.html` and `single.html` (title, date, author, tags, body), and an RSS feed;
- post front matter for later: `title`, `date`, `author` (default "Robert Sandell"), `tags`, `summary`, `draft`; posts in `content/blogg/<year>/<slug>.md`;
- importing the old Blogspot posts is not part of this phase and is left as a future decision (the posts are still on Blogspot).

### URLs and click navigation

**Decided:** old URLs (`#/recept/1/2`, `#/album/Nyår/2005/6`, ...) are not preserved and no redirects or remapping are built. Use Hugo's own URL structure (clean, slug-based, e.g. `/recept/lyxpizza/`, `/album/nyar/2005/mark/`, `/klädkod/smoking/`). `legacy_id` is kept in front matter for traceability only.

**Navigation should feel similar to today** (same clicks, not same addresses):
- **Main menu:** Hem, Info, Recept, Klädkod, Fotoalbum, Blogg, Om, in this order, with the active item highlighted.
- **Recipes:** the recipe pages show the row of course buttons with recipe counts (Efterrätt 2, Förrätt 1, ...) at the top, the list of recipes for the selected course on the left, and the selected recipe on the right. Clicking a course shows its recipes; clicking a recipe shows it with the same tab bar and list still visible. A recipe in two courses appears in both lists. On small screens the list stacks above the recipe.
- **Albums:** drill down Category (Nyår, Valborg, Midsommar) -> year -> album (with photographer) -> photos, with a "back" link one level up at each step, like the current thumbnail panels. The album page shows the photo grid and a click opens a larger view with previous/next (a lightweight lightbox such as PhotoSwipe or GLightbox; no Picasa, no carousel dependency on Bootstrap/jQuery).
- **Combined photo views (new, an improvement on today):** the category and year pages, and optionally the photographer pages, can show **all photos of that level in one gallery/slideshow**, not only the album list:
  - `/album/valborg/` -> all Valborg photos from all years; `/album/valborg/2014/` -> all Valborg 2014 photos (all photographers); optionally `/album/fotografer/robert-sandell/`.
  - Each such page has two parts: the list of sub-levels/albums as today (for the drill-down), and a button "Visa alla bilder" that opens the lightbox over every photo of that level as one continuous slideshow, in album order (year, then photographer, then file order).
  - The lightbox caption shows album title and photographer, with a link to that album's page.
  - Implementation hint: a Hugo template that ranges over the pages of the taxonomy term and collects their image resources (thumbnail grid with lazy loading, `loading="lazy"`); PhotoSwipe/GLightbox open the full-size web version only when a photo is viewed. A single lightbox instance can cover several albums, so no extra copies of images are made.
  - Size caution: the largest level (all Nyår photos) is about 900 photos (Valborg about 230). The grid must use the small thumbnails and lazy loading, and may be paginated (for example 100 per page) or collapsed per album until expanded, so the page stays fast on a phone. Measure this in the build session.
- **Klädkod:** index page with links to the sub pages, same grouping as the current index; sub pages link back to the index.
- **Footer and shield/logo:** as today (logo links to Hem).
- Not required: the pixel-exact visual design (see "Design" below), hash routing, or the old photo-in-URL (`?photo=`) deep links.

### Documents (statutes, minutes) on the info page

**Decided:** the existing Google Drive / Docs links stay as external links, nothing is downloaded. The one local file linked today, the 2021 annual meeting minutes (`doc/Årsmöte_Ambrosiasorden_2021.pdf`), stays a local file in `static/doc/`. Adding documents later must be easy, so the list is data-driven, not hand-written HTML:

`data/dokument.yaml`, one entry per document:

```yaml
- title: "Stadgar 2.0"
  type: stadgar            # stadgar | protokoll | annat
  year: 2021               # optional, used for sorting/grouping
  url: "https://drive.google.com/..."   # external link (Drive, Docs, anywhere)
- title: "Årsmötesprotokoll 2021"
  type: protokoll
  year: 2021
  file: "doc/Årsmöte_Ambrosiasorden_2021.pdf"   # local file under static/
```

Rules for the template on the info page:
- exactly one of `url` or `file` per entry; `file` is served from `static/` (put new PDFs in `static/doc/`), `url` is used as is;
- grouped by `type` (Stadgar first, then Protokoll), newest `year` first, same icons/classes as today (`stadgar`, `protokoll`);
- external links open normally (optionally a small "extern" marker); local PDFs show the file type;
- to publish a new version of the statutes: add a new entry (new `year`) and either paste a Drive link or drop the PDF in `static/doc/`; to retire the old one, change its `type` to `annat` or add `archived: true` to move it to an "Äldre versioner" list. No template change needed.
- the Drive/Docs links must remain shared as "anyone with the link" for visitors to open them; the build session cannot check this, so the owner should test each link once in a private window.

Initial content (taken from the current `info.html`): Stadgar 2.0 (Drive), Årsmötesprotokoll 2021 (local PDF), 2013, 2012 and 2011 (Google Docs). The URLs are in `www.ambrosias.se/views/info.html`; copy them from there.

### Design: same identity, modern implementation

**Decided:** reproduce the current look as closely as the identity requires, but **not verbatim**. The old CSS was an early Bootstrap experiment with many forced overrides. Keep the colours, logo, shield background and general theme; rebuild the layout with modern, dependency-light techniques. Small visual differences are fine.

**What must stay (identity):**
- Colours (from `www.ambrosias.se/style.css`; define them once as CSS custom properties):

| Token | Value | Used for |
|---|---|---|
| `--blue` | `#1E439A` | header and footer bar, headings, borders |
| `--gold` | `#E6A117` | accent line under the header, footer text, logo wordmark, active menu text |
| `--gold-light` | `#F6D89C` | menu text, panel background (with transparency) |
| `--blue-mid` | `#658ADD` | active/hover menu item, album panels |
| `--blue-light` | `#94AADD` | rules under headings, thumbnail panels |
| `--bronze` | `#9A7B3D` | small icons, badges |
| `--navy` | `#2F4067` | dark details |

- Logo and wordmark: `img/logo-small.png` (shield, 120x129, top left, overlapping the header bar) and `img/ambrosiasorden-gold.png` (golden script wordmark, 352x34, top right, hidden on small screens). Source files exist as GIMP `.xcf` in `img/` (`ambrosiasorden-gold.xcf`, `bg-logo.xcf`); redraw/export the shield as **SVG** (feasible, see "Logo as SVG") or at 2x so it is sharp on high-density screens.
- Background: light cream/grey paper texture (`img/creampaper.png`, tiled, 2x available) with the large pale shield watermark (`img/bg-logo-005.png`, centred, fixed) behind the content.
- Layout idea: a blue top bar with a gold line under it, a blue footer bar with a gold line above it and the copyright text in gold, content centred in a column, headings in blue with a light-blue rule underneath, the same menu order.
- Language: Swedish, `lang="sv"`.

**What may change (modernise):**
- No Bootstrap, no jQuery, no AngularJS, no Glyphicons, no CDN scripts. Plain modern CSS (custom properties, flexbox/grid, `clamp()` for fluid type) and a few lines of vanilla JS only for small things (mobile menu). For the photo lightbox use an **established library, not our own code** (decided): see "Dependencies" below.
- Responsive and mobile-first: a collapsing menu on small screens, a fixed or sticky header as today only if it works well on phones. Fixed footer is not required.
- System font stack (`system-ui, ...`) or one self-hosted font file; no Google Fonts. The old site used Bootstrap's default sans-serif.
- Accessibility fixes the old site lacks (see the contrast notes below): visible focus states, alt texts, semantic HTML (`header`, `nav`, `main`, `footer`), `prefers-reduced-motion` respected.
- Images: Hugo image processing (WebP/AVIF where useful, `srcset`, lazy loading).
- The whole old table-based recipe layout is replaced by CSS grid (list left, recipe right, stacked on small screens).
- Dark mode is **not** required (the identity is a light cream paper look). It can be left for later.

**Contrast to fix (measured on the old palette):** gold `#E6A117` on blue `#1E439A` is only 4.1:1 and gold on mid blue `#658ADD` 1.5:1 (the old active menu item), and light gold `#F6D89C` on `#658ADD` is 2.4:1. For normal text use `--gold-light` on `--blue` (6.6:1) or dark blue on cream (8.0:1). Keep gold for large text, lines and the logo, and make the active menu item stand out with a darker blue background or an underline instead of gold on mid blue. Slightly adjusting a tone to reach 4.5:1 is fine and is the kind of difference that is allowed.

**Process:** the build session first creates a one-page prototype of the header, footer, background and a recipe page, compared against the screenshots in `migration/screenshots/` (`01-home.png`, `07-recept-single.png`), before building the rest.

### Logo as SVG (trial result and plan)

**Finding (tested during this analysis):** the logo **can** be turned into a clean SVG. `design/vector_003_clean.psd` (791 x 852, the newest of the files) is built from **real Bezier vector masks**, not from pixels. Reading the file with the Python library `psd-tools` shows 12 visible layers that all carry vector paths: the shield outline and two quarter shapes, the inner white shield, and the acorns, glass and Dionysos portrait as masked layers. The portrait alone is about 3,000 path points (one layer with 85 subpaths). So no tracing is needed: the paths can be read out exactly and written as SVG.
- A first automatic conversion (`migration/logo-trial/psd_to_svg.py`, run in a Python container, so no Photoshop is needed) already gives a faithful result: `migration/logo-trial/logo_test.svg` (180 KB raw, about **33 KB gzipped**) and its render `logo_test_render.png`. It has blue `#003399` and yellow `#fff200` quarters, the yellow acorns and glass, and the Dionysos portrait with its fine line detail intact. This is *not* the same blue as the website's blue (`#1E439A`); the logo keeps its own colours.
- **Known defects of the first conversion (not yet fixed):**
  1. a few small checker-pattern cells inside the glass (overlapping subpaths drawn with the wrong fill rule or path operation);
  2. the thin black outline around the shield is missing (probably a vector stroke or a layer style that is not read yet);
  3. the white inner shield top edge has slightly different corners than the PNG;
  4. the file is larger than needed (numbers have 1 decimal; SVGO and merging same-coloured paths should halve it).
- **Do not use `design/2048px.png` as the reference or source:** it is a 2009 export with errors (a stray yellow rectangle in the lower right corner and cut-off edges). The best raster references are `vector_003_clean_v2.png` (380 px, clean) and the renders of the PSD itself.
- The older `ambrosias sköld 3.psd` (2005, plain pixels) and `vector_003.psd` (has the same vector layers plus hidden duplicates) are not needed.

**Plan for the build session (a separate agent can do this as an independent task, in parallel with the site work, since the rest of the site only needs a file path):**
1. Finish `psd_to_svg.py` (fix the four defects above), keeping the script and the PSD in the repo under `design/` so the logo can be regenerated.
2. Optimise (SVGO or similar, 2 decimals, merge paths by colour) to **under about 50 KB gzipped**, and check that the result has few elements (no "hundreds of layers").
3. Acceptance test: render at 120 px, 400 px and 1,500 px and compare against `vector_003_clean_v2.png` and the PSD render; no visible difference apart from sharpness; the file works as an `<img>` and inline; `viewBox` set, no fixed width/height; `title` and `aria` text "Ambrosiasorden".
4. Derive from it: the header logo (`logo.svg`), a simplified shield without the portrait for the favicon (SVG favicon plus 32/180/512 px PNG for older browsers and `apple-touch-icon`), and a one-colour version of the shield for the page watermark (grey with low opacity applied in CSS, replacing `bg-logo-005.png`).
5. **The gold wordmark** "Ambrosiasorden" is separate (`img/ambrosiasorden-gold.xcf` and PNG in the old repo, not in `design/`). It is a script font, one colour: either keep it as a large PNG (2x, 3x) or trace it with Potrace, whichever looks right. If a vector version of the lettering exists in a PSD, send it.
6. If an SVG ever turns out unsatisfactory, the fallback is the large PNG and Hugo image processing, as described earlier. The logo is not a blocker for the migration.

### WP 3.5 specification: slideshow (autoplay) and fullscreen in the photo lightbox

**Why:** WP 3 delivered previous/next and the combined views, but no automatic slideshow. This item adds it. It is planned here only; another agent implements it.

**Where:** the lightbox opened from an album page and from the combined views (category/year pages, "Visa alla bilder"), so one implementation covers both. Files expected to change: `assets/js/album.js` and `assets/css/main.css`. The vendored PhotoSwipe 5.4.4 has **no built-in autoplay**, so use PhotoSwipe's own mechanism for custom toolbar elements (`ui.registerElement`) and its `next()` action. **No new dependency** and no change to the vendored library.

**Behaviour (decided):**
- **Off by default, user-started only.** Never starts by itself. A play/pause button in the toolbar (and the **Space** key) starts and pauses it. The button shows its state (`aria-pressed`) and has Swedish labels ("Starta bildspel", "Pausa bildspel").
- **Interval:** default 5 seconds, selectable 3, 5 or 8 seconds through a small button in the toolbar that cycles through the values and shows the current one. Remember the choice for the visitor in `localStorage` (wrapped in try/catch; the feature must work if storage is blocked).
- **Loops:** after the last photo it continues with the first one (PhotoSwipe `loop: true`). It applies to the whole opened gallery, which in the combined views spans several albums.
- **Pauses when the visitor interacts:** arrow keys, swipe, a click on a thumbnail or the previous/next buttons (any change of photo that the slideshow did not cause itself), and **zoom** (zooming in pauses it). It does not resume by itself; the visitor presses play again.
- **Hidden browser tab:** the timer stops while the tab is hidden and continues when it is visible again, but only if the slideshow was playing.
- **Closing the lightbox** stops the slideshow and leaves fullscreen.
- **Fullscreen button** (standard Fullscreen API on the lightbox element, with the `webkit` prefix as fallback). Hide the button where the browser does not support it (for example iPhone Safari). It shows its state and updates when the visitor leaves fullscreen with Esc.
- **Only one photo in the gallery:** hide the play and interval buttons.

**Accessibility (required):**
- The slideshow is a user-started moving element and must be possible to stop at any time (WCAG 2.2.2). All new buttons are real `<button>` elements, reachable by keyboard, with visible focus and text alternatives.
- Announce "Bildspel startat", "Bildspel pausat" and the interval changes to screen readers through a polite live region (visually hidden).
- `prefers-reduced-motion` is respected: animations stay off (already the case) and the slideshow still never starts on its own. Do not shorten the interval below 3 seconds.
- Keep the existing caption (album, photographer, position) updating on every automatic change.

**Acceptance checks (headless Chrome with Playwright, run through the project container or the scratchpad, plus one manual look on a phone if possible):**
1. Open an album, the lightbox shows play, interval and fullscreen buttons; nothing moves for 10 seconds without pressing play.
2. Play with a 3-second interval advances automatically; the counter and caption follow.
3. ArrowRight, a swipe and a zoom each pause it; Space starts and pauses it; it stays paused afterwards.
4. Starting on the last photo, it continues to the first photo.
5. The interval choice survives closing and reopening the lightbox and a page reload; with `localStorage` disabled nothing breaks.
6. Works the same from a combined view over several albums.
7. Fullscreen enters and leaves, and the button state follows Esc. In a browser without support the button is absent.
8. No console errors; the build (`./dev build`) is green and `album.js` stays small (target under about 6 KB minified).

**Deliverable:** commit on `master`, write `docs/wp3-5-slideshow.md` (deviations, choices, anything not done), add the new buttons and Space shortcut to the "Lägg till album" or a short "Bildvisaren" part of the README when WP 5 writes it. Note for that agent: `docs/wp2-wp3-decisions.md` still says "Inget är committat", which is no longer true; correct it in the same commit.

### Containerised tooling (Docker or Podman)

**Decided:** everything needed to preview, build and maintain the site runs in a container. A webadmin needs only **Docker or Podman**, not Hugo, Python, Pillow, ImageMagick or Node. Local installs are optional and not documented as the main route.
- `Dockerfile` (in the repo root; works unchanged with `podman build`): a small image with a **pinned** Hugo release (extended edition, downloaded from the official Hugo release, set once as a build `ARG`) plus Python 3 with Pillow for the import script. Do not depend on a community Hugo image. Node/npm is left out; vendor PhotoSwipe as files (see "Dependencies") and only add Node to the image if it turns out to be needed.
- `./dev` script (POSIX shell, in the repo root) as the single entry point, detecting `docker` or `podman` automatically:
  - `./dev serve` live preview on `http://localhost:1313` (`hugo server`, with drafts optional via `--drafts`);
  - `./dev build` production build into `public/`;
  - `./dev import-album "<zip>" [--category --year --photographer --date]` runs `import_album`;
  - `./dev new recept/<namn>.md` (and `album/...`, `blogg/<år>/<namn>.md`) runs `hugo new` with the archetypes;
  - `./dev shell` opens a shell in the image;
  - the first call builds the image (cached afterwards).
- Do **not** require `docker compose` (the plugin is not installed on the owner's machine); use plain `docker run` / `podman run` in `./dev`.
- Run as the current user (`--user "$(id -u):$(id -g)"`; with rootless Podman use `--userns=keep-id`) so files created in the repo are not root-owned. SELinux hosts may need the `:Z` volume option.
- Mount the repo read-write and the folder with the original zips **read-only** (path given by an environment variable, for example `ORIGINALS_DIR`, defaulting to `../gallery`), so the import script cannot modify the originals.
- **CI uses the same definition:** the GitHub Actions workflow builds the site with the same Dockerfile (or the same pinned Hugo version), so the local preview and the published site cannot drift apart.
- **Dependabot** also watches the Dockerfile (the `docker` ecosystem), in the same monthly grouped update as the other dependencies.
- Known minor downsides, accepted: Docker or Podman must be installed; `hugo server` live reload can be slower on Mac/Windows bind mounts; the first image build downloads a few hundred MB.

### Dependencies and security

**Decided:** no CDN. Third-party code is served from the site itself (bundled at build time), pinned to an exact version, so there is no third party in the visitor's request and the site keeps working offline.
- **Lightbox: PhotoSwipe 5** (recommended; `GLightbox` is an acceptable simpler alternative if PhotoSwipe turns out too heavy). Reasons: actively maintained, touch/swipe/keyboard/zoom and accessibility built in, and its data-source mode can open one gallery over hundreds of photos from several albums without putting them all in the DOM, which the combined photo views (section 4) need. Integrate it through the standard Hugo pattern: thumbnail links with `data-pswp-width/height` and a small init script. No jQuery.
- **How it gets into the repo:** either vendored files under `assets/vendor/photoswipe/` (copy of the release, with the version in a `VERSION` file), or npm with a committed `package-lock.json` and Hugo's `js.Build`. Pick the simplest that works, but the version must be exact in either case.
- **No other runtime dependencies** (no CSS framework, no icon font, no web fonts, no analytics). The only other tools are build-time: Hugo itself and the image library used by `import_album`.
- **Staying up to date without notification noise:** a `.github/dependabot.yml` with **monthly, grouped** updates (one pull request at most) for GitHub Actions and npm, plus Dependabot security alerts enabled on the repository. The README's "Underhåll" section (section 7) lists a single yearly task: check the open Dependabot pull request, update Hugo and PhotoSwipe, run `hugo`, look at one album and push. Because the site is static (no logins, no cookies, no forms), the impact of a flaw in a front-end library is limited.

### Info page text (membership fee)

Decided wording, replacing the current "Medlemsavgiften för 2025 är; ... betalas in på bank giro nr: ...":
- Heading/lead: **"Årets medlemsavgift"**, followed by the same definition list as today (Riddare/Medlemmar: 200 kr). The year is removed so the text does not go stale.
- Payment sentence: **"Avgiften betalas till skattmästaren på mötet."** (instead of the bank giro sentence; the bank giro number is not carried over).
- Organisationsnummer stays. The text lives in the page content (`content/info.md`), not in a template, so the webadmin can edit it.

### Static pages

`_index.md` (home), `info`, `om` (about), `klädkod/` (17 pages from `www.ambrosias.se/views/dresscode/`, identical copies in `migration/live-views/views/dresscode/`; convert HTML entities and fix `.php` links), and one PDF from `doc/` (the 2021 minutes) as a static file (see "Documents" above; the two interim statutes PDFs are not migrated). Menu: Hem, Info, Recept, Klädkod, Fotoalbum, Blogg, Om (see "Blog" below).

## 5. Album to zip matching

Source: `gallery/*.zip` (17 files: 10 original zips, 343.7 MB, plus 7 `*-Bobby.zip` added later, 1,192 MB; all JPEG except one AVI; total about 1.5 GB) matched against `ambrosiasalbum2.album` (18 rows). The Gallery2 column is the photo count in the matching `g2_albumitem`, used as an independent check. Matching was done by title (category, year, photographer name) and confirmed with the counts. Nothing was matched by guessing.
Date column: the database has none, only the year. Gallery2 timestamps are import dates (2006 to 2009), not event dates, so they are not used.

| Zip file | Images | Zip size | DB album id | Title | Year | Photographer | Gallery2 photos | Confidence |
|---|---|---|---|---|---|---|---|---|
| Nyår 2004 Bosse.zip | 55 | 28.0 MB | 15 | Nyår 2004 Bosse | 2004 | Bosse | 55 | high |
| Nyår 2005 eAx.zip | 55 | 5.2 MB | 7 | Nyår 2005 eAx | 2005 | eAx | 55 | high |
| Nyår 2005 Mannenmedspannen.zip | 70 | 8.6 MB | 14 | Nyår 2005 Mannenmedspannen | 2005 | Mannenmedspannen | 69 | high (1 file difference) |
| Nyår 2005 Mark.zip | 17 + 1 AVI | 4.6 MB | 6 | Nyår 2005 Mark | 2005 | Mark | 17 (+1 movie) | high |
| Nyår 2005 Sarchen.zip | 77 | 12.2 MB | 12 | Nyår 2005 Sarchen | 2005 | Sarchen | 77 | high |
| Nyår 2005 Straus.zip | 116 | 20.7 MB | 13 | Nyår 2005 Straus | 2005 | Straus | 117 | high (1 file difference) |
| Nyår 2006 Anna.zip | 60 | 10.1 MB | 11 | Nyår 2006 Anna | 2006 | Anna (Gallery2: "Anna N") | 60 | high |
| Nyår 2007 Mogge.zip | 110 | 112.9 MB | 8 | Nyår 2007 Mogge | 2007 | Mogge | 110 | high |
| Valborg 2007 Joel & Igge.zip | 18 | 11.4 MB | 10 | Valborg 2007 Joel & Igge | 2007 | Joel & Igge | 18 | high |
| Valborg 2007 Mogge.zip | 108 | 129.8 MB | 9 | Valborg 2007 Mogge | 2007 | Mogge | 109 | high (1 file difference) |
| Nyårsafton 2011-Bobby.zip | 98 | 421.1 MB | 4 | Nyårsafton 2011 | 2011 | Robert Sandell | n/a | high (title and year; photographer name differs) |
| Valborg 2012-Bobby.zip | 82 | 447.8 MB | 5 | Valborg 2012 | 2012 | Robert Sandell | n/a | high |
| Nyårsafton 2012-Bobby.zip | 60 | 68.5 MB | 17 | Nyårsafton 2012 | 2012 | Robert Sandell | n/a | high (DB id 19 "Nyår 2012" is by Henrik Karlsson, so not this one) |
| Nyårsafton 2013-Bobby.zip | 158 | 182.6 MB | 18 | Nyårsafton 2013 | 2013 | Robert Sandell | n/a | high |
| Valborg 2014-Bobby.zip | 13 | 20.8 MB | 20 | Valborg 2014 | 2014 | Robert Sandell | n/a | high |
| Nyårsafton 2014-Bobby.zip | 36 | 48.6 MB | 21 | Nyårsafton 2014 | 2014 | Robert Sandell | n/a | high |
| Valborg 2007-Bobby.zip | 8 | 2.9 MB | 16 | Valborg 2007 | 2007 | Robert Sandell | 8 (`Fotograf: Bobby`, g_id 1291) | high (confirms the earlier unconfirmed guess; photo count matches) |

**Database albums without a zip (1):** 19 Nyår 2012 (Henrik Karlsson). The other 7 that were missing before are now matched (rows above). The 7 new archives were checked: none corrupt, all JPEG, no unsafe or duplicate paths, one top-level folder each (`<Title>/`), Unicode names in NFC. In the zips the photographer is written `Bobby`, in the database `Robert Sandell`: this is the same person per your message, so keep the database value and decide how to display it (resolved: use Robert Sandell).

**Zips without a database album:** none. **Gallery2 albums without a zip or DB row:** `Midsommar 08` (Mogge, 19 photos) and `Diverse` (2 photos, including the logo).

### Deferred albums (photos still missing; migrate when located)

**The photos are not in the database.** No BLOB columns exist, and no field in any `ambrosiasgallery` table is over 2,000 characters. Gallery2 kept the image files in a separate data directory (`g2data/albums/`), and the tables only store paths, sizes and thumbnail records. That directory is not on this machine, so nothing can be extracted.

| Album | Source of metadata | Expected photos | Where to look |
|---|---|---|---|
| (none left from Robert Sandell's albums: all 7 now have zips) | | | |
| Nyår 2012 (id 19) | `album`, Henrik Karlsson | unknown | Henrik Karlsson, Google Takeout |
| Midsommar 2008 (no DB row) | Gallery2 `g_id` 2540, description "fotogarf:Mogge" | 19 | Mogge, old server `g2data/` |
| Diverse (no DB row) | Gallery2 `g_id` 390 | 2 (includes the logo) | Probably not needed |

**Prework proposed so later additions are cheap (decide in the build session):**
1. Create **Nyår 2012 (id 19)** as a `draft: true` page with no photos, using the same front matter as section 4, so the site builds without it. The same applies to Midsommar 2008 if you want it (it needs a new `Midsommar` category, which the old import code wrongly mapped to `Valborg`). The 7 recovered albums are migrated normally.
2. Add `photo_count: 0` and a `photos_status: missing` field, and keep a short `migration/deferred-albums.md` or this table up to date.
3. Document the import routine for a new album: put the zip in `gallery/`, name it like the existing ones (`<Category> <Year> <Photographer>.zip`; the 7 new ones use `<Title>-Bobby.zip`, so the script should accept both), run an import script (to be written in the build session) that unpacks it into the album bundle, resizes the photos and removes `draft`.
4. Keep `legacy_id` for traceability only (not for redirects).

## 6. Encoding findings

1. **All 45 tables (88 text columns) are `latin1`.** In `ambrosiasrecept` and `ambrosiasalbum2` the data really is latin1, so exporting through a utf8mb4 connection converts correctly and Swedish characters come out right. Example: `album.title` "Nyår 2005 Mark" is stored as `4E79E5 72 ...` (å = `E5`), and the exports contain no `Ã` sequences. Nothing was altered.
2. **`ambrosiasgallery` is double-encoded.** UTF-8 bytes are stored in latin1 columns, so the export shows mojibake. Example: `g2_item` 10 is stored as `4E79C3A5 72736166746F6E ...` and exports as "NyÃ¥rsafton 2005" instead of "Nyårsafton 2005". 150 of 741 `g2_item.title` values are affected (for example "HallÃ¥ BÃ¶rje!"). A conversion preview that works: `CONVERT(CAST(CONVERT(g_title USING latin1) AS BINARY) USING utf8mb4)`. It is **not applied** in the JSON files. Only matters if you use the UNCLEAR tables.
3. **Recipe HTML mixes styles:** 5 of the 6 recipes use entities (`&ouml;`, `&nbsp;`) and some raw å/ä/ö in the same row.
4. **`index.html`** is valid UTF-8 but its XML declaration says `ISO-8859-1`, and the characters in the title and copyright comment were already destroyed (U+FFFD twice: `Att njuta �r att leva`, `F�reningen`). The live tab title shows `ï¿½r`. The correct text is "Att njuta är att leva" and "Föreningen". `views/about.html` and `views/blog.html` also declare `ISO-8859-1` while the content is UTF-8 or ASCII.
5. **Zip entry names** are correct UTF-8 (NFC). Some inner file names already lack å (for example `Ny_r ...` in the Mark and Straus zips); rename them on import if wanted.

## 7. Webadmin documentation (README.md in the new repo)

**Where:** `README.md` in the root of the Hugo repository. This does **not** interfere with Hugo: Hugo only builds from `content/`, `layouts/`, `static/`, `data/`, `assets/`, `archetypes/` and `hugo.toml`, so a root-level README is ignored and never published. GitHub shows it on the repository front page, which is where a webadmin looks first. Two cautions for the build session:
- do **not** put `README.md` files inside `content/` (Hugo would render them as pages), unless `ignoreFiles` is set;
- keep the long guides in a root-level `docs/` folder if the README gets long (also not published, as long as `publishDir` stays the default `public` and the site is deployed with GitHub Actions rather than the "/docs folder" Pages option). The README then links to them.

The README is written in **Swedish** (decided), short, with copy-paste commands, and written for a non-developer who can use Git and a text editor. It must contain at least these sections. The build session writes it **after** the site exists and tests every command in it.

| Section | Content |
|---|---|
| Översikt | What the site is, how it is built (Hugo, GitHub Actions, GitHub Pages), where it is published, how to run it locally (`./dev serve`) and which Hugo version is used (pinned in the Dockerfile and used by the workflow). Prerequisites: Docker or Podman and Git only; first-time setup (`./dev serve`) |
| Mappar | One line per folder: `content/` (recept, album, klädkod, info, blogg), `data/` (`styrelse.yaml`, `dokument.yaml`), `static/` (images, `doc/`), `archetypes/`, `layouts/`, `migration/` (kept for history, not published), `docs/` |
| Lägg till recept | `./dev new recept/<namn>.md`; front matter (`title`, `courses`, optional `servings`, `time`), the three headings, Markdown ingredient/method lists; preview; commit and push |
| Lägg till album | Zip naming, `migration/scripts/import_album <zip>` with options (`--category --year --photographer`), what it creates, what the script does to the photos (max 1600 px, never upscaled, thumbnails), checking the result with `hugo server`, committing the result; the originals are **not** committed (kept in the owner's backup); how to add photos later to a `draft: true` album (Nyår 2012, Midsommar 2008) and publish it |
| Lägg till dokument | Edit `data/dokument.yaml`; external link (`url`) vs local PDF (`file` in `static/doc/`); how to add a new statutes version and retire the old one; reminder to set Drive sharing to "anyone with the link" |
| Styrelsen | Edit `data/styrelse.yaml` (name, title, mail, optional deputy; no phone numbers); how to remove/replace a person |
| Info-sida och sidor | Where the fee text and org number live, how to edit the klädkod pages and "Om" page |
| Blogg | Current state (menu links to Blogspot), how to switch to the Hugo blog (`blog.native: true`), how to write a post (`./dev new blogg/<år>/<namn>.md`) |
| Publicera | Branch workflow (edit, preview, commit, push to the publishing branch), how to watch the GitHub Actions build, what to do when it fails, how to roll back (revert the commit) |
| Felsökning | Typical problems: wrong front matter (build error), missing thumbnails, album not listed (still `draft: true`), special characters in file names, photos too large |
| Underhåll | Updating Hugo (change the version in one place in the Dockerfile and rebuild the image), the domain/DNS and HTTPS settings for GitHub Pages, backups (the original photo zips are in the owner's backup, the content is in Git) |

Also add short **archetypes** (`archetypes/recept.md`, `album.md`, `blogg.md`) with comments, so `./dev new` (which runs `hugo new`) pre-fills the correct front matter. A "Checklist before publishing" (spelling, links open, photos load, preview on a phone) at the end of the README is recommended.

## 8. Repository, cutover and licences

### Facts about the existing repository
- GitHub: `rsandell/www.ambrosias.se` (public, default branch `master`, one branch, no tags, 20 commits, no GitHub Pages yet). The local clone is the folder `www.ambrosias.se/` inside the project folder; the project folder itself (with `api/`, `gallery/`, `migration/`, `docs/`) is **not** a repository.
- The working copy has uncommitted changes. Most are file-mode noise (`644 -> 755`, caused by the copy; ignore with `git -c core.fileMode=false`). Real changes: `http` -> `https` for the CDN and API URLs (`index.html`, `js/modules/ambrosias-app.js`), the **current board list** in `node/routes/styrelse.js` (the committed version is an older board), the fee year 2024 -> 2025 in `views/info.html`, a fixed closing tag in `views/album.html`, `mysql` 2.0.x -> 2.18.x in `node/package.json`, and small `.gitignore` changes. There is also an untracked experiment folder `nyår-2004-bosse/` which must **not** be committed.
- The live site (Apache on the home server) was last modified May 2025 and is served from these files, so the working copy is the true current state.
- **History contains sensitive leftovers (it will stay, by decision):** the Blogger API key is in all 20 commits, and older board phone numbers and mail addresses are in the history of `styrelse.js`. No database passwords were found in history (`conf.js` is ignored). Because the repository is public and history is kept, these stay visible. Mitigation that does not touch history: revoke or delete the Blogger API key in the Google Cloud console (owner's action; the blog feed is dead anyway).

### Cutover plan (done in the build session, in this order; each step that changes GitHub is confirmed with the owner first)
1. **Capture the local state.** Stage **only the real changes to already tracked files**, listed above (use `git add -u` after `git config core.fileMode false`, then check `git status` and `git diff --cached`). Never `git add .` or `git add -A`: the working directory also holds things that must stay out. Commit on `master` with a clear message, for example "Final state of the AngularJS site before the Hugo migration". No secrets are in the diff (checked in this analysis: only URLs, the board list, the fee year and a tag fix).
   - **Must not be committed:** `nyår-2004-bosse/` (untracked, 46 MB, 26 files: output of the fgallery experiment), `ambrosias.sublime-workspace` and `node/routes/conf.js` (both git-ignored; `conf.js` holds the database passwords), `node/node_modules/`.
   - **Size check:** the repository is small. `.git` is 3.7 MB and the largest object in history is 0.6 MB (`img/textured_paper.zip`), so there is no large-file clean-up to do, and history does not need rewriting for size reasons.
2. **Tag it.** Create an **annotated** tag **`legacy-angularjs-2014`** on that commit and push `master` and the tag. The name carries the year the site was made (2013 to 2014, the copyright years of the old files); the final-state year goes in the tag message, which costs nothing and is shown by `git show`, for example: "AngularJS 1.2 + Node/MySQL site by Robert Sandell, built 2013-2014, final state before the Hugo migration (2026)". Optionally also a branch `legacy` at the same commit so the old site is easy to browse. The old site stays fully recoverable through the tag.
3. **Wipe by a normal commit, not by rewriting history.** The default branch stays `master` (not renamed). On `master`: remove all old files (`git rm -r`), add the Hugo site in the **repository root**, commit. No force-push and no history rewrite, so the full history and the tag stay intact. (If you prefer to keep `master` as the old site until launch: do the work on a branch `hugo`, and merge/switch the default branch at launch; the tag and history are the same.)
4. **What moves into the new repository (an explicit allow-list, nothing else):**
   - **Brought over:** `docs/migration.md`, `migration/scripts/`, `migration/screenshots/` (13 small PNGs) and `migration/live-views/`; `Dockerfile`, `./dev`, `README.md`, `LICENSE`, `LICENSE-CONTENT.txt`; the graphics in use: `logo-small.png`, `ambrosiasorden-gold.png`, `bg-logo-005.png`, `creampaper.png` (plus its 2x), the home page photo `foto/067.JPG` and `doc/Årsmöte_Ambrosiasorden_2021.pdf`. Keep the GIMP sources (`ambrosiasorden-gold.xcf`, `bg-logo.xcf`, together 0.1 MB) in a `design/` folder (not published) so the logo can be re-exported, for example as SVG.
   - **Left behind in the old tag only (they are never copied forward):** `js/` (jQuery Mobile and its zip), the AngularJS app, `views/`, `node/`, `*.zip` archives (`creampaper.zip`, `textured_paper.zip`), unused textures (`textured_paper*.png`, `bg-logo.png`, `bg-logo-010.png`, `.xcf` duplicates), `ambrosias.sublime-project`, `colorschemedesigner-export.htm`, the two interim statutes PDFs, and `style.css` (its colours are recorded in section 4).
   - **Never committed:** `migration/db/` (personal data; in the repo's `.gitignore`), the original photo zips and `gallery/` (including its 46 MB `nyår_2004_bosse` experiment and the fgallery tooling), `api/` (the old backend and its MySQL files).
   - The `.gitignore` of the old repository is replaced by a Hugo one (`public/`, `resources/_gen/`, `.hugo_build.lock`, `migration/db/`, `*.sublime-workspace`).
   - **Photos in the new repo:** only the resized web versions (section 4), never the originals. Expect the published photo set to be the bulk of the repository; check its size before the first push (target well under 1 GB, preferably a few hundred MB).
5. **Publishing:** enable GitHub Pages with the source "GitHub Actions" and build with the workflow described in section 4 (containerised, pinned Hugo). Add `static/CNAME` with `www.ambrosias.se`, point DNS `www` (CNAME) to `rsandell.github.io`, and enable "Enforce HTTPS" once the certificate is issued. The apex domain `ambrosias.se` **redirects to `www`** (decided): set `www.ambrosias.se` as the custom domain, add the GitHub Pages `A`/`AAAA` records for the apex (GitHub's current IP list is in its Pages documentation), and GitHub then redirects the apex to `www` automatically. Test on the default `https://rsandell.github.io/www.ambrosias.se/` address first (set `baseURL` accordingly) before switching DNS. `api.ambrosias.se` and the old containers on the home server are switched off only after the new site has been live for a while (rollback = point DNS back).

### Licences and copyright notices
The repository has two licence files: `LICENSE_MIT.txt` (code) and `LICENSE_CC_BY-NC.txt` (text, layout, graphics; it only points to the CC BY-NC 4.0 legal code). GitHub shows the repository licence as "Other" because there is no file called `LICENSE`. Both files contain the broken character in "Föreningen" (stored as a replacement character), which must be fixed.
- **Rename/restructure:** `LICENSE` (MIT, for code, so GitHub detects it) and `LICENSE-CONTENT.txt` (CC BY-NC 4.0 for text, layout and graphics). Keep the old files' wording otherwise.
- **Years:** code `Copyright (c) 2013-2026 Föreningen Ambrosiasorden, Robert Sandell` (the code is new, but the 2013 start is kept as the project's origin; confirm); content and graphics `Copyright 2005-2026 ...`. The footer on every page and the `Om` page currently say 2005-2014: update to `2005-2026` (preferably generated from the current year in the template, with 2005 as the fixed start).
- **Statements on the `Om` page stay true and must be kept:** text/layout/graphics are CC BY-NC 4.0 except the logo/shield; photos belong to each photographer and are licensed separately; blog text belongs to its authors.
- **Rewrite the technology list on the `Om` page** (it lists Bootstrap, AngularJS, jQuery and so on, which are gone): Hugo (Apache-2.0), PhotoSwipe (MIT), and nothing else if the design stays dependency-free. Keep the third-party copyright notices that the licences require (PhotoSwipe's MIT notice, and Hugo is only a build tool). Put them in `THIRD-PARTY-NOTICES.txt` or on the `Om` page.
- **Credits on the current `Om` page to carry over:** the background pattern "Cream paper" (made by Devin Holmes) if `creampaper.png` is reused, and the colour scheme made with Color Scheme Designer (Petr Stanicek). Drop the credits for things no longer used (Bootstrap, jQuery, jQuery Mobile, AngularJS, Node.js, the "Sticky footer" example).

## 9. Work plan for the build session(s)

All design and content decisions are made and written in sections 1 to 8. Rules for every agent: work from this document; do not change the old repository or the database; **ask the owner before anything that changes GitHub or DNS** (commit, tag, push, enabling Pages, DNS); never commit `migration/db/`, the original zips or any secret; keep Swedish text unchanged (formatting only).

| # | Work package | Depends on | Notes |
|---|---|---|---|
| 0 | **Cutover prep:** commit the real local changes in the old repo, create the tag `legacy-angularjs-2014`, push (section 8). Owner confirms each step | none | Must happen before the wipe commit in WP 1 |
| 1 | **Skeleton:** Hugo site in the repo root, `Dockerfile`, `./dev`, GitHub Actions workflow, `.gitignore`, config (menu, `blog.*`, `originals` not used), archetypes, base layout and theme prototype of header, footer, background and a recipe page, compared with the screenshots | 0 | Everything else builds on this |
| 2 | **Recipes and static pages:** convert the 6 recipes (script plus owner review), info page text, Om page (rewritten technology list and credits), 17 klädkod pages, board data and document list as data files, Blogg link and draft blog section | 1 | Section 4 |
| 3 | **Albums:** write `import_album` (resize, never upscale), import the 17 zips, album/year/category pages, combined photo views, PhotoSwipe lightbox, draft placeholders for the two deferred albums. Measure the total size of the resized photos on one album first | 1 | Section 4 and 5. The heaviest package |
| 3.5 | **Slideshow and fullscreen in the lightbox** (added after WP 3 was finished): see "WP 3.5 specification" below | 3 | Small, frontend only. Stage document `docs/wp3-5-slideshow.md` |
| 4 | **Logo SVG** (independent trial): finish `migration/logo-trial/psd_to_svg.py`, optimise, derive favicon and watermark | none | Hand the result to WP 1/3 as files; the site works with the PNG until then |
| 5 | **README (Swedish), licences, third-party notices, Dependabot config**; test every README command | 1 to 3 | Section 7 and 8 |
| 6 | **Publish:** Pages with Actions, `CNAME`, test on the default GitHub address, DNS switch (apex redirects to `www`), keep the old server up for a while | 1 to 5, owner | Owner decides when |

Suggested split: one agent each for WP 0+1 (sequential, the owner is in the loop), then WP 2 and WP 3 in parallel in separate worktrees, WP 4 at any time, then WP 5 and 6.

## 10. Owner actions and remaining points

- Revoke the old Blogger API key in the Google Cloud console (it is in the public git history).
- Check that the names and titles in the board list are still current before publishing (the old data is the source).
- Test each Google Drive/Docs link once in a private window (they must be shared "anyone with the link").
- Confirm the tag name `legacy-angularjs-2014` and the tag message when WP 0 runs.
- Deferred, no action now: photos for Nyår 2012 (Henrik Karlsson) and Midsommar 2008 (Mogge); importing old Blogspot posts; an optional download link for the original zips.
- Decisions that were made during the analysis are recorded where they apply (dates, photographer name, payment text, URLs, design, tooling, repository, licences); there are no unresolved questions that block a start.
