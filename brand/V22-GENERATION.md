# V22 Avatar Generation

Two-phase approach: seed selection first, then volume. Winning seed selected by face consistency scoring, LoRA candidates selected by dual face+CLIP island analysis.

## Identity Block

> Young woman, mid-twenties, Caucasian. Fair skin, clear complexion, no freckles, no beauty marks. Past-shoulders tousled wavy dark blonde hair. Hazel eyes. Oval face. Slim build, visible collarbones. No makeup, natural skin.

## Phase 1 — Seed Selection (500 images, ~35 min)

Pick the right face before generating at scale.

1. Pick 10 random seeds
2. Generate 50 images per seed (same 50 prompts × 10 seeds = 500 images)
3. Score pairwise within each seed group
4. Deploy as a pivot gallery — columns = seeds, rows = prompts → same prompt across 10 different faces
5. Pick favorite face. Data tells which seed has tightest internal consistency.

**Seeds:** 1701, 2847, 4193, 5520, 6738, 7062, 8391, 9154, 3276, 6005

**Prompt axes (6):** shot (4) × angle (5) × expression (7) × lighting (6) × outfit (5) × background (5)

### Run Phase 1

```bash
# 1. Generate prompt files (500 .md files, flat directory)
cd ~/.roxabi/forge/lyra/brand
python3 generate_v22_phase1.py

# 2. Batch generate (all-on-GPU, ~12 GB VRAM, ~35 min)
cd ~/projects/imageCLI
uv run imagecli batch ~/.roxabi/forge/lyra/brand/prompts/avatar-lyra-v22-phase1 \
  --output-dir ~/.roxabi/forge/lyra/brand/concepts/avatar-lyra-v22-phase1
```

**Files:**
- Prompts: `~/.roxabi/forge/lyra/brand/prompts/avatar-lyra-v22-phase1/`
- Output:  `~/.roxabi/forge/lyra/brand/concepts/avatar-lyra-v22-phase1/`
- Naming:  `S{seed}-P{prompt_id}-{shot}-{angle}-{expr}.png`
- Gallery: `~/.roxabi/forge/lyra/brand/v22-seed-selection.html`

**imagecli batch modes:** Default is all-on-GPU (~12 GB VRAM, encoder + transformer + VAE all loaded at once). Use `--two-phase` to force lower VRAM (~8 GB peak) if running alongside other GPU processes.

### After Phase 1

- Build pivot gallery (forge-gallery skill, columns = seeds, rows = prompts)
- Scoring: `score_v22_seeds.py` (internal pairwise per seed) + `score_v22_cross_seed.py` (same prompt across seeds)
- Pick winning seed based on face consistency + preference

### Phase 1 Results

**Winning seed: 8391** — ranked #1 in internal consistency (0.2813), #1 in cross-seed agreement (0.3832). Seeds 6738 and 7062 were close runners-up.

Note: pairwise scores are low (0.21–0.28) because diverse prompts (profiles, full-body, varied expressions) tank face similarity. This is expected — the scores are relative, not absolute.

## Phase 2 — Full Run (2000 images, ~37 min at 8 steps)

6. Take the winning seed (8391)
7. Generate 2000 images with 2000 different prompts (sampled from 21,000 full product)
8. Score with dual face + CLIP pipeline
9. Find cross-pose islands
10. Cherry-pick 50 candidates (top 30 marked) for LoRA training

### Run Phase 2

```bash
# 1. Generate 2000 prompt files
cd ~/.roxabi/forge/lyra/brand
python3 generate_v22_phase2.py

# 2. Batch generate at 8 steps (--steps overrides frontmatter)
cd ~/projects/imageCLI
uv run imagecli batch ~/.roxabi/forge/lyra/brand/prompts/avatar-lyra-v22-phase2 \
  --output-dir ~/.roxabi/forge/lyra/brand/concepts/avatar-lyra-v22-phase2 \
  --steps 8 --no-compile

# 3. Dual scoring (InsightFace buffalo_l + CLIP ViT-L/14)
uv run --group pulid python3 ~/.roxabi/forge/lyra/brand/score_v22_dual.py

# 4. Select LoRA candidates (island-first, diversity-enforced)
python3 ~/.roxabi/forge/lyra/brand/select_v22_lora.py
```

**Files:**
- Prompts: `~/.roxabi/forge/lyra/brand/prompts/avatar-lyra-v22-phase2/`
- Output:  `~/.roxabi/forge/lyra/brand/concepts/avatar-lyra-v22-phase2/`
- Naming:  `P{prompt_id}-{shot}-{angle}-{expr}.png`
- Scores:  `concepts/avatar-lyra-v22-phase2/face-scores.json`
- Selection: `concepts/avatar-lyra-v22-phase2/lora-selection.json`
- Gallery: `~/.roxabi/forge/lyra/brand/v22-gallery.html`

## Scoring Pipeline — Dual Face + CLIP

Previous versions (V16–V21) used InsightFace AntelopeV2 only. Cross-pose matching was poor — profiles scored 0.20–0.30 against frontals, so islands clustered by pose, not identity.

### V22 approach: `score_v22_dual.py`

1. **InsightFace buffalo_l** (640×640 detection) — geometric face features, pose-sensitive
2. **CLIP ViT-L/14** — semantic "same person" concept, pose-agnostic
3. **Combined score:** `0.5 × face_norm + 0.5 × clip_norm` (each normalized to [0,1])
4. **Combined pairwise matrix:** `0.5 × face_pw_norm + 0.5 × clip_pw_norm`
5. **Islands:** greedy clique-finding on combined pairwise, threshold >0.55, min 10 members

### Why buffalo_l over AntelopeV2

Same API (InsightFace), drop-in replacement. Normalized comparison on 50 diverse images:

| Angle | AntelopeV2 | buffalo_l | Delta |
|-------|-----------|-----------|-------|
| profile-left | 0.115 | 0.198 | +0.083 |
| profile-right | 0.206 | 0.284 | +0.078 |
| full-body | 0.128 | 0.203 | +0.075 |

buffalo_l uses `det_10g` detector (better than `scrfd_10g_bnkps`) and 640×640 detection window (finds faces in full-body shots).

### Why CLIP helps

CLIP narrowed the frontal↔profile gap from 0.20 (face-only) to 0.16 (combined). Islands grew from ~30 members (pose-clustered) to ~143 members (cross-pose). Profile and frontal images now coexist in the same island.

| Angle | Face only | CLIP only | Combined |
|-------|-----------|-----------|----------|
| frontal | 0.474 | 0.514 | 0.494 |
| profile-left | 0.274 | 0.394 | 0.334 |
| profile-right | 0.336 | 0.411 | 0.373 |

### Island structure (V22 results)

- 77 tight islands (>0.55 combined pairwise, min 10 members)
- Island #0: 143 members, internal mean 0.656 — primary pick source
- All poses represented within a single island

## LoRA Selection — `select_v22_lora.py`

Selects 50 candidates (top 30 marked) from island members. **No reference scoring** — purely internal pairwise consistency.

### Strategy

1. Rank islands by quality: `internal_mean × log2(size)`
2. Round 1: one image per (shot, angle) bucket, preferring best island
3. Round 2: cover all 7 expressions
4. Round 3: fill to 50, weighted by diversity need + island quality
5. Sort by island quality, mark top 30

### V22 Selection Results

**Top 30:** all from Island #0
- Angles: frontal 7, 3q-right 7, profile-right 6, 3q-left 5, profile-left 5
- Expressions: calm 7, serious 7, soft-smirk 6, thoughtful 5, warm-smile 4, focused 1
- Shots: headshot 12, half-body 9, detail 9

Full-body fills in at positions 31–50 from Islands #1, #4, #6, #8, #12, #22.

## Notes

- Engine: `flux2-klein` (Klein 4B FP8), 512×512
- Phase 1: 28 steps, ~4s/image, ~35 min for 500
- Phase 2: 8 steps (via `--steps 8`), ~1.1s/image, ~37 min for 2000
- VRAM: ~12 GB peak (all-on-GPU batch), ~8 GB with `--two-phase`
- Scoring deps: `uv run --group pulid` (insightface, onnxruntime-gpu) + transformers (CLIP)

## LoRA Inference — Lessons Learned

### Prompt length vs LoRA strength (rank 16)

Short prompts work, long prompts don't. The LoRA's rank 16 can't overpower detailed face descriptions in the prompt.

- **Works:** `"lyraface person smiling, studio lighting, dark background"` → Lyra
- **Fails:** `"lyraface person. Young woman, mid-twenties, dark blonde hair, hazel eyes, wearing black tank top..."` → generic face

**Fix options:** increase rank to 32/64, boost `adapter_weights` at inference, or keep prompts short.

### Quantization order matters

LoRA must be loaded BEFORE FP8 quantization. Loading after quantization silently fails (adapter applies but has no effect on quantized weights).

```python
# CORRECT: LoRA → quantize → GPU
pipe.load_lora_weights(ckpt)
quantize(pipe.transformer, weights=qfloat8)
pipe.transformer.to("cuda")

# WRONG: quantize → LoRA (silently broken)
quantize(pipe.transformer, weights=qfloat8)
pipe.load_lora_weights(ckpt)  # no effect
```

### Dataset size vs identity lock

At rank 16: 30 curated images (top30) locked identity. 143 diverse images (island0) averaged it out. More images need higher rank.
