"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { BadgeTier } from "@/types/startup";

interface FounderEntry {
  name: string;
  linkedin: string;
}

interface InvestorEntry {
  name: string;
  amount: number;
  currency: string;
  round: string;
  date: string;
}

interface Company {
  id: string;
  owner_id: string;
  name: string;
  cin: string;
  legal_status: string;
  founded_date: string;
  sector: string;
  description: string;
  website: string | null;
  stage: string;
  revenue: number | null;
  revenue_currency: string;
  active_users: number | null;
  growth_rate: string | null;
  currently_raising: string;
  externally_funded: boolean;
  incubator: boolean;
  team_size: number | null;
  show_score: boolean;
  founders: FounderEntry[];
  incubators: string[];
  investors: InvestorEntry[];
  coi_filename: string | null;
  financials_filename: string | null;
  pitch_deck_filename: string | null;
  cap_table_filename: string | null;
  status: "pending" | "under_review" | "approved" | "rejected";
  trust_score: number | null;
  verification: Record<string, BadgeTier> | null;
  created_at: string;
}

export default function AdminReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  
  // Admin form state
  const [cinTier, setCinTier] = useState<BadgeTier>("self-reported");
  const [revenueTier, setRevenueTier] = useState<BadgeTier>("self-reported");
  const [foundersTier, setFoundersTier] = useState<BadgeTier>("self-reported");
  const [incubatorTier, setIncubatorTier] = useState<BadgeTier>("self-reported");
  const [fundingTier, setFundingTier] = useState<BadgeTier>("self-reported");
  const [scoreInput, setScoreInput] = useState<string>("");
  
  // Submit / validation states
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    async function checkAdminAndFetch() {
      try {
        // 1. Authenticate user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push("/auth?mode=signin");
          return;
        }

        // 2. RPC is_admin check
        const { data: isUserAdmin, error: rpcError } = await supabase.rpc("is_admin");
        if (rpcError || !isUserAdmin) {
          router.push("/dashboard");
          return;
        }

        setIsAdmin(true);

        // 3. Fetch company profile
        const { data, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", id)
          .single();

        if (companyError || !data) {
          setSubmitError("Company profile not found.");
        } else {
          const fetchedCompany = data as Company;
          setCompany(fetchedCompany);
          
          // Pre-populate fields
          const verificationObj = fetchedCompany.verification || {};
          setCinTier(verificationObj.cin || "self-reported");
          setRevenueTier(verificationObj.revenue || "self-reported");
          setFoundersTier(verificationObj.founders || "self-reported");
          setIncubatorTier(verificationObj.incubator || "self-reported");
          setFundingTier(verificationObj.funding || "self-reported");
          
          if (fetchedCompany.trust_score !== null) {
            setScoreInput(Math.round(fetchedCompany.trust_score * 100).toString());
          }
        }
      } catch (err: any) {
        setSubmitError(err.message || "An unexpected error occurred during page load.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      checkAdminAndFetch();
    }
  }, [id, router, supabase]);

  const handleAction = async (nextStatus: "approved" | "rejected" | "under_review") => {
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      let finalScore: number | null = null;

      // 1. Validation logic
      if (nextStatus === "approved") {
        if (!scoreInput.trim()) {
          throw new Error("A TrustScore is required to approve a company.");
        }
      }

      if (scoreInput.trim()) {
        const parsed = parseInt(scoreInput, 10);
        if (isNaN(parsed) || parsed < 0 || parsed > 100 || scoreInput.includes(".")) {
          throw new Error("TrustScore must be a whole number between 0 and 100.");
        }
        finalScore = parsed / 100;
      }

      // If status is rejected, default score is null
      if (nextStatus === "rejected") {
        finalScore = null;
      }

      const verificationPayload = {
        cin: cinTier,
        revenue: revenueTier,
        founders: foundersTier,
        incubator: incubatorTier,
        funding: fundingTier
      };

      // 2. Perform database update
      const { error } = await supabase
        .from("companies")
        .update({
          status: nextStatus,
          trust_score: finalScore,
          verification: verificationPayload
        })
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      setSubmitSuccess(`Startup has been successfully marked as ${nextStatus.replace("_", " ")}.`);
      
      // Update local company state
      if (company) {
        setCompany({
          ...company,
          status: nextStatus,
          trust_score: finalScore,
          verification: verificationPayload
        });
      }

      // Redirect to admin queue if approved or rejected
      if (nextStatus === "approved" || nextStatus === "rejected") {
        setTimeout(() => {
          router.push("/admin");
        }, 1500);
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-text-primary">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) return null;
  if (!company) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-text-primary">
        <Navbar />
        <main className="flex-1 max-w-[1100px] mx-auto px-4 md:px-6 py-12 text-center">
          <h2 className="text-xl font-medium text-text-primary">Startup profile not found or is unavailable</h2>
          <Link href="/admin" className="text-sm text-accent hover:underline mt-4 inline-block">
            &larr; Back to Review Queue
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const foundedYear = company.founded_date ? new Date(company.founded_date).getFullYear() : "N/A";
  const allowedTiers: { value: BadgeTier; label: string }[] = [
    { value: "self-reported", label: "Self-reported" },
    { value: "ai-extracted", label: "AI-extracted" },
    { value: "document-backed", label: "Document-backed" },
    { value: "investor-backed", label: "Investor-backed" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-12 flex flex-col gap-6">
        
        {/* Back Link Panel */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
          >
            &larr; Back to Review Queue
          </Link>
        </div>

        {/* Success/Error Banner */}
        {submitError && (
          <div className="bg-[#FFF5F5] border border-[#FFD8D8] text-danger text-xs p-4 rounded-card">
            <p className="font-semibold">Review Failed</p>
            <p className="mt-0.5">{submitError}</p>
          </div>
        )}
        {submitSuccess && (
          <div className="bg-[rgba(59,109,17,0.06)] border border-[rgba(59,109,17,0.15)] text-success text-xs p-4 rounded-card">
            <p className="font-semibold">Review Saved</p>
            <p className="mt-0.5">{submitSuccess}</p>
          </div>
        )}

        {/* Top Summary Banner */}
        <div className="bg-surface border border-border-hairline rounded-card p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl border border-border-hairline bg-[#FAFAF8] flex items-center justify-center font-semibold text-accent select-none">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-medium tracking-tight text-text-primary">{company.name}</h1>
              <p className="text-xs text-text-secondary mt-1 capitalize">Sector: {company.sector} | Status: {company.status.replace("_", " ")}</p>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[10px] text-text-secondary tracking-wider font-semibold">TrustScore</span>
            <span className="text-2xl font-medium text-text-primary tracking-tight mt-0.5">
              {company.trust_score !== null ? Math.round(company.trust_score * 100) : "Not scored"}
            </span>
          </div>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Read-Only Submitted Data */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basics Block */}
            <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-hairline pb-2">Basics & Identity</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-text-secondary font-medium">Corporate Identity Number (CIN)</p>
                  <p className="text-text-primary font-medium mt-0.5">{company.cin || "N/A"}</p>
                </div>
                <div>
                  <p className="text-text-secondary font-medium">Legal Status</p>
                  <p className="text-text-primary font-medium mt-0.5 capitalize">{company.legal_status || "N/A"}</p>
                </div>
                <div>
                  <p className="text-text-secondary font-medium">Founded Year</p>
                  <p className="text-text-primary font-medium mt-0.5">{foundedYear}</p>
                </div>
                <div>
                  <p className="text-text-secondary font-medium">Website</p>
                  <p className="text-text-primary font-medium mt-0.5">
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                        {company.website}
                      </a>
                    ) : "None"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-text-secondary font-medium">Description</p>
                  <p className="text-text-primary font-medium mt-0.5 leading-relaxed">{company.description || "No description provided."}</p>
                </div>
              </div>
            </div>

            {/* Founders Block */}
            <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-hairline pb-2">Founders & Leadership</h3>
              <div className="space-y-3">
                <div className="text-xs">
                  <p className="text-text-secondary font-medium">Team Size</p>
                  <p className="text-text-primary font-medium mt-0.5">{company.team_size || "Not stated"}</p>
                </div>
                {company.founders && company.founders.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {company.founders.map((founder, i) => (
                      <div key={i} className="bg-[#FAFAF8] border border-border-hairline rounded-card p-3 flex justify-between items-center text-xs">
                        <span className="font-medium text-text-primary">{founder.name}</span>
                        {founder.linkedin && (
                          <a href={founder.linkedin} target="_blank" rel="noreferrer" className="text-accent hover:underline font-medium">
                            LinkedIn
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-secondary">No founder listings provided.</p>
                )}
              </div>
            </div>

            {/* Stage & Traction Block */}
            <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-hairline pb-2">Stage & Financial Traction</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-text-secondary font-medium">Current Stage</p>
                  <p className="text-text-primary font-medium mt-0.5 capitalize">{company.stage || "N/A"}</p>
                </div>
                <div>
                  <p className="text-text-secondary font-medium">Annual/Monthly Revenue</p>
                  <p className="text-text-primary font-medium mt-0.5">
                    {company.revenue ? formatCurrency(company.revenue, company.revenue_currency || "INR") : "Self-reported: Zero / Undisclosed"}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary font-medium">Active Users</p>
                  <p className="text-text-primary font-medium mt-0.5">{company.active_users ? company.active_users.toLocaleString() : "Not stated"}</p>
                </div>
                <div>
                  <p className="text-text-secondary font-medium">Growth Rate</p>
                  <p className="text-text-primary font-medium mt-0.5">{company.growth_rate || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Endorsements & Funding Block */}
            <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-hairline pb-2">Endorsements & Capital</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-2">
                <div>
                  <p className="text-text-secondary font-medium">Incubated Startup?</p>
                  <p className="text-text-primary font-medium mt-0.5">{company.incubator ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-text-secondary font-medium">Currently Raising capital?</p>
                  <p className="text-text-primary font-medium mt-0.5 capitalize">{company.currently_raising || "N/A"}</p>
                </div>
              </div>

              {company.incubator && company.incubators && company.incubators.length > 0 && (
                <div className="text-xs">
                  <p className="text-text-secondary font-medium mb-1">Affiliated Incubators</p>
                  <div className="flex flex-wrap gap-2">
                    {company.incubators.map((inc, i) => (
                      <span key={i} className="bg-[#FAFAF8] border border-border-hairline px-2 py-0.5 rounded-[4px] text-text-primary">
                        {inc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {company.externally_funded && company.investors && company.investors.length > 0 ? (
                <div className="text-xs space-y-2 mt-3">
                  <p className="text-text-secondary font-medium border-t border-border-hairline pt-2.5">Capital Contributions & Investors</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {company.investors.map((inv, i) => (
                      <div key={i} className="bg-[#FAFAF8] border border-border-hairline rounded-card p-3 space-y-1">
                        <p className="font-medium text-text-primary">{inv.name}</p>
                        <p className="text-text-secondary text-[11px]">
                          Amount: {formatCurrency(inv.amount, inv.currency)} | Round: {inv.round}
                        </p>
                        <p className="text-text-secondary text-[10px]">Date: {new Date(inv.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs">
                  <p className="text-text-secondary font-medium">Externally Funded</p>
                  <p className="text-text-primary font-medium mt-0.5">{company.externally_funded ? "Yes (no details provided)" : "No"}</p>
                </div>
              )}
            </div>

            {/* Evidence Filenames Block */}
            <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-hairline pb-2">Uploaded Document Filenames</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary">
                <div>
                  <span className="font-semibold text-text-primary">Certificate of Incorporation:</span>
                  <p className="mt-0.5">{company.coi_filename || "None provided"}</p>
                </div>
                <div>
                  <span className="font-semibold text-text-primary">Financial statements / Revenue Proof:</span>
                  <p className="mt-0.5">{company.financials_filename || "None provided"}</p>
                </div>
                <div>
                  <span className="font-semibold text-text-primary">Pitch Deck:</span>
                  <p className="mt-0.5">{company.pitch_deck_filename || "None provided"}</p>
                </div>
                <div>
                  <span className="font-semibold text-text-primary">Cap Table:</span>
                  <p className="mt-0.5">{company.cap_table_filename || "None provided"}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Admin Controls sticky panel */}
          <div className="space-y-6 lg:sticky lg:top-24">
            
            <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-6">
              <div className="flex flex-col gap-1 border-b border-border-hairline pb-2.5">
                <h3 className="text-sm font-semibold text-text-primary">Admin Review Actions</h3>
                <p className="text-[11px] text-text-secondary">Set credibility levels and record the score outcome.</p>
              </div>

              {/* Tiers dropdown selectors */}
              <div className="space-y-4">
                
                {/* CIN Claim */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Basics & CIN Verification</label>
                  <select
                    value={cinTier}
                    onChange={(e) => setCinTier(e.target.value as BadgeTier)}
                    className="w-full border border-border-hairline bg-surface text-text-primary rounded-button px-3 py-2 text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                  >
                    {allowedTiers.map((tier) => (
                      <option key={tier.value} value={tier.value}>{tier.label}</option>
                    ))}
                  </select>
                </div>

                {/* Revenue Claim */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Traction & Revenue Verification</label>
                  <select
                    value={revenueTier}
                    onChange={(e) => setRevenueTier(e.target.value as BadgeTier)}
                    className="w-full border border-border-hairline bg-surface text-text-primary rounded-button px-3 py-2 text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                  >
                    {allowedTiers.map((tier) => (
                      <option key={tier.value} value={tier.value}>{tier.label}</option>
                    ))}
                  </select>
                </div>

                {/* Founders Claim */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Founders Verification</label>
                  <select
                    value={foundersTier}
                    onChange={(e) => setFoundersTier(e.target.value as BadgeTier)}
                    className="w-full border border-border-hairline bg-surface text-text-primary rounded-button px-3 py-2 text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                  >
                    {allowedTiers.map((tier) => (
                      <option key={tier.value} value={tier.value}>{tier.label}</option>
                    ))}
                  </select>
                </div>

                {/* Incubator Claim */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Endorsements & Incubator Verification</label>
                  <select
                    value={incubatorTier}
                    onChange={(e) => setIncubatorTier(e.target.value as BadgeTier)}
                    className="w-full border border-border-hairline bg-surface text-text-primary rounded-button px-3 py-2 text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                  >
                    {allowedTiers.map((tier) => (
                      <option key={tier.value} value={tier.value}>{tier.label}</option>
                    ))}
                  </select>
                </div>

                {/* Funding Claim */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Funding & Investor Verification</label>
                  <select
                    value={fundingTier}
                    onChange={(e) => setFundingTier(e.target.value as BadgeTier)}
                    className="w-full border border-border-hairline bg-surface text-text-primary rounded-button px-3 py-2 text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                  >
                    {allowedTiers.map((tier) => (
                      <option key={tier.value} value={tier.value}>{tier.label}</option>
                    ))}
                  </select>
                </div>

                {/* TrustScore Input */}
                <div className="flex flex-col gap-1.5 border-t border-border-hairline pt-4">
                  <label className="text-xs font-semibold text-text-primary">TrustScore (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter whole number"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                    className="w-full border border-border-hairline bg-surface text-text-primary rounded-button px-3 py-2 text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                  />
                  <p className="text-[10px] text-text-secondary">Stores as decimal score / 100 in database.</p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border-hairline">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleAction("approved")}
                  className="w-full bg-accent text-surface px-4 py-2 text-xs font-medium rounded-button hover:bg-opacity-90 active:scale-98 transition-all focus:outline-hidden disabled:opacity-50 cursor-pointer text-center"
                >
                  {submitting ? "Processing..." : "Approve"}
                </button>
                
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleAction("under_review")}
                  className="w-full border border-border-hairline text-text-primary bg-surface px-4 py-2 text-xs font-medium rounded-button hover:bg-background active:scale-98 transition-all focus:outline-hidden disabled:opacity-50 cursor-pointer text-center"
                >
                  {submitting ? "Saving..." : "Mark Under Review"}
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleAction("rejected")}
                  className="w-full bg-danger text-surface px-4 py-2 text-xs font-medium rounded-button hover:bg-opacity-90 active:scale-98 transition-all focus:outline-hidden disabled:opacity-50 cursor-pointer text-center"
                >
                  {submitting ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
