export type BadgeTier =
  | "self-reported"
  | "ai-extracted"
  | "document-backed"
  | "stakeholder-endorsed"
  | "investor-backed";

export interface StartupCardData {
  id?: string;
  name: string;
  logoUrl: string;
  description: string;
  sector: string;
  stage: string;
  location: string;
  foundedYear: number;
  investorCount: number;
  fundingRound: string;
  trustScore: number;
  badgeTier: BadgeTier;
  showScore: boolean;
}

export interface StartupProfileData extends StartupCardData {
  id: string;
  status: "pending" | "under review" | "approved" | "rejected";
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;
  teamSize?: number;
  website?: string;
  foundersList: { name: string; linkedin: string }[];
  revenueAmount?: number;
  revenueCurrency?: string;
  activeUsers?: number;
  growthRate?: string;
  incubators?: string[];
  investorsList?: { name: string; amount: number; currency: string; round: string; date: string }[];
  currentlyRaising: "yes" | "no" | "planning";
  
  // Claim Tiers to display what explains the score
  claims: {
    basics: BadgeTier;
    founders: BadgeTier;
    traction: BadgeTier;
    endorsements: BadgeTier;
    funding: BadgeTier;
  };
  
  // Uploaded files names
  coiFileName?: string;
  financialsFileName?: string;
  pitchDeckFileName?: string;
  capTableFileName?: string;
}
