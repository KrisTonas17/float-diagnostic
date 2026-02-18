// app/results/page.tsx
"use client";

import { useEffect, useState } from "react";
import { DiagnosticResults, LeadInfo } from "@/types";

function fmtDollar(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-600";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Adequate";
  if (score >= 40) return "At Risk";
  return "Critical";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-50 border-emerald-100";
  if (score >= 60) return "bg-amber-50 border-amber-100";
  if (score >= 40) return "bg-orange-50 border-orange-100";
  return "bg-red-50 border-red-100";
}

function constraintLabel(score: number): string {
  if (score >= 60) return "High Constraint";
  if (score >= 35) return "Moderate";
  return "Low";
}

function constraintColor(score: number): string {
  if (score >= 60) return "text-red-600";
  if (score >= 35) return "text-amber-500";
  return "text-emerald-600";
}

function SeverityBadge({ severity }: { severity: "critical" | "high" | "medium" }) {
  const styles = {
    critical: "bg-red-50 text-red-700 border-red-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase border ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function GaugeBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : score >= 40 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function ResultsPage() {
  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const [lead, setLead] = useState<LeadInfo | null>(null);
  const [walkthroughSent, setWalkthroughSent] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    const r = sessionStorage.getItem("diagnosticResults");
    const l = sessionStorage.getItem("diagnosticLead");
    if (r) setResults(JSON.parse(r));
    if (l) setLead(JSON.parse(l));
  }, []);

  const handleDownload = async () => {
    if (!results || !lead) return;
    setDownloadLoading(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results, lead }),
      });
      const html = await res.text();
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 500);
      }
    } finally {
      setDownloadLoading(false);
    }
  };

  if (!results || !lead) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading your results…</p>
      </div>
    );
  }

  const { scores, opportunity, bottlenecks, executiveSummary, nextSteps, benchmarksUsed } = results;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="font-semibold text-slate-700">Float Health</span>
            <span className="text-slate-300 mx-2">·</span>
            <span className="text-sm text-slate-500">Infusion Diagnostic Results</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={downloadLoading}
              className="flex items-center gap-1.5 text-sm px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloadLoading ? "Preparing…" : "Download Brief"}
            </button>
            {walkthroughSent ? (
              <span className="flex items-center gap-1 text-sm px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
                ✓ Request sent
              </span>
            ) : (
              <button
                onClick={() => setWalkthroughSent(true)}
                className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Request a Walkthrough
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Executive Summary */}
        <section>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Executive Summary</h2>
              <p className="text-sm text-slate-500 mt-0.5">{lead.company} · {lead.role}</p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-4">
            <p className="text-blue-900 font-medium text-sm leading-relaxed">{executiveSummary.headline}</p>
          </div>
          <div className="grid gap-3">
            {executiveSummary.bullets.map((b, i) => (
              <div key={i} className="flex gap-3 bg-white border border-slate-100 rounded-xl p-4">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-sm text-slate-700 leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Scorecards */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Performance Scorecards</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className={`rounded-xl border p-5 ${scoreBg(scores.capacityScore)}`}>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Capacity Efficiency</div>
              <div className={`text-4xl font-bold ${scoreColor(scores.capacityScore)}`}>{scores.capacityScore}</div>
              <div className={`text-sm font-semibold mt-1 ${scoreColor(scores.capacityScore)}`}>{scoreLabel(scores.capacityScore)}</div>
              <GaugeBar score={scores.capacityScore} />
              <p className="text-xs text-slate-500 mt-3">Based on nurse caseload, referral-to-start time, and referral leakage rate.</p>
            </div>

            <div className={`rounded-xl border p-5 ${scoreBg(scores.unitEconomicsScore)}`}>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Unit Economics</div>
              <div className={`text-4xl font-bold ${scoreColor(scores.unitEconomicsScore)}`}>{scores.unitEconomicsScore}</div>
              <div className={`text-sm font-semibold mt-1 ${scoreColor(scores.unitEconomicsScore)}`}>{scoreLabel(scores.unitEconomicsScore)}</div>
              <GaugeBar score={scores.unitEconomicsScore} />
              <p className="text-xs text-slate-500 mt-3">Based on contribution margin per episode, home delivery mix, and cost structure.</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Growth Constraint Index</div>
              <div className={`text-4xl font-bold ${constraintColor(scores.growthConstraintIndex)}`}>{scores.growthConstraintIndex}</div>
              <div className={`text-sm font-semibold mt-1 ${constraintColor(scores.growthConstraintIndex)}`}>{constraintLabel(scores.growthConstraintIndex)}</div>
              <GaugeBar score={scores.growthConstraintIndex} />
              <p className="text-xs text-slate-500 mt-3">Higher score = greater operational constraint on volume growth. Indicates opportunity size.</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Scores are calculated against configurable benchmark assumptions. See methodology notes below.
          </p>
        </section>

        {/* Opportunity Model */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Opportunity Model</h2>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-200 mb-1">Base Case Annual Revenue Opportunity</div>
            <div className="text-5xl font-bold mb-1">{fmtDollar(opportunity.annualRevenueOpportunity.base)}</div>
            <div className="text-sm text-blue-200">
              {opportunity.totalOpportunityInfusions.base.toLocaleString()} recoverable episodes · {fmtDollar(opportunity.revenuePerInfusion)} avg per episode
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Metric", "Conservative", "Base Case ★", "Aggressive"].map((h, i) => (
                    <th key={h} className={`text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider ${i === 0 ? "text-slate-500" : i === 2 ? "text-blue-600 bg-blue-50" : "text-slate-500"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Current annual infusions", c: opportunity.currentAnnualInfusions.toLocaleString(), b: opportunity.currentAnnualInfusions.toLocaleString(), a: opportunity.currentAnnualInfusions.toLocaleString(), bold: false },
                  { label: "Lost (referral leakage)", c: opportunity.lostAnnualInfusions.toLocaleString(), b: opportunity.lostAnnualInfusions.toLocaleString(), a: opportunity.lostAnnualInfusions.toLocaleString(), bold: false },
                  { label: "Recoverable (time-to-start)", c: opportunity.recoverableInfusions.conservative.toLocaleString(), b: opportunity.recoverableInfusions.base.toLocaleString(), a: opportunity.recoverableInfusions.aggressive.toLocaleString(), bold: false },
                  { label: "Total opportunity (episodes)", c: opportunity.totalOpportunityInfusions.conservative.toLocaleString(), b: opportunity.totalOpportunityInfusions.base.toLocaleString(), a: opportunity.totalOpportunityInfusions.aggressive.toLocaleString(), bold: true },
                  { label: "Annual revenue opportunity", c: fmtDollar(opportunity.annualRevenueOpportunity.conservative), b: fmtDollar(opportunity.annualRevenueOpportunity.base), a: fmtDollar(opportunity.annualRevenueOpportunity.aggressive), bold: true },
                  { label: "Annual margin opportunity", c: fmtDollar(opportunity.annualMarginOpportunity.conservative), b: fmtDollar(opportunity.annualMarginOpportunity.base), a: fmtDollar(opportunity.annualMarginOpportunity.aggressive), bold: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className={`px-5 py-3 text-slate-700 ${row.bold ? "font-semibold" : ""}`}>{row.label}</td>
                    <td className={`px-5 py-3 text-slate-600 ${row.bold ? "font-semibold" : ""}`}>{row.c}</td>
                    <td className={`px-5 py-3 text-blue-700 bg-blue-50/40 ${row.bold ? "font-semibold" : ""}`}>{row.b}</td>
                    <td className={`px-5 py-3 text-slate-600 ${row.bold ? "font-semibold" : ""}`}>{row.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Conservative assumes 10% time-to-start recovery. Base assumes 18%. Aggressive assumes 25%. All scenarios assume full referral leakage recovery.
          </p>
        </section>

        {/* Bottlenecks */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Bottleneck Analysis</h2>
          <div className="space-y-3">
            {bottlenecks.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                <p className="text-emerald-700 font-medium text-sm">No critical bottlenecks identified. Your inputs suggest a well-optimized program.</p>
              </div>
            ) : (
              bottlenecks.map((b, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <SeverityBadge severity={b.severity} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 text-sm">{b.title}</h3>
                      <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">{b.description}</p>
                      <div className="mt-2 text-xs font-medium text-slate-400 bg-slate-50 inline-block px-2.5 py-1 rounded-md">
                        {b.metric}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recommended Next Steps</h2>
          <div className="space-y-3">
            {nextSteps.map((step, i) => (
              <div key={i} className="flex gap-4 bg-white border border-slate-100 rounded-xl p-4">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Validate these findings with your team</h2>
          <p className="text-blue-100 text-sm mb-6 max-w-lg mx-auto">
            Our team can walk through the model with you, help validate the assumptions, and map specific operational interventions to your program's context.
          </p>
          {walkthroughSent ? (
            <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold">
              ✓ Walkthrough request sent — we'll be in touch shortly.
            </div>
          ) : (
            <button
              onClick={() => setWalkthroughSent(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-600 font-semibold px-8 py-3.5 rounded-lg transition-colors"
            >
              Request a Walkthrough
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </section>

        {/* Assumptions */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Benchmark Assumptions</h2>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <p className="text-amber-800 text-xs font-medium mb-3">
              All benchmarks in this diagnostic are directional assumptions, not verified industry standards. They should be validated against your program's own data and relevant benchmarking sources before use in formal business cases.
            </p>
            <div className="space-y-2">
              {Object.entries(benchmarksUsed).map(([k, v]) => (
                <div key={k} className="text-xs">
                  <span className="font-semibold text-amber-900">{k}:</span>{" "}
                  <span className="text-amber-700">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
