# V23 LoRA — Attribution Exploration

Follow-up to V22. Three isolated training runs, each changing exactly one variable from the current production LoRA, to get **clean attribution** of which knobs move the needle on Klein 4B identity LoRAs.

> **Status (2026-04-05):** v23d trained + scored (**NULL**). v23f and v23a trained on **wrong dataset** (pre-V22 `lora-training-set` = face's data, not V22 `top30`) — reclassified as `v23f_face_overfit` + `v23a_face_overfit`, benchmark dirs renamed to `v23f_prev22_*` / `v23a_prev22_*`. Retrain configs `v23f2_top30_schedule.yaml` + `v23a2_top30_rank.yaml` ready. v23c/v23g configs path-fixed to top30. v23h blocked on [Roxabi/imageCLI#31](https://github.com/Roxabi/imageCLI/issues/31). v23e combiner conditional.
>
> **Production default: `lyra_v22_top30`** (confirmed 2026-04-05). Replaces `lyra_face_klein4b_v1` which was deprecated for realism/color issues + pre-V22 methodology + tight-data overfitting risk.
>
> **Epic:** [Roxabi/lyra#542](https://github.com/Roxabi/lyra/issues/542) — parent tracking issue with sub-issues per run.
>
> **Scoring framework — dual-metric, not single-centroid**
>
> | Metric | What it measures | Why it matters |
> |---|---|---|
> | **Internal coherence** | Pairwise cosine mean among the LoRA's own generated outputs (20 benchmark prompts) | "Same face every time" — cross-pose / cross-prompt identity consistency |
> | **vs top30 reference** | Mean cosine vs top30 centroid (fixed reference, cross-LoRA comparable) | Fidelity to the canonical V22 curated set |
>
> **THE reference: `top30`** = `~/.roxabi/forge/lyra/brand/concepts/avatar-lyra-v22-lora/top30/` — 30 P-numbered images from V22 phase2 dual-signal island detection. LOO ceiling **0.6551**. Same reference for every LoRA, every future run. Cross-comparable.
>
> (Secondary "vs own training centroid" is tracked in scores but not a primary axis — depends on which training set the LoRA used, not apples-to-apples across LoRAs.)
>
> **Baselines** (both use V22 dual-signal curation, rank 16, 2500 steps, same methodology):
>
> | LoRA | Dataset | Internal | vs top30 | % ceil | Production? |
> |---|---|---|---|---|---|
> | **v22_top30** ⭐ | top30 (30 imgs) | **0.4253** | 0.4763 | 72.7% | **YES — production default** |
> | v22_island0 | island0 (143 imgs) | 0.4128 | 0.4848 | 74.0% | secondary |
>
> v22_top30 wins on 4 of 5 axes in the n=19 benchmark + original V22 human assessment ("best identity lock, recognizable with short prompts"). Within noise of island0 on vs-top30-ref.
>
> **`v22_face` — DEPRECATED** (2026-04-05). User rejected for "realism and colors" on visual inspection. Also pre-V22 methodology, trained on `lora-training-set` (29 pre-V22 near-identical hand-curated images), +500 step advantage, memorization risk. **Do not use as baseline, production default, or stretch target.** Retained in benchmark for provenance only.
>
> **Real win threshold:** ≥ baseline + 0.02 on **BOTH** internal coherence **AND** vs top30 reference. Below that = noise or trade-off, not a clean win.
>
> **Reference ceilings** (LOO — max a "perfect" LoRA could reach):
> - `top30` (30 V22 curated): **0.6551** ← THE reference
> - `island0` (143 V22 diverse): 0.6725 (unused as primary ref)
> - `lora-training-set` (29 pre-V22): 0.9159 (misleadingly high — tight data, face's set, deprecated)
>
> **Benchmark:** `prompts/v23-benchmark/` — 20 canonical prompts (10 short + 10 long, matched slots) covering 10 shot×angle×expression×lighting combinations. Per-slot seeds 8391-8400. Reusable for v24+.
>
> **Galleries:**
> - [`v23-gallery.html`](https://diagrams-1ul.pages.dev/lyra/brand/v23-gallery.html) — v23 training-time samples per checkpoint.
> - [`v23-benchmark-gallery.html`](https://diagrams-1ul.pages.dev/lyra/brand/v23-benchmark-gallery.html) — benchmark outputs for all LoRAs (13 × 20 = 260 images + v23a_prev22 = 360 total).

---

## Status dashboard

### ✅ Done

| Item | Notes |
|---|---|
| V22-1024 scoreboard pulled from `scores_1024.json` | nvfp4-fused-long subset (n=3): top30 0.6074, island0 0.6059, face 0.6396 (face excluded as baseline — pre-V22 methodology, see above). **Superseded by benchmark (n=20) — see next row.** |
| **Reference ceilings computed** | Leave-one-out mean of each reference set — the max score a "perfect" LoRA could reach. top30=0.6551, island0=0.6725, lora-training-set=0.9159. Script: `score_reference_ceiling.py`. **Changed the whole scoring framing** — the "0.60 scores" that looked low are actually 90%+ of what's physically possible. |
| **Dual-metric preliminary (n=3, old scoring)** | v23d step3000 vs v22_island0: **+0.026 internal coherence** (win) but **−0.033 in-distribution fit** (loss). **Mixed result**, not the clean loss I first reported against face. face was disqualified after discovering it was trained 2 days before V22 methodology on pre-V22 data. |
| **Benchmark prompt set written** | `prompts/v23-benchmark/` — 20 prompts (10 short + 10 long, matched slots 00-09 on per-slot seeds 8391-8400). Covers shot × angle × expression × lighting. Reusable for all future LoRA runs. |
| **Benchmark generation (160 images)** | 8 LoRAs × 20 prompts = 160 images via Flux2KleinFP4Engine in 12.9 min. LoRAs: v22_top30, v22_island0, v22_face, v23d_2000/2250/2500/2750/3000. Script: `run_benchmark.py`. |
| **Benchmark dual-metric scored (n=19/20)** | `long-03-detail-frontal-serious` failed face detection on all 8 LoRAs (too-tight crop). Comparison apples-to-apples. Results: v22_face dominates every axis (0.5478 int / 0.6093 train / 0.5581 top30). v22_top30 ≈ v22_island0 (within 0.015 all axes). v23d all 5 checkpoints within ±0.02 of v22_island0 on every metric. Script: `score_benchmark.py`. JSON: `scores_benchmark.json`. |
| **v23d verdict (final): NULL RESULT** | +500 steps over v22_island0 produced **no measurable change** on any axis at n=19. Prior n=3 "+0.026 internal / −0.033 in-dist" was small-sample noise. **Knob exhausted** — 2500 steps is already at saturation for rank 16 on island0. Don't train more v23d variants. |
| **Benchmark gallery built** | `v23-benchmark-gallery.html` — 160 images, LoRA × slot pivot, short/long style filter, LoRA family pills (v22/v23/face). Uses shared `discoverFiles` + gallery-base.js. |
| Phase 2 bug found + worked around | Manually wiring `Flux2KleinPipeline.load_lora_weights → set_adapters([1.0]) → fuse_lora` silently broke LoRA loading for v23d (worked for face). Fix: use `Flux2KleinFP4Engine` class directly. Root cause not isolated — candidate for an imageCLI issue if it recurs on v23a/c/f/g. |
| Pivotal tuning inference verified broken | `Flux2KleinPipeline` lacks `TextualInversionLoaderMixin`; filed as [Roxabi/imageCLI#31](https://github.com/Roxabi/imageCLI/issues/31) |
| Initial maxparams config (4 knobs bundled) drafted → discarded | Zero attribution on bundled runs; replaced by 3 isolated configs |
| 3 isolated attribution configs written | `train_lyra_v23{a_rank,c_dop,d_island0}.yaml` under `~/projects/archived/ai-toolkit/config/` |
| V23-EXPLORATION.md written + reviewed | This doc |
| Pre-launch checks (GPU, dataset, model cache) | 13.5 GB free, 143 island0 pairs verified, Klein 4B cached |
| voicecli_tts + voicecli_stt stopped for training window | Need restart after v23 runs complete: `make tts start && make stt start` |
| v23d first launch attempted | **Crashed at step 0**: `min_snr_gamma: 5.0` incompatible with flow-matching scheduler |
| `min_snr_gamma` removed from all 3 configs | Requires DDPM `alphas_cumprod`; Klein 4B uses `CustomFlowMatchEulerDiscreteScheduler`. `noise_offset` stays (scheduler-agnostic). Lesson documented below. |
| **v23d re-launched and completed** | 3000 steps in **1h 19m**, final loss 0.657, 12 checkpoints saved, clean exit |
| Forge gallery built | `v23-gallery.html` — 42 v23d samples pivoted step × prompt; auto-updates from symlinked sample dirs as other runs land. Initially needed a custom discoverFiles override for nested `/lyra/brand/` paths; later simplified to use the shared `discoverFiles` after `gallery-base.js` gained nested-path support. |
| **v23f-schedule config written** | `train_lyra_v23f_schedule.yaml` — same as v22_top30 + steps 2500→4000 (+noise_offset). **Prior weakened 2026-04-05:** the "+0.055 from 500 extra steps" finding came from face vs v22_top30, but face is disqualified as a baseline, so the step-count effect is now unmeasured. Still cheap to run (~2h) but no longer "strongest prior". |
| **v23f trained against the wrong dataset** (config drift) | The yaml was drafted earlier in the day when face was still the production baseline, then the plan was revised to use `v22_top30` config after face got disqualified — but the yaml was never rewritten. Launched 2026-04-05 13:55 against `lora-training-set` (pre-V22 face dataset, 30 imgs) + 4000 steps + noise_offset instead of top30. Trained artifacts kept as a characterization of the face dataset at the ~133 views/img overfit regime. See incidents table below. |
| **v23f reclassified as face-lineage overfit study** (option a) | Config file renamed: `train_lyra_v23f_schedule.yaml` → `train_lyra_v23f_face_overfit.yaml` (header rewritten with full drift note, internal `name:` left as `lyra_v23f_schedule` to preserve the existing output dir path and LoRA filename). [#547](https://github.com/Roxabi/lyra/issues/547) commented + stays closed. Trained checkpoints in `output/lyra_v23f_schedule/` are kept. |
| **v23f2-top30-schedule config written** | `train_lyra_v23f2_top30_schedule.yaml` — the clean V22-methodology rerun the plan actually called for. `v22_top30` config + 2500→4000 steps + noise_offset. Same overfit regime as face/v23f (~129 views/img) on clean V22 curation — directly comparable visual character. Filed as [#554](https://github.com/Roxabi/lyra/issues/554). |
| **v23a hit the same wrong-dataset drift** | v23a was trained on `lora-training-set` (face data) instead of `top30`, same config bug as v23f. Config renamed `train_lyra_v23a_rank.yaml` → `train_lyra_v23a_face_overfit.yaml`. Trained artifacts at `output/lyra_v23a_rank/` kept. Benchmark dirs renamed `v23a_*` → `v23a_prev22_*` (alongside `v23f_*` → `v23f_prev22_*`) to reserve clean names for the retraining. |
| **v23a2-top30-rank config written** | `train_lyra_v23a2_top30_rank.yaml` — rank 16→32 on `avatar-lyra-v22-lora/top30` (30 imgs, V22 dual-signal). 2500 steps. Paired with v23f2 for the two orthogonal knobs on clean V22 data. |
| **v23c/v23g dataset paths fixed in-place** | Both had the same `lora-training-set` bug. Never ran, so no rename needed — just updated `folder_path` to `concepts/avatar-lyra-v22-lora/top30`. |
| **v22_face DEPRECATED** (user visual rejection + bad provenance) | User rejected face for "realism and colors" on visual inspection. Combined with pre-V22 methodology, tight pre-V22 curation (lora-training-set, 0.84 internal pairwise), +500 step advantage over v22_top30, and memorization risk → **not a baseline, not a stretch target, not production**. Kept in benchmark as v22_face for provenance only. Production default is now **v22_top30**. |
| **Memorization check on v23d_3000_P0** | User observed "v23d 1250→3000 P0 samples look like v22 seed 8391 outputs". Ran buffalo_l similarity against all 143 island0 training images. **Max similarity 0.5477** (to P1654-headshot-3q-left-calm), mean 0.4137. NOT memorization (<0.65 threshold). Verdict: **v23d is a WEAK LoRA** — weakly biased toward training distribution average, not memorized. Explains v23d's null benchmark result. Visual similarity user sees is Klein 4B's base-model character at seed 42 with light LoRA influence. Script: `score_memorization_check.py`. |
| **Orphan test files moved** | `concepts/avatar-lyra-v22-lora/lora-test-top30-step1000*.png` → `_debug/`. These were April 4 debug outputs from a manual v22_top30 step-1000 inference test (quant vs no-quant comparison). Were showing as "?" in the gallery because they didn't match the P* filename pattern. **Still pending cleanup:** 144 flat P*.png at `concepts/avatar-lyra-v22-lora/` parent level are full duplicates of the `island0/` subdir (1 has `_1` suffix from an imageCLI conflict). ~144 MB duplication, scratch-space leftover. |
| **Production default set: `lyra_v22_top30`** | Replaces `lyra_face_klein4b_v1` (deprecated above). Decision based on: AVATAR-LOG original human assessment ("best identity lock, recognizable with short prompts"), n=19 benchmark winning 4 of 5 axes vs v22_island0, simpler dataset (30 imgs) for iteration, matches v23f2/v23a2 retraining target. |
| **v23g-prodigy config written** | `train_lyra_v23g_prodigy.yaml` — same as v22_top30 + optimizer adamw8bit@1e-4→prodigy8bit@1.0. Tests whether auto-LR beats constant 1e-4. Dataset path fixed to `top30`. |
| **Lyra epic + sub-issues filed** | [#542 epic](https://github.com/Roxabi/lyra/issues/542), [#543 v23d (done, NULL)](https://github.com/Roxabi/lyra/issues/543), [#544 v23a (reclassified)](https://github.com/Roxabi/lyra/issues/544), [#545 v23c](https://github.com/Roxabi/lyra/issues/545), [#546 v23e combiner](https://github.com/Roxabi/lyra/issues/546), [#547 v23f (reclassified, closed)](https://github.com/Roxabi/lyra/issues/547), [#548 v23g](https://github.com/Roxabi/lyra/issues/548), [#549 v23h (blocked)](https://github.com/Roxabi/lyra/issues/549), [#554 v23f2](https://github.com/Roxabi/lyra/issues/554) |

### 🟡 In progress

_Nothing currently running on GPU._

### ⏳ Todo

**Immediate — v23d benchmark post-mortem:**
- [x] Score v23d step3000 at n=3 (preliminary) — superseded
- [x] Compute reference ceilings (top30=0.6551, island0=0.6725, lora-training-set=0.9159)
- [x] Write 20-prompt benchmark (10 short + 10 long, matched slots)
- [x] Run benchmark scorer on all 160 images — **v23d verdict: NULL** (no measurable change vs v22_island0)
- [x] Investigation dropped — benchmark confirms knob is exhausted, not a regression
- [ ] Update [#543](https://github.com/Roxabi/lyra/issues/543) with NULL verdict (keep open per user)

**Individual attribution runs (each ~1.5-3h, sequential on 16 GB):**

Run order **after v23f + v23a drift**: **v23f2 → v23a2 → v23g**. v23c-dop **deprioritized** (lowest prior, most expensive, v23d showed the knobs are hard to move without methodology changes). v23h parked on imageCLI#31.

- [x] ~~**v23f-schedule** — [#547](https://github.com/Roxabi/lyra/issues/547)~~ — **drifted, reclassified as face-lineage overfit study.** Trained on `lora-training-set` (face data) + 4000 steps. Config renamed `train_lyra_v23f_face_overfit.yaml`. Artifacts kept. Benchmark dirs renamed `v23f_prev22_*`.
- [x] ~~**v23a-rank** — [#544](https://github.com/Roxabi/lyra/issues/544)~~ — **same drift as v23f.** Trained on `lora-training-set` (face data) + rank 32. Config renamed `train_lyra_v23a_face_overfit.yaml`. Artifacts kept. Benchmark dirs renamed `v23a_prev22_*`.
- [ ] **v23f2-top30-schedule** — [#554](https://github.com/Roxabi/lyra/issues/554) — v22_top30 config + 2500→4000 steps + noise_offset. `train_lyra_v23f2_top30_schedule.yaml`. Est. ~2h. **Running first — the v23f rerun the plan actually called for.**
- [ ] **v23a2-top30-rank** — TBD new issue — v22_top30 config + rank 16→32 + noise_offset. `train_lyra_v23a2_top30_rank.yaml`. Est. ~1.5h. Runs after v23f2.
- [ ] **v23g-prodigy** — [#548](https://github.com/Roxabi/lyra/issues/548) — v22_top30 config + adamw8bit→prodigy8bit. Config path already fixed. Est. ~1.5h.
- [ ] **v23c-dop** — [#545](https://github.com/Roxabi/lyra/issues/545) — **DEPRIORITIZED**. Config path already fixed. Only run if v23a2/f2/g all produce null.
- [ ] Score each run with `run_benchmark.py` + `score_benchmark.py` (add checkpoints to LORAS dict, benchmark skips existing).
- [ ] Per-run symlinks auto-populate the benchmark gallery.

**Conditional — v23e combiner ([#546](https://github.com/Roxabi/lyra/issues/546)):**
- [ ] Draft `train_lyra_v23e_<winning_knobs>.yaml` combining whichever knobs cleared the 0.02 noise floor over **0.6074** (v22_top30 on top30 data) or **0.6059** (v22_island0 on island0 data), depending on which dataset the winning knobs use.
- [ ] Run and verify additivity (combiner should be ≥ max of individual winners).

**Blocked — v23h pivotal ([#549](https://github.com/Roxabi/lyra/issues/549)):**
- [ ] Wait for [Roxabi/imageCLI#31](https://github.com/Roxabi/imageCLI/issues/31) to close.
- [ ] Write `train_lyra_v23h_pivotal.yaml` based on the draft from the deleted maxparams config.
- [ ] Verify Qwen3 tokenizer handles `init_words: "face of a young woman"` as exactly 4 BPE tokens (adjust `tokens:` count if needed).
- [ ] Run, score, compare vs other winners.

**After v23f2/v23a2/v23g finish:**
- [ ] Score all new checkpoints via the 20-prompt benchmark + update `scores_benchmark.json`
- [ ] Compare deltas vs **v22_top30** (0.4253 int / 0.4763 t30) — real win = +0.02 on both
- [ ] If any knob wins → draft v23e combiner config stacking winners on top30
- [ ] Update `project_v22_avatar.md` memory note with v23 results + dataset-drift lesson
- [ ] Update `V22-GENERATION.md:189` — "island0 averaged it out" reframing (island0 ≈ top30 at rank 16 + 2500 steps on the nvfp4-fused-long subset)
- [ ] Record v23 results in `AVATAR-LOG.md` as a new V23 section
- [ ] `AVATAR-PIPELINES.md` production default **already set to `lyra_v22_top30`** — replaces `lyra_face_klein4b_v1`
- [ ] `AVATAR-PLAYBOOK.md` — remove face-LoRA references
- [ ] Restart voicecli daemons: `cd ~/projects && make tts start && make stt start`
- [ ] Clean up `concepts/avatar-lyra-v22-lora/` flat P*.png duplicates (144 files, ~144 MB) — duplicate of `island0/` subdir
- [ ] Close epic [#542](https://github.com/Roxabi/lyra/issues/542) with a results summary

**Separate track (not blocking v23):**
- [ ] [Roxabi/imageCLI#31](https://github.com/Roxabi/imageCLI/issues/31) — add pivotal embedding loading to `Flux2KleinPipeline`. Unblocks v23h and any future pivotal tuning runs. Estimated 4-8h of engineering.

### ⚠️ Known incidents

| Date | What happened | Fix |
|---|---|---|
| 2026-04-05 | v23d crashed at step 0 — `AttributeError: 'CustomFlowMatchEulerDiscreteScheduler' object has no attribute 'alphas_cumprod'` | Removed `min_snr_gamma: 5.0` from all 3 configs. Min-SNR is DDPM-only; Klein 4B is flow matching. `noise_offset` stays (verified scheduler-agnostic at `toolkit/train_tools.py:132`). |
| 2026-04-05 | **v23f config drift** — `train_lyra_v23f_schedule.yaml` launched at 13:55 against `lora-training-set` (pre-V22 face dataset, 30 imgs) + 4000 steps + noise_offset, but the revised plan (after v23d's morning benchmark disqualified face as baseline) called for running on `avatar-lyra-v22-lora/top30` instead. Yaml was edited at 11:59 but only the save cadence — dataset/baseline comments were never rewritten, `folder_path` left pointing at the face dataset. Training already completed before the drift was noticed. | **Option a accepted (2026-04-05):** keep the trained artifacts as a face-lineage overfit characterization, not a v23 attribution run. Renamed file to `train_lyra_v23f_face_overfit.yaml` with a drift note in the header. Wrote `train_lyra_v23f2_top30_schedule.yaml` for the clean rerun. Filed new sub-issue [#554](https://github.com/Roxabi/lyra/issues/554). **Lesson:** when revising a plan mid-day, also re-read every yaml the plan touches — comment-only edits can leave the data-side silently stale. |

### 🕐 Timing actuals vs estimates

| Run | Original estimate | Actual | Delta |
|---|---|---|---|
| v23d-island0 | ~3h | **1h 19m** | -55% (much faster than anticipated) |
| v23a-rank | ~3h | (pending) | Revised estimate: ~1.5h |
| v23c-dop | ~5h | (pending) | Revised estimate: ~3h (DOP 2× factor applied to revised base) |
| **Total 3-run plan** | ~11h | **~6h projected** | Far under budget |

---

## The V22 scoreboard (real numbers, not memory)

Pulled from `~/.roxabi/forge/lyra/brand/concepts/avatar-lyra-v22-1024/scores_1024.json` — the 144-image V22-1024 validation run, scored against the top30 training centroid with buffalo_l. **Two tables below: the grand mean across all 48 configs, and the nvfp4-fused-long subset that v23 runs should compare against.**

### Grand mean (48 configs per LoRA — all engines × fusion × prompts × steps × poses)

| LoRA | Dataset | Images | Steps | Rank | Grand mean | Median |
|---|---|---|---|---|---|---|
| `lyra_face_klein4b_v1` | lora-training-set | 29 | **3000** | 16 | 0.6137 | 0.6397 |
| `lyra_v22_island0` | avatar-lyra-v22-lora/island0 | 143 | 2500 | 16 | 0.5690 | 0.6063 |
| `lyra_v22_top30` | avatar-lyra-v22-lora/top30 | 30 | 2500 | 16 | 0.5586 | 0.5897 |

### The nvfp4-fused-long subset (3 poses, matches production config — THIS is what v23 compares against)

| LoRA | Dataset | Steps | frontal | 3q | profile | **mean** |
|---|---|---|---|---|---|---|
| `lyra_v22_top30` | top30 (30) | 2500 | 0.6707 | 0.6460 | 0.5055 | **0.6074** |
| `lyra_v22_island0` | island0 (143) | 2500 | 0.6697 | 0.6652 | 0.4829 | **0.6059** |
| ~~`lyra_face_klein4b_v1`~~ | lora-training-set (29) | 3000 | 0.6508 | 0.6290 | 0.6391 | ~~0.6396~~ |

### Why face is struck through (not the baseline)

`lyra_face_klein4b_v1` was trained **2026-04-02**, two days *before* the V22 top30/island0 experiments. Its config (`train_lyra_klein4b.yaml` — no version, no experiment label) is the first Lyra LoRA attempt. It was trained on `lora-training-set/` (29 images named `006-frontal-dreamy-distant.png`, `020-frontal-defiant-chin.png`, etc.) — **pre-V22 hand-curation from the V6-V8 era**, zero filename overlap with the V22 top30 reference centroid (30 P-numbered images from the V22 phase-2 island detection pipeline).

Face "wins" the V22-1024 grand mean only because of its **+500-step advantage** (3000 vs v22_top30's 2500). Using it as a target confounds dataset quality with training length and compares v23 runs against an inconsistent methodology.

**Apples-to-apples v23 baselines are `v22_top30` (0.6074) and `v22_island0` (0.6059).** Both use the same V22 dual-signal island curation, the same rank 16, the same 2500 steps. A v23 knob is a "real win" only if it clears these numbers + the 0.02 noise threshold, **on the corresponding dataset** (top30 baseline for top30-dataset runs, island0 baseline for island0-dataset runs).

**Also:** `v22_top30` and `v22_island0` are within 0.0015 of each other on the subset mean — effectively tied. The memory lesson "30 curated > 143 diverse at rank 16" collapses entirely on this subset: **they're the same.** Dataset size didn't matter at rank 16 + 2500 steps.

**Correction to `V22-GENERATION.md:189`.** That doc says "At rank 16: 30 curated images (top30) locked identity. 143 diverse images (island0) averaged it out." On the nvfp4-fused-long subset, top30 and island0 are effectively identical (0.6074 vs 0.6059). The "averaged out" framing is wrong. Update cleanup item pending.

---

## Pivotal tuning verification (why v23b is dropped)

Before committing to training, I verified whether ai-toolkit's pivotal tuning (`embedding:` block → 4 new tokens trained into the Qwen3 text encoder) can actually be **used** at inference through imageCLI. It can't, without a multi-hour code patch.

### What ai-toolkit saves

`BaseSDTrainProcess.py:534-556` — when `network:` and `embedding:` are both configured:

1. The embedding's state_dict (`{'emb_params': vec}`, shape `(n_tokens, hidden_size)`) is merged into the LoRA safetensors via `network.save_weights(..., extra_state_dict=embedding_dict)`.
2. A separate Automatic1111-format textual inversion file is also written: `{save_root}/{trigger}{step_num}.safetensors`.

### What imageCLI does at inference

`~/projects/imageCLI/src/imagecli/engines/flux2_klein_fp4.py:320-331` (and the same pattern in `flux2_klein.py`):

```python
if self.lora_path:
    self._pipe.load_lora_weights(self.lora_path)
    if self.lora_scale != 1.0:
        self._pipe.set_adapters(["default_0"], adapter_weights=[self.lora_scale])
    self._pipe.fuse_lora()
    self._pipe.unload_lora_weights()
```

That's the entire LoRA loading code. It never touches the tokenizer or text encoder.

### What `Flux2KleinPipeline` supports

Checked in imageCLI's venv:

```
load_textual_inversion: False
load_lora_weights:      True
MRO:  Flux2KleinPipeline -> DiffusionPipeline -> ConfigMixin ->
      PushToHubMixin -> Flux2LoraLoaderMixin -> LoraBaseMixin -> object
```

**`Flux2KleinPipeline` does not inherit `TextualInversionLoaderMixin`.** There is no `load_textual_inversion` method to call even if we wanted to patch imageCLI. The diffusers FLUX.2 pipeline class was built with LoRA loading only, and the textual inversion mixin was never added.

### Net effect

At inference:
- `emb_params` key in the merged LoRA file doesn't match any LoRA state-dict pattern (`<module>.lora_A.weight`, etc.), so diffusers silently drops it as an unexpected key.
- The Qwen3 tokenizer has never heard of `lyraface`, so it BPE-tokenizes the word into sub-tokens with whatever default embeddings they have.
- The 4 trained embedding vectors are never wired into the text encoder's input embedding layer.
- **Result:** a pivotal-trained LoRA scores identically to a non-pivotal LoRA. The TE-side training is discarded.

### What it would take to fix

1. Add custom embedding loading to imageCLI (either port `TextualInversionLoaderMixin` behavior for FLUX.2, or write a standalone loader):
   - Read the ai-toolkit `{trigger}{step}.safetensors` file
   - Resize Qwen3's `embed_tokens` layer to add 4 new placeholder tokens
   - Write the trained vectors into the new rows
   - Add the placeholder tokens to the Qwen3 tokenizer vocab
   - Handle prompt expansion (`"lyraface"` → `"<lyraface_0><lyraface_1><lyraface_2><lyraface_3>"`) before tokenization
2. Verify interaction with the NVFP4 runtime quantization path — the transformer gets quantized, but the text encoder stays in bf16, so the embedding layer should be editable. Needs confirmation.
3. Update `imagecli generate --lora` and `imagecli batch --lora` to auto-detect the embedding file sitting next to the LoRA, or add a separate `--embedding` flag.

Estimated: 4-8 hours of imageCLI engineering. Filed as [Roxabi/imageCLI#31](https://github.com/Roxabi/imageCLI/issues/31). **Not a v23 blocker** — v23 can proceed without pivotal tuning. A future v24 run can re-introduce pivotal once imageCLI#31 is resolved.

---

## The attribution runs (5 active + 1 conditional + 1 blocked)

Each run changes **exactly one variable** from the `lyra_v22_top30` config (the current production default). All share a one-line "free win" — `noise_offset: 0.05` — that is not under attribution test. Applied uniformly so it doesn't confound the comparison.

> **`min_snr_gamma: 5.0` was originally in the "free wins" bundle and removed after v23d crashed at step 0** with `AttributeError: 'CustomFlowMatchEulerDiscreteScheduler' object has no attribute 'alphas_cumprod'`. Min-SNR loss weighting (Hang et al. 2023) is a DDPM concept that requires `alphas_cumprod` from a noise-prediction scheduler. Klein 4B uses flow matching, which doesn't expose that attribute. The knob was ai-toolkit-accepted and diffusers-silent, but crashes at the first loss computation. `noise_offset` is scheduler-agnostic (additive shift on the noise tensor before loss, see `toolkit/train_tools.py:132`) and stays in. **Lesson:** verify scheduler compatibility before adding "standard" loss-side knobs to flow-matching configs.

| Run | Status | Config file | One-variable delta | Tests | Est. time | Issue |
|---|---|---|---|---|---|---|
| **v23d-island0** | ⚪ NULL | `train_lyra_v23d_island0.yaml` | dataset: `lora-training-set` → `avatar-lyra-v22-lora/island0`, steps: 2500 → 3000 | +500 steps → no measurable change on any axis (all 5 checkpoints within ±0.02 of v22_island0). Knob exhausted. | 1h19m (actual) | [#543](https://github.com/Roxabi/lyra/issues/543) |
| ~~**v23f-schedule**~~ | ⚠️ Reclassified (face-lineage overfit study) | `train_lyra_v23f_face_overfit.yaml` (renamed) | dataset: `lora-training-set` (drift — was supposed to be `top30`), `train.steps: 3000 → 4000`, `+noise_offset` | Drifted from plan — trained artifacts kept as characterization of face dataset at 4000 steps + noise_offset (~133 views/img overfit regime), **not** a valid v23 attribution run | 2h (actual) | [#547](https://github.com/Roxabi/lyra/issues/547) (closed) |
| **v23f2-top30-schedule** | 🆕 Configured | `train_lyra_v23f2_top30_schedule.yaml` | `train.steps: 2500 → 4000` on `avatar-lyra-v22-lora/top30`, `+noise_offset` | Clean rerun of what v23f was supposed to be. Does step-count move the needle on V22-methodology data? Same ~129 views/img regime as v23f for visual comparison. | ~2h | [#554](https://github.com/Roxabi/lyra/issues/554) |
| ~~**v23a-rank**~~ | ⚠️ Reclassified (face-lineage, same drift as v23f) | `train_lyra_v23a_face_overfit.yaml` (renamed) | dataset: `lora-training-set` (drift), rank 16→32 | Same drift as v23f. Trained artifacts kept. Benchmark dirs renamed `v23a_prev22_*`. | 1h20m (actual) | [#544](https://github.com/Roxabi/lyra/issues/544) |
| **v23a2-top30-rank** | 🆕 Configured | `train_lyra_v23a2_top30_rank.yaml` | `network.linear/alpha: 16 → 32` on `avatar-lyra-v22-lora/top30` | Clean rank test on V22 methodology data. 2500 steps (matches v22_top30 baseline). | ~1.5h | TBD new issue |
| **v23c-dop** | ⏳ Configured | `train_lyra_v23c_dop.yaml` | `diff_output_preservation: true` (class: `"woman"`) — dataset path fixed to top30 | Does regularization reduce identity leak without a separate reg dataset? | ~3h (DOP ≈ 2× per-step cost) | [#545](https://github.com/Roxabi/lyra/issues/545) |
| **v23g-prodigy** | ⏳ Configured | `train_lyra_v23g_prodigy.yaml` | `optimizer: adamw8bit@1e-4 → prodigy8bit@1.0` on top30 (path fixed) | Does auto-LR beat constant 1e-4 on V22 data? | ~1.5h | [#548](https://github.com/Roxabi/lyra/issues/548) |
| **v23h-pivotal** | 🚫 Blocked | (not written) | adds `embedding:` block (4 pivotal tokens) | Does a trained trigger-word embedding tighten identity? | ~1.5h + 4-8h eng | [#549](https://github.com/Roxabi/lyra/issues/549) |
| **v23e-combiner** | 🟡 Conditional | (written after scoring) | stacks winning knobs from v23a/c/d/f2/g | Do individual knob wins stack additively? | ~2-6h | [#546](https://github.com/Roxabi/lyra/issues/546) |

All active runs share: rank 16 (except v23a), 3000 steps (except v23f-reclassified/v23f2 at 4000), constant LR 1e-4 `adamw8bit` (except v23g), gradient accumulation 4, gradient checkpointing, bf16 training dtype, FP8 model quantize, EMA 0.99, multi-bucket `[512, 768, 1024]`, caption dropout 0.05, flowmatch noise scheduler, Klein 4B base.

### Why each knob is in the plan

- **Rank (v23a)** — the only capacity knob available on 16 GB. Rank 32 doubles LoRA parameters, costs ~80 MB more VRAM, otherwise free. Memory originally flagged this as debunked, but that was specifically at the top30 size; v23a tests the same rank bump on the winning dataset + training length.
- **DOP (v23c)** — the only free regularization. Alternatives (separate reg image dataset, `blank_prompt_preservation`) either need a new dataset or are mutually exclusive with DOP. Lowest prior, most expensive run.
- **Bigger dataset (v23d)** — the user's explicit requirement. v23d double-dips as a comparison against `lyra_v22_island0` at 2500 steps — shows whether the +500 step bonus transfers to the larger set. **Already done: 1h19m wall clock, clean exit, scoring pending.**
- **Schedule (v23f / v23f2)** — added to the plan after the V22 scoreboard revealed the 500-step effect is worth +0.055 centroid (the single largest known lever on Klein 4B identity LoRAs at this scale). The original v23f drifted onto the face dataset (see incident above), so the clean step-count test is now **v23f2** against `v22_top30` (2500→4000). The face-dataset v23f artifacts remain useful as a characterization but don't isolate the step-count lever on V22 methodology.
- **Prodigy (v23g)** — tests whether `face`'s constant 1e-4 was near-optimal or whether an auto-adaptive LR can find a better rate. Community-established for FLUX LoRAs. Non-deterministic, so results need the 0.02 noise threshold to claim a win.
- **Pivotal (v23h)** — revival of the dropped v23b. Trains 4 token-embedding vectors for the trigger word alongside the LoRA. Blocked on [Roxabi/imageCLI#31](https://github.com/Roxabi/imageCLI/issues/31) — inference path must support the embedding before training is worth running.

### What's still excluded

- **Full Qwen3 TE training** — OOM on 16 GB. No config flag makes it fit. Hard hardware ceiling.
- **Multi-knob "maxparams" combination** — bundles everything together, zero attribution if it wins or loses. Explicitly replaced by the isolated-runs plan.
- **`min_snr_gamma`** — was in the "free wins" bundle originally, crashed v23d at step 0 (DDPM-only, incompatible with Klein's flow matching). Not viable.
- **Cosine decay** — was part of the original "schedule" framing but bundled with step-count in the maxparams draft. v23f2 isolates step-count alone; cosine could be a future v24 run if v23f2 wins.

### Why `v22_top30` and `v22_island0` are the baselines (not `face`)

**Same methodology, same rank, same training length.** Both v22 LoRAs were trained with the V22 dual-signal island curation, rank 16, 2500 steps, on the same commit of ai-toolkit. They differ from each other only in dataset size. A v23 knob that beats *the corresponding v22 baseline on the same dataset* isolates that knob's contribution cleanly.

**Which baseline depends on the run's dataset:**
- Runs on `lora-training-set` (top30 family — v23a, v23c, v23f, v23g, v23h): compare against `v22_top30` at **0.6074**
- Runs on `island0` (v23d): compare against `v22_island0` at **0.6059**
- Cross-dataset comparisons (e.g. v23d vs v22_top30): informative but not the primary target

**`face` is excluded** because (1) pre-V22 methodology, (2) +500 steps over the v22 runs makes it an unfair target, (3) pre-V22 curated data isn't comparable. Treating it as the target set the wrong bar for v23d and would have misled v23a/c/f/g too. Corrected 2026-04-05 after v23d scoring revealed the discrepancy.

---

## Success criteria — dual-metric

Each v23 run is scored with `score_benchmark.py` on the 20-prompt benchmark (10 short + 10 long). Compared against **`v22_top30`** (the production default) across two axes:

| Axis | What | v22_top30 baseline (n=19) | Real win threshold |
|---|---|---|---|
| **Internal coherence** | Pairwise cosine mean among LoRA's 20 outputs | **0.4253** | ≥ 0.4453 (+0.02) |
| **vs top30 reference** | Mean cosine vs top30 centroid (ceiling 0.6551) | **0.4763** (72.7% ceil) | ≥ 0.4963 (+0.02, ~75.8% ceil) |

**Verdict matrix:**

| Internal Δ | vs top30 Δ | Verdict |
|---|---|---|
| ≥ +0.02 | ≥ +0.02 | **clean win** — ship it, candidate for v23e combiner |
| ≥ +0.02 | −0.02 to +0.02 | **coherence win** — better consistency, same fidelity |
| −0.02 to +0.02 | ≥ +0.02 | **fidelity win** — closer to reference, same consistency |
| ≥ +0.02 | ≤ −0.02 | **trade-off** — use-case dependent |
| −0.02 to +0.02 | −0.02 to +0.02 | **tie** (within noise) — knob is neutral |
| ≤ −0.02 | * | **loss on coherence** — do not ship |
| * | ≤ −0.02 | **loss on fidelity** — do not ship |

**Short vs long prompt split** reported separately for each axis to catch style-specific effects.

**Noise threshold:** ≤ 0.01 = measurement noise. 0.02 is the floor to claim a real effect. **Also flag seed-variance risk**: training-shuffle seed variance has never been measured in this project, so any single-run "+0.02" result should be treated as provisional until reproduced.

### Test protocol (reuses V22 scoring pipeline)

Per-checkpoint scoring, not just final weights:

```bash
# Each v23 run saves checkpoints every 250 steps (12 per run).
# Score every checkpoint against the top30 training centroid to find
# the best step, not just the last.

cd ~/.roxabi/forge/lyra/brand
for run in lyra_v23a_rank lyra_v23c_dop lyra_v23d_island0; do
  for ckpt in ~/projects/archived/ai-toolkit/output/$run/${run}_*.safetensors; do
    uv run --group pulid python3 score_v22_1024.py \
      --lora "$ckpt" \
      --reference-set concepts/avatar-lyra-v22-lora/top30 \
      --output-json scores/${run}_$(basename $ckpt .safetensors).json
  done
done
```

Then generate head-to-head test images at 1024×1024 via `flux2-klein-fp4 --lora <best_checkpoint>` for visual comparison. The V22-1024 48-config matrix used 3 poses × 2 prompt styles × 2 step counts × 2 fusion modes × 2 engines. v23 only needs 3 poses × 1 prompt style (long) × 1 step count (8) × 1 fusion (fused) × 1 engine (NVFP4) = **3 images per LoRA per checkpoint**, then a tournament on the best checkpoint per run.

### Conditional v23e — the combiner run

Launch **only after** all individual runs finish and scoring is done. v23e combines the knobs that won (≥ +0.02 over the corresponding v22 baseline — 0.6074 for top30-dataset runs, 0.6059 for island0-dataset runs):

- If only one knob wins → skip v23e, that run's config becomes the new production candidate
- If two knobs win → v23e combines both (e.g. `v23e_rank_island0` or `v23e_island0_schedule`)
- If three or more win → v23e stacks all winners (e.g. `v23e_rank_island0_schedule`)
- If nothing wins → skip v23e; `face` stays production. Next moves: unblock pivotal via [imageCLI#31](https://github.com/Roxabi/imageCLI/issues/31), switch trainer, or curate better data.

The combiner's value is confirming that winning knobs stack (linear additivity) rather than canceling or saturating. Probably NOT involving DOP (v23c) because DOP interacts nonlinearly with other regularization-adjacent knobs.

---

## Attribution cost accounting

Based on v23d's actual wall clock (1h19m for 3000 steps at rank 16 on this machine), revised estimates for the other runs:

| Run | Status | GPU time | Notes |
|---|---|---|---|
| v23d-island0 | ✅ Done | **1h19m (actual)** | Larger dataset but multi-bucket keeps per-step cost similar |
| ~~v23f-schedule~~ (reclassified) | ⚠️ Drifted | **~2h (actual)** | Trained, but on wrong dataset — kept as face-overfit characterization |
| v23f2-top30-schedule | 🆕 Configured | ~2h | Clean rerun on v22_top30. 60% longer than v22_top30 baseline (4000 vs 2500 steps) |
| v23a-rank | ⏳ Configured | ~1.5h | Rank 32 has negligible per-step overhead, ~80 MB extra LoRA state, doubled optimizer state for LoRA param group |
| v23g-prodigy | ⏳ Configured | ~1.5h | Prodigy has negligible per-step overhead vs AdamW |
| v23c-dop | ⏳ Configured | ~3h | DOP's 2× forward pass per step |
| v23h-pivotal | 🚫 Blocked | ~1.5h + 4-8h eng | Training is cheap; the engineering to unblock it isn't |
| v23e-combiner (conditional) | 🟡 TBD | ~2-6h | Depends on which knobs stack. Worst case: rank 32 + island0 + 4000 steps + DOP. Best case: two cheap knobs. |
| **Subtotal (5 remaining individual runs, excl. pivotal)** | | **~9.3h GPU** | v23f2 + v23a + v23g + v23c + v23d (done) |
| **Full plan (+ combiner)** | | **~11-15h GPU** | |
| **Full plan (+ pivotal + combiner)** | | **~13-17h GPU + 4-8h engineering** | |

Scoring adds ~30 min per run (12-16 checkpoints × ~2 min each).

---

## How to launch

**Note:** ai-toolkit uses its own `venv/` (plain, not `.venv/`), so invoke the training script via the venv python directly, not `uv run`.

```bash
cd ~/projects/archived/ai-toolkit

# Each run is independent and sequential — 16 GB VRAM fits one at a time.
# Run in the order suggested below (strongest prior + cheapest first).
./venv/bin/python run.py config/train_lyra_v23f2_top30_schedule.yaml  # ~2h   — clean v23f rerun, direct visual comparison to face-overfit
./venv/bin/python run.py config/train_lyra_v23a_rank.yaml             # ~1.5h — contested prior, VRAM watch
./venv/bin/python run.py config/train_lyra_v23g_prodigy.yaml          # ~1.5h — community default
./venv/bin/python run.py config/train_lyra_v23c_dop.yaml              # ~3h   — weakest prior, run last
# v23d-island0 already done (1h19m, 2026-04-05)
# v23f-schedule trained but drifted — artifacts kept as face-overfit characterization
# v23h-pivotal blocked on Roxabi/imageCLI#31
# v23e-combiner written after scoring reveals winners
```

**Pre-launch checklist (per run):**
- Free VRAM ≥ 13 GB (`nvidia-smi`). Stop voicecli daemons if running: `cd ~/projects && make tts stop && make stt stop`.
- Verify dataset paths exist:
  - `~/.roxabi/forge/lyra/brand/concepts/avatar-lyra-v22-lora/top30` (31 pairs) — for v23f2/v23a/v23c/v23g/v23h
  - `~/.roxabi/forge/lyra/brand/lora-training-set` (30 pairs) — for the (drifted) v23f only
  - `~/.roxabi/forge/lyra/brand/concepts/avatar-lyra-v22-lora/island0` (143 pairs) — for v23d (already used)
- Confirm `black-forest-labs/FLUX.2-klein-base-4B` is cached at `~/.cache/huggingface/hub/models--black-forest-labs--FLUX.2-klein-base-4B/` (~23 GB). If not, first-run download is ~8 GB.
- Launch in the background with `nohup` + log redirect so you can close the terminal:
  ```bash
  nohup ./venv/bin/python run.py config/train_lyra_v23f2_top30_schedule.yaml \
    > /tmp/lyra_v23f2.log 2>&1 &
  ```
- Watch the first 50-100 steps for sanity (loss in 0.4-1.2 range, step time ~1-2s, VRAM stable).

**Expected output dirs:**
- `~/projects/archived/ai-toolkit/output/lyra_v23a_rank/`
- `~/projects/archived/ai-toolkit/output/lyra_v23c_dop/`
- `~/projects/archived/ai-toolkit/output/lyra_v23d_island0/` (exists)
- `~/projects/archived/ai-toolkit/output/lyra_v23f_schedule/` (exists — reclassified as face-overfit study)
- `~/projects/archived/ai-toolkit/output/lyra_v23f2_top30_schedule/`
- `~/projects/archived/ai-toolkit/output/lyra_v23g_prodigy/`

Each run saves:
- `{name}.safetensors` — final LoRA
- `{name}_000000250.safetensors` through `{name}_000003000.safetensors` (or `_000004000` for v23f/v23f2) — 12-16 checkpoints
- `samples/` — in-training 1024×1024 samples every 250 steps (includes a preservation-check prompt on v23c)
- `optimizer.pt` — for resume
- `config.yaml` — frozen copy of the config used

**Post-run per-run checklist:**
1. Verify clean exit: `tail /tmp/lyra_v23<X>.log` — look for `Saved checkpoint to output/...` as the last lines.
2. Create symlink for the gallery: `ln -sfn ~/projects/archived/ai-toolkit/output/lyra_v23<X>_<tag>/samples ~/.roxabi/forge/lyra/brand/concepts/avatar-lyra-v23/v23<X>-<tag>`
3. Refresh the gallery in browser — the new run's pill turns green and samples appear in the pivot table.
4. Score all checkpoints against the top30 centroid.
5. Record results in V23-EXPLORATION.md + AVATAR-LOG.md.
6. Close the corresponding Roxabi/lyra sub-issue with a result comment.

---

## Hardware limitations (unchanged from initial draft)

GPU: RTX 5070 Ti, 16 GB VRAM.

| Constraint | Budget | What it blocks |
|---|---|---|
| VRAM for Klein 4B FP8 + LoRA + latents + optimizer states | ~10-12 GB at rank 16, ~11-13 GB at rank 32 | Rank 128+, batch size >1, non-quantized Klein 4B, full Qwen3 TE training |
| Gradient checkpointing | Required on 16 GB | Adds ~30% training time vs no-checkpoint |
| Single GPU | No DDP | Can't scale batch size with gradient accumulation beyond current 1×4 |
| `ai-toolkit` Klein 4B support | `sd_trainer` + `arch: flux2_klein_4b` only | No native pivotal-only or TE-only variants |
| Pre-quantized Klein 4B base | `quantize: true` fuses to FP8 on load | Can't train in fp16/bf16 without spilling to system RAM |
| imageCLI text encoder loading | LoRA transformer weights only | Pivotal embeddings silently dropped (see section above) |

**What this means for v23.** The only unused training-side headroom on this machine is rank (up to ~64-96 before VRAM gets tight), steps (no hard limit, just wall clock), and dataset (swap between top30/top50/island0). Everything else — batch size, TE training, higher-precision base weights, pivotal inference — is gated by hardware or tooling, not config choices.

---

## Followups / open questions

1. **Update `V22-GENERATION.md:189`** — the "island0 averaged it out" framing is inaccurate (island0 is +0.01 vs top30, within noise). Rewrite the "Dataset size vs identity lock" section to say "island0 and top30 are equivalent at rank 16 + 2500 steps; face wins by +0.055 via 500 extra steps." Deferred until v23 results come in (to avoid double-editing if v23 reshapes the story).
2. **imageCLI pivotal tuning support** — tracked in [Roxabi/imageCLI#31](https://github.com/Roxabi/imageCLI/issues/31). Required before any future v24+ run that wants to test pivotal tuning. Estimated 4-8 hours of engineering.
3. **The stale dataset path in `train_lyra_klein4b.yaml`** — the old face config at `~/projects/archived/ai-toolkit/config/train_lyra_klein4b.yaml:19` still points to `/home/mickael/.agent/lyra/brand/lora-training-set` (pre-migration). The v23 configs use the new `.roxabi/forge` path. The old config is left alone for provenance.
4. **v23 combiner run naming** — `v23e` is reserved for whatever-knobs-won. If all three win, it'll be `train_lyra_v23e_all.yaml`; if only rank + island0 win, `train_lyra_v23e_rank_island0.yaml`; etc. Name decided after scoring, not upfront.
5. **Scoring infrastructure** — `score_v22_1024.py` was written for the 48-config matrix. For v23 checkpoint scoring we need a simpler wrapper that takes a single LoRA path and outputs a single JSON. May need a small script.
6. **Noise budget.** Each v23 run is a single seed. If results are borderline (0.01 deltas), we can't distinguish signal from run-to-run noise. Re-running any borderline config with a different seed is a ~3 h stretch goal.

---

## Version log

- **2026-04-05 (initial draft, superseded)** — first version bundled all four knobs into a single `train_lyra_v23_maxparams.yaml` run. Problem flagged during review: no attribution on any of the knobs, and pivotal tuning wasn't verified for inference compatibility.
- **2026-04-05 (current)** — rewrote as three isolated attribution runs after:
  - Pulling the real V22-1024 centroid numbers from `scores_1024.json` (revealed the `face` > `island0` > `top30` ordering and the +0.055 step-count effect)
  - Verifying pivotal tuning is broken at inference in imageCLI (Flux2KleinPipeline lacks `TextualInversionLoaderMixin`)
  - Dropping pivotal from v23 and filing a separate imageCLI issue
  - Confirming the run selection with the user (v23a + v23c + v23d + conditional v23e)
