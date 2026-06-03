export const meta = {
  name: 'factory-site-build',
  description: 'Build factory.roxabi.dev: manifest+chrome, Forge reskin, 8 bilingual pages, build+QA',
  phases: [
    { title: 'Manifest & Chrome' },
    { title: 'Reskin & Content' },
    { title: 'Build & QA' },
  ],
}

const REPO = '/home/mickael/projects/factory-site'
const RSITE = '/home/mickael/projects/roxabi-site'
const FACTORY = '/home/mickael/projects/roxabi-factory'
const V17 = '/home/mickael/.roxabi/forge/lyra/visuals/lyra-user-guide-v17.html'
const V17CSS = '/home/mickael/.roxabi/forge/lyra/visuals/css/user-guide-v17.css'
const LANDING = '/home/mickael/.roxabi/forge/lyra/landing'

const COMMON = [
  'PROJECT: factory.roxabi.dev — static bilingual (EN / FR) marketing+docs site for the Roxabi Factory product.',
  'REPO: ' + REPO + ' . The SSG is roxabi-site forked: read ' + REPO + '/docs/factory-site-build-plan.md (executable plan) and ' + REPO + '/docs/factory-site-brief.md (brand/inventory) FIRST, plus ' + RSITE + '/CLAUDE.md to learn the build (site.toml manifest + templates + partials + bodies/{en,fr}; SEO derived from (path,lang) by src/build.py).',
  'POSITIONING (locked): Roxabi = the FOUNDATION (ships standalone primitives) ; Factory = the PRODUCT (agent engine + jobs layer that composes them). Public framing = the Factory thesis (hexagonal engine + jobs + Tools layer), NOT Lyra "Personal Intelligence Engine".',
  'GUARDRAILS: (1) Write ONLY the files your ROLE owns — never touch another role files. (2) Do NOT run git commit/push, do NOT deploy. (3) EN and FR must be 1:1 (same sections/structure). (4) Do NOT publish private strategy (personas internals, Roxabi/Bouly routing, CM cadence, HITL governance). (5) Distill from domain pages, never raw ADRs. (6) Copy vocab: a tool is NOT a worker (worker = compute-on-engine); tools are backed by providers (satellites if self-hosted). (7) Brand source = ' + REPO + '/brand/ (BRAND-BOOK.md voice, DESIGN.md, forge.yml, marks/favicons SVG, AGENT-META-PROMPT.md). (8) Bodies use the roxabi-site CSS class vocabulary (read ' + RSITE + '/src/bodies for examples) — NOT the v17 class names.',
  'Return a short factual summary of what you wrote (files + key choices). Your text is the tool result, not shown to a human.',
].join('\n')

// ───────────────────────── PHASE 1 — Manifest & Chrome (sole owner of src/site.toml, src/partials/*, src/templates/page.html, src/build.py) ─────────────────────────
phase('Manifest & Chrome')
const manifestPrompt = COMMON + '\n\n' + [
  'ROLE: Manifest & Chrome. You OWN and may edit ONLY: ' + REPO + '/src/site.toml, ' + REPO + '/src/partials/nav.html, ' + REPO + '/src/partials/footer_full.html, ' + REPO + '/src/partials/footer_min.html, ' + REPO + '/src/templates/page.html, ' + REPO + '/src/build.py. Do NOT write any bodies/ or assets/ file.',
  '',
  'TASKS:',
  '1. src/build.py — change the JSON-LD series name "Roxabi Documentation" to "Roxabi Factory Documentation" (in jsonld_techarticle). Then update the nav context in build_page: the new primary nav has TWO links — Tools and Docs (drop projects + constitution). So provide ctx keys tools_href + documentation_href + tools_current + docs_current (replace projects_href/constitution_href/projects_current/constitution_current). Keep home_href, legal_href.',
  '2. src/site.toml — rewrite as the Factory manifest:',
  '   - SITE block: base="https://factory.roxabi.dev" ; org_name="Roxabi Factory" ; github="https://github.com/Roxabi/roxabi-factory" ; lastmod="2026-06-03".',
  '   - [lang.en]/[lang.fr]: keep the chrome keys but rewrite footer_tagline + footer_note to a Factory voice (forge/maker energy, sovereignty subtext) ; rewrite nav labels so the primary nav reads Tools + Docs ; the sibling footer line points to roxabi.dev ("Foundation brand — shared amber family" / "Marque fondation — famille ambre partagée"). Use BRAND-BOOK.md voice.',
  '   - REMOVE all roxabi-only pages: constitution, projects, every proj-*, and the 8 Cortex/Audit/REX doc pages.',
  '   - KEEP+adapt: home (path "", body home, jsonld home, shader="ember-forge", active "") ; documentation (path documentation/, body documentation, collection documentation, jsonld breadcrumb, active docs) ; legal (path legal/, body legal) ; doc-factory-roadmap (path documentation/factory-roadmap/, body doc-factory-roadmap, collection documentation, tags ["Factory"], jsonld techarticle) — keep its existing block.',
  '   - ADD these [[page]] blocks (full EN+FR SEO text: title/desc/og_title/og_desc, crumb, card_title/card_desc for doc pages):',
  '       tools            path "tools/"                         body tools             jsonld breadcrumb       active "tools"  ancestors [home]',
  '       agent-1          path "agent-1/"                       body agent-1           jsonld breadcrumb       active ""       ancestors [home]',
  '       doc-tool-architecture  path "documentation/tool-architecture/"  body doc-tool-architecture  jsonld techarticle  collection documentation  tags ["Tools"]         ancestors [home, documentation]',
  '       doc-architecture       path "documentation/architecture/"       body doc-architecture       jsonld techarticle  collection documentation  tags ["Architecture"]  ancestors [home, documentation]',
  '       doc-atelier-lyra       path "documentation/atelier-lyra/"       body doc-atelier-lyra       jsonld techarticle  collection documentation  tags ["Story"]         ancestors [home, documentation]',
  '     Doc-collection order in the manifest = reading order: factory-roadmap, tool-architecture, architecture, atelier-lyra. Tags used: Factory, Tools, Architecture, Story. Give each doc version="1.0" updated="2026-06-03".',
  '3. src/partials/nav.html — wordmark "Roxabi Factory" (Outfit 800) + inline the forge DIAMOND mark SVG (take it from ' + REPO + '/brand/lyra-mark-dark.svg, or the nav-mark in ' + V17 + ' lines ~38-101). Primary nav links = Tools ({{tools_href}}, {{tools_current}}) + Docs ({{documentation_href}}, {{docs_current}}). Keep the lang toggle, GitHub icon, theme button. Agent #1 and Legal are NOT in the primary nav (reached from home/footer).',
  '4. src/partials/footer_full.html + footer_min.html — footer brand "Roxabi Factory" + small diamond mark ; links GitHub + Issues ; a link to /agent-1/ and /legal/ ; the sibling line → roxabi.dev. Keep the derived chrome keys.',
  '5. src/templates/page.html — review only; edit a hardcoded "Roxabi" brand string only if present. Fonts are loaded via assets/css/fonts.css (the Reskin role adds Chakra Petch + Outfit there) — you do not need to add font links.',
  '6. VALIDATE: run  cd ' + REPO + ' && python3 -c "import tomllib,pathlib; tomllib.loads(pathlib.Path(\'src/site.toml\').read_text()); print(\'toml ok\')"  and fix any parse error. Do NOT run the full build (bodies are written by other agents).',
  '',
  'Canonical page ids/bodies (the content agents will create matching bodies/<lang>/<body>.html): home, tools, documentation, agent-1, legal, doc-factory-roadmap, doc-tool-architecture, doc-architecture, doc-atelier-lyra. Body filename MUST equal the body= value.',
].join('\n')

const manifest = await agent(manifestPrompt, { label: 'manifest+chrome', phase: 'Manifest & Chrome' })
log('Phase 1 done — manifest + chrome written')

// ───────────────────────── PHASE 2 — Reskin (assets) ∥ Content ×8 (bodies) ─────────────────────────
phase('Reskin & Content')

const reskinPrompt = COMMON + '\n\n' + [
  'ROLE: Reskin (Forge design system). You OWN and may edit ONLY files under ' + REPO + '/assets/ (css/, js/app.js, vendor/, logo/, fonts/). Do NOT touch src/.',
  'GOAL: turn the copied roxabi-site (amber) skin into the Forge skin, by OVERLAY — keep the roxabi-site styles.css structure & class names (the bodies use them); only change token VALUES + add the v17 hero module.',
  'SOURCES to read: ' + V17CSS + ' (the complete built Forge system — palette, dark+light, hero, components) ; ' + LANDING + '/lyra-landing-ember-forge-v0.1.0.{css,js} (Canvas2D ember shader) ; ' + LANDING + '/lyra-landing-crucible-v0.1.0.css (the no-webgl static-gradient fallback) ; ' + REPO + '/brand/{DESIGN.md,forge.yml,lyra-mark-dark.svg,lyra-mark-light.svg,lyra-favicon-dark.svg,lyra-favicon-light.svg} ; ' + RSITE + '/assets/css/{tokens,styles,fonts}.css (the base you are modifying).',
  'TASKS:',
  '1. assets/css/tokens.css — keep the roxabi-site token NAMES (--bg --panel --surface --accent --accent-hover --text --text-muted --text-dim --border --border-hi --code-* --glow-accent radius/spacing/motion) but map Forge VALUES onto them: bg #0a0a0f, panel #101018, surface #18181f, accent #e85d04, accent-hover #f97316, text #fafafa, text-muted #9ca3af, text-dim #6b7280, border rgba(255,255,255,.07), border-hi #2a2a35, glow ember. Update the [data-theme="light"] block to the Forge light palette (from v17: bg #fafaf9, accent #c2410c, text #1c1917, ...). Add --font-head:Outfit and --font-display:"Chakra Petch". Keep code surface dark.',
  '2. assets/css/fonts.css — ADD @font-face for Chakra Petch (600,700) and Outfit (700,800). Try to self-host woff2 (mirror how roxabi-site self-hosts: fetch the Google Fonts css2 with a modern browser User-Agent to get woff2 URLs, download into assets/fonts/). If the network is unavailable, fall back to a single @import of the Google Fonts css2 URL at the top of fonts.css and note the TODO. Keep existing Inter + JetBrains Mono.',
  '3. assets/css/styles.css — apply --font-head to headings + the wordmark/nav, --font-display to the hero title. PORT the v17 hero module so the home body can use it: .hero (2-col grid), the ember-pulse glow (::before) + angular forge lines (::after), .hero-title (Chakra Petch, supports a data-glitch entrance), .hero-sub, .hero-ctas with .hero-btn.primary (forge orange) / .hero-btn.secondary (steel), .hero-mark + ember drop-shadow, responsive 1-col on mobile, prefers-reduced-motion. Cherry-pick v17 badges/info-boxes/flow-node classes only if simple to add.',
  '4. assets/js/app.js — keep its existing behavior (theme toggle, reveal, doc filter) and ADD a glitch-decode effect for an element with [data-glitch] (the hero title), mirroring v17 js behavior.',
  '5. assets/vendor/ember-forge.js — port the ember-forge Canvas2D shader from the landing JS, adapted to the roxabi-site shader convention (a vendored module that auto-inits the #hero-bg element in dark mode — read an existing ' + RSITE + '/assets/vendor/kinetic-grid.js to match the init contract). Include the crucible no-webgl static-gradient fallback so it degrades gracefully. The home page sets shader="ember-forge".',
  '6. assets/logo/ — write factory-mark-dark.svg + factory-mark-light.svg (the forge diamond, from brand/lyra-mark-*.svg) and a favicon SVG. (OG PNGs + icon PNGs stay as the copied placeholders — note them as a follow-up; do not attempt PNG generation.)',
  'Do NOT run the full site build (the QA role does). Just keep CSS/JS syntactically valid.',
].join('\n')

const contentPages = [
  { body: 'home', label: 'home', brief: [
      'PAGE: Home (path "/"). jsonld home. shader ember-forge (set by manifest).',
      'BASE: ' + REPO + '/src/bodies/en/home.html (copied from roxabi-site — replace its content). Read it for structure.',
      'SOURCES: ' + FACTORY + '/docs/vision.md (rebrand Lyra→Factory) ; ' + FACTORY + '/README.md ; ' + REPO + '/brand/BRAND-BOOK.md (voice) ; ' + REPO + '/docs/factory-site-build-plan.md (sections 0,5,6).',
      'CONTENT: a v17-style HERO (left: .hero-title with data-glitch e.g. "AN ENGINE. EXTENDED." or the Factory thesis line, .hero-sub, .hero-ctas Get Started + GitHub ; right: .hero-mark-wrap with the animated forge diamond SVG inlined — copy the hero-mark SVG from ' + V17 + ' lines ~127-310). Then sections: the thesis (hexagonal engine + jobs layer + Tools layer), value-before-framework, a tool-fleet teaser (3-4 tool names) linking to /tools/, an "Agent #1" block (Lyra the character) linking to /agent-1/, a final CTA. Roxabi = foundation, in subtext. PUBLIC only (no private strategy).',
    ].join('\n') },
  { body: 'tools', label: 'tools', brief: [
      'PAGE: Available Tools (path "/tools/"). jsonld breadcrumb.',
      'SOURCE: ' + REPO + '/docs/factory-site-build-plan.md section 5 (the 6-tool catalogue) + ' + FACTORY + '/docs/architecture/tool-architecture.md (Taxonomy B) for accuracy.',
      'CONTENT: a card grid of 6 capability tools — voiceCLI (voice), imageCLI (image), roxabi-forge (visual artifacts), roxabi-production (video), roxabi-intel (link curation), Postiz (social publishing). Group: Roxabi primitives vs external integration (Postiz). Each card: capability + honest status badge (live / on-demand / planned) + primary link to roxabi.dev/projects/<tool>/ (voicecli, imagecli, roxabi-forge) or its repo. Postiz gets a "soon"/"bientôt" badge. State honestly that the whole tool-plane is on the roadmap (CLIs run standalone today). Note /tools/ is the instance; /documentation/tool-architecture/ is the model. Vocab: tool ≠ worker.',
    ].join('\n') },
  { body: 'documentation', label: 'documentation', brief: [
      'PAGE: Documentation hub (path "/documentation/"). collection index.',
      'BASE: ' + REPO + '/src/bodies/en/documentation.html (copied). It uses derived markers {{doc_cards}} {{doc_filter}} {{doc_count}} — KEEP those markers. Only adapt the hero/intro copy to the Factory (docs across Factory, Tools, Architecture, Story). Light edit.',
    ].join('\n') },
  { body: 'agent-1', label: 'agent-1', brief: [
      'PAGE: Agent #1 (path "/agent-1/"). jsonld breadcrumb. Lyra as the character — the seed agent.',
      'SOURCES: ' + REPO + '/brand/BRAND-BOOK.md (persona, voice) ; ' + REPO + '/brand/AGENT-META-PROMPT.md ; ' + REPO + '/brand/AVATAR-PLAYBOOK.md (high level only). Avatar images live in brand/concepts/avatar-*-final/ but are not yet wired into assets/ — describe the character; leave an image placeholder/TODO, do not embed a broken img path.',
      'CONTENT: who Lyra is as the product first character (agent #1), the persona and voice, "the seed". Keep it public-safe and high-level — do NOT dump the meta-prompt internals or private routing. Use the doc-page structure (doc-hero + prose).',
    ].join('\n') },
  { body: 'legal', label: 'legal', brief: [
      'PAGE: Legal notice (path "/legal/").',
      'BASE: ' + REPO + '/src/bodies/en/legal.html (copied). Adapt: site = factory.roxabi.dev, publisher = Roxabi (Mickael Bouly, mickael@bouly.io), host = Cloudflare Pages, IP, privacy (no analytics, no tracking). Mirror the roxabi-site structure, just change the specifics.',
    ].join('\n') },
  { body: 'doc-tool-architecture', label: 'doc:tool-arch', brief: [
      'PAGE: doc — Tool Architecture (path "/documentation/tool-architecture/"). techarticle, tag Tools.',
      'STRUCTURAL TEMPLATE: ' + REPO + '/src/bodies/en/doc-factory-roadmap.html (doc-hero + .toc + sections with .titre/.label/.callout). Match that vocab.',
      'SOURCE to distill: ' + FACTORY + '/docs/architecture/tool-architecture.md — the 5-layer tool model (L0a/L0b/L1/L2/L3), Taxonomy B domain-nature (tool vs plomberie), the runtime vocabulary (workerEngine/harness/worker/provider/satellite), and the two discriminators (tool-surface≠tool-nature ; provider⊋satellite). This is the conceptual MODEL (the /tools/ page is the instance). Public-safe.',
    ].join('\n') },
  { body: 'doc-architecture', label: 'doc:architecture', brief: [
      'PAGE: doc — Architecture (path "/documentation/architecture/"). techarticle, tag Architecture.',
      'STRUCTURAL TEMPLATE: ' + REPO + '/src/bodies/en/doc-factory-roadmap.html.',
      'SOURCES to distill (domain pages, not raw ADRs): ' + FACTORY + '/docs/ARCHITECTURE.md + ' + FACTORY + '/docs/architecture/{architecture-patterns.md,target-architecture.md,messaging.md,contracts.md}. Cover: hexagonal core (ports & adapters), hub-and-spoke topology, the NATS message bus + typed contracts, per-scope agent pools, the worker fleet. EXCLUDE internal deployment/infra details (Quadlet, container split) — those are not public.',
    ].join('\n') },
  { body: 'doc-atelier-lyra', label: 'doc:atelier', brief: [
      'PAGE: doc — Atelier Lyra (path "/documentation/atelier-lyra/"). techarticle, tag Story. Long-form narrative essay.',
      'STRUCTURAL TEMPLATE: ' + REPO + '/src/bodies/en/doc-factory-roadmap.html (but more prose, fewer diagrams).',
      'SOURCE to port: ' + FACTORY + '/artifacts/analyses/493-tool-system-narrative-plan.md and its pt1..pt6 parts if present (read the directory). It is a read-aloud narrative essay ("L\'atelier Lyra"). Port it as long-form prose, keeping Lyra as the narrative character but framing it within the Roxabi Factory. Rebrand stale naming.',
    ].join('\n') },
]

function contentPrompt(p) {
  return COMMON + '\n\n' + [
    'ROLE: Content author for ONE page. You OWN and may write ONLY these two files: ' + REPO + '/src/bodies/en/' + p.body + '.html and ' + REPO + '/src/bodies/fr/' + p.body + '.html. Touch NOTHING else (not site.toml, not assets, not other bodies).',
    'Each file is a bare <main>...</main> in the roxabi-site class vocabulary (read ' + RSITE + '/src/bodies and the copied seed bodies for the exact classes). Do NOT add a <head>, nav, or footer — those are templated. Do NOT run the build.',
    'Write EN first, then mirror FR 1:1 (same sections, same structure). French must be natural, not machine-translated.',
    '',
    p.brief,
  ].join('\n')
}

const tasks = [ () => agent(reskinPrompt, { label: 'reskin', phase: 'Reskin & Content' }) ]
for (const p of contentPages) {
  tasks.push(() => agent(contentPrompt(p), { label: 'body:' + p.label, phase: 'Reskin & Content' }))
}
const built = await parallel(tasks)
log('Phase 2 done — reskin + ' + contentPages.length + ' pages written')

// ───────────────────────── PHASE 3 — Build & QA (sole owner of the build step; may fix anything) ─────────────────────────
phase('Build & QA')
const qaPrompt = COMMON + '\n\n' + [
  'ROLE: Build & QA. The manifest, the Forge reskin, and all 9 page bodies (home, tools, documentation, agent-1, legal, doc-factory-roadmap, doc-tool-architecture, doc-architecture, doc-atelier-lyra) have been written. Produce a clean build.',
  'TASKS:',
  '1. Run  cd ' + REPO + ' && python3 src/build.py . Fix every error: unresolved {{tokens}} (build.py raises on these), missing body files, manifest/body mismatches. Re-run until it builds cleanly. Expect 9 pages × 2 langs (18) + sitemap.',
  '2. Verify EN/FR parity per page (same section count/structure). Flag/fix gross mismatches.',
  '3. Verify the Forge skin loaded: dist pages reference the Forge tokens (accent #e85d04 / bg #0a0a0f), Chakra Petch/Outfit fonts, and the home references the ember-forge shader. Check light+dark both present.',
  '4. Sanity contrast: Forge Orange #e85d04 on Obsidian #0a0a0f for key text/CTA (WCAG AA-ish). Note any failures.',
  '5. Do NOT commit, push, or deploy. Leave dist/ built in the working tree.',
  'REPORT (this is the workflow result): build pass/fail, page count, any pages with issues, EN/FR parity status, contrast notes, and a short punch-list of follow-ups (e.g. OG/icon PNGs, font self-host fallback, avatar image wiring).',
].join('\n')
const qa = await agent(qaPrompt, { label: 'build+qa', phase: 'Build & QA' })

return { manifest, content: built.map((r, i) => r ? 'ok' : 'FAILED').join(' '), qa }
