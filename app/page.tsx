"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VerificationBadge from "@/components/VerificationBadge";

export default function Home() {
  // Shared interactive states for the Navbar dropdown menus
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Five levels of proof tiers data
  const proofTiers = [
    {
      tier: "self-reported",
      desc: "Basic company details and credentials provided by the founder.",
    },
    {
      tier: "ai-extracted",
      desc: "Information automatically extracted and structured from public and private datasets.",
    },
    {
      tier: "document-backed",
      desc: "Verified against official company documents, filings, and financial reports.",
    },
    {
      tier: "stakeholder-endorsed",
      desc: "Validated by verified stakeholders, team members, customers or existing investors.",
    },
    {
      tier: "investor-backed",
      desc: "Third-party validation from lead/co-lead institutional investor backing.",
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
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-surface border border-border-hairline rounded-full text-[11px] font-medium text-text-secondary select-none tracking-tight shadow-2xs">
            Verifying potential, at scale.
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-text-primary leading-tight mt-6">
            Build a credibility profile that investors trust.
          </h1>

          {/* Subheading */}
          <p className="text-base md:text-lg text-text-secondary leading-relaxed mt-4 max-w-xl">
            Founders get a verifiable TrustScore to accelerate funding. Investors run due diligence with document-backed insights.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto justify-center">
            <Link
              href="/register"
              className="w-full sm:w-auto text-center bg-accent text-surface px-6 py-3 text-sm font-medium rounded-button hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer shadow-sm"
            >
              I&apos;m a founder
            </Link>
            <Link
              href="/directory"
              className="w-full sm:w-auto text-center border border-border-hairline bg-surface text-text-primary px-6 py-3 text-sm font-medium rounded-button hover:bg-background active:scale-98 transition-all cursor-pointer"
            >
              I&apos;m an investor
            </Link>
          </div>

          {/* Laptop Mockup Image */}
          <div className="mt-12 w-full flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-mockup.png"
              alt="TrustScore AI Dashboard Showcase"
              className="w-full max-w-[850px] h-auto rounded-card border border-border-hairline shadow-xs object-cover"
            />
          </div>
        </section>

        {/* Stats Row Section */}
        <section className="w-full border-t border-b border-border-hairline/80 py-8 my-16 bg-background/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col gap-1.5">
              <span className="text-2xl md:text-3xl font-medium text-accent tracking-tight">500+</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">Startups registered</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-2xl md:text-3xl font-medium text-accent tracking-tight">10M+</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">Avg seed round</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-2xl md:text-3xl font-medium text-accent tracking-tight">85+</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">Active investors</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-2xl md:text-3xl font-medium text-accent tracking-tight">5</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">Verification levels</span>
            </div>
          </div>
        </section>

        {/* Levels of Proof Section */}
        <section className="w-full flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-medium text-text-primary text-center tracking-tight mb-8">
            One score, five levels of proof
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
            {proofTiers.map((tierItem, idx) => (
              <div
                key={tierItem.tier}
                className="bg-surface border border-border-hairline rounded-card p-5 flex flex-col gap-4 justify-between hover:border-accent/30 hover:shadow-2xs transition-all duration-200"
              >
                <div className="flex flex-col gap-3">
                  <div className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                    Level {idx + 1}
                  </div>
                  <VerificationBadge tier={tierItem.tier} className="w-fit" />
                </div>
                <p className="text-[12px] text-text-secondary leading-relaxed mt-2">
                  {tierItem.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Split Founders & Investors Target Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-16">
          {/* Founders Card */}
          <div className="bg-surface border border-border-hairline rounded-card p-8 flex flex-col gap-6 hover:border-accent/15 transition-all">
            <div className="w-12 h-12 rounded-full bg-accent/[0.04] border border-accent/10 flex items-center justify-center text-accent">
              <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 0M8 21.75h8M12 18v3.75m0-16.5c-3.17 0-5.75 2.58-5.75 5.75S9.12 16.5 12 16.5s5.75-2.58 5.75-5.75-2.58-5.75-5.75-5.75Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-medium text-text-primary">For founders</h3>
              <ul className="flex flex-col gap-3 mt-4">
                <li className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed">
                  <svg className="w-4 h-4 text-success stroke-current fill-none flex-shrink-0 mt-0.5" viewBox="0 0 12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2.5 6 4.5 8 9.5 3.5" />
                  </svg>
                  <span>Build a verifiable credibility profile that stands out to top-tier VCs.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed">
                  <svg className="w-4 h-4 text-success stroke-current fill-none flex-shrink-0 mt-0.5" viewBox="0 0 12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2.5 6 4.5 8 9.5 3.5" />
                  </svg>
                  <span>Maintain full control over who accesses your detailed metrics.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed">
                  <svg className="w-4 h-4 text-success stroke-current fill-none flex-shrink-0 mt-0.5" viewBox="0 0 12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2.5 6 4.5 8 9.5 3.5" />
                  </svg>
                  <span>Become &quot;due-diligence ready&quot; by identifying compliance gaps early.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Investors Card */}
          <div className="bg-surface border border-border-hairline rounded-card p-8 flex flex-col gap-6 hover:border-accent/15 transition-all">
            <div className="w-12 h-12 rounded-full bg-accent/[0.04] border border-accent/10 flex items-center justify-center text-accent">
              <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-medium text-text-primary">For investors</h3>
              <ul className="flex flex-col gap-3 mt-4">
                <li className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed">
                  <svg className="w-4 h-4 text-success stroke-current fill-none flex-shrink-0 mt-0.5" viewBox="0 0 12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2.5 6 4.5 8 9.5 3.5" />
                  </svg>
                  <span>Skip weeks of repetitive due diligence with pre-verified data.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed">
                  <svg className="w-4 h-4 text-success stroke-current fill-none flex-shrink-0 mt-0.5" viewBox="0 0 12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2.5 6 4.5 8 9.5 3.5" />
                  </svg>
                  <span>See the source document behind every metric in one click.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed">
                  <svg className="w-4 h-4 text-success stroke-current fill-none flex-shrink-0 mt-0.5" viewBox="0 0 12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2.5 6 4.5 8 9.5 3.5" />
                  </svg>
                  <span>Track portfolio health with real-time, automated updates.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full flex flex-col items-center mt-24">
          <h2 className="text-2xl md:text-3xl font-medium text-text-primary text-center tracking-tight mb-16">
            How it works
          </h2>

          <div className="flex flex-col gap-24 w-full">
            {/* Alternating Row 1: Text Left, Image Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-4">
                <h3 className="text-xl md:text-2xl font-medium text-text-primary tracking-tight">
                  Transparency that cuts through the noise.
                </h3>
                <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                  We don&apos;t just give you a number. We provide the &quot;reason&quot; behind every score, mapping each metric back to its source document or endorsement.
                </p>

                {/* Sub pills */}
                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex items-center gap-3 p-3 bg-surface border border-border-hairline rounded-button w-fit shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-success/[0.08] flex items-center justify-center text-success flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296a3.745 3.745 0 0 1 3-12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-text-primary">100% Data Provenance Accuracy</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-surface border border-border-hairline rounded-button w-fit shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-accent/[0.08] flex items-center justify-center text-accent flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-text-primary">Real-time Metric Updates</span>
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/feature-transparency.png"
                  alt="Data verification metric detail panel"
                  className="w-full max-w-[460px] h-auto rounded-card border border-border-hairline shadow-xs object-cover"
                />
              </div>
            </div>

            {/* Alternating Row 2: Image Left, Text Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="w-full flex justify-center order-2 md:order-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/feature-diligence.png"
                  alt="Standardized compliance folder diagram mockup"
                  className="w-full max-w-[460px] h-auto rounded-card border border-border-hairline shadow-xs object-cover"
                />
              </div>
              <div className="flex flex-col gap-4 order-1 md:order-2">
                <h3 className="text-xl md:text-2xl font-medium text-text-primary tracking-tight">
                  Accelerate your due diligence.
                </h3>
                <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                  Stop manually verifying every metric. Our platform automates the tedious parts of the investment process so you can focus on building relationships.
                </p>

                {/* Sub pills */}
                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex items-center gap-3 p-3 bg-surface border border-border-hairline rounded-button w-fit shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-accent/[0.08] flex items-center justify-center text-accent flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-text-primary">Reduce Diligence Time by 80%</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-surface border border-border-hairline rounded-button w-fit shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-accent/[0.08] flex items-center justify-center text-accent flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A9.75 9.75 0 0 1 12 2.25h1.5A9.75 9.75 0 0 1 23.25 12v.75m-21 0a2.25 2.25 0 0 0 2.25 2.25h16.5a2.25 2.25 0 0 0 2.25-2.25m-21 0V16.5a2.25 2.25 0 0 0 2.25 2.25h16.5a2.25 2.25 0 0 0 2.25-2.25V12.75m-16.5 6V21a2.25 2.25 0 0 0 2.25 2.25h12A2.25 2.25 0 0 0 19.5 21v-2.25" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-text-primary">Standardized Data Packages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="w-full max-w-[800px] mx-auto text-center flex flex-col items-center gap-6 mt-28 py-12 px-4 border-t border-border-hairline/80">
          {/* Star ratings (warning amber) */}
          <div className="flex items-center gap-1 text-warning text-lg select-none">
            {"★".repeat(5)}
          </div>

          {/* Quote text */}
          <blockquote className="text-lg md:text-xl font-normal text-text-primary leading-relaxed">
            &quot;TrustScore accelerated our Series A diligence by weeks. It gave our new investors instant confidence in our core metrics.&quot;
          </blockquote>

          {/* Author info */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center text-accent text-xs font-semibold select-none">
              SS
            </div>
            <div className="text-sm font-semibold text-text-primary">Sarah Stein</div>
            <div className="text-xs text-text-secondary">Founder, BioMed Tech</div>
          </div>
        </section>

        {/* Accent CTA Section */}
        <section className="w-full bg-accent text-surface rounded-card p-8 md:p-12 text-center flex flex-col items-center gap-6 mt-20 mb-20 shadow-md">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white">
            Ready to verify your potential?
          </h2>
          <p className="text-sm md:text-base text-white/80 max-w-lg leading-relaxed">
            Join hundreds of startups and investors using TrustScore to streamline the world of venture capital.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto justify-center">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 bg-white text-accent text-sm font-medium rounded-button hover:bg-white/95 active:scale-98 transition-all cursor-pointer text-center shadow-xs"
            >
              Get Started Now
            </Link>
            <Link
              href="/directory"
              className="w-full sm:w-auto px-6 py-3 border border-white/25 text-white hover:bg-white/10 text-sm font-medium rounded-button active:scale-98 transition-all cursor-pointer text-center"
            >
              View Demo Profile
            </Link>
          </div>
        </section>
      </main>

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
}
