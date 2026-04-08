# Carer Liaison — Mobile App User Journey & Interaction Map

## V1 Navigation Architecture

```
TAB BAR (always visible except during Journal Chat)
┌────────────────────────────────────────────────┐
│  Home        [+ FAB]      History     Profile  │
└────────────────────────────────────────────────┘

ROUTES:
  /(tabs)/index         → Home / Today
  /(tabs)/history       → Journal Feed (past entries)
  /(tabs)/profile       → Profile stub
  /journal/chat         → Journal Chat (MODAL — no tab bar)
  /journal/[id]         → Entry Detail (PUSH from history or after finish)
  /auth/login           → Login
  /auth/signup          → Signup
```

## Screen-by-Screen Interaction Map

### 1. HOME / TODAY

```
┌──────────────────────────────────┐
│  Good morning                    │
│  Carer Liaison                   │
│                                  │
│  ┌──────────────────────────┐    │
│  │ How's your body feeling? │    │
│  │ 😊  😌  😐  😤  😰     │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │  ← Tap → opens /journal/chat
│  │ + Start today's journal  │    │
│  │   Tell Lia about your day│    │
│  └──────────────────────────┘    │
│                                  │
│  ┌ Continue your entry ─────┐    │  ← Only if draft exists
│  │ You started writing...   │    │     Tap → opens /journal/chat
│  └──────────────────────────┘    │     with draft loaded
│                                  │
│  RECENT ENTRIES                  │
│  ┌ Entry card ──────────────┐    │  ← Tap → pushes /journal/[id]
│  │ 😌 Tired but proud       │    │
│  │ Managed two visits...    │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌─────────────────────────────┐ │
│  │ Home  [+FAB]  History  Me  │ │
│  └─────────────────────────────┘ │
└──────────────────────────────────┘
```

**Interactions:**
- Body state selector → tap emoji → saves to SQLite, visual confirmation
- Start journal CTA → navigates to /journal/chat (modal)
- Draft card → navigates to /journal/chat with draft loaded
- Entry card → navigates to /journal/[id] (push)
- FAB (+) → navigates to /journal/chat (modal)

---

### 2. JOURNAL CHAT (Modal — the critical screen)

**Entry points:**
- FAB from any tab
- "Start today's journal" CTA on Home
- "Continue your entry" draft card on Home

**The flow follows Rosebud's pattern:**

```
PHASE 1: GREETING
┌──────────────────────────────────┐
│  Journal                    ✕    │
│  ─────────────────────────────── │
│                                  │
│  ┌L┐ Hey. How was today?        │
│  └─┘                             │
│      Could be one moment, a     │
│      whole saga, or just a       │
│      feeling you can't shake.    │
│      Whatever it is —            │
│      I'm listening.              │
│                                  │
│                                  │
│                                  │
│                                  │
│                                  │
│  ─────────────────────────────── │
│  [ Tell me about your day...  ]  │
│                              [→] │
└──────────────────────────────────┘

User types → hits send →

PHASE 2: CONVERSATION LOOP
┌──────────────────────────────────┐
│  Journal                    ✕    │
│  ─────────────────────────────── │
│                                  │
│  ┌L┐ Hey. How was today?...     │
│  └─┘                             │
│           ┌──────────────────┐   │
│           │ Was kinda hard   │   │
│           │ and tired        │   │
│           └──────────────────┘   │
│                                  │
│  ┌L┐ That sounds heavy. What    │
│  └─┘ made it hard — was it one  │
│      big thing or just          │
│      everything piling up?       │
│                                  │
│  ─────────────────────────────── │
│  ┌──────────┐ ┌────────────────┐ │
│  │ Finish   │ │ ✦ Go deeper   │ │
│  │ entry    │ │               │ │
│  └──────────┘ └────────────────┘ │
│  ─────────────────────────────── │
│  [ Tell me about your day...  ]  │
│                              [→] │
└──────────────────────────────────┘

"Finish entry" and "Go deeper" appear AFTER EVERY AI response.
User can ALWAYS type freely in the input OR tap a button.

If user taps "Go deeper":
┌──────────────────────────────────┐
│  ...conversation above...        │
│                                  │
│  ─────────────────────────────── │
│  ┌────────────────────────────┐  │
│  │ Suggest some ideas        →│  │
│  ├────────────────────────────┤  │
│  │ Help me think through this→│  │
│  ├────────────────────────────┤  │
│  │ Offer different perspective→│ │
│  ├────────────────────────────┤  │
│  │ Suggest next steps        →│  │
│  ├────────────────────────────┤  │
│  │ Analyze further           →│  │
│  └────────────────────────────┘  │
│                                  │
│  Tapping a suggestion sends it   │
│  as a user message → AI responds │
│  → back to conversation loop     │
└──────────────────────────────────┘

If user taps "Finish entry":

PHASE 3: REFLECTING
┌──────────────────────────────────┐
│  Journal                    ✕    │
│  ─────────────────────────────── │
│                                  │
│  ...conversation above...        │
│                                  │
│  ─────────────────────────────── │
│  ┌ ⟳ Reflecting on your entry ┐ │
│  └────────────────────────────┘  │
│                                  │
│  (2-4 second loading state)      │
│  Then auto-navigates to          │
│  Entry Detail screen             │
└──────────────────────────────────┘
```

**Key interaction rules:**
1. "Finish entry" + "Go deeper" appear after EVERY AI response (not hidden behind state)
2. User can always type freely — the buttons are shortcuts, not gates
3. Body state selector is on Home, NOT in the chat (remove from chat)
4. Input stays pinned to bottom, above keyboard
5. ✕ saves as draft and returns to Home
6. Typing indicator shows while waiting for AI

---

### 3. ENTRY DETAIL (Push screen)

**Entry points:**
- Auto-navigate after "Finish entry" + reflection succeeds
- Tap entry card from Home or History

```
┌──────────────────────────────────┐
│  ← Entry                        │
│  ─────────────────────────────── │
│                                  │
│  Thursday, 8 April               │
│  11:42 PM                        │
│                                  │
│  "Tired but proud"               │  ← AI-generated title
│                                  │
│  ┌ Stretched thin ─────────────┐ │  ← Energy label pill
│  └─────────────────────────────┘ │
│                                  │
│  CONVERSATION                    │
│  ┌L┐ Hey. How was today?...     │
│  └─┘                             │
│         ┌ Was kinda hard... ──┐  │
│         └────────────────────┘   │
│  ┌L┐ That sounds heavy...       │
│  └─┘                             │
│                                  │
│  REFLECTION                      │
│  ┌─── ROSE ─────────────────┐   │
│  │ ┃ OT session went well   │   │
│  │ ┃ "He used utensils"     │   │
│  └──────────────────────────┘   │
│  ┌─── BUD ──────────────────┐   │
│  │ ┃ New routine forming     │   │
│  └──────────────────────────┘   │
│  ┌─── THORN ────────────────┐   │
│  │ ┃ Meltdown after lunch    │   │
│  └──────────────────────────┘   │
│                                  │
│  INSIGHT                         │
│  ┌ Caregiver Hypervigilance ─┐  │
│  │ 72% of carers report...   │  │
│  └───────────────────────────┘  │
│                                  │
│  NEXT STEPS                      │
│  ☐ Call OT about utensils        │
│  ☐ Schedule respite              │
└──────────────────────────────────┘
```

---

### 4. HISTORY / JOURNAL FEED

```
┌──────────────────────────────────┐
│  History                         │
│                                  │
│  TUESDAY, 8 APRIL               │
│  ┌ Entry card ──────────────┐   │  ← Tap → push /journal/[id]
│  │ 😌 Tired but proud       │   │
│  │ Managed two visits...    │   │
│  └──────────────────────────┘   │
│                                  │
│  MONDAY, 7 APRIL                 │
│  ┌ Entry card ──────────────┐   │
│  │ 😊 Small wins today      │   │
│  │ Circle time went well... │   │
│  └──────────────────────────┘   │
│                                  │
│  (paginated — loads 20 at a time)│
│                                  │
│  ┌─────────────────────────────┐ │
│  │ Home  [+FAB]  History  Me  │ │
│  └─────────────────────────────┘ │
└──────────────────────────────────┘
```

**Empty state:**
```
│  Your journal starts here        │
│  Tap + to start your first entry │
```

---

### 5. PROFILE (stub)

```
┌──────────────────────────────────┐
│  Profile                         │
│                                  │
│  Email                           │
│  jonathan.leslie17@gmail.com     │
│                                  │
│  [Log out]                       │
└──────────────────────────────────┘
```

---

## State Machine: Journal Entry Lifecycle

```
         User taps FAB / CTA
              │
              ▼
        ┌───────────┐
        │  GREETING  │  Lia's opening message shown
        └─────┬─────┘  Input area ready
              │ user sends first message
              ▼
        ┌───────────┐
   ┌───▶│  CHATTING  │◀─── user sends another message
   │    └─────┬─────┘     OR taps suggestion button
   │          │
   │          │ AI responds (1-2s, typing indicator)
   │          ▼
   │    ┌────────────┐
   │    │  RESPONDED  │  "Finish entry" + "Go deeper" shown
   │    └──┬──────┬──┘  User can also just type
   │       │      │
   │       │      │ user taps "Finish entry"
   │       │      ▼
   │       │ ┌────────────┐
   │       │ │ REFLECTING  │  Loading state (2-4s)
   │       │ └──────┬─────┘
   │       │        │ success
   │       │        ▼
   │       │ ┌───────────┐
   │       │ │   SAVED    │  Navigate to Entry Detail
   │       │ └───────────┘
   │       │
   │       │ user taps "Go deeper"
   │       ▼
   │  ┌──────────────┐
   │  │ SUGGESTIONS  │  Show 5 suggestion buttons
   │  └──────┬───────┘
   │         │ user taps a suggestion
   └─────────┘ (sends as message → back to CHATTING)

At ANY point: ✕ dismiss → save draft → return to Home
```

## Error States

| State | What user sees | Recovery |
|-------|---------------|----------|
| AI request fails (network) | "Couldn't connect. Your words are safe." + retry button | Tap retry |
| AI request fails (500) | "Lia is having trouble. Try again in a moment." | Tap retry |
| Reflection extraction fails | "Couldn't generate reflection. Entry saved as draft." | Entry saved, can retry from History |
| Offline | Input still works, "You're offline" banner | Queued for when online |
| Draft exists on chat open | Draft loaded with prior conversation | User continues where they left off |
