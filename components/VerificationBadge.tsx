import React from "react";
import { BadgeTier } from "@/types/startup";

interface VerificationBadgeProps {
  tier: BadgeTier;
  className?: string;
}

export default function VerificationBadge({ tier, className = "" }: VerificationBadgeProps) {
  let label = "";
  let styles = "";
  let icon: React.ReactNode = null;

  switch (tier) {
    case "self-reported":
      label = "Self-Reported";
      styles = "bg-[#F3F2EE] border-border-hairline text-text-secondary";
      icon = (
        <svg className="w-2 h-2 fill-text-secondary" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" />
        </svg>
      );
      break;
    case "ai-extracted":
      label = "AI-Extracted";
      styles = "bg-[rgba(24,95,165,0.06)] border-[rgba(24,95,165,0.15)] text-accent";
      icon = (
        <svg className="w-2 h-2 fill-accent" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" />
        </svg>
      );
      break;
    case "document-backed":
      label = "Document-Backed";
      styles = "bg-surface border-border-hairline text-text-primary";
      icon = (
        <svg className="w-2.5 h-2.5 stroke-text-secondary fill-none" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="4.25" strokeWidth="1.25" />
          <path d="M 5,0.75 A 4.25,4.25 0 0,0 5,9.25 Z" fill="currentColor" stroke="none" />
        </svg>
      );
      break;
    case "stakeholder-endorsed":
      label = "Stakeholder-Endorsed";
      styles = "bg-[rgba(59,109,17,0.06)] border-[rgba(59,109,17,0.15)] text-success";
      icon = (
        <svg className="w-3 h-3 stroke-success fill-none" viewBox="0 0 12 12" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2.5 6 4.5 8 9.5 3.5" />
        </svg>
      );
      break;
    case "investor-backed":
      label = "Investor-Backed";
      styles = "bg-[rgba(24,95,165,0.1)] border-[rgba(24,95,165,0.25)] text-accent";
      icon = (
        <svg className="w-3 h-3 stroke-accent fill-none" viewBox="0 0 12 12" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2.5 6 4.5 8 9.5 3.5" />
        </svg>
      );
      break;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium leading-none select-none ${styles} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
