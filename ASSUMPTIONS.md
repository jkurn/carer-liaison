# Carer Liaison — Assumptions

Assumptions made during product strategy and build that need validation. Each assumption is a risk — if wrong, it changes what we build or how we build it.

Last stress-tested against founder lived experience: 2026-04-08.

## Product Assumptions

### A1. Carers will type on their phone
- **Assumed:** Carers will use a mobile text input to journal, even when exhausted.
- **Risk if wrong:** The entire product fails. Voice input may be required for V1, not Phase 2.
- **How to validate:** 5-carer pilot. Watch if they complete entries or abandon at the text input. Also ask: "Was there ever a moment you wanted to speak instead of type?"
- **Status:** UNVALIDATED — highest risk assumption (see PD-4).
- **Stress test note (2026-04-08):** The WhatsApp evidence (carers already type on phones) is weaker than it looks. WhatsApp typing is functional — logging facts in context ("medication at 2pm"). Journal typing is reflective, open-ended, emotional. These are different behaviours. Also: carers doing physically demanding care work (e.g. facilitated communication) may have reduced physical capacity to type at end of day specifically. The assumption may hold for some carers and fail for others.

### A2. AI reflection feels personal, not generic
- **Assumed:** Groq/Qwen models with a good system prompt produce reflections that feel validating to carers, not like generic chatbot output.
- **Risk if wrong:** Carers feel "marketed to" not "seen." They don't come back.
- **How to validate:** Ask 5 pilot carers: "Did this feel like it understood your day?" Read their actual reflections for quality.
- **Status:** UNVALIDATED — second highest risk.
- **Stress test note (2026-04-08):** Risk is higher for long-term experienced carers than for new ones. Population-level insight cards ("72% of carers report this") may feel revelatory to someone new to caring but patronising to a 10+ year veteran who already knows all of this. Pilot must include at least one experienced carer. If they find the reflection condescending, the system prompt needs revision — not just the AI model.

### A3. Rose/Bud/Thorn is the right reflection framework
- **Assumed:** RBT structure resonates with carers. They find it useful, not forced.
- **Risk if wrong:** Carers skip the reflection or find it reductive. Alternative: free-form summary.
- **How to validate:** Pilot feedback. Do carers reference their RBT cards? Do they share them?
- **Status:** UNVALIDATED but evidence from demo/ usage suggests it works.

### A4. Lia's opening prompt is enough to start writing
- **Assumed:** Lia's opening is enough to shift a carer from protective-deflection mode ("fine, we're managing") into honest emotional expression.
- **Risk if wrong:** Carers open the journal and give the sanitised answer. The reflection is then generic. Generic reflection = no payoff = no return. This failure is invisible in activation metrics — the entry completes, but it never lands.
- **How to validate:** Watch activation rate (if <50% of chat opens result in a sent message, the opening needs work). Also read actual pilot entries — are they honest narratives or polished summaries? If mostly the latter, Lia's opening is triggering the deflection reflex.
- **Status:** UNVALIDATED — the blank input was flagged as a friction point in PD-3.
- **Stress test note (2026-04-08):** This is harder than blank-page anxiety. Carers have spent years being asked "how are you?" and learning not to answer honestly — it's a trained social reflex. "How was today?" is too close to the question they've learned to deflect. Lia's opening must signal safety, not just low pressure. The opening has been updated in PD-3 accordingly.

### A11. Carers will use this instead of their existing system (displacement, not adoption)
- **Assumed:** Carers who already track — in notebooks, WhatsApp, in their head — will switch to or add this as their primary system.
- **Why this is different from A1:** A1 asks "will they type at all?" This asks "will they use THIS instead of what they already do?" A carer might be willing to type but still reach for their notebook out of habit.
- **Risk if wrong:** The app gets used once or twice as a novelty, then abandoned in favour of the existing system. Retention looks fine at day 1 and craters by day 7.
- **How to validate:** Ask pilot carers after week 1: "Did you journal anywhere else this week — in a notebook, on WhatsApp, in your head?" If yes — why did you go there instead of here?
- **Status:** UNVALIDATED — high risk for carers with established tracking habits (10+ years).

### A12. Carers can switch into emotional narrative mode at end of day
- **Assumed:** At the end of a day of fact-tracking (medication times, nutrition, behaviour logs), carers can shift into open emotional narrative when prompted.
- **Why this matters:** These are different cognitive modes. Observation-and-logging mode (factual, task-oriented) is what carers use all day. The journal requires emotional-narrative mode (reflective, open-ended, feeling-first). Switching modes is a non-trivial cognitive shift when exhausted.
- **Risk if wrong:** Carers log facts into the journal instead of narrating experience. Entries read like observation notes. The AI reflection has nothing emotional to work with and produces generic output.
- **How to validate:** Read actual pilot entry content. Are they "he had a meltdown at 3pm" (fact-logging) or "I didn't know how to handle what happened at 3pm" (emotional narrative)? If mostly the former, Lia's prompts need to explicitly invite feeling, not just recounting.
- **Status:** UNVALIDATED.

## Technical Assumptions

### A5. Groq free tier is sufficient for pilot
- **Assumed:** Groq's rate limits (~30 RPM free, ~6000 RPM paid) handle 5 pilot users.
- **Risk if wrong:** Rate limit errors during the pilot. Users see "AI unavailable."
- **How to validate:** Monitor edge function logs during pilot.
- **Status:** REASONABLE — 5 users at ~3 entries/day = ~15 entries/day = ~30-45 API calls. Well within free tier.

### A6. Offline-first with SQLite is reliable on all devices
- **Assumed:** expo-sqlite + Drizzle ORM works consistently on iOS and Android.
- **Risk if wrong:** Data loss, entries not saving, sync breaking.
- **How to validate:** Test on 2-3 physical devices (iPhone, Android flagship, Android budget).
- **Status:** UNVALIDATED on real devices.

### A7. Non-streaming AI response is fast enough
- **Assumed:** Users accept a 1-3 second wait with a typing indicator (vs streaming tokens).
- **Risk if wrong:** Feels sluggish. Carers think the app is broken.
- **How to validate:** Measure actual response times during pilot. If >3s consistently, consider streaming via XMLHttpRequest.
- **Status:** REASONABLE — Groq TTFB is typically <1s.

## Business Assumptions

### A8. Monetization is not needed for V1
- **Assumed:** The product can be free for the pilot phase. Revenue model can be figured out after validation.
- **Risk if wrong:** Can't sustain API costs. But at 5 users, costs are ~$0/month (free tier).
- **Status:** SAFE for pilot scale. Revisit at 100+ users.

### A9. NDIS Category 07 can fund this
- **Assumed:** An OT can write an assessment recommending Carer Liaison as assistive technology under Improved Daily Living (Cat 07).
- **Risk if wrong:** No NDIS funding path → must be consumer-paid or free.
- **How to validate:** Speak to 1-2 OTs. Ask: "Would you write this into a plan?"
- **Status:** UNVALIDATED — high value if true, but not blocking V1.

### A10. OTs will refer carers to the app
- **Assumed:** OTs who see the structured journal output (RBT + insights) will recommend it to their clients.
- **Risk if wrong:** OTs don't trust AI-generated reflections or don't see value.
- **How to validate:** Show 2 OTs a sample entry + reflection. Ask: "Would you recommend this?"
- **Status:** UNVALIDATED.

---

## Assumption Priority

| Priority | Assumption | Risk Score | Validate by |
|----------|-----------|-----------|-------------|
| 1 | A1: Carers will type on phone | 20 (Unknown 4 x Critical 5) | 5-carer pilot; ask about voice preference |
| 2 | A11: Displacement not just adoption | 16 (Unknown 4 x Critical 4) | Week 1 pilot check-in: "Did you journal anywhere else?" |
| 3 | A3: Carers come back (retention) | 16 (Unknown 4 x Critical 4) | 3-day unprompted return |
| 4 | A2: AI feels personal | 15 (Unknown 3 x Critical 5) | 5-carer pilot; include 1 experienced carer (10+ yrs) |
| 5 | A12: Mode-switch to emotional narrative | 12 (Unknown 4 x Critical 3) | Read actual entry content in pilot |
| 6 | A4: Opening prompt breaks deflection reflex | 12 (Unknown 3 x Critical 4) | Activation rate + entry quality review |
| 7 | A3: RBT framework resonates | 10 (Unknown 2 x Critical 5) | Pilot feedback |
| 8 | A9: NDIS Cat 07 funding | 8 (Unknown 4 x Critical 2) | OT conversations |
