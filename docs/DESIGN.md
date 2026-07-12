# TrustScore AI — Design System

## Product
A startup validation platform. Two user types: founders (build a credibility profile, get a score) and investors (review startups, track ones they've backed). Tone: clean, minimal, trustworthy, calm.

## Layout
- Responsive web app. Desktop-first, must collapse cleanly to one column on mobile.
- Shared top navigation bar on every authenticated screen: logo left, nav links center, profile/avatar right.
- Generous whitespace. Clarity over density.
- Max content width ~1100px, centered.

## Color
- Background: near-white (#FAFAF8)
- Surface / cards: white (#FFFFFF)
- Primary text: near-black (#1A1A1A)
- Secondary text: grey (#6B6B6B)
- Accent (single, deep blue): #185FA5
- Success green: #3B6D11
- Warning amber: #854F0B
- Danger red: #A32D2D
- No gradients. No heavy drop shadows. Borders are 1px hairline (#E8E6E0).

## Typography
- Sans-serif, modern, high legibility (Inter or similar).
- Title case for nav links, buttons, and headings (e.g., "For Founders", "Log In"). Never ALL CAPS. Body and helper text stays sentence case.
- Two weights: regular (400) and medium (500). No bold-heavy headers.

## Components
- Cards: white, 12px radius, 1px hairline border, ~20px padding.
- Buttons: primary = filled deep blue; secondary = outlined. Rounded 8px. Verb-first labels.
- Inputs: 36px height, hairline border, clear focus ring.

## Verification badge (use identically on every screen where a score appears)
A small pill next to any TrustScore, showing the evidence level:
- Self-reported — grey dot
- AI-extracted — blue dot
- Document-backed — half-filled dot
- Stakeholder-endorsed — green check
- Investor-backed — highest, deep blue check

Rule: always pair a score with its reason. Never show a bare number.