"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Contact() {
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
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-16 md:py-24 flex flex-col items-center justify-center gap-10">
        
        {/* Hero Section */}
        <section className="text-center max-w-2xl flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-text-primary leading-tight">
            Get in Touch
          </h1>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed">
            We&apos;re here to help you navigate the startup validation ecosystem.
          </p>
        </section>

        {/* Contact Info Card */}
        <section className="w-full max-w-[600px] bg-surface border border-border-hairline rounded-card p-8 md:p-12 flex flex-col items-center gap-8 md:gap-10 shadow-2xs">
          
          {/* Email Block */}
          <div className="flex flex-col items-center text-center gap-3 w-full">
            <div className="w-12 h-12 rounded-full bg-accent/[0.04] border border-accent/10 flex items-center justify-center text-accent">
              <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L4.12 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] tracking-wider font-semibold text-text-secondary uppercase">
                Email Us
              </span>
              <a
                href="mailto:contact@trustscore.ai"
                className="text-lg md:text-xl font-medium text-text-primary hover:text-accent hover:underline underline-offset-4 transition-colors"
              >
                contact@trustscore.ai
              </a>
            </div>
          </div>

          {/* Separator line */}
          <div className="w-full border-t border-border-hairline/80"></div>

          {/* Call Block */}
          <div className="flex flex-col items-center text-center gap-3 w-full">
            <div className="w-12 h-12 rounded-full bg-accent/[0.04] border border-accent/10 flex items-center justify-center text-accent">
              <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] tracking-wider font-semibold text-text-secondary uppercase">
                Call Us
              </span>
              <a
                href="tel:+15550000000"
                className="text-lg md:text-xl font-medium text-text-primary hover:text-accent hover:underline underline-offset-4 transition-colors"
              >
                +1 (555) 000-0000
              </a>
            </div>
          </div>

        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
