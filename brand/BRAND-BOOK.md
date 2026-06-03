# Lyra — Brand Book

**Version:** 2.2 (2026-04-20)
**Status:** Authoritative. Replaces `BRAND-IDENTITY.md` (v1) for all forward-looking decisions.
**Scope:** Marketing, product copy, visual design, and agent persona.

**What's new in 2.2 (2026-04-20):**
- § 6 Visual Identity now documents **two aesthetic variants** — *v1 Obsidian* (marketing, brand, hero, avatar photography) and *v2 GitHub-dark* (dep-graphs, architecture diagrams, dense-data docs). Same brand hues, different surface ladder.
- Added § 6 *Surface Selection Rule* — when to use v1 vs v2.
- Extended palette gains an elevation ladder (`--bg-cell`/`--bg-panel`/`--bg-card`), `--border-hi`, status tokens, and a 13-value lane palette for swim/DAG views.
- Typography: Chakra Petch is now explicitly *v1-display-only* — v2 docs use Outfit 700 for display and skip the Chakra Petch font load.
- § 8 Asset Index lists the two CSS source-of-truth files (`aesthetics/lyra.css`, `aesthetics/lyra-v2.css`).

<!-- Exploration archive: ~/.agent/lyra/brand/ (logo iterations, concept PNGs, galleries, prompts) -->
<!-- See ~/projects/docs/adr/001-exploration-artifacts-location.md for the convention -->

---

## 1. Brand Overview

### What is Lyra?

Lyra is a **Personal Intelligence Engine**. It runs 24/7 on hardware you own, connects to any messaging channel, and routes conversations to specialized agents that use your own LLMs, memory, and tools.

No subscription. No cloud lock-in. Your data stays on your machines.

### Mission

Give individuals the same compounding intelligence advantage that enterprises buy with million-dollar toolchains — but owned outright, auditable, and built to extend.

### Category

**Personal Intelligence Engine**

This is a category claim, not a borrowed label. It sets the right competitive set (above bare LLMs, below enterprise orchestration platforms), signals infrastructure-level thinking, and attracts builders who want a foundation — not a black box. The "intelligence" qualifier can be layered into brand voice and copy without needing to become the category label itself at every usage.

---

## 2. Positioning

### Positioning Statement

> Lyra is a **Personal Intelligence Engine** — an always-on, extensible hub that compounds your capabilities across every tool, channel, and workflow you own.
>
> Lyra runs on your hardware, learns your workflows, and grows as you extend it — giving back more than you put in.

### Anatomy

| Component | Value |
|-----------|-------|
| Category | Personal Intelligence Engine |
| Lead angle | Intelligence — capability, memory, multi-agent |
| Emotional hook | Extensibility — bidirectional value compounds |
| Differentiation | Runs on your hardware. You extend it, it grows with you. |

### Competitive Stance

| Competitor type | Their problem | Lyra's answer |
|----------------|---------------|---------------|
| Cloud AI (ChatGPT, Claude) | Data leaves; no memory; resets every tab | Runs on your machine; memory persists indefinitely |
| Frameworks (LangChain, LlamaIndex) | You build everything; no product, no runtime | A working agent on day one; extend what you need |
| Open-source bots | Single-channel, stateless, no real memory | Hub-and-spoke; semantic memory; multi-channel |
| Self-hosted SaaS (n8n, Flowise) | Hard to extend; no real agent reasoning | Clean extension model; auditable core; real asyncio concurrency |

### Anti-Positioning

Lyra is **not** a chatbot — it is a persistent, multi-agent engine. Every mention of "chatbot" is actively misleading.

Lyra is **not** a framework — it ships a running system, not a library to build one from scratch.

Lyra is **not** a SaaS — no subscription, no cloud handoff, no availability SLA someone else controls.

Lyra is **not** an autonomous agent — it acts when you message it. "Lyra handles it when you ask" is accurate. "Lyra handles everything" is not.

Lyra is **not** multi-tenant — it is built for one operator on hardware they control. This constraint is what makes the privacy and auditability claims credible.

---

## 3. Target Audience

### Priority Order

1. **Yuki** (primary) — forks on day one
2. **Sofia** (secondary) — wants a reliable teammate across projects
3. **Alex**, **Marcus** (tertiary) — driven by privacy and knowledge management respectively

Full persona artifact: [`lyra-customer-personas.html`](lyra-customer-personas.html)

### Persona Summaries

**Yuki Tanaka — The Tinkerer**
Builder mindset. Wants to understand every layer of the AI stack. If she can't read the source, she doesn't trust it. Her trigger: "I want to build a personal AI with my own models and channels, starting from a clean, auditable asyncio foundation — not rewriting concurrency logic every weekend project." The Forge metaphor maps directly onto her Saturday workflow: raw Python scripts in, polished agent out.

**Sofia Rossi — The Solo Operator**
Three projects active simultaneously. Needs continuity, not search. Her trigger: "I don't need a smarter search engine. I need something that actually knows what I'm working on right now." Lyra's persistent memory means she stops re-explaining herself. Telegram is the unified command surface she doesn't have today.

**Alex Chen — The Privacy Developer**
Won't feed proprietary client code into someone else's black box. Motivated by sovereignty and auditability. Local LLM support and the "never leaves the machine by design, not by policy" proof point are his primary decision signals.

**Marcus Webb — The Knowledge Worker**
Saved 6,000 links since 2019. Can't find anything. The knowledge is useless if he can't recall it. Lyra's semantic memory (BM25 + fastembed, `/add`, `/search`) is exactly what he has been trying to build himself for three years.

### Primary Audience Signal (for copy prioritization)

When in doubt, write for Yuki. She is a competent engineer evaluating a tool. She will not tolerate vagueness, inflated claims, or hand-holding. She responds to architectural honesty, concrete numbers (300 lines, 24/7, your GPU), and the promise of something she can own and extend.

---

## 4. Brand Voice

### Marketing Voice

The marketing voice is constant across surfaces. The **register** (formal vs. casual) shifts by context — the voice does not.

| Attribute | This | Not this |
|-----------|------|----------|
| Confident | "Your data never leaves your machine." | "We believe privacy is important." |
| Technical | "A 300-line auditable core. No magic." | "Powered by advanced AI architecture." |
| Warm | "It runs while you sleep." | "Experience seamless AI integration." |
| Declarative | "It remembers. You don't repeat yourself." | "It may help reduce repetitive prompting." |
| Principled | "Not by policy — by design." | "We take your privacy very seriously." |

### Context Register

- **Landing page / hero copy**: Warm, declarative, short sentences. Lead with the human benefit. Let architecture emerge naturally. No bullet lists in hero sections.
- **Technical docs / README**: Precise, technical, trust-through-specificity. Architecture details are welcome here.
- **Video voiceover**: Spoken rhythm — shorter pauses, open with the problem, trust visuals to carry the rest.
- **Community (Discord, GitHub Discussions)**: Relationship framing is permitted here. See Section 5 for rules.

### Product / Agent Voice

The voice Lyra uses when speaking as an agent is governed by [`lyra_default.persona.toml`](../../.roxabi-vault/personas/lyra_default.persona.toml) and is **independent of the marketing voice**.

Agent traits: warm, curious, thoughtful, adaptable, reliable. Communication style: conversational and clear. Matches the user's register — casual when they're casual, precise when they need precision. Explains things without being condescending. Friendly and calm. Approachable without being sycophantic.

The marketing voice is not the agent voice. Do not conflate them.

### Writing Rules

**Do:**
- Lead with the outcome, not the feature. "It remembers the context from three weeks ago. You don't have to repeat yourself." Not "Lyra has a persistent memory system."
- Make the architecture tangible. "One message on Telegram. The same answer on Discord. One intelligence behind both." Not "Lyra uses a hub-and-spoke model."
- Use contrasts to create clarity. "ChatGPT resets every conversation. Lyra remembers." Not "Lyra is better than ChatGPT in several ways."
- Write short, active sentences as the default. Target 8–14 words in hero copy.
- Use "your" and "you" deliberately. Possession signals sovereignty.
- Use the rule of three sparingly — once per block creates momentum without needing a transition.

**Don't:**
- Use AI marketing clichés. Banned: "AI-powered", "next-generation", "cutting-edge", "seamless", "intelligent assistant", "game-changer", "revolutionize".
- Bury the lede with architecture. Start with what the user gains.
- Promise autonomy Lyra doesn't deliver. "Lyra handles it when you ask" — not "Lyra handles everything."
- Use passive voice for key claims. "Your data never leaves your machine." Not "Your data is kept private."
- Open with "We believe…", "In a world where…", or "Introducing…". Start with the problem or the product.
- Use monospace for general emphasis. JetBrains Mono is for CLI commands, config values, and file paths only.

### Vocabulary

**Use:**
| Word | Why |
|------|-----|
| personal | signals intimacy and ownership; not "consumer" (implies passive mass market) |
| runs on your hardware | concrete, physical; not "on-premise" (enterprise jargon) |
| memory | human, understood; not "persistent state" or "vector store" |
| adapters | specific to Lyra's architecture; not "integrations" or "plugins" |
| channels | reflects the hub metaphor; not "platforms" or "interfaces" |
| sovereignty | principled, not defensive; captures the full value of local-first |
| auditable | technical trust signal; not "transparent" (overused) |
| always-on | conveys 24/7 availability naturally; not "persistent" (abstract) |
| hub | core architectural term; use consistently |

**Avoid:**
| Word | Why |
|------|-----|
| AI-powered | redundant — everything is AI-powered now |
| on-premise | enterprise procurement language; cold and distancing |
| consumer | strips the user of agency |
| chatbot | implies simple, stateless interaction |
| seamless | filler; say exactly what works and how |
| leverage | corporate filler; use "use", "run", "build on" |
| ecosystem | vague; be specific about what connects to what |
| democratize | overused, hollow tech manifesto language |
| solution | use the actual word: agent, tool, system, engine |

---

## 5. Messaging

### Pillars (priority order)

The priority order was reversed from the original exploration. Extensibility is now the lead differentiator, with Sovereignty as table stakes.

**Pillar 1 — Extensibility**
*"A core you own. A system you extend."*
Lyra's hub is 300 auditable lines. Every other capability — adapters, agents, skills, memory — plugs in without touching the core. Build exactly what you need. Nothing more. The extension model is bidirectional: you extend Lyra, and Lyra extends what you can do.

Proof point: Clean extension model — adapter interface (Telegram, Discord, future channels), agent TOML configs, skills as composable units.

**Pillar 2 — Intelligence / Memory**
*"An AI that actually remembers you."*
Lyra builds semantic memory across every conversation — projects, preferences, decisions, context. It grows more useful the longer it runs. You never start from zero again.

Proof point: Persistent memory namespaced per agent, semantic retrieval via embeddings, cross-conversation context.

**Pillar 3 — Always-On**
*"Running while you sleep. Answering when you ask."*
Lyra runs 24/7 on your hub machine. Telegram at 6am. Discord during the day. One intelligence behind all of it, always available.

Proof point: asyncio event loop and supervisord management. Sequential per-user processing, parallel cross-user handling. No queues to configure. No availability SLA to pay for.

**Pillar 4 — Sovereignty** (table stakes)
*"Your AI. Your hardware. Your data."*
Lyra runs entirely on machines you control. No subscription. No cloud handoff. The inference, the memory, the logs — all of it stays in your home, under your rules.

Proof point: Local LLM support via OpenAI-compatible API. Sensitive documents never leave the local network by design — not by policy.

Every piece of copy should touch at least one pillar.

### Taglines

**Lead tagline:**
> Your intelligence, compounded.

**Supporting taglines:**
> Your stack. Your rules. Your intelligence.

> Think further.

**Landing page positioning line:**
> Lyra is a Personal Intelligence Engine — an always-on, extensible hub that compounds your capabilities across every tool, channel, and workflow you own.

### Narrative Arc

The full narrative arc for landing pages, README intros, and product pitches:

1. **Problem**: Every AI you use resets the moment you close the tab. It doesn't know your projects, your preferences, or anything you told it last week. It lives on someone else's server — which means your data, your context, your work belongs to them by default.

2. **Agitate**: You rebuild context every single time. You explain the same project. You're renting intelligence from a system that will be updated, changed, or paywalled at someone else's discretion. You have no continuity. You have no control.

3. **Solution**: Lyra is a personal AI agent engine that runs 24/7 on your own hardware — connecting to the channels you already use, remembering everything across conversations, and growing more useful the longer it runs.

4. **Proof**: A 300-line auditable core. Stateless agents over stateful pools — no hidden side effects, no race conditions. Local LLM support: your most sensitive documents never leave your machine. Two messages from you are processed in order. Two messages from different people are processed in parallel. Zero configuration. Read the architecture in an afternoon — you'll find no magic.

5. **CTA**: Run it on your hardware this weekend. Clone the repo, follow the getting-started guide, and send your first message on Telegram in under an hour. Or read the architecture first — it's designed to be understood, not trusted blindly.

### Intelligence vs Relationship Language

This is one of the highest-leverage decisions in the brand. Get it wrong and you either lose Yuki (too creepy) or fail to build community (too cold).

**Intelligence framing is the lead everywhere a stranger reads you first:**
- Landing page hero and above-fold copy
- README introduction and docs front matter
- Conference talks, demo scripts, screencasts
- Technical blog posts and architecture writeups
- Hacker News / dev.to launch posts
- Competitive comparisons

**Relationship framing earns its place after trust is established:**
- Early adopter outreach (DMs, intro emails)
- Community messaging (Discord, GitHub Discussions)
- Onboarding copy and first-run experience
- Testimonial and case study framing
- Changelog announcements

**The rules for Relationship framing:**

The user is always the grammatical subject. Lyra is the engine that serves what the user deliberately configured. Anchor every claim in what the user chose to do.

| Avoid | Use instead |
|-------|-------------|
| "Lyra knows you better every day." | "Lyra adapts to how you actually work." |
| "An AI that understands who you are." | "An intelligence engine that compounds your workflows." |
| "Your AI learns your preferences automatically." | "You shape the memory. Lyra uses what you give it." |
| "Lyra cares about keeping your data private." | "Your data never leaves the machine. Not by policy — by design." |
| "Lyra knows you." | "Lyra learns your workflows." |

Never: anthropomorphism that implies awareness Lyra does not have, possessiveness that implies lock-in, or performance claims that substitute for proof.

---

## 6. Visual Identity

### Direction H — Forge (chosen)

**Theme:** Maker energy — raw materials in, crafted output out.
**Mood keywords:** Powerful, maker pride, craftsperson, angular, bold, "I built this."

### Color Palette

Lyra ships **two aesthetic variants** with the same brand hues and a different surface ladder. Pick the variant by surface type (see *Surface Selection Rule* below).

#### v1 · Obsidian (marketing, brand, hero, avatar photography)

Source of truth: `~/projects/roxabi-forge/plugins/forge/references/aesthetics/lyra.css`

| Token | Hex | Semantic role |
|-------|-----|---------------|
| Obsidian | `#0a0a0f` | Page background — near-absolute dark |
| Forge Floor | `#18181f` | Surface elevated 1 — cards, panels |
| Steel | `#2a2a35` | Borders, dividers |
| Forge Orange | `#e85d04` | Primary accent — actions, highlights, glow |
| Steel Gray | `#6b7280` | Dim metadata, tertiary labels — maps to `--text-dim` on doc surfaces |
| Spark White | `#fafafa` | Body text, node centres, wordmark |
| Ember | `#f97316` | Secondary accent — glow softening |
| Deep Iron | `#1f2937` | Alternative surface |

Body chrome on v1: radial ember glow from top, subtle 42px grid mask — the "forge floor" signature.

#### v2 · GitHub-dark (dep-graphs, architecture, plans, dense-data docs)

Source of truth: `~/projects/roxabi-forge/plugins/forge/references/aesthetics/lyra-v2.css`

v2 keeps every accent hue from v1 (`#e85d04` Forge Orange, `#f97316` Ember, `#fafafa` Spark White) and rebases **only the surfaces** onto a GitHub-dark elevation ladder. Body chrome is flat — no forge-floor grid, no spark particles.

| Token | Hex | Semantic role |
|-------|-----|---------------|
| `--bg` | `#0d1117` | Page background |
| `--bg-cell` | `#0f141a` | Recessed surface inside a panel (grid cell, inset) |
| `--bg-panel` | `#13191f` | Section / wrapper surface |
| `--bg-card` | `#161b22` | Raised surface inside a panel (issue card, node label) |
| `--border` | `#21262d` | Default dividers |
| `--border-hi` | `#30363d` | Emphasized dividers for dense data grids |

**Elevation ladder:** `--bg` < `--bg-cell` < `--bg-panel` < `--bg-card` (darkest → lightest). Cards *pop up* from their container rather than recessing — this is the inverse of v1 and is what gives v5.1 dep-graph / v5 kernel-arch their "GitHub network graph" feel.

**Accent alphas are pushed** in v2 (for more "live ember" on cards/nodes):

| Token | v1 | v2 |
|---|---|---|
| `--accent-dim` | `rgba(232,93,4,0.08)` | `rgba(232,93,4,0.12)` |
| `--accent-glow` | `rgba(232,93,4,0.22)` | `rgba(232,93,4,0.40)` |

**Usage principles (both variants):**
- Forge Orange is the brand signal. Use it for one dominant element per composition.
- Steel Gray / `--text-dim` carries all secondary information. It should never compete with Forge Orange.
- Spark White is text on dark. Never reverse (white background) unless producing a monochrome lockup.
- Do not introduce new colours without updating this table.

### Surface Selection Rule

| Surface type | Use | Why |
|---|---|---|
| Landing page, hero, marketing site | **v1** | Forge-floor chrome + Chakra Petch = the brand's emotional signature |
| Avatar photography, bot profile picture, social cards | **v1** | Always marketing surface — `#0a0a0f` background is the brand photographic bg |
| Brand galleries (logo concepts, avatar selection, visual directions) | **v1** | Brand exploration surface |
| README, CONTRIBUTING, public docs front matter | **v1** | Reader's first impression — warmth first |
| Dep-graphs, architecture diagrams, DAG views | **v2** | Dense-data surface — elevation ladder + flat chrome reads faster |
| Swimlane / flow diagrams with many nodes | **v2** | Same — lane palette lives on v2 |
| Plan / roadmap boards, issue grids, status dashboards | **v2** | Same |
| Technical deep-dives with tables, chips, dense diagrams | **v2** | Reduces cognitive load vs forge-floor grid under a table |
| Recap / status docs | Designer's call | Either works — pick by whether the doc leads with prose (v1) or data (v2) |

Mixing variants in a single doc is **not allowed**. Pick one per file. A page linked from a v1 marketing site to a v2 architecture diagram crosses a context boundary — the variant shift is the signal.

### Light Mode

A light theme is authorized for **v1 documentation and technical guides only**. The light palette adapts the core forge tokens for readability on light surfaces:

- Backgrounds shift to warm stone tones (`#fafaf9`, `#f4f4f0`).
- Forge Orange darkens to `#c2410c` to maintain contrast on light backgrounds.
- Text shifts to near-black (`#1c1917`); secondary text to warm gray (`#57534e`).

The logo uses its monochrome (dark-on-light) lockup in light mode — the diamond mark recolours to `#c2410c` with full stroke opacity.

Light mode is **not authorized** for marketing and landing surfaces — those remain dark-only.

**v2 is dark-only by design.** Dense-data surfaces rely on the GitHub-dark elevation ladder and accent glow, neither of which has a readable light counterpart. If a v2 doc needs a light rendering, fall back to v1 aesthetic for that doc.

### Extended Palette (Documentation)

Documentation surfaces and technical diagrams may use additional semantic colours beyond the core brand tokens. These are **utility colours**, not brand colours — scoped to documentation only.

#### Common utility colours (both v1 and v2)

| Token | Hex | Role |
|-------|-----|------|
| Mist | `#9ca3af` (v1) / `#8b93a1` (v2) | Intermediate text emphasis — subtitles, label rows (doc surfaces only); maps to `--text-muted` |
| Teal | `#06b6d4` | Status: built / active, architecture nodes |
| Green | `#10b981` | Status: success, built-in badges |
| Amber | `#f59e0b` | Status: phase 2 / warning |
| Red | `#f87171` (v1) / `#ef4444` (v2) | Status: phase 3 / error |
| Pink | `#ec4899` | LLM / audio components |
| Plum | `#a855f7` | Session / identity |
| Telegram Blue | `#26a5e4` | Platform: Telegram |
| Discord Purple | `#5865f2` | Platform: Discord |

Syntax highlighting colours (used in code blocks only) are exempt from this table — they follow standard editor themes.

Do not use utility colours in marketing, landing, or brand surfaces. In documentation, utility colours must not compete with Forge Orange for visual hierarchy.

#### v2-only tokens

These exist only in `lyra-v2.css` and have no v1 equivalent. Do not reference them from a v1 doc.

**Issue / task status** (plan artifacts — boards, roadmaps, dep-graphs):

| Token | Hex | Role |
|-------|-----|------|
| `--status-ready` | `#22c55e` | Ready to start |
| `--status-blocked` | `#f97316` | Blocked by an upstream dep |
| `--status-done` | `#475569` | Shipped / closed (dimmed) |

**Lane palette** (swimlane / DAG views with multiple parallel tracks):

| Token | Hex | | Token | Hex |
|-------|-----|---|-------|-----|
| `--lane-a1` | `#22c55e` | | `--lane-c3` | `#ec4899` |
| `--lane-a2` | `#6366f1` | | `--lane-d` | `#06b6d4` |
| `--lane-a3` | `#8b5cf6` | | `--lane-e` | `#eab308` |
| `--lane-b` | `#3b82f6` | | `--lane-f` | `#10b981` |
| `--lane-c1` | `#a855f7` | | `--lane-g` | `#f97316` |
| `--lane-c2` | `#d946ef` | | `--lane-h` | `#f59e0b` |
| | | | `--lane-i` | `#14b8a6` |

Lane tokens are for DAG / swim views (`lyra-v2-dependency-graph-v5.1.html`, `lyra-kernel-architecture-v5.html`). They are **not** part of the semantic status palette — they identify parallel tracks by colour, nothing more.

### Text Hierarchy (Documentation surfaces)

Documentation surfaces (split-file guides, charts, galleries, epics) use a three-tier text hierarchy keyed to the CSS custom properties in `aesthetics/lyra.css` (v1) and `aesthetics/lyra-v2.css` (v2). The tiers are **ordered by emphasis, not by aesthetic preference** — body copy must always land on Spark White, never on a dimmer tier.

| Tier | CSS token | Dark hex (v1 / v2) | Light hex (v1 only) | Role |
|------|-----------|----------|-----------|------|
| 1 — Body | `--text` | Spark White `#fafafa` | `#1c1917` | All running prose, card body, list items, table cells. **Default for any text the reader is meant to read.** |
| 2 — Emphasis | `--text-muted` | `#9ca3af` (v1) / `#8b93a1` (v2) | `#57534e` | Subtitles, section subtitles, label rows above a value, muted captions under a heading. Intermediate emphasis only — never used for body copy. |
| 3 — Metadata | `--text-dim` | Steel Gray `#6b7280` | `#78716c` | Timestamps, file paths, row indices, table captions, chip labels — peripheral metadata the reader scans but does not read in full. |

The light-hex column applies to **v1 aesthetic only**. v2 is dark-only (see Light Mode above).

**Rules:**
- Body text always uses Tier 1 (`--text`). Using Tier 2 for body copy fails readability on Obsidian and violates `deliver_must_match` rules in `~/.roxabi/forge/lyra/brand/forge.yml`.
- Tier 2 (`--text-muted`) is reserved for subtitle/label rows that sit *next to* Tier 1 body copy. If a block has no Tier 1 text nearby, Tier 2 is the wrong choice — lift it to Tier 1.
- Tier 3 (`--text-dim`) is scan-only. Never apply it to a sentence the reader needs to read.
- Marketing and landing surfaces do not use Tiers 2 or 3 — the marketing voice is declarative and runs entirely on Tier 1.

This convention is enforced at the Deliver phase of every forge skill (see `plugins/forge/skills/*/SKILL.md § Deliver`).

### Typography

| Role | Font | Weight | Usage | Variant |
|------|------|--------|-------|---------|
| Display / Hero title | Chakra Petch | 600 / 700 | Hero headlines, landing page titles — angular, technical, forge energy | **v1 only** |
| Display (v2) | Outfit | 700 | v2 doc titles — clean, neutral, sits well on dense data | **v2** |
| Headings / Wordmark | Outfit | 700 / 800 | Section titles, wordmark, nav — impact and maker energy | both |
| Body | Inter | 400 / 500 | All prose, descriptions, UI labels | both |
| Code / Tagline / Technical | JetBrains Mono | 400 / 500 / 600 | CLI commands, config values, file paths, the submark "FORGE" label | both |

**Rules:**
- Chakra Petch is the **v1 display font** for hero-level headlines only. Its angular, industrial character reinforces the forge metaphor at large sizes. Use it for one dominant headline per composition. Do not use it for body copy or section titles. **Do not load it on v2 pages** — v2 drops Chakra Petch entirely to reduce webfont payload and visual noise on dense-data surfaces.
- Outfit 700 is the **v2 display font** — the same family used for v1 section titles, just promoted to the top slot. Letter-spacing tightens to `-0.02em` at display sizes.
- Outfit 700/800 at section-title and wordmark sizes — shared by v1 and v2.
- Inter is the workhorse. All flowing prose, all captions, all UI text.
- JetBrains Mono for technical context only. Never use it for general emphasis or decoration.

### Logo Description

A **diamond / crystal form** resting on an **anvil base** with **spark particles** orbiting.

- The diamond (four-point polygon, top centre) represents compressed intelligence — raw input shaped into refined output. An internal horizontal facet divides it; a glowing white core sits at the centroid.
- The anvil base (angular flat-topped trapezoid with a rectangular foot) grounds the mark. It references the forge: the surface on which things are made.
- Spark particles (small circles, Forge Orange and Spark White, scattered at varying opacities) surround the mark. They reference the moment of forge ignition — data arriving as inputs.
- The wordmark "LYRA" in Outfit 800 / Spark White runs below the mark, letter-spaced generously.
- The submark "FORGE" in JetBrains Mono / Steel Gray runs below the wordmark at small size.

**Logo mark rules:**
- The diamond + anvil silhouette must remain intact in all reduced versions.
- Spark particles may be removed at very small sizes (below 48px).
- The FORGE submark may be removed when the wordmark alone is sufficient.
- Do not change the Forge Orange accent to any other colour.
- On light surfaces, use the monochrome dark-on-light lockup (diamond recoloured to `#c2410c`). See "Light Mode" above.

### Animation Principles

All animation should reinforce the forge metaphor and the "compressed intelligence" concept.

- **Sparks converging**: particles arriving from multiple directions and converging on the diamond core — represents data inputs being processed.
- **Crystallization**: the diamond form materializing from scattered points, facets locking into place — represents the hub coming online.
- **Ember glow pulse**: the Forge Orange core radiating in slow cycles — represents the agent's persistent readiness.
- **Forge motion**: the anvil base solidifying before the diamond descends onto it — sequenced intro animation.

Idle animations should be subtle (low opacity, slow timing). The system is always running; the animation should reinforce readiness, not demand attention.

---

## 7. The Forge Metaphor

The central brand metaphor — and the reason direction H was chosen over the alternatives.

### Elements and their meaning

| Visual element | Metaphor layer | What it represents |
|---------------|----------------|--------------------|
| Diamond / crystal | Compressed intelligence | Your raw inputs — conversations, context, decisions — shaped under pressure into something more valuable than the sum of its parts |
| Anvil base | Your hardware | The solid foundation where the work happens. Not a cloud. Not someone else's server. Yours. |
| Spark particles | Data / inputs | The raw material arriving: messages, queries, context from multiple channels |
| Forge Orange glow | Heat of processing | The active engine — inference running, memory writing, routing in progress |
| Forged output | Personal intelligence | What you walk away with: a system that knows your workflows, compounds over time, and can be extended without limit |

### Why it works for Lyra

The forge is a **maker's metaphor**. It is not a consumer product metaphor (polish, delight, ease). It is not a corporate metaphor (enterprise, scale, governance). It is: raw materials in, crafted output out. You do the shaping. You own the result.

This maps precisely to Lyra's value proposition:
- You bring your models, your channels, your data.
- The hub (forge) routes, pools, and processes them.
- You walk away with something you built — and that you can extend.

It is also why **Yuki is the primary persona**. The forge metaphor is transparent to the builder. It says: you are a craftsperson. This tool matches your ambition. Fork it on day one.

### The bidirectionality tension

The brand's core tension — and its core promise — is bidirectional extension:

- **You extend Lyra**: new adapters, new agents, new skills, new memory namespaces.
- **Lyra extends you**: it runs while you sleep, remembers what you've built, compounds your context over time.

The diamond crystallizing under pressure is the visual lock for this: you put inputs in (forge it), and what comes out is more capable than what went in.

---

## 8. Asset Index

All files in `lyra/brand/`:

| File | Type | Description |
|------|------|-------------|
| `BRAND-BOOK.md` | Reference | **This document.** Authoritative brand book v2 (2026-03-18 onwards). |
| `BRAND-IDENTITY.deprecated.md` | Reference (deprecated) | v1 identity doc — lyre/constellation metaphor and v1 teal/amber palette. **Deprecated 2026-03-24**, superseded by this brand book. Kept as historical reference only. |
| `lyra-positioning-exploration.html` | Artifact | Category definition, positioning angles (A/B/C), competitive matrix, differentiators, anti-positioning. |
| `lyra-customer-personas.html` | Artifact | Four personas (Alex, Sofia, Marcus, Yuki), voice guide per persona, JTBD statements. |
| `lyra-messaging-framework.html` | Artifact | Marketing voice guide, writing rules, vocabulary, narrative arc, messaging pillars, tagline exploration, copy examples. |
| `lyra-visual-directions.html` | Artifact | v1 visual direction explorations (directions A–E). Superseded by v2. |
| `lyra-visual-directions-v2.html` | Artifact | v2 visual direction explorations (F — Terminal, G — Cartography, H — Forge). **H chosen.** |
| `lyra-taglines-extend.html` | Artifact | 17 taglines across four groups, refined positioning statement, Intelligence vs Relationship analysis, language do/avoid examples. |
| `lyra-logo.html` | Artifact | v1 lyre/constellation logo — animated HTML. Historical reference. |
| `lyra-logo-v2.html` | Artifact | v2 logo explorations. |
| `lyra-logo.gif` | Asset | Animated logo export from v1. |
| `lyra-logo-brief.json` | Brief | Structured design brief for logo generation. |

### Related files outside brand/

| File | Description |
|------|-------------|
| `docs/vision.md` | Product vision and design principles — authoritative for what Lyra is and is not |
| `~/.roxabi-vault/personas/lyra_default.persona.toml` | Agent persona — governs Lyra's voice when speaking as an agent (independent of marketing voice) |

### CSS token source-of-truth

Both aesthetic variants live in the forge plugin's aesthetics folder. The forge skills inline these into every generated artifact (see `~/projects/roxabi-forge/CLAUDE.md § Distribution rule`).

| File | Variant | Scope |
|------|---------|-------|
| `~/projects/roxabi-forge/plugins/forge/references/aesthetics/lyra.css` | v1 · Obsidian | Marketing, brand, hero, avatar photography, v1 docs |
| `~/projects/roxabi-forge/plugins/forge/references/aesthetics/lyra-v2.css` | v2 · GitHub-dark | Dep-graphs, architecture diagrams, plans, dense-data docs |

**Reference implementations** (use as copy-paste starting points):
- v1 marketing surface: `lyra-landing.html`, `lyra-messaging-framework.html`
- v1 architecture (pre-v2 rollout): `lyra-kernel-architecture-v3.html`
- v2 data-dense: `lyra-v2-dependency-graph-v5.1.html`, `lyra-kernel-architecture-v5.html`

---

*Lyra by Roxabi — brand-book.md — 2026-04-20*
