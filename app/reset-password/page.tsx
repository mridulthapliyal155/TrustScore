"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg("Please enter your new password.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Password successfully updated. Redirecting to sign in page...");
        setTimeout(() => {
          router.push("/auth?mode=signin");
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-surface border border-border-hairline rounded-card p-6 shadow-2xs">
      <div className="space-y-1.5 mb-6 text-left">
        <h2 className="text-xl font-medium text-text-primary">Set new password</h2>
        <p className="text-sm text-text-secondary">Enter and confirm your new password below.</p>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-150 text-danger text-sm font-medium text-left">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-150 text-success text-sm font-medium text-left">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-medium text-text-secondary">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-[36px] px-3 border border-border-hairline rounded-button text-sm bg-surface text-text-primary placeholder-text-secondary focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-medium text-text-secondary">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-[36px] px-3 border border-border-hairline rounded-button text-sm bg-surface text-text-primary placeholder-text-secondary focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[36px] mt-2 bg-accent text-surface text-sm font-medium rounded-button hover:bg-opacity-95 active:scale-98 transition-all flex items-center justify-center cursor-pointer focus:outline-hidden disabled:bg-opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Update password"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <Suspense
          fallback={
            <div className="max-w-md w-full bg-surface border border-border-hairline rounded-card p-6 shadow-2xs text-center">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-text-secondary">Loading...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
