// lib/benchmarks.ts
// ============================================================
// FLOAT HEALTH — EDITABLE BENCHMARK CONSTANTS
// All values labeled as assumptions. Edit here to update globally.
// ============================================================

export const BENCHMARKS = {
  // Referral-to-start timing benchmarks (days)
  referralToStart: {
    excellent: 2,    // ≤ 2 days = excellent
    good: 4,         // ≤ 4 days = good
    acceptable: 7,   // ≤ 7 days = acceptable
    poor: 14,        // > 14 days = poor
    label: "Assumption: Industry benchmark is 2–4 days for optimized home infusion programs.",
  },

  // Nurse capacity benchmarks (infusions per nurse per week)
  nurseCapacity: {
    low: 4,       // < 4 = under-utilized or over-staffed
    target: 8,    // 6–10 = healthy range midpoint
    targetMin: 6,
    targetMax: 10,
    max: 12,      // > 12 = at or over capacity
    label: "Assumption: 6–10 infusions per nurse per week is considered healthy utilization for home infusion.",
  },

  // Referral leakage benchmarks (%)
  referralLeakage: {
    excellent: 3,   // ≤ 3% = excellent
    good: 8,        // ≤ 8% = good
    acceptable: 15, // ≤ 15% = manageable
    poor: 20,       // > 20% = significant problem
    label: "Assumption: Best-practice home infusion programs lose 3–8% of referrals due to capacity/timing constraints.",
  },

  // Default nurse utilization if not provided
  defaultNurseUtilization: 75, // %

  // Home delivery cost advantage (% cost reduction vs in-facility)
  homeDeliveryDiscount: {
    value: 0.12,  // 12% lower cost per episode for home vs in-facility
    label: "Assumption: Home infusion typically achieves 10–15% lower cost per episode vs. clinic/facility delivery.",
  },

  // Recoverable volume from time-to-start improvement
  timeToStartRecovery: {
    // If days-to-start > good threshold, apply recovery factor to referral volume
    conservativeRecovery: 0.10,   // 10% additional capture
    baseRecovery: 0.18,           // 18% additional capture
    aggressiveRecovery: 0.25,     // 25% additional capture
    threshold: 4,                 // Apply recovery if days > this
    label: "Assumption: Reducing referral-to-start time below 4 days typically recovers 10–25% of at-risk referral volume.",
  },

  // 30-day readmission rate benchmarks
  readmissionRate: {
    excellent: 5,    // ≤ 5%
    good: 10,        // ≤ 10%
    acceptable: 15,  // ≤ 15%
    poor: 20,        // > 20%
    label: "Assumption: Best-in-class home infusion programs achieve <10% 30-day readmission rates.",
  },

  // Scoring weights — adjust to change how scores are calculated
  scoringWeights: {
    capacity: {
      nurseUtilization: 0.40,
      referralToStart: 0.35,
      referralLeakage: 0.25,
    },
    unitEconomics: {
      marginHealth: 0.50,
      homeDeliveryMix: 0.30,
      costEfficiency: 0.20,
    },
    growthConstraint: {
      lostReferrals: 0.45,
      timeToStartGap: 0.35,
      capacityHeadroom: 0.20,
    },
  },

  // Cost per infusion episode benchmark bands ($/episode)
  // These are directional ranges — labeled as assumptions
  costBands: {
    low: { min: 150, max: 400, label: "Low-complexity (e.g., hydration, simple antibiotics)" },
    medium: { min: 400, max: 1200, label: "Mid-complexity (e.g., IVIG, biologics prep)" },
    high: { min: 1200, max: 5000, label: "High-complexity (e.g., specialty biologics, chemo)" },
    label: "Assumption: Cost bands are directional estimates. Actual costs vary significantly by therapy type, payer mix, and operational model.",
  },
};
