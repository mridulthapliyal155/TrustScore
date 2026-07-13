"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth?mode=signin");
      } else {
        const userRole = user.user_metadata?.role || user.user_metadata?.user_type;
        if (userRole !== "founder") {
          // If logged in as investor, redirect to directory
          router.push("/directory");
        } else {
          setUser(user);
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [router, supabase]);

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

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-12 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-surface border border-border-hairline rounded-card p-6 shadow-2xs text-center space-y-6 animate-in fade-in duration-200">
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
            <h1 className="text-2xl font-medium tracking-tight text-text-primary">
              Welcome to TrustScore AI
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              To start building your startup credibility profile and calculate your TrustScore, register your company details.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/register"
              className="block w-full text-center bg-accent text-surface py-2.5 text-sm font-medium rounded-button hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer shadow-xs focus:outline-hidden"
            >
              Onboard your company
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
