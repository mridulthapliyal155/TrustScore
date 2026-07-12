"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navbar */}
      <Navbar />

      {/* Main hero area */}
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-20 flex flex-col items-start justify-center gap-8">
        <div className="flex flex-col gap-4 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-text-primary leading-tight">
            Verify Your Startup Credibility
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            TrustScore AI is a startup validation platform. Founders build credibility profiles backed by verifiable evidence, while investors track and support vetted companies.
          </p>
        </div>

        <div className="p-8 border border-border-hairline bg-surface rounded-card max-w-md w-full flex flex-col gap-5 shadow-xs">
          <div>
            <h2 className="text-lg font-medium text-text-primary">
              Review Shared Components
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Inspect the newly built Navigation Bar and Footer layout components.
            </p>
          </div>
          
          <div className="flex items-center justify-between gap-4 border-t border-border-hairline pt-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></span>
              <span className="text-xs font-medium text-text-secondary">
                Components Ready
              </span>
            </div>
            
            <Link
              href="/preview"
              className="bg-accent text-surface px-5 py-2.5 text-sm font-medium rounded-button hover:bg-opacity-90 active:scale-98 transition-all inline-block"
            >
              Open Interactive Preview
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
