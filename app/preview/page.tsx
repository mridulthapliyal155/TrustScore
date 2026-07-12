"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PreviewPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navbar */}
      <Navbar
        isLoggedIn={isLoggedIn}
        onAuthToggle={() => setIsLoggedIn((prev) => !prev)}
        productsOpenOverride={productsOpen}
        profileOpenOverride={profileOpen}
        onProductsOpenChange={setProductsOpen}
        onProfileOpenChange={setProfileOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-12 flex flex-col gap-10">
        
        {/* Intro section */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-medium tracking-tight text-text-primary">
            Layout Component Preview
          </h1>
          <p className="text-base text-text-secondary max-w-2xl leading-relaxed">
            This temporary page allows you to inspect the shared layout components, test responsive behaviors, and verify strict adherence to the design tokens.
          </p>
        </div>

        {/* Dynamic State Control Panel */}
        <div className="bg-surface border border-border-hairline rounded-card p-6 flex flex-col gap-5 shadow-xs">
          <div>
            <h2 className="text-lg font-medium text-text-primary">
              Interactive Preview Controls
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Toggle the states below to test how the top navigation bar and its dropdown cards respond.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Auth State Button */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-text-secondary">Auth State</span>
              <button
                onClick={() => {
                  setIsLoggedIn(!isLoggedIn);
                  // Reset profile dropdown if logging out
                  if (isLoggedIn) setProfileOpen(false);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-button border transition-all cursor-pointer select-none ${
                  isLoggedIn
                    ? "bg-accent/10 border-accent/20 text-accent hover:bg-accent/15"
                    : "bg-surface border-border-hairline text-text-primary hover:bg-background"
                }`}
              >
                {isLoggedIn ? "Status: Logged In" : "Status: Logged Out"}
              </button>
            </div>

            {/* Products Dropdown Toggle */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-text-secondary">Products Menu</span>
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                className={`px-4 py-2 text-sm font-medium rounded-button border transition-all cursor-pointer select-none ${
                  productsOpen
                    ? "bg-accent/10 border-accent/20 text-accent hover:bg-accent/15"
                    : "bg-surface border-border-hairline text-text-primary hover:bg-background"
                }`}
              >
                {productsOpen ? "Force Dropdown: Open" : "Force Dropdown: Closed"}
              </button>
            </div>

            {/* Profile Dropdown Toggle */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-text-secondary">Profile Menu</span>
              <button
                onClick={() => isLoggedIn && setProfileOpen(!profileOpen)}
                disabled={!isLoggedIn}
                className={`px-4 py-2 text-sm font-medium rounded-button border transition-all select-none ${
                  !isLoggedIn
                    ? "bg-background border-border-hairline text-text-secondary opacity-50 cursor-not-allowed"
                    : profileOpen
                    ? "bg-accent/10 border-accent/20 text-accent hover:bg-accent/15 cursor-pointer"
                    : "bg-surface border-border-hairline text-text-primary hover:bg-background cursor-pointer"
                }`}
              >
                {!isLoggedIn
                  ? "Requires Login State"
                  : profileOpen
                  ? "Force Dropdown: Open"
                  : "Force Dropdown: Closed"}
              </button>
            </div>
          </div>
        </div>

        {/* Layout Demonstration Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card Mock 1 */}
          <div className="bg-surface border border-border-hairline rounded-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-text-primary">
                Verify Your Startup Credibility
              </h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-accent/8 text-accent rounded-full border border-accent/12">
                Tier 1
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Complete the registration checklist to compute your initial score. Pairing assertions with evidence unlocks advanced verification levels.
            </p>
            <div className="flex gap-3 mt-2">
              <button className="bg-accent text-surface px-4 py-2 text-sm font-medium rounded-button hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer">
                Get Started
              </button>
              <button className="border border-border-hairline text-text-primary px-4 py-2 text-sm font-medium rounded-button hover:bg-background active:scale-98 transition-all cursor-pointer">
                View Sample
              </button>
            </div>
          </div>

          {/* Card Mock 2 */}
          <div className="bg-surface border border-border-hairline rounded-card p-6 flex flex-col gap-4">
            <h3 className="text-base font-medium text-text-primary">
              Verify Design Token Conformance
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm py-1 border-b border-border-hairline">
                <span className="text-text-secondary">Font family</span>
                <span className="font-medium text-text-primary">Inter (sans-serif)</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1 border-b border-border-hairline">
                <span className="text-text-secondary">Card border radius</span>
                <span className="font-medium text-text-primary">12px (rounded-card)</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1 border-b border-border-hairline">
                <span className="text-text-secondary">Button border radius</span>
                <span className="font-medium text-text-primary">8px (rounded-button)</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-text-secondary">Border thickness</span>
                <span className="font-medium text-text-primary">1px hairline (#E8E6E0)</span>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
}
