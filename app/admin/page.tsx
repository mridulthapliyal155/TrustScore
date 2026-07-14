"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

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
        const { data, error: fetchError } = await supabase
          .from("companies")
          .select("id, name, sector, created_at, status")
          .in("status", ["pending", "under_review"])
          .order("created_at", { ascending: true });

        if (fetchError) {
          setErrorMsg(fetchError.message);
        } else {
          setCompanies(data || []);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "An unexpected error occurred while loading the queue.");
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndFetch();
  }, [router, supabase]);

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

        {/* Queue Table Card */}
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
      </main>

      <Footer />
    </div>
  );
}
