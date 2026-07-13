"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function About() {
  // Shared interactive states for the Navbar dropdown menus
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-12 flex flex-col gap-24">
        
        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full mt-6">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-text-primary leading-tight">
              Our Mission Is to Build the World&apos;s Most Trusted Startup Directory.
            </h1>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-xl">
              We believe transparency accelerates innovation and reduces friction for both founders and investors.
            </p>
          </div>
          <div className="w-full flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/about-hero.png"
              alt="TrustScore team meeting in modern office space"
              className="w-full max-w-[500px] h-auto rounded-card border border-border-hairline shadow-xs object-cover"
            />
          </div>
        </section>

        {/* Why We Exist Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-border-hairline/80 pt-16">
          {/* Left label-like title */}
          <div className="md:col-span-1 flex flex-col gap-2">
            <h2 className="text-2xl font-medium text-text-primary tracking-tight">
              Bridging the Trust Gap.
            </h2>
            <div className="w-12 h-1 bg-accent rounded-full mt-1"></div>
          </div>
          
          {/* Right descriptions */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <p className="text-sm md:text-base text-text-secondary leading-relaxed">
              Startup validation is often opaque and manual. Founders spend countless hours repeating the same due diligence processes, while investors navigate fragmented data that is difficult to verify at scale.
            </p>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed">
              TrustScore AI was built to provide a standardized, evidence-backed layer of credibility to the ecosystem. By centralizing verification, we empower stakeholders to focus on building rather than auditing.
            </p>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="w-full flex flex-col items-center border-t border-border-hairline/80 pt-16">
          <h2 className="text-2xl md:text-3xl font-medium text-text-primary text-center tracking-tight mb-4">
            Scaling Credibility.
          </h2>
          <p className="text-sm md:text-base text-text-secondary text-center leading-relaxed max-w-2xl mb-12">
            We combine automated data extraction with human-in-the-loop verification to create a verifiable score.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Card 1: Automated Validation */}
            <div className="bg-surface border border-border-hairline rounded-card p-6 flex flex-col gap-4 hover:border-accent/15 hover:shadow-2xs transition-all duration-200">
              <div className="w-10 h-10 rounded-full bg-accent/[0.04] border border-accent/10 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-text-primary">Automated Validation</h3>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                We pull data directly from connected SaaS tools to ensure accuracy and real-time validity.
              </p>
            </div>

            {/* Card 2: Human Review */}
            <div className="bg-surface border border-border-hairline rounded-card p-6 flex flex-col gap-4 hover:border-accent/15 hover:shadow-2xs transition-all duration-200">
              <div className="w-10 h-10 rounded-full bg-accent/[0.04] border border-accent/10 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12Z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-text-primary">Human Review</h3>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                Expert analysts verify sensitive claims that machines can&apos;t catch, adding a layer of nuanced judgment.
              </p>
            </div>

            {/* Card 3: Dynamic Score */}
            <div className="bg-surface border border-border-hairline rounded-card p-6 flex flex-col gap-4 hover:border-accent/15 hover:shadow-2xs transition-all duration-200">
              <div className="w-10 h-10 rounded-full bg-accent/[0.04] border border-accent/10 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-3.75-1.002m3.75 1.003-1.002 3.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-text-primary">Dynamic Score</h3>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                Profiles stay updated in real-time as a startup grows and scales, reflecting their current health.
              </p>
            </div>
          </div>
        </section>

        {/* Split Principles & Headed Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Card 1: Our Core Principles */}
          <div className="bg-surface border border-border-hairline rounded-card p-8 flex flex-col gap-6 hover:border-accent/15 transition-all">
            <h3 className="text-xl font-medium text-text-primary">Our Core Principles.</h3>
            <ul className="flex flex-col gap-4 mt-2">
              <li className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
                <div className="w-5 h-5 rounded-full bg-success/[0.08] flex items-center justify-center text-success flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>Transparency is the default.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
                <div className="w-5 h-5 rounded-full bg-success/[0.08] flex items-center justify-center text-success flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>Evidence over assertions.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
                <div className="w-5 h-5 rounded-full bg-success/[0.08] flex items-center justify-center text-success flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>Privacy is a right, not an option.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: The Future of Venture */}
          <div className="bg-accent text-surface rounded-card p-8 flex flex-col justify-between hover:shadow-md transition-all gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-medium text-white">The Future of Venture.</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                We&apos;re building a future where founders spend less time in due diligence and more time building, and where investors can deploy capital with instant, data-backed confidence.
              </p>
            </div>
            <div className="w-full flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/about-globe.png"
                alt="Connected global trust network illustration"
                className="w-48 h-48 object-contain rounded-full shadow-sm bg-accent/20 border border-white/10"
              />
            </div>
          </div>
        </section>

        {/* Closing Section */}
        <section className="w-full bg-surface border border-border-hairline rounded-card p-8 md:p-12 text-center flex flex-col items-center gap-6 mb-20 shadow-2xs">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-text-primary">
            Join the Network.
          </h2>
          <p className="text-sm md:text-base text-text-secondary max-w-lg leading-relaxed">
            Start building your credibility profile today.
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
