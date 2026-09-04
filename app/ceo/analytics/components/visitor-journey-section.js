import { Route, ArrowRight, HelpCircle } from "lucide-react";

export function VisitorJourneySection({ journeys = [] }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Route className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Common Visitor Journeys
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Most frequent multi-page navigation patterns across browsing sessions.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Top Paths
          </span>
        </div>

        {journeys.length > 0 ? (
          <div className="space-y-3">
            {journeys.map((j, idx) => {
              const steps = j.flow.split(" → ");

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
                    {steps.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2">
                        <span className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-slate-800 font-semibold shadow-2xs">
                          {step}
                        </span>
                        {sIdx < steps.length - 1 && (
                          <ArrowRight className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <span className="font-extrabold text-slate-900 text-xs">
                      {j.count} {j.count === 1 ? "session" : "sessions"}
                    </span>
                    <span className="inline-flex rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700">
                      {j.share}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center">
            <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700">Not enough journey data yet</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
              Navigation paths will emerge as visitors browse multiple pages in a session.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Path sequences anonymized</span>
        <span>Zero keystroke or screen tracking</span>
      </div>
    </div>
  );
}
