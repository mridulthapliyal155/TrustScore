"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StartupCard from "@/components/StartupCard";
import { StartupCardData } from "@/types/startup";

const mockStartups: StartupCardData[] = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
    id: "solara-analytics",
    name: "Solara Analytics",
    logoUrl: "",
    description: "Predictive maintenance algorithms for utility-scale solar farms.",
    sector: "Energy",
    stage: "Idea",
    location: "Denver, CO",
    foundedYear: 2024,
    investorCount: 0,
    fundingRound: "Pre-Seed",
    trustScore: 0.48,
    badgeTier: "self-reported",
    showScore: true,
  },
  {
    id: "orion-cyber",
    name: "Orion Cyber",
    logoUrl: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=128&h=128&fit=crop&q=80",
    description: "Decentralized zero-trust endpoint access and threat modeling APIs.",
    sector: "Cybersecurity",
    stage: "Scaling",
    location: "San Francisco, CA",
    foundedYear: 2020,
    investorCount: 12,
    fundingRound: "Series B",
    trustScore: 0.92,
    badgeTier: "investor-backed",
    showScore: true,
  },
  {
    id: "aether-agriculture",
    name: "Aether Agriculture",
    logoUrl: "https://images.unsplash.com/photo-1618005198143-e528346d9a59?w=128&h=128&fit=crop&q=80",
    description: "Automated indoor vertical farming cabinets using aeroponic delivery systems.",
    sector: "Agtech",
    stage: "Revenue",
    location: "Chicago, IL",
    foundedYear: 2021,
    investorCount: 5,
    fundingRound: "Seed",
    trustScore: 0.76,
    badgeTier: "document-backed",
    showScore: true,
  },
  {
    id: "krypton-fin",
    name: "Krypton Fin",
    logoUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=128&h=128&fit=crop&q=80",
    description: "Next-generation credit scoring APIs based on alternative ledger history.",
    sector: "Fintech",
    stage: "MVP",
    location: "New York, NY",
    foundedYear: 2023,
    investorCount: 3,
    fundingRound: "Seed",
    trustScore: 0.62,
    badgeTier: "ai-extracted",
    showScore: true,
  },
  {
    id: "zephyr-materials",
    name: "Zephyr Materials",
    logoUrl: "",
    description: "Biodegradable natural polymers to replace single-use plastics.",
    sector: "Deeptech",
    stage: "Idea",
    location: "Los Angeles, CA",
    foundedYear: 2025,
    investorCount: 1,
    fundingRound: "Pre-Seed",
    trustScore: 0.54,
    badgeTier: "self-reported",
    showScore: true,
  },
  {
    id: "lumen-ai",
    name: "Lumen AI",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80",
    description: "Edge AI vision processing units for autonomous drone control.",
    sector: "AI",
    stage: "Scaling",
    location: "London, UK",
    foundedYear: 2022,
    investorCount: 9,
    fundingRound: "Series A",
    trustScore: 0.88,
    badgeTier: "stakeholder-endorsed",
    showScore: true,
  },
];

export default function DirectoryPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedStage, setSelectedStage] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <Navbar
        isLoggedIn={isLoggedIn}
        onAuthToggle={() => setIsLoggedIn((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-12 flex flex-col gap-10">
        {/* Page Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-medium tracking-tight text-text-primary">
            Startup Directory
          </h1>
          <p className="text-base text-text-secondary max-w-2xl leading-relaxed">
            Explore verified early-stage startups. Discover details about sector, staging, funding rounds, and their computed TrustScore credibility rating.
          </p>
        </div>

        {/* Visual-only Filter Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full bg-surface border border-border-hairline rounded-card p-4 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search startups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 border border-border-hairline rounded-button bg-surface pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
              disabled
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
            className="h-9 border border-border-hairline rounded-button bg-surface px-3 text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent cursor-not-allowed"
            disabled
          >
            <option value="">Sector</option>
            <option value="healthtech">Healthtech</option>
            <option value="logistics">Logistics</option>
            <option value="climate">Climate</option>
            <option value="energy">Energy</option>
            <option value="cybersecurity">Cybersecurity</option>
            <option value="agtech">Agtech</option>
            <option value="fintech">Fintech</option>
            <option value="deeptech">Deeptech</option>
            <option value="ai">AI</option>
          </select>

          {/* Stage Dropdown */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="h-9 border border-border-hairline rounded-button bg-surface px-3 text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent cursor-not-allowed"
            disabled
          >
            <option value="">Stage</option>
            <option value="idea">Idea</option>
            <option value="mvp">MVP</option>
            <option value="revenue">Revenue</option>
            <option value="scaling">Scaling</option>
          </select>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockStartups.map((startup, index) => (
            <StartupCard key={index} startup={startup} />
          ))}
        </div>
      </main>

      {/* Footer Layout */}
      <Footer />
    </div>
  );
}
