export type InvestorType = "angel" | "vc" | "family_office" | "syndicate" | "corporate";

export interface InvestorProfile {
  user_id: string;
  investor_type: InvestorType;
  firm_name: string | null;
  firm_website: string | null;
  linkedin_url: string;
  created_at?: string;
  updated_at?: string;
}
