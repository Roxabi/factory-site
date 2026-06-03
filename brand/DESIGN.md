---
name: Lyra — v1 Obsidian
version: "1.0"
variant: v1                                # NON-SPEC — see issue #13/#17
sibling-variant: ./DESIGN.v2.md            # NON-SPEC — v2 is not a theme swap
surface-scope: [marketing, hero, avatar, brand-galleries, readme]
description: >
  Direction H — Forge. Maker energy: raw materials in, crafted output
  out. Near-absolute dark with Forge Orange as the single signal.
  Chakra Petch at hero scale + 42px grid mask + radial ember glow form
  the brand's photographic signature. Font-loading differs from v2:
  Chakra Petch is loaded on v1 only.
colors:
  bg: "#0a0a0f"
  surface: "#18181f"
  surface-alt: "#1f2937"
  border: "#2a2a35"
  accent: "#e85d04"
  accent-soft: "#f97316"
  accent-dim: "rgba(232,93,4,0.08)"
  accent-glow: "rgba(232,93,4,0.22)"
  text: "#fafafa"
  text-dim: "#6b7280"
  # Light mode (v1 docs only — never marketing)
  light-bg: "#fafaf9"
  light-surface: "#f4f4f0"
  light-accent: "#c2410c"
  light-text: "#1c1917"
  light-text-muted: "#57534e"
  light-text-dim: "#78716c"
  # Utility (doc surfaces only, must not compete with accent)
  util-teal: "#06b6d4"
  util-green: "#10b981"
  util-amber: "#f59e0b"
  util-red: "#f87171"
  util-pink: "#ec4899"
  util-plum: "#a855f7"
  util-telegram: "#26a5e4"
  util-discord: "#5865f2"
typography:
  display:
    fontFamily: Chakra Petch
    fontWeight: 700
    fontSize: 4rem
    letterSpacing: "-0.01em"
  h1:
    fontFamily: Outfit
    fontWeight: 800
    fontSize: 2.5rem
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Outfit
    fontWeight: 700
    fontSize: 1.75rem
  body-md:
    fontFamily: Inter
    fontWeight: 400
    fontSize: 1rem
    lineHeight: 1.6
  body-emphasis:
    fontFamily: Inter
    fontWeight: 500
    fontSize: 1rem
  label-caps:
    fontFamily: JetBrains Mono
    fontWeight: 500
    fontSize: 0.75rem
    textTransform: uppercase
  code:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
rounded:
  sm: 4px
  md: 8px
  lg: 12px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
---

## Overview

**Direction H — Forge (chosen).** Maker energy: raw materials in, crafted output out. Angular, bold, "I built this." The palette sits on near-absolute dark (`#0a0a0f`) with Forge Orange (`#e85d04`) as the single signal. Chakra Petch at hero scale + a 42px grid mask + radial ember glow from the top form the brand's photographic signature.

This file is the **v1 Obsidian** variant — used for marketing, hero, avatar photography, brand galleries, and README front matter. For dense-data surfaces (dep-graphs, architecture diagrams, plans, swimlane views), use the sibling file `DESIGN.v2.md` (GitHub-dark elevation ladder, no forge-floor chrome, drops Chakra Petch).

## Colors

- **bg (#0a0a0f):** Near-absolute dark — the forge floor. Never reverse.
- **surface (#18181f):** Cards, panels, elevation +1. Cards recess *into* the dark (v1 signature). v2 inverts this — cards pop up.
- **accent (#e85d04 Forge Orange):** Brand signal. One dominant element per composition. Never substitute.
- **accent-soft (#f97316 Ember):** Glow softening, secondary accent. Used with low alpha for background ember washes.
- **text (#fafafa Spark White):** Body, node centres, wordmark.
- **text-dim (#6b7280 Steel Gray):** Metadata, tertiary labels. Must never compete with Forge Orange.

## Typography

- **Chakra Petch 700** = v1 hero display only. Angular/industrial — reinforces forge metaphor at large sizes. Do not use for body. **Not loaded on v2.**
- **Outfit 700/800** = section titles, wordmark, nav. Shared with v2 (promoted to display on v2).
- **Inter 400/500** = all prose, captions, UI text. The workhorse.
- **JetBrains Mono 400/500/600** = technical context only — CLI, paths, config, the `FORGE` submark. Never decoration.

## Text Hierarchy (docs)

- Tier 1 — `text` (Spark White) for all readable prose.
- Tier 2 — `text-muted` (#9ca3af) for subtitles/label rows adjacent to Tier 1.
- Tier 3 — `text-dim` (Steel Gray) for scan-only metadata.
- Marketing runs entirely on Tier 1.

## Surface Selection (v1 vs v2)

| Surface | Variant | Why |
|---|---|---|
| Landing, hero, avatar, social, brand galleries | **v1** (this file) | Forge-floor chrome + Chakra Petch is the emotional signature |
| READMEs, public docs front matter | **v1** | Reader's first impression — warmth first |
| Dep-graphs, architecture, plans, swimlanes, dashboards | **v2** | Elevation ladder reads faster under dense data |

**Mixing variants in a single file is not allowed.** Variant shift across a link is itself a signal (marketing → architecture).

## Logo Mark

Diamond/crystal form (four-point polygon, top centre, glowing white core) on an angular anvil base, with Forge Orange + Spark White spark particles orbiting. Wordmark "LYRA" in Outfit 800 below; submark "FORGE" in JetBrains Mono / Steel Gray at small size.

- Diamond + anvil silhouette must remain intact at all sizes.
- Sparks may be dropped below 48px.
- On light (v1 docs), recolour the diamond to `#c2410c` (monochrome dark-on-light lockup).
- Never substitute Forge Orange with another hue.

## References

- Full brand book: `BRAND-BOOK.md` §6
- v1 CSS source of truth: `~/projects/roxabi-forge/plugins/forge/references/aesthetics/lyra.css`
- v2 CSS source of truth: `~/projects/roxabi-forge/plugins/forge/references/aesthetics/lyra-v2.css`
- v2 design file: `DESIGN.v2.md` (same brand hues, GitHub-dark surface ladder)
