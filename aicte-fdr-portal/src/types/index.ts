export type UserRole = 
  | 'institution'
  | 'scrutiny_officer'
  | 'approving_authority'
  | 'admin'
  | 'auditor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution_id?: string;
  institution_name?: string;
  avatar_url?: string;
}

export type FDRStatus = 
  | 'Submitted'
  | 'Under Scrutiny'
  | 'Discrepancy Flagged'
  | 'Verified'
  | 'Active'
  | 'Expiring Soon'
  | 'Matured'
  | 'Renewed'
  | 'Release Requested'
  | 'Released'
  | 'Closed';

export type FieldSourceType = 'Institution-submitted' | 'Bank-confirmed';

export interface FieldSourceDetail {
  source: FieldSourceType;
  confirmed_at?: string;
  confirmed_by_name?: string;
  notes?: string;
}

export interface InstrumentDocument {
  id: string;
  instrument_id: string;
  file_name: string;
  file_size: string;
  doc_type: 'FDR Scan' | 'Bank Confirmation Letter' | 'Renewal Request' | 'NOC Certificate' | 'Other';
  version: number;
  uploaded_at: string;
  uploaded_by: string;
  url?: string;
}

export interface Discrepancy {
  id: string;
  instrument_id: string;
  rule_code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved';
  raised_by: string;
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export interface ReleaseChecklist {
  no_pending_compliance: boolean;
  valid_closure_noc: boolean;
  undertaking_submitted: boolean;
  bank_mandate_verified: boolean;
}

export interface ReleaseRequest {
  id: string;
  instrument_id: string;
  status: 'pending_scrutiny' | 'scrutiny_recommended' | 'scrutiny_rejected' | 'approved' | 'rejected';
  checklist: ReleaseChecklist;
  justification: string;
  requested_by_name: string;
  requested_at: string;
  scrutinized_by_name?: string;
  scrutiny_remarks?: string;
  scrutinized_at?: string;
  decided_by_name?: string;
  decision_remarks?: string;
  decided_at?: string;
}

export interface RenewalLink {
  id: string;
  old_instrument_id: string;
  old_fdr_number: string;
  new_instrument_id: string;
  new_fdr_number: string;
  renewal_date: string;
}

export interface Instrument {
  id: string;
  institution_id: string;
  institution_name: string;
  institution_aicte_id: string;
  state: string;
  fdr_number: string;
  fdr_number_source: FieldSourceType;
  fdr_number_confirmed_at?: string;
  bank_name: string;
  branch_name: string;
  ifsc_code: string;
  amount: number;
  amount_source: FieldSourceType;
  amount_confirmed_at?: string;
  issue_date: string;
  maturity_date: string;
  maturity_date_source: FieldSourceType;
  maturity_date_confirmed_at?: string;
  status: FDRStatus;
  purpose: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
  days_until_maturity: number;
  documents: InstrumentDocument[];
  discrepancies: Discrepancy[];
  release_request?: ReleaseRequest;
  previous_fdr_id?: string;
  previous_fdr_number?: string;
  renewed_fdr_id?: string;
  renewed_fdr_number?: string;
}

export interface AuditLogEntry {
  id: string;
  user_email: string;
  user_role: UserRole;
  action: string;
  entity: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  ip_address: string;
  timestamp: string;
}

export interface SystemNotification {
  id: string;
  target_role?: UserRole | 'all';
  target_institution_id?: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  title: string;
  message: string;
  is_read: boolean;
  instrument_id?: string;
  created_at: string;
}

export interface SystemSettings {
  reminder_milestones: number[]; // e.g. [90, 60, 30, 15, 7]
  auto_escalation_days: number;
  min_deposit_amount: number;
  bank_adapter_mode: 'mock' | 'live';
}
