# TrustScore AI — Agent Brief

This file is the build contract for the project. Read it together with DESIGN.md
(same folder) before doing any work. DESIGN.md owns all visual decisions; this file
owns product logic, data, structure, and build order. When they overlap, DESIGN.md
wins on anything visual.

This brief reflects the current, settled decisions. Where earlier ideas were changed,
only the current decision is stated here.

---

## 1. What we are building

A two-sided startup validation platform.

- **Founders** register their startup, submit claims, and optionally upload evidence.
  Their startup gets a verified credibility profile and a TrustScore.
- **Investors / VCs** browse startups they can trust, because every claim shows how
  strongly it is backed by evidence.

Differentiator vs. plain directories (e.g. YNOS): TrustScore grades not just *what* a
startup claims, but *how well each claim is verified*. A score is never a bare number;
it is always paired with a verification badge. India-first (CIN, ₹).

---

## 2. Stack (do not substitute without asking)

- **Framework:** Next.js, app router (v16), TypeScript
- **Styling:** Tailwind CSS, tokens from DESIGN.md
- **Database + auth:** Supabase (Postgres + Auth), @supabase/ssr client helpers
- **Deployment target:** Vercel

Keep dependencies minimal. Do not add state libraries, UI kits, or extra services not
listed here unless asked.

---

## 3. Folder structure

```
/app            Next.js routes (app router)
/components     Shared UI (navbar, footer, card, badge, inputs, buttons)
/lib            Supabase clients, helpers, scoring logic
/types          Shared TypeScript types
/docs           DESIGN.md, AGENT_BRIEF.md
/public         Static assets, logo
```

---

## 4. Verification ladder (core mechanism)

Every claim carries a verification tier, weakest to strongest (render identically
everywhere, per DESIGN.md):

1. **Self-reported** — grey dot. Founder stated it, no proof.
2. **AI-extracted** — blue dot. AI checked/pulled it from a source.
3. **Document-backed** — half-filled dot. Supported by an uploaded document.
4. **Stakeholder-endorsed** — green check. A credible third party (incubator) vouches.
5. **Investor-backed** — deep blue check. Highest; a real investor committed capital.

**Critical rules:**
- Tiers are NOT auto-computed from whether a field is filled. Every claim DEFAULTS to
  **self-reported**. Tiers are raised only by admin review (human now, AI later),
  stored on the company row.
- Verification is displayed **per individual claim**, not grouped by category.
- Never show a score without its badge. No bare numbers.
- Do not claim registry-level verification anywhere in the UI (we do not verify CIN
  against a government registry).

---

## 5. Scoring model & AI role

- **Score** rises as claims get verified (weighted by tier). Founders raise it by
  proving claims, never by adding unproven ones.
- **Score scale:** stored 0–1 in the DB, displayed as a 0–100 whole number
  (Math.round(score * 100)). Identical on every screen. Never show the raw decimal.
- **The founder NEVER sets or sees a self-assigned score.** No score field exists in
  registration. The system/admin computes it.
- **Right now, all verification and scoring is done by a human via the admin portal.**
  AI is a later addition.
- **AI role (later):** (1) evaluate documents and privately coach the OWNER on how to
  improve their score — shown only in the owner's own profile, never publicly; (2)
  propose tiers/score for the admin to confirm. AI may check things like CIN format or
  LinkedIn existence → AI-extracted tier.

---

## 6. Review pipeline & status

Nothing goes public until reviewed. Every company has a status (strings use
underscores): **pending → under_review → approved / rejected**.

- pending: just submitted.
- under_review: being checked.
- approved: live in the directory with its score.
- rejected: not shown publicly; founder sees this in their own view.

Rules:
- Public directory / profiles show ONLY approved companies to visitors (enforced by RLS).
- Score is set at approval, never at submission. No score computed or shown at submit.
- Real review takes 10–15 days (told to users). For the demo, status is changed via the
  admin portal (or manually in Supabase until the admin portal exists).

---

## 7. Consent & sharing (single flag)

- One consent flag: **show_score** — show the TrustScore publicly or hide it.
- Hidden: the company still appears; the score slot shows a locked "Score not shared"
  state (never a number, zero, or blank), reading as deliberate, not an error.
- Founders control this via a functional **"Manage sharing"** button in their OWN
  profile (owner view only), which updates show_score in Supabase.
- No field-level visibility ladder. Submitter/founder private contact is never shown to
  visitors (fixed rule, not a founder setting).

---

## 8. Users, accounts & ownership

- Two user types chosen at signup via an "I am a" toggle: **Founder** or **Investor**,
  stored in Supabase user metadata as `role`.
- Founder's name stored in user metadata as **display_name**.
- **Two separate registrations:** (1) user account (auth), (2) company registration
  form. On company submit, the company links to the user via `owner_id`.
- Email confirmation is **ON** (kept for security). Signup shows a "check your email"
  screen; `/auth/callback` completes confirmation and redirects by role (founder →
  /dashboard, investor → /directory). Redirect URLs must be allow-listed in Supabase.
- **Investor vouching** (investor confirms backing → investor-backed tier) is a LATER
  feature. Accounts support it; the feature is deferred.
- **Admin** is a future role needed for the admin portal; admin actions must be
  restricted server-side to admin accounts only.

---

## 9. Company registration form

Route `/register`. Multi-step. Only signed-in founders (else redirect to /auth).
Collects all info during registration (including optional document uploads).

Steps: Basics (name, CIN, legal_status, founded_date, sector, description, website),
Founders (name + LinkedIn, repeatable; team_size), Stage & traction (stage, revenue +
currency, active_users, growth_rate), Endorsements (incubator yes/no + names,
externally_funded yes/no + investor details repeatable, currently_raising), Evidence
(optional uploads: certificate of incorporation, financials, pitch deck, cap table),
Consent (single show_score toggle).

- NO score field anywhere. Saves to the companies table with owner_id set, status
  'pending', trust_score null.
- Uploads: currently only the filename is stored (coi_filename, etc.). Actual file
  storage (Supabase Storage) is a later task.

---

## 10. Database — companies table

Table `public.companies`, RLS enabled.

Columns:
- id (uuid pk), owner_id (uuid → auth.users), status (text default 'pending', check:
  pending/under_review/approved/rejected), created_at, trust_score (numeric, nullable —
  set at approval, never by founder)
- Flat: name, cin, legal_status, founded_date, sector, description, website, stage,
  revenue, revenue_currency, active_users, growth_rate, currently_raising,
  externally_funded (bool), incubator (bool), team_size, show_score (bool)
- JSON: founders ([{name, linkedin}]), incubators ([names]), investors
  ([{name, amount, currency, round, date}])
- Document filenames: coi_filename, financials_filename, pitch_deck_filename,
  cap_table_filename (name only; real file storage is later)
- (Future) a verification field (likely JSON) storing per-claim tiers set by admin.

RLS policies:
- Insert only with your own owner_id.
- Select/update your own companies (owner_id = auth.uid()).
- Anyone can select companies where status = 'approved'.

---

## 11. Owner vs visitor profile views

The profile page (`/startup/[id]`) renders two ways based on a REAL auth ownership
check (signed-in user id === owner_id):

- **Owner view:** full data, edit controls (mostly visual for now), status shown
  prominently, private contact (email), the "Manage sharing" control, and the (dummy
  for now) AI coaching section. Owner always sees their own score regardless of consent.
- **Visitor view:** read-only, public info, founder identity (name + LinkedIn) visible,
  no private contact, a "Contact founder" button, and the show_score consent flag
  applied (locked state if hidden).

A non-owner viewing a non-approved company sees a "profile unavailable" state (RLS
enforces this at the data layer). The owner can view their own company at any status.

---

## 12. Security conventions (apply to all code)

Security is first-class — the product handles founder data, investor identities,
documents, and trust signals.

- Secrets only in .env.local (gitignored). Never hardcode keys. service_role key never
  in client code; only the anon key client-side.
- RLS is the real protection; UI redirects are UX, not security. Every table has RLS,
  default deny, least privilege.
- Never trust the client; authorize via RLS/server. Users read/write only their own
  data; public reads limited to approved records.
- Keep email confirmation on; allow-list redirect URLs.
- Private fields (submitter contact, etc.) never leak to visitor views — this is a
  security boundary.
- Uploaded documents are sensitive; gate with storage policies when real storage lands.
- Parameterized queries; validate/sanitize all input.
- Admin actions (approve, set score/tiers) restricted to admin accounts, checked
  server-side.
- Fail safe: when unsure whether a viewer may see something, show less.
- When instructing the agent, state security requirements explicitly (RLS, ownership
  checks, no secrets) rather than assuming them.

---

## 13. Build status

Built: scaffold + tokens; shared components (navbar with real auth/role state, footer,
card, verification badge); static pages (home, about, how-it-works, contact); directory
(still on MOCK data); company registration (saves to Supabase, linked to founder); auth
(email/password, founder/investor toggle, email confirmation, callback, reset password;
Google removed); founder dashboard (real data — user info + their companies + status +
links); company profile (real data, owner/visitor via real auth, all tiers
self-reported, functional Manage sharing, evidence filenames, score states); Supabase
connected, companies table + RLS + filename columns.

Next, in order:
1. Wire the **directory** to real approved companies (replace mock cards).
2. **Admin / review portal** — approve/reject (set status), set per-claim tiers, set
   the TrustScore. Needs an admin role and a verification field on companies. Highest-
   value remaining piece.
3. **AI assist** (later) — propose tiers/score for admin to confirm; owner coaching.
4. **Investor vouching** (later).
5. **Real document storage** (Supabase Storage) for admin review of files.

---

## 14. Rules for the agent

- Defer to DESIGN.md for all color, type, spacing, and component decisions.
- Title case for nav links, buttons, and headings; sentence case for body/helper text.
  Never ALL CAPS. (This matches DESIGN.md.)
- Reuse existing components; do not rebuild the navbar, footer, card, or badge.
- When given a Stitch design image, match the layout but use DESIGN.md tokens and reuse
  existing components — never paste raw Stitch output/colors, and omit any fields the
  data model does not actually contain.
- Default all verification tiers to self-reported; never auto-derive tiers from field
  presence.
- Show an implementation plan before writing files. Commit after each step.
- Keep the stack lean; ask before adding any dependency not in section 2.
- Follow the security conventions in section 12; state them explicitly in work.