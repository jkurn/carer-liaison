# Carer Liaison

**AI-powered personal operating system for carers and NDIS participants.**

> They're fully here. The world just can't *receive* them yet.

Carer Liaison closes the gap between what the person you care for communicates and what the world is able to receive — through health monitoring, adaptive daily plans, and idea capture.

🔗 **Live site:** [jkurn.github.io/carer-liaison](https://jkurn.github.io/carer-liaison/)

---

## The Problem

When someone has full cognitive capacity but their body is the barrier, the primary carer becomes the sole operating system — every decision, every plan, every communication runs through one person. That's unsustainable.

- **2.65M** Australians provide unpaid informal care
- **1 in 3** primary carers report high psychological distress
- **40+ hours** average weekly care provided
- **72%** of carers say existing tools don't meet their needs

## Three Layers, One System

| Layer | What It Does |
|---|---|
| **Health Intelligence** | Track body states, sleep quality, and daily patterns. The system learns what predicts a good day and adapts automatically. |
| **Daily Planning** | Therapy recommendations matched to today's physical ability. Meal plans, grocery lists, and prep briefs — delivered, not searched for. |
| **Purpose & Ideas** | Every idea captured, researched, and stored. The system surfaces outings, contributions, and meaningful moments for the week ahead. |

## Six Intelligent Agents

| Agent | Phase | What It Measures |
|---|---|---|
| Body State Tracker | Health | 7-day body state variance |
| Sleep Analysis | Health | Sleep-body correlation |
| Therapy Planner | Planning | Therapy completion rate by body state |
| Meal Planner | Planning | Carer planning time saved |
| Idea Capture | Purpose | Ideas captured & researched per week |
| Purpose Engine | Purpose | Good days per week trend |

## NDIS Alignment

Components are designed to fall within existing NDIS funding categories:

- **Category 05 — Assistive Technology:** Apple Watch, iPad, Stream Deck, Smart Speaker
- **Category 07 — Capacity Building:** AI system setup framed as Improved Daily Living
- **CSIRO AI-AT Framework (Feb 2026):** Compliant with the new AI-enabled assistive technology framework
- Includes OT assessment pathway guidance for funding applications

## Tech Stack

- Single-page static site (HTML/CSS/JS)
- Google Fonts (DM Serif Display + DM Sans)
- Scroll-driven animations (IntersectionObserver)
- Hosted on GitHub Pages

## Local Development

```bash
# Clone the repo
git clone https://github.com/jkurn/carer-liaison.git
cd carer-liaison

# Open in browser
open index.html
```

No build tools required — it's a single HTML file.

## File Structure

```
carer-liaison/
├── index.html        ← Current landing page (v2 — DM Serif Display)
├── index_v1.html     ← Earlier version (v1 — Plus Jakarta Sans)
└── README.md
```

## License

All rights reserved © 2026 Carer Liaison.
