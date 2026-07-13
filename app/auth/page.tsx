"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Mode state: signin, signup, forgot, confirm_sent
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "confirm_sent">(initialMode);
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"founder" | "investor">("founder");

  // UX Feedback
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync mode parameter if it changes externally
  useEffect(() => {
    const queryMode = searchParams.get("mode");
    if (queryMode === "signup" || queryMode === "signin") {
      setMode(queryMode);
    }
    
    // Check for callback redirect errors
    const errorParam = searchParams.get("error");
    if (errorParam === "verification_failed") {
      setErrorMsg("Email verification link could not be verified or has expired. Please try again.");
    }
  }, [searchParams]);

  // Reset errors on mode toggle
  const handleModeChange = (newMode: "signin" | "signup" | "forgot") => {
    setMode(newMode);
    setErrorMsg("");
    setSuccessMsg("");
    setPassword("");
    setFullName("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("confirm") || error.message.toLowerCase().includes("verified")) {
          setErrorMsg("Please check your email to confirm your account before signing in.");
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        const userRole = data.user.user_metadata?.role || data.user.user_metadata?.user_type;
        if (userRole === "founder") {
          router.push("/dashboard");
        } else if (userRole === "investor") {
          router.push("/directory");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role: role,
            user_type: role,
            display_name: fullName,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // Check if user is created successfully
      if (data?.user) {
        setMode("confirm_sent");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Check your email for password reset instructions.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-surface border border-border-hairline rounded-card p-6 shadow-2xs">
      {/* Top Segmented Tab Switcher (Visible only if not in confirm/forgot mode) */}
      {(mode === "signin" || mode === "signup") && (
        <div className="flex bg-background p-1 rounded-lg border border-border-hairline mb-6">
          <button
            type="button"
            onClick={() => handleModeChange("signin")}
            className={`flex-1 text-center text-sm font-medium py-2 rounded-md transition-all cursor-pointer ${
              mode === "signin"
                ? "bg-surface text-text-primary shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("signup")}
            className={`flex-1 text-center text-sm font-medium py-2 rounded-md transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-surface text-text-primary shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Sign up
          </button>
        </div>
      )}

      {/* Header and Subtitles */}
      <div className="space-y-1.5 mb-6 text-left">
        <h2 className="text-xl font-medium text-text-primary">
          {mode === "signin" && "Welcome back"}
          {mode === "signup" && "Create account"}
          {mode === "forgot" && "Reset password"}
          {mode === "confirm_sent" && "Verify your email"}
        </h2>
        <p className="text-sm text-text-secondary">
          {mode === "signin" && "Enter your credentials to access your dashboard."}
          {mode === "signup" && "Select your role and enter details to get started."}
          {mode === "forgot" && "Enter your email address to receive a password reset link."}
          {mode === "confirm_sent" && "We have sent a verification link to your email address."}
        </p>
      </div>

      {/* Message Banners */}
      {errorMsg && (
        <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-150 text-danger text-sm font-medium">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-150 text-success text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Forms */}
      {mode === "confirm_sent" ? (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-left space-y-2">
            <p className="text-sm text-text-primary font-medium">Next steps:</p>
            <ol className="text-xs text-text-secondary list-decimal list-inside space-y-1.5 leading-relaxed">
              <li>Open your email inbox for <strong className="text-text-primary font-medium">{email}</strong>.</li>
              <li>Click the confirmation link sent to you.</li>
              <li>You will be redirected automatically to your workspace.</li>
            </ol>
          </div>
          <button
            type="button"
            onClick={() => handleModeChange("signin")}
            className="w-full text-center text-sm font-medium text-accent hover:underline mt-4 cursor-pointer"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <form
          onSubmit={
            mode === "signin"
              ? handleSignIn
              : mode === "signup"
              ? handleSignUp
              : handleForgotPassword
          }
          className="space-y-4 text-left"
        >
          {/* Sign up role picker */}
          {mode === "signup" && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("founder")}
                  className={`py-2 px-3 border rounded-lg text-sm font-medium text-center transition-all cursor-pointer ${
                    role === "founder"
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-border-hairline text-text-secondary hover:text-text-primary bg-surface"
                  }`}
                >
                  Founder
                </button>
                <button
                  type="button"
                  onClick={() => setRole("investor")}
                  className={`py-2 px-3 border rounded-lg text-sm font-medium text-center transition-all cursor-pointer ${
                    role === "investor"
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-border-hairline text-text-secondary hover:text-text-primary bg-surface"
                  }`}
                >
                  Investor
                </button>
              </div>
            </div>
          )}

          {/* Full Name */}
          {mode === "signup" && (
            <div className="space-y-1.5 animate-in fade-in duration-100">
              <label htmlFor="fullName" className="text-xs font-medium text-text-secondary">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full h-[36px] px-3 border border-border-hairline rounded-button text-sm bg-surface text-text-primary placeholder-text-secondary focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-text-secondary">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full h-[36px] px-3 border border-border-hairline rounded-button text-sm bg-surface text-text-primary placeholder-text-secondary focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>

          {/* Password (for signin and signup) */}
          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-text-secondary">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => handleModeChange("forgot")}
                    className="text-xs font-medium text-accent hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
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
          )}

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[36px] mt-2 bg-accent text-surface text-sm font-medium rounded-button hover:bg-opacity-95 active:scale-98 transition-all flex items-center justify-center cursor-pointer focus:outline-hidden disabled:bg-opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin"></span>
            ) : mode === "signin" ? (
              "Sign in"
            ) : mode === "signup" ? (
              "Create account"
            ) : (
              "Reset password"
            )}
          </button>

          {/* Forgot mode back button */}
          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => handleModeChange("signin")}
              className="w-full text-center text-sm font-medium text-text-secondary hover:text-text-primary mt-4 cursor-pointer"
            >
              Back to sign in
            </button>
          )}
        </form>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <Suspense
          fallback={
            <div className="max-w-md w-full bg-surface border border-border-hairline rounded-card p-6 shadow-2xs text-center">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-text-secondary">Loading authentication...</p>
            </div>
          }
        >
          <AuthForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
