# FLUX.2-Klein ComfyUI Setup — Debug Log & Analysis

_Last updated: 2026-04-01_

## Goal

Generate 200 face-locked Lyra training images using ComfyUI + PuLID Flux2.

- **Model**: FLUX.2-klein-4B
- **Reference face**: `~/.agent/lyra/brand/concepts/avatar-final/006-just-solved-1024.png`
- **Output**: 400×400 PNG → `~/.agent/lyra/brand/concepts/avatar-training/`
- **Post-batch**: `make diagrams deploy` + Telegram notification

---

## Part 1 — Root Bug: Garbled/Mosaic Output

### Symptoms
ComfyUI + FLUX.2-klein-4B was producing completely garbled mosaic output images (noise/artifacts, no recognizable content).

### Diagnosis process

**Step 1 — Model architecture verification**
- Klein 4B: `in_channels=128`, `patch_size=1`, `hidden_size=3072`, `num_heads=24`
- `axes_dim=[32,32,32,32]` (4D RoPE for Klein)
- `global_modulation=True` (shared modulation modules across all blocks)
- **No guidance_embed** (unlike Flux.1 Dev)

**Step 2 — Timestep convention**
- ComfyUI `layers.py`: `timestep_embedding` has `time_factor=1000.0`
- → sigma ∈ [0,1] maps to [0,1000] ✅ matches Diffusers convention
- ❌ NOT the bug

**Step 3 — Text conditioning**
- Both ComfyUI and Diffusers use Qwen3 4B, extract hidden states from layers [9, 18, 27]
- Concatenate → `[B, seq_len, 7680]`
- ✅ Verified identical

**Step 4 — Position IDs (img_ids / txt_ids)**
- Klein uses 4-column img_ids: `[index=0, h_idx, w_idx, 0]`
- ComfyUI correctly creates 4 columns for Klein (`len(axes_dim)=4`)
- ✅ Verified identical to Diffusers

**Step 5 — Key coverage**
- Ran conversion: 169 source keys → 149 output keys
- ✅ All source keys accounted for

**Step 6 — Forward pass comparison**
- Same input (σ=0.5, zero conditioning, seed 42)
- ComfyUI velocity std: **1.52** | x0 std: **2.19** ← wrong
- Diffusers velocity std: **0.637** | x0 std: **0.914** ← expected

**Step 7 — Root cause identified**

The converter script `convert_flux2_klein_hf_to_comfy.py` directly copied:
```python
"norm_out.linear.weight": "final_layer.adaLN_modulation.1.weight"
```

But the scale/shift order is **reversed** between Diffusers and ComfyUI:

| Framework | `AdaLayerNorm` chunk order |
|-----------|---------------------------|
| Diffusers `AdaLayerNormContinuous` | `scale, shift = chunk(emb, 2)` → rows 0–3071 = scale |
| ComfyUI `LastLayer` | `shift, scale = chunk(emb, 2)` → rows 0–3071 = shift |

The `norm_out.linear.weight` tensor is `[6144, 3072]` — first 3072 rows go to one, second 3072 to the other. Copying it directly swaps them.

### Fix applied

**File**: `/home/mickael/ComfyUI/convert_flux2_klein_hf_to_comfy.py`

Removed `norm_out.linear.weight` from the `SIMPLE` dict and replaced with:

```python
if "norm_out.linear.weight" in sd:
    w = sd["norm_out.linear.weight"]  # [6144, 3072]
    # Diffusers: scale rows 0-3071, shift rows 3072-6143
    # ComfyUI:   shift rows 0-3071, scale rows 3072-6143
    add("final_layer.adaLN_modulation.1.weight", torch.cat([w[3072:], w[:3072]], dim=0))
```

### Verification

Re-ran converter → re-ran comparison test:
- ComfyUI velocity std: **0.656** ✅ (was 1.52)
- x0 std: **0.977** ✅ (was 2.19, expected ~1.0)

**The garbled output bug is fixed.**

---

## Part 2 — PuLID Face Lock: Dimension Mismatch

### Problem

Available PuLID models (`pulid_flux2_klein_v1.safetensors`, `pulid_flux2_klein_v2.safetensors`) have `dim=4096`.

Klein 4B has `hidden_size=3072`. PuLID needs to inject identity tokens at the dimension of the transformer's hidden states.

The ComfyUI-PuLID-Flux2 node handles this by detecting the variant:
```python
if n_double <= 6 and n_single <= 22:
    return "klein_4b", 3072, n_double, n_single  # our model: 5d / 20s
```

When `id_tokens.shape[-1] (4096) != flux_dim (3072)`, it falls back to:
```python
proj = nn.Linear(4096, 3072, bias=False)  # RANDOM initialization
nn.init.normal_(proj.weight, std=0.02)
injector = PuLIDFlux2(dim=3072)           # also random
```

→ **Face identity is not preserved**. The PuLID models were trained for Klein 9B (dim=4096), not Klein 4B.

### Options evaluated

| Option | VRAM | Downloads | Face lock | Notes |
|--------|------|-----------|-----------|-------|
| Klein 4B + text prompts | ~8GB | 0 | ❌ | Works now |
| Klein 4B + random PuLID | ~10GB | 0 | ❌ bad | Random projection |
| XLabs IP-Adapter Face | ~9GB | ~4GB | ❓ | Flux.1 only, Klein untested |
| Fine-tune PuLID dim=3072 | ~8GB | 0 | ✅ | Days of work |
| **Klein 9B Q8_0 + PuLID** | **~11GB** | **~26GB** | **✅** | **True face lock** |

### Klein 9B GGUF path (recommended long-term)

| Component | Source | Size |
|-----------|--------|------|
| UNet Q8_0 GGUF | `unsloth/FLUX.2-klein-9B-GGUF` | ~10GB |
| Qwen3 8B text encoder | `black-forest-labs/FLUX.2-klein-9B/text_encoder/` | ~16GB |
| ComfyUI-GGUF node | `city96/ComfyUI-GGUF` | ~10MB |
| **Total** | | **~26GB** |

**VRAM profile with CPU text encoder offload:**
- Encoding phase: Qwen3 8B on CPU RAM (~16GB), Klein 9B on VRAM (~10GB)
- Denoising phase: Klein 9B Q8_0 ~10GB + VAE ~0.5GB → **~10.5GB VRAM**
- ✅ Fits on RTX 5070 Ti (16GB)

**Quality**: Q8_0 GGUF ≈ BF16 quality, indistinguishable in practice.

---

## Part 3 — Two-Phase Batch Generation

### Architecture

```
5070 Ti (sm_120 Blackwell, 16 GB, native FP8)
────────────────────────────────────────────
Phase 1  Qwen3 8B FP8  →  ~8 GB VRAM
         Encode 200 prompts → save .pt files → del → empty_cache()

Phase 2  Klein 9B FP8  →  ~9 GB VRAM  +  PuLID dim=4096 ✅
         Load saved embeddings → denoise → save PNGs
```

**Why not the 3080 for encoding?**
- RTX 3080 = sm_86 (Ampere) → **no native FP8 matmul hardware** (needs sm_89+)
- FP8 dtype exists, but compute falls back to BF16 → weights=8 GB + BF16 activations ≈ 10 GB → OOM risk
- 5070 Ti (sm_120, Blackwell) has native FP8: faster and safer

**Why Klein 9B instead of 4B for face lock?**
- PuLID models are dim=4096 → matches Klein 9B hidden_size ✅
- Klein 4B has hidden_size=3072 → dim mismatch → random projection → no face identity

### Script

`~/.agent/lyra/brand/generate_training_9b.py`

```bash
cd ~/projects/imageCLI

# Full run (encode + generate):
uv run python3 ~/.agent/lyra/brand/generate_training_9b.py

# Or phase by phase:
uv run python3 ~/.agent/lyra/brand/generate_training_9b.py --phase encode
uv run python3 ~/.agent/lyra/brand/generate_training_9b.py --phase generate
```

### Pre-requisites

1. **HF token** — Klein 9B is gated:
   ```bash
   cd ~/projects/imageCLI && uv run huggingface-cli login
   # Accept FLUX.2-klein-9B licence at https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
   ```

2. **First download**: Phase 1 downloads Qwen3 8B text encoder (~16 GB).
   Phase 2 downloads Klein 9B FP8 transformer (~9 GB).
   Total: ~25 GB one-time download.

3. **PuLID** already at `~/ComfyUI/models/pulid/pulid_flux2_klein_v2.safetensors` ✅
4. **InsightFace** at `~/ComfyUI/models/insightface/` ✅

### VRAM profile

| Phase | Model | VRAM | Safe on 16 GB? |
|-------|-------|------|----------------|
| Encode | Qwen3 8B FP8 | ~8 GB | ✅ |
| Generate | Klein 9B FP8 + PuLID + VAE | ~11 GB | ✅ |
| Both simultaneously | — | never | ✅ |

---

## Current State (as of 2026-04-01)

- [x] FLUX.2-klein-4B converter bug **fixed**
- [x] Model regenerated: `flux2-klein-4b-comfy.safetensors` (7.22 GB)
- [x] Velocity std verified: 0.656 ✅
- [ ] Decision pending: Klein 9B GGUF download OR text-prompts-only batch

---

## Files

| File | Role |
|------|------|
| `~/ComfyUI/convert_flux2_klein_hf_to_comfy.py` | Converter with fix applied |
| `~/ComfyUI/models/diffusion_models/flux2-klein-4b-comfy.safetensors` | Fixed ComfyUI weights (7.22 GB) |
| `~/ComfyUI/models/text_encoders/flux2-klein-qwen3.safetensors` | Qwen3 4B text encoder (7.5 GB) |
| `~/ComfyUI/models/pulid/pulid_flux2_klein_v2.safetensors` | PuLID model dim=4096 (1.3 GB) |
| `/tmp/compare_comfy_vs_diffusers.py` | Comparison test script |

---

## References

- HF Klein 4B: `black-forest-labs/FLUX.2-klein-4B`
- HF Klein 9B: `black-forest-labs/FLUX.2-klein-9B`
- HF Klein 9B FP8: `black-forest-labs/FLUX.2-klein-9b-fp8`
- GGUF Klein 9B: `unsloth/FLUX.2-klein-9B-GGUF`
- ComfyUI-GGUF: `github.com/city96/ComfyUI-GGUF`
- ComfyUI-PuLID-Flux2: `github.com/iFayens/ComfyUI-PuLID-Flux2`
