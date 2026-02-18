// app/page.tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-slate-800 text-lg">Float Health</span>
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Enterprise Diagnostic Tool
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider rounded-full mb-6">
            Specialty Pharmacy Operations
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight text-balance mb-6">
            Infusion Capacity &{" "}
            <span className="text-blue-600">Unit Economics</span>{" "}
            Diagnostic
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-4 text-balance">
            A 5-minute operational assessment that quantifies your program's capacity
            constraints, referral leakage, and unit economics—and sizes the annual
            revenue opportunity from targeted improvements.
          </p>
          <p className="text-sm text-slate-400 mb-10">
            Used by VP Operations, Directors of Infusion Services, and Chief Pharmacy Officers
            to build internal business cases for program optimization.
          </p>
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold px-8 py-4 rounded-lg transition-colors shadow-sm"
          >
            Run the Diagnostic
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="mt-4 text-xs text-slate-400">
            No commitment required. Results include a downloadable executive brief.
          </p>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-slate-800 mb-12">
            What the diagnostic produces
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "◎",
                title: "Three Performance Scores",
                body: "Capacity Efficiency, Unit Economics Health, and Growth Constraint Index—each benchmarked against specialty pharmacy norms.",
              },
              {
                icon: "◈",
                title: "Annual Opportunity Sizing",
                body: "Conservative, base, and aggressive scenarios quantifying the revenue and margin available from improving your delivery model.",
              },
              {
                icon: "◧",
                title: "Executive PDF Brief",
                body: "A ready-to-share document with your inputs, assumptions, scores, and scenario analysis—formatted for internal stakeholder review.",
              },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <div className="text-2xl mb-3 text-blue-500">{card.icon}</div>
                <h3 className="font-semibold text-slate-800 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Input areas preview */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-slate-800 mb-4">
            Four diagnostic areas, ~15 inputs
          </h2>
          <p className="text-center text-slate-500 mb-12 text-sm">
            Designed for operational leaders who know their program numbers.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { step: "01", title: "Volume & Demand", desc: "Weekly infusion volume, referrals, and loss rate" },
              { step: "02", title: "Staffing & Delivery Model", desc: "Nurse headcount, utilization, and home/facility mix" },
              { step: "03", title: "Timing & Quality", desc: "Referral-to-start days and readmission rate" },
              { step: "04", title: "Unit Economics", desc: "Cost per episode, contribution margin, and growth targets" },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-5 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors">
                <div className="text-blue-500 font-bold text-xs mt-0.5 w-6 shrink-0">{item.step}</div>
                <div>
                  <div className="font-semibold text-slate-700 text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-blue-600">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to size your opportunity?
          </h2>
          <p className="text-blue-100 mb-8 text-sm">
            The diagnostic takes approximately 5 minutes. Results are immediately available and exportable.
          </p>
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-600 font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            Run the Diagnostic
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Float Health. All rights reserved.</span>
          <span>For internal evaluation purposes only.</span>
        </div>
      </footer>
    </div>
  );
}
