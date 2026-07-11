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

---

## 7. Visibility rules

- `public` fields show on the founder's public profile.
- `shared-link only` fields show only when a founder generates a share link for a
  specific investor. Revenue, active users, investor detail, and cap table default
  here.
- `private` fields are never shown to investors. Submitter contact is always private.
- Sensitive fields default to the more restrictive setting. A founder can loosen,
  never the system by default.

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