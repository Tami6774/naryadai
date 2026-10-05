export type Role = 'master' | 'worker' | 'manager' | 'admin';
export type WorkType = 'planned' | 'unplanned';
export type Priority = 'emergency' | 'high' | 'normal' | 'planned';
export type Status = 
  | 'issued' 
  | 'queued' 
  | 'accepted' 
  | 'rejected' 
  | 'in_progress' 
  | 'paused' 
  | 'done' 
  | 'ai_review' 
  | 'rework' 
  | 'closed' 
  | 'cancelled';

export interface User {
  id: number;
  full_name: string;
  short_name: string;
  specialty: string;
  grade: number;
  role: Role;
  shift: string;
  on_shift: boolean;
  login: string;
  brigade?: { id: number; name: string } | null;
  live?: {
    state: 'free' | 'busy' | 'queue' | 'off';
    label: string;
    current_order?: { id: number; number: number } | null;
    queue_count: number;
  };
}

export interface Equipment {
  id: number;
  name: string;
  inv_no: string;
  type: string;
  criticality: number;
  section_id: number;
  section?: string | null;
  qr_code?: string | null;
}

export interface Section {
  id: number;
  name: string;
}

export interface FaultCode {
  id: number;
  code: string;
  category: string;
  name: string;
  norm_hours: number;
}

export interface Material {
  id: number;
  name: string;
  unit: string;
}

export interface Photo {
  id: number;
  kind: 'before' | 'after';
  url: string;
  taken_at?: string | null;
  uploaded_at: string;
  author_id?: number | null;
}

export interface OrderEvent {
  id: number;
  action: string;
  action_label: string;
  from_status?: string | null;
  to_status?: string | null;
  comment?: string | null;
  reason?: string | null;
  created_at: string;
  actor?: { id: number | null; short_name: string };
}

export interface AIAssessment {
  id: number;
  verdict: 'accepted' | 'accepted_with_remarks' | 'needs_rework';
  verdict_label: string;
  score: number;
  final_score: number;
  photo_score?: number | null;
  explanation: string;
  worker_report?: string | null;
  details: any;
  needs_master_check: boolean;
  master_score?: number | null;
  master_comment?: string | null;
  created_at: string;
}

export interface WorkOrder {
  id: number;
  number: number;
  work_type: WorkType;
  priority: Priority;
  priority_label: string;
  status: Status;
  status_label: string;
  description: string;
  section: { id: number; name: string };
  equipment: { id: number; name: string; inv_no: string };
  assignee?: { id: number; full_name: string; short_name: string; specialty: string } | null;
  master: { id: number; full_name: string; short_name: string };
  deadline: string;
  created_at: string;
  started_at?: string | null;
  done_at?: string | null;
  closed_at?: string | null;
  overdue: boolean;
  overdue_minutes: number;
  has_photo_before: boolean;
  score?: number | null;
  verdict?: string | null;
  
  // full fields
  comment?: string | null;
  work_done?: string | null;
  close_comment?: string | null;
  fault_code?: { id: number; code: string; name: string; norm_hours: number } | null;
  materials?: Array<{ id: number; material_id: number; name: string; unit: string; qty: number }>;
  photos?: Photo[];
  events?: OrderEvent[];
  assessment?: AIAssessment | null;
  work_minutes?: number | null;
  paused_minutes?: number | null;
  downtime_minutes?: number | null;
}

export interface NotificationItem {
  id: number;
  kind: string;
  title: string;
  text: string;
  order_id?: number | null;
  urgent: boolean;
  read: boolean;
  created_at: string;
}

export interface AssistantResponse {
  intent: string;
  query: string;
  answer: string;
  data?: any;
  suggestions: string[];
}
