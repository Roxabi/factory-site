# Avatar Creation Runbook

Step-by-step guide to create a new face-locked avatar with Klein 4B natural texture.

> Lessons, failures, and deep explanations: [AVATAR-LESSONS.md](AVATAR-LESSONS.md)
> Strategy comparison (LoRA vs PuLID): [AVATAR-PIPELINES.md](AVATAR-PIPELINES.md)
> Experiment history: [AVATAR-LOG.md](AVATAR-LOG.md)

---

## TL;DR

```
1. Pick a hero image you love
2. Extract identity description → vNNN_base.md
3. Generate 2000+ images (Klein 4B, no LoRA, no PuLID)
4. Score all images (Buffalo + CLIP) → find the consistent cluster
5. Cherry-pick 25–30 diverse images from the cluster
6. Write captions → train LoRA
7. Validate
```

---

## What `lyraface` encodes (the contract)

`lyraface` is the trigger word. It should carry ALL of these — nothing else:

| Encoded in `lyraface` | NOT encoded — specify at inference |
|---|---|
| Face geometry | Pose / angle |
| Hair (color, texture, length) | Expression |
| Skin tone + complexion | Shot type (headshot, half-body…) |
| Eye color | Lighting |
| Face shape | Background |
| Build | Outfit / clothing |

**Rule:** if it's in the table left column → never put it in training captions.
If it's in the right column → always specify it at inference.

---

## Step 1 — Pick a hero image

Generate images with varied seeds/strengths until you find one face you'd be happy
generating 2000 variations of. This is the identity anchor for everything that follows.

Write a rough description of the face you want as a `.md` prompt file:

```markdown
---
engine: pulid-flux2-klein
width: 1024
height: 1024
steps: 20
face_image: /path/to/any/reference/face.png
pulid_strength: 0.6
seed: 42
---

Portrait photograph. Young woman, mid-twenties. Studio lighting. Clean background.
```

```bash
# Vary seed (0–200) and pulid_strength (0.4–0.8) until you find it
imagecli generate prompt.md -e pulid-flux2-klein --seed 42
imagecli generate prompt.md -e pulid-flux2-klein --seed 73
```

Gate: **one image you love**. Don't proceed until you have it.

---

## Step 2 — Extract identity description

Show the hero image to Claude Code (or any vision agent) with this exact prompt:

```
Describe this person's physical appearance for use as an image generation prompt.
Be precise and literal — no vague adjectives, no interpretations.

Extract only:
- Approximate age range
- Ethnicity / skin tone
- Hair: color, texture, length, style
- Eye color
- Face shape (only if clearly dominant)
- Build / visible body features

Do NOT include: moles, freckles, bone structure, lip/nose/eyebrow shape,
expressions, clothing, lighting, background.

Output as short declarative sentences — one feature per sentence, no filler.
```

Format the output as:
```
lyraface. [age], [ethnicity]. [skin]. [hair]. [eyes]. [face shape]. [build].
```

Save to `brand/prompts/vNNN_base.md`.

**This block is for smoke-testing only. It never goes into training captions.**

---

## Step 3 — Smoke-test (optional but recommended)

Generate 10–20 images with the base description, varied seeds. Pick the seed that
produces the most consistent face with the most natural texture.

```bash
# Test a few seeds before committing to 2000 images
imagecli generate brand/prompts/vNNN_base.md --seed 100
imagecli generate brand/prompts/vNNN_base.md --seed 200
```

Lock: `seed = X` for the full run.

---

## Step 4 — Generate 2000+ images

Engine: `flux2-klein` (no PuLID, no LoRA). Klein 4B native texture is the priority.

**No LoRA exists yet** — identity comes from the description in every prompt + locked seed.
The identity block from `vNNN_base.md` is included in every generation prompt.
The scene varies across 6 axes per image:

> **Generation prompts vs training captions — critical distinction:**
> - Generation prompts (Step 4): include identity block — Klein 4B needs it to find the face
> - Training captions (Step 7): NO identity block — the trained LoRA carries it via `lyraface`

| Axis | Values |
|---|---|
| Shot | headshot / detail / half-body / full-body |
| Angle | frontal / 3Q-left / 3Q-right / profile-left / profile-right |
| Expression | calm / soft-smirk / warm-smile / serious / focused / thoughtful / laughing |
| Lighting | studio / golden-hour / window / rim / dramatic |
| Background | dark / gradient / environmental / white |
| Outfit | keep minimal variation |

Each generated `.md` prompt file looks like:
```markdown
---
engine: flux2-klein
width: 512
height: 512
steps: 8
seed: X          # locked from Step 3
---

lyraface. Mid-twenties, Caucasian. Fair skin. Past-shoulders tousled wavy dark blonde hair.
Hazel eyes. Oval face. Slim build.
Headshot. Three-quarter right. Soft smirk. Warm rim light. Urban concrete wall.
```
Identity block first, scene after. No PuLID, no trigger word yet — just description + seed.

```bash
# Generate prompt .md files (adapt generate_v22_phase2.py for new run)
python generate_prompts.py --count 2000 --seed X --base brand/prompts/vNNN_base.md --out prompts/vNNN/

# Generate images
imagecli batch prompts/vNNN/ --output-dir concepts/avatar-vNNN/
```

**Prompt→image mapping:** filename encodes the key traits
(`P0012-headshot-frontal-calm.png`). Full prompt text lives in the `.md` file with the
same stem. A `manifest.json` is written alongside each image dir — enriched format
(`[{name, label, tags}]`) consumed directly by the forge gallery (no hardcoded CATALOGUE).

Output: `concepts/avatar-vNNN/` — 2000+ PNGs at 512×512.

---

## Step 5 — Score + find the cluster

**Why dual scoring:** Buffalo alone clusters by pose, not identity. A profile and a
frontal of the same person score 0.20–0.30 with face-only. Adding CLIP bridges the gap.

```bash
# Score all images — internal pairwise (no reference needed yet)
python score_dual.py --dir concepts/avatar-vNNN/ --out scores-vNNN.json
```

This computes `0.5 × buffalo_norm + 0.5 × clip_norm` for every pair of images.

**Island vs clique — what they mean:**

| Term | Definition | Size |
|---|---|---|
| Island (connected component) | Every image reachable from every other via edges ≥ threshold | Larger |
| Clique | Every pair has similarity ≥ threshold — the dense core | Smaller |

The island is the neighbourhood. The clique is the inner circle.
Training candidates come from the clique, not the full island.

```bash
python detect_islands.py \
  --scores scores-vNNN.json \
  --threshold-clique 0.55 \
  --threshold-tight 0.65 \
  --out metadata-vNNN.json
```

| Tier | Threshold | Use |
|---|---|---|
| tight | ≥ 0.65 | LoRA training — highest quality |
| clique | ≥ 0.55 | Supplementary / fallback |
| island | ≥ 0.55 connected | Gallery / context only |

**Target:** tight clique ≥ 20 images. Below 20 → generate 2000 more images and re-score.

---

## Step 6 — Select 25–30 training images

From the tight clique, pick 25–30 images that are **diverse** — not the 30 highest-scoring
near-identical frontals.

```bash
python select_training.py \
  --metadata metadata-vNNN.json \
  --tier tight \
  --count 30 \
  --out training/lyra_vNNN/
```

**Visual inspection — reject any image where:**

| Reject | Reason |
|---|---|
| Face < 80px | buffalo_l unreliable |
| > 50% same angle | LoRA won't generalize |
| Near-duplicate (< 5% pixel diff from another) | Wastes capacity |
| Face occluded > 30% (hair, hand, shadow) | Wrong training signal |
| Extreme over/under-exposure | Wrong texture signal |

**Target distribution for the 30 images:**

| Axis | Minimum coverage |
|---|---|
| Angle | ≥ 1 frontal · ≥ 2 three-quarter · ≥ 1 profile |
| Shot | ≥ 5 headshots · ≥ 5 half-body · ≥ 2 detail |
| Expression | ≥ 4 distinct |
| Lighting | ≥ 3 distinct setups |

---

## Step 7 — Write training captions

One `.txt` file per image, same stem. **Identity goes in the trigger, NOT in the caption.**

```
# WRONG — V22 mistake: re-stating identity in captions weakens trigger binding
lyraface person. Fair skin, hazel eyes, dark blonde hair. Wearing a turtleneck...

# RIGHT — trigger carries identity, caption is pure scene
lyraface. [shot]. [angle]. [expression]. [lighting]. [background].
```

Examples:
```
lyraface. Headshot. Full frontal, eyes to camera. Calm expression. Studio key light. Dark background.
lyraface. Half-body. Three-quarter right. Soft smirk. Warm rim light. Urban concrete wall.
lyraface. Detail shot, eyes and nose. Slight tilt. Thoughtful gaze. Golden hour. Outdoors, blurred foliage.
```

Vary caption length across the set — short, medium, long all present — so the trigger
generalizes to any inference style.

```bash
# Auto-generate captions from metadata
python write_captions.py --dir training/lyra_vNNN/ --metadata metadata-vNNN.json
```

---

## Step 8 — Train LoRA

**Tool:** [ai-toolkit](https://github.com/ostris/ai-toolkit) at `~/projects/archived/ai-toolkit/`.

Create a training config yaml, then run:
```bash
cd ~/projects/archived/ai-toolkit
python run.py config/train_lyra_vNNN.yaml
```

Config:
```yaml
model_name: black-forest-labs/FLUX.2-klein-base-4B   # undistilled — mandatory
train_data_dir: training/lyra_vNNN/
output_dir: output/lyra_vNNN/
rank: 16                        # try 32 if identity too soft after validation
alpha: 16
lr: 1e-4
steps: 2000                     # monitor checkpoints every 250 steps
resolution: [512, 768, 1024]
batch_size: 1
gradient_checkpointing: true
cache_latents: true
caption_dropout_rate: 0.05      # forces trigger to bind identity alone
```

```

**Hard rules:**
- Undistilled base only (`FLUX.2-klein-base-4B`) — never the distilled variant
- Training images must be Klein 4B native — no PuLID outputs (airbrushed texture)
- Scale = 1.0 at inference always — boosting above 1.0 degrades identity monotonically
- 25–30 curated > 143 diverse at rank 16
- Before launching: `grep folder_path config/train_lyra_vNNN.yaml` — verify path is correct

---

## Step 9 — Validate

Generate 20 images with trigger-only prompts:
```
lyraface. Headshot, frontal, calm, studio.
lyraface. Half-body, three-quarter right, soft smirk, warm rim light, dark background.
```

Score against training centroid (mean of all 30 training embeddings, L2-normalized):
```bash
python score_vs_centroid.py \
  --generated output/lyra_vNNN/validation/ \
  --training training/lyra_vNNN/ \
  --out validation-vNNN.json
```

**Pass criteria:**
- Buffalo mean vs centroid ≥ 0.55
- No airbrushing — pores, asymmetry, natural skin visible
- Trigger-only works — identity stable without re-injecting hair/eyes/skin

**If identity is weak:** caption strategy problem — retrain with stricter trigger-only captions.
**If texture is airbrushed:** training data quality problem — check for PuLID-sourced images.
**Never fix weak identity by bumping lora_scale above 1.0.**

---

## Step 10 — Use the LoRA

Create a `.md` prompt file:

```markdown
---
engine: flux2-klein-fp4        # or flux2-klein for compatibility
lora_path: /path/to/output/lyra_vNNN/lyra_vNNN.safetensors
lora_scale: 1.0
trigger: lyraface
width: 1024
height: 1024
steps: 8
seed: 42
---

lyraface. Headshot. Three-quarter right. Serious expression. Neon accent lighting. Dark background.
```

```bash
imagecli generate prompt.md
# or batch:
imagecli batch prompts/my_shoot/ --output-dir images_out/my_shoot/
```

Identity is locked via `lyraface`. No face reference, no PuLID needed.
Describe only scene/pose/expression/lighting in the prompt — the LoRA handles the rest.

---

## Status (2026-04-07)

| Step | Status | Notes |
|---|---|---|
| 1 — Hero image | In progress | V24 Test 1 (#556) |
| 2 — Description extraction | Blocked | Blocked on Step 1 |
| 3 — Smoke-test | Partial | Seeds tested in V24 gallery |
| 4 — Generate 2000+ | Not started | Needs generic generate_prompts.py |
| 5 — Score + cluster | Not started | Scripts exist from V22, need genericising |
| 6 — Select 30 | Not started | — |
| 7 — Write captions | Not started | Needs write_captions.py |
| 8 — Train LoRA | Not started | — |
| 9 — Validate | Not started | — |

## Missing scripts (need to be written/genericised from V22)

| Script | What it does |
|---|---|
| `generate_prompts.py` | Generic prompt generator from base description + axes |
| `score_dual.py` | Buffalo + CLIP internal pairwise — generic, no hardcoded paths |
| `detect_islands.py` | Island + clique detection from scores JSON |
| `select_training.py` | Pick N diverse images from tight clique |
| `write_captions.py` | Write `.txt` captions from metadata (trigger-only format) |
| `score_vs_centroid.py` | Validate generated images against training centroid |
