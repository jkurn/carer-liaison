# Carer Liaison — Deferred Work

Items deferred during eng review (2026-03-19) and ongoing sessions. Pick up when ready.

## Recently Completed (2026-03-27)

- [x] Landing page: All CTAs now point to assessment (removed demo/demo2 links)
- [x] Copywriting: Generalised from autobiography to archetype (they/them, removed "28 years", universal examples)
- [x] Assessment email: Supabase Edge Function deployed with Resend integration
- [x] Assessment email: Personalised HTML email with tier-specific content, pressure points, resources
- [x] Leads table: Stores assessment submissions (email, name, score, tier, answers)

## Security

### 1. RLS Policy Audit
- **What:** Comprehensive review of all RLS policies. Test that user A cannot read user B's body_state_logs, profiles, or care_pairs.
- **Why:** RLS is the ONLY security boundary (anon key is public). Misconfiguration = health data leak.
- **Depends on:** App schema migration (done)
- **Priority:** P0 — before any real user data

### 2. Edge Function Rate Limiting
- **What:** Add rate limiting to `send-assessment` Edge Function (e.g., 5 req/min per IP).
- **Why:** Public endpoint, no auth. Could be abused for email spam via Resend.
- **Depends on:** Supabase Edge Function (deployed)

## UX

### 3. Empty State UX for New Users
- **What:** Dashboard, body-state, and settings need graceful empty states when user has no data yet.
- **Why:** First-time users see broken/empty UI without this.
- **Status:** Dashboard + body-state have empty states. Settings assumes care pair exists.

### 4. CDN Fallback for supabase-js
- **What:** The app imports supabase-js from `esm.sh`. If that CDN is down, the entire app fails to load.
- **Why:** Single point of failure for the whole SPA.
- **Options:** (a) Vendor the file locally, (b) add `<script>` fallback tag, (c) accept the risk

## Email / Assessment

### 9. Resend Domain Verification
- **What:** Verify `carerliaison.com` domain in Resend so emails send from `hello@carerliaison.com` instead of being rejected or going to spam.
- **Why:** Current send-assessment Edge Function returns 500 — Resend rejects the `from` address because the domain isn't verified.
- **Status:** RESEND_API_KEY is set in Supabase secrets. Domain verification pending.
- **Priority:** P0 — assessment flow is broken without this

### 10. Assessment Email: Admin Notification
- **What:** The Edge Function sends a fire-and-forget admin notification to `hello@carerliaison.com` on each submission. Verify this works once domain is verified.
- **Why:** Jonathan needs to see leads as they come in.

## Features (Phase 2)

### 5. Dual-User Login (Participant Access)
- **What:** Allow the participant (person being cared for) to create their own account and see the same data.
- **Why:** The onboarding UI promises "equal partners" — currently only the carer can log in.
- **Depends on:** Add `participant_user_id` column to `care_pairs` table. Update RLS to allow both users.

### 6. Delete Account + Data Export
- **What:** Settings page has "Export" and "Delete" buttons that do nothing.
- **Why:** Privacy compliance (Australian Privacy Act, potential GDPR for expats).
- **Depends on:** Supabase Edge Function for data export + cascade delete.

### 7. AI Morning Brief
- **What:** Generate personalised daily briefs based on body state trends, therapy schedule, meal plans.
- **Why:** Core value proposition of the product.
- **Depends on:** LLM integration (Claude API or AWS Bedrock), body state history (done).

### 8. Real Service Search
- **What:** Replace demo data in service-search.js with real NDIS provider directory API.
- **Why:** Currently shows 3 hardcoded results.
- **Depends on:** NDIS Provider Finder API access or web scraping pipeline.
