# Build Plan — `factory-site` (factory.roxabi.dev)

> Plan d'exécution auto-suffisant pour la session de build. Rédigé 2026-06-03.
> Amont stratégique : [`factory-site-brief.md`](./factory-site-brief.md) (inventaire docs, brand) · `~/projects/docs/vision-roxabi-factory.md` (thèse).
> Statut : **direction tranchée**, **design system identifié (v17)**, **¬code écrit**.

Préfixes chemins : `site/` = `~/projects/roxabi-site` · `factory/` = `~/projects/roxabi-factory` · `forge/` = `~/.roxabi/forge` · `idx/` = `~/projects/docs`.

---

## 0. Positionnement (verrouillé)

```
Roxabi   = la FONDATION → ship des primitives open-source (plugins, CLIs), chacune standalone   → roxabi.dev
Factory  = le PRODUIT    → moteur d'agents + couche jobs qui COMPOSE ces primitives en flotte    → factory.roxabi.dev
```

Conséquence : roxabi.dev garde le **détail canonique** de chaque outil ; factory.roxabi.dev les présente comme **capacités câblées** (`/tools/`), cards *link-out* → roxabi.dev. Pas de duplicate-content.

---

## 1. Pile & approche

| Choix | Valeur |
|---|---|
| Moteur | SSG `site/src/build.py` (419 l, stdlib only) — **copié verbatim** |
| Manifest | `site.toml` (SSoT : SEO + chrome EN/FR dérivés de `(path,lang)`) |
| Contenu | `bodies/{en,fr}/<page>.html` = `<main>` à la main, 1:1 bilingue |
| Design | **récolté de v17 Forge** (`forge/lyra/visuals/css/user-guide-v17.css`) — ¬swap tokens |
| Host | Cloudflare Pages (publish dir `dist`), domaine `factory.roxabi.dev` |
| Conventions | merge-commit ¬squash · SEO dérivé (¬par page) · brand ¬git (assets sourcés de forge) |

**Le moteur ne demande qu'1 édition** : `build.py:132` `"Roxabi Documentation"` → `"Roxabi Factory Documentation"` (nom de la `CreativeWorkSeries` JSON-LD). Tout le reste vient de `site.toml`.

---

## 2. Registre des décisions (S1–S13)

| # | Décision | Tranché | Gating |
|---|---|---|---|
| S1 | Repo : **(a)** `factory-site` neuf | ✅ (a) | — |
| S2 | Cloudflare : nouveau projet Pages + custom domain | ✅ | — |
| S3 | Portée publiable vision : thèse + build-order + couche Tools **only** (🔒 personas/routage brand/cadence CM/HITL) | ✅ | — |
| S4 | Réécrire naming Lyra→Factory (README/ROADMAP/vision) : copie neuve | ✅ oui | — |
| S5 | Wordmark « Roxabi Factory » : dériver du mark Lyra (diamant) | ✅ dériver | — |
| S6 | Relation roxabi.dev ↔ factory | ✅ **résolu** (§0 foundation/product) | — |
| S7 | **Hero home** : v17 2-col CSS ember-glow **+ shader Canvas2D `ember-forge`** (fallback gradient crucible si `no-webgl`) | ✅ **shader inclus** | — |
| S8 | **Portée v1** : full — toutes les pages, dont hub docs + 3 docs distillées | ✅ **full** | — |
| S9 | Light theme | ✅ **résolu** — v17 livre dark+light | — |
| S10 | DNS : CNAME `factory` dans zone `roxabi.dev` (Cloudflare) | ✅ | — |
| S11 | `/tools/` cards lien primaire → page projet roxabi.dev | ✅ canonique | — |
| S12 | Postiz listé maintenant, badge « bientôt » | ✅ | — |
| S13 | Base design : **récolter v17** dans le SSG | ✅ (b) | — |

→ **Tout tranché (2026-06-03).** S7 = shader `ember-forge` inclus · S8 = full. Build lancé via workflow — script archivé : [`docs/workflows/factory-site-build.js`](./workflows/factory-site-build.js) (`wf_05a4daec-9cf` · 3 phases · 11 agents : P1 manifest/chrome → P2 reskin ∥ 8 bodies → P3 build+QA).

---

## 3. Phases

### P0 — Décisions (gate)
Trancher **S7** (hero) + **S8** (thin/full). Le reste : confirmer les défauts.

### P1 — Repo + squelette SSG
```
git init factory-site (hors ~/projects ou nested — attention cwd, cf. memory)
copier verbatim depuis site/ :
  src/build.py          → éditer l.132 "Roxabi Documentation" → "Roxabi Factory Documentation"
  src/templates/page.html · src/partials/{nav,footer_full,footer_min}.html
  assets/js/app.js · assets/icons/ (placeholder) · static/{robots.txt,site.webmanifest}
  Makefile · CLAUDE.md (adapter) · .claude/stack.yml · docs/authoring/* · docs/architecture/adr/0002-mini-build.md
vider :
  src/site.toml → garder SITE block + [lang.en]/[lang.fr], purger les [[page]]
  src/bodies/{en,fr}/ → vide
SITE block : base="https://factory.roxabi.dev" · org_name="Roxabi Factory" · github="https://github.com/Roxabi/roxabi-factory"
build.py sur 1 page placeholder → vérifier dist/ OK
```

### P2 — Récolte du design system v17 (le reskin)
**Récolter, pas recréer.** Le design existe — c'est de l'intégration.

| Cible SSG | Source forge | Action |
|---|---|---|
| `assets/css/tokens.css` | valeurs : v17 `:root`/`[data-theme=light]` + landing | **garder les NOMS de tokens roxabi-site** (`--bg --accent --panel --surface --text --text-muted --text-dim --border --border-hi --code-*`) et **y mapper les valeurs Forge** (bg`#0a0a0f` accent`#e85d04` accent-hover`#f97316` text`#fafafa` border`rgba(255,255,255,.07)` border-hi`#2a2a35`…) + light Forge ; +`--font-head:Outfit` +`--font-display:Chakra Petch`. **¬renommer** (sinon casse styles.css) |
| `assets/css/styles.css` | **base = roxabi-site** + module hero v17 | **garder la base SSG-native** (nav · doc-hero · wrap · toc · prose · cards · doc-filter · footer — les bodies seed l'utilisent). **Overlay** : headings/wordmark → Outfit ; **porter le module hero v17** (`.hero` 2-col, ember-pulse `::before/::after`, `.hero-title` Chakra+glitch, `.hero-mark` ember, `.hero-btn` primary/secondary, `.strip`) ; cherry-pick badges/info-boxes/flow si un body en a besoin |
| `assets/css/fonts.css` + `assets/fonts/` | — | **+Chakra Petch (600,700) +Outfit (700,800)** en woff2 self-hosté (fetch comme `site/`, ¬Google Fonts `<link>`) |
| `assets/logo/factory-mark-{dark,light}.svg` | v17 nav-mark (l.38–101) + `forge/lyra/brand/lyra-mark-*.svg` | committer le **diamant hub-spoke ember** (mark Lyra dérivé) |
| `assets/logo/factory-hero-mark.svg` | v17 hero-mark (l.127+, animé : particules ember pF1-3 + facettes + hub + enclume) | mark hero 240px |
| `assets/icons/*` + favicon | `forge/lyra/brand/lyra-favicon-{dark,light}.svg` | générer png set 32/180/192/512 + favicon SVG |
| `assets/og/factory-og{,-fr}.png` | — | générer OG 1200×630 (hero Obsidian + Forge Orange + wordmark) |
| `assets/vendor/ember-forge.js` *(si S7=b)* | `forge/lyra/landing/lyra-landing-ember-forge-v0.1.0.js` | porter le Canvas2D ; pointer sur `#hero-bg` (mécanisme `shader` du SSG) ; garder le fallback `no-webgl` (gradient statique) de `crucible.css` l.274–288 |
| `assets/js/app.js` | v17 js (glitch-decode) | garder app.js roxabi-site (theme/reveal/doc-filter) **+** ajouter l'effet `data-glitch` du hero-title |

⚠️ **Vocab de classes DIFFÉRENT** : roxabi-site `styles.css` (chrome multipage SSG) ≠ v17 (doc single-file). **Base = roxabi-site** (les bodies seed — roadmap/home/legal — l'utilisent) ; v17 = **réf valeurs + module hero/ember**, ¬swap wholesale. Tout body s'écrit dans le vocab roxabi-site.

⚠️ **Ne PAS porter** le shell SPA à onglets de v17 (`.tabs-bar`, `.tab-panel data-src=…`, lazy-load) — le SSG est multipage. Les `tab-panel` deviennent des **pages SSG** ; le kit composants (cards/steps/code/info-boxes/tables) sert dans les `bodies/`.

### P3 — Chrome + manifest
```
site.toml [lang.en]/[lang.fr] : réécrire footer_tagline/note voix Factory · nav labels nouvelle IA
partials/nav.html  : wordmark "Roxabi Factory" (Outfit 800 + nav-mark diamant) · liens Docs · Tools · Agent #1 · GitHub · theme · EN/FR
partials/footer_*  : footer-brand (footer-mark diamant) · liens GitHub/Issues · sibling → roxabi.dev (« famille ambre partagée ») · legal · license
templates/page.html: préloads fonts → +Chakra Petch +Outfit
```

### P4 — Contenu (pages) — ordre par ROI
1 `[[page]]` (site.toml) + `bodies/en/<id>.html` + `bodies/fr/<id>.html` chacune.

| # | Page | path | Source | tag | Pub |
|---|---|---|---|---|---|
| 1 | **doc factory-roadmap** | `documentation/factory-roadmap/` | **PORT graine** `site/bodies/{en,fr}/doc-factory-roadmap.html` + son bloc site.toml (0 coût) | Factory | ✅ |
| 2 | **legal** | `legal/` | mirror `site/bodies/*/legal.html` (adapter éditeur/host/license) | — | ✅ |
| 3 | **home** | `` (root) | thèse Factory (produit) ; Roxabi=fondation sous-texte ; hero v17 ; bloc « agent #1 » ; teaser flotte → /tools/ | jsonld=home | ⚠️ S3 |
| 4 | **tools** (Available Tools) | `tools/` | §5 catalogue ; cards → roxabi.dev | — | ✅ |
| 5 | **agent-1** | `agent-1/` *(ou section home si S8=thin)* | avatar Lyra + persona (`forge/lyra/brand/concepts/avatar-*` + `~/.lyra` voix) | Story | ⚠️ |
| 6 | doc tool-architecture *(si S8=full)* | `documentation/tool-architecture/` | distill `factory/docs/architecture/tool-architecture.md` | Tools | ✅ |
| 7 | doc architecture *(full)* | `documentation/architecture/` | distill `factory/docs/ARCHITECTURE.md` + domain pages | Architecture | ✅ |
| 8 | doc atelier-lyra *(full)* | `documentation/atelier-lyra/` | port essai `factory/artifacts/analyses/493-tool-system-narrative-plan.md` (rebrand) | Story | ✅ |

**thin v1 (S8 défaut)** = pages 1-5. Docs 6-8 = vagues post-lancement.

### P5 — SEO / QA
```
build.py → dist/ (sitemap/hreflang/JSON-LD/robots auto-dérivés)
QA isolée : ROXABI_DIST=/tmp/factory-qa python3 src/build.py
vérifs : EN/FR 1:1 · hreflang · canonical · JSON-LD · contraste Forge Orange #e85d04 / Obsidian #0a0a0f (WCAG AA)
         light+dark · prefers-reduced-motion · mobile (nav, hero 2-col→1-col)
static/site.webmanifest : renommer Roxabi Factory · static/_redirects : aucun au départ
```

### P6 — Deploy
```
Cloudflare Pages : npx wrangler pages project create factory-site --production-branch=main
custom domain factory.roxabi.dev → DNS CNAME `factory` dans zone roxabi.dev (S10)
.env : CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN ; make deploy (refuse tree dirty)
cross-link : roxabi.dev /projects/roxabi-factory/ → CTA « Voir factory.roxabi.dev » (édite roxabi-site)
```

---

## 4. Hero — détail S7

v17 + les 3 landings partagent l'**idiome Forge** : wordmark Outfit 800 (text-shadow ember + `wordGlow`) · submark mono · tagline Chakra Petch · positioning Inter · CTA `btn-primary`(forge)/`btn-secondary`(steel) · `.strip` bas (version · `pulse-dot` « runs on your hardware »).

| Variante | Fond | Forme | Reco |
|---|---|---|---|
| **v17 2-col** | CSS pur : `ember-pulse` glow concentrique + lignes angulaires forge | texte gauche + **forge-mark SVG animé** droite (particules ember + enclume) | ⭐ **home scrollable** — `data-glitch` sur le titre |
| ember-forge | Canvas2D `#ember-forge` (braises montantes) | wordmark centré plein écran | shader optionnel (S7=b) via slot `shader` |
| crucible | Canvas2D + **fallback `no-webgl`** (gradient statique) | centré | source du **fallback** à réutiliser |
| lattice-ignition | Canvas2D (réseau qui s'allume) | centré | alt |

→ Reco : **home = idiome v17 2-col** (CSS ember, ¬JS requis) ; **upgrade optionnel** = porter `ember-forge.js` comme `shader="ember-forge"` avec le fallback gradient de crucible. Splash plein écran = ¬adapté à une home qui scrolle vers le contenu.

---

## 5. Catalogue `/tools/` (6 capacités)

Calé sur `factory/docs/architecture/tool-architecture.md` (Taxonomy B = domain-nature). Cards → roxabi.dev (primaire) + repo (secondaire), badge statut.

| Outil | Capacité | Domaine tool | Backing | Statut |
|---|---|---|---|---|
| voiceCLI | voix (TTS/STT) | `voice` ✅ modélisé | satellite self-hosted | ✅ live |
| imageCLI | image | `image` ✅ modélisé | satellite self-hosted | ◐ on-demand |
| roxabi-forge | artefacts visuels | ✗ ¬modélisé (candidat) | candidat provider | ✅ live |
| roxabi-production | vidéo | ✗ ¬modélisé (candidat) | candidat satellite | ◐ |
| roxabi-intel | curation liens | ≈ `scrape` (futur) | candidat provider | ◐ |
| Postiz | publication social (CM/jobs) | `postiz` (futur, #1713) | **adapter NATS satellite** ; `roxabi-postiz`=backing service | ○ à câbler |

**Honnêteté** : seuls voice/image/postiz sont des tool-domains ; forge/production/intel = primitives Roxabi pas encore érigées en domaines tool. Tout le tool-plane est **parké pending #1670** (CLIs live standalone, intégration Factory = roadmap). `llm`(llmCLI) exclu = **plomberie** ; `vault` = tool-domain futur déféré.

---

## 6. IA

```
/                       Home — thèse Factory (PRODUIT) ; Roxabi=FONDATION sous-texte
                        hero v17 2-col Obsidian/Forge Orange · bloc « agent #1 » · teaser flotte → /tools/
/tools/                 Available Tools — catalogue 6 (cards → roxabi.dev)
/documentation/         Hub docs (tag-filtré)
  ├─ factory-roadmap/   [Factory]        graine (port direct)
  ├─ tool-architecture/ [Tools]          le MODÈLE (vs /tools/ l'instance)   · full
  ├─ architecture/      [Architecture]   distill ARCHITECTURE+domains        · full
  └─ atelier-lyra/      [Story]          essai long-form (rebrand)           · full
/agent-1/               personnage Lyra (avatar, persona, voix)
/legal/                 Mentions légales
```
Tags : `Factory` · `Tools` · `Architecture` · `Story`.

---

## 7. Garde-fous

- **Design SSoT = v17** (`forge/lyra/visuals/css/user-guide-v17.css`). La table tokens du brief §2 = approx → v17 prime (vrai `--textdim#9ca3af`, `--border:rgba(255,255,255,.07)`, `--accentbr#f97316`).
- **`huashu-design/lyra-diagram.html` = v1 PÉRIMÉ** (ambre `#f0b429` + IBM Plex) — ¬réf couleur. Pattern hub-spoke OK seulement.
- **Brand docs DANS le repo** (révise ADR-042) : `factory-site/brand/` = copie curée des **documents** brand (BRAND-BOOK v2.2 · DESIGN · forge.yml · marks/favicons SVG · AGENT-META-PROMPT · AVATAR-*.md · final avatars). **Exclu** : corpus lourd (concepts/ 10k · prompts/ 9k · embeddings · lora · playbooks génération). ⚠️ **`brand/` gitignoré par défaut** (réf locale, ¬committé) — car repo site potentiellement public + AGENT-META-PROMPT/persona sensibles. **Décision ouverte : committer `brand/` (versionner/publier) ou le garder gitignoré.**
- Le site committe **ses propres** assets dérivés (logo/OG/favicon/fonts dans `assets/`), sourcés de `brand/`.
- **¬publier la stratégie privée** (S3) : personas, routage Roxabi/Bouly, cadence CM, gouvernance HITL = 🔒.
- **Naming Lyra périmé** : README/ROADMAP/vision disent encore « Lyra » → relire avant reprise publique (S4).
- **Distiller depuis B (domain pages)**, jamais C (ADRs/consensus bruts).
- **Vocab copie** : tool ≠ worker (worker = compute-sur-engine) ; outils = **tools** adossés à des **providers** (satellites si self-hosted). Postiz : « backing service » ≠ provider ≠ heartbeat.
- **License** : roxabi-site = AGPL-3.0 ; Factory README = MIT/« Lyra » → trancher la license affichée (legal + footer) avec S4.
- **cwd nested repo** (memory) : `git init` hors `~/projects` ou vérifier la branche par repo (`git -C`).

---

## 8. Definition of done (v1 thin)

- [ ] `python3 src/build.py` vert · `dist/` = home·tools·factory-roadmap·agent-1·legal (EN+FR) + sitemap/robots
- [ ] Palette Forge (Obsidian/Forge Orange) · Chakra Petch hero · Outfit wordmark · light+dark · self-hosted fonts (¬Google `<link>`)
- [ ] hero v17 fonctionnel (glow ember, mark animé, glitch-title, CTA) · mobile 1-col
- [ ] `/tools/` = 6 cards → roxabi.dev · Postiz badge « bientôt »
- [ ] EN/FR 1:1 · hreflang/canonical/JSON-LD OK · contraste AA
- [ ] déployé factory.roxabi.dev (Cloudflare Pages) · roxabi.dev cross-link posé
```
