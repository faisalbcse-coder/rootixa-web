import { Sparkles, TrendingUp, HelpCircle, CheckCircle2, UserPlus, Calendar } from "lucide-react";

export function QuickInsightsCard({ insights = [], newUsersBreakdown = {} }) {
  const { today = 0, thisWeek = 0, thisMonth = 0 } = newUsersBreakdown;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. New Users Breakdown (1 col) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <UserPlus className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              New Registrations
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Real account sign-up totals by timeline windows.
          </p>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Today
              </span>
              <span className="font-extrabold text-slate-900 text-sm">
                +{today.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> This Week (7d)
              </span>
              <span className="font-extrabold text-indigo-600 text-sm">
                +{thisWeek.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> This Month (30d)
              </span>
              <span className="font-extrabold text-violet-600 text-sm">
                +{thisMonth.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-400">
          Derived from verified Supabase Auth user registration timestamps.
        </p>
      </div>

      {/* 2. Quick Insights (2 cols) */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Quick Insights
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Automated data conclusions derived from real platform activity.
              </p>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live Synthesis
            </span>
          </div>

          {insights.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 flex items-start gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                    {insight.type === "positive" ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : insight.type === "negative" ? (
                      <TrendingUp className="h-4 w-4 text-rose-500 rotate-180" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {insight.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">Not enough data yet</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Insights will appear as Rootixa collects more visitor and user activity.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Rootixa Core Analytics v1.0</span>
          <span>Zero fabricated statements</span>
        </div>
      </div>
    </div>
  );
}
