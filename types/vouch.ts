export type VouchStatus =
  | "pending_founder"
  | "pending_admin"
  | "confirmed"
  | "disputed"
  | "rejected";

export interface Vouch {
  id: string;
  investor_id: string;
  company_id: string;
  amount: number | null;
  currency: string;
  round: string;
  invested_on: string | null;
  proof_filename: string | null;
  investor_note: string | null;
  status: VouchStatus;
  founder_responded_at: string | null;
  founder_note: string | null;
  admin_reviewed_at: string | null;
  admin_note: string | null;
  reviewed_by: string | null;
  created_at: string;
}
