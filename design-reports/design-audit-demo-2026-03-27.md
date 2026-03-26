# Design Audit: Carer Journal Demo
**Date:** 2026-03-27
**URL:** localhost:3457/demo/ (carerliaison.com/demo/)
**Scope:** Full site (single-page app — landing + chat + reflection card)
**Mode:** Standard

---

## Headline Scores

| Metric | Grade |
|--------|-------|
| **Design Score** | **C+** |
| **AI Slop Score** | **D** |

---

## First Impression

- The site communicates **warmth and safety** — it feels like a journal, not a SaaS product.
- I notice **everything is centered with uniform visual weight** — nothing creates a strong entry point beyond the emoji.
- The first 3 things my eye goes to: **(1) yellow heart emoji, (2) headline, (3) green CTA button.** The emoji is doing too much work as the visual anchor.
- If I had to describe this in one word: **gentle** — almost too gentle. It whispers when it should warmly embrace.

---

## Inferred Design System

**Fonts:**
- DM Sans (44 elements) — body/UI
- DM Serif Display (3 elements) — headings
- ✅ Good: 2 font families, clear hierarchy

**Color Palette:**
- Primary: `#008080` (teal)
- Dark: `#1a1a1a`
- Warm gray: `#4a4a48`
- Mid gray: `#6b6b68`
- Off-white: `#f8f8f6`
- Rose/Bud/Thorn semantic colors
- Entity colors (blue, purple, amber, green, pink)
- ⚠️ 15+ unique colors — slightly over the 12 threshold

**Heading Scale:**
- h1: 30px / 700 / DM Serif Display
- No h2-h6 present
- ⚠️ Only one heading level used

**Spacing:**
- Uses 4/8px base scale (good)
- Border-radius: 8px, 12px, 16px, 20px scale + 999px pills (good hierarchy)

**Performance:**
- DOM Interactive: 98ms ✅ Excellent
- DOM Complete: 99ms ✅ Excellent

---

## Findings

### FINDING-001: Emoji as primary visual anchor (AI Slop)
**Impact:** High | **Category:** AI Slop Detection
- The 40px yellow heart emoji is the dominant visual element above the fold
- Emoji as design elements is a classic AI slop pattern
- I think a warm illustration, icon, or even just removing it would feel more intentional — because emoji as visual anchors signal "AI made this" to anyone who's seen a few generated sites

### FINDING-002: Centered-everything layout (AI Slop)
**Impact:** High | **Category:** AI Slop Detection / Visual Hierarchy
- 17 elements have `text-align: center`
- The entire page is center-aligned: heading, sub-copy, features, CTAs, footer
- This is the #1 AI layout tell — real designers create asymmetry and visual tension
- What if the intro hero was left-aligned with the journal input offset to the right? That would immediately feel more designed and less template-y

### FINDING-003: Feature pills with emoji icons (AI Slop)
**Impact:** Medium | **Category:** AI Slop Detection
- Four feature pills with emoji icons (🌹 🧠 🎙️ 🔒) centered in a row
- This is dangerously close to the "icon + label grid" anti-pattern
- The pills themselves are well-styled, but the emoji icons and perfect symmetry reduce trust

### FINDING-004: Colored left-border on RBT cards (AI Slop)
**Impact:** Medium | **Category:** AI Slop Detection
- `.rbt-card { border-left: 4px solid; }` — colored left border on every Rose/Bud/Thorn card
- This is on the AI slop blacklist specifically
- I wonder if a top accent stripe, or just the background tint alone, would communicate the same hierarchy without triggering the pattern

### FINDING-005: `transition: all` on 137 elements
**Impact:** High | **Category:** Motion & Animation
- 137 elements use `transition: all` — this animates every property change including layout properties (width, height, padding)
- This causes janky animations and potential performance issues
- Should explicitly list only the properties being animated (e.g., `transition: background 0.2s, color 0.2s`)

### FINDING-006: No `prefers-reduced-motion` support
**Impact:** Medium | **Category:** Motion & Animation
- No `@media (prefers-reduced-motion)` rule found
- Users with vestibular disorders or motion sensitivity get no accommodation
- The page has multiple animations (fadeUp, bounce, pulse) that should be disabled

### FINDING-007: Prompt chips too small for touch (33px height)
**Impact:** Medium | **Category:** Interaction States / Responsive
- Prompt chips are 33px tall — below the 44px minimum touch target
- On mobile, these are the primary interaction elements
- Padding should increase to meet the 44px minimum

### FINDING-008: "Save entry" button too small (31px)
**Impact:** Medium | **Category:** Interaction States
- Save entry button in reflection footer is only 31px tall
- Below the 44px touch target minimum

### FINDING-009: Footer links too small (16-27px)
**Impact:** Polish | **Category:** Interaction States
- Nav "Carer Liaison" link: 27px height
- Footer "Carer Liaison" link: 16px height
- Both below 44px touch target

### FINDING-010: `outline: none` on textarea without proper replacement
**Impact:** Medium | **Category:** Interaction States
- `textarea.journal-input` has `outline: none`
- The `:focus` state uses `box-shadow` as a replacement — this is acceptable but the box-shadow is very subtle (`rgba(0,128,128,0.1)`)
- I think the focus ring should be more visible for keyboard users — `0.15` or `0.2` opacity would be safer

### FINDING-011: Mobile layout is stacked desktop, not mobile-designed
**Impact:** Medium | **Category:** Responsive Design
- On mobile, the CTA buttons disappear below the fold
- Features pills stack vertically but remain centered — feels like desktop compressed, not mobile-first
- The prompt chips work well on mobile (single column), but the hero section wastes vertical space

### FINDING-012: No mobile-specific media query for the reflection card
**Impact:** Medium | **Category:** Responsive Design
- The `@media (max-width: 480px)` rule only adjusts padding
- Reflection card text sizes, spacing, and the entity tags at bottom are not responsive
- Entity tags get clipped on mobile (visible in screenshot — "helplessnes" truncated)

### FINDING-013: Send button disabled state lacks clarity
**Impact:** Polish | **Category:** Interaction States
- Disabled send button: `opacity: 0.4; cursor: not-allowed`
- The 0.4 opacity makes it nearly invisible against the off-white background
- What if disabled was `opacity: 0.5` with a light gray background instead of teal?

### FINDING-014: H1 at 30px feels undersized for a hero
**Impact:** Medium | **Category:** Typography
- The main headline is 30px — for a landing page hero this is small
- On desktop at 1440px width, this reads like a section heading, not a page headline
- I think 36-42px on desktop (scaling down to 28-30px on mobile) would create the impact this copy deserves

### FINDING-015: Line-height on body is `normal` (not explicit)
**Impact:** Polish | **Category:** Typography
- `body { line-height: normal }` instead of an explicit value like `1.5`
- `normal` varies by browser (typically 1.1-1.2) — should be set explicitly

### FINDING-016: Reflection card contrast on entity tags
**Impact:** Polish | **Category:** Color & Contrast
- Entity tags in reflection footer use very small text (10px) with colored backgrounds
- At 10px, contrast ratios need to be even higher for legibility
- Tags like "people" (blue on light blue) may not meet WCAG AA for text this small

---

## AI Slop Score: D

**Verdict:** The site has 4 distinct AI slop patterns present:
1. ❌ Emoji as design elements (heart as hero visual)
2. ❌ Centered everything
3. ❌ Feature pills with emoji icons (close to icon-in-circle grid)
4. ❌ Colored left-border on cards

**What saves it from an F:** The font choices are good (DM Sans + DM Serif Display is a real pairing), the color palette is cohesive and warm, the reflection card design shows genuine product thinking, and the copy is human and specific — not generic SaaS speak.

---

## Category Grades

| Category | Grade | Notes |
|----------|-------|-------|
| Visual Hierarchy | C | Everything centered, no focal point beyond emoji |
| Typography | B | Good pairing, but h1 undersized, body line-height not set |
| Spacing & Layout | B | Good 8px scale, radius hierarchy present |
| Color & Contrast | B | Cohesive palette, minor contrast concerns on small text |
| Interaction States | C | Touch targets too small, focus ring too subtle |
| Responsive | C | Stacked desktop on mobile, entity tags clipped |
| Content Quality | A | Excellent copy, specific and human, great prompt chips |
| AI Slop | D | 4 distinct patterns present |
| Motion | D | transition:all everywhere, no reduced-motion |
| Performance | A | Sub-100ms load, no external resources beyond fonts |

---

## Quick Wins (highest impact, lowest effort)

1. **Remove the heart emoji** — replace with nothing, or a subtle SVG mark. Instant AI slop reduction.
2. **Fix `transition: all`** — change to explicit properties on `.prompt-chip`, `.btn-mic`, `.demo-trigger`, `.btn-send`. Global find-replace.
3. **Add `prefers-reduced-motion`** — 5-line media query to disable all animations.
4. **Increase prompt chip padding** — `padding: 10px 16px` brings them to ~44px touch targets.
5. **Bump h1 to 36-40px on desktop** — one line CSS change, major hierarchy improvement.

---

## Deferred (cannot fix from source alone)

- Content in reflection card is AI-generated at runtime — card text quality/length varies per response
- Entity tag clipping depends on AI response content (number/length of tags)

---

## Summary

| Metric | Value |
|--------|-------|
| Total findings | 16 |
| High impact | 3 |
| Medium impact | 9 |
| Polish | 4 |
| Fixable from source | 14 |
| Deferred | 2 |
