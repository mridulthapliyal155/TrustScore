"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { InvestorProfile } from "@/types/investor";
import { Vouch } from "@/types/vouch";

interface Company {
  id: string;
  name: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  created_at: string;
  trust_score: number | null;
}

interface VouchWithCompany {
  id: string;
  amount: number | null;
  currency: string;
  round: string;
  status: Vouch["status"];
  company_id: string;
  companies: {
    name: string;
  } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Founder Dashboard States
  const [companies, setCompanies] = useState<Company[]>([]);
  const [incomingVouches, setIncomingVouches] = useState<any[]>([]);
  const [resolvedVouches, setResolvedVouches] = useState<any[]>([]);
  const [disputingVouchId, setDisputingVouchId] = useState<string | null>(null);
  const [disputeNote, setDisputeNote] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState<string | null>(null);

  // Investor Dashboard States
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [vouches, setVouches] = useState<VouchWithCompany[]>([]);

  useEffect(() => {
    async function checkAuthAndFetch() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth");
          return;
        }

        setUser(user);
        const userRole = user.user_metadata?.role || user.user_metadata?.user_type;

        if (userRole === "investor") {
          // Fetch investor profile and vouches
          const [profileRes, vouchesRes] = await Promise.all([
            supabase
              .from("investor_profiles")
              .select("user_id, investor_type, firm_name, firm_website, linkedin_url")
              .eq("user_id", user.id)
              .maybeSingle(),
            supabase
              .from("vouches")
              .select(`
                id,
                amount,
                currency,
                round,
                status,
                company_id,
                companies (
                  name
                )
              `)
              .eq("investor_id", user.id)
              .order("created_at", { ascending: false })
          ]);

          if (profileRes.error) {
            setFetchError(profileRes.error.message);
          } else {
            setInvestorProfile(profileRes.data);
          }

          if (vouchesRes.error) {
            setFetchError((prev) => prev || vouchesRes.error.message);
          } else {
            setVouches((vouchesRes.data as unknown as VouchWithCompany[]) || []);
          }
        } else if (userRole === "founder") {
          // Default to founder branch for founder
          const { data, error } = await supabase
            .from("companies")
            .select("id, name, status, created_at, trust_score")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });

          if (error) {
            setFetchError(error.message);
          } else {
            setCompanies(data || []);

            // Now fetch vouches for all of these companies!
            const companyIds = data ? data.map((c) => c.id) : [];
            if (companyIds.length > 0) {
              const { data: vouchesData, error: vouchesError } = await supabase
                .from("vouches")
                .select("id, amount, currency, round, status, created_at, invested_on, investor_note, proof_filename, company_id, investor_id")
                .in("company_id", companyIds)
                .order("created_at", { ascending: false });

              if (vouchesError) {
                setFetchError((prev) => prev || vouchesError.message);
              } else if (vouchesData && vouchesData.length > 0) {
                // Batch query the investor profiles client-side to do the join
                const investorIds = Array.from(new Set(vouchesData.map((v) => v.investor_id)));
                const { data: profiles, error: profilesError } = await supabase
                  .from("investor_profiles")
                  .select("user_id, firm_name, investor_type")
                  .in("user_id", investorIds);

                const profilesMap: Record<string, { firm_name: string | null; investor_type: string }> = {};
                if (profiles) {
                  profiles.forEach((p) => {
                    profilesMap[p.user_id] = {
                      firm_name: p.firm_name,
                      investor_type: p.investor_type,
                    };
                  });
                }

                // Match in-memory
                const joinedVouches = vouchesData.map((v) => {
                  const companyObj = data.find((c) => c.id === v.company_id);
                  const profileObj = profilesMap[v.investor_id];
                  
                  // Construct investor name
                  let investorName = "Angel Investor";
                  if (profileObj) {
                    if (profileObj.investor_type === "angel") {
                      investorName = "Angel Investor";
                    } else if (profileObj.firm_name) {
                      investorName = profileObj.firm_name;
                    } else {
                      investorName = `Investor (${profileObj.investor_type.toUpperCase()})`;
                    }
                  }

                  return {
                    ...v,
                    company_name: companyObj ? companyObj.name : "Unknown Startup",
                    investor_name: investorName,
                  };
                });

                // Filter into incoming vs resolved
                const incoming = joinedVouches.filter((v) => v.status === "pending_founder");
                const resolved = joinedVouches.filter((v) => v.status === "pending_admin" || v.status === "disputed");

                setIncomingVouches(incoming);
                setResolvedVouches(resolved);
              } else {
                setIncomingVouches([]);
                setResolvedVouches([]);
              }
            }
          }
        }
      } catch (err: any) {
        setFetchError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndFetch();
  }, [router, supabase]);

  const handleConfirmVouch = async (vouchId: string) => {
    setActionSubmitting(vouchId);
    setFetchError("");

    try {
      const { error } = await supabase
        .from("vouches")
        .update({ status: "pending_admin" })
        .eq("id", vouchId);

      if (error) {
        setFetchError(error.message);
      } else {
        // Move from incoming to resolved in UI
        const confirmedVouch = incomingVouches.find((v) => v.id === vouchId);
        if (confirmedVouch) {
          const updated = { ...confirmedVouch, status: "pending_admin" as const };
          setIncomingVouches((prev) => prev.filter((v) => v.id !== vouchId));
          setResolvedVouches((prev) => [updated, ...prev]);
        }
      }
    } catch (err: any) {
      setFetchError(err.message || "Failed to confirm vouch.");
    } finally {
      setActionSubmitting(null);
    }
  };

  const handleDisputeVouchSubmit = async (vouchId: string) => {
    setActionSubmitting(vouchId);
    setFetchError("");

    try {
      const { error } = await supabase
        .from("vouches")
        .update({
          status: "disputed",
          founder_note: disputeNote.trim() || null,
        })
        .eq("id", vouchId);

      if (error) {
        setFetchError(error.message);
      } else {
        // Move from incoming to resolved in UI
        const disputedVouch = incomingVouches.find((v) => v.id === vouchId);
        if (disputedVouch) {
          const updated = {
            ...disputedVouch,
            status: "disputed" as const,
            founder_note: disputeNote.trim() || null,
          };
          setIncomingVouches((prev) => prev.filter((v) => v.id !== vouchId));
          setResolvedVouches((prev) => [updated, ...prev]);
        }
        // Reset dispute view states
        setDisputingVouchId(null);
        setDisputeNote("");
      }
    } catch (err: any) {
      setFetchError(err.message || "Failed to dispute vouch.");
    } finally {
      setActionSubmitting(null);
    }
  };

  // Founder Helper Methods
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success/10 border-success/20 text-success";
      case "rejected":
        return "bg-danger/10 border-danger/20 text-danger";
      case "under_review":
        return "bg-warning/10 border-warning/20 text-warning";
      case "pending":
      default:
        return "bg-[#FAFAF8] border border-[#E8E6E0] text-text-secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "under_review":
        return "Under Review";
      case "pending":
      default:
        return "Pending";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved. Your trust score and profile are active and public.";
      case "rejected":
        return "Rejected. Please reach out to our verification support team.";
      case "under_review":
        return "Under review, this usually takes 10 to 15 days.";
      case "pending":
      default:
        return "Pending verification, our team will begin reviewing shortly.";
    }
  };

  // Investor Helper Methods
  const getInvestorTypeLabel = (type: string) => {
    switch (type) {
      case "angel":
        return "Angel";
      case "vc":
        return "VC";
      case "family_office":
        return "Family Office";
      case "syndicate":
        return "Syndicate";
      case "corporate":
        return "Corporate";
      default:
        return type;
    }
  };

  const getVouchStatusLabel = (status: string) => {
    switch (status) {
      case "pending_founder":
        return "Awaiting founder";
      case "pending_admin":
        return "Awaiting review";
      case "confirmed":
        return "Confirmed";
      case "disputed":
        return "Disputed";
      case "rejected":
        return "Not confirmed";
      default:
        return status;
    }
  };

  const getVouchStatusStyles = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/10 border-success/20 text-success";
      case "pending_founder":
      case "pending_admin":
      case "disputed":
        return "bg-warning/10 border-warning/20 text-warning";
      case "rejected":
      default:
        return "bg-danger/10 border-danger/20 text-danger";
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

  if (!user) return null;

  const rawUserRole = user.user_metadata?.role || user.user_metadata?.user_type || "";
  const isInvestor = rawUserRole === "investor";
  const isFounder = rawUserRole === "founder";
  const userRole = isInvestor ? "Investor" : isFounder ? "Founder" : "User";

  const displayName = user.user_metadata?.display_name || user.email || "";
  const userInitials = displayName
    ? displayName
        .split(/\s+/)
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US";

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-12 flex flex-col gap-8">
        {/* Title Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-medium tracking-tight text-text-primary">
            {userRole} Dashboard
          </h1>
          <p className="text-sm text-text-secondary">
            {isInvestor
              ? "Manage your investor profile and track recorded backings."
              : isFounder
              ? "Manage your registered startups and track credibility profiles."
              : "Complete your profile credentials to access features."}
          </p>
        </div>

        {/* Account panel */}
        <div className="w-full bg-surface border border-border-hairline rounded-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center text-accent font-medium select-none">
              {userInitials}
            </div>
            <div>
              <h2 className="text-base font-medium text-text-primary">
                {displayName}
              </h2>
              <p className="text-xs text-text-secondary capitalize mt-0.5">
                {userRole} Account
              </p>
            </div>
          </div>
          <div className="text-xs text-text-secondary flex flex-col sm:items-end">
            <span className="font-mono">{user.email}</span>
          </div>
        </div>

        {/* Error notice */}
        {fetchError && (
          <div className="w-full p-4 rounded-lg bg-red-50 border border-red-150 text-danger text-sm font-medium">
            {fetchError}
          </div>
        )}

        {!isInvestor && !isFounder ? (
          /* Neutral / Complete Your Account State for unknown/missing roles */
          <div className="max-w-md mx-auto w-full bg-surface border border-border-hairline rounded-card p-6 shadow-2xs text-center space-y-4 my-8 animate-in fade-in duration-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-warning/10 border border-warning/15 mb-2 text-warning">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary">Complete Your Account</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Please register your role as either a founder or investor to access the dashboard.
            </p>
          </div>
        ) : isInvestor ? (
          /* Investor Branch */
          <>
            {/* Profile Section */}
            {!investorProfile ? (
              <div className="w-full bg-surface border border-border-hairline rounded-card p-6 md:p-8 space-y-4 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-text-primary">Complete Your Profile</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Tell us who you are before you record a backing.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/investor/register"
                    className="inline-flex items-center justify-center bg-accent text-surface px-5 h-9 text-sm font-medium rounded-button hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer shadow-xs focus:outline-hidden"
                  >
                    Complete Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="w-full bg-surface border border-border-hairline rounded-card p-5 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-hairline/60 pb-3">
                  <h3 className="text-lg font-medium text-text-primary">Investor Profile</h3>
                  <Link
                    href="/investor/register"
                    className="h-9 px-4 rounded-button text-sm font-medium border border-border-hairline hover:bg-background cursor-pointer text-text-primary transition-colors select-none flex items-center justify-center"
                  >
                    Edit Profile
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-text-secondary font-medium">Investor Type</p>
                    <p className="text-text-primary mt-1">{getInvestorTypeLabel(investorProfile.investor_type)}</p>
                  </div>
                  {investorProfile.investor_type !== "angel" && investorProfile.firm_name && (
                    <div>
                      <p className="text-xs text-text-secondary font-medium">Firm Name</p>
                      <p className="text-text-primary mt-1">{investorProfile.firm_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-text-secondary font-medium">LinkedIn URL</p>
                    <a
                      href={investorProfile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline mt-1 block truncate font-medium"
                    >
                      {investorProfile.linkedin_url}
                    </a>
                  </div>
                  {investorProfile.firm_website && (
                    <div>
                      <p className="text-xs text-text-secondary font-medium">Firm Website</p>
                      <a
                        href={investorProfile.firm_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline mt-1 block truncate font-medium"
                      >
                        {investorProfile.firm_website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* My Backings Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium tracking-tight text-text-primary">My Backings</h2>

              {vouches.length === 0 ? (
                <div className="max-w-md mx-auto w-full bg-surface border border-border-hairline rounded-card p-6 shadow-2xs text-center space-y-6 animate-in fade-in duration-200 mt-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 border border-accent/15 mb-2 text-accent">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-text-primary">No backings yet</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      You haven't recorded any backings yet.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/directory"
                      className="block w-full text-center bg-transparent border border-border-hairline hover:bg-background text-text-primary py-2.5 text-sm font-medium rounded-button transition-colors cursor-pointer shadow-xs focus:outline-hidden"
                    >
                      Browse Startups
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {vouches.map((vouch) => (
                    <div
                      key={vouch.id}
                      className="w-full bg-surface border border-border-hairline rounded-card p-5 space-y-4 hover:border-accent/30 transition-all duration-150 text-left"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <Link
                            href={`/startup/${vouch.company_id}`}
                            className="text-lg font-medium text-text-primary hover:text-accent transition-colors"
                          >
                            {vouch.companies?.name || "Unknown Startup"}
                          </Link>
                          <p className="text-xs text-text-secondary">
                            Backing round: {vouch.round} &bull; Amount:{" "}
                            {vouch.amount !== null
                              ? `${vouch.amount.toLocaleString()} ${vouch.currency.toUpperCase()}`
                              : `N/A ${vouch.currency.toUpperCase()}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVouchStatusStyles(
                              vouch.status
                            )}`}
                          >
                            {getVouchStatusLabel(vouch.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Founder Branch */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Incoming Backings Section */}
            {incomingVouches.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-medium tracking-tight text-text-primary">
                  Incoming Backings ({incomingVouches.length})
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {incomingVouches.map((vouch) => {
                    const isDisputing = disputingVouchId === vouch.id;
                    const isBusy = actionSubmitting === vouch.id;

                    return (
                      <div
                        key={vouch.id}
                        className="w-full bg-surface border border-border-hairline rounded-card p-5 space-y-4 hover:border-accent/30 transition-all duration-150 text-left animate-in fade-in duration-200"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-semibold text-text-primary">
                                {vouch.investor_name}
                              </span>
                              <span className="text-xs text-text-secondary font-light">backed</span>
                              <span className="text-sm font-semibold text-text-primary">
                                {vouch.company_name}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                              <div>
                                <p className="text-[10px] uppercase font-semibold text-text-secondary">Round</p>
                                <p className="font-medium text-text-primary mt-0.5 capitalize">{vouch.round}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-semibold text-text-secondary">Amount</p>
                                <p className="font-medium text-text-primary mt-0.5">
                                  {vouch.amount !== null
                                    ? `${vouch.amount.toLocaleString()} ${vouch.currency.toUpperCase()}`
                                    : `N/A ${vouch.currency.toUpperCase()}`}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-semibold text-text-secondary">Date Invested</p>
                                <p className="font-medium text-text-primary mt-0.5">
                                  {vouch.invested_on
                                    ? new Date(vouch.invested_on).toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-semibold text-text-secondary">Submitted</p>
                                <p className="font-medium text-text-primary mt-0.5">
                                  {new Date(vouch.created_at).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>

                            {vouch.investor_note && (
                              <div className="bg-background/40 p-3 rounded-button border border-border-hairline/40 text-xs">
                                <p className="font-semibold text-text-secondary mb-0.5">Investor Note</p>
                                <p className="text-text-primary italic">"{vouch.investor_note}"</p>
                              </div>
                            )}

                            {vouch.proof_filename && (
                              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                <svg className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <span>Proof document: <span className="font-medium">{vouch.proof_filename}</span></span>
                              </div>
                            )}
                          </div>

                          {!isDisputing && (
                            <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleConfirmVouch(vouch.id)}
                                className="flex-1 md:flex-none h-8 px-4 bg-accent hover:bg-accent/90 text-surface rounded-button text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isBusy && actionSubmitting === vouch.id ? (
                                  <div className="w-3.5 h-3.5 border border-surface border-t-transparent rounded-full animate-spin"></div>
                                ) : null}
                                Confirm
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => {
                                  setDisputingVouchId(vouch.id);
                                  setDisputeNote("");
                                }}
                                className="flex-1 md:flex-none h-8 px-4 border border-border-hairline hover:bg-background text-text-primary rounded-button text-xs font-semibold transition-all cursor-pointer"
                              >
                                Dispute
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Inline Dispute Expander */}
                        {isDisputing && (
                          <div className="border-t border-border-hairline pt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-col gap-1.5">
                              <label htmlFor={`dispute_note_${vouch.id}`} className="text-xs font-semibold text-text-primary">
                                Reason for disagreement <span className="text-text-secondary font-light">(optional explainer for the admin)</span>
                              </label>
                              <textarea
                                id={`dispute_note_${vouch.id}`}
                                rows={2}
                                placeholder="Explain why this backing is incorrect or disputed..."
                                value={disputeNote}
                                onChange={(e) => setDisputeNote(e.target.value)}
                                className="w-full border border-border-hairline rounded-button p-2.5 bg-surface text-xs text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent resize-none font-sans"
                              />
                            </div>
                            <div className="flex justify-end gap-2 text-xs">
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => {
                                  setDisputingVouchId(null);
                                  setDisputeNote("");
                                }}
                                className="h-8 px-3 border border-border-hairline hover:bg-background text-text-primary rounded-button font-medium cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleDisputeVouchSubmit(vouch.id)}
                                className="h-8 px-3 bg-danger text-surface hover:bg-danger/90 rounded-button font-medium cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                              >
                                {isBusy && actionSubmitting === vouch.id ? (
                                  <div className="w-3.5 h-3.5 border border-surface border-t-transparent rounded-full animate-spin"></div>
                                ) : null}
                                Confirm Dispute
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Resolved Backings Section */}
            {resolvedVouches.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-medium tracking-tight text-text-primary">
                  Resolved Backings
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {resolvedVouches.map((vouch) => (
                    <div
                      key={vouch.id}
                      className="w-full bg-surface border border-border-hairline rounded-card p-5 space-y-3 hover:border-accent/15 transition-all duration-150 text-left"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-semibold text-text-primary">
                              {vouch.investor_name}
                            </span>
                            <span className="text-xs text-text-secondary font-light">backed</span>
                            <span className="text-sm font-semibold text-text-primary">
                              {vouch.company_name}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary">
                            Round: {vouch.round} &bull; Amount:{" "}
                            {vouch.amount !== null
                              ? `${vouch.amount.toLocaleString()} ${vouch.currency.toUpperCase()}`
                              : `N/A ${vouch.currency.toUpperCase()}`}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVouchStatusStyles(
                              vouch.status
                            )}`}
                          >
                            {getVouchStatusLabel(vouch.status)}
                          </span>
                        </div>
                      </div>

                      {vouch.founder_note && (
                        <div className="bg-[#FCF9F1]/80 p-3 rounded-button border border-[#E8DBB0]/40 text-xs text-[#7C5A03]">
                          <p className="font-semibold mb-0.5">Dispute Note</p>
                          <p className="italic">"{vouch.founder_note}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Your Startups Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium tracking-tight text-text-primary">
                Your Startups
              </h2>

              {companies.length === 0 ? (
                /* Empty state welcome card */
                <div className="max-w-md mx-auto w-full bg-surface border border-border-hairline rounded-card p-6 shadow-2xs text-center space-y-6 animate-in fade-in duration-200 mt-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 border border-accent/15 mb-2 text-accent">
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-text-primary">
                      No startups onboarded yet
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      To start building your startup credibility profile and calculate your TrustScore, register your first startup's details.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/register"
                      className="block w-full text-center bg-accent text-surface py-2.5 text-sm font-medium rounded-button hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer shadow-xs focus:outline-hidden"
                    >
                      Onboard your startup
                    </Link>
                  </div>
                </div>
              ) : (
                /* Companies list view */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {companies.map((company) => (
                      <div
                        key={company.id}
                        className="w-full bg-surface border border-border-hairline rounded-card p-5 space-y-4 hover:border-accent/30 transition-all duration-150 text-left"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h3 className="text-lg font-medium text-text-primary">
                              {company.name}
                            </h3>
                            <p className="text-xs text-text-secondary">
                              Submitted on{" "}
                              {new Date(company.created_at).toLocaleDateString(
                                undefined,
                                { year: "numeric", month: "long", day: "numeric" }
                              )}
                            </p>
                          </div>

                          {/* Status and Score */}
                          <div className="flex flex-wrap items-center gap-3">
                            {/* Status Pill */}
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(
                                company.status
                              )}`}
                            >
                              {getStatusLabel(company.status)}
                            </span>

                            {/* TrustScore (only if approved) */}
                            {company.status === "approved" &&
                              company.trust_score !== null && (
                                <div className="flex items-center gap-1.5 bg-success/5 border border-success/15 px-2.5 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                                  <span className="text-xs font-semibold text-success">
                                    TrustScore: {Math.round(company.trust_score * 100)}/100
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Short Status Line */}
                        <div className="border-t border-border-hairline pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <p className="text-xs text-text-secondary italic">
                            {getStatusMessage(company.status)}
                          </p>
                          <Link
                            href={`/startup/${company.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                          >
                            View profile
                            <svg
                              className="w-3.5 h-3.5 stroke-current fill-none"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add another startup button */}
                  <div className="pt-2 flex justify-start">
                    <Link
                      href="/register"
                      className="bg-accent text-surface px-4 py-2 text-sm font-medium rounded-button hover:bg-opacity-90 active:scale-98 transition-all focus:outline-hidden"
                    >
                      Add another startup
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
