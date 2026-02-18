// app/api/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DiagnosticResults, LeadInfo } from "@/types";

function fmtDollar(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Adequate";
  if (score >= 40) return "At Risk";
  return "Critical";
}

function buildHTML(results: DiagnosticResults, lead: LeadInfo): string {
  const { scores, opportunity, bottlenecks, executiveSummary, nextSteps, inputs, benchmarksUsed } = results;
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Float Health – Infusion Diagnostic Executive Brief</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; background: #fff; font-size: 13px; line-height: 1.5; }
  .page { padding: 48px 52px; max-width: 800px; margin: 0 auto; }
  .header { border-bottom: 2px solid #0052CC; padding-bottom: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-end; }
  .logo { font-size: 18px; font-weight: 700; color: #0052CC; }
  .doc-title { font-size: 11px; color: #64748b; text-align: right; }
  h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  h2 { font-size: 14px; font-weight: 700; color: #1e3a5f; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin: 28px 0 12px; text-transform: uppercase; letter-spacing: 0.05em; }
  h3 { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
  .meta { color: #64748b; font-size: 12px; margin-bottom: 28px; }
  .executive-headline { background: #f0f7ff; border-left: 4px solid #0052CC; padding: 14px 18px; border-radius: 4px; margin-bottom: 14px; font-size: 14px; font-weight: 500; color: #1e3a5f; }
  ul.bullets { padding-left: 18px; margin-bottom: 16px; }
  ul.bullets li { margin-bottom: 6px; color: #334155; }
  .scorecard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 8px; }
  .score-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; }
  .score-label { font-size: 11px; color: #64748b; margin-bottom: 6px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
  .score-value { font-size: 32px; font-weight: 700; color: #0052CC; }
  .score-grade { font-size: 12px; font-weight: 600; margin-top: 4px; }
  .strong { color: #16a34a; } .adequate { color: #ca8a04; } .at-risk { color: #ea580c; } .critical { color: #dc2626; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
  th { background: #f8fafc; text-align: left; padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
  td { padding: 8px 10px; border: 1px solid #e2e8f0; color: #334155; }
  tr:nth-child(even) td { background: #f8fafc; }
  .bottleneck { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; margin-bottom: 10px; }
  .sev-critical { border-left: 4px solid #dc2626; }
  .sev-high { border-left: 4px solid #ea580c; }
  .sev-medium { border-left: 4px solid #ca8a04; }
  .sev-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; margin-right: 8px; }
  .badge-critical { background: #fee2e2; color: #dc2626; }
  .badge-high { background: #ffedd5; color: #ea580c; }
  .badge-medium { background: #fef9c3; color: #ca8a04; }
  .assumption-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 12px 14px; margin-top: 8px; font-size: 11px; color: #78350f; }
  .step-item { display: flex; gap: 10px; margin-bottom: 8px; }
  .step-num { width: 20px; height: 20px; background: #0052CC; color: white; border-radius: 50%; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
  .footer { border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 14px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
  .inputs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .input-row { padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
  .input-key { color: #64748b; font-size: 11px; }
  .input-val { font-weight: 600; color: #1e293b; font-size: 12px; }
  .big-oppty { text-align: center; padding: 20px; background: #f0f7ff; border-radius: 8px; margin-bottom: 16px; }
  .big-oppty-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
  .big-oppty-val { font-size: 36px; font-weight: 700; color: #0052CC; }
  .big-oppty-sub { font-size: 11px; color: #94a3b8; margin-top: 4px; }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div>
      <div class="logo">Float Health</div>
      <div style="font-size:12px;color:#64748b;margin-top:2px;">Infusion Capacity + Unit Economics Diagnostic</div>
    </div>
    <div class="doc-title">
      <div>Executive Brief — Confidential</div>
      <div>${today}</div>
      <div style="margin-top:2px;">Prepared for: ${lead.company}</div>
    </div>
  </div>

  <h1>Operational Diagnostic Summary</h1>
  <div class="meta">${lead.name} · ${lead.role} · ${lead.email}</div>

  <h2>Executive Summary</h2>
  <div class="executive-headline">${executiveSummary.headline}</div>
  <ul class="bullets">
    ${executiveSummary.bullets.map((b) => `<li>${b}</li>`).join("")}
  </ul>

  <h2>Performance Scorecards</h2>
  <div class="scorecard-grid">
    <div class="score-card">
      <div class="score-label">Capacity Efficiency</div>
      <div class="score-value">${scores.capacityScore}</div>
      <div class="score-grade ${scoreLabel(scores.capacityScore).toLowerCase().replace(" ", "-")}">${scoreLabel(scores.capacityScore)}</div>
    </div>
    <div class="score-card">
      <div class="score-label">Unit Economics</div>
      <div class="score-value">${scores.unitEconomicsScore}</div>
      <div class="score-grade ${scoreLabel(scores.unitEconomicsScore).toLowerCase().replace(" ", "-")}">${scoreLabel(scores.unitEconomicsScore)}</div>
    </div>
    <div class="score-card">
      <div class="score-label">Growth Constraint Index</div>
      <div class="score-value">${scores.growthConstraintIndex}</div>
      <div class="score-grade" style="color:#ea580c;">${scores.growthConstraintIndex > 60 ? "High Constraint" : scores.growthConstraintIndex > 35 ? "Moderate" : "Low"}</div>
    </div>
  </div>
  <p style="font-size:11px;color:#94a3b8;margin-top:8px;">Capacity + Unit Economics: higher = better. Growth Constraint Index: higher = more opportunity to unlock.</p>

  <h2>Annual Opportunity Model</h2>
  <div class="big-oppty">
    <div class="big-oppty-label">Base Case Annual Revenue Opportunity</div>
    <div class="big-oppty-val">${fmtDollar(opportunity.annualRevenueOpportunity.base)}</div>
    <div class="big-oppty-sub">${opportunity.totalOpportunityInfusions.base.toLocaleString()} recoverable infusion episodes · ${fmtDollar(opportunity.revenuePerInfusion)} avg revenue/episode</div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th>Conservative</th>
        <th>Base Case</th>
        <th>Aggressive</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Lost infusions (referral leakage)</td><td>${opportunity.lostAnnualInfusions.toLocaleString()}</td><td>${opportunity.lostAnnualInfusions.toLocaleString()}</td><td>${opportunity.lostAnnualInfusions.toLocaleString()}</td></tr>
      <tr><td>Recoverable (time-to-start improvement)</td><td>${opportunity.recoverableInfusions.conservative.toLocaleString()}</td><td>${opportunity.recoverableInfusions.base.toLocaleString()}</td><td>${opportunity.recoverableInfusions.aggressive.toLocaleString()}</td></tr>
      <tr><td><strong>Total opportunity (infusions)</strong></td><td><strong>${opportunity.totalOpportunityInfusions.conservative.toLocaleString()}</strong></td><td><strong>${opportunity.totalOpportunityInfusions.base.toLocaleString()}</strong></td><td><strong>${opportunity.totalOpportunityInfusions.aggressive.toLocaleString()}</strong></td></tr>
      <tr><td><strong>Annual revenue opportunity</strong></td><td><strong>${fmtDollar(opportunity.annualRevenueOpportunity.conservative)}</strong></td><td><strong>${fmtDollar(opportunity.annualRevenueOpportunity.base)}</strong></td><td><strong>${fmtDollar(opportunity.annualRevenueOpportunity.aggressive)}</strong></td></tr>
      <tr><td><strong>Annual margin opportunity</strong></td><td><strong>${fmtDollar(opportunity.annualMarginOpportunity.conservative)}</strong></td><td><strong>${fmtDollar(opportunity.annualMarginOpportunity.base)}</strong></td><td><strong>${fmtDollar(opportunity.annualMarginOpportunity.aggressive)}</strong></td></tr>
    </tbody>
  </table>

  <h2>Bottleneck Analysis</h2>
  ${bottlenecks.map((b) => `
  <div class="bottleneck sev-${b.severity}">
    <h3><span class="sev-badge badge-${b.severity}">${b.severity}</span>${b.title}</h3>
    <p style="color:#475569;font-size:12px;margin-top:4px;">${b.description}</p>
    <p style="color:#64748b;font-size:11px;margin-top:6px;font-weight:600;">Metric: ${b.metric}</p>
  </div>`).join("")}

  <h2>Recommended Next Steps</h2>
  ${nextSteps.map((step, i) => `
  <div class="step-item">
    <div class="step-num">${i + 1}</div>
    <p style="color:#334155;">${step}</p>
  </div>`).join("")}

  <h2>Your Inputs</h2>
  <div class="inputs-grid">
    <div class="input-row"><div class="input-key">Infusions/week</div><div class="input-val">${inputs.infusionsPerWeek}</div></div>
    <div class="input-row"><div class="input-key">Referrals/week</div><div class="input-val">${inputs.referralsPerWeek}</div></div>
    <div class="input-row"><div class="input-key">Referral loss %</div><div class="input-val">${inputs.referralLossPercent}%</div></div>
    <div class="input-row"><div class="input-key">Infusion nurses</div><div class="input-val">${inputs.infusionNurses}</div></div>
    <div class="input-row"><div class="input-key">Nurse utilization</div><div class="input-val">${inputs.nurseUtilizationPercent ?? "75% (default)"}</div></div>
    <div class="input-row"><div class="input-key">Home delivery %</div><div class="input-val">${inputs.homeDeliveryPercent}%</div></div>
    <div class="input-row"><div class="input-key">Days to first infusion</div><div class="input-val">${inputs.daysToInfusionStart}</div></div>
    <div class="input-row"><div class="input-key">Readmission rate</div><div class="input-val">${inputs.readmissionRate !== undefined ? inputs.readmissionRate + "%" : "Not provided"}</div></div>
    <div class="input-row"><div class="input-key">Cost per episode</div><div class="input-val">$${inputs.costPerEpisode?.toLocaleString()}</div></div>
    <div class="input-row"><div class="input-key">Growth target</div><div class="input-val">${inputs.annualGrowthTarget}%</div></div>
  </div>

  <h2>Benchmark Assumptions</h2>
  <div class="assumption-box">
    <p style="font-weight:600;margin-bottom:8px;">All benchmarks used in this analysis are directional assumptions, not verified industry standards. They should be validated against your program's actual data and relevant benchmarking sources.</p>
    ${Object.entries(benchmarksUsed).map(([k, v]) => `<p style="margin-bottom:4px;"><strong>${k}:</strong> ${v}</p>`).join("")}
  </div>

  <div class="footer">
    <span>Prepared by Float Health – for internal evaluation purposes only</span>
    <span>${today}</span>
  </div>

</div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { results, lead } = body as { results: DiagnosticResults; lead: LeadInfo };

    if (!results || !lead) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const html = buildHTML(results, lead);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (e) {
    console.error("PDF error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
