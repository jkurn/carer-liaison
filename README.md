# Carer Liaison

**Caring was never meant to be done alone.**

Carer Liaison is an AI companion for unpaid family carers — the parents, partners, and siblings who carry everything in their heads: sleep patterns, medication schedules, what they can eat, what sets them off, what kind of day it's going to be. Knowledge built over years, held by one person, with no system underneath it.

We're building the system. Starting with an AI journal that lets carers talk about their day and get something back that actually sees them.

Live site: [jkurn.github.io/carer-liaison](https://jkurn.github.io/carer-liaison/)

---

## Why This Exists

2.65 million Australians provide unpaid care. They track, plan, coordinate, and make dozens of decisions a day — all from memory and notebooks and WhatsApp screenshots. This work is invisible to the system. It's rarely funded, rarely measured, and rarely acknowledged. But without it, nothing else works.

- **1 in 3** primary carers report high psychological distress
- **40+ hours** average weekly care provided
- **72%** of carers say existing tools don't meet their needs

## The Wedge: AI Carer Journal

The entry point is a journal — talk about your day by voice or text, and get back a structured, psychology-backed reflection. It validates what you're doing, names what you're feeling, and starts capturing the knowledge that currently lives only in your head.

From there, the system grows: health tracking, daily planning, service discovery, NDIS navigation. But it starts with being seen.

## The Vision

Mise en place for caring. Everything in its right place so the day flows instead of fights. Not an app to check — a companion that walks alongside you.

## What's Built

| Component | Status |
|---|---|
| Landing page | Live (GitHub Pages) |
| Carer assessment + email | Live — primary conversion path |
| AI carer journal (demo) | Built — not publicly linked (needs design polish) |
| AI carer journal v2 (demo2) | Built — not publicly linked |
| Dashboard app (Supabase) | Functional — auth, onboarding, body state tracking |
| AI Morning Brief | Planned |
| Service search (real data) | Planned |

## NDIS Alignment

Components map to existing NDIS funding categories:

- **Category 05 — Assistive Technology:** Apple Watch, iPad, Stream Deck, Smart Speaker
- **Category 07 — Capacity Building:** AI system setup framed as Improved Daily Living
- **CSIRO AI-AT Framework (Feb 2026):** Compliant with AI-enabled assistive technology framework
- Includes OT assessment pathway guidance

## Tech Stack

- Landing page: Static HTML/CSS/JS, Google Fonts (DM Serif Display + DM Sans), GitHub Pages
- App: Vanilla JS SPA with Supabase (auth, PostgreSQL, Edge Functions)
- Components: Custom Web Components (cl-gauge, cl-sparkline)
- Journal demo: Web Speech API, Gemini Flash via Supabase Edge Function

## Local Development

```bash
git clone https://github.com/jkurn/carer-liaison.git
cd carer-liaison
npx serve . -l 3457
```

## File Structure

```
carer-liaison/
├── index.html          Landing page (all CTAs → assessment)
├── assessment.html     Carer Check-In quiz + email capture
├── app/                Dashboard SPA (Supabase)
├── demo/               AI journal demo v1 (unlisted — not linked from landing)
├── demo2/              AI journal demo v2 (unlisted — not linked from landing)
├── BRAND-VOICE.md      Positioning, voice guide, user flow
├── DESIGN.md           Design system (colors, typography, components)
├── TODOS.md            Deferred work
└── README.md
```

## License

All rights reserved 2026 Carer Liaison.
