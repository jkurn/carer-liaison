# Carer Liaison — Product Strategy

Source of truth for product discovery decisions. Complements BRAND-VOICE.md (positioning) and DESIGN.md (visual system).

Last updated: 2026-04-08. Stress-tested against founder lived experience 2026-04-08.

---

## PD-1: Core Loop

The repeating heartbeat of the app — the single action loop users do every session.

```
                    ┌──────────────────┐
                    │    TRIGGER       │
                    │ "I need to put   │
                    │  this somewhere" │
                    │ (end of day,     │
                    │  quiet moment,   │
                    │  accumulated     │
                    │  weight)         │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    JOURNAL       │
                    │ Talk to Lia      │
                    │ (text, 1-5 min)  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    REFLECT       │
                    │ See RBT cards    │
                    │ "Oh, that IS     │
                    │  what happened"  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    FEEL SEEN     │
                    │ Someone noticed  │
                    │ what I did today │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    COME BACK     │
                    │ Tomorrow, or     │
                    │ when something   │
                    │ happens          │
                    └──────────────────┘
```

**The loop in one sentence:** A carer talks about their day, gets back a reflection that names what they're going through and gives the chaos shape — so they feel seen and less alone, and come back tomorrow.

**Two emotional payoffs — both must be present in every reflection:**
- **Village feeling** — someone witnessed what I did today. I'm not carrying this alone.
- **Mise en place** — the chaos has been given shape. The day is legible now. I know what happened and what it means.

A reflection that only validates without organizing isn't enough. A reflection that only organizes without validating isn't enough. Both, every time.

**What the core loop is NOT:**
- It's not body state tracking (that's a supporting input, not the heartbeat)
- It's not NDIS navigation (that's a future value-add, not the entry point)
- It's not a to-do list (that adds weight; the journal removes it)

**Feature filter:** Does this feature make the core loop faster, easier, or more rewarding? If not, it's Phase 2+.

---

## PD-2: 6-Part Strategy Hypothesis

### 1. Target Audience

**Primary segment:** Unpaid family carers of people with disability in Australia, particularly parents (35-60) of adult children with intellectual or physical disability who are NDIS participants.

**Why this segment first:**
- Highest pain: 40+ hours/week of unpaid care, 1 in 3 report high psychological distress
- Strongest willingness to act: they already track everything — they WANT a system
- Easiest to reach: concentrated in NDIS Facebook groups, carer support networks, OT referrals

**Secondary segment (future):** Support workers and allied health professionals who work with these carers. They benefit from the structured data the journal produces.

### 2. Problem to Solve

**User's goal:** Get through the day with everything in its right place (mise en place).

**Underlying motivation:** Feel like a person, not an admin. Be the parent/partner, not the coordinator.

**Secondary pain (often unnamed):** The hypervigilance bleeds out. The carer is constantly alert — and that alertness causes them to lash out at the people they love most. The goal isn't just to feel like a person. It's to stop being the person who hurts their family because they're carrying everything alone.

**The gap:** The carer carries all operational knowledge in their head — sleep patterns, what they eat, what sets them off, what kind of day it's going to be. There is no system under this knowledge. When the carer has a bad day, everything falls apart.

**Painkiller test:** This is a PAINKILLER, not a vitamin.
- The pain is daily, not occasional
- The carer doesn't choose to feel this way — the system forces it
- The alternative (keep using notebooks and WhatsApp screenshots) is actively painful
- Evidence: Jonathan's mum has tracked for 28 years in notebooks. She WANTS a system. She just doesn't have one.

### 3. Value Proposition

**Promise:** "Talk about your day. Get back what you might not see yourself." The journal listens, names what you're going through (with clinical precision), and reminds you that what you're doing matters.

**Key benefits:**
1. Validation — someone (Lia) actually acknowledges the invisible work
2. Structure — Rose/Bud/Thorn turns a chaotic day into a named, organized reflection
3. Memory — the journal captures knowledge that currently lives only in your head
4. Companionship — the village feeling, not another app to maintain

**User anxieties (what would hold them back):**
- "This is just another app that adds work" → Counter: one input, everything else is generated
- "AI doesn't understand caring" → Counter: Lia is trained on carer psychology, uses Australian carer research
- "My data isn't safe — this is health information" → Counter: encrypted, local-first, never shared
- "I don't have time for this" → Counter: 2 minutes, voice or text, whenever you have a moment

### 4. Differentiation

**Short-term (better serve the under-served):**
- No carer-specific journaling app exists in Australia. Generic journaling apps (Rosebud, Day One, Reflectly) don't understand NDIS, caring language, or the specific emotional landscape of disability carers.
- Rose/Bud/Thorn is not a generic "how do you feel?" — it's structured clinical reflection adapted for caring.
- Crisis detection with Australian resources (Lifeline, Beyond Blue) — no generic journal does this.

**Long-term (hard to copy):**
- **Data moat:** Every journal entry captures structured caring knowledge (people, triggers, wins, services, body state). Over months, this builds a care profile that no competitor can replicate from scratch.
- **To-Done network effect:** When the journal data feeds support worker handoffs (Phase 3), the carer's entries become valuable to their whole care team — creating a switching cost.
- **OT referral channel:** If OTs recommend Carer Liaison as part of NDIS capacity building plans (Cat 07), the acquisition channel becomes the care system itself.

### 5. Monetization

**ASSUMPTION** (see ASSUMPTIONS.md): Monetization is Phase 2+. V1 is free.

**Hypothesis for Phase 2:**
- **Decision maker:** The carer (for personal use) OR the NDIS plan manager (for funded use)
- **Willingness to pay:** Carers pay for respite, therapy, and tools that reduce load. $5-10/month is within range for something that saves 30+ minutes/day of mental overhead. NDIS funding (Cat 07 Improved Daily Living) could cover it as assistive technology.
- **Buying friction:** Low for personal (App Store purchase). Medium for NDIS-funded (requires OT assessment letter + plan manager approval).
- **Model options:** (a) Freemium — journal free, insights/To-Done list paid, (b) B2B — support worker seat licenses, (c) NDIS-funded SaaS — $2.5K/month per carer via plan funding.

### 6. Acquisition Channel

**Primary (V1):** Direct-to-carer via:
1. **NDIS Facebook groups** — carers share tools in these groups daily. The viral loop sentence ("It watches the patterns I've been tracking in my head for years") is designed for this.
2. **Assessment funnel** — existing landing page → assessment → email capture → invite to app.
3. **Word of mouth** — carer-to-carer. The journal reflection cards are shareable.

**Secondary (Phase 2):**
4. **OT referral** — OTs recommend the app as part of NDIS capacity building. Requires OT assessment pathway docs.
5. **Content marketing** — carer-specific blog/social content. Jonathan's personal brand as an AI strategist + carer sibling.

**Not pursuing (yet):** Paid ads, partnerships with disability organisations, government contracts.

---

## PD-3: Emotional User Journey Map

```
EMOTIONAL
HIGH ─────────────────────────────────────────────────────────
                                              ╭───╮
                                              │   │ "Oh... that IS
                                              │   │  what happened"
                        ╭───╮                 │   │  (reflection)
                        │   │ "Someone        │   │
                        │   │  is listening"  │   ╰────────╮
                        │   │  (Lia responds) │            │ "I'm not
                        │   │                 │            │  alone in this"
      ╭───╮            │   │                 │            │  (journal context)
      │   │ "I need    │   │                 │            │
      │   │  to get    │   │                 │            │
      │   │  this out" │   │                 │            │
──────╯   ╰────╮       │   │                 │            ╰──────────────
                │       │   │                 │
                │  ╭────╯   ╰─────╮          │
                │  │ "What do     │          │
LOW ────────────╯  │  I even say?" ╰──────────╯
                   │  (blank input)
                   ╰─── FRICTION

        TRIGGER    OPEN    TYPE    LIA      FINISH    REFLECT    CLOSE
                   APP             RESPONDS  ENTRY
```

**Trigger (emotional state: stressed, drained, or needing to process):**
- End of a hard day. Something happened — meltdown, cancellation, small win nobody noticed.
- Or: quiet moment after everyone's asleep. The day is replaying in their head.
- Or: push notification reminder (Phase 2). "Lia is here when you're ready."

**Open app (slight relief — "there's a place for this"):**
- See the Home screen. Familiar. The journal CTA says "Tell Lia about your day."
- Tap the + FAB. The modal opens. Lia's greeting is warm, not clinical.

**FRICTION POINT: "What do I even say?" — two layers, not one**

1. **Blank page anxiety** — carers are used to being asked how they are and not knowing how to answer. The empty input feels like a test they might fail.
2. **Protective reflex** — carers have spent years learning not to answer "how are you?" honestly. It's a trained social response. Lia's opening must break through that reflex, not trigger it. "How was today?" is too close to a question they've learned to deflect with "fine, we're managing."

- Mitigation: Lia's opening must signal it's safe to be honest, not just low-pressure. "Could be one moment, a whole saga, or just a feeling" is better than "How was today?"
- **Hidden failure mode:** The carer gives the sanitised answer ("it was a long day, but we're okay"). The reflection will then be generic. Generic reflection = no payoff = no return. Activation rate doesn't catch this — the entry is completed, but it never landed.

**Type and send (catharsis begins):**
- They type a few sentences. Raw, unfiltered. "It was such a long day."
- Hitting send feels like a small release — someone is going to read this.

**Lia responds (emotional high — "someone is listening"):**
- Lia's response validates FIRST, then asks a gentle follow-up.
- The response feels specific, not generic. "That sounds heavy" not "I understand."
- This is the critical moment: if Lia feels like a chatbot, the carer never comes back. If Lia feels like a companion, the loop starts.

**Conversation continues (building momentum):**
- 2-3 exchanges. Each one goes a little deeper.
- "Go deeper" suggestions help when they don't know what else to say.
- They can stop whenever they want — "Finish entry" is always available.

**Finish entry + Reflection (biggest emotional high — "that IS what happened"):**
- 2-4 seconds of waiting ("Reflecting on your entry...").
- RBT cards appear. Rose names a win they didn't see. Thorn names the hard thing without minimizing it.
- Psychology insight connects their experience to something real ("Caregiver Hypervigilance — 72% of carers report this").
- This is the payoff: the journal didn't just listen — it understood.

**Close (feeling lighter):**
- The entry is saved. They can see it in History.
- They close the app. The day feels slightly more organized in their head.
- Tomorrow, they'll come back — because this time, someone noticed.

---

## PD-4: Riskiest Hypothesis + Validation Plan

### Risk Audit

| # | Hypothesis | Risk Type | Unknown (1-5) | Critical (1-5) | Score |
|---|-----------|-----------|---------------|----------------|-------|
| 1 | Carers will journal on their phone (not just notebooks) | Demand | 4 | 5 | **20** |
| 2 | AI reflection feels validating, not generic | Value | 3 | 5 | **15** |
| 3 | Carers come back after first session (retention) | Demand | 4 | 4 | **16** |
| 4 | An OT would recommend this to a carer | Acquisition | 3 | 3 | 9 |
| 5 | The app works reliably on carers' phones | Technical | 2 | 4 | 8 |
| 6 | Carers trust AI with personal health data | Demand | 3 | 3 | 9 |
| 7 | NDIS funding can cover this (Cat 07) | Business | 4 | 2 | 8 |

### Riskiest Hypothesis: #1 — "Carers will journal on their phone"

**Why this is riskiest:** We've built the entire product around a carer typing into an app at the end of a hard day. But: carers are exhausted, their hands might be busy, they've been burned by apps before, and their current system (notebooks, WhatsApp, their head) works — badly, but it works. If they won't type into the journal, nothing downstream matters.

**What we know (existing signal):**
- Jonathan's mum uses notebooks and WhatsApp screenshots — she WANTS to record, she just lacks a system (Action-level signal, but n=1)
- Assessment funnel captures emails — people are interested enough to give their email (Word-level signal, weak)
- No carer has actually used the journal app yet (Zero signal on the actual product)

### Validation Plan

**Goal:** Get 5 carers to complete at least 1 full journal entry (through to RBT reflection) within 2 weeks.

**Method:** Guided pilot (Wizard of Oz lite)

| Step | Action | Signal |
|------|--------|--------|
| 1 | Recruit 5 carers from assessment email list or NDIS Facebook groups | Can we find 5 willing people? (If no → demand risk is real) |
| 2 | Give them the app (Expo Go link or TestFlight) | Can they install and sign up without help? (If no → technical risk) |
| 3 | Ask them to journal once about their day | Do they actually do it? (Action signal) |
| 4 | After journaling, ask: "Would you use this again tomorrow?" | Word signal (weak but directional) |
| 5 | Check if they come back within 3 days without prompting | Habit signal (strongest) |

**Pass criteria:**
- 3 of 5 complete a full entry → hypothesis validated for now
- 0-1 of 5 → hypothesis may be wrong, investigate why
- If they journal but the reflection feels generic → pivot to hypothesis #2

**Timeline:** Can start as soon as the app works end-to-end (journal chat + reflection).

---

## PD-5: Task Flows (Unhappy Paths)

### Flow 1: Journal Chat — Send Message

```
User taps Send
    │
    ├── Message empty? → disable send button (client-side)
    │
    ├── Message valid
    │       │
    │       ├── Add to conversation (local state)
    │       ├── Save draft to SQLite
    │       ├── Show typing indicator
    │       │
    │       ├── Call edge function (POST /journal-ai, mode: chat)
    │       │       │
    │       │       ├── 200 OK + text
    │       │       │       │
    │       │       │       ├── Text not empty → show Lia's response
    │       │       │       │     → show Finish/Go Deeper buttons
    │       │       │       │
    │       │       │       └── Text empty → show "Lia lost her train
    │       │       │             of thought. Try again?"
    │       │       │
    │       │       ├── 401 Unauthorized
    │       │       │       └── Token expired → refresh token
    │       │       │           → if refresh fails → redirect to login
    │       │       │
    │       │       ├── 502 AI service unavailable
    │       │       │       └── Show "Lia is having trouble connecting.
    │       │       │           Your words are safe — try again in a moment."
    │       │       │           → keep user message in conversation
    │       │       │           → show Retry button
    │       │       │
    │       │       └── Network error / timeout (>15s)
    │       │               └── Show "Couldn't connect. Check your internet."
    │       │                   → keep user message in conversation
    │       │                   → show Retry button
    │       │
    │       └── User navigates away mid-request
    │               └── Cancel request, save draft to SQLite
    │
    └── User is offline (detected via NetInfo)
            └── Show "You're offline" banner
                → still allow typing (save to draft)
                → disable send button with "Send when online" label
```

### Flow 2: Finish Entry — RBT Extraction

```
User taps "Finish entry"
    │
    ├── Show "Reflecting on your entry..." loading state
    ├── Disable all input
    │
    ├── Call edge function (POST /journal-ai, mode: reflect)
    │       │
    │       ├── 200 OK + JSON text
    │       │       │
    │       │       ├── Parse JSON successful
    │       │       │       │
    │       │       │       ├── Has rose + bud + thorn → save entry
    │       │       │       │     → mark isDraft = false
    │       │       │       │     → navigate to Entry Detail
    │       │       │       │
    │       │       │       └── Missing fields → save what we have
    │       │       │             → navigate to Entry Detail
    │       │       │             (partial reflection is better than none)
    │       │       │
    │       │       └── Parse JSON fails (malformed)
    │       │               └── Retry once with same conversation
    │       │                   → if 2nd attempt fails → save as draft
    │       │                   → show "Couldn't generate reflection.
    │       │                     Entry saved as draft."
    │       │                   → return to chat (phase: responded)
    │       │
    │       ├── 502 AI service unavailable
    │       │       └── Same as malformed JSON (save draft, show error)
    │       │
    │       └── Network error / timeout (>30s)
    │               └── Save as draft, show error, return to chat
    │
    └── User dismisses (X) during reflection
            └── Cancel request, save draft, return to Home
```

### Flow 3: Entry Sync (SQLite → Supabase)

```
Entry saved to SQLite (syncedAt = null)
    │
    ├── Is device online?
    │       │
    │       ├── YES → push to Supabase (upsert by id)
    │       │       │
    │       │       ├── Success → set syncedAt = now()
    │       │       │
    │       │       ├── 401 (auth expired) → refresh token
    │       │       │       ├── Refresh success → retry push
    │       │       │       └── Refresh fails → leave syncedAt null
    │       │       │           (will retry on next trigger)
    │       │       │
    │       │       ├── RLS violation (403) → log error
    │       │       │       └── This should never happen — indicates
    │       │       │           a user_id mismatch bug. Leave unsynced.
    │       │       │
    │       │       └── Network error → leave syncedAt null
    │       │
    │       └── NO → leave syncedAt null
    │
    ├── On network reconnect → query all syncedAt IS NULL → push each
    │
    └── On app foreground → same as reconnect
```

### Flow 4: Auth — Session Lifecycle

```
App launch
    │
    ├── Check SecureStore for session token
    │       │
    │       ├── Token exists
    │       │       │
    │       │       ├── Token valid → show tabs (Home)
    │       │       │
    │       │       └── Token expired → attempt refresh
    │       │               ├── Refresh success → show tabs
    │       │               └── Refresh fails → show login screen
    │       │
    │       └── No token → show login screen
    │
    ├── Login flow
    │       ├── Submit email + password
    │       │       ├── Success → store token → show tabs
    │       │       ├── Invalid credentials → show error
    │       │       └── Network error → show "Can't connect"
    │       │
    │       └── Signup flow
    │               ├── Submit email + password
    │               ├── Success → auto-login (email confirm disabled)
    │               └── Email taken → show "Account already exists"
    │
    └── Mid-session token expiry
            └── Supabase client auto-refreshes
                    ├── Success → transparent to user
                    └── Fails → next API call gets 401
                        → show "Session expired. Please log in again."
```

---

## PD-6: Success Metrics / KPIs

### V1 Success Criteria

> "5 carers complete 3+ journal entries in the first 2 weeks."

This is the single sentence that defines whether V1 works.

### Metric Framework

| Metric | Definition | Target (V1) | How to measure |
|--------|-----------|-------------|----------------|
| **Activation** | % of signups who complete first journal entry | >60% | `entries` table: count users with at least 1 entry where isDraft=false |
| **Engagement** | Avg entries per active user per week | >2 | Count entries grouped by user per week |
| **Retention** | % of users who journal 3+ times in first 14 days | >40% | Count distinct journal dates per user |
| **Depth** | Avg messages per entry (conversation length) | >3 | Parse conversation JSON, count user messages |
| **Completion** | % of entries that reach reflection (isDraft=false) | >70% | isDraft=false / total entries |
| **Satisfaction** | Qualitative: "Would you use this again tomorrow?" | 4/5 say yes | Manual: ask after first entry |

### Instrumentation Plan

All metrics can be computed from the existing `entries` table without additional tracking code:
- `entries.created_at` → activation, engagement, retention timing
- `entries.is_draft` → completion rate
- `entries.conversation` (JSON) → depth (count messages)
- `entries.user_id` → per-user aggregation

**What's NOT instrumented yet (Phase 2):**
- Session duration (how long from open to close)
- Funnel drop-off (how many open chat but never send)
- Body state correlation (does mood predict journaling?)

---

## PD-7: MoSCoW Feature Map

### V1 — Must Have (blocks the core loop)

| Feature | Why it's Must | Status |
|---------|--------------|--------|
| Journal Chat with Lia | IS the core loop | Built, needs AI fix |
| AI conversational response | Without it, no one to talk to | Edge fn deployed, needs e2e test |
| "Finish entry" → RBT extraction | The payoff — without reflection, no reason to come back | Built, needs e2e test |
| Entry persistence (SQLite) | Without it, every session is ephemeral | Built |
| Auth (login/signup) | Required to identify who's journaling | Built, working |
| Entry Detail (view saved entry) | Must be able to see past reflections | Built |

### V1 — Should Have (degrades the loop without them)

| Feature | Why it helps | Status |
|---------|-------------|--------|
| Entry History | Carers want to look back at patterns | Built |
| Typing indicator | Without it, feels broken while AI thinks | Built |
| "Go deeper" suggestions | Helps when carers don't know what else to say | Built |
| Body state check-in (Home) | Quick emotional pulse, data for future insights | Built |
| Draft recovery | Carers interrupted mid-entry don't lose their words | Built |
| Crisis detection + banner | Safety — non-negotiable before real users | Built (system prompt) |
| Error states (AI fails, offline) | Without them, the app feels broken | Partially built |

### V1 — Could Have (nice but deferrable)

| Feature | Why it could wait | Status |
|---------|------------------|--------|
| Sync to Supabase | Local-first works without cloud backup for pilot | Built, untested |
| Empty states with illustrations | Text placeholders work fine for pilot | Built (text only) |
| Psychology insight card | RBT cards alone provide enough value | Built |
| Action items / next steps | Reflection is the core payoff, actions are bonus | Built |

### Won't Have (V1 — explicitly deferred)

| Feature | Why not now |
|---------|-----------|
| Voice input | Adds complexity — but validate in pilot: ask "was there a moment you wanted to speak instead of type?" Carers with physical exhaustion or muscle issues may need this in V1, not Phase 2 |
| Push notifications | Need retention data before designing nudges |
| Insights dashboard | Needs 2+ weeks of data to be meaningful |
| Goals tracker | Not part of the core loop |
| To-Done list | Phase 3 — needs support worker integration |
| Team view / handoff | Phase 3 — needs multi-user architecture |
| NDIS evidence compile | Phase 3 — needs structured data from journal history |
| Data export / delete | Required for privacy compliance at scale, not for 5-user pilot |
| Dark mode | Design system is light-mode only |
| Web version | Focus on mobile — carers journal on phones |

---

## Assumptions Log

See `ASSUMPTIONS.md` for all assumptions made during product strategy development.
