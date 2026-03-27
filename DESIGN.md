# Carer Liaison — Design System

Source of truth for all screens in `carerliaison.pen` and code implementations (`index.html`).

Last updated: 2026-03-27 (post-audit).

---

## Foundations

### Frame Sizes

| Platform | Width | Height | Notes |
|----------|-------|--------|-------|
| Mobile | 393px | 852px | iPhone 14/15 standard |
| Desktop | 1440px | 900px | Standard laptop viewport |

All mobile screens must use 393×852. No exceptions.

### Color Tokens

Use variables — never hardcode hex values in screens.

**Surfaces:**
| Token | Value | Usage |
|-------|-------|-------|
| `$bg-page` | #F9FAFB | Page background (all screens) |
| `$bg-card` | #F1F5F9 | Card/section background |
| `$bg-elevated` | #FFFFFF | Elevated cards, modals, sheets |

**Accent:**
| Token | Value | Usage |
|-------|-------|-------|
| `$accent` | #0891B2 | Primary buttons, active nav, links |
| `$accent-gradient-end` | #0E7490 | Gradient hero cards (225° rotation with `$accent`) |
| `$accent-light` | #0891B215 | Accent tint backgrounds (8% opacity) |

**Text:**
| Token | Value | Usage |
|-------|-------|-------|
| `$text-primary` | #0F172A | Headings, body text |
| `$text-secondary` | #475569 | Subtitles, descriptions |
| `$text-tertiary` | #94A3B8 | Timestamps, labels, metadata, inactive nav |
| `$text-muted` | #CBD5E1 | Placeholder text, disabled states |
| `$text-on-accent` | #FFFFFF | Text on teal/accent backgrounds |
| `$text-on-accent-muted` | #FFFFFFCC | Secondary text on accent (80% opacity) |
| `$text-on-accent-subtle` | #FFFFFFB3 | Tertiary text on accent (70% opacity) |

**Semantic — Body State:**
| Token | Value | Usage |
|-------|-------|-------|
| `$body-great` | #059669 | Body state: great |
| `$body-calm` | #0891B2 | Body state: calm |
| `$body-neutral` | #94A3B8 | Body state: neutral |
| `$body-resistant` | #F59E0B | Body state: resistant |
| `$body-difficult` | #EF4444 | Body state: difficult |

**Semantic — Journal (Rose/Bud/Thorn):**
| Token | Value | Usage |
|-------|-------|-------|
| `$rose` | #F43F5E | Rose (what went well) |
| `$rose-light` | #FFF1F2 | Rose section background |
| `$bud` | #10B981 | Bud (looking forward to) |
| `$bud-light` | #ECFDF5 | Bud section background |
| `$thorn` | #F59E0B | Thorn (what was challenging) |
| `$thorn-light` | #FFFBEB | Thorn section background |

**Semantic — Status:**
| Token | Value | Usage |
|-------|-------|-------|
| `$success` | #059669 | Success states, completed |
| `$crisis-red` | #DC2626 | Crisis mode, urgent alerts |
| `$crisis-bg` | #FEF2F2 | Crisis mode page background |
| `$journal-purple` | #8B5CF6 | Journal accent |
| `$journal-purple-light` | #F5F3FF | Journal tint background |
| `$ndis-green` | #78BE20 | NDIS-related badges |

**Borders:**
| Token | Value | Usage |
|-------|-------|-------|
| `$border-subtle` | #E2E8F0 | Card borders, dividers |
| `$border-strong` | #CBD5E1 | Input borders, emphasized dividers |

### Typography

**Font families (3 only — no others permitted):**

| Font | Role | Usage |
|------|------|-------|
| **DM Sans** | Display | Page titles, hero headings, stat numbers, tab bar labels |
| **Inter** | UI | Section headings, card titles, body text, captions, buttons, labels |
| **JetBrains Mono** | Monospace | Metric values where tabular alignment matters |

No Space Grotesk, no system fonts. DM Sans and Inter are the only two text fonts.

**Type scale:**

| Role | Font | Size | Weight | Line Height | Usage |
|------|------|------|--------|-------------|-------|
| Page Title | DM Sans | 28px | Bold (700) | 1.2 | Screen titles ("Goals", "Budget") |
| Desktop Title | DM Sans | 32px | Bold (700) | 1.2 | Desktop page titles |
| Section Heading | Inter | 18px | Semibold (600) | 1.3 | Section headers ("Today's Schedule") |
| Card Title | Inter | 16px | Semibold (600) | 1.4 | Card headings, list item titles |
| Body | Inter | 14px | Regular (400) | 1.5 | Descriptions, paragraph text |
| Caption | Inter | 12px | Regular (400) | 1.4 | Timestamps, metadata, labels |
| Overline | Inter | 11px | Medium (500) | 1.3 | Category labels, all-caps tags |
| Tab Label | DM Sans | 10px | Medium/Semi (500–600) | 1.3 | Bottom nav tab labels |
| Stat Number | DM Sans | 24–64px | Bold (700) | 0.85–1.0 | Hero card metrics, counters |

### Spacing Scale

Base unit: 4px. Use multiples only.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight inline spacing, tab icon-to-label gap |
| sm | 8px | Between related elements |
| md | 12px | Card internal padding (compact), section gap |
| base | 16px | Standard gap, card padding |
| lg | 20px | Section separation |
| xl | 24px | Page horizontal padding, hero card padding |
| 2xl | 32px | Major section breaks |

### Corner Radius

| Usage | Radius |
|-------|--------|
| Cards, containers | 12px |
| Buttons, inputs | 8px |
| Pills, badges, tags | 16px (full-round) |
| Hero gradient cards | 16px |
| Tab bar pill (outer) | 36px |
| Tab bar items (inner) | 26px |
| Avatar circles | 50% |

### Icons

All icons use **Lucide** icon set at consistent sizes:

| Context | Size | Color |
|---------|------|-------|
| Status bar (signal, wifi, battery) | 16×16 | `$text-primary` |
| Tab bar navigation | 18×18 | `$text-on-accent` (active) / `$text-tertiary` (inactive) |
| Header action icons | 24×24 | `$text-secondary` |
| Back arrow | 24×24 | `$text-primary` |
| Card inline icons | 16–20px | Contextual |
| Button icons | 18×18 | Matches button text color |

**Semantic icon mapping (Rose/Bud/Thorn):**
| Concept | Icon | Color |
|---------|------|-------|
| Rose (what went well) | `flower-2` | `$rose` |
| Bud (looking forward to) | `sprout` | `$bud` |
| Thorn (what was challenging) | `leaf` | `$thorn` |

**Category icon mapping (Insights panel):**
| Category | Icon |
|----------|------|
| People | `user` |
| Wins | `trophy` |
| Triggers | `zap` |
| Goals | `target` |
| Services | `building-2` |

---

## Mobile Screen Layout

Every mobile screen follows this vertical structure:

```
┌─────────────────────────┐
│ Status Bar (54px)       │  ← Time left, signal/wifi/battery right
├─────────────────────────┤
│ Header Bar (56px)       │  ← Back arrow + title + action icons
├─────────────────────────┤
│                         │
│ Content Area            │  ← Scrollable, padding 24px horizontal
│ (fill remaining)        │
│                         │
├─────────────────────────┤
│ Tab Bar (~95px)         │  ← 5-tab pill navigation
└─────────────────────────┘
```

**Content area padding:** 24px left/right (page-level), 16px top after header.

**Scroll behavior:** Content area scrolls vertically. Status bar, header, and tab bar are fixed.

---

## Components

### Status Bar

- Time: "9:41" (left), Inter 16px Semibold
- Signal, WiFi, Battery lucide icons (right), 16×16, `$text-primary`
- Height: 54px
- Padding: 0 24px
- Present on all mobile screens

### Header Bar

| Element | Position | Style |
|---------|----------|-------|
| Back arrow (if sub-page) | Left | `arrow-left` lucide, 24px, `$text-primary` |
| Page title | Left (after back arrow or flush left) | DM Sans 28px Bold |
| Action icons | Right | lucide 24px, `$text-secondary`, max 2 icons |

No icons prefixed to titles (no gear icon before "Settings", no heart before "Wellness"). Keep titles text-only.

### Bottom Navigation Bar (Mobile)

**Standard configuration — 5 tabs:**

| Tab | Icon (lucide) | Screens |
|-----|---------------|---------|
| HOME | `house` | Dashboard, My Day |
| TIMELINE | `calendar-days` | Daily Log, Body State |
| GOALS | `target` | Goals, Care Plan |
| WELLNESS | `heart` | Carer Wellness |
| TEAM | `users` | Team, Shift Handover |

**Tab bar structure:**
- Container: frame, padding `[12, 21, 21, 21]`, width `fill_container`
- Pill: frame, cornerRadius 36, fill `$bg-elevated`, height 62, stroke 1px `$border-subtle`, padding 4
- Each tab: frame, cornerRadius 26, layout vertical, gap 4, `fill_container` width/height, centered
- Active tab: fill `$accent`, icon/label `$text-on-accent`, fontWeight 600
- Inactive tab: no fill, icon/label `$text-tertiary`, fontWeight 500
- Font: DM Sans, 10px, letterSpacing 0.5
- Icons: lucide, 18×18

**Rules:**
- Same 5 tabs on every screen. No per-screen tab switching.
- Only the active tab for the current section gets the accent fill.
- Crisis Mode is the only exception — no tab bar (full-screen crisis state).

**Screens accessed via in-page navigation (not tabs):**
Budget, Medications, Schedule, Notifications, Settings, Documents, Service Search, Incidents, Plan Review, Evidence Capture — accessed from Home cards, profile menus, or contextual navigation within tab sections.

### Cards

**Standard card:**
- Background: `$bg-elevated` (#FFFFFF)
- Border: 1px `$border-subtle`
- Radius: 12px
- Padding: 16px
- Gap: 12px (between title and body)
- No colored left-border
- No drop shadow on mobile

**Hero/accent card:**
- Background: linear gradient `$accent` → `$accent-gradient-end` (225° rotation)
- Text: `$text-on-accent` / `$text-on-accent-muted`
- Radius: 16px
- Padding: 24px
- Stat overlay: `#00000020` fill, 12px radius, 12px 16px padding
- Usage: Top-of-page summary stats (Home, Budget, Team, Body State)
- Max one hero card per screen

**Semantic card (Rose/Bud/Thorn journal entries):**
- Background: `$rose-light` / `$bud-light` / `$thorn-light`
- Top accent border: 4px in `$rose` / `$bud` / `$thorn` — **NOT left border**
- Radius: 12px
- Padding: 14px 16px
- Gap: 8px
- Title: Inter 14px Semibold in semantic color
- Body: Inter 14px Regular, lineHeight 1.5

**Alert/banner card:**
- Background: `$crisis-bg`
- Layout: horizontal, gap 12, padding 16, aligned center
- Icon: `triangle-alert` lucide, 24×24, `$crisis-red`
- Content: vertical frame with title (Inter 14px Semibold) + description (Inter 13px Regular)
- Radius: 12px

### Buttons

**Primary:**
- Background: `$accent`
- Text: `$text-on-accent`, Inter 14px Semibold
- Icon: 18×18 lucide, `$text-on-accent`
- Radius: 8px
- Height: 44px minimum
- Layout: horizontal, gap 8, centered
- Full-width for primary page actions; inline for card actions

**Secondary:**
- Background: transparent
- Border: 1px `$accent`
- Text: `$accent`, Inter 14px Semibold
- Icon: 18×18 lucide, `$accent`
- Radius: 8px
- Height: 44px

**Ghost:**
- Background: transparent
- Text: `$accent`, Inter 14px Medium
- No border
- Height: 44px
- Used for tertiary actions, links

**Destructive:**
- Background: `$crisis-red`
- Text: white, Inter 14px Semibold
- Icon: `triangle-alert` lucide, white
- Radius: 8px
- Height: 44px
- Only for irreversible actions with confirmation

### Tags/Pills

- Background: token-light variant (e.g., `$accent-light`, `$bud-light`)
- Text: matching token color, Inter 12px Medium
- Radius: 16px (full pill)
- Padding: 4px 12px

### Lists

- Divider: 1px `$border-subtle`, full-width or inset 16px from left
- Row height: 56px minimum (44px touch target + padding)
- Left element: icon (24px) or avatar (40px)
- Chevron on right for navigable rows: `chevron-right` lucide, `$text-tertiary`

---

## UI Patterns

### Lia Chat Interface

Lia is the AI companion. Chat screens appear across Journal and general support flows.

**Chat layout:**
- Lia avatar: DM Sans Bold "L" or "Lia" in accent circle, top-left
- Lia name: DM Sans 22–24px Bold
- Message bubbles: `$bg-elevated` with `$border-subtle` border, 12px radius
- User messages: right-aligned, `$accent` background, white text
- Lia messages: left-aligned, white background
- Chat input: bottom-fixed, text area with send button

**Conversation flow (Journal):**
1. Lia greeting → open-ended prompt
2. User responds via text or voice
3. Lia generates Rose/Bud/Thorn reflection cards
4. Insights panel extracts People, Wins, Triggers, Goals, Services

### Body State Tracker

Five-state mood selector using emoji faces as functional content:

| State | Emoji | Color Token |
|-------|-------|-------------|
| Great | 😊 | `$body-great` |
| Calm | 😌 | `$body-calm` |
| Neutral | 😐 | `$body-neutral` |
| Resistant | 😤 | `$body-resistant` |
| Difficult | 😰 | `$body-difficult` |

These emoji are functional content (the UI itself), not decorative. They are the only permitted emoji in the design system — all other emoji usage is banned.

### Journal Entry Structure

Each journal entry contains:
1. **Entry header:** Date, mood state, title (e.g., "Tired but proud")
2. **Conversation transcript:** Lia + user messages
3. **Rose/Bud/Thorn reflection:** Three semantic cards with extracted insights
4. **Insights panel:** Auto-extracted entities (People, Wins, Triggers, Goals, Services)
5. **Similar entries:** Links to related past entries

---

## Screen Inventory

### Mobile Screens (393×852)

**Tab screens (5):**
| Screen | Active Tab | Purpose |
|--------|-----------|---------|
| Home Dashboard | HOME | Daily overview, hero stats, quick actions |
| Daily Log / Timeline | TIMELINE | Chronological care log |
| Journal | GOALS | Journal feed + entry creation |
| Goals | GOALS | Goal tracking and care plan |
| Team | TEAM | Support team and shift handover |

**Sub-screens (accessed contextually):**
| Screen | Accessed From | Purpose |
|--------|--------------|---------|
| My Day | HOME | Detailed daily view |
| Participant Profile | HOME | Care recipient details |
| Body State Tracker | TIMELINE | Mood and body state logging |
| Care Plan | GOALS | NDIS care plan management |
| Budget | HOME | NDIS budget tracking |
| Wellness | WELLNESS | Carer self-care tracking |
| Medications | HOME | Medication schedule and logging |
| Schedule | HOME | Appointment management |
| Notifications | Header icon | Alert center |
| Documents | HOME | Document storage |
| Service Search | HOME | Find NDIS services |
| Incidents | TIMELINE | Incident reporting and history |
| Plan Review | GOALS | NDIS plan review preparation |
| Evidence Capture | GOALS | Photo/video evidence for NDIS |
| Shift Handover | TEAM | Shift notes between carers |
| Journal Feed | GOALS | Past journal entries list |
| Journal Insights | GOALS | Patterns from journal data |
| Journal Entry Detail | GOALS | Full entry with RBT and insights |
| Crisis Mode | N/A (full-screen) | Emergency response — no tab bar |

### Desktop Screens (1440×900)

Mirror mobile functionality with sidebar navigation replacing bottom tabs. Sidebar contains the same 5 sections (Home, Timeline, Goals, Wellness, Team) plus user profile.

---

## Reusable Components (in `carerliaison.pen`)

All components live in the **"Design System — Components"** frame (node `oAi5g`). Insert instances with `type: "ref"` and override descendant text/icons as needed.

| Component | Node ID | Overridable Descendants |
|-----------|---------|------------------------|
| Status Bar | `urY1V` | `timeLabel` (content) |
| Tab Bar | `ehx4Z` | Tab fill/icon/label colors for active state |
| Header Bar | `aXMJ1` | `pageTitle` (content), `backIcon`, `actionIcon1`, `actionIcon2` |
| Standard Card | `nIbaR` | `cardTitle` (content), `cardBody` (content) |
| Hero Card | `hSsF3` | `heroTitle`, `heroDescription`, `statLabel`, `statValue` |
| Rose Card | `CPlxl` | `roseTitle` (content), `roseBody` (content) |
| Bud Card | `MggWG` | `budTitle` (content), `budBody` (content) |
| Thorn Card | `ypgvo` | `thornTitle` (content), `thornBody` (content) |
| Primary Button | `wvCZC` | `btnLabel` (content), `btnIcon` (iconFontName) |
| Secondary Button | `djR6T` | `btnLabel` (content), `btnIcon` (iconFontName) |
| Ghost Button | `sqxdD` | `btnLabel` (content) |
| Destructive Button | `1VZsp` | `btnLabel` (content), `btnIcon` (iconFontName) |
| Tag / Pill | `wS8Oj` | `tagLabel` (content); override fill for semantic variants |
| Alert Card | `iFDwQ` | `alertTitle` (content), `alertDesc` (content), `alertIcon` (iconFontName) |

### How to use components

```javascript
// Insert a Tab Bar instance into a screen
tabBar=I("screenId", {type:"ref", ref:"ehx4Z"})

// Change which tab is active (e.g., make TIMELINE active instead of HOME)
U(tabBar+"/homeTab", {fill:null})
U(tabBar+"/homeIcon", {fill:"$text-tertiary"})
U(tabBar+"/homeLabel", {fill:"$text-tertiary", fontWeight:500})
U(tabBar+"/timelineTab", {fill:"$accent"})
U(tabBar+"/timelineIcon", {fill:"$text-on-accent"})
U(tabBar+"/timelineLabel", {fill:"$text-on-accent", fontWeight:600})

// Insert a Standard Card and override its content
card=I("contentArea", {type:"ref", ref:"nIbaR"})
U(card+"/cardTitle", {content:"My Card Title"})
U(card+"/cardBody", {content:"Custom description."})

// Insert a Primary Button and override label + icon
btn=I("contentArea", {type:"ref", ref:"wvCZC"})
U(btn+"/btnLabel", {content:"Save Entry"})
U(btn+"/btnIcon", {iconFontName:"save"})

// Insert a semantic tag with custom color
tag=I("contentArea", {type:"ref", ref:"wS8Oj", fill:"$bud-light"})
U(tag+"/tagLabel", {content:"Looking Forward", fill:"$bud"})
```

---

## Anti-Patterns (Do Not Use)

1. **Colored left-border on cards** — use top accent border (4px) for semantic cards
2. **Emoji as visual anchors or bullet points** — use lucide icons instead. Only body state faces are permitted.
3. **Icons inside colored circles as section decoration** — icons should be plain, not wrapped in decorative shapes
4. **Different bottom nav tabs per screen** — same 5 tabs everywhere (Crisis Mode excepted)
5. **Hardcoded hex colors** — always use `$` variable tokens
6. **Non-standard frame sizes** — 393×852 mobile, 1440×900 desktop only
7. **`transition: all` in code** — list specific properties (`transform`, `opacity`)
8. **Drop shadows on mobile cards** — use 1px `$border-subtle` borders instead
9. **More than one hero/gradient card per screen** — one hero max, always at the top
10. **Red buttons for non-destructive actions** — "Log Session" uses `$accent`, not `$crisis-red`
11. **Space Grotesk or other unlisted fonts** — DM Sans, Inter, JetBrains Mono only
12. **Emoji in labels, headings, or descriptions** — text-only; icons via lucide

---

## Audit History

| Date | Action |
|------|--------|
| 2026-03-27 | Initial design system audit. Deleted 7 legacy screens, fixed 6 frame sizes (402×874 → 393×852), standardized 13 tab bars to 5-tab HOME/TIMELINE/GOALS/WELLNESS/TEAM, converted 112 Space Grotesk nodes to DM Sans/Inter, fixed 4 cornerRadius violations, stripped emoji from 27 text labels, replaced 17 standalone emoji with lucide icons, created 13 reusable components, wrote DESIGN.md. |
