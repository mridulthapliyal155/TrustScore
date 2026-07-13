# TrustScore AI — Agent Brief

This file is the build contract for the project. Read it together with DESIGN.md
(in the same folder) before doing any work. DESIGN.md owns all visual decisions;
this file owns stack, structure, data, and build order. When the two overlap,
DESIGN.md wins on anything visual.

---

## 1. What we are building

A startup validation platform with two user types:

- **Founders** build a credibility profile and receive a TrustScore.
- **Investors** review startups, filter them, and track ones they have backed.

The core idea: every claim a founder makes carries a verification level, so a
score is never a bare number. It is always paired with the evidence behind it.

---

## 2. Stack (do not substitute without asking)

- **Framework:** Next.js, app router
- **Styling:** Tailwind CSS, tokens driven from DESIGN.md
- **Database + auth:** Supabase (hosted Postgres with built-in auth)
- **Deployment target:** Vercel
- **Language:** TypeScript

Keep dependencies minimal. Do not add state libraries, UI kits, or extra services
that are not listed here unless asked.

---

## 3. Folder structure

```
/app            Next.js routes (app router)
/components     Shared UI primitives (nav, card, button, input, badge)
/lib            Supabase client, helpers, score logic
/types          Shared TypeScript types
/docs           DESIGN.md, AGENT_BRIEF.md
/public         Static assets, logo
```

---

## 4. Build order (follow in sequence)

1. **Scaffold + tokens.** Set up the Next.js + Tailwind project. Translate the
   DESIGN.md color, radius, border, and typography tokens into the Tailwind config
   and global CSS variables. No pages or features yet.
2. **Shared primitives.** Build the reusable pieces used on every screen: top nav
   bar, card, primary/secondary button, input, and the verification badge
   component (all five tiers). These must match DESIGN.md exactly.
3. **Spine with mock data.** Founder registration (6-step form) then the score +
   badge display then the investor directory. Use mock data so the flow is
   demoable before persistence exists.
4. **Persistence + auth.** Wire the registration form to Supabase, add founder and
   investor login, enforce the field visibility rules in section 7.
5. **Prove-it features.** CIN registry check, document uploads that raise a claim's
   verification tier, and the "backed by N investors" signal.

Always show an implementation plan before writing files. Commit after each step
with a clear message.

---

## 5. Founder registration form (6 steps)

Each field lists: input type, required or optional, highest verification tier it
can reach, and default visibility.

### Step 1 — Basics
| Field | Type | Req | Tier | Visibility |
|---|---|---|---|---|
| Registered start-up name | text | yes | document-backed | public |
| Brand / popular name | text | no | self-reported | public |
| CIN | text | yes | investor-backed via registry | public |
| Legal status | select (proprietorship / pvt ltd / llp / other) | yes | document-backed | public |
| Founded date | date | yes | document-backed | public |
| Sector / industry | select | yes | self-reported | public |
| One-line description | text (max 300) | yes | self-reported | public |
| Website | url | no | self-reported | public |

### Step 2 — Founders
| Field | Type | Req | Tier | Visibility |
|---|---|---|---|---|
| Founder name(s) | repeatable text | yes | stakeholder-endorsed | public |
| LinkedIn URL per founder | url | yes | stakeholder-endorsed | public |
| Team size | number | no | self-reported | public |

### Step 3 — Stage and traction
| Field | Type | Req | Tier | Visibility |
|---|---|---|---|---|
| Stage | select (idea / mvp / revenue / scaling) | yes | self-reported | public |
| Revenue (MRR or ARR) | number + currency | no | document-backed | shared-link only |
| Active users / customers | number | no | document-backed | shared-link only |
| Growth rate | text | no | document-backed | shared-link only |

### Step 4 — Endorsements
| Field | Type | Req | Tier | Visibility |
|---|---|---|---|---|
| Part of incubator/accelerator? | yes/no | yes | stakeholder-endorsed | public |
| Incubator/accelerator name(s) | repeatable text | conditional | stakeholder-endorsed | public |
| Externally funded? | yes/no | yes | investor-backed | public |
| Investor detail (name, amount, round, date) | repeatable group | conditional | investor-backed | shared-link only |
| Currently raising? | select (yes / no / planning) | yes | self-reported | public |

### Step 5 — Evidence (per-claim uploads)
| Field | Type | Effect |
|---|---|---|
| Certificate of incorporation | file | raises CIN and basics to document-backed |
| Financials / revenue proof | file | raises traction to document-backed |
| Pitch deck | file | self-reported |
| Cap table | file | document-backed, private by default |

### Step 6 — Consent and visibility
| Field | Type | Notes |
|---|---|---|
| Field-level visibility toggle | per sensitive field | public / shared-link / private |
| Consent to display to investors | checkbox | required to publish |
| Submitter contact (name, email, phone) | text | private, never shown on profile |

---

## 6. Verification tiers (from DESIGN.md — render identically everywhere)

Lowest to highest:

1. Self-reported — grey dot
2. AI-extracted — blue dot
3. Document-backed — half-filled dot
4. Stakeholder-endorsed — green check
5. Investor-backed — deep blue check

Hard rule: never display a score without its tier badge. No bare numbers.

## 6a. Score scale

The TrustScore is stored as a 0 to 1 value (e.g. 0.84). It is always displayed
scaled to a 0 to 100 whole number (0.84 shows as 84), using Math.round(score * 100)
at render time. The stored value never changes, only the display is scaled. Never
show the raw decimal to users. This scaling is identical on every screen (card,
profile, anywhere a score appears).

## 6b. Scoring model (weighted verification)

The score rises as a founder's claims get verified. Each claim sits at a verification
tier, and higher tiers contribute more weight to the score:

- self-reported: lowest weight (typed, unproven)
- AI-extracted: low-mid (AI pulled it from a provided source)
- document-backed: mid (supporting document uploaded)
- stakeholder-endorsed: high (credible third party vouches)
- investor-backed: highest (an investor committed capital)

The score is a weighted function of how verified each claim is. A founder raises their
score by proving claims (moving them up tiers), not by adding more unproven claims.
The formula is real and explainable: tier weights summed across claims, normalized to
0 to 1. Keep the weighting logic in /lib so it is testable and can be shown to judges.

## 6c. AI role

The AI has two jobs:

1. Document evaluation and owner coaching. When a founder uploads a document (deck,
   incorporation certificate, financials), the AI reads it, extracts relevant claims,
   and assigns/updates verification tiers. In the founder's OWN profile (owner view
   only) it advises what is missing and how to improve the score (e.g. "revenue is
   self-reported, upload financials to make it document-backed"). This coaching is
   PRIVATE to the founder and never appears on the public/visitor profile or in the
   directory.
2. Score calculation. Turn the verified tiers into the number per section 6b.

Hackathon scope note: the scoring formula and the AI coaching are fully real and
demoable. Full document authenticity checking against external registries is a
post-hackathon feature. For the demo, the AI reads the uploaded document and assigns
a tier based on a document being provided for the claim, plus extracted content. Do
not overclaim registry-level verification in the UI.

## 6c-1. Review pipeline and status

Nothing goes public until reviewed. Every startup has a status:

- **pending** — just submitted, not yet evaluated.
- **under review** — AI has evaluated and proposed a score and tiers; a human is
  cross-checking.
- **approved** — human confirmed; the startup goes live in the directory with its score.
- **rejected** — did not pass; not shown publicly. The founder sees this status in
  their own owner view.

Rules:
- The public directory shows ONLY approved startups.
- After registration the founder is (once auth exists) auto-logged-in and lands on
  their owner profile, which shows the company data and the current status. The
  registration success screen is the founder's first view of their under-review profile.
- The score is proposed by the AI during "under review" and finalized by the human at
  "approved". No score is computed or shown at submission time.
- Real review takes 10 to 15 days. For the demo, status is toggleable (via the admin
  view or a mock control) so the full lifecycle can be shown in seconds.

## 6d. Owner vs visitor profile views

The profile page renders two ways based on an ownership check (is the logged-in user
the profile owner?):

- Owner view: full data, edit controls per section, private fields, the AI coaching,
  and the founder always sees their own score regardless of the consent flag.
- Visitor view (investors, anyone else): read-only, no edit controls, public fields
  only, no AI coaching, submitter contact never shown, and the score consent flag
  applies (locked state if the founder chose not to show the score).

Ownership depends on auth (backend step). Until auth exists, build both views behind
a mock owner/visitor toggle, same pattern as the navbar auth toggle.

---

## 7. Consent rule (single flag)

There is one consent flag: whether the founder consents to display their TrustScore.

- **Consent yes:** the card and profile show the score with its verification badge.
- **Consent no:** the founder still appears in the directory. The score slot renders
  a locked/hidden state (e.g. a lock icon with muted "Score not shared" text), never
  a number, a zero, or a blank. It must read as a deliberate choice, not an error.

No directory-level consent and no field-level visibility ladder. Submitter contact
(name, email, phone) is always private and never shown, but that is a fixed rule,
not a founder-controlled setting.

## 7a. Directory card spec

The compact card shown in the investor directory. Its only job is the click/skip
decision, so keep it light. Fields:

1. Logo + startup name
2. One-line description
3. TrustScore + verification badge (the anchor; locked state if consent is no)
4. Sector tag + stage
5. Location + founded year
6. Investor count + funding round
7. "Open Profile" link

Everything else (founder scores, revenue stats, incubators, investors, financing,
performance metrics, ratings, similar startups) lives on the full profile page, not
the card.

---

## 8. Demo-critical path (build and polish these first)

Founder registration flow → score + verification badge display → investor directory.
These three are what the demo shows. Everything in section 4 step 5 is valuable but
must not come at the cost of this path working cleanly.

---

## 9. Rules for the agent

- Defer to DESIGN.md for all color, type, spacing, and component decisions.
- Sentence case on all labels, buttons, and headings. No title case, no all caps.
- No em-dashes in UI copy or content.
- Show an implementation plan before writing files.
- Commit after each build step with a clear message.
- Keep the stack lean. Ask before adding any dependency not listed in section 2.