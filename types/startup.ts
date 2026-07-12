export type BadgeTier =
  | "self-reported"
  | "ai-extracted"
  | "document-backed"
  | "stakeholder-endorsed"
  | "investor-backed";

export interface StartupCardData {
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
