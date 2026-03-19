# Carer Liaison — Deferred Work

Items deferred during eng review (2026-03-19). Pick up when ready.

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
