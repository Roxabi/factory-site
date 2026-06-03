# Brief — création de `factory-site` (factory.roxabi.dev)

> Handoff auto-suffisant pour la session qui initialisera `factory-site`.
> Rédigé 2026-06-03. SSoT stratégique amont : `~/projects/docs/vision-roxabi-factory.md`.
> Statut : **direction tranchée** (voir §2), **¬code écrit**, **¬rapatriement d'assets** (décidé).

---

## 0. Mission

Construire **`factory.roxabi.dev`** — site marketing + docs de **Roxabi Factory**, hébergé **Cloudflare Pages**, **bilingue EN/FR**, statique, **sur le même moteur que roxabi-site** (SSG Python zéro-dépendance).

- Sous-domaine de `roxabi.dev` → **famille de marque Roxabi**.
- Roxabi Factory = le **moteur d'agents hexagonal (ex-Lyra) + couche jobs** ; Lyra = **agent #1** (produit parké, conservé comme *personnage*).

**Positionnement (verrouillé) :**

```
Roxabi   = la FONDATION → ship des primitives open-source (plugins, CLIs), chacune standalone   → roxabi.dev
Factory  = le PRODUIT    → moteur d'agents + couche jobs qui COMPOSE ces primitives en flotte    → factory.roxabi.dev
```

→ Conséquence IA : roxabi.dev garde le **détail canonique** de chaque outil ; factory.roxabi.dev les présente comme **capacités câblées du produit** (`/tools/`), cards qui *link out* → roxabi.dev. Pas de duplicate-content (résout la décision relation roxabi.dev ↔ factory).

---

## 1. Approche de build (mirror roxabi-site)

Réutiliser le SSG de `roxabi-site` : `src/build.py` (≈200 l, stdlib only) + `site.toml` (manifest SSoT) + `templates/` + `partials/` + `bodies/{en,fr}/`. SEO/sitemap/hreflang/JSON-LD **dérivés** de `(path, lang)`. Déploiement Cloudflare Pages (`publish dir: dist`).

**Décision repo — à confirmer en ouverture de session :**

| Option | Description |
|---|---|
| **(a) nouveau repo `factory-site`** ⭐ *(implicite — tu l'as nommé ainsi)* | Fork du SSG roxabi-site → repo indépendant → projet Cloudflare Pages distinct (`factory.roxabi.dev`) |
| (b) multi-site dans roxabi-site | `ROXABI_DIST` existe déjà ; 1 repo, 2 outputs. Plus couplé, ¬recommandé |

→ Défaut retenu : **(a)**. Étape 1 = `git init factory-site`, copier le squelette SSG, vider `site.toml`/`bodies` du contenu roxabi-site, reposer le design system Forge (§2).

---

## 2. Direction brand (TRANCHÉE)

```
Lyra brand = « Direction H — Forge » : maker energy, raw-in → crafted-out, Forge Orange
           = littéralement un thème usine/forge ──▶ s'aligne nativement sur « Roxabi Factory »
```

**Décisions :**
1. **Réutiliser le système visuel Forge** de Lyra (palette + typo + landing CSS) — déjà cohérent avec la famille ambre Roxabi.
2. **Rebrand wordmark** `Lyra` → **`Roxabi Factory`**. Le mark SVG Lyra sert de base graphique, le wordmark change.
3. **Garder l'avatar Lyra comme personnage « agent #1 »** ✅ *(validé)* — section/élément dédié, ¬identité globale du site.
4. **Positionnement public** = la thèse Factory (moteur hexagonal + couche jobs + couche Tools), pas le pitch produit « Personal Intelligence Engine » de Lyra. La valeur souveraineté (own-hardware, ¬lock-in) reste le sous-texte.

**Tokens (depuis `~/.roxabi/forge/lyra/brand/forge.yml` + `DESIGN.md`) :**

| Token | Dark (primaire) |
|---|---|
| `bg` | `#0a0a0f` (Obsidian) |
| `surface` | `#18181f` (Forge Floor) |
| `border` | `#2a2a35` (Steel) |
| `text` | `#fafafa` (Spark White) |
| `text-dim` | `#6b7280` (Steel Gray) |
| `accent` | `#e85d04` (**Forge Orange** — 1 par composition) |

Typo (rôles stricts) : **Chakra Petch** (hero/display, v1 only) · **Outfit** 800 (titres, wordmark, nav) · **Inter** (body) · **JetBrains Mono** (CLI/config/paths).

Deux variantes esthétiques (BRAND-BOOK §6) : **v1 Obsidian** = marketing/hero/avatar ; **v2 GitHub-dark** = docs denses/diagrammes/dep-graphs. → marketing en v1, section docs en v2.

**⭐ Design system PRÊT — `forge/lyra/visuals/css/user-guide-v17.css` (952 l) :** implémentation Forge complète et canonique (supersede la table de tokens ci-dessus, qui était une approx). Contient : palette tokenisée full (vrai `--textdim#9ca3af`, `--border:rgba(255,255,255,.07)`, `--accentbr#f97316` ember) + **dark ET light complets** (résout la question light-theme) + 4 rôles typo (dont Chakra Petch hero) + **hero ember-pulse CSS** (glow « la forge qui rayonne », ¬WebGL) + kit composants (cards/grids/steps/code+syntaxe/info-boxes/tables/badges/flow/reading-guide/forge-loader/footer) + a11y (`:focus-visible`, `prefers-reduced-motion`).
→ **Décision design (B)** : récolter v17 dans `assets/css/{tokens,styles}.css` du SSG, **¬** swapper les tokens roxabi-site. ⚠️ v17 = SPA single-file à onglets ; le SSG est multipage → on récolte le **CSS**, pas le shell JS à onglets (les `tab-panel` → pages SSG).
⚠️ `huashu-design/lyra-diagram.html` = **v1 périmé** (ambre `#f0b429` + IBM Plex) — pattern hub-spoke OK, mauvais tokens ; ne pas s'en servir comme réf. couleur.

⚠️ **Brand ¬git** (ADR-042) : les assets vivent dans forge (sync Google Drive). Le repo `factory-site` committe **ses propres** `assets/` (logo, OG, favicons, fonts), *sourcés* depuis forge — comme roxabi-site.

---

## 3. Inventaire complet des documents

Préfixes : `factory/` = `~/projects/roxabi-factory` · `idx/` = `~/projects/docs` · `site/` = `~/projects/roxabi-site` · `forge/` = `~/.roxabi/forge`.
Colonne **Pub** : ✅ public-safe · ⚠️ mixte (filtrer) · 🔒 interne (¬publier).

### A — Story & pitch (home + hero)

| Doc | Contenu | Pub |
|---|---|---|
| `idx/vision-roxabi-factory.md` | Thèse moteur+jobs, build-order, value-before-framework | ⚠️ personas/routage brand/cadence CM/HITL = 🔒 |
| `factory/docs/vision.md` | Ancienne vision produit Lyra (« Personal AI agent engine », principes design) | ✅ (rebrand Lyra→Factory) |
| `factory/README.md` | Pitch souveraineté (own hardware, ¬lock-in, how-it-works) | ⚠️ encore titré « Lyra » + MIT |
| `forge/lyra/brand/BRAND-BOOK.md` v2.2 | Positionnement, voix, catégorie, copy | ✅ source de voix |

### B — Architecture (section docs — le cœur)

| Doc | Owns | Pub |
|---|---|---|
| `factory/docs/ARCHITECTURE.md` | Hub/index des 14 domain pages | ✅ |
| `factory/docs/architecture/tool-architecture.md` ⭐ | Taxonomie outils (5-layer + domain-nature), vocab runtime, 2 discriminants | ✅ |
| `factory/docs/architecture/workers-tooling.md` | CliPool, registries, intégration tools | ✅ |
| `factory/docs/architecture/messaging.md` (345l) | Sujets NATS, hub dispatch, routing | ✅ |
| `factory/docs/architecture/contracts.md` | roxabi-nats SDK + roxabi-contracts | ✅ |
| `factory/docs/architecture/architecture-patterns.md` | Clean/Hexagonal/Kernel + invariants | ✅ |
| `factory/docs/architecture/target-architecture.md` | Ports & Adapters tel qu'implémenté | ✅ |
| `factory/docs/architecture/deployment.md` | Quadlet, split conteneurs, autodeploy | ⚠️ infra interne |
| +6 : `storage` · `security-routing` · `adapters` · `llm-streaming` · `voice-to-voice-analysis` (833l) · `testing-conventions` | SSoT par domaine | ✅ |
| `factory/docs/architecture/CURRENT.generated.md` | Inventaire machine-généré | ⚠️ |

→ Les domain pages **consolident** déjà les 61 ADRs (`factory/docs/architecture/adr/`, index `adr/meta.json`). Distiller depuis les domain pages, **¬les ADRs bruts**.

### C — Archive de décision (sélectif — *pourquoi* profond)

| Doc | Sujet |
|---|---|
| `factory/artifacts/analyses/493-tool-system-articulation-analysis.mdx` (601l) | Keystone tool-system, D1-D16 |
| `…/493-tool-domain-nature-consolidation.mdx` (263l) | Domain-nature + vocab runtime |
| `…/harness-epic-consolidated.md` (509l) · `…/1490-harness-composition-analysis.mdx` | Harness |
| `…/1670-nats-subjects-factory-wire-contract-analysis.mdx` | Migration `lyra.*→factory.*` |
| `…/1537-central-inbound-ingestion-design.md` · `…/workenvelope-job-id-invariant.md` | Couche jobs |

→ Reste de `artifacts/{analyses/*-consensus,audits,debt,reviews,postmortems}` = 🔒 interne ingénierie.

### D — Déjà distillé pour le public (GRAINES ⭐)

| Doc | Quoi | Pub |
|---|---|---|
| `site/src/bodies/{en,fr}/doc-factory-roadmap.html` | **Page roadmap** déjà écrite (6 sections, 3 SVG, bilingue, v1.1) — graine doc #1 | ✅ |
| `site/src/site.toml` bloc `doc-factory-roadmap` | SEO/meta de cette page (à porter) | ✅ |
| `factory/artifacts/analyses/493-tool-system-narrative-plan.md` + `pt1-6` | Essai narratif **« L'atelier Lyra »** (prose 15-20 min, lecture à voix haute) — graine long-form | ✅ (rebrand) |

### E — Brand canon (forge — ¬git, sync Google Drive)

`forge/lyra/brand/` :

| Doc | Quoi |
|---|---|
| `BRAND-BOOK.md` v2.2 ⭐⭐ | LA source : positionnement, voix, palette, typo, persona |
| `forge.yml` ⭐ | Tokens machine (palette hex, 4 fonts, composants) — portable CSS |
| `DESIGN.md` (v1 Obsidian) | Variante marketing/hero/avatar, couleurs exactes (+ réf. v2 GitHub-dark pour docs denses) |
| `AGENT-META-PROMPT.md` | Meta-prompt persona/voix agent |
| `BRAND-IDENTITY.deprecated.md` | Identité v1 (historique) |
| `lyra-mark-{dark,light}.svg` · `lyra-favicon-{dark,light}.svg` ⭐ | Marks + favicons (vecteurs prod) |
| `concepts/avatar-lyra-final/` · `concepts/avatar-final/` | Avatars finaux (PNG) — **personnage agent #1** |
| `AVATAR-{PLAYBOOK,LESSONS,LOG,PIPELINES}.md` | Savoir-faire avatar (process) |

`forge/lyra/` (designs prêts) :

| Chemin | Quoi |
|---|---|
| `landing/lyra-landing-{crucible,ember-forge,lattice-ignition}-v0.1.0.css` ⭐ | **3 landing pages complètes** — base directe |
| `visuals/css/*.css` (~25) | Design-system Forge appliqué (arch-v3, user-guide-v17, tool-registry-477…) |
| `visuals/*.html` | Explainers rendus (architecture, harness, dep-graph) |

Heavy/🔒 : `concepts/` (10 813 fichiers) · `prompts/` (9 835) · `embeddings-*/` · `lora-training-set/` · playbooks génération (`BRAND-EXPLORATION-PLAYBOOK`, `PROCESS-PIPELINE-V2`, `V22/V23`, `FACE-LOCK`, `FLUX2-KLEIN`).

Sibling famille Roxabi — `forge/roxabi-site/brand/` : `BRAND-BOOK.md` · `DESIGN.md` · `V1.5-MIGRATION-LOG.md` · `profile-README-draft.md` (identité foundation-block / ambre derrière roxabi.dev — pour cohérence sous-domaine).

### F — Référence de construction (roxabi-site)

| Doc | Rôle |
|---|---|
| `site/src/build.py` · `site.toml` · `templates/page.html` · `partials/` | Le SSG à forker |
| `site/docs/authoring/new-doc-page.md` · `new-project-page.md` | Comment ajouter une page |
| `site/docs/architecture/adr/0002-mini-build.md` | Pourquoi ce build |
| `site/assets/` (tokens.css, fonts, shaders, OG) | Design system à adapter (poser les tokens Forge §2) |
| `site/CLAUDE.md` · `site/.claude/stack.yml` | Conventions repo + stack dev-core |

### G — Voix vivante (runtime, ¬doc)

`~/.lyra/config.db` · `agents.db` · `config.toml` = persona live de l'agent (tagline « your personal AI assistant », voix). SQLite — **source de la voix réelle** de l'agent #1, ¬contenu site direct.

---

## 4. IA proposée (à valider)

```
/                         Home — thèse Factory (PRODUIT) ; Roxabi = FONDATION en sous-texte
                          hero v1 Obsidian + Forge Orange ; avatar Lyra = bloc « agent #1 »
                          teaser flotte (3-4 logos outils) → CTA /tools/
/tools/                  Available Tools — catalogue des capacités câblées (cards → roxabi.dev / repo)
                          l'INSTANCE concrète (vs /documentation/tool-architecture/ = le MODÈLE)
/documentation/          Hub docs (tag-filtré, comme roxabi-site)
  ├─ factory-roadmap/    ← porter site/doc-factory-roadmap (graine D)
  ├─ tool-architecture/  ← distiller factory/docs/architecture/tool-architecture.md (B) — modèle 5-couches
  ├─ atelier-lyra/       ← porter l'essai narratif (graine D) — long-form story
  └─ architecture/       ← distiller ARCHITECTURE.md + domain pages (B)
/agent-1/  (ou section home)   Lyra comme personnage : avatar, persona, « la graine »
/legal/                  Mentions légales (mirror roxabi-site)
```

Tags docs proposés : `Factory` · `Architecture` · `Tools` · `Story`.

### Catalogue `/tools/` (Available Tools) — 6 capacités

Calé sur `tool-architecture.md` (Taxonomy B = domain-nature). `/tools/` = catalogue **capacités** (marketing, cards → roxabi.dev canonique + repo, badge statut). Le rigoureux (couches L0b/satellite, parké #1670) reste dans `/documentation/tool-architecture/`.

| Outil | Capacité | Domaine tool | Backing | Statut standalone |
|---|---|---|---|---|
| `voiceCLI` | voix (TTS/STT) | `voice` ✅ modélisé | satellite self-hosted | ✅ live |
| `imageCLI` | image | `image` ✅ modélisé | satellite self-hosted | ◐ on-demand |
| `roxabi-forge` | artefacts visuels | ✗ ¬modélisé (candidat) | candidat provider | ✅ live |
| `roxabi-production` | vidéo | ✗ ¬modélisé (candidat) | candidat satellite | ◐ |
| `roxabi-intel` | curation liens | ≈ `scrape` (futur) | candidat provider | ◐ |
| **Postiz** | publication social (couche CM/jobs) | `postiz` (futur, #1713) | **adapter NATS satellite** (¬bash) ; `roxabi-postiz` = backing service | ○ fork à monter |

✅ live · ◐ on-demand/dormant · ○ planifié.

⚠️ **Honnêteté** : (1) seuls `voice`/`image`/`postiz` sont des tool-domains du modèle ; `forge`/`production`/`intel` = primitives Roxabi pas encore érigées en domaines tool Factory. (2) Tout le tool-plane est **parké pending #1670** — les CLIs tournent standalone aujourd'hui, leur intégration *comme tools Factory* est roadmap. `llm` (llmCLI) et `vault` exclus : `llm` = **plomberie** (Rule 1) ; `vault` = tool-domain futur déféré du showcase.
**Vocab copie** : tool ≠ worker (worker = compute-sur-engine) ; les outils sont des **tools** adossés à des **providers** (satellites si self-hosted).

---

## 5. Décisions ouvertes (à trancher en session de création)

| # | Décision | Défaut proposé |
|---|---|---|
| S1 | Repo : (a) `factory-site` neuf vs (b) multi-site roxabi-site | **(a)** |
| S2 | Cloudflare : nouveau projet Pages `factory-site` + custom domain `factory.roxabi.dev` | nouveau projet |
| S3 | Portée publiable de la vision (🔒 personas/routage brand/cadence CM/HITL **¬publier**) | exposer thèse + build-order + couche Tools uniquement |
| S4 | Réécrire le naming Lyra→Factory dans `README`/`ROADMAP`/`vision.md` pour reprise publique | oui, copie neuve |
| S5 | Wordmark final « Roxabi Factory » : dériver du mark Lyra ou nouveau | dériver |
| S11 | `/tools/` cards : lien primaire → page projet roxabi.dev ⭐ vs repo GitHub | page roxabi.dev (canonique) |
| S12 | Postiz listé publiquement maintenant (statut ○) vs caché jusqu'au câblage | lister avec badge « bientôt » |

> Relation roxabi.dev ↔ factory.roxabi.dev : **résolue** par le positionnement verrouillé (§0) — fondation (détail canonique) vs produit (capacités câblées, cards link-out). Plus de risque duplicate-content.

---

## 6. Garde-fous

- **Brand ¬git** : sourcer depuis `forge/`, committer les assets du site seulement (ADR-042).
- **¬publier la stratégie privée** : personas, routage Roxabi/Bouly, cadence CM, gouvernance HITL (vision §Personas/CM/Routage) = 🔒.
- **Naming Lyra périmé** : `README`/`ROADMAP`/`vision.md` disent encore « Lyra » → relire avant toute reprise publique.
- **Distiller depuis B (domain pages), jamais C (ADRs/consensus) bruts.**
- **Conventions** : merge-commit ¬squash ; bilingue EN/FR 1:1 ; SEO dérivé (¬copier par page).
