"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VerificationBadge from "@/components/VerificationBadge";

export default function HowItWorks() {
  // Shared interactive states for the Navbar dropdown menus
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Five levels of evidence rows (ascending from weakest to strongest)
  const evidenceTiers = [
    {
      tier: "self-reported",
      name: "Self-reported",
      desc: "The founder stated it. No supporting proof yet.",
    },
    {
      tier: "ai-extracted",
      name: "AI-extracted",
      desc: "Our AI pulled it from a document or source the founder provided.",
    },
    {
      tier: "document-backed",
      name: "Document-backed",
      desc: "Supported by an uploaded document, such as financials or an incorporation certificate.",
    },
    {
      tier: "stakeholder-endorsed",
      name: "Stakeholder-endorsed",
      desc: "Confirmed by a credible third party, like an incubator or accelerator.",
    },
    {
      tier: "investor-backed",
      name: "Investor-backed",
      desc: "The strongest signal. A real investor has committed capital.",
    },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <Navbar
        isLoggedIn={isLoggedIn}
        onAuthToggle={() => {
          setIsLoggedIn((prev) => !prev);
          if (isLoggedIn) setProfileOpen(false);
        }}
        productsOpenOverride={productsOpen}
        profileOpenOverride={profileOpen}
        onProductsOpenChange={setProductsOpen}
        onProfileOpenChange={setProfileOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-12 flex flex-col items-center">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mt-6 md:mt-12 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-text-primary leading-tight">
            How TrustScore Works
          </h1>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed mt-4 max-w-2xl">
            Every startup makes claims. We verify them, score them, and show investors exactly how much to trust each one.
          </p>
        </section>

        {/* The Problem Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full mt-20">
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl md:text-3xl font-medium text-text-primary tracking-tight">
              The Problem with Startup Information Today
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed">
              Startup directories list whatever a company tells them. A founder enters their revenue, their investors, their traction, and it appears as fact. Investors are left to guess what&apos;s real, with no way to tell a verified claim from an optimistic one.
            </p>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed">
              TrustScore changes this. We grade not just what a startup says, but how well each claim is backed by evidence.
            </p>
          </div>
          <div className="w-full flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/problem-monitor.png"
              alt="Credibility validation network visualization on desktop screen"
              className="w-full max-w-[500px] h-auto rounded-card border border-border-hairline shadow-xs object-cover"
            />
          </div>
        </section>

        {/* Five Levels of Evidence Section */}
        <section className="w-full flex flex-col items-center mt-24">
          <h2 className="text-2xl md:text-3xl font-medium text-text-primary text-center tracking-tight mb-3">
            Five Levels of Evidence
          </h2>
          <p className="text-sm md:text-base text-text-secondary text-center leading-relaxed max-w-xl mb-12">
            Every claim on a profile carries a verification level, so you can see at a glance how much to believe it.
          </p>

          <div className="flex flex-col gap-4 w-full max-w-[850px]">
            {evidenceTiers.map((item, idx) => (
              <div
                key={item.tier}
                className="bg-surface border border-border-hairline rounded-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-accent/25 hover:shadow-2xs transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mt-1.5 flex-shrink-0">
                    Level {idx + 1}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-medium text-text-primary">{item.name}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 self-start sm:self-center">
                  <VerificationBadge tier={item.tier} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The Process Section */}
        <section className="w-full flex flex-col items-center mt-24">
          <h2 className="text-2xl md:text-3xl font-medium text-text-primary text-center tracking-tight mb-16">
            From Registration to Verified Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            {/* Step 1: Register */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/[0.04] border border-accent/10 flex items-center justify-center text-accent">
                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-text-primary">1. Register</h3>
                <p className="text-xs text-text-secondary leading-relaxed mt-2">
                  A founder submits their startup details and uploads supporting documents.
                </p>
              </div>
            </div>

            {/* Step 2: AI evaluation */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/[0.04] border border-accent/10 flex items-center justify-center text-accent">
                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21m0 0-.75-5.096m.75 5.096H3.75m16.5 0H15m0 0-.75-5.096m.75 5.096.813-5.096M9 3v5.25M9 8.25h6M15 3v5.25m3.75 5.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM6.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-text-primary">2. AI Evaluation</h3>
                <p className="text-xs text-text-secondary leading-relaxed mt-2">
                  Our AI reads the evidence, assigns a verification level to each claim, and proposes a score.
                </p>
              </div>
            </div>

            {/* Step 3: Human review */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/[0.04] border border-accent/10 flex items-center justify-center text-accent">
                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0 1 12 3c.08 0 .16.002.244.006m-2.485 0L6.69 3.037a2.25 2.25 0 0 0-1.94 2.227v11.96c0 1.135.845 2.098 1.976 2.192.373.03.748.057 1.123.08M12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-text-primary">3. Human Review</h3>
                <p className="text-xs text-text-secondary leading-relaxed mt-2">
                  A reviewer cross-checks the AI&apos;s assessment. Nothing goes live until it&apos;s approved. This typically takes 10 to 15 days.
                </p>
              </div>
            </div>

            {/* Step 4: Go live */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/[0.04] border border-accent/10 flex items-center justify-center text-accent">
                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.003 9.003 0 0 1 8.716 6.747M12 3a9.003 9.003 0 0 0-8.716 6.747M3.75 12h16.5" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-text-primary">4. Go Live</h3>
                <p className="text-xs text-text-secondary leading-relaxed mt-2">
                  Once approved, the startup appears in the directory with its verified TrustScore.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Two Audiences Card Section */}
        <section className="w-full flex flex-col items-center mt-24">
          <h2 className="text-2xl md:text-3xl font-medium text-text-primary text-center tracking-tight mb-12">
            Built for Both Sides
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* For Founders Card */}
            <div className="bg-surface border border-border-hairline rounded-card p-8 flex flex-col justify-between hover:border-accent/15 transition-all">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/[0.04] border border-accent/10 flex items-center justify-center text-accent">
                  <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 0M8 21.75h8M12 18v3.75m0-16.5c-3.17 0-5.75 2.58-5.75 5.75S9.12 16.5 12 16.5s5.75-2.58 5.75-5.75-2.58-5.75-5.75-5.75Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-text-primary">For founders</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Build a credibility profile that proves what you&apos;ve achieved. The more you verify, the higher your score, and the more investors trust what they see.
                </p>
              </div>
              <Link
                href="/register"
                className="w-full text-center border border-border-hairline hover:bg-background text-text-primary px-6 py-3 text-sm font-medium rounded-button active:scale-98 transition-all mt-6 inline-block"
              >
                Add Your Startup
              </Link>
            </div>

            {/* For Investors Card */}
            <div className="bg-surface border border-border-hairline rounded-card p-8 flex flex-col justify-between hover:border-accent/15 transition-all">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/[0.04] border border-accent/10 flex items-center justify-center text-accent">
                  <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-text-primary">For investors</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Browse startups with confidence. Every score is backed by evidence you can inspect, so you know exactly how much to trust each claim.
                </p>
              </div>
              <Link
                href="/directory"
                className="w-full text-center border border-border-hairline hover:bg-background text-text-primary px-6 py-3 text-sm font-medium rounded-button active:scale-98 transition-all mt-6 inline-block"
              >
                Browse Startups
              </Link>
            </div>
          </div>
        </section>

        {/* Closing Section */}
        <section className="w-full bg-surface border border-border-hairline rounded-card p-8 md:p-12 text-center flex flex-col items-center gap-6 mt-24 mb-20 shadow-2xs">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-text-primary">
            Trust, Earned Through Evidence
          </h2>
          <p className="text-sm md:text-base text-text-secondary max-w-lg leading-relaxed">
            Not another directory of unverified claims. A place where credibility is proven.
          </p>
          <Link
            href="/register"
            className="px-8 py-3 bg-accent text-surface text-sm font-medium rounded-button hover:bg-opacity-90 active:scale-98 transition-all shadow-sm"
          >
            Get Started
          </Link>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
