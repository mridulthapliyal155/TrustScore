"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StartupCard from "@/components/StartupCard";
import { StartupCardData, BadgeTier } from "@/types/startup";
import { createClient } from "@/lib/supabase/client";

interface CompanyDbRow {
  id: string;
  name: string;
  description: string | null;
  sector: string | null;
  stage: string | null;
  founded_date: string | null;
  investors: any[] | null;
  trust_score: number | null;
  verification: Record<string, string> | null;
  show_score: boolean;
}

export default function DirectoryPage() {
  const supabase = createClient();
  const [companies, setCompanies] = useState<CompanyDbRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedStage, setSelectedStage] = useState("");

  useEffect(() => {
    async function fetchApprovedCompanies() {
      try {
        const { data, error } = await supabase
          .from("companies")
          .select("id, name, description, sector, stage, founded_date, investors, trust_score, verification, show_score")
          .eq("status", "approved");

        if (error) {
          setErrorMsg(error.message);
        } else {
          setCompanies(data || []);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load directory data.");
      } finally {
        setLoading(false);
      }
    }

    fetchApprovedCompanies();
  }, [supabase]);

  // Client-side filtering logic
  const filteredCompanies = companies.filter((company) => {
    const nameText = company.name || "";
    const descText = company.description || "";
    
    const matchesSearch =
      nameText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      descText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSector =
      !selectedSector ||
      (company.sector || "").toLowerCase() === selectedSector.toLowerCase();

    const matchesStage =
      !selectedStage ||
      (company.stage || "").toLowerCase() === selectedStage.toLowerCase();

    return matchesSearch && matchesSector && matchesStage;
  });

  // Extract unique sectors and stages for filter dropdowns (based on approved companies in DB)
  const availableSectors = Array.from(
    new Set(
      companies
        .map((c) => c.sector)
        .filter((sector): sector is string => !!sector)
    )
  ).sort();

  const availableStages = Array.from(
    new Set(
      companies
        .map((c) => c.stage)
        .filter((stage): stage is string => !!stage)
    )
  ).sort();

  const mapToCardData = (company: CompanyDbRow): StartupCardData => {
    return {
      id: company.id,
      name: company.name,
      logoUrl: "",
      description: company.description || "",
      sector: company.sector || "",
      stage: company.stage || "",
      location: "India",
      foundedYear: company.founded_date ? new Date(company.founded_date).getFullYear() : 2026,
      investorCount: (company.investors || []).length,
      fundingRound: (company.investors || [])[0]?.round || company.stage || "Pre-Seed",
      trustScore: company.trust_score !== null ? company.trust_score : 0,
      badgeTier: (company.verification?.cin || "self-reported") as BadgeTier,
      showScore: company.show_score,
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-12 flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-medium tracking-tight text-text-primary">
            Startup Directory
          </h1>
          <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
            Explore verified early-stage startups. Discover details about sector, staging, funding rounds, and their computed TrustScore credibility rating.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-[#FFF5F5] border border-[#FFD8D8] text-danger text-xs p-4 rounded-card">
            <p className="font-semibold">Error Loading Directory</p>
            <p className="mt-1 font-normal text-text-secondary">{errorMsg}</p>
          </div>
        )}

        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full bg-surface border border-border-hairline rounded-card p-4 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search startups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 border border-border-hairline rounded-button bg-surface pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
            />
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Sector Dropdown */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="h-9 border border-border-hairline rounded-button bg-surface px-3 text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent cursor-pointer"
          >
            <option value="">Sector (All)</option>
            {availableSectors.length > 0 ? (
              availableSectors.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))
            ) : (
              <>
                <option value="healthtech">Healthtech</option>
                <option value="logistics">Logistics</option>
                <option value="climate">Climate</option>
                <option value="energy">Energy</option>
                <option value="cybersecurity">Cybersecurity</option>
                <option value="agtech">Agtech</option>
                <option value="fintech">Fintech</option>
                <option value="deeptech">Deeptech</option>
                <option value="ai">AI</option>
              </>
            )}
          </select>

          {/* Stage Dropdown */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="h-9 border border-border-hairline rounded-button bg-surface px-3 text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent cursor-pointer"
          >
            <option value="">Stage (All)</option>
            {availableStages.length > 0 ? (
              availableStages.map((stg) => (
                <option key={stg} value={stg}>{stg}</option>
              ))
            ) : (
              <>
                <option value="idea">Idea</option>
                <option value="mvp">MVP</option>
                <option value="revenue">Revenue</option>
                <option value="scaling">Scaling</option>
              </>
            )}
          </select>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-surface border border-border-hairline rounded-card p-12 text-center">
            <svg
              className="w-12 h-12 text-text-secondary/40 mx-auto stroke-current fill-none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-base font-semibold text-text-primary mt-4">No startups are currently in the directory</h3>
            <p className="text-xs text-text-secondary mt-1">Startups will appear here once their submissions are approved by our review team.</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="bg-surface border border-border-hairline rounded-card p-12 text-center">
            <svg
              className="w-12 h-12 text-text-secondary/40 mx-auto stroke-current fill-none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-base font-semibold text-text-primary mt-4">No startups found matching your filters</h3>
            <p className="text-xs text-text-secondary mt-1">Try resetting your sector, stage, or typing a different search term.</p>
          </div>
        ) : (
          /* Responsive Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <StartupCard key={company.id} startup={mapToCardData(company)} />
            ))}
          </div>
        )}
      </main>

      {/* Footer Layout */}
      <Footer />
    </div>
  );
}
