"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { InvestorType } from "@/types/investor";

function InvestorRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [dbError, setDbError] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  // Form Field States
  const [investorType, setInvestorType] = useState<InvestorType | "">("");
  const [firmName, setFirmName] = useState("");
  const [firmWebsite, setFirmWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Validation Error States
  const [errors, setErrors] = useState({
    investorType: "",
    firmName: "",
    linkedinUrl: "",
    firmWebsite: "",
  });

  // Safe notice banner text resolution
  const noticeKey = searchParams.get("notice");
  let noticeMessage = "";
  if (noticeKey === "profile_required") {
    noticeMessage = "Complete your profile before recording a backing.";
  }

  useEffect(() => {
    async function checkAuthAndPrefill() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth");
          return;
        }

        const userRole = user.user_metadata?.role || user.user_metadata?.user_type;
        if (userRole !== "investor") {
          router.push("/dashboard");
          return;
        }

        setUser(user);

        // Fetch existing investor profile
        const { data, error } = await supabase
          .from("investor_profiles")
          .select("investor_type, firm_name, firm_website, linkedin_url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          setDbError("Failed to check for an existing profile. Please refresh.");
        } else if (data) {
          setInvestorType(data.investor_type || "");
          setFirmName(data.firm_name || "");
          setFirmWebsite(data.firm_website || "");
          setLinkedinUrl(data.linkedin_url || "");
          setIsEdit(true);
        }
      } catch (err: any) {
        setDbError(err.message || "An unexpected error occurred during initialization.");
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndPrefill();
  }, [router, supabase]);

  const handleInvestorTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as InvestorType | "";
    setInvestorType(val);
    if (val === "angel") {
      setFirmName("");
      setErrors((prev) => ({ ...prev, firmName: "" }));
    }
    setErrors((prev) => ({ ...prev, investorType: "" }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      investorType: "",
      firmName: "",
      linkedinUrl: "",
      firmWebsite: "",
    };

    if (!investorType) {
      newErrors.investorType = "Investor type is required.";
      isValid = false;
    }

    if (investorType && investorType !== "angel" && !firmName.trim()) {
      newErrors.firmName = "Firm name is required.";
      isValid = false;
    }

    const trimmedLinkedin = linkedinUrl.trim();
    if (!trimmedLinkedin) {
      newErrors.linkedinUrl = "LinkedIn URL is required.";
      isValid = false;
    } else if (
      !trimmedLinkedin.includes("linkedin.com/in/") &&
      !trimmedLinkedin.includes("linkedin.com/company/")
    ) {
      newErrors.linkedinUrl =
        "LinkedIn URL must contain linkedin.com/in/ or linkedin.com/company/.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
    if (!validateForm()) return;

    setSubmitLoading(true);
    setDbError("");

    const payload = {
      user_id: user.id,
      investor_type: investorType,
      firm_name: investorType === "angel" ? null : firmName.trim(),
      firm_website: firmWebsite.trim() || null,
      linkedin_url: linkedinUrl.trim(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from("investor_profiles")
        .upsert(payload, { onConflict: "user_id" });

      if (error) {
        setDbError(error.message);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setDbError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSubmitLoading(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-12 flex flex-col items-center justify-center gap-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Header section */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-medium tracking-tight text-text-primary">
              {isEdit ? "Edit Your Profile" : "Complete Your Profile"}
            </h1>
            <p className="text-sm text-text-secondary">
              Update your investor profile credentials for validation.
            </p>
          </div>

          {/* Info notice banner (informational styling, no raw tailwind red colors) */}
          {noticeMessage && (
            <div className="w-full bg-surface border border-border-hairline rounded-card p-4 text-text-secondary text-sm text-center animate-in fade-in duration-200">
              {noticeMessage}
            </div>
          )}

          {/* Profile Card Container */}
          <div className="w-full bg-surface border border-border-hairline rounded-card p-6 md:p-8 space-y-6">
            {/* Read-Only Identity Section */}
            <div className="border-b border-border-hairline pb-4 space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary block">
                Account context
              </span>
              <div className="grid grid-cols-2 gap-4 text-sm bg-background/50 p-3 rounded-button border border-border-hairline/40">
                <div>
                  <p className="text-xs text-text-secondary">Full Name</p>
                  <p className="font-medium text-text-primary truncate">{displayName}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Email Address</p>
                  <p className="font-medium text-text-primary truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Error notice */}
            {dbError && (
              <div className="w-full p-4 rounded-lg bg-red-50 border border-red-150 text-danger text-sm font-medium">
                {dbError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-5">
              {/* Investor Type Select */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="investor_type" className="text-xs font-semibold text-text-primary">
                  Investor type <span className="text-accent">*</span>
                </label>
                <select
                  id="investor_type"
                  value={investorType}
                  onChange={handleInvestorTypeChange}
                  className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                >
                  <option value="">Select type</option>
                  <option value="angel">Angel</option>
                  <option value="vc">VC</option>
                  <option value="family_office">Family Office</option>
                  <option value="syndicate">Syndicate</option>
                  <option value="corporate">Corporate</option>
                </select>
                {errors.investorType && (
                  <span className="text-xs text-danger mt-0.5">{errors.investorType}</span>
                )}
              </div>

              {/* Firm Name Text Field (Shown only when type !== angel) */}
              {investorType && investorType !== "angel" && (
                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <label htmlFor="firm_name" className="text-xs font-semibold text-text-primary">
                    Firm name <span className="text-accent">*</span>
                  </label>
                  <input
                    id="firm_name"
                    type="text"
                    placeholder="e.g. Ascent Capital Partners"
                    value={firmName}
                    onChange={(e) => {
                      setFirmName(e.target.value);
                      setErrors((prev) => ({ ...prev, firmName: "" }));
                    }}
                    className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                  />
                  {errors.firmName && (
                    <span className="text-xs text-danger mt-0.5">{errors.firmName}</span>
                  )}
                </div>
              )}

              {/* LinkedIn URL Input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="linkedin_url" className="text-xs font-semibold text-text-primary">
                  LinkedIn URL <span className="text-accent">*</span>
                </label>
                <input
                  id="linkedin_url"
                  type="url"
                  placeholder="e.g. https://www.linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => {
                    setLinkedinUrl(e.target.value);
                    setErrors((prev) => ({ ...prev, linkedinUrl: "" }));
                  }}
                  className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                />
                {errors.linkedinUrl && (
                  <span className="text-xs text-danger mt-0.5">{errors.linkedinUrl}</span>
                )}
              </div>

              {/* Firm Website Input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="firm_website" className="text-xs font-semibold text-text-primary">
                  Firm website
                </label>
                <input
                  id="firm_website"
                  type="url"
                  placeholder="e.g. https://ascentcap.com"
                  value={firmWebsite}
                  onChange={(e) => {
                    setFirmWebsite(e.target.value);
                    setErrors((prev) => ({ ...prev, firmWebsite: "" }));
                  }}
                  className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                />
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full h-9 bg-accent hover:bg-accent/90 text-surface rounded-button text-sm font-medium transition-colors cursor-pointer select-none flex items-center justify-center gap-2 disabled:bg-opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Profile</span>
                  )}
                </button>
              </div>
            </form>

            {/* Private Helper Line */}
            <p className="text-xs text-text-secondary text-center">
              Your profile is private. It's shown only to TrustScore reviewers when you record a backing.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function InvestorRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-background text-text-primary">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </main>
          <Footer />
        </div>
      }
    >
      <InvestorRegisterForm />
    </Suspense>
  );
}
