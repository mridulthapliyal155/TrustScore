import React from "react";
import Link from "next/link";
import { StartupCardData } from "@/types/startup";
import VerificationBadge from "./VerificationBadge";

export interface StartupCardProps {
  startup: StartupCardData;
}

export default function StartupCard({ startup }: StartupCardProps) {
  const {
    id,
    name,
    logoUrl,
    description,
    sector,
    stage,
    location,
    foundedYear,
    investorCount,
    fundingRound,
    trustScore,
    badgeTier,
    showScore,
  } = startup;

  return (
    <div className="bg-surface border border-border-hairline rounded-card p-5 flex flex-col justify-between min-h-[260px] transition-colors duration-200 hover:border-accent/30">
      {/* Upper Section */}
      <div className="flex flex-col gap-4">
        {/* Header: Logo, Name and TrustScore */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Startup Logo with initials fallback */}
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-border-hairline bg-[#FAFAF8] flex items-center justify-center flex-shrink-0">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={`${name} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      const span = document.createElement("span");
                      span.className = "text-accent font-medium text-sm";
                      span.innerText = name.slice(0, 2).toUpperCase();
                      parent.appendChild(span);
                    }
                  }}
                />
              ) : (
                <span className="text-accent font-medium text-sm">
                  {name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-medium text-text-primary leading-tight truncate">
                {name}
              </h3>
              <p className="text-xs text-text-secondary mt-1 truncate">
                {sector}
              </p>
            </div>
          </div>

          {/* TrustScore or Locked State */}
          <div className="flex flex-col items-end flex-shrink-0">
            {showScore ? (
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-text-secondary tracking-wider font-medium leading-none">
                    Trustscore
                  </span>
                  <span className="text-base font-medium text-text-primary tracking-tight leading-none">
                    {Math.round(trustScore * 100)}
                  </span>
                </div>
                <VerificationBadge tier={badgeTier} />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAFAF8] border border-border-hairline rounded-[6px] text-text-secondary">
                <svg
                  className="w-3.5 h-3.5 text-text-secondary fill-none stroke-current"
                  viewBox="0 0 14 14"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2.5" y="6" width="9" height="6" rx="1.5" />
                  <path d="M 4.5,6 V 3.5 A 2.5,2.5 0 0,1 9.5,3.5 V 6" />
                </svg>
                <span className="text-[11px] font-medium text-text-secondary leading-none">
                  Score not shared
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description: Sentence case body text, clamped to single line */}
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-1">
          {description}
        </p>
      </div>

      {/* Details & Footer Section */}
      <div className="flex flex-col gap-4 mt-5">
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs pt-4 border-t border-border-hairline">
          {/* Sector & Stage */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-text-secondary tracking-wider font-medium">
              Sector & stage
            </span>
            <div className="flex items-center gap-1.5 text-text-primary">
              <span className="font-medium">{sector}</span>
              <span className="text-border-hairline">•</span>
              <span className="text-text-secondary">{stage}</span>
            </div>
          </div>

          {/* Location & Founded */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-text-secondary tracking-wider font-medium">
              Location & founded
            </span>
            <div className="flex items-center gap-1.5 text-text-primary">
              <span className="font-medium">{location}</span>
              <span className="text-border-hairline">•</span>
              <span className="text-text-secondary">{foundedYear}</span>
            </div>
          </div>

          {/* Funding & Investors */}
          <div className="flex flex-col gap-0.5 col-span-2">
            <span className="text-[10px] text-text-secondary tracking-wider font-medium">
              Funding & investors
            </span>
            <div className="flex items-center gap-1.5 text-text-primary">
              <span className="font-medium">{fundingRound}</span>
              <span className="text-border-hairline">•</span>
              <span className="text-text-secondary">
                {investorCount} {investorCount === 1 ? "Investor" : "Investors"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Link Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-border-hairline/60">
          <Link
            href={`/startup/${id || "apex-biosensors"}`}
            className="text-sm font-medium text-accent hover:underline inline-flex items-center gap-1 group transition-all"
          >
            <span>Open Profile</span>
            <svg
              className="w-3.5 h-3.5 stroke-current fill-none transition-transform duration-200 group-hover:translate-x-0.5"
              viewBox="0 0 14 14"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 4.5,2.5 L 9,7 L 4.5,11.5" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
