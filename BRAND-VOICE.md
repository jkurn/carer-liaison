# Carer Liaison — Brand Voice & Positioning

Source of truth for all copywriting across landing page, app, emails, OT letters, and social.

## Core Positioning

**Core truth:** Carers already track everything — in their heads. That invisible work is real, expert work. The system makes it visible and actionable.

**Frame:** Recognition, not rescue. "We see what you do" — not "we'll save you."

**Enemy:** Not the disability. Not the caring role. The enemy is **invisible operational load** — the patterns, plans, and decisions that exist only in one person's head.

**Promise:** The patterns you carry become a system. The system turns them into plans. You go back to being the person, not the admin.

**The gap we name:** The NDIS funds the plan. But the daily work — sleep, therapy, meals, decisions — runs through the carer alone, every day. That daily work deserves a system.

## Viral Loop Sentence

> "It watches the patterns I've been tracking in my head for years — sleep, body state, what works — and turns them into actual plans."

This is the sentence we want a carer to say to their OT or in a Facebook group.

## Voice: Quiet Competence

Speak like a trusted OT who also builds software. Calm, specific, no hype.

| Say this | Not this |
|----------|----------|
| "The system learns your patterns." | "Our AI-powered platform leverages machine learning to optimize..." |
| "Sleep was 78. Expect a calm day." | "Unlock powerful health insights!" |
| "One input. The rest is handled." | "Seamlessly automate your care workflow with intelligent agents." |

**Feels like:** An OT who also builds software.
**Does not feel like:** A startup pitch deck.

## Rules

1. **Name concrete things.** Sleep, meals, therapy, body state. Not "care outcomes" or "holistic support."
2. **Use "you" and "your."** Never "our users" or "caregivers." They are "you."
3. **Validate before promising.** Always acknowledge what the carer already does before saying what the system does.
4. **No rescue language.** Not "we'll save you time" or "we'll take the burden off." Instead: "The system holds it."
5. **Keep it short.** If a sentence has a comma, try removing the second half.
6. **NDIS specificity is trust.** Say "Cat 05" not "aligned with government frameworks."
7. **Use "they/them" for the care recipient.** Never gendered pronouns in public copy — carers of all genders care for people of all genders.
8. **Archetypes, not autobiographies.** Examples should feel universal ("refusing anything chewy") not biographical ("28 years of pattern recognition"). Any carer should see themselves in the copy. Think YC product, not personal memoir.

## Primary Reader

Parent or partner of someone with a physical disability. The person they care for is cognitively sharp — has opinions, ideas, preferences.

- **Age:** 35-60. Digitally competent but not a techie.
- **Daily reality:** Wakes up already behind. Tracks sleep, meds, therapy schedule, meals — all in their head. Makes 50+ micro-decisions/day for someone else's body.
- **Emotional state:** Invisible. Exhausted. Guilty when things slip. Loves the person fiercely. Resents the system, not the role.
- **What they want:** Not "help" (feels patronizing). A SYSTEM that carries the operational load so they can be the parent/partner again, not the admin.
- **Skepticism:** Has been burned by apps that add work, not remove it.

## Belief Shift

| They believe now | We shift them to |
|-----------------|-----------------|
| "This is just what caring is. You do everything." | "The operational load isn't caring — it's admin. A system can carry admin." |
| "My person needs ME specifically for all of this." | "My person needs my love and judgment. The patterns and logistics? A system can hold those." |
| "Tech adds more work — another app to maintain." | "This system learns from one input a day. It does the work, not me." |

## Emotional Core (from Office Hours, 2026-03-27)

The positioning above is the rational frame. Below is the emotional truth that drives everything.

**The village feeling:** "It takes a village" — carers need to feel that someone is alongside them in the journey. Not rescued. Not pitied. Accompanied. The product should feel like gaining a companion, not downloading an app.

**Mise en place:** The good day feeling is everything in its right place — the right food prepared, the schedule flowing, no surprises. Like a kitchen where everything is set up before the rush. That's the product vision: **mise en place for caring.**

**The "todone" list:** Agents don't give carers MORE to do. They show what's been HANDLED. A to-do list adds weight. A todone list removes it. Frame all agent features as: "while you were caring, the system handled this."

**The emotional equation:**
```
HEADLINE  = "You're not alone in this" (village feeling)
SUBHEAD   = "Everything in its right place" (mise en place)
PRODUCT   = "The companion that helps the day flow"
```

### Copy test

Before publishing any key copy, ask:
1. Would Jonathan's mum feel seen by this — or marketed to?
2. Does this come from lived experience or a framework?
3. Does it make a carer feel accompanied, or rescued?

The gold standard headline will come from mum's own words after using the journal. Until then, write from the family's real experience, not positioning theory.

## User Flow (as of 2026-03-27)

The only public path is: **Landing page → Assessment → Email (personalised action plan)**

- `/demo` and `/demo2` exist but are NOT linked from the landing page. The journal demo is not ready for public traffic.
- The assessment is the primary conversion action. Every CTA on the landing page points to `assessment.html`.
- After completing the assessment, the user enters their email and receives a tier-specific action plan via Resend (Supabase Edge Function).
- The journal will become a public path once it's polished and the design audit findings are resolved.

## The Deeper Why

Unpaid carers are doing the hardest emotional and physical work in the country — and society barely sees them. Post-AI, this is one of the most important applications: giving invisible, critical human work the infrastructure it deserves. Carer Liaison exists because the people who hold everything together deserve a system that holds it with them.
