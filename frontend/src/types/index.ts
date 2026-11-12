export type UserRole = 'client' | 'freelancer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  company_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface ProjectRequirement {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  category: 'functional' | 'ui_ux' | 'performance' | 'security';
  weight: number;
  is_mandatory: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  client_id: string;
  freelancer_id?: string;
  budget: number;
  currency: string;
  deadline?: string;
  status: 'draft' | 'active' | 'completed' | 'disputed' | 'archived';
  created_at: string;
  updated_at: string;
  client?: User;
  freelancer?: User;
  requirements?: ProjectRequirement[];
  milestones?: Milestone[];
}

export type SubmissionStatus = 'pending' | 'submitted' | 'resubmission_requested';
export type AIVerificationStatus = 'not_started' | 'processing' | 'verified' | 'flagged_human_review';
export type ClientApprovalStatus = 'pending_authorization' | 'authorized' | 'in_review' | 'revision_requested' | 'approved' | 'rejected';

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  requirements_text?: string;
  payment_amount: number;
  currency: string;
  deadline?: string;
  submission_status: SubmissionStatus;
  ai_verification_status: AIVerificationStatus;
  client_approval_status: ClientApprovalStatus;
  paypal_order_id?: string;
  paypal_authorization_id?: string;
  paypal_capture_id?: string;
  authorization_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubmissionFile {
  id: string;
  submission_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: 'screenshot' | 'code' | 'document';
  created_at: string;
}

export interface MilestoneSubmission {
  id: string;
  milestone_id: string;
  freelancer_id: string;
  live_url?: string;
  notes?: string;
  version: number;
  status: string;
  created_at: string;
  freelancer?: User;
  files: SubmissionFile[];
}

export type CriteriaStatus = 'fulfilled' | 'partially_fulfilled' | 'missing' | 'unverifiable';

export interface CriteriaItem {
  requirement: string;
  status: CriteriaStatus;
  confidence: number;
  evidence: string[];
  explanation: string;
  weight?: number;
}

export interface VerificationEngineOutput {
  overall_score: number;
  summary: string;
  criteria: CriteriaItem[];
  missing_requirements: string[];
  potential_issues: string[];
  recommendations: string[];
  limitations: string[];
  requires_human_review: boolean;
}

export interface VerificationReport {
  id: string;
  milestone_id: string;
  submission_id: string;
  overall_score: number;
  summary: string;
  requires_human_review: boolean;
  created_at: string;
  details?: VerificationEngineOutput;
}

export interface PaymentEvent {
  id: string;
  payment_id: string;
  event_type: string;
  paypal_event_id?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  milestone_id: string;
  client_id: string;
  freelancer_id?: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed' | 'expired';
  paypal_order_id?: string;
  paypal_authorization_id?: string;
  paypal_capture_id?: string;
  paypal_refund_id?: string;
  authorization_expires_at?: string;
  created_at: string;
  events?: PaymentEvent[];
}

export interface Dispute {
  id: string;
  milestone_id: string;
  submission_id?: string;
  client_id: string;
  freelancer_id: string;
  client_reason: string;
  ai_summary?: string;
  disagreements?: string[];
  recommended_evidence?: string[];
  suggested_revisions?: string[];
  status: 'open' | 'resolved' | 'escalated';
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}
