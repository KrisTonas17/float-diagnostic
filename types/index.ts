// types/index.ts

export interface FormInputs {
  // Volume + Demand
  infusionsPerWeek: number;
  referralsPerWeek: number;
  referralLossPercent: number;

  // Staffing + Delivery
  infusionNurses: number;
  nurseUtilizationPercent?: number;
  homeDeliveryPercent: number;

  // Timing + Quality
  daysToInfusionStart: number;
  readmissionRate?: number;

  // Unit Economics
  costPerEpisode: number;
  marginInputType: "dollar" | "percent";
  marginPerEpisode?: number;
  marginPercent?: number;
  avgReimbursement?: number;
  annualGrowthTarget: number;
}

export interface LeadInfo {
  name: string;
  email: string;
  company: string;
  role: string;
}

export interface DiagnosticScores {
  capacityScore: number;
  unitEconomicsScore: number;
  growthConstraintIndex: number;
}

export interface OpportunityModel {
  currentAnnualInfusions: number;
  lostAnnualInfusions: number;
  recoverableInfusions: {
    conservative: number;
    base: number;
    aggressive: number;
  };
  totalOpportunityInfusions: {
    conservative: number;
    base: number;
    aggressive: number;
  };
  revenuePerInfusion: number;
  annualRevenueOpportunity: {
    conservative: number;
    base: number;
    aggressive: number;
  };
  annualMarginOpportunity: {
    conservative: number;
    base: number;
    aggressive: number;
  };
  marginPerInfusion: number;
}

export interface BottleneckItem {
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
  metric: string;
}

export interface DiagnosticResults {
  scores: DiagnosticScores;
  opportunity: OpportunityModel;
  bottlenecks: BottleneckItem[];
  executiveSummary: {
    headline: string;
    bullets: string[];
  };
  nextSteps: string[];
  inputs: FormInputs;
  benchmarksUsed: Record<string, string>;
}

export interface DiagnosticSubmission {
  lead: LeadInfo;
  inputs: FormInputs;
  results: DiagnosticResults;
  submittedAt: string;
}
