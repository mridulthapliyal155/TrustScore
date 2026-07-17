"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VerificationBadge from "@/components/VerificationBadge";
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
  status: "pending" | "under_review" | "approved" | "rejected";
  created_at: string;
  trust_score: number | null;
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
  verification?: Record<string, string> | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StartupProfilePage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [savingSharing, setSavingSharing] = useState(false);

  // Vouch Modal States
  const [showVouchModal, setShowVouchModal] = useState(false);
  const [vouchSuccess, setVouchSuccess] = useState(false);
  const [vouchRound, setVouchRound] = useState("");
  const [vouchAmount, setVouchAmount] = useState("");
  const [vouchCurrency, setVouchCurrency] = useState("INR");
  const [vouchInvestedOn, setVouchInvestedOn] = useState("");
  const [vouchInvestorNote, setVouchInvestorNote] = useState("");
  const [vouchProofFilename, setVouchProofFilename] = useState<string | null>(null);

  // Vouch Validation / Submission Errors
  const [vouchErrors, setVouchErrors] = useState({
    round: "",
    general: "",
  });
  const [vouchSubmitting, setVouchSubmitting] = useState(false);
  const [confirmedVouches, setConfirmedVouches] = useState<any[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCompanyAndUser() {
      try {
        setLoading(true);
        setFetchError("");

        // 1. Get current logged in user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // 2. Fetch company profile details
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", id)
          .single();

        if (companyError || !companyData) {
          setFetchError("Profile not found or is unavailable.");
          setLoading(false);
          return;
        }

        // 3. Check ownership and visibility access
        const isProfileOwner = currentUser !== null && currentUser.id === companyData.owner_id;

        // Visitors are only allowed to see approved profiles
        if (!isProfileOwner && companyData.status !== "approved") {
          setFetchError("Profile not available.");
          setLoading(false);
          return;
        }

        setCompany(companyData as Company);

        // 4. Fetch confirmed vouches for this company
        const { data: vouchesData, error: vouchesError } = await supabase
          .from("vouches")
          .select("id, round, investor_id")
          .eq("company_id", id)
          .eq("status", "confirmed");

        // 5. Fetch verification timeline events
        const { data: eventsData, error: eventsError } = await supabase
          .from("verification_events")
          .select("seq, id, event_type, created_at, payload, source_actor_id")
          .eq("company_id", id)
          .in("event_type", ["company_status_changed", "claim_tier_changed", "vouch_admin_confirmed"])
          .order("seq", { ascending: true });

        const uniqueInvestorIds = new Set<string>();
        if (vouchesData) {
          vouchesData.forEach((v) => uniqueInvestorIds.add(v.investor_id));
        }
        if (eventsData) {
          eventsData.forEach((e) => {
            if (e.source_actor_id) {
              uniqueInvestorIds.add(e.source_actor_id);
            }
          });
        }

        let profilesMap = new Map<string, string | null>();
        if (uniqueInvestorIds.size > 0) {
          const { data: profiles } = await supabase
            .from("confirmed_investors_public")
            .select("user_id, firm_name")
            .in("user_id", Array.from(uniqueInvestorIds));
          if (profiles) {
            profiles.forEach((p) => {
              profilesMap.set(p.user_id, p.firm_name);
            });
          }
        }

        if (!vouchesError && vouchesData) {
          const joinedVouches = vouchesData.map((v) => ({
            ...v,
            firm_name: profilesMap.get(v.investor_id) || "Angel Investor"
          }));
          setConfirmedVouches(joinedVouches);
        } else {
          setConfirmedVouches([]);
        }

        if (!eventsError && eventsData) {
          // Exclude claim_tier_changed events whose payload.new_tier is 'self-reported'
          const filtered = eventsData.filter((e) => {
            if (e.event_type === "claim_tier_changed") {
              const newTier = e.payload?.new_tier;
              return newTier && newTier !== "self-reported";
            }
            return true;
          });

          const mappedEvents = filtered.map((e) => {
            let label = "";
            if (e.event_type === "company_status_changed" && e.payload?.new_status === "approved") {
              label = "Registration approved";
            } else if (e.event_type === "claim_tier_changed") {
              const key = e.payload?.key;
              const newTier = e.payload?.new_tier;
              const keyLabels: Record<string, string> = {
                cin: "Corporate identity (CIN)",
                revenue: "Revenue",
                founders: "Founders",
                funding: "Funding",
                incubator: "Incubator",
              };
              const keyLabel = keyLabels[key] || key;
              label = `${keyLabel} claim verified as ${newTier}`;
            } else if (e.event_type === "vouch_admin_confirmed") {
              const firmName = e.source_actor_id ? (profilesMap.get(e.source_actor_id) || "Angel Investor") : "Angel Investor";
              label = `Backing confirmed from ${firmName}`;
            }
            return {
              ...e,
              formatted_label: label,
            };
          }).filter((e) => e.formatted_label !== "");

          setTimelineEvents(mappedEvents);
        } else {
          setTimelineEvents([]);
        }
      } catch (err: any) {
        setFetchError(err.message || "An error occurred while loading this profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchCompanyAndUser();
  }, [id, supabase]);

  const handleToggleSharing = async () => {
    if (!company) return;
    setSavingSharing(true);
    try {
      const nextShowScore = !company.show_score;
      const { error } = await supabase
        .from("companies")
        .update({ show_score: nextShowScore })
        .eq("id", company.id);

      if (error) {
        alert("Failed to update sharing settings: " + error.message);
      } else {
        setCompany({ ...company, show_score: nextShowScore });
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSavingSharing(false);
    }
  };

  const handleVouchClick = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from("investor_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setVouchErrors((prev) => ({ ...prev, general: "Failed to verify investor status: " + error.message }));
        return;
      }

      if (!profile) {
        router.push("/investor/register?notice=profile_required");
        return;
      }

      setShowVouchModal(true);
      setVouchSuccess(false);
      setVouchRound("");
      setVouchAmount("");
      setVouchCurrency("INR");
      setVouchInvestedOn("");
      setVouchInvestorNote("");
      setVouchProofFilename(null);
      setVouchErrors({ round: "", general: "" });
    } catch (err: any) {
      setVouchErrors((prev) => ({ ...prev, general: err.message || "An unexpected error occurred." }));
    }
  };

  const handleVouchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !company) return;

    setVouchErrors({ round: "", general: "" });

    const trimmedRound = vouchRound.trim();
    if (!trimmedRound) {
      setVouchErrors((prev) => ({ ...prev, round: "Round name is required." }));
      return;
    }

    setVouchSubmitting(true);

    // Normalise round by trim and lowercase before insert
    const normalisedRound = trimmedRound.toLowerCase();

    const payload = {
      investor_id: user.id,
      company_id: company.id,
      round: normalisedRound,
      amount: vouchAmount ? parseFloat(vouchAmount) : null,
      currency: vouchCurrency,
      invested_on: vouchInvestedOn || null,
      investor_note: vouchInvestorNote.trim() || null,
      proof_filename: vouchProofFilename || null,
    };

    try {
      const { error } = await supabase.from("vouches").insert(payload);

      if (error) {
        if (error.code === "23505") {
          setVouchErrors((prev) => ({
            ...prev,
            round: "You've already recorded a backing for this round.",
          }));
        } else {
          setVouchErrors((prev) => ({ ...prev, general: error.message }));
        }
      } else {
        setVouchSuccess(true);
      }
    } catch (err: any) {
      setVouchErrors((prev) => ({ ...prev, general: err.message || "Failed to record vouch." }));
    } finally {
      setVouchSubmitting(false);
    }
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

  if (fetchError || !company) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-text-primary">
        <Navbar />
        <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 h-12 bg-danger/10 border border-danger/20 rounded-full flex items-center justify-center text-danger">
            <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-text-primary">Profile Unavailable</h2>
          <p className="text-sm text-text-secondary max-w-md">
            {fetchError || "The requested startup profile could not be loaded."}
          </p>
          <div className="pt-2">
            <Link
              href="/directory"
              className="bg-accent text-surface px-4 py-2 text-sm font-medium rounded-button hover:bg-opacity-90 active:scale-98 transition-all focus:outline-hidden"
            >
              Back to Directory
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwner = user !== null && user.id === company.owner_id;
  const userRole = user?.user_metadata?.role || user?.user_metadata?.user_type || "";
  const isInvestor = userRole === "investor";
  const foundedYear = company.founded_date ? new Date(company.founded_date).getFullYear() : "N/A";

  // Every claim defaults to self-reported. Admin review will set real tiers later.
  const dbVerification = company.verification || {};
  const claims = {
    basics: (dbVerification.cin || "self-reported") as BadgeTier,
    founders: (dbVerification.founders || "self-reported") as BadgeTier,
    traction: (dbVerification.revenue || "self-reported") as BadgeTier,
    endorsements: (dbVerification.incubator || "self-reported") as BadgeTier,
    funding: (dbVerification.funding || "self-reported") as BadgeTier,
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">
        
        {/* Back Link Panel */}
        <div className="flex items-center gap-3">
          <Link
            href="/directory"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
          >
            &larr; Back to Directory
          </Link>
        </div>

        {/* Status Banner (Owner view only) */}
        {isOwner && (
          <div
            className={`border rounded-card p-4 flex items-start gap-3 text-xs leading-relaxed animate-in fade-in duration-200 ${
              company.status === "pending"
                ? "bg-[#FCF9F1] border-[#E8DBB0]/40 text-[#7C5A03]"
                : company.status === "under_review"
                ? "bg-[rgba(24,95,165,0.04)] border-[rgba(24,95,165,0.15)] text-accent"
                : company.status === "approved"
                ? "bg-[rgba(59,109,17,0.04)] border-[rgba(59,109,17,0.15)] text-success"
                : "bg-[#FFF5F5] border-[#FFD8D8] text-danger"
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {company.status === "approved" ? (
                <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 12 12" strokeWidth="2">
                  <polyline points="2.5 6 4.5 8 9.5 3.5" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-current animate-pulse" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="7" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-semibold capitalize">Status: {company.status.replace("_", " ")}</p>
              <p className="mt-1 font-normal text-text-secondary">
                {company.status === "pending" &&
                  "Your registration is pending. Review will begin shortly once our system aggregates baseline data."}
                {company.status === "under_review" &&
                  "Under review, this usually takes 10 to 15 days."}
                {company.status === "approved" &&
                  "Verified! Your profile is visible publicly in the investor directory list."}
                {company.status === "rejected" &&
                  "Your registration did not pass guidelines. Please reach out to verification support."}
              </p>
            </div>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-surface border border-border-hairline rounded-card p-6 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            {/* Logo initials fallback */}
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-border-hairline bg-[#FAFAF8] flex items-center justify-center flex-shrink-0 select-none">
              <span className="text-accent font-medium text-lg">
                {company.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            {/* Text Metadata */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-medium text-text-primary tracking-tight truncate">
                  {company.name}
                </h1>
                {isOwner && (
                  <span className="text-[10px] text-text-secondary px-2 py-0.5 bg-[#FAFAF8] border border-border-hairline rounded-full font-medium">
                    Owner profile
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                {company.description}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <strong className="font-semibold text-text-primary">Sector:</strong> {company.sector}
                </span>
                <span className="text-border-hairline">•</span>
                <span className="flex items-center gap-1">
                  <strong className="font-semibold text-text-primary">Stage:</strong> {company.stage}
                </span>
                <span className="text-border-hairline">•</span>
                <span className="flex items-center gap-1">
                  <strong className="font-semibold text-text-primary">Founded:</strong> {foundedYear}
                </span>
              </div>
            </div>
          </div>

          {/* TrustScore Display (Respecting Consent flag on Visitor view) */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2 md:border-l md:border-border-hairline md:pl-6">
            <div className="flex items-center gap-3">
              {isOwner ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-text-secondary tracking-wider font-semibold">
                      Trustscore
                    </span>
                    <span className="text-3xl font-medium text-text-primary tracking-tight mt-0.5">
                      {company.trust_score !== null ? Math.round(company.trust_score * 100) : "Not yet scored"}
                    </span>
                  </div>
                  
                  {/* Manage Sharing gear button */}
                  <button
                    type="button"
                    onClick={handleToggleSharing}
                    disabled={savingSharing}
                    className="p-1.5 border border-border-hairline hover:bg-background rounded-button transition-all cursor-pointer text-text-secondary hover:text-text-primary focus:outline-hidden disabled:opacity-50"
                    title="Manage sharing settings"
                  >
                    <svg className={`w-4 h-4 ${savingSharing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              ) : (
                /* Visitors view */
                company.status === "approved" && company.show_score ? (
                  company.trust_score !== null ? (
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-text-secondary tracking-wider font-semibold">
                          Trustscore
                        </span>
                        <span className="text-3xl font-medium text-text-primary tracking-tight mt-0.5">
                          {Math.round(company.trust_score * 100)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#FAFAF8] border border-border-hairline rounded-button text-text-secondary">
                      <span className="text-xs font-medium text-text-secondary leading-none">
                        Not yet scored
                      </span>
                    </div>
                  )
                ) : (
                  /* Score not shared */
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-[#FAFAF8] border border-border-hairline rounded-button text-text-secondary">
                    <svg className="w-4 h-4 text-text-secondary fill-none stroke-current" viewBox="0 0 14 14" strokeWidth="1.5">
                      <rect x="2.5" y="6" width="9" height="6" rx="1.5" />
                      <path d="M 4.5,6 V 3.5 A 2.5,2.5 0 0,1 9.5,3.5 V 6" />
                    </svg>
                    <span className="text-xs font-medium text-text-secondary leading-none">
                      Score not shared
                    </span>
                  </div>
                )
              )}
            </div>
            
            {/* Share status label (Owner only) */}
            {isOwner && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                company.show_score 
                  ? "bg-success/5 border-success/15 text-success" 
                  : "bg-neutral-100 border-neutral-200 text-text-secondary"
              }`}>
                {company.show_score ? "Score is public" : "Score is hidden"}
              </span>
            )}
          </div>
        </div>

        {/* Private Contact Box (Owner view only) */}
        {isOwner && (
          <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-3 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-border-hairline pb-2.5">
              <h3 className="text-sm font-semibold text-text-primary">
                Submitter contact details
              </h3>
              <button className="text-[11px] font-semibold text-accent border border-border-hairline hover:bg-background px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer select-none">
                Edit
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-text-secondary font-medium">Full Name</p>
                <p className="text-text-primary font-medium mt-0.5">{user?.user_metadata?.display_name || "Founder"}</p>
              </div>
              <div>
                <p className="text-text-secondary font-medium">Email Address</p>
                <p className="text-text-primary font-medium mt-0.5">{user?.email || ""}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Founder Card (Visitor view only) */}
        {!isOwner && (
          <div className="bg-surface border border-border-hairline rounded-card p-5 flex flex-col sm:flex-row justify-between items-center gap-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Interested in this startup?
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Request an introduction or contact the founders directly to discuss potential opportunities.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              {user && isInvestor && company.status === "approved" && (
                <button
                  type="button"
                  onClick={handleVouchClick}
                  className="h-9 px-4 border border-border-hairline hover:bg-background text-text-primary rounded-button text-xs font-medium transition-colors cursor-pointer select-none whitespace-nowrap animate-in fade-in duration-150"
                >
                  I Invested Here
                </button>
              )}
              <button
                type="button"
                onClick={() => alert("Contact request sent to the founder!")}
                className="h-9 px-4 bg-accent hover:bg-accent/90 text-surface rounded-button text-xs font-medium transition-colors cursor-pointer select-none whitespace-nowrap"
              >
                Contact founder
              </button>
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
              <button className="text-[11px] font-semibold text-accent border border-border-hairline hover:bg-background px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer select-none">
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
                <p className="text-[10px] text-text-secondary mt-1">CIN structure and corporate identification.</p>
              </div>
              <div className="flex items-center gap-1">
                {/* Admin review will set real tiers later */}
                <VerificationBadge tier={claims.basics} className="!px-2 !py-0.5 text-[10px]" />
              </div>
            </div>

            {/* Founders Category */}
            <div className="border border-border-hairline rounded-card p-4 bg-[#FAFAF8] flex flex-col justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-text-primary">Founders</p>
                <p className="text-[10px] text-text-secondary mt-1">LinkedIn URLs and profile verification.</p>
              </div>
              <div className="flex items-center gap-1">
                {/* Admin review will set real tiers later */}
                <VerificationBadge tier={claims.founders} className="!px-2 !py-0.5 text-[10px]" />
              </div>
            </div>

            {/* Traction Category */}
            <div className="border border-border-hairline rounded-card p-4 bg-[#FAFAF8] flex flex-col justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-text-primary">Traction</p>
                <p className="text-[10px] text-text-secondary mt-1">MRR, active users, and growth reports.</p>
              </div>
              <div className="flex items-center gap-1">
                {/* Admin review will set real tiers later */}
                <VerificationBadge tier={claims.traction} className="!px-2 !py-0.5 text-[10px]" />
              </div>
            </div>

            {/* Endorsements Category */}
            <div className="border border-border-hairline rounded-card p-4 bg-[#FAFAF8] flex flex-col justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-text-primary">Endorsements</p>
                <p className="text-[10px] text-text-secondary mt-1">Accelerators and incubator checks.</p>
              </div>
              <div className="flex items-center gap-1">
                {/* Admin review will set real tiers later */}
                <VerificationBadge tier={claims.endorsements} className="!px-2 !py-0.5 text-[10px]" />
              </div>
            </div>

            {/* Funding Category */}
            <div className="border border-border-hairline rounded-card p-4 bg-[#FAFAF8] flex flex-col justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-text-primary">Funding</p>
                <p className="text-[10px] text-text-secondary mt-1">Investor details and round records.</p>
              </div>
              <div className="flex items-center gap-1">
                {/* Admin review will set real tiers later */}
                <VerificationBadge tier={claims.funding} className="!px-2 !py-0.5 text-[10px]" />
              </div>
            </div>
          </div>

          {/* Uploaded File Evidence Summary */}
          <div className="bg-[#FAFAF8] border border-border-hairline rounded-card p-4 space-y-2 mt-4 text-xs">
            <p className="font-semibold text-text-primary">Evidence documents provided</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-secondary mt-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary">Certificate of Incorporation:</span>
                <span>{company.coi_filename || "None provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary">Financials / Revenue Proof:</span>
                <span>{company.financials_filename || "None provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary">Pitch Deck:</span>
                <span>{company.pitch_deck_filename || "None provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary">Cap Table:</span>
                <span>{company.cap_table_filename || "None provided"}</span>
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
                  <button className="text-[11px] font-semibold text-accent border border-border-hairline hover:bg-background px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer select-none">
                    Edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company.founders && company.founders.length > 0 ? (
                  company.founders.map((founder, index) => (
                    <div
                      key={index}
                      className="bg-[#FAFAF8] border border-border-hairline rounded-card p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="truncate">
                        <p className="font-medium text-text-primary truncate">{founder.name}</p>
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
                  ))
                ) : (
                  <p className="text-xs text-text-secondary italic">No founders registered.</p>
                )}
              </div>
              {company.team_size !== null && (
                <div className="text-xs text-text-secondary flex gap-2">
                  <span className="font-medium text-text-primary">Total team size:</span>
                  <span>{company.team_size} members</span>
                </div>
              )}
            </div>

            {/* Traction Details section */}
            <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-border-hairline pb-2.5">
                <h3 className="text-sm font-semibold text-text-primary">Stage & traction</h3>
                {isOwner && (
                  <button className="text-[11px] font-semibold text-accent border border-border-hairline hover:bg-background px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer select-none">
                    Edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#FAFAF8] border border-border-hairline rounded-card p-3 text-center">
                  <p className="text-text-secondary">Current Stage</p>
                  <p className="text-base font-semibold text-text-primary mt-1 capitalize">{company.stage}</p>
                </div>
                <div className="bg-[#FAFAF8] border border-border-hairline rounded-card p-3 text-center">
                  <p className="text-text-secondary">Revenue</p>
                  <p className="text-base font-semibold text-text-primary mt-1">
                    {company.revenue !== null
                      ? formatCurrency(company.revenue, company.revenue_currency || "USD")
                      : "Not provided"}
                  </p>
                </div>
                <div className="bg-[#FAFAF8] border border-border-hairline rounded-card p-3 text-center">
                  <p className="text-text-secondary">Active Users</p>
                  <p className="text-base font-semibold text-text-primary mt-1">
                    {company.active_users !== null
                      ? company.active_users.toLocaleString()
                      : "Not provided"}
                  </p>
                </div>
              </div>
              {company.growth_rate && (
                <div className="text-xs text-text-secondary flex gap-2 pt-2 border-t border-border-hairline/60">
                  <span className="font-medium text-text-primary">Growth rate:</span>
                  <span>{company.growth_rate}</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Side: Endorsements, Incubators, Raising status */}
          <div className="space-y-6">
            
            {/* Backed by Section */}
            {confirmedVouches.length > 0 && (
              <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-border-hairline pb-2.5">
                  <h3 className="text-sm font-semibold text-text-primary">Backed by</h3>
                </div>
                <div className="space-y-3">
                  {confirmedVouches.map((vouch) => (
                    <div
                      key={vouch.id}
                      className="bg-[#FAFAF8] border border-border-hairline rounded-[6px] p-3 text-xs space-y-1 text-left"
                    >
                      <p className="font-semibold text-text-primary">
                        {vouch.firm_name}
                      </p>
                      <p className="text-[10px] text-text-secondary capitalize">
                        Backed round: {vouch.round}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Verification Timeline Section */}
            {timelineEvents.length > 0 && (
              <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-border-hairline pb-2.5">
                  <h3 className="text-sm font-semibold text-text-primary">Verification Timeline</h3>
                </div>
                <div className="relative pl-4 space-y-6 text-xs text-left before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-hairline">
                  {timelineEvents.map((event) => (
                    <div key={event.id} className="relative space-y-1">
                      {/* Timeline Node Icon */}
                      <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border border-accent bg-surface" />
                      
                      <p className="font-medium text-text-primary">
                        {event.formatted_label}
                      </p>
                      <p className="text-[10px] text-text-secondary font-light">
                        {new Date(event.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Endorsements column */}
            <div className="bg-surface border border-border-hairline rounded-card p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-border-hairline pb-2.5">
                <h3 className="text-sm font-semibold text-text-primary">Endorsements</h3>
                {isOwner && (
                  <button className="text-[11px] font-semibold text-accent border border-border-hairline hover:bg-background px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer select-none">
                    Edit
                  </button>
                )}
              </div>
              
              {/* Incubators acceleration */}
              <div className="space-y-1.5 text-xs">
                <p className="text-text-secondary font-medium">Incubator / Accelerator history</p>
                {company.incubator && company.incubators && company.incubators.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {company.incubators.map((name) => (
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
                  {company.currently_raising === "yes"
                    ? "Yes, actively raising capital"
                    : company.currently_raising === "planning"
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
                  <button className="text-[11px] font-semibold text-accent border border-border-hairline hover:bg-background px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer select-none">
                    Edit
                  </button>
                )}
              </div>

              {company.externally_funded && company.investors && company.investors.length > 0 ? (
                <div className="space-y-3">
                  {company.investors.map((round, index) => (
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

        {/* AI Suggestions Section (Owner View only) */}
        {isOwner && (
          <div className="bg-surface border border-border-hairline rounded-card p-6 space-y-3 animate-in fade-in duration-200">
            <h3 className="text-base font-semibold text-text-primary">
              Suggestions to build your credibility profile
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
              Based on the credentials you submitted, here are some actionable recommendations to strengthen your profile verify tier.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              {/* Dummy Advice 1 */}
              <div className="border border-border-hairline rounded-card p-3 bg-[#FCF9F1] flex gap-2.5 text-xs text-text-primary">
                <div className="w-5 h-5 bg-[#E8DBB0]/20 border border-[#E8DBB0]/50 rounded-full flex items-center justify-center text-[#7C5A03] flex-shrink-0 mt-0.5">
                  i
                </div>
                <div>
                  <p className="font-semibold text-[#7C5A03]">Provide revenue verification proof</p>
                  <p className="text-text-secondary mt-0.5 font-light">
                    Your Traction metrics are self-reported. Consider connecting official audit sheets or accounting platform tokens during review.
                  </p>
                </div>
              </div>

              {/* Dummy Advice 2 */}
              <div className="border border-border-hairline rounded-card p-3 bg-[#FCF9F1] flex gap-2.5 text-xs text-text-primary">
                <div className="w-5 h-5 bg-[#E8DBB0]/20 border border-[#E8DBB0]/50 rounded-full flex items-center justify-center text-[#7C5A03] flex-shrink-0 mt-0.5">
                  i
                </div>
                <div>
                  <p className="font-semibold text-[#7C5A03]">Validate founder identities</p>
                  <p className="text-text-secondary mt-0.5 font-light">
                    Your founders claim is self-reported. The review team will verify LinkedIn profiles once your registration starts processing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </main>

      {/* Vouch Form Modal Overlay */}
      {showVouchModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-surface border border-border-hairline rounded-card p-6 md:p-8 shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-150 text-left">
            {vouchSuccess ? (
              <div className="space-y-6 text-center animate-in fade-in duration-200">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 border border-success/15 text-success">
                  <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 12 12" strokeWidth="2">
                    <polyline points="2.5 6 4.5 8 9.5 3.5" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-text-primary">Backing Recorded</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Recorded. The founder will be asked to confirm this backing.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    className="w-full h-9 bg-accent hover:bg-accent/90 text-surface rounded-button text-sm font-medium transition-colors cursor-pointer select-none flex items-center justify-center"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVouchModal(false);
                      setVouchSuccess(false);
                    }}
                    className="w-full h-9 border border-border-hairline hover:bg-background text-text-primary rounded-button text-sm font-medium transition-colors cursor-pointer select-none"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-border-hairline pb-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-text-primary">Record Your Backing</h3>
                    <button
                      type="button"
                      onClick={() => setShowVouchModal(false)}
                      className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                      aria-label="Close modal"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed font-light">
                    Note: Your firm name (or profile type if angel) will appear publicly on the company profile once this backing is confirmed by the founder and reviewed.
                  </p>
                </div>

                {vouchErrors.general && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-150 text-danger text-xs font-medium">
                    {vouchErrors.general}
                  </div>
                )}

                <form onSubmit={handleVouchSubmit} className="space-y-4">
                  {/* Round Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="vouch_round" className="text-xs font-semibold text-text-primary">
                      Round <span className="text-accent">*</span>
                    </label>
                    <input
                      id="vouch_round"
                      type="text"
                      placeholder="e.g. Seed, Pre-Series A"
                      value={vouchRound}
                      onChange={(e) => {
                        setVouchRound(e.target.value);
                        setVouchErrors((prev) => ({ ...prev, round: "" }));
                      }}
                      className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                    />
                    {vouchErrors.round && (
                      <span className="text-xs text-danger mt-0.5">{vouchErrors.round}</span>
                    )}
                  </div>

                  {/* Amount & Currency */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="vouch_amount" className="text-xs font-semibold text-text-primary">
                        Amount
                      </label>
                      <input
                        id="vouch_amount"
                        type="number"
                        placeholder="e.g. 500000"
                        value={vouchAmount}
                        onChange={(e) => setVouchAmount(e.target.value)}
                        className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="vouch_currency" className="text-xs font-semibold text-text-primary">
                        Currency
                      </label>
                      <select
                        id="vouch_currency"
                        value={vouchCurrency}
                        onChange={(e) => setVouchCurrency(e.target.value)}
                        className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>

                  {/* Date Invested */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="vouch_date" className="text-xs font-semibold text-text-primary">
                      Date invested
                    </label>
                    <input
                      id="vouch_date"
                      type="date"
                      value={vouchInvestedOn}
                      onChange={(e) => setVouchInvestedOn(e.target.value)}
                      className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                    />
                  </div>

                  {/* Note Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="vouch_note" className="text-xs font-semibold text-text-primary">
                      Investor note
                    </label>
                    <textarea
                      id="vouch_note"
                      placeholder="Anything the founder or reviewer should know."
                      maxLength={300}
                      rows={3}
                      value={vouchInvestorNote}
                      onChange={(e) => setVouchInvestorNote(e.target.value)}
                      className="w-full border border-border-hairline rounded-button p-3 bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent resize-none font-sans"
                    />
                    <span className="text-[10px] text-text-secondary text-right">
                      {vouchInvestorNote.length}/300 chars
                    </span>
                  </div>

                  {/* Proof Document Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-primary">
                      Proof document
                    </label>
                    
                    {vouchProofFilename ? (
                      <div className="flex items-center justify-between border border-border-hairline rounded-button bg-surface p-3 text-sm text-text-primary">
                        <span className="truncate font-medium text-xs">{vouchProofFilename}</span>
                        <button
                          type="button"
                          onClick={() => setVouchProofFilename(null)}
                          className="text-xs text-text-secondary hover:text-accent font-medium cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border border-dashed border-border-hairline hover:border-accent/40 rounded-button bg-surface p-4 text-center cursor-pointer group transition-colors duration-150">
                        <svg className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors duration-150 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-xs text-text-primary font-medium">Select proof file</span>
                        <span className="text-[10px] text-text-secondary mt-0.5">Filename will be stored locally</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setVouchProofFilename(e.target.files[0].name);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowVouchModal(false)}
                      className="flex-1 h-9 border border-border-hairline hover:bg-background text-text-primary rounded-button text-sm font-medium transition-colors cursor-pointer select-none text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={vouchSubmitting}
                      className="flex-1 h-9 bg-accent hover:bg-accent/90 text-surface rounded-button text-sm font-medium transition-colors cursor-pointer select-none flex items-center justify-center gap-2 disabled:bg-opacity-50 disabled:cursor-not-allowed"
                    >
                      {vouchSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin"></div>
                          <span>Recording...</span>
                        </>
                      ) : (
                        <span>Record Backing</span>
                      )}
                    </button>
                  </div>
                </form>
              </>
              )}
            </div>
          </div>
        )}

      <Footer />
    </div>
  );
}
