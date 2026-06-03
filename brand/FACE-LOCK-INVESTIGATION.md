# Face Identity Lock — Investigation Report

_Full investigation log for face-locked avatar generation on RTX 5070 Ti (16 GB VRAM)._

---

## Goal

Generate 25-30 diverse, photorealistic portraits of the same person (Lyra) at 1024×1024 for LoRA training. The reference face is `006-just-solved-1024.png` (Klein 4B, 28 steps, no face lock).

---

## Hardware Constraints

| | Spec |
|--|------|
| GPU | RTX 5070 Ti — 16.6 GB total, ~15.45 GB usable |
| System RAM | 30 GB |
| Compute | sm_120 (Blackwell), native FP8 |

---

## Methods Tested

### 1. Klein 9B + PuLID Klein v2 (V9–V15)

**Pipeline:** `generate_training_9b.py` — two-phase (Qwen3 encode → Klein 9B FP8 + PuLID generate)

| Version | Config | Face sim to 006 (mean) | Internal consistency | Banding | Notes |
|---------|--------|----------------------|---------------------|---------|-------|
| V9 | INT8, 400px, 4 steps | 0.289 | 0.255 | Heavy | INT8 quantization artifacts |
| V10 | FP8, 400px, 4 steps | 0.286 | — | Moderate | FP8 better but still banding |
| V11 | FP8, 400px, 8 steps | 0.325 | 0.344 | Moderate | More steps helped slightly |
| V12 | BF16 (no quant), 400px, 8 steps | 0.316 | 0.337 | Moderate | Proved banding isn't quantization |
| V13 | FP8, 512px, 4 steps | 0.382 | 0.460 | Moderate | 512 + native steps better |
| V14 | FP8, 512px, 4 steps + dithering | 0.382 | 0.464 | Moderate | Dithering didn't help |
| V15 | FP8, 512px, 4 steps, natural prompts | 0.374 | 0.400 | Low (bright bg) | Best Klein 9B batch |

**Verdict:** PuLID Klein v2 weights create a consistent face across images (~0.46 internal similarity) but it's NOT the 006 reference face (~0.30 match). The Klein 9B PuLID is barely better than prompt-only matching (V1/V2 without PuLID scored ~0.35).

**Root causes:**
- PuLID Klein v2 weights are community-made (iFayens), not official PuLID team
- Simplified IDFormer (4 layers, 4 tokens) vs official PuLID (10 layers, 32 tokens)
- Klein 9B is step-distilled to 4 steps — not enough denoising to refine identity
- Aggressive per-block scale factors (1.8–8.0×) not present in official PuLID

### 2. Klein 4B + PuLID Klein v2 with Dim Projection (V16-Klein)

**Pipeline:** `imagecli generate -e pulid-flux2-klein`

Fixed 5 bugs in the engine:
1. CA key remap (`pulid_ca_double` → `double_ca`)
2. Auto-detect CA counts (5 double + 7 single, not hardcoded 12/60)
3. Orthogonal dim projection (3072→4096→3072) for Klein 4B
4. Single block return value (single tensor, not tuple)
5. Double block stream targeting (image stream, not text)

| Metric | Value |
|--------|-------|
| Face sim to 006 (mean) | 0.338 |
| Face sim to 006 (max) | 0.533 |
| >0.5 threshold | 3/100 (3%) |
| Peak VRAM | 9.18 GB |
| Time per image | ~20s |
| Banding | None (28 steps, not step-distilled) |

**Verdict:** Natural-looking images (best visual quality of all PuLID pipelines), but dim projection loses too much identity. The trained CA patterns at 4096 don't survive the random projection to/from 3072. Only 3% above face match threshold.

### 3. FLUX.1-dev + PuLID v0.9.1 (V16)

**Pipeline:** `imagecli generate -e pulid-flux1-dev`

New engine built for this investigation. PuLID v0.9.1 from the official PuLID team (guozinan). Native dim=3072 match with FLUX.1-dev — no projection needed. GGUF Q5_K_S transformer (~6 GB).

| Metric | Grid (32 images) | V16 (300 images) |
|--------|-----------------|-------------------|
| Face sim to 006 (mean) | 0.547 | **0.597** |
| Face sim to 006 (max) | 0.638 | **0.675** |
| >0.5 threshold | 25/32 (78%) | **292/295 (98%)** |
| Peak VRAM | 10.19 GB | 10.19 GB |
| Time per image | ~42s | ~42s |
| Banding | None | None |
| Internal consistency | High | High |

**Verdict:** The only pipeline that actually locks to the reference face. 98% of images above the "same person" threshold. No banding. 24 steps on FLUX.1-dev (not step-distilled) gives PuLID enough denoising passes.

**Known issue:** Slightly smoother skin than Klein 4B. PuLID's cross-attention injection averages out micro-texture. Mitigated by using raw editorial prompts ("imperfect skin, visible pores, unretouched").

### 4. InfiniteYou (ByteDance) — ICCV 2025

**Status:** Does not fit on 16 GB VRAM.

| Component | VRAM |
|-----------|------|
| Transformer (FLUX.1-dev int8) | ~6 GB |
| ControlNet (InfuseNet int8) | ~3 GB |
| image_proj_model | ~0.1 GB |
| CUDA context/overhead | ~2.3 GB |
| **Base total (before inference)** | **~12.5 GB** |
| Remaining for activations | ~3 GB |

OOM at 1024×1024, 768×768, and 512×512. The model weights alone consume 12.5 GB. InfiniteYou's `--cpu_offload` doesn't offload text encoders before transformer load (patched but still OOM). Would need ~20+ GB VRAM or GGUF quantization (which InfiniteYou doesn't support).

**Benchmark (from paper, not our testing):**

| Method | ID Loss (lower=better) | User preference |
|--------|----------------------|-----------------|
| FLUX.1-dev IP-Adapter | 0.772 | — |
| PuLID-FLUX v0.9.1 | 0.225 | 27.2% |
| InfiniteYou | **0.209** | **72.8%** |

---

## Banding Investigation (V9–V14)

Extensive testing ruled out quantization, resolution, and step count as primary banding causes for Klein 9B + PuLID:

| Approach | Result |
|----------|--------|
| BF16 (no quantization) | Same banding |
| 512×512 (divisible by 64) | Slightly better |
| 4 steps (native) | Correct but insufficient |
| Reflect padding on VAE decoder | No improvement |
| Latent-space dithering | Negligible |
| Post-decode dithering | Too subtle |
| Floyd-Steinberg error diffusion | No improvement |

**Actual root causes:**
1. **FLUX VAE grid artifact** — known unfixed issue (GitHub #45, #50, #406)
2. **8-bit posterization** — obsidian backgrounds (#0a0a0f) have only 5-6 brightness levels
3. **PuLID perturbation** — confirmed as sole banding source at 1024 (card 4 in comparison gallery is clean without PuLID)

**Fix:** Brighter backgrounds eliminate posterization. Klein 4B at 28 steps (not step-distilled) smooths PuLID perturbations. FLUX.1-dev at 24 steps does the same.

---

## Pipeline Comparison

All at 1024×1024, same prompt, seed 42, face reference 006:

| Pipeline | Engine | Steps | PuLID | Face sim | Banding | Natural | VRAM |
|----------|--------|-------|-------|----------|---------|---------|------|
| Klein 4B BF16 | `flux2-klein` | 28 | No | 0.500 | Clean | Excellent | 8.45 GB |
| Klein 4B FP8 | `flux2-klein` | 28 | No | 0.460 | Clean | Excellent | 7.84 GB |
| Klein 9B FP8 | `generate_training_9b.py` | 4 | No | 0.475 | Clean | Good | 10 GB |
| Klein 9B FP8 | `generate_training_9b.py` | 4 | 1.5 | 0.478 | **Visible** | Poor | 10 GB |
| Klein 9B FP8 | `generate_training_9b.py` | 4 | 0.8/0.5× | 0.457 | None | Fair | 10 GB |
| Klein 4B | `pulid-flux2-klein` | 28 | 0.8 (dim proj) | 0.569 | None | Good | 9.18 GB |
| **FLUX.1-dev GGUF** | **`pulid-flux1-dev`** | **24** | **0.8** | **0.645** | **None** | **Good** | **10.19 GB** |
| InfiniteYou | N/A | 30 | N/A | N/A | N/A | N/A | OOM |

**Comparison gallery:** `brand/1024-comparison.html`
**PuLID grid (FLUX.1-dev):** `brand/pulid-grid.html`
**PuLID grid (Klein 4B):** `brand/klein-pulid-grid.html`

---

## Recommended Pipeline

**For face-locked images (LoRA training, profile pictures):**
```bash
cd ~/projects/imageCLI
uv run imagecli generate prompt.md -e pulid-flux1-dev --no-compile
```
- FLUX.1-dev GGUF Q5_K_S + PuLID v0.9.1
- 24 steps, 1024×1024, guidance 3.5, pulid_strength 0.8
- Peak VRAM: 10.19 GB
- Face similarity: 0.597 mean (98% above threshold)

**For clean images without face lock (hero shots, finals):**
```bash
cd ~/projects/imageCLI
uv run imagecli generate prompt.md -e flux2-klein --no-compile
```
- Klein 4B FP8 quanto + CPU offload
- 28 steps, 1024×1024
- Peak VRAM: 7.84 GB

---

## V16 — Final Training Dataset

300 images generated with FLUX.1-dev + PuLID v0.9.1 at 1024×1024.

**Gallery:** `brand/v16-gallery.html`

| Group | Range | Count |
|-------|-------|-------|
| Frontal Expressions | 001–030 | 30 |
| Three-Quarter Angles | 031–060 | 30 |
| Profiles & Extreme Angles | 061–090 | 30 |
| Close-ups & Crops | 091–120 | 30 |
| Lighting Variations | 121–150 | 30 |
| Moods & Contexts | 151–180 | 30 |
| Body Shots | 181–210 | 30 |
| Style & Creative | 211–240 | 30 |
| Raw Editorial / 006-Style | 241–270 | 30 |
| Identity Stress Test | 271–300 | 30 |

**Face scoring:**
- Mean similarity to 006: **0.597**
- Median: 0.601
- Max: 0.675 (151-mood-coffee-shop)
- Above 0.5 threshold: **292/295 (98%)**
- No face detected: 5 (back-of-head, extreme crops)

**Next step:** Identity clustering — find the top 20-30 images that form the strongest consistent face group for LoRA training.

---

## Files

| File | Purpose |
|------|---------|
| `brand/FACE-LOCK-INVESTIGATION.md` | This report |
| `brand/AVATAR-PLAYBOOK.md` | Full avatar creation workflow |
| `brand/1024-comparison.html` | Pipeline comparison gallery |
| `brand/pulid-grid.html` | FLUX.1-dev PuLID parameter grid |
| `brand/klein-pulid-grid.html` | Klein 4B PuLID parameter grid |
| `brand/v16-gallery.html` | V16 training dataset (300 images) |
| `brand/concepts/avatar-lyra-v16/face_scores.json` | Per-image face similarity scores |
| `~/projects/imageCLI/src/imagecli/engines/pulid_flux1_dev.py` | FLUX.1-dev PuLID engine |
| `~/projects/imageCLI/src/imagecli/engines/pulid_flux2_klein.py` | Klein 4B PuLID engine (fixed) |
| `~/projects/imageCLI/src/imagecli/engines/flux2_klein.py` | Klein 4B FP8 engine |
| `~/projects/InfiniteYou/` | InfiniteYou repo (patched, doesn't fit 16 GB) |
