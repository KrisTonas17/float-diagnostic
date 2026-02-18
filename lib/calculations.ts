// lib/calculations.ts
import { FormInputs, DiagnosticResults, DiagnosticScores, OpportunityModel, BottleneckItem } from "@/types";
import { BENCHMARKS } from "./benchmarks";

function clamp(val: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, val));
}

function resolveMargin(inputs: FormInputs): number {
  if (inputs.marginInputType === "dollar" && inputs.marginPerEpisode !== undefined) {
    return inputs.marginPerEpisode;
  }
  if (inputs.marginInputType === "percent" && inputs.marginPercent !== undefined) {
    return inputs.costPerEpisode * (inputs.marginPercent / 100);
  }
  return 0;
}

function resolveRevenuePerInfusion(inputs: FormInputs): number {
  if (inputs.avgReimbursement) return inputs.avgReimbursement;
  const margin = resolveMargin(inputs);
  return inputs.costPerEpisode + margin;
}

// ─── CAPACITY SCORE ───────────────────────────────────────────────────────────
function calcCapacityScore(inputs: FormInputs): number {
  const w = BENCHMARKS.scoringWeights.capacity;
  const utilization = inputs.nurseUtilizationPercent ?? BENCHMARKS.defaultNurseUtilization;

  const infusionsPerNurse = inputs.infusionNurses > 0
    ? inputs.infusionsPerWeek / inputs.infusionNurses
    : 0;

  let nurseScore: number;
  if (infusionsPerNurse < BENCHMARKS.nurseCapacity.low) {
    nurseScore = 30;
  } else if (infusionsPerNurse <= BENCHMARKS.nurseCapacity.targetMax) {
    const range = BENCHMARKS.nurseCapacity.targetMax - BENCHMARKS.nurseCapacity.targetMin;
    const pos = infusionsPerNurse - BENCHMARKS.nurseCapacity.targetMin;
    nurseScore = 60 + (pos / range) * 40;
  } else if (infusionsPerNurse <= BENCHMARKS.nurseCapacity.max) {
    nurseScore = 50;
  } else {
    nurseScore = 25;
  }

  if (utilization < 60) nurseScore *= 0.8;
  else if (utilization > 90) nurseScore *= 0.9;

  const days = inputs.daysToInfusionStart;
  let timeScore: number;
  if (days <= BENCHMARKS.referralToStart.excellent) timeScore = 100;
  else if (days <= BENCHMARKS.referralToStart.good) timeScore = 85;
  else if (days <= BENCHMARKS.referralToStart.acceptable) timeScore = 60;
  else if (days <= BENCHMARKS.referralToStart.poor) timeScore = 35;
  else timeScore = 15;

  const leakage = inputs.referralLossPercent;
  let leakageScore: number;
  if (leakage <= BENCHMARKS.referralLeakage.excellent) leakageScore = 100;
  else if (leakage <= BENCHMARKS.referralLeakage.good) leakageScore = 80;
  else if (leakage <= BENCHMARKS.referralLeakage.acceptable) leakageScore = 55;
  else if (leakage <= BENCHMARKS.referralLeakage.poor) leakageScore = 30;
  else leakageScore = 10;

  const raw = (nurseScore * w.nurseUtilization) + (timeScore * w.referralToStart) + (leakageScore * w.referralLeakage);
  return clamp(Math.round(raw));
}

// ─── UNIT ECONOMICS SCORE ─────────────────────────────────────────────────────
function calcUnitEconomicsScore(inputs: FormInputs): number {
  const w = BENCHMARKS.scoringWeights.unitEconomics;
  const margin = resolveMargin(inputs);
  const revenue = resolveRevenuePerInfusion(inputs);

  const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;
  let marginScore: number;
  if (marginPct >= 35) marginScore = 100;
  else if (marginPct >= 25) marginScore = 80;
  else if (marginPct >= 15) marginScore = 60;
  else if (marginPct >= 8) marginScore = 40;
  else marginScore = 20;

  const homeShare = inputs.homeDeliveryPercent / 100;
  const homeScore = 40 + homeShare * 60;

  const cost = inputs.costPerEpisode;
  let costScore: number;
  if (cost <= BENCHMARKS.costBands.low.max) costScore = 90;
  else if (cost <= BENCHMARKS.costBands.medium.max) costScore = 70;
  else if (cost <= BENCHMARKS.costBands.high.max) costScore = 55;
  else costScore = 40;

  const raw = (marginScore * w.marginHealth) + (homeScore * w.homeDeliveryMix) + (costScore * w.costEfficiency);
  return clamp(Math.round(raw));
}

// ─── GROWTH CONSTRAINT INDEX ──────────────────────────────────────────────────
function calcGrowthConstraintIndex(inputs: FormInputs): number {
  const w = BENCHMARKS.scoringWeights.growthConstraint;

  const lostScore = clamp(inputs.referralLossPercent * 3.5);

  const dayGap = Math.max(0, inputs.daysToInfusionStart - BENCHMARKS.referralToStart.good);
  const timeGapScore = clamp(dayGap * 8);

  const infusionsPerNurse = inputs.infusionNurses > 0
    ? inputs.infusionsPerWeek / inputs.infusionNurses
    : 0;
  const capacityPressure = clamp(
    ((infusionsPerNurse - BENCHMARKS.nurseCapacity.targetMin) /
      (BENCHMARKS.nurseCapacity.max - BENCHMARKS.nurseCapacity.targetMin)) * 100
  );

  const raw = (lostScore * w.lostReferrals) + (timeGapScore * w.timeToStartGap) + (capacityPressure * w.capacityHeadroom);
  return clamp(Math.round(raw));
}

// ─── OPPORTUNITY MODEL ────────────────────────────────────────────────────────
function calcOpportunityModel(inputs: FormInputs): OpportunityModel {
  const revenuePerInfusion = resolveRevenuePerInfusion(inputs);
  const marginPerInfusion = resolveMargin(inputs);

  const currentAnnualInfusions = inputs.infusionsPerWeek * 52;
  const lostAnnualInfusions = Math.round(inputs.referralsPerWeek * (inputs.referralLossPercent / 100) * 52);

  const r = BENCHMARKS.timeToStartRecovery;
  let conservativeRecover = 0, baseRecover = 0, aggressiveRecover = 0;
  if (inputs.daysToInfusionStart > r.threshold) {
    const referralBase = inputs.referralsPerWeek * 52;
    conservativeRecover = Math.round(referralBase * r.conservativeRecovery);
    baseRecover = Math.round(referralBase * r.baseRecovery);
    aggressiveRecover = Math.round(referralBase * r.aggressiveRecovery);
  }

  const totalConservative = lostAnnualInfusions + conservativeRecover;
  const totalBase = lostAnnualInfusions + baseRecover;
  const totalAggressive = lostAnnualInfusions + aggressiveRecover;

  return {
    currentAnnualInfusions,
    lostAnnualInfusions,
    recoverableInfusions: {
      conservative: conservativeRecover,
      base: baseRecover,
      aggressive: aggressiveRecover,
    },
    totalOpportunityInfusions: {
      conservative: totalConservative,
      base: totalBase,
      aggressive: totalAggressive,
    },
    revenuePerInfusion,
    marginPerInfusion,
    annualRevenueOpportunity: {
      conservative: Math.round(totalConservative * revenuePerInfusion),
      base: Math.round(totalBase * revenuePerInfusion),
      aggressive: Math.round(totalAggressive * revenuePerInfusion),
    },
    annualMarginOpportunity: {
      conservative: Math.round(totalConservative * marginPerInfusion),
      base: Math.round(totalBase * marginPerInfusion),
      aggressive: Math.round(totalAggressive * marginPerInfusion),
    },
  };
}

// ─── BOTTLENECKS ──────────────────────────────────────────────────────────────
function calcBottlenecks(inputs: FormInputs): BottleneckItem[] {
  const items: BottleneckItem[] = [];

  if (inputs.daysToInfusionStart > BENCHMARKS.referralToStart.poor) {
    items.push({
      title: "Critical Therapy Start Delay",
      description: `At ${inputs.daysToInfusionStart} days to first infusion, you are significantly above the 2–4 day benchmark. Extended delays directly increase referral loss, patient dissatisfaction, and payer risk.`,
      severity: "critical",
      metric: `${inputs.daysToInfusionStart} days vs. 2–4 day benchmark`,
    });
  } else if (inputs.daysToInfusionStart > BENCHMARKS.referralToStart.acceptable) {
    items.push({
      title: "Above-Benchmark Therapy Start Time",
      description: `Referral-to-start of ${inputs.daysToInfusionStart} days exceeds best-practice thresholds. Each additional day increases the probability of referral abandonment.`,
      severity: "high",
      metric: `${inputs.daysToInfusionStart} days vs. 2–4 day benchmark`,
    });
  }

  if (inputs.referralLossPercent > BENCHMARKS.referralLeakage.acceptable) {
    items.push({
      title: "High Referral Leakage Rate",
      description: `Losing ${inputs.referralLossPercent}% of referrals represents substantial foregone revenue and threatens referral source relationships. The industry range for well-run programs is 3–8%.`,
      severity: inputs.referralLossPercent > BENCHMARKS.referralLeakage.poor ? "critical" : "high",
      metric: `${inputs.referralLossPercent}% vs. 3–8% benchmark`,
    });
  } else if (inputs.referralLossPercent > BENCHMARKS.referralLeakage.good) {
    items.push({
      title: "Elevated Referral Leakage",
      description: `Referral loss of ${inputs.referralLossPercent}% is above best-practice range. Incremental improvement here has direct revenue impact.`,
      severity: "medium",
      metric: `${inputs.referralLossPercent}% vs. 3–8% benchmark`,
    });
  }

  const infusionsPerNurse = inputs.infusionNurses > 0
    ? inputs.infusionsPerWeek / inputs.infusionNurses
    : 0;
  if (infusionsPerNurse > BENCHMARKS.nurseCapacity.max) {
    items.push({
      title: "Nurse Capacity Constraint",
      description: `At ${infusionsPerNurse.toFixed(1)} infusions per nurse per week, your team is operating above sustainable capacity. This creates scheduling delays, quality risk, and limits growth headroom.`,
      severity: "critical",
      metric: `${infusionsPerNurse.toFixed(1)} infusions/nurse/week vs. 6–10 benchmark`,
    });
  } else if (infusionsPerNurse > BENCHMARKS.nurseCapacity.targetMax) {
    items.push({
      title: "Near-Capacity Staffing",
      description: `Nurse caseload of ${infusionsPerNurse.toFixed(1)} infusions/week is near the upper benchmark. Without capacity planning, volume growth will be constrained.`,
      severity: "high",
      metric: `${infusionsPerNurse.toFixed(1)} infusions/nurse/week vs. 6–10 benchmark`,
    });
  }

  const margin = resolveMargin(inputs);
  const revenue = resolveRevenuePerInfusion(inputs);
  const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;
  if (marginPct < 15 && revenue > 0) {
    items.push({
      title: "Margin Compression Risk",
      description: `Contribution margin of ${marginPct.toFixed(1)}% per episode leaves limited buffer against payer rate changes or volume shortfalls. Optimizing delivery cost structure and home infusion mix can materially improve margin.`,
      severity: marginPct < 8 ? "critical" : "high",
      metric: `${marginPct.toFixed(1)}% contribution margin`,
    });
  }

  if (inputs.readmissionRate !== undefined && inputs.readmissionRate > BENCHMARKS.readmissionRate.acceptable) {
    items.push({
      title: "Elevated Readmission Rate",
      description: `A ${inputs.readmissionRate}% 30-day readmission rate is above best-in-class benchmarks and signals potential care gaps in the transition from inpatient to home infusion.`,
      severity: inputs.readmissionRate > BENCHMARKS.readmissionRate.poor ? "critical" : "high",
      metric: `${inputs.readmissionRate}% vs. <10% benchmark`,
    });
  }

  const severityOrder = { critical: 0, high: 1, medium: 2 };
  items.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return items.slice(0, 4);
}

// ─── EXECUTIVE SUMMARY ────────────────────────────────────────────────────────
function generateExecutiveSummary(
  inputs: FormInputs,
  scores: DiagnosticScores,
  opportunity: OpportunityModel
): { headline: string; bullets: string[] } {
  const baseOpportunity = opportunity.annualRevenueOpportunity.base;
  const fmtDollar = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : `$${(n / 1_000).toFixed(0)}K`;

  const headline = `Your program has an estimated ${fmtDollar(baseOpportunity)} annual revenue opportunity from operational improvements—${scores.capacityScore < 60 ? "primarily driven by capacity and access constraints" : "primarily driven by referral recovery and cost optimization"}.`;

  const bullets: string[] = [];

  if (inputs.referralLossPercent > BENCHMARKS.referralLeakage.good) {
    bullets.push(
      `Referral leakage of ${inputs.referralLossPercent}% is resulting in an estimated ${opportunity.lostAnnualInfusions.toLocaleString()} lost infusion episodes annually—a directly recoverable revenue gap of ${fmtDollar(opportunity.lostAnnualInfusions * opportunity.revenuePerInfusion)}.`
    );
  }

  if (inputs.daysToInfusionStart > BENCHMARKS.referralToStart.good) {
    bullets.push(
      `Referral-to-start time of ${inputs.daysToInfusionStart} days is above the 2–4 day benchmark, creating a compounding risk of referral abandonment and reduced competitive positioning with ordering physicians.`
    );
  }

  const infusionsPerNurse = inputs.infusionNurses > 0 ? inputs.infusionsPerWeek / inputs.infusionNurses : 0;
  if (infusionsPerNurse > BENCHMARKS.nurseCapacity.targetMax) {
    bullets.push(
      `Nurse utilization at ${infusionsPerNurse.toFixed(1)} infusions/week exceeds benchmark capacity, limiting your ability to absorb new volume without risk to quality or staff retention.`
    );
  } else if (scores.unitEconomicsScore < 60) {
    bullets.push(
      `Unit economics improvement—particularly increasing home delivery mix and reducing cost per episode—could unlock ${fmtDollar(opportunity.annualMarginOpportunity.base)} in additional annual contribution margin.`
    );
  }

  while (bullets.length < 3) {
    if (bullets.length === 0) {
      bullets.push(`Current program volume of ${inputs.infusionsPerWeek * 52} annual infusions can grow ${inputs.annualGrowthTarget}% with targeted operational improvements to access and delivery efficiency.`);
    } else if (bullets.length === 1) {
      bullets.push(`A ${inputs.homeDeliveryPercent}% home delivery mix presents optimization opportunities in cost structure and patient access—the home infusion model typically drives 10–15% lower cost per episode.`);
    } else {
      bullets.push(`Addressing the top bottlenecks identified in this diagnostic could position your program to capture the ${fmtDollar(opportunity.annualRevenueOpportunity.aggressive)} upside scenario over a 12–18 month optimization horizon.`);
    }
  }

  return { headline, bullets: bullets.slice(0, 3) };
}

// ─── NEXT STEPS ───────────────────────────────────────────────────────────────
function generateNextSteps(scores: DiagnosticScores): string[] {
  const steps: string[] = [];

  if (scores.capacityScore < 60) {
    steps.push("Validate nurse capacity and scheduling data with your operations team to confirm utilization baselines.");
    steps.push("Map current referral-to-start workflow to identify specific delay points: authorization, intake, scheduling, or supply chain.");
  }

  if (scores.growthConstraintIndex > 50) {
    steps.push("Identify a pilot referral source cohort to test a compressed intake process and measure impact on time-to-start.");
    steps.push("Quantify referral loss by source using your CRM or referral management system to prioritize recovery efforts.");
  }

  if (scores.unitEconomicsScore < 60) {
    steps.push("Conduct a cost-per-episode analysis by therapy type to identify your highest and lowest margin service lines.");
    steps.push("Evaluate your home vs. facility delivery ratio by payer and therapy—there may be untapped margin in shifting appropriate volume to home.");
  }

  steps.push("Review assumptions in this model with your finance and operations leads to calibrate the opportunity sizing to your specific program.");
  steps.push("Request a walkthrough with Float Health to explore how operational improvements translate to measurable program outcomes.");

  return steps.slice(0, 5);
}

// ─── BENCHMARKS USED ─────────────────────────────────────────────────────────
function getBenchmarksUsed(): Record<string, string> {
  return {
    "Referral-to-Start Benchmark": BENCHMARKS.referralToStart.label,
    "Nurse Capacity Benchmark": BENCHMARKS.nurseCapacity.label,
    "Referral Leakage Benchmark": BENCHMARKS.referralLeakage.label,
    "Home Delivery Cost Advantage": BENCHMARKS.homeDeliveryDiscount.label,
    "Recoverable Volume Model": BENCHMARKS.timeToStartRecovery.label,
    "Cost Per Episode Bands": BENCHMARKS.costBands.label,
  };
}

// ─── MAIN CALCULATOR ─────────────────────────────────────────────────────────
export function runDiagnostic(inputs: FormInputs): DiagnosticResults {
  const scores: DiagnosticScores = {
    capacityScore: calcCapacityScore(inputs),
    unitEconomicsScore: calcUnitEconomicsScore(inputs),
    growthConstraintIndex: calcGrowthConstraintIndex(inputs),
  };

  const opportunity = calcOpportunityModel(inputs);
  const bottlenecks = calcBottlenecks(inputs);
  const executiveSummary = generateExecutiveSummary(inputs, scores, opportunity);
  const nextSteps = generateNextSteps(scores);
  const benchmarksUsed = getBenchmarksUsed();

  return {
    scores,
    opportunity,
    bottlenecks,
    executiveSummary,
    nextSteps,
    inputs,
    benchmarksUsed,
  };
}
