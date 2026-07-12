"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VerificationBadge from "@/components/VerificationBadge";
import { StartupProfileData } from "@/types/startup";

// Typed mock profiles list
const mockProfiles: Record<string, StartupProfileData> = {
  "apex-biosensors": {
    id: "apex-biosensors",
    name: "Apex Biosensors",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80",
    description: "Continuous glucose monitoring using non-invasive infrared spectroscopy.",
    sector: "Healthtech",
    stage: "Scaling",
    location: "Boston, MA",
    foundedYear: 2021,
    investorCount: 8,
    fundingRound: "Series A",
    trustScore: 0.84,
    badgeTier: "investor-backed",
    showScore: true,
    status: "approved",
    submitterName: "Alex Rivera",
    submitterEmail: "alex.rivera@apex.bio",
    submitterPhone: "+1 (617) 555-0192",
    teamSize: 15,
    website: "https://apex.bio",
    foundersList: [
      { name: "Alex Rivera", linkedin: "https://linkedin.com/in/alex-rivera" },
      { name: "Dr. Sarah Chen", linkedin: "https://linkedin.com/in/sarah-chen" },
    ],
    revenueAmount: 120000,
    revenueCurrency: "USD",
    activeUsers: 850,
    growthRate: "12% MoM",
    incubators: ["Y Combinator", "MassChallenge"],
    investorsList: [
      { name: "Sequoia Capital", amount: 2500000, currency: "USD", round: "Series A", date: "2023-05-12" },
      { name: "Founders Fund", amount: 500000, currency: "USD", round: "Seed", date: "2021-11-04" },
    ],
    currentlyRaising: "no",
    claims: {
      basics: "document-backed",
      founders: "stakeholder-endorsed",
      traction: "document-backed",
      endorsements: "stakeholder-endorsed",
      funding: "investor-backed",
    },
    coiFileName: "cert_incorporation_apex.pdf",
    financialsFileName: "q4_financials_2025.pdf",
    pitchDeckFileName: "apex_pitch_deck_v3.pdf",
    capTableFileName: "apex_cap_table_jan26.xlsx",
  },
  "velo-logistics": {
    id: "velo-logistics",
    name: "Velo Logistics",
    logoUrl: "https://images.unsplash.com/photo-1618005198143-e528346d9a59?w=128&h=128&fit=crop&q=80",
    description: "Last-mile drone delivery network for urgent medical supplies.",
    sector: "Logistics",
    stage: "Revenue",
    location: "Austin, TX",
    foundedYear: 2022,
    investorCount: 4,
    fundingRound: "Seed",
    trustScore: 0.71,
    badgeTier: "stakeholder-endorsed",
    showScore: true,
    status: "approved",
    submitterName: "Marcus Vance",
    submitterEmail: "marcus@velo.delivery",
    submitterPhone: "+1 (512) 555-0143",
    teamSize: 8,
    website: "https://velo.delivery",
    foundersList: [
      { name: "Marcus Vance", linkedin: "https://linkedin.com/in/marcus-vance" },
    ],
    revenueAmount: 45000,
    revenueCurrency: "USD",
    activeUsers: 340,
    growthRate: "18% MoM",
    incubators: ["Techstars Austin"],
    investorsList: [
      { name: "NextView Ventures", amount: 1200000, currency: "USD", round: "Seed", date: "2022-09-18" },
    ],
    currentlyRaising: "yes",
    claims: {
      basics: "document-backed",
      founders: "stakeholder-endorsed",
      traction: "self-reported",
      endorsements: "stakeholder-endorsed",
      funding: "investor-backed",
    },
    coiFileName: "coi_velo_delivery.pdf",
    pitchDeckFileName: "velo_pitch_deck_seed.pdf",
  },
  "nova-carbon": {
    id: "nova-carbon",
    name: "Nova Carbon",
    logoUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=128&h=128&fit=crop&q=80",
    description: "Direct air capture systems using novel solid sorbent filters.",
    sector: "Climate",
    stage: "MVP",
    location: "Seattle, WA",
    foundedYear: 2023,
    investorCount: 2,
    fundingRound: "Pre-Seed",
    trustScore: 0.65,
    badgeTier: "document-backed",
    showScore: false,
    status: "approved",
    submitterName: "Elena Rostova",
    submitterEmail: "elena@novacarbon.co",
    submitterPhone: "+1 (206) 555-0187",
    teamSize: 4,
    website: "https://novacarbon.co",
    foundersList: [
      { name: "Elena Rostova", linkedin: "https://linkedin.com/in/elena-rostova" },
      { name: "Liam Gallagher", linkedin: "https://linkedin.com/in/liam-gallagher-carbon" },
    ],
    revenueAmount: 0,
    revenueCurrency: "USD",
    activeUsers: 2,
    growthRate: "N/A",
    incubators: ["Third Derivative"],
    investorsList: [
      { name: "Collaborative Fund", amount: 500000, currency: "USD", round: "Pre-Seed", date: "2024-02-14" },
    ],
    currentlyRaising: "planning",
    claims: {
      basics: "document-backed",
      founders: "self-reported",
      traction: "self-reported",
      endorsements: "self-reported",
      funding: "document-backed",
    },
    coiFileName: "nova_carbon_incorporation.pdf",
    pitchDeckFileName: "nova_pitch_deck.pdf",
  },
};

const getProfileById = (id: string): StartupProfileData => {
  const normalizedId = id.toLowerCase();
  if (mockProfiles[normalizedId]) {
    return mockProfiles[normalizedId];
  }
  
  // Default fallback for any other dynamic ID
  return {
    id: normalizedId,
    name: id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    logoUrl: "",
    description: "Verified early-stage startup focused on technology innovations.",
    sector: "Technology",
    stage: "Idea",
    location: "San Francisco, CA",
    foundedYear: 2024,
    investorCount: 0,
    fundingRound: "Pre-Seed",
    trustScore: 0.52,
    badgeTier: "self-reported",
    showScore: true,
    status: "pending",
    submitterName: "John Doe",
    submitterEmail: "john.doe@example.com",
    submitterPhone: "+1 (555) 0144",
    teamSize: 3,
    website: "https://example.com",
    foundersList: [{ name: "John Doe", linkedin: "https://linkedin.com/in/johndoe" }],
    currentlyRaising: "planning",
    claims: {
      basics: "self-reported",
      founders: "self-reported",
      traction: "self-reported",
      endorsements: "self-reported",
      funding: "self-reported",
    },
  };
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StartupProfilePage({ params }: PageProps) {
  const { id } = React.use(params);
  const baseProfile = getProfileById(id);

  // States for Demo Mock toggles
  const [isOwner, setIsOwner] = useState(true);
  const [mockStatus, setMockStatus] = useState<"pending" | "under review" | "approved" | "rejected">(baseProfile.status);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Determine actual display status based on view role
  const displayStatus = mockStatus;

  // Format currency helper
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navbar */}
      <Navbar
        isLoggedIn={isLoggedIn}
        onAuthToggle={() => setIsLoggedIn((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">
        
        {/* Demo Mode Toggle Panel */}
        <div className="bg-[#FAFAF8] border border-border-hairline rounded-card p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/directory"
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              &larr; Back to Directory
            </Link>
            <span className="text-border-hairline text-xs font-light select-none">|</span>
            <span className="text-xs text-text-secondary">Demo Mode Controls:</span>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            {/* View Toggle */}
            <div className="flex bg-background border border-border-hairline rounded-[8px] p-0.5">
              <button
                onClick={() => setIsOwner(true)}
                className={`px-3.5 py-1 text-xs font-medium rounded-[6px] transition-colors cursor-pointer select-none ${
                  isOwner ? "bg-accent text-surface" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Owner View
              </button>
              <button
                onClick={() => setIsOwner(false)}
                className={`px-3.5 py-1 text-xs font-medium rounded-[6px] transition-colors cursor-pointer select-none ${
                  !isOwner ? "bg-accent text-surface" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Visitor View
              </button>
            </div>
            {/* Status Mock Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-text-secondary">Mock Status:</span>
              <select
                value={mockStatus}
                onChange={(e) => setMockStatus(e.target.value as "pending" | "under review" | "approved" | "rejected")}
                className="h-7 border border-border-hairline rounded-[6px] bg-background px-2 text-xs text-text-primary focus:outline-hidden cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="under review">Under review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Read-only visitor view on non-approved startups banner */}
        {!isOwner && displayStatus !== "approved" ? (
          <div className="bg-[#FAFAF8] border border-border-hairline rounded-card p-12 text-center flex flex-col items-center justify-center gap-3">
            <svg
              className="w-8 h-8 text-text-secondary fill-none stroke-current"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h2 className="text-lg font-medium text-text-primary">Profile Under Review</h2>
            <p className="text-sm text-text-secondary max-w-sm">
              Public profiles are only visible once approved by a human reviewer. Currently, this profile is in the &quot;{displayStatus}&quot; state.
            </p>
          </div>
        ) : (
          /* Profile Page Render Block */
          <div className="space-y-6">
            
            {/* Status Banner (Owner view only) */}
            {isOwner && (
              <div
                className={`border rounded-card p-4 flex items-start gap-3 text-xs leading-relaxed animate-in fade-in duration-200 ${
                  displayStatus === "pending"
                    ? "bg-[#FCF9F1] border-[#E8DBB0]/40 text-[#7C5A03]"
                    : displayStatus === "under review"
                    ? "bg-[rgba(24,95,165,0.04)] border-[rgba(24,95,165,0.15)] text-accent"
                    : displayStatus === "approved"
                    ? "bg-[rgba(59,109,17,0.04)] border-[rgba(59,109,17,0.15)] text-success"
                    : "bg-[#FFF5F5] border-[#FFD8D8] text-accent"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {displayStatus === "approved" ? (
                    <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 12 12" strokeWidth="2">
                      <polyline points="2.5 6 4.5 8 9.5 3.5" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
                      <circle cx="8" cy="8" r="7" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-semibold capitalize">Status: {displayStatus}</p>
                  <p className="mt-1 font-normal text-text-secondary">
                    {displayStatus === "pending" &&
                      "Your registration is pending. Review will begin shortly once our system aggregates baseline data."}
                    {displayStatus === "under review" &&
                      "Our system is checking verification claims. AI aggregates extracted insights while human operators verify incorporation records."}
                    {displayStatus === "approved" &&
                      "Verified! Your profile, score, and badges are visible publicly in the investor directory list."}
                    {displayStatus === "rejected" &&
                      "Your registration did not pass guidelines. Please check if your CIN and founder info are correct."}
                  </p>
                </div>
              </div>
            )}

            {/* Profile Header Card */}
            <div className="bg-surface border border-border-hairline rounded-card p-6 flex flex-col md:flex-row justify-between gap-6">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {/* Logo */}
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-border-hairline bg-[#FAFAF8] flex items-center justify-center flex-shrink-0">
                  {baseProfile.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={baseProfile.logoUrl}
                      alt={`${baseProfile.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-accent font-medium text-lg">
                      {baseProfile.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Text Metadata */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-medium text-text-primary tracking-tight truncate">
                      {baseProfile.name}
                    </h1>
                    {isOwner && (
                      <span className="text-[10px] text-text-secondary px-2 py-0.5 bg-[#FAFAF8] border border-border-hairline rounded-full font-medium">
                        Owner profile
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                    {baseProfile.description}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <strong className="font-semibold text-text-primary">Sector:</strong> {baseProfile.sector}
                    </span>
                    <span className="text-border-hairline">•</span>
                    <span className="flex items-center gap-1">
                      <strong className="font-semibold text-text-primary">Stage:</strong> {baseProfile.stage}
                    </span>
                    <span className="text-border-hairline">•</span>
                    <span className="flex items-center gap-1">
                      <strong className="font-semibold text-text-primary">Location:</strong> {baseProfile.location}
                    </span>
                    <span className="text-border-hairline">•</span>
                    <span className="flex items-center gap-1">
                      <strong className="font-semibold text-text-primary">Founded:</strong> {baseProfile.foundedYear}
                    </span>
                  </div>
                </div>
              </div>

              {/* TrustScore Display (Respecting Consent flag on Visitor view) */}
              <div className="flex-shrink-0 flex items-start justify-end md:border-l md:border-border-hairline md:pl-6">
                {isOwner || baseProfile.showScore ? (
                  /* Show Score block */
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-text-secondary tracking-wider font-semibold">
                        Trustscore
                      </span>
                      <span className="text-3xl font-medium text-text-primary tracking-tight mt-0.5">
                        {Math.round(baseProfile.trustScore * 100)}
                      </span>
                    </div>
                    <VerificationBadge tier={baseProfile.badgeTier} />
                  </div>
                ) : (
                  /* Locked state */
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-[#FAFAF8] border border-border-hairline rounded-button text-text-secondary">
                    <svg
                      className="w-4 h-4 text-text-secondary fill-none stroke-current"
                      viewBox="0 0 14 14"
                      strokeWidth="1.5"
                    >
                      <rect x="2.5" y="6" width="9" height="6" rx="1.5" />
                      <path d="M 4.5,6 V 3.5 A 2.5,2.5 0 0,1 9.5,3.5 V 6" />
                    </svg>
                    <span className="text-xs font-medium text-text-secondary leading-none">
                      Score not shared
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Submitter Contact Box (Owner view only) */}
            {isOwner && (
              <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-3 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-border-hairline pb-2.5">
                  <h3 className="text-sm font-semibold text-text-primary">
                    Submitter contact details
                  </h3>
                  <button className="text-[11px] font-semibold text-accent border border-border-hairline hover:bg-background px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer">
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-text-secondary font-medium">Full Name</p>
                    <p className="text-text-primary font-medium mt-0.5">{baseProfile.submitterName}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary font-medium">Email Address</p>
                    <p className="text-text-primary font-medium mt-0.5">{baseProfile.submitterEmail}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary font-medium">Phone Number</p>
                    <p className="text-text-primary font-medium mt-0.5">{baseProfile.submitterPhone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Score Verification Dashboard / Evidence Section */}
            <div className="bg-surface border border-border-hairline rounded-card p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-border-hairline pb-3">
                <div>
                  <h2 className="text-base font-semibold text-text-primary">
                    Verification evidence details
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    This scorecard explains how each claims category influences the computed TrustScore.
                  </p>
                </div>
                {isOwner && (
                  <button className="text-[11px] font-semibold text-accent border border-border-hairline hover:bg-background px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer">
                    Manage files
                  </button>
                )}
              </div>

              {/* Claims Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {/* Basics Category */}
                <div className="border border-border-hairline rounded-card p-4 bg-[#FAFAF8] flex flex-col justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-text-primary">Basics & CIN</p>
                    <p className="text-[10px] text-text-secondary mt-1">CIN verified via official registry.</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <VerificationBadge tier={baseProfile.claims.basics} className="!px-2 !py-0.5 text-[10px]" />
                  </div>
                </div>

                {/* Founders Category */}
                <div className="border border-border-hairline rounded-card p-4 bg-[#FAFAF8] flex flex-col justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-text-primary">Founders</p>
                    <p className="text-[10px] text-text-secondary mt-1">LinkedIn URLs and profile verification.</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <VerificationBadge tier={baseProfile.claims.founders} className="!px-2 !py-0.5 text-[10px]" />
                  </div>
                </div>

                {/* Traction Category */}
                <div className="border border-border-hairline rounded-card p-4 bg-[#FAFAF8] flex flex-col justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-text-primary">Traction</p>
                    <p className="text-[10px] text-text-secondary mt-1">MRR, active users, and growth reports.</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <VerificationBadge tier={baseProfile.claims.traction} className="!px-2 !py-0.5 text-[10px]" />
                  </div>
                </div>

                {/* Endorsements Category */}
                <div className="border border-border-hairline rounded-card p-4 bg-[#FAFAF8] flex flex-col justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-text-primary">Endorsements</p>
                    <p className="text-[10px] text-text-secondary mt-1">Accelerators and incubator checks.</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <VerificationBadge tier={baseProfile.claims.endorsements} className="!px-2 !py-0.5 text-[10px]" />
                  </div>
                </div>

                {/* Funding Category */}
                <div className="border border-border-hairline rounded-card p-4 bg-[#FAFAF8] flex flex-col justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-text-primary">Funding</p>
                    <p className="text-[10px] text-text-secondary mt-1">Investor details and round records.</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <VerificationBadge tier={baseProfile.claims.funding} className="!px-2 !py-0.5 text-[10px]" />
                  </div>
                </div>
              </div>

              {/* Uploaded File Evidence (Owner View can see files, Visitor view only shows read-only summary list) */}
              <div className="bg-[#FAFAF8] border border-border-hairline rounded-card p-4 space-y-2 mt-4 text-xs">
                <p className="font-semibold text-text-primary">Evidence documents provided</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-secondary mt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">Certificate of Incorporation:</span>
                    <span>{baseProfile.coiFileName || "No document uploaded"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">Financials / Revenue Proof:</span>
                    <span>{baseProfile.financialsFileName || "No document uploaded"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">Pitch Deck:</span>
                    <span>{baseProfile.pitchDeckFileName || "No document uploaded"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">Cap Table:</span>
                    <span>{baseProfile.capTableFileName || "No document uploaded"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Side: Founders, Traction details */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Founders section */}
                <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-border-hairline pb-2.5">
                    <h3 className="text-sm font-semibold text-text-primary">Founders</h3>
                    {isOwner && (
                      <button className="text-[11px] font-semibold text-accent border border-border-hairline hover:bg-background px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer">
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {baseProfile.foundersList.map((founder, index) => (
                      <div
                        key={index}
                        className="bg-[#FAFAF8] border border-border-hairline rounded-card p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="truncate">
                          <p className="font-medium text-text-primary truncate">{founder.name}</p>
                          <p className="text-[10px] text-text-secondary mt-0.5">Co-founder</p>
                        </div>
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-surface border border-border-hairline text-text-secondary hover:text-accent rounded-button text-[10px] font-medium transition-colors"
                        >
                          LinkedIn
                        </a>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-text-secondary flex gap-2">
                    <span className="font-medium text-text-primary">Total team size:</span>
                    <span>{baseProfile.teamSize || "Not specified"} members</span>
                  </div>
                </div>

                {/* Traction Details section */}
                <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-border-hairline pb-2.5">
                    <h3 className="text-sm font-semibold text-text-primary">Stage & traction</h3>
                    {isOwner && (
                      <button className="text-[11px] font-semibold text-accent border border-border-hairline hover:bg-background px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer">
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="bg-[#FAFAF8] border border-border-hairline rounded-card p-3 text-center">
                      <p className="text-text-secondary">Current Stage</p>
                      <p className="text-base font-semibold text-text-primary mt-1 capitalize">{baseProfile.stage}</p>
                    </div>
                    <div className="bg-[#FAFAF8] border border-border-hairline rounded-card p-3 text-center">
                      <p className="text-text-secondary">Revenue (MRR)</p>
                      <p className="text-base font-semibold text-text-primary mt-1">
                        {baseProfile.revenueAmount !== undefined
                          ? formatCurrency(baseProfile.revenueAmount, baseProfile.revenueCurrency || "USD")
                          : "Not provided"}
                      </p>
                    </div>
                    <div className="bg-[#FAFAF8] border border-border-hairline rounded-card p-3 text-center">
                      <p className="text-text-secondary">Active Users</p>
                      <p className="text-base font-semibold text-text-primary mt-1">
                        {baseProfile.activeUsers !== undefined
                          ? baseProfile.activeUsers.toLocaleString()
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary flex gap-2 pt-2 border-t border-border-hairline/60">
                    <span className="font-medium text-text-primary">Growth rate:</span>
                    <span>{baseProfile.growthRate || "Not specified"}</span>
                  </div>
                </div>

              </div>

              {/* Right Side: Endorsements, Incubators, Funding round, Raising status */}
              <div className="space-y-6">
                
                {/* Endorsements column */}
                <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-border-hairline pb-2.5">
                    <h3 className="text-sm font-semibold text-text-primary">Endorsements</h3>
                    {isOwner && (
                      <button className="text-[11px] font-semibold text-accent border border-border-hairline hover:bg-background px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer">
                        Edit
                      </button>
                    )}
                  </div>
                  
                  {/* Incubators acceleration */}
                  <div className="space-y-1.5 text-xs">
                    <p className="text-text-secondary font-medium">Incubator / Accelerator history</p>
                    {baseProfile.incubators && baseProfile.incubators.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {baseProfile.incubators.map((name) => (
                          <span
                            key={name}
                            className="px-2 py-1 bg-[#FAFAF8] border border-border-hairline rounded-[6px] text-text-primary font-medium"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-secondary mt-1 font-light italic">No incubator listings reported.</p>
                    )}
                  </div>

                  {/* Raising Plans */}
                  <div className="space-y-1 text-xs pt-3 border-t border-border-hairline/60">
                    <p className="text-text-secondary font-medium font-semibold">Currently raising funds?</p>
                    <p className="text-sm font-medium text-text-primary mt-1 capitalize">
                      {baseProfile.currentlyRaising === "yes"
                        ? "Yes, actively raising capital"
                        : baseProfile.currentlyRaising === "planning"
                        ? "Planning a fundraising round soon"
                        : "No active fundraising plans"}
                    </p>
                  </div>
                </div>

                {/* External Funding Rounds list */}
                <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-border-hairline pb-2.5">
                    <h3 className="text-sm font-semibold text-text-primary">External funding</h3>
                    {isOwner && (
                      <button className="text-[11px] font-semibold text-accent border border-border-hairline hover:bg-background px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer">
                        Edit
                      </button>
                    )}
                  </div>

                  {baseProfile.investorsList && baseProfile.investorsList.length > 0 ? (
                    <div className="space-y-3">
                      {baseProfile.investorsList.map((round, index) => (
                        <div
                          key={index}
                          className="bg-[#FAFAF8] border border-border-hairline rounded-card p-3 text-xs space-y-1.5"
                        >
                          <div className="flex justify-between items-center font-medium">
                            <span className="text-text-primary">{round.round}</span>
                            <span className="text-accent">
                              {formatCurrency(round.amount, round.currency)}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-text-secondary">
                            <span>{round.name}</span>
                            <span>{round.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-secondary italic">No external investment rounds declared.</p>
                  )}
                </div>

              </div>

            </div>

            {/* AI Coaching Section (Owner View only) */}
            {isOwner && (
              <div className="bg-surface border border-border-hairline rounded-card p-6 space-y-3 animate-in fade-in duration-200">
                <h3 className="text-base font-semibold text-text-primary">
                  AI suggestions to improve your score
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
                  Our algorithm processes document uploads and endorsement tokens to calculate your baseline TrustScore. Below are suggestions prepared specifically for you to raise your verification tiers.
                </p>

                {/* Mock suggestions box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  {/* Basics Claim advice */}
                  {baseProfile.claims.basics !== "investor-backed" && (
                    <div className="border border-border-hairline rounded-card p-3 bg-[#FCF9F1] flex gap-2.5 text-xs text-text-primary">
                      <div className="w-5 h-5 bg-[#E8DBB0]/20 border border-[#E8DBB0]/50 rounded-full flex items-center justify-center text-[#7C5A03] flex-shrink-0 mt-0.5">
                        i
                      </div>
                      <div>
                        <p className="font-semibold text-[#7C5A03]">Verify startup registry credentials</p>
                        <p className="text-text-secondary mt-0.5 font-light">
                          Your startup Basics claim is currently {baseProfile.claims.basics}. Connect a government corporate registry registry key to raise this to investor-backed.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Financials Claim advice */}
                  {baseProfile.claims.traction === "self-reported" && (
                    <div className="border border-border-hairline rounded-card p-3 bg-[#FCF9F1] flex gap-2.5 text-xs text-text-primary">
                      <div className="w-5 h-5 bg-[#E8DBB0]/20 border border-[#E8DBB0]/50 rounded-full flex items-center justify-center text-[#7C5A03] flex-shrink-0 mt-0.5">
                        i
                      </div>
                      <div>
                        <p className="font-semibold text-[#7C5A03]">Provide revenue verification proof</p>
                        <p className="text-text-secondary mt-0.5 font-light">
                          Your Traction metrics are self-reported. Upload a verified Q4 audit sheet or platform billing records to elevate this to document-backed.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Founder Claim advice */}
                  {baseProfile.claims.founders === "self-reported" && (
                    <div className="border border-border-hairline rounded-card p-3 bg-[#FCF9F1] flex gap-2.5 text-xs text-text-primary">
                      <div className="w-5 h-5 bg-[#E8DBB0]/20 border border-[#E8DBB0]/50 rounded-full flex items-center justify-center text-[#7C5A03] flex-shrink-0 mt-0.5">
                        i
                      </div>
                      <div>
                        <p className="font-semibold text-[#7C5A03]">Validate founder identities</p>
                        <p className="text-text-secondary mt-0.5 font-light">
                          Founders are self-reported. Link third-party professional credentials or request accelerator endorsement to raise this tier.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
