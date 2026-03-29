# Motion & Animation Design Audit — Carer Liaison Landing Page

**Date:** 2026-03-29
**Scope:** All GSAP animations on `index.html`
**Focus:** Animation timing, easing, and consistency

---

## First Impression

The site communicates **care and professionalism**. The animations were trying too hard — 8 different easing functions, 3 different entrance patterns (slide-up, slide-sideways, scale-in), bounce easing on some elements but not others, and inconsistent stagger patterns. The animations didn't feel like one designer chose them — they felt layered on by iteration.

**Before: inconsistent. After: unified.**

---

## Motion Philosophy (Applied)

Every entrance animation now follows one rule:
- **Fade up with `power2.out`** — consistent easing, consistent direction
- **Small y offsets (8-15px)** — subtle, not dramatic
- **No bounce, no sideways, no scale-from-zero**
- **No stagger on groups** — elements appear together unless sequence is meaningful (chat messages, mood data)

---

## Findings & Fixes

### FINDING-001: `back.out` bounce easing in 8 places (High) — FIXED
- **Before:** Problem stats, journal chat messages, journal CTA, handover cards, trust badges, trust checkmarks, mood emoji, entity tags all used `back.out(1.2)` to `back.out(2.5)`
- **After:** All replaced with `power2.out`
- **Why:** Bounce/overshoot creates an artificial "playful" feel that undermines the serious, caring tone. DESIGN.md specifies ease-out for entering elements.

### FINDING-002: Horizontal slide animations (Medium) — FIXED
- **Before:** Journal chat messages slid `x: -30` / `x: 30`, trust features slid `x: 30`, Lia's reflection slid `x: -15`
- **After:** All converted to vertical `y` fade-ups
- **Why:** Everything else uses vertical movement. Horizontal outliers break spatial consistency.

### FINDING-003: `scale: 0` pop-from-nothing (Medium) — FIXED
- **Before:** Entity tags, mood emoji, trust checkmarks all scaled from 0 (invisible → full size)
- **After:** Replaced with opacity fades (+ small y offset where appropriate)
- **Why:** Scale-from-zero is a very recognizable "template animation" pattern. It draws too much attention to the animation itself.

### FINDING-004: Inconsistent stagger patterns (Medium) — FIXED
- **Before:** Different stagger values (0.05, 0.08, 0.1, 0.12, 0.15) across sections
- **After:** Removed stagger from most groups (solution cards, agent cards, trust badges, trust features, to-done steps). Only kept stagger on mood data sequence (0.06) — the only place where sequential appearance tells a story.
- **Why:** Stagger on 3-4 items creates visible sequential popping that feels janky, not smooth.

### FINDING-005: Phone entrance too slow at 0.9s (Medium) — FIXED
- **Before:** Journal, insights, and handover phones all used `duration: 0.9` with `y: 80` and `scale: 0.95`
- **After:** All phones use `duration: 0.6` with `y: 40`, no scale transform
- **Why:** 0.9s is nearly a full second — sluggish. 0.6s matches the hero phone and feels responsive.

### FINDING-006: Counter animation too slow at 1.8s (Polish) — FIXED
- **Before:** Stat numbers counted up over 1.8 seconds
- **After:** Reduced to 1.0 seconds
- **Why:** The counting effect should feel snappy, not labored.

### FINDING-007: CTA button infinite pulse (Medium) — FIXED
- **Before:** `scale: 1.03, repeat: -1, yoyo: true` — perpetual breathing animation
- **After:** Simple one-time fade-up entrance, then static
- **Why:** Infinite pulsing is a dark pattern that screams "click me". The CTA should stand on its own through design hierarchy, not attention-grabbing motion.

### FINDING-008: Broken CSS selectors causing GSAP warnings (Polish) — FIXED
- **Before:** `.phone-mood-card:first-child` and `.phone-mood-card:nth-child(2)` selectors didn't match because the first child of the container was `.phone-insight-pills`, not a mood card
- **After:** Used `querySelectorAll` with array indexing for reliable element targeting
- **Why:** Broken selectors caused console warning spam and missed animations.

### FINDING-009: Section text entrance inconsistency (Polish) — FIXED
- **Before:** Different y-offsets (20-30px) and durations (0.5-0.7s) across section headings, with `power3.out` on hero but no explicit easing on scroll sections
- **After:** All section text entrances normalized: eyebrow `y:12, 0.4s`, title `y:15, 0.5s`, subtitle `y:12, 0.4s`, all with `power2.out`
- **Why:** Consistent rhythm across all sections creates a cohesive feel.

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Easing functions used | 8 (`power3.out`, `power2.out`, `power2.inOut`, `back.out(1.2)`, `back.out(1.3)`, `back.out(2)`, `back.out(2.5)`, `sine.inOut`) | 2 (`power2.out`, `power2.inOut` for glow only) |
| Bounce animations | 8 instances | 0 |
| Horizontal slides | 3 instances | 0 |
| Scale-from-zero | 4 instances | 0 |
| Stagger groups | 8 | 2 (mood data + typing dots — both intentional) |
| Max entrance duration | 0.9s | 0.6s |
| Infinite animations | 1 (CTA pulse) | 0 entrance; feature highlights loop by design |
| Console warnings | ~40 per load | 0 |

**Motion score: C- → B+**

The animations now feel like one designer chose them. Every element fades up the same way, with the same easing, at similar speeds. The motion supports the content rather than competing with it.
