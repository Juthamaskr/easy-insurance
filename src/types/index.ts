// Insurance Types
export type InsuranceType = 'health' | 'life' | 'car';

export type UserRole = 'customer' | 'agent' | 'admin';

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'closed';

// Database Types
export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface InsuranceCompany {
  id: string;
  name: string;
  name_en: string | null;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  rating: number | null;
  created_at: string;
}

export interface InsurancePlan {
  id: string;
  company_id: string;
  name: string;
  type: InsuranceType;
  premium_yearly: number;
  premium_monthly: number | null;
  sum_insured: number;
  coverage: Record<string, unknown>;
  description: string | null;
  benefits: string[];
  exclusions: string[];
  waiting_period_days: number | null;
  documents_required: string[];
  min_age: number | null;
  max_age: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  company?: InsuranceCompany;
}

export interface SavedPlan {
  id: string;
  user_id: string;
  plan_id: string;
  notes: string | null;
  created_at: string;
  // Joined
  plan?: InsurancePlan;
}

export interface ComparisonHistory {
  id: string;
  user_id: string | null;
  plan_ids: string[];
  share_code: string;
  insurance_type: InsuranceType;
  filters: Record<string, unknown> | null;
  created_at: string;
  // Joined
  plans?: InsurancePlan[];
}

export interface Lead {
  id: string;
  plan_id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: LeadStatus;
  created_at: string;
  // Joined
  plan?: InsurancePlan;
}

// Form Types
export interface HealthFormData {
  age: number;
  gender: 'male' | 'female';
  budget_min?: number;
  budget_max?: number;
  sum_insured?: number;
  has_preexisting?: boolean;
}

export interface LifeFormData {
  age: number;
  gender: 'male' | 'female';
  marital_status?: 'single' | 'married' | 'divorced';
  monthly_income?: number;
  sum_insured: number;
}

export interface CarFormData {
  car_type: 'sedan' | 'pickup' | 'suv' | 'other';
  brand: string;
  year: number;
  sum_insured: number;
  insurance_class: '1' | '2+' | '3+';
}

// UI Types
export interface FilterOption {
  label: string;
  value: string;
}

export interface CompareSelection {
  planIds: string[];
  maxSelection: number;
}
