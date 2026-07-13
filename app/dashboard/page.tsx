"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface Company {
  id: string;
  name: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  created_at: string;
  trust_score: number | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    async function checkAuthAndFetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth?mode=signin");
      } else {
        const userRole = user.user_metadata?.role || user.user_metadata?.user_type;
        if (userRole !== "founder") {
          router.push("/directory");
        } else {
          setUser(user);
          try {
            const { data, error } = await supabase
              .from("companies")
              .select("id, name, status, created_at, trust_score")
              .eq("owner_id", user.id)
              .order("created_at", { ascending: false });

            if (error) {
              setFetchError(error.message);
            } else {
              setCompanies(data || []);
            }
          } catch (err: any) {
            setFetchError(err.message || "Failed to load company profiles.");
          }
        }
      }
      setLoading(false);
    }
    checkAuthAndFetch();
  }, [router, supabase]);

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

  const displayName = user.user_metadata?.display_name || user.email || "";
  const userInitials = displayName
    ? displayName.split(/\s+/).map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "US";
  const userRole = user.user_metadata?.role || "Founder";

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-12 flex flex-col gap-8">
        {/* Title Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-medium tracking-tight text-text-primary">
            Founder Dashboard
          </h1>
          <p className="text-sm text-text-secondary">
            Manage your registered startups and track credibility profiles.
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

        {/* Startups section */}
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
                    className="w-full bg-surface border border-border-hairline rounded-card p-5 space-y-4 hover:border-accent/30 transition-all duration-150"
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
      </main>

      <Footer />
    </div>
  );
}
