// app/diagnostic/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormInputs, LeadInfo } from "@/types";

// ─── STEP DEFINITIONS ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: "Volume & Demand", subtitle: "How much volume are you handling today?" },
  { id: 2, title: "Staffing & Delivery", subtitle: "Tell us about your care delivery model." },
  { id: 3, title: "Timing & Quality", subtitle: "Access speed and outcome benchmarks." },
  { id: 4, title: "Unit Economics", subtitle: "The financial mechanics of your program." },
  { id: 5, title: "Your Information", subtitle: "We'll send your results and executive brief here." },
];

const DEFAULT_INPUTS: Partial<FormInputs> = {
  marginInputType: "dollar",
  homeDeliveryPercent: 70,
  annualGrowthTarget: 15,
};

// ─── INPUT COMPONENTS ────────────────────────────────────────────────────────
function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="block text-sm font-medium text-slate-700">{children}</label>
      {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
  min,
  max,
  step = 1,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-slate-400 text-sm font-medium">{prefix}</span>
      )}
      <input
        type="number"
        value={value ?? ""}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value === "" ? undefined : Number(e.target.value);
          onChange(v);
        }}
        className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-12" : "pr-3"}`}
      />
      {suffix && (
        <span className="absolute right-3 text-slate-400 text-sm">{suffix}</span>
      )}
    </div>
  );
}

function AssumptionBadge({ text }: { text: string }) {
  return (
    <div className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1.5">
      <span className="mt-px shrink-0">ℹ</span>
      <span>{text}</span>
    </div>
  );
}

// ─── STEP COMPONENTS ─────────────────────────────────────────────────────────
function Step1({ inputs, update }: { inputs: Partial<FormInputs>; update: (k: keyof FormInputs, v: unknown) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <Label hint="Total completed infusion episodes in a typical week">
          Average infusions per week
        </Label>
        <NumberInput
          value={inputs.infusionsPerWeek}
          onChange={(v) => update("infusionsPerWeek", v)}
          placeholder="e.g. 120"
          min={1}
        />
      </div>
      <div>
        <Label hint="Total inbound referrals received per week across all sources">
          Average referrals per week
        </Label>
        <NumberInput
          value={inputs.referralsPerWeek}
          onChange={(v) => update("referralsPerWeek", v)}
          placeholder="e.g. 145"
          min={1}
        />
      </div>
      <div>
        <Label hint="Estimated % of referrals that don't convert due to wait times, capacity, or access issues">
          Referrals lost due to delays or capacity (%)
        </Label>
        <NumberInput
          value={inputs.referralLossPercent}
          onChange={(v) => update("referralLossPercent", v)}
          placeholder="e.g. 12"
          suffix="%"
          min={0}
          max={100}
        />
        <AssumptionBadge text="Benchmark: Well-run programs lose 3–8% of referrals to capacity-related causes." />
      </div>
    </div>
  );
}

function Step2({ inputs, update }: { inputs: Partial<FormInputs>; update: (k: keyof FormInputs, v: unknown) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <Label hint="Total infusion nurses (FTE) active in your program">
          Number of infusion nurses
        </Label>
        <NumberInput
          value={inputs.infusionNurses}
          onChange={(v) => update("infusionNurses", v)}
          placeholder="e.g. 18"
          min={1}
        />
      </div>
      <div>
        <Label hint="Optional — leave blank to use 75% default">
          Average nurse utilization (%)
        </Label>
        <NumberInput
          value={inputs.nurseUtilizationPercent}
          onChange={(v) => update("nurseUtilizationPercent", v)}
          placeholder="Optional — defaults to 75%"
          suffix="%"
          min={0}
          max={100}
        />
        <AssumptionBadge text="Benchmark: 6–10 infusions per nurse per week is the typical healthy range for home infusion programs." />
      </div>
      <div>
        <Label hint="What % of infusions are delivered at home vs. in-clinic or infusion center">
          % of infusions delivered at home (vs. in-facility)
        </Label>
        <NumberInput
          value={inputs.homeDeliveryPercent}
          onChange={(v) => update("homeDeliveryPercent", v)}
          placeholder="e.g. 70"
          suffix="%"
          min={0}
          max={100}
        />
        <AssumptionBadge text="Assumption: Home delivery typically reduces cost per episode by 10–15% vs. in-facility." />
      </div>
    </div>
  );
}

function Step3({ inputs, update }: { inputs: Partial<FormInputs>; update: (k: keyof FormInputs, v: unknown) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <Label hint="Calendar days from when a referral is received to when the first infusion is administered">
          Avg days from referral to infusion start
        </Label>
        <NumberInput
          value={inputs.daysToInfusionStart}
          onChange={(v) => update("daysToInfusionStart", v)}
          placeholder="e.g. 6"
          suffix="days"
          min={0}
        />
        <AssumptionBadge text="Benchmark: 2–4 days is the best-practice target for home infusion access." />
      </div>
      <div>
        <Label hint="Optional — 30-day all-cause readmission rate for your infusion patient cohort">
          30-day hospital readmission rate (%)
        </Label>
        <NumberInput
          value={inputs.readmissionRate}
          onChange={(v) => update("readmissionRate", v)}
          placeholder="Optional — e.g. 12"
          suffix="%"
          min={0}
          max={100}
        />
        <AssumptionBadge text="Benchmark: Best-in-class home infusion programs achieve <10% 30-day readmission rates." />
      </div>
    </div>
  );
}

function Step4({ inputs, update }: { inputs: Partial<FormInputs>; update: (k: keyof FormInputs, v: unknown) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <Label hint="Fully loaded direct cost per infusion episode, including nursing, pharmacy, supplies, and coordination">
          Avg cost per infusion episode ($)
        </Label>
        <NumberInput
          value={inputs.costPerEpisode}
          onChange={(v) => update("costPerEpisode", v)}
          placeholder="e.g. 850"
          prefix="$"
          min={0}
        />
        <AssumptionBadge text="Directional bands: $150–400 (simple), $400–1,200 (mid-complexity), $1,200–5,000+ (high-complexity). Exact benchmarks vary by therapy type." />
      </div>

      <div>
        <Label>Contribution margin input method</Label>
        <div className="flex gap-3">
          {(["dollar", "percent"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => update("marginInputType", opt)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                inputs.marginInputType === opt
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {opt === "dollar" ? "$ per episode" : "% margin"}
            </button>
          ))}
        </div>
      </div>

      {inputs.marginInputType === "dollar" ? (
        <div>
          <Label hint="Contribution margin = revenue – direct variable costs per episode">
            Avg contribution margin per episode ($)
          </Label>
          <NumberInput
            value={inputs.marginPerEpisode}
            onChange={(v) => update("marginPerEpisode", v)}
            placeholder="e.g. 210"
            prefix="$"
            min={0}
          />
        </div>
      ) : (
        <div>
          <Label hint="Contribution margin as a % of revenue per episode">
            Contribution margin (%)
          </Label>
          <NumberInput
            value={inputs.marginPercent}
            onChange={(v) => update("marginPercent", v)}
            placeholder="e.g. 22"
            suffix="%"
            min={0}
            max={100}
          />
        </div>
      )}

      <div>
        <Label hint="Optional — if available, improves revenue opportunity modeling">
          Avg reimbursement per infusion episode ($) <span className="text-slate-400 font-normal">(optional)</span>
        </Label>
        <NumberInput
          value={inputs.avgReimbursement}
          onChange={(v) => update("avgReimbursement", v)}
          placeholder="Optional — e.g. 1,100"
          prefix="$"
          min={0}
        />
      </div>

      <div>
        <Label hint="Your program's target annual volume growth rate">
          Annual volume growth target (%)
        </Label>
        <NumberInput
          value={inputs.annualGrowthTarget}
          onChange={(v) => update("annualGrowthTarget", v)}
          placeholder="e.g. 15"
          suffix="%"
          min={0}
          max={100}
        />
      </div>
    </div>
  );
}

function Step5({ lead, updateLead }: { lead: Partial<LeadInfo>; updateLead: (k: keyof LeadInfo, v: string) => void }) {
  const ROLES = [
    "VP Specialty Pharmacy Operations",
    "Director of Infusion Services",
    "Director of Clinical Operations",
    "Chief Pharmacy Officer",
    "COO / Chief Clinical Officer",
    "Finance / CFO",
    "Other",
  ];

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">Your results are ready to generate.</p>
        <p className="text-blue-600 text-xs">We'll use this information to personalize your executive brief and send a copy to your email.</p>
      </div>
      <div>
        <Label>Full name</Label>
        <input
          type="text"
          value={lead.name ?? ""}
          onChange={(e) => updateLead("name", e.target.value)}
          placeholder="Jane Smith"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <Label>Work email</Label>
        <input
          type="email"
          value={lead.email ?? ""}
          onChange={(e) => updateLead("email", e.target.value)}
          placeholder="jane@yourcompany.com"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <Label>Organization / Pharmacy name</Label>
        <input
          type="text"
          value={lead.company ?? ""}
          onChange={(e) => updateLead("company", e.target.value)}
          placeholder="Acme Specialty Pharmacy"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <Label>Your role</Label>
        <select
          value={lead.role ?? ""}
          onChange={(e) => updateLead("role", e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Select your role</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <p className="text-xs text-slate-400">
        Your information is used only to generate and deliver your diagnostic report. We do not share your data with third parties.
      </p>
    </div>
  );
}

// ─── VALIDATION ──────────────────────────────────────────────────────────────
function validateStep(step: number, inputs: Partial<FormInputs>, lead: Partial<LeadInfo>): string | null {
  if (step === 1) {
    if (!inputs.infusionsPerWeek) return "Please enter average infusions per week.";
    if (!inputs.referralsPerWeek) return "Please enter average referrals per week.";
    if (inputs.referralLossPercent === undefined) return "Please enter referral loss %.";
  }
  if (step === 2) {
    if (!inputs.infusionNurses) return "Please enter number of infusion nurses.";
    if (inputs.homeDeliveryPercent === undefined) return "Please enter home delivery %.";
  }
  if (step === 3) {
    if (!inputs.daysToInfusionStart) return "Please enter average days to infusion start.";
  }
  if (step === 4) {
    if (!inputs.costPerEpisode) return "Please enter cost per infusion episode.";
    if (inputs.marginInputType === "dollar" && !inputs.marginPerEpisode) return "Please enter contribution margin per episode.";
    if (inputs.marginInputType === "percent" && !inputs.marginPercent) return "Please enter margin %.";
    if (!inputs.annualGrowthTarget) return "Please enter your annual growth target.";
  }
  if (step === 5) {
    if (!lead.name?.trim()) return "Please enter your name.";
    if (!lead.email?.trim() || !lead.email.includes("@")) return "Please enter a valid email address.";
    if (!lead.company?.trim()) return "Please enter your organization.";
    if (!lead.role) return "Please select your role.";
  }
  return null;
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-400 mb-2">
        <span>Step {current} of {total}</span>
        <span>{Math.round((current / total) * 100)}% complete</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DiagnosticPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<Partial<FormInputs>>(DEFAULT_INPUTS);
  const [lead, setLead] = useState<Partial<LeadInfo>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (k: keyof FormInputs, v: unknown) => {
    setInputs((prev) => ({ ...prev, [k]: v }));
    setError(null);
  };

  const updateLead = (k: keyof LeadInfo, v: string) => {
    setLead((prev) => ({ ...prev, [k]: v }));
    setError(null);
  };

  const handleNext = async () => {
    const err = validateStep(step, inputs, lead);
    if (err) { setError(err); return; }
    setError(null);

    if (step < STEPS.length) {
      setStep((s) => s + 1);
    } else {
      setSubmitting(true);
      try {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputs, lead }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Submission failed");
        sessionStorage.setItem("diagnosticResults", JSON.stringify(data.results));
        sessionStorage.setItem("diagnosticLead", JSON.stringify(lead));
        sessionStorage.setItem("diagnosticId", data.id);
        router.push("/results");
      } catch (e: unknown) {
        setError((e instanceof Error ? e.message : null) || "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const current = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">F</span>
          </div>
          <span className="font-semibold text-slate-700">Float Health</span>
          <span className="text-slate-300 mx-2">·</span>
          <span className="text-sm text-slate-500">Infusion Diagnostic</span>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center py-12 px-6">
        <div className="w-full max-w-lg">
          <ProgressBar current={step} total={STEPS.length} />

          <div className="mt-8 mb-6">
            <h1 className="text-2xl font-bold text-slate-900">{current.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{current.subtitle}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            {step === 1 && <Step1 inputs={inputs} update={update} />}
            {step === 2 && <Step2 inputs={inputs} update={update} />}
            {step === 3 && <Step3 inputs={inputs} update={update} />}
            {step === 4 && <Step4 inputs={inputs} update={update} />}
            {step === 5 && <Step5 lead={lead} updateLead={updateLead} />}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {submitting
                  ? "Generating results…"
                  : step === STEPS.length
                  ? "Generate My Results"
                  : "Continue"}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            All inputs are used solely to generate your diagnostic report.
          </p>
        </div>
      </div>
    </div>
  );
}
