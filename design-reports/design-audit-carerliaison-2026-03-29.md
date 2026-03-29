# Design Audit: carerliaison.com
**Date:** 2026-03-29
**Scope:** Full site (single-page landing)
**Viewport:** 1728px (desktop, Retina 2x)

---

## Headline Scores

| Metric | Grade |
|--------|-------|
| **Design Score** | **B** |
| **AI Slop Score** | **A** |

---

## Phase 1: First Impression

- **The site communicates** quiet competence and genuine empathy. It feels like someone who actually understands caring built this, not a marketing team.
- **I notice** the hero pairing of emotional headline + working product mockup is immediately effective. The phone showing a real journal entry (Rose/Bud/Thorn) makes the product tangible within 2 seconds.
- **The first 3 things my eye goes to are:** (1) "alone." in teal italic, (2) the phone mockup with colored cards, (3) the CTA button. These feel intentional.
- **If I had to describe this in one word:** **Warm.**

The site passes the gut check. It does NOT look AI-generated or template-driven. The copy has real voice, the product mockups are specific (not generic screenshots), and the visual hierarchy is clear. The warm off-white background with teal accents creates a tone that is professional but not clinical — exactly right for carers.

---

## Phase 2: Design System (Inferred)

### Fonts (3 families -- good)
| Font | Role | Count |
|------|------|-------|
| DM Sans | Body, UI | 210 |
| Inter | Secondary UI, cards | 128 |
| DM Serif Display | Display headings | 30 |

**Verdict:** Clean type system. DM Serif Display for emotional weight, DM Sans for warmth, Inter for data/UI. No issues here.

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| Teal (primary) | `#008080` / `rgb(0,128,128)` | 64 text uses |
| Warm gray (body) | `#4A4A48` / `rgb(74,74,72)` | 149 text uses |
| Mid gray | `#6B6B68` / `rgb(107,107,104)` | 34 text uses |
| Dark | `#0F172A` / `rgb(15,23,42)` | 31 text uses |
| Off-white (bg) | `#F6F5EF` | Page background |
| Teal pale | `#E6F5F5` | 13 background uses |
| White | `#FFFFFF` | 18 background uses |
| Accent teal | `#0891B2` | 12 text uses |

**Verdict:** Cohesive warm-teal palette. Well under 12 unique non-gray colors. Consistently warm neutrals. The two teal values (`#008080` and `#0891B2`) are close but slightly different -- could be unified.

### Heading Scale
| Tag | Size | Weight |
|-----|------|--------|
| h1 | 57.6px | 700 |
| h2 | 41.6px (x5), 44.8px (x1) | 700 |
| h3 | 25.6px (x1), 19.2px (x3), 17.6px (x3) | 700 |
| h4 | 15.2px (x4) | 600 |

**Issue:** One h2 is 44.8px while the rest are 41.6px (inconsistent). Three h3 sizes exist (25.6, 19.2, 17.6) -- not following a single scale. h4 at 15.2px is smaller than body text (16px).

### Spacing
- Base padding: `2rem` horizontal, `6rem` vertical on sections
- Max content width: 1200px
- Grid gap: consistent `4rem` between sections
- Phone mockup sections use CSS Grid with `1fr 1fr` at desktop

---

## Phase 3: Page-by-Page Audit

### Section 1: Navigation
**Grade: A-**

- Fixed nav with blur backdrop -- polished
- Clean hierarchy: brand left, links center, CTA right
- Teal CTA button stands out well
- `!important` overrides on `.nav-cta` suggest specificity issues (minor code smell)
- **Missing:** No hamburger menu for mobile. Nav links will overflow on small screens
- **Missing:** No `focus-visible` on nav links (accessibility issue)

### Section 2: Hero
**Grade: A**

- Exceptional. The two-column layout (emotional copy left, product mockup right) is best-in-class for this type of product.
- Copy has real voice -- not generic SaaS speak
- Phone mockup shows actual product content (Rose/Bud/Thorn journal), not a placeholder
- Entity tags ("OT Session", "Building Blocks") add credibility
- Lia's Reflection at the bottom demonstrates the AI value prop without saying "AI-powered"
- CTA is clear: "Take the 2-Minute Check-In"
- Trust markers: "Free to try. NDIS-aligned. Voice or text"

### Section 3: The Reality (Problem)
**Grade: A-**

- Strong emotional copy that validates the carer experience
- Stats grid (2.65M, 1 in 3, 40hrs+, 72%) adds credibility
- Pull quote in teal border-left adds human voice
- **Minor:** The quote attribution ("What we hear from carers") is vague -- a real name (even anonymized) would be more powerful
- **Minor:** Stats cards have very subtle backgrounds -- could use slightly more visual distinction

### Section 4: The Journal (Solution)
**Grade: B+**

- Phone mockup with Chat with Lia conversation is effective
- Feature cards (Voice or Text, Reflection That Sees You, Psychology You Can Use) explain the value well
- **Issue:** The section heading and feature cards are right-aligned while the phone is left -- creates an asymmetric layout that works but the text column feels slightly disconnected from the phone
- **Issue:** Feature cards use icon-in-colored-circle pattern (very slight AI slop indicator), but the copy saves it by being specific and non-generic

### Section 5: What It Gives Back (How It Works)
**Grade: B**

- 4-step numbered flow (Talk, Reflect, Patterns, Knowledge) is clear
- Insights phone mockup with mood emojis and "Top Patterns" is excellent product storytelling
- **Issue:** The numbered steps are centered text -- creates a visual break from the left-aligned style used in every other section. Feels like a different page.
- **Issue:** The step arrows are very faint and small -- barely noticeable
- **Issue:** Steps 1-4 should have connector lines or visual flow to the phone mockup, but they float disconnected from it

### Section 6: The Vision (To-Done / Agents)
**Grade: B+**

- "You journal. AI captures. Agent acts." flow is smart product storytelling
- Shift Handover phone mockup is the strongest demonstration on the page -- shows concrete value (medications, meals, mood, notes for next carer)
- Captured data cards (Sleep & Body State, Meal Needs, Daily Handover Brief) explain what the system extracts
- **Issue:** "You journal" step in the flow partially faded/transparent -- likely GSAP animation not fully completing
- **Issue:** The flow arrows between steps are nearly invisible

### Section 7: NDIS Aligned (Trust)
**Grade: B+**

- Smart positioning: maps product to existing funding categories
- Checkmark list items are clear and specific
- CSIRO framework mention adds institutional credibility
- Category tags (CSIRO AI-AT, Cat 05, Cat 07) are a nice touch
- **Minor:** Could benefit from a visual element (logo, certification badge) to strengthen trust

### Section 8: Final CTA
**Grade: F** (CRITICAL BUG)

- **The entire CTA section is invisible.** h2, paragraph, and button all have `opacity: 0`
- GSAP ScrollTrigger animation with `once: true` fails to fire
- Despite having `immediateRender: false` on all tweens, the timeline never triggers
- This means the most important conversion element on the page is completely blank -- visitors see a large empty teal rectangle
- The decorative background curves are visible but all content is hidden

### Section 9: Footer
**Grade: B**

- Clean, minimal footer with brand, nav links, email, copyright
- Appropriate for a landing page
- **Missing:** No social links
- **Minor:** Footer links (About, Privacy, Contact) likely lead nowhere (single-page site)

---

## Phase 4: Interaction Flow Review

### Flow: Landing -> CTA Click
- **Response feel:** Hero CTA button click navigates to `/assessment.html` (assumed) -- no loading state needed
- **Transition quality:** GSAP scroll-triggered animations are smooth when they work. The staggered card reveals in Hero and Journal sections feel intentional and polished
- **Feedback clarity:** Hover states exist on all buttons (color shift + slight transform)
- **Critical failure:** Final CTA is invisible, breaking the primary conversion path at page bottom

### Flow: Scroll-through experience
- **Hero animation:** Phone mockup slides up with cards revealing sequentially -- tells a clear story of "AI processes your journal entry"
- **Journal chat animation:** Messages appear from alternating sides -- mimics a real conversation
- **Insights animation:** Mood dots pop in across the week -- satisfying and communicative
- **CTA animation:** Completely broken -- blank section

---

## Phase 5: Cross-Page Consistency

Single-page site. Consistency observations:
- Section eyebrow labels (THE REALITY, THE JOURNAL, etc.) are consistent: teal caps with dash prefix
- Heading style (DM Serif Display, dark) is consistent across all sections
- Body text color and size are consistent
- Phone mockup style is consistent across all 4 instances
- CTA button style is consistent (2 instances: hero and journal mid-section)
- **Inconsistency:** "How It Works" section switches to centered text, breaking the left-aligned pattern
- **Inconsistency:** The To-Done flow section uses a different background (olive/sage) vs other sections' off-white

---

## Findings Summary

### FINDING-001: CTA Section Completely Invisible (HIGH)
- **Category:** Interaction States
- **Impact:** HIGH -- primary conversion element is hidden
- **Description:** The final CTA section (`#cta`) has all content at `opacity: 0`. The GSAP ScrollTrigger animation with `once: true` fails to fire, leaving h2, paragraph text, and button invisible. Visitors see an empty teal rectangle.
- **Fix:** Add `immediateRender: false` to the timeline itself, or add a fallback that sets opacity to 1 after a timeout. Alternatively, consider not animating the CTA section at all -- it should always be visible.

### FINDING-002: No Focus-Visible Styles (HIGH)
- **Category:** Interaction States / Accessibility
- **Impact:** HIGH -- keyboard users cannot see where focus is
- **Description:** Zero `:focus` or `:focus-visible` styles anywhere in the CSS. No `outline` rules. This is a WCAG 2.1 Level AA failure (2.4.7 Focus Visible).
- **Fix:** Add `*:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }` as a baseline.

### FINDING-003: No Mobile Navigation (HIGH)
- **Category:** Responsive Design
- **Impact:** HIGH -- nav links overflow on mobile
- **Description:** No hamburger menu, no `display: none` on nav links at mobile breakpoints. The 5 nav items will overflow horizontally on screens under ~768px.
- **Fix:** Add a hamburger toggle with a slide-out or dropdown nav for mobile.

### FINDING-004: No OG Image Meta Tag (MEDIUM)
- **Category:** Content Quality
- **Impact:** MEDIUM -- shared links on social media will have no preview image
- **Description:** `og:image` meta tag is missing. When the URL is shared on Twitter, LinkedIn, Slack, etc., no preview image appears.
- **Fix:** Add `<meta property="og:image" content="https://carerliaison.com/og-image.jpg">` with a designed 1200x630 image.

### FINDING-005: Inconsistent Heading Sizes (MEDIUM)
- **Category:** Typography
- **Impact:** MEDIUM -- undermines visual consistency
- **Description:** One h2 is 44.8px while the rest are 41.6px. Three different h3 sizes exist (25.6px, 19.2px, 17.6px). h4 at 15.2px is smaller than body text (16px).
- **Fix:** Normalize h2 to a single size. Use at most 2 h3 sizes. Increase h4 to at least 16px.

### FINDING-006: No Lazy Loading on Images (MEDIUM)
- **Category:** Performance
- **Impact:** MEDIUM -- currently 0 images so no real impact, but the infrastructure is missing
- **Description:** No `img` tags on the page at all (phone mockups are CSS-only). If images are added later, no lazy loading pattern exists.
- **Fix:** When images are added, include `loading="lazy"` and `width`/`height` attributes.

### FINDING-007: "How It Works" Centered Text Breaks Pattern (MEDIUM)
- **Category:** Visual Hierarchy
- **Impact:** MEDIUM -- feels like a different site mid-scroll
- **Description:** The numbered steps (1-4) use `text-align: center` while every other section is left-aligned. This creates a jarring visual break.
- **Fix:** Left-align the steps or present them as a vertical timeline that visually connects to the phone mockup.

### FINDING-008: To-Done Flow Elements Partially Invisible (MEDIUM)
- **Category:** Interaction States
- **Impact:** MEDIUM -- content appears broken
- **Description:** In the "THE VISION" section, the first step "You journal" and its description appear faded/transparent, likely from a GSAP animation not completing.
- **Fix:** Ensure all ScrollTrigger animations in this section fire reliably. Consider adding CSS fallback `opacity: 1` rules.

### FINDING-009: Two Teal Color Values (POLISH)
- **Category:** Color & Contrast
- **Impact:** POLISH
- **Description:** `#008080` (CSS variable `--teal`) and `#0891B2` (used in some elements from Pencil design) coexist. Subtle but creates two slightly different teals.
- **Fix:** Standardize on one teal. `#0891B2` is slightly more vibrant and modern.

### FINDING-010: No `transition: all` Audit (POLISH)
- **Category:** Motion & Animation
- **Impact:** POLISH
- **Description:** Several elements use specific transition properties (good), but no explicit `transition` on interactive card elements means hover states snap rather than ease.
- **Fix:** Add `transition: transform 0.2s ease, box-shadow 0.2s ease` to cards and interactive elements.

### FINDING-011: Footer Links Dead (POLISH)
- **Category:** Content Quality
- **Impact:** POLISH
- **Description:** About, Privacy, Contact links in footer likely go nowhere (no separate pages exist).
- **Fix:** Either create these pages or link to sections/anchors within the landing page.

### FINDING-012: 10 Undersized Touch Targets (MEDIUM)
- **Category:** Interaction States
- **Impact:** MEDIUM
- **Description:** 10 interactive elements (links, buttons) have either width or height below 44px minimum.
- **Fix:** Ensure all clickable elements have at least 44x44px hit area (can use padding to achieve this without changing visual size).

---

## Per-Category Grades

| Category | Grade | Notes |
|----------|-------|-------|
| Visual Hierarchy | **A-** | Strong focal points, clear section hierarchy, intentional white space |
| Typography | **B** | Good font choices, but inconsistent heading sizes |
| Spacing & Layout | **B+** | Consistent grid, good vertical rhythm, slight centered-section break |
| Color & Contrast | **A-** | Cohesive warm palette, two teal values to unify |
| Interaction States | **D** | CTA invisible, no focus-visible, undersized targets |
| Responsive | **D** | No mobile nav, untestable at mobile widths, breakpoints exist but sparse |
| Content Quality | **A** | Exceptional copy, specific microcopy, genuine voice |
| AI Slop | **A** | Zero AI slop. Unique voice, no purple gradients, no 3-column icon grids |
| Motion | **B** | Intentional choreography when it works, but CTA/Vision animations break |
| Performance | **A-** | 271ms DOMContentLoaded, 1.5s full load, deferred scripts, no images |

### Weighted Design Score Calculation
```
Visual Hierarchy (15%): A- = 3.7 × 0.15 = 0.555
Typography (15%):       B  = 3.0 × 0.15 = 0.450
Spacing (15%):          B+ = 3.3 × 0.15 = 0.495
Color (10%):            A- = 3.7 × 0.10 = 0.370
Interaction (10%):      D  = 1.0 × 0.10 = 0.100
Responsive (10%):       D  = 1.0 × 0.10 = 0.100
Content (10%):          A  = 4.0 × 0.10 = 0.400
AI Slop (5%):           A  = 4.0 × 0.05 = 0.200
Motion (5%):            B  = 3.0 × 0.05 = 0.150
Performance (5%):       A- = 3.7 × 0.05 = 0.185

Total: 3.005 → B
```

---

## AI Slop Score: A

**Verdict:** This site has zero AI slop. It would pass as designer-made at any studio.

Specifically:
- No purple/violet/indigo gradients
- No 3-column icon-in-circle feature grids (the feature cards exist but have specific, non-generic copy)
- Not centered-everything (left-aligned with intentional hierarchy)
- No decorative blobs, floating circles, or wavy dividers (the CTA background curves are subtle and teal, not generic)
- No emoji in headings or as design elements (emoji are used only in the Insights phone mockup, which is product content)
- No "Unlock the power of..." generic hero copy
- No cookie-cutter section rhythm
- The copy alone disqualifies it from AI slop -- it's too specific, too emotional, and too informed by lived experience

---

## Quick Wins (Top 5)

1. **Fix CTA section opacity** -- Add CSS fallback `opacity: 1` and/or simplify the ScrollTrigger. 15 minutes. Converts the biggest dead zone on the page into the conversion driver it should be.

2. **Add focus-visible styles** -- One CSS rule: `*:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }`. 5 minutes. Fixes WCAG compliance.

3. **Add mobile hamburger nav** -- Hide nav links behind a toggle at `max-width: 768px`. 30 minutes. The single biggest responsive gap.

4. **Add OG image** -- Design a 1200x630 card and add the meta tag. 20 minutes. Every share of the URL becomes a visual advertisement.

5. **Normalize heading sizes** -- Set h2 to one size, h3 to one size, h4 >= 16px. 10 minutes. Tightens the type system.

---

## PR Summary

> Design review found 12 issues (3 high, 5 medium, 4 polish). Design score: B. AI slop score: A. Critical: final CTA section completely invisible due to GSAP animation bug. Top priorities: fix CTA visibility, add focus-visible styles, add mobile nav.
