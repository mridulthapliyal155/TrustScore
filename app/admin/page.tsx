"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Vouch } from "@/types/vouch";

interface CompanyQueueItem {
  id: string;
  name: string;
  sector: string;
  created_at: string;
  status: "pending" | "under_review" | "approved" | "rejected";
}

export default function AdminQueuePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [companies, setCompanies] = useState<CompanyQueueItem[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState<"companies" | "vouches">("companies");

  // Vouch Queue States
  const [vouches, setVouches] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmingVouchId, setConfirmingVouchId] = useState<string | null>(null);
  const [rejectingVouchId, setRejectingVouchId] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminAndFetch() {
      try {
        // 1. Check authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push("/auth?mode=signin");
          return;
        }

        // 2. Call the is_admin() RPC function
        const { data: isUserAdmin, error: rpcError } = await supabase.rpc("is_admin");
        if (rpcError || !isUserAdmin) {
          console.warn("Unauthorized access attempt. Redirecting to founder dashboard.");
          router.push("/dashboard");
          return;
        }

        setIsAdmin(true);

        // 3. Fetch companies awaiting review
        const { data: companiesData, error: fetchError } = await supabase
          .from("companies")
          .select("id, name, sector, created_at, status")
          .in("status", ["pending", "under_review"])
          .order("created_at", { ascending: true });

        if (fetchError) {
          setErrorMsg(fetchError.message);
        } else {
          setCompanies(companiesData || []);
        }

        // 4. Fetch vouches awaiting review (status pending_admin or disputed)
        const { data: vouchesData, error: vouchesError } = await supabase
          .from("vouches")
          .select(`
            id,
            amount,
            currency,
            round,
            status,
            invested_on,
            investor_note,
            proof_filename,
            created_at,
            founder_note,
            founder_responded_at,
            company_id,
            investor_id
          `)
          .in("status", ["pending_admin", "disputed"])
          .order("created_at", { ascending: false });

        if (vouchesError) {
          setErrorMsg((prev) => prev || vouchesError.message);
        } else if (vouchesData && vouchesData.length > 0) {
          // Perform in-memory client-side join with companies and investor profiles
          const uniqueCompanyIds = Array.from(new Set(vouchesData.map((v) => v.company_id)));
          const uniqueInvestorIds = Array.from(new Set(vouchesData.map((v) => v.investor_id)));

          const [companiesRes, profilesRes] = await Promise.all([
            supabase
              .from("companies")
              .select("id, name")
              .in("id", uniqueCompanyIds),
            supabase
              .from("investor_profiles")
              .select("user_id, firm_name, investor_type")
              .in("user_id", uniqueInvestorIds),
          ]);

          const companiesMap: Record<string, string> = {};
          if (companiesRes.data) {
            companiesRes.data.forEach((c) => {
              companiesMap[c.id] = c.name;
            });
          }

          const profilesMap: Record<string, { firm_name: string | null; investor_type: string }> = {};
          if (profilesRes.data) {
            profilesRes.data.forEach((p) => {
              profilesMap[p.user_id] = {
                firm_name: p.firm_name,
                investor_type: p.investor_type,
              };
            });
          }

          const joined = vouchesData.map((v) => {
            const profile = profilesMap[v.investor_id];
            let investorName = "Angel Investor";
            if (profile) {
              if (profile.investor_type === "angel") {
                investorName = "Angel Investor";
              } else if (profile.firm_name) {
                investorName = profile.firm_name;
              } else {
                investorName = `Investor (${profile.investor_type.toUpperCase()})`;
              }
            }

            return {
              ...v,
              company_name: companiesMap[v.company_id] || "Unknown Startup",
              investor_name: investorName,
              investor_type: profile ? profile.investor_type : "angel",
            };
          });

          setVouches(joined);
        } else {
          setVouches([]);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "An unexpected error occurred while loading the queue.");
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndFetch();
  }, [router, supabase]);

  const handleConfirmVouch = async (vouchId: string) => {
    setActionLoading(vouchId);
    setErrorMsg("");
    try {
      const { error } = await supabase
        .from("vouches")
        .update({ status: "confirmed" })
        .eq("id", vouchId);

      if (error) {
        setErrorMsg(error.message);
      } else {
        // Remove from list on success
        setVouches((prev) => prev.filter((v) => v.id !== vouchId));
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to confirm vouch.");
    } finally {
      setActionLoading(null);
      setConfirmingVouchId(null);
    }
  };

  const handleRejectVouch = async (vouchId: string) => {
    setActionLoading(vouchId);
    setErrorMsg("");
    try {
      const { error } = await supabase
        .from("vouches")
        .update({ status: "rejected" })
        .eq("id", vouchId);

      if (error) {
        setErrorMsg(error.message);
      } else {
        // Remove from list on success
        setVouches((prev) => prev.filter((v) => v.id !== vouchId));
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reject vouch.");
    } finally {
      setActionLoading(null);
      setRejectingVouchId(null);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "under_review":
        return "bg-warning/10 border-warning/20 text-warning";
      case "pending":
      default:
        return "bg-[#FAFAF8] border border-[#E8E6E0] text-text-secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "under_review":
        return "Under Review";
      case "pending":
      default:
        return "Pending";
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

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-12 flex flex-col gap-8">
        {/* Title Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-medium tracking-tight text-text-primary">
            Review Queue
          </h1>
          <p className="text-sm text-text-secondary">
            Select a submitted company profile to perform verification checks and assign a TrustScore.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-[#FFF5F5] border border-[#FFD8D8] text-danger text-xs p-4 rounded-card">
            <p className="font-semibold">Error Loading Queue</p>
            <p className="mt-1 font-normal text-text-secondary">{errorMsg}</p>
          </div>
        )}

        {/* Tab Selection Header */}
        <div className="flex border-b border-border-hairline gap-6 mb-2">
          <button
            type="button"
            onClick={() => setActiveTab("companies")}
            className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === "companies"
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Startups Queue ({companies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("vouches")}
            className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === "vouches"
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Vouches Queue ({vouches.length})
          </button>
        </div>

        {activeTab === "companies" ? (
          /* Startups Queue */
          <div className="w-full bg-surface border border-border-hairline rounded-card overflow-hidden">
            {companies.length === 0 ? (
              <div className="p-8 text-center">
                <svg
                  className="w-10 h-10 text-text-secondary/40 mx-auto stroke-current fill-none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-sm font-semibold text-text-primary mt-3">No startups currently awaiting review</h3>
                <p className="text-xs text-text-secondary mt-1">All startup submissions have been processed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-hairline bg-[#FAFAF8] text-xs font-semibold text-text-secondary tracking-wider">
                      <th className="py-4 px-6">Company Name</th>
                      <th className="py-4 px-6">Sector</th>
                      <th className="py-4 px-6">Submitted Date</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-hairline text-sm">
                    {companies.map((company) => (
                      <tr 
                        key={company.id} 
                        className="hover:bg-[#FAFAF8] transition-colors cursor-pointer group"
                        onClick={() => router.push(`/admin/${company.id}`)}
                      >
                        <td className="py-4 px-6 font-medium text-text-primary group-hover:text-accent transition-colors">
                          {company.name}
                        </td>
                        <td className="py-4 px-6 text-text-secondary">
                          {company.sector}
                        </td>
                        <td className="py-4 px-6 text-text-secondary">
                          {new Date(company.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide ${getStatusStyles(company.status)}`}>
                            {getStatusLabel(company.status)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-xs font-semibold text-accent group-hover:underline flex items-center justify-end gap-1">
                            Review details &rarr;
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Vouches Queue */
          <div className="w-full bg-surface border border-border-hairline rounded-card overflow-hidden animate-in fade-in duration-200">
            {vouches.length === 0 ? (
              <div className="p-8 text-center">
                <svg
                  className="w-10 h-10 text-text-secondary/40 mx-auto stroke-current fill-none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-sm font-semibold text-text-primary mt-3">No backings currently awaiting review</h3>
                <p className="text-xs text-text-secondary mt-1">All investor backing claims have been processed.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-hairline">
                {vouches.map((vouch) => {
                  const isBusy = actionLoading === vouch.id;
                  const isConfirming = confirmingVouchId === vouch.id;
                  const isRejecting = rejectingVouchId === vouch.id;
                  const isDisputed = vouch.status === "disputed";

                  return (
                    <div
                      key={vouch.id}
                      className="p-6 space-y-4 hover:bg-[#FAFAF8]/50 transition-colors text-left"
                    >
                      {/* Vouch Header & Metadata */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
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
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                            <span className="capitalize">Type: {vouch.investor_type}</span>
                            <span>&bull;</span>
                            <span className="capitalize">Round: {vouch.round}</span>
                            <span>&bull;</span>
                            <span>
                              Amount:{" "}
                              {vouch.amount !== null
                                ? `${vouch.amount.toLocaleString()} ${vouch.currency.toUpperCase()}`
                                : `N/A ${vouch.currency.toUpperCase()}`}
                            </span>
                          </div>
                        </div>

                        {/* Status Label */}
                        <div>
                          {isDisputed ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-warning/20 bg-warning/10 text-warning">
                              Disputed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-border-hairline bg-surface text-text-secondary">
                              Founder agreed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Evidence block: Note & File */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background/30 p-4 rounded-button border border-border-hairline/40 text-xs">
                        <div className="space-y-1">
                          <p className="font-semibold text-text-secondary uppercase text-[10px]">Investor note</p>
                          <p className="text-text-primary italic">
                            {vouch.investor_note ? `"${vouch.investor_note}"` : "No note provided."}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-text-secondary uppercase text-[10px]">Proof document</p>
                          {vouch.proof_filename ? (
                            <div className="flex items-center gap-1.5 text-text-primary font-medium mt-0.5">
                              <svg className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span>{vouch.proof_filename}</span>
                            </div>
                          ) : (
                            <p className="text-text-secondary italic">No proof file uploaded.</p>
                          )}
                        </div>
                      </div>

                      {/* Founder explainer for dispute if present */}
                      {isDisputed && vouch.founder_note && (
                        <div className="bg-[#FCF9F1]/80 p-3 rounded-button border border-[#E8DBB0]/40 text-xs text-[#7C5A03]">
                          <p className="font-semibold mb-0.5">Founder Disagreement Explainer</p>
                          <p className="italic">"{vouch.founder_note}"</p>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-text-secondary font-light">
                        <div>
                          Submitted:{" "}
                          <span className="font-medium text-text-primary">
                            {new Date(vouch.created_at).toLocaleString()}
                          </span>
                        </div>
                        {vouch.founder_responded_at && (
                          <>
                            <span>&bull;</span>
                            <div>
                              Founder Responded:{" "}
                              <span className="font-medium text-text-primary">
                                {new Date(vouch.founder_responded_at).toLocaleString()}
                              </span>
                            </div>
                          </>
                        )}
                        {vouch.invested_on && (
                          <>
                            <span>&bull;</span>
                            <div>
                              Invested On:{" "}
                              <span className="font-medium text-text-primary">
                                {new Date(vouch.invested_on).toLocaleDateString()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action buttons or Inline confirmations */}
                      <div className="pt-2 border-t border-border-hairline/60">
                        {isConfirming ? (
                          <div className="bg-[#FCF9F1] border border-[#E8DBB0]/40 p-4 rounded-button text-xs text-text-primary flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
                            <div>
                              <p className="font-semibold text-[#7C5A03]">Are you sure you want to confirm this backing?</p>
                              <p className="text-text-secondary mt-0.5 font-light">
                                This action is permanent and irreversible. The backing will be locked as confirmed.
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setConfirmingVouchId(null)}
                                className="h-7 px-3 border border-border-hairline bg-surface text-text-primary rounded-button text-[10px] font-semibold hover:bg-background cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleConfirmVouch(vouch.id)}
                                className="h-7 px-3 bg-accent text-surface hover:bg-opacity-90 rounded-button text-[10px] font-semibold cursor-pointer"
                              >
                                Yes, Confirm
                              </button>
                            </div>
                          </div>
                        ) : isRejecting ? (
                          <div className="bg-[#FFF5F5] border border-[#FFD8D8] p-4 rounded-button text-xs text-text-primary flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
                            <div>
                              <p className="font-semibold text-danger">Are you sure you want to reject this backing?</p>
                              <p className="text-text-secondary mt-0.5 font-light">
                                This action is permanent and irreversible. The backing will be locked as rejected.
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setRejectingVouchId(null)}
                                className="h-7 px-3 border border-border-hairline bg-surface text-text-primary rounded-button text-[10px] font-semibold hover:bg-background cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleRejectVouch(vouch.id)}
                                className="h-7 px-3 bg-danger text-surface hover:bg-opacity-90 rounded-button text-[10px] font-semibold cursor-pointer"
                              >
                                Yes, Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => {
                                setConfirmingVouchId(vouch.id);
                                setRejectingVouchId(null);
                              }}
                              className="h-8 px-4 bg-accent hover:bg-accent/90 text-surface rounded-button text-xs font-semibold transition-all cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => {
                                setRejectingVouchId(vouch.id);
                                setConfirmingVouchId(null);
                              }}
                              className="h-8 px-4 border border-border-hairline hover:bg-background text-text-primary rounded-button text-xs font-semibold transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
