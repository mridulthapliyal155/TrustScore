"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Step type definition
interface FormStep {
  title: string;
  description: string;
}

const STEPS: FormStep[] = [
  { title: "Basics", description: "Enter your startup's core registration details." },
  { title: "Founders", description: "Who is building this company?" },
  { title: "Stage & traction", description: "Where are you on the startup path?" },
  { title: "Endorsements", description: "Incubators, external funding, and raising plans." },
  { title: "Consent", description: "Configure visibility for your computed TrustScore." },
];

interface FounderEntry {
  name: string;
  linkedin: string;
}

interface FundingEntry {
  investorName: string;
  amount: string;
  currency: string;
  round: string;
  date: string;
}

export default function RegisterPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form Field States
  // Step 1: Basics
  const [startupName, setStartupName] = useState("");
  const [cin, setCin] = useState("");
  const [legalStatus, setLegalStatus] = useState("");
  const [foundedDate, setFoundedDate] = useState("");
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");

  // Step 2: Founders
  const [founders, setFounders] = useState<FounderEntry[]>([{ name: "", linkedin: "" }]);
  const [teamSize, setTeamSize] = useState("");

  // Step 3: Stage & traction
  const [stage, setStage] = useState("");
  const [revenueAmount, setRevenueAmount] = useState("");
  const [revenueCurrency, setRevenueCurrency] = useState("USD");
  const [activeUsers, setActiveUsers] = useState("");
  const [growthRate, setGrowthRate] = useState("");

  // Step 4: Endorsements
  const [isIncubated, setIsIncubated] = useState<"yes" | "no" | "">("");
  const [incubatorNames, setIncubatorNames] = useState<string[]>([""]);
  const [isFunded, setIsFunded] = useState<"yes" | "no" | "">("");
  const [fundingDetails, setFundingDetails] = useState<FundingEntry[]>([
    { investorName: "", amount: "", currency: "USD", round: "Seed", date: "" },
  ]);
  const [isRaising, setIsRaising] = useState("");

  // Step 5: Consent
  const [consentPublic, setConsentPublic] = useState(false);

  // Validation Error States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Helper validation routines
  const validateUrl = (url: string) => {
    if (!url) return true;
    return url.startsWith("http://") || url.startsWith("https://") || url.includes(".");
  };

  const validateLinkedIn = (url: string) => {
    if (!url) return false;
    return (url.startsWith("http://") || url.startsWith("https://")) && url.includes("linkedin.com");
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors: { [key: string]: string } = {};

    if (currentStep === 0) {
      if (!startupName.trim()) stepErrors.startupName = "Registered start-up name is required.";
      if (!cin.trim()) stepErrors.cin = "Corporate Identification Number (CIN) is required.";
      if (!legalStatus) stepErrors.legalStatus = "Legal status is required.";
      if (!foundedDate) stepErrors.foundedDate = "Founded date is required.";
      if (!sector) stepErrors.sector = "Sector is required.";
      if (!description.trim()) {
        stepErrors.description = "One-line description is required.";
      } else if (description.length > 300) {
        stepErrors.description = "Description cannot exceed 300 characters.";
      }
      if (website && !validateUrl(website)) {
        stepErrors.website = "Website must be a valid URL (e.g., https://example.com).";
      }
    } else if (currentStep === 1) {
      founders.forEach((founder, idx) => {
        if (!founder.name.trim()) {
          stepErrors[`founderName_${idx}`] = "Founder name is required.";
        }
        if (!founder.linkedin.trim()) {
          stepErrors[`founderLinkedin_${idx}`] = "LinkedIn URL is required.";
        } else if (!validateLinkedIn(founder.linkedin)) {
          stepErrors[`founderLinkedin_${idx}`] = "Must be a valid LinkedIn URL (e.g., https://linkedin.com/in/username).";
        }
      });
    } else if (currentStep === 2) {
      if (!stage) stepErrors.stage = "Stage selection is required.";
    } else if (currentStep === 3) {
      if (!isIncubated) {
        stepErrors.isIncubated = "Please select whether you are part of an incubator or accelerator.";
      } else if (isIncubated === "yes") {
        incubatorNames.forEach((name, idx) => {
          if (!name.trim()) {
            stepErrors[`incubator_${idx}`] = "Incubator or accelerator name is required.";
          }
        });
      }

      if (!isFunded) {
        stepErrors.isFunded = "Please select whether you are externally funded.";
      } else if (isFunded === "yes") {
        fundingDetails.forEach((funding, idx) => {
          if (!funding.investorName.trim()) {
            stepErrors[`investorName_${idx}`] = "Investor name is required.";
          }
          if (!funding.amount.trim() || isNaN(Number(funding.amount)) || Number(funding.amount) <= 0) {
            stepErrors[`fundingAmount_${idx}`] = "Valid funding amount is required.";
          }
          if (!funding.date) {
            stepErrors[`fundingDate_${idx}`] = "Funding date is required.";
          }
        });
      }

      if (!isRaising) {
        stepErrors.isRaising = "Raising plans selection is required.";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateCurrentStep()) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Last step submit
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // repeatable founders manipulation
  const addFounder = () => {
    setFounders([...founders, { name: "", linkedin: "" }]);
  };

  const removeFounder = (idx: number) => {
    if (founders.length > 1) {
      setFounders(founders.filter((_, i) => i !== idx));
    }
  };

  const updateFounder = (idx: number, field: keyof FounderEntry, val: string) => {
    const updated = [...founders];
    updated[idx][field] = val;
    setFounders(updated);
  };

  // repeatable incubators manipulation
  const addIncubator = () => {
    setIncubatorNames([...incubatorNames, ""]);
  };

  const removeIncubator = (idx: number) => {
    if (incubatorNames.length > 1) {
      setIncubatorNames(incubatorNames.filter((_, i) => i !== idx));
    }
  };

  const updateIncubator = (idx: number, val: string) => {
    const updated = [...incubatorNames];
    updated[idx] = val;
    setIncubatorNames(updated);
  };

  // repeatable funding entries manipulation
  const addFunding = () => {
    setFundingDetails([
      ...fundingDetails,
      { investorName: "", amount: "", currency: "USD", round: "Seed", date: "" },
    ]);
  };

  const removeFunding = (idx: number) => {
    if (fundingDetails.length > 1) {
      setFundingDetails(fundingDetails.filter((_, i) => i !== idx));
    }
  };

  const updateFunding = (idx: number, field: keyof FundingEntry, val: string) => {
    const updated = [...fundingDetails];
    updated[idx][field] = val;
    setFundingDetails(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        isLoggedIn={isLoggedIn}
        onAuthToggle={() => setIsLoggedIn((prev) => !prev)}
      />

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 md:px-6 py-12 flex flex-col gap-8">
        {/* Title Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-medium tracking-tight text-text-primary">
            Founder Registration
          </h1>
          <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
            Register your startup to build your TrustScore profile. Please fill out all required fields truthfully.
          </p>
        </div>

        {isSubmitted ? (
          /* Success Screen Card */
          <div className="bg-surface border border-border-hairline rounded-card p-8 flex flex-col items-center justify-center text-center gap-6 animate-in fade-in zoom-in-95 duration-300 shadow-sm max-w-2xl mx-auto w-full mt-4">
            <div className="w-12 h-12 bg-success/10 border border-success/20 rounded-full flex items-center justify-center text-success">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-medium text-text-primary">Registration submitted!</h2>
              <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
                Thank you for registering. Our system is computing your baseline TrustScore from your verified credentials.
              </p>
            </div>

            {/* Review Box */}
            <div className="w-full text-left bg-[#FAFAF8] border border-border-hairline rounded-card p-5 mt-4 space-y-4">
              <h3 className="text-sm font-medium text-text-primary border-b border-border-hairline pb-2">
                Startup Summary
              </h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <p className="text-text-secondary">Company Name</p>
                  <p className="font-medium text-text-primary mt-0.5">{startupName}</p>
                </div>
                <div>
                  <p className="text-text-secondary">CIN</p>
                  <p className="font-medium text-text-primary mt-0.5">{cin}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Legal Status</p>
                  <p className="font-medium text-text-primary mt-0.5">{legalStatus}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Founded Date</p>
                  <p className="font-medium text-text-primary mt-0.5">{foundedDate}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Sector</p>
                  <p className="font-medium text-text-primary mt-0.5">{sector}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Stage</p>
                  <p className="font-medium text-text-primary mt-0.5">{stage}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-text-secondary">Website</p>
                  <p className="font-medium text-text-primary mt-0.5">{website || "None listed"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-text-secondary">Score Public Consent</p>
                  <p className="font-medium text-text-primary mt-0.5">
                    {consentPublic ? "Yes, display computed TrustScore publicly" : "No, keep TrustScore locked"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                // Reset form
                setStartupName("");
                setCin("");
                setLegalStatus("");
                setFoundedDate("");
                setSector("");
                setDescription("");
                setWebsite("");
                setFounders([{ name: "", linkedin: "" }]);
                setTeamSize("");
                setStage("");
                setRevenueAmount("");
                setRevenueCurrency("USD");
                setActiveUsers("");
                setGrowthRate("");
                setIsIncubated("");
                setIncubatorNames([""]);
                setIsFunded("");
                setFundingDetails([{ investorName: "", amount: "", currency: "USD", round: "Seed", date: "" }]);
                setIsRaising("");
                setConsentPublic(false);
                setCurrentStep(0);
                setIsSubmitted(false);
              }}
              className="h-9 px-5 bg-accent hover:bg-accent/90 text-surface rounded-button text-sm font-medium transition-colors cursor-pointer"
            >
              Register another startup
            </button>
          </div>
        ) : (
          /* Multi-step Form Layout */
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left Sidebar Step Indicator */}
            <div className="w-full md:w-64 flex-shrink-0 bg-surface border border-border-hairline rounded-card p-4">
              <div className="flex flex-row md:flex-col gap-2 md:gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
                {STEPS.map((step, idx) => {
                  const isActive = idx === currentStep;
                  const isCompleted = idx < currentStep;
                  return (
                    <div
                      key={step.title}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium transition-colors select-none ${
                        isActive
                          ? "bg-accent/5 text-accent border border-accent/15"
                          : "text-text-secondary border border-transparent"
                      }`}
                    >
                      {/* Badge / Indicator */}
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${
                          isCompleted
                            ? "bg-success text-surface"
                            : isActive
                            ? "bg-accent text-surface"
                            : "bg-[#FAFAF8] border border-border-hairline text-text-secondary"
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-3 h-3 stroke-current fill-none" viewBox="0 0 12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="2.5 6 4.5 8 9.5 3.5" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className="whitespace-nowrap">{step.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Form Content Card */}
            <div className="flex-1 w-full bg-surface border border-border-hairline rounded-card p-6 flex flex-col justify-between min-h-[460px] shadow-xs">
              <div className="flex flex-col gap-6">
                {/* Step Header */}
                <div className="border-b border-border-hairline pb-4">
                  <span className="text-[10px] text-text-secondary tracking-wider font-semibold uppercase">
                    Step {currentStep + 1} of {STEPS.length}
                  </span>
                  <h2 className="text-xl font-medium text-text-primary mt-1">
                    {STEPS[currentStep].title}
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    {STEPS[currentStep].description}
                  </p>
                </div>

                {/* Form Fields Render block */}
                <div className="space-y-5">
                  {currentStep === 0 && (
                    /* Step 1: Basics */
                    <>
                      {/* Startup Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-primary">
                          Registered startup name <span className="text-accent">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Apex Biosensors Pvt Ltd"
                          value={startupName}
                          onChange={(e) => setStartupName(e.target.value)}
                          className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                        />
                        {errors.startupName && <span className="text-xs text-accent mt-0.5">{errors.startupName}</span>}
                      </div>

                      {/* CIN */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-primary">
                          Corporate Identification Number (CIN) <span className="text-accent">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. U72900KA2021PTC145678"
                          value={cin}
                          onChange={(e) => setCin(e.target.value)}
                          className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                        />
                        {errors.cin && <span className="text-xs text-accent mt-0.5">{errors.cin}</span>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Legal Status */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-text-primary">
                            Legal status <span className="text-accent">*</span>
                          </label>
                          <select
                            value={legalStatus}
                            onChange={(e) => setLegalStatus(e.target.value)}
                            className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                          >
                            <option value="">Select status</option>
                            <option value="proprietorship">Proprietorship</option>
                            <option value="pvt ltd">Pvt Ltd</option>
                            <option value="llp">LLP</option>
                            <option value="other">Other</option>
                          </select>
                          {errors.legalStatus && <span className="text-xs text-accent mt-0.5">{errors.legalStatus}</span>}
                        </div>

                        {/* Founded Date */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-text-primary">
                            Founded date <span className="text-accent">*</span>
                          </label>
                          <input
                            type="date"
                            value={foundedDate}
                            onChange={(e) => setFoundedDate(e.target.value)}
                            className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                          />
                          {errors.foundedDate && <span className="text-xs text-accent mt-0.5">{errors.foundedDate}</span>}
                        </div>
                      </div>

                      {/* Sector */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-primary">
                          Sector <span className="text-accent">*</span>
                        </label>
                        <select
                          value={sector}
                          onChange={(e) => setSector(e.target.value)}
                          className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                        >
                          <option value="">Select sector</option>
                          <option value="Healthtech">Healthtech</option>
                          <option value="Logistics">Logistics</option>
                          <option value="Climate">Climate</option>
                          <option value="Energy">Energy</option>
                          <option value="Cybersecurity">Cybersecurity</option>
                          <option value="Agtech">Agtech</option>
                          <option value="Fintech">Fintech</option>
                          <option value="Deeptech">Deeptech</option>
                          <option value="AI">AI</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.sector && <span className="text-xs text-accent mt-0.5">{errors.sector}</span>}
                      </div>

                      {/* Description */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-text-primary">
                            One-line description <span className="text-accent">*</span>
                          </label>
                          <span className="text-[10px] text-text-secondary">
                            {description.length}/300
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={300}
                          placeholder="e.g. Non-invasive glucose tracking using infrared sensors."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                        />
                        {errors.description && <span className="text-xs text-accent mt-0.5">{errors.description}</span>}
                      </div>

                      {/* Website */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-primary">
                          Website
                        </label>
                        <input
                          type="url"
                          placeholder="e.g. https://apexbio.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                        />
                        {errors.website && <span className="text-xs text-accent mt-0.5">{errors.website}</span>}
                      </div>
                    </>
                  )}

                  {currentStep === 1 && (
                    /* Step 2: Founders */
                    <>
                      {/* Repeatable Founders list */}
                      <div className="space-y-4">
                        <label className="text-xs font-semibold text-text-primary">
                          Founder details <span className="text-accent">*</span>
                        </label>

                        {founders.map((founder, idx) => (
                          <div
                            key={idx}
                            className="bg-[#FAFAF8] border border-border-hairline rounded-card p-4 space-y-3 relative animate-in fade-in duration-150"
                          >
                            {founders.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeFounder(idx)}
                                className="absolute top-3 right-3 text-xs text-text-secondary hover:text-accent font-medium cursor-pointer"
                              >
                                Remove
                              </button>
                            )}

                            <h4 className="text-xs font-semibold text-text-primary">
                              Founder #{idx + 1}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Founder Name */}
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-text-secondary">
                                  Full name
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Alex Rivera"
                                  value={founder.name}
                                  onChange={(e) => updateFounder(idx, "name", e.target.value)}
                                  className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                                />
                                {errors[`founderName_${idx}`] && (
                                  <span className="text-xs text-accent mt-0.5">{errors[`founderName_${idx}`]}</span>
                                )}
                              </div>

                              {/* LinkedIn */}
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-text-secondary">
                                  LinkedIn URL
                                </label>
                                <input
                                  type="url"
                                  placeholder="e.g. https://linkedin.com/in/alex-rivera"
                                  value={founder.linkedin}
                                  onChange={(e) => updateFounder(idx, "linkedin", e.target.value)}
                                  className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                                />
                                {errors[`founderLinkedin_${idx}`] && (
                                  <span className="text-xs text-accent mt-0.5">{errors[`founderLinkedin_${idx}`]}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addFounder}
                          className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer py-1"
                        >
                          + Add another founder
                        </button>
                      </div>

                      {/* Team Size */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-primary">
                          Total team size
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 5"
                          value={teamSize}
                          onChange={(e) => setTeamSize(e.target.value)}
                          className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                        />
                      </div>
                    </>
                  )}

                  {currentStep === 2 && (
                    /* Step 3: Stage & traction */
                    <>
                      {/* Stage selection */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-primary">
                          Current startup stage <span className="text-accent">*</span>
                        </label>
                        <select
                          value={stage}
                          onChange={(e) => setStage(e.target.value)}
                          className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                        >
                          <option value="">Select stage</option>
                          <option value="idea">Idea</option>
                          <option value="mvp">MVP</option>
                          <option value="revenue">Revenue</option>
                          <option value="scaling">Scaling</option>
                        </select>
                        {errors.stage && <span className="text-xs text-accent mt-0.5">{errors.stage}</span>}
                      </div>

                      {/* Revenue */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-primary">
                          Revenue (MRR or ARR)
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={revenueCurrency}
                            onChange={(e) => setRevenueCurrency(e.target.value)}
                            className="h-9 w-24 border border-border-hairline rounded-button px-2 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent flex-shrink-0"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="EUR">EUR (€)</option>
                          </select>
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 50000"
                            value={revenueAmount}
                            onChange={(e) => setRevenueAmount(e.target.value)}
                            className="h-9 flex-1 border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                          />
                        </div>
                      </div>

                      {/* Active Users */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-primary">
                          Active users / customers
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 1200"
                          value={activeUsers}
                          onChange={(e) => setActiveUsers(e.target.value)}
                          className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                        />
                      </div>

                      {/* Growth Rate */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-primary">
                          Growth rate
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 15% month-on-month"
                          value={growthRate}
                          onChange={(e) => setGrowthRate(e.target.value)}
                          className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                        />
                      </div>
                    </>
                  )}

                  {currentStep === 3 && (
                    /* Step 4: Endorsements */
                    <>
                      {/* Incubator Question */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-text-primary">
                          Part of any incubator or accelerator? <span className="text-accent">*</span>
                        </label>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer select-none">
                            <input
                              type="radio"
                              name="isIncubated"
                              checked={isIncubated === "yes"}
                              onChange={() => setIsIncubated("yes")}
                              className="w-4 h-4 text-accent border-border-hairline focus:ring-accent focus:outline-hidden"
                            />
                            <span>Yes</span>
                          </label>
                          <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer select-none">
                            <input
                              type="radio"
                              name="isIncubated"
                              checked={isIncubated === "no"}
                              onChange={() => {
                                setIsIncubated("no");
                                setIncubatorNames([""]);
                              }}
                              className="w-4 h-4 text-accent border-border-hairline focus:ring-accent focus:outline-hidden"
                            />
                            <span>No</span>
                          </label>
                        </div>
                        {errors.isIncubated && <span className="text-xs text-accent mt-0.5">{errors.isIncubated}</span>}

                        {/* Conditional Repeatable Incubators */}
                        {isIncubated === "yes" && (
                          <div className="pl-4 border-l border-border-hairline mt-2 space-y-3 animate-in fade-in duration-150">
                            <label className="text-[11px] font-semibold text-text-secondary">
                              Incubator/accelerator name(s)
                            </label>
                            {incubatorNames.map((name, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    placeholder="e.g. Y Combinator"
                                    value={name}
                                    onChange={(e) => updateIncubator(idx, e.target.value)}
                                    className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                                  />
                                  {errors[`incubator_${idx}`] && (
                                    <span className="text-xs text-accent mt-0.5">{errors[`incubator_${idx}`]}</span>
                                  )}
                                </div>
                                {incubatorNames.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeIncubator(idx)}
                                    className="text-xs text-text-secondary hover:text-accent font-medium cursor-pointer flex-shrink-0"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={addIncubator}
                              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer py-1"
                            >
                              + Add another incubator
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Funded Question */}
                      <div className="flex flex-col gap-2 pt-2">
                        <label className="text-xs font-semibold text-text-primary">
                          Are you externally funded? <span className="text-accent">*</span>
                        </label>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer select-none">
                            <input
                              type="radio"
                              name="isFunded"
                              checked={isFunded === "yes"}
                              onChange={() => setIsFunded("yes")}
                              className="w-4 h-4 text-accent border-border-hairline focus:ring-accent focus:outline-hidden"
                            />
                            <span>Yes</span>
                          </label>
                          <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer select-none">
                            <input
                              type="radio"
                              name="isFunded"
                              checked={isFunded === "no"}
                              onChange={() => {
                                setIsFunded("no");
                                setFundingDetails([{ investorName: "", amount: "", currency: "USD", round: "Seed", date: "" }]);
                              }}
                              className="w-4 h-4 text-accent border-border-hairline focus:ring-accent focus:outline-hidden"
                            />
                            <span>No</span>
                          </label>
                        </div>
                        {errors.isFunded && <span className="text-xs text-accent mt-0.5">{errors.isFunded}</span>}

                        {/* Conditional Repeatable Funding groups */}
                        {isFunded === "yes" && (
                          <div className="pl-4 border-l border-border-hairline mt-2 space-y-4 animate-in fade-in duration-150">
                            <label className="text-[11px] font-semibold text-text-secondary">
                              Investor details
                            </label>

                            {fundingDetails.map((funding, idx) => (
                              <div
                                key={idx}
                                className="bg-[#FAFAF8] border border-border-hairline rounded-card p-4 space-y-3 relative"
                              >
                                {fundingDetails.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeFunding(idx)}
                                    className="absolute top-3 right-3 text-xs text-text-secondary hover:text-accent font-medium cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                )}

                                <h5 className="text-[11px] font-semibold text-text-primary">
                                  Funding entry #{idx + 1}
                                </h5>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Investor Name */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold text-text-secondary">
                                      Investor name
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Sequoia Capital"
                                      value={funding.investorName}
                                      onChange={(e) => updateFunding(idx, "investorName", e.target.value)}
                                      className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                                    />
                                    {errors[`investorName_${idx}`] && (
                                      <span className="text-xs text-accent mt-0.5">{errors[`investorName_${idx}`]}</span>
                                    )}
                                  </div>

                                  {/* Amount + Currency */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold text-text-secondary">
                                      Funding amount
                                    </label>
                                    <div className="flex gap-2">
                                      <select
                                        value={funding.currency}
                                        onChange={(e) => updateFunding(idx, "currency", e.target.value)}
                                        className="h-9 w-20 border border-border-hairline rounded-button px-1 bg-surface text-xs text-text-primary focus:outline-hidden flex-shrink-0"
                                      >
                                        <option value="USD">USD ($)</option>
                                        <option value="INR">INR (₹)</option>
                                        <option value="EUR">EUR (€)</option>
                                      </select>
                                      <input
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 250000"
                                        value={funding.amount}
                                        onChange={(e) => updateFunding(idx, "amount", e.target.value)}
                                        className="h-9 flex-1 border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden"
                                      />
                                    </div>
                                    {errors[`fundingAmount_${idx}`] && (
                                      <span className="text-xs text-accent mt-0.5">{errors[`fundingAmount_${idx}`]}</span>
                                    )}
                                  </div>

                                  {/* Round */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold text-text-secondary">
                                      Funding round
                                    </label>
                                    <select
                                      value={funding.round}
                                      onChange={(e) => updateFunding(idx, "round", e.target.value)}
                                      className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden"
                                    >
                                      <option value="Pre-Seed">Pre-Seed</option>
                                      <option value="Seed">Seed</option>
                                      <option value="Series A">Series A</option>
                                      <option value="Series B">Series B</option>
                                    </select>
                                  </div>

                                  {/* Date */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold text-text-secondary">
                                      Funding date
                                    </label>
                                    <input
                                      type="date"
                                      value={funding.date}
                                      onChange={(e) => updateFunding(idx, "date", e.target.value)}
                                      className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden"
                                    />
                                    {errors[`fundingDate_${idx}`] && (
                                      <span className="text-xs text-accent mt-0.5">{errors[`fundingDate_${idx}`]}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={addFunding}
                              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer py-1"
                            >
                              + Add another funding entry
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Raising select option */}
                      <div className="flex flex-col gap-1.5 pt-2">
                        <label className="text-xs font-semibold text-text-primary">
                          Currently raising? <span className="text-accent">*</span>
                        </label>
                        <select
                          value={isRaising}
                          onChange={(e) => setIsRaising(e.target.value)}
                          className="h-9 w-full border border-border-hairline rounded-button px-3 bg-surface text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
                        >
                          <option value="">Select raising plans</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                          <option value="planning">Planning</option>
                        </select>
                        {errors.isRaising && <span className="text-xs text-accent mt-0.5">{errors.isRaising}</span>}
                      </div>
                    </>
                  )}

                  {currentStep === 4 && (
                    /* Step 5: Consent */
                    <>
                      <div className="bg-[#FAFAF8] border border-border-hairline rounded-card p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-text-primary">
                          Computed score display settings
                        </h3>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Your startup TrustScore is computed programmatically based on verified registry records (CIN), document backups, and endorsement checks. You have full control over whether this baseline score is visible on the investor directory directory list.
                        </p>

                        <div className="flex items-start gap-3 pt-2">
                          <input
                            type="checkbox"
                            id="consentPublic"
                            checked={consentPublic}
                            onChange={(e) => setConsentPublic(e.target.checked)}
                            className="mt-1 w-4.5 h-4.5 text-accent border-border-hairline rounded-[4px] focus:ring-accent cursor-pointer"
                          />
                          <label
                            htmlFor="consentPublic"
                            className="text-xs font-medium text-text-primary leading-normal cursor-pointer select-none"
                          >
                            Show my TrustScore publicly on my directory card. 
                            <span className="block text-[11px] text-text-secondary font-normal mt-0.5">
                              If unselected, your startup appears in the directory under a locked state showing &quot;Score not shared&quot;.
                            </span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Card Footer Control Buttons */}
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-border-hairline/60">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`h-9 px-4 rounded-button text-sm font-medium transition-colors select-none ${
                    currentStep === 0
                      ? "text-text-secondary/40 border border-border-hairline/40 bg-transparent cursor-not-allowed"
                      : "text-text-primary border border-border-hairline hover:bg-background cursor-pointer"
                  }`}
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="h-9 px-5 bg-accent hover:bg-accent/90 text-surface rounded-button text-sm font-medium transition-colors cursor-pointer select-none"
                >
                  {currentStep === STEPS.length - 1 ? "Submit" : "Continue"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
