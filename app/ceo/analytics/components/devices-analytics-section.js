import { Smartphone, Monitor, Tablet, Layers, Repeat, HelpCircle, Activity } from "lucide-react";

export function DevicesAnalyticsSection({
  devices = [],
  browsers = [],
  operatingSystems = [],
  visitorTypes = {},
  sessionMetrics = {},
}) {
  const { new: newType = { count: 0, share: 0 }, returning = { count: 0, share: 0 } } =
    visitorTypes || {};
  const {
    totalSessions = 0,
    avgDurationFormatted = "< 1m",
    pagesPerSession = "1.0",
    bounceRate = null,
  } = sessionMetrics || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Device Category & Browsers */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Monitor className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Device Breakdown
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Hardware category distribution across visitors.
          </p>

          <div className="mt-5 space-y-4">
            {devices.map((d) => (
              <div key={d.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-2">
                    {d.name === "Mobile" ? (
                      <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
                    ) : d.name === "Tablet" ? (
                      <Tablet className="h-3.5 w-3.5 text-violet-600" />
                    ) : (
                      <Monitor className="h-3.5 w-3.5 text-blue-600" />
                    )}
                    <span>{d.name}</span>
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {d.count.toLocaleString()} ({d.share}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500"
                    style={{ width: `${Math.max(d.share, d.count > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Top Web Browsers
            </h4>
            <div className="flex flex-wrap gap-2">
              {browsers.length > 0 ? (
                browsers.slice(0, 5).map((b) => (
                  <span
                    key={b.name}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-semibold text-slate-700"
                  >
                    <span>{b.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">({b.share}%)</span>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400">Awaiting visitor signals</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-400 text-center border border-slate-100">
          Client-side User-Agent classification
        </div>
      </div>

      {/* 2. Operating Systems & Visitor Type */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Layers className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Visitor Type & OS
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Visitor retention and system environments.
          </p>

          {/* New vs Returning Card */}
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Repeat className="h-3.5 w-3.5 text-indigo-600" /> New vs Returning
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                {newType.share}% new / {returning.share}% returning
              </span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${newType.share}%` }}
                title={`New: ${newType.share}%`}
              />
              <div
                className="h-full bg-violet-400 transition-all duration-500"
                style={{ width: `${returning.share}%` }}
                title={`Returning: ${returning.share}%`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-600" /> New ({newType.count})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-violet-400" /> Returning ({returning.count})
              </span>
            </div>
          </div>

          {/* Operating Systems */}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Operating Systems
            </h4>
            <div className="space-y-2">
              {operatingSystems.length > 0 ? (
                operatingSystems.slice(0, 4).map((os) => (
                  <div key={os.name} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{os.name}</span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {os.count} ({os.share}%)
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-[11px] text-slate-400">Awaiting visitor signals</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-400 text-center border border-slate-100">
          Anonymous first-party visitor fingerprinting
        </div>
      </div>

      {/* 3. Session Overview */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Activity className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Session Overview
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Duration, depth, and bounce rate of browsing sessions.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sessions</p>
              <p className="mt-1 text-xl font-black text-slate-900">{totalSessions.toLocaleString()}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg. Duration</p>
              <p className="mt-1 text-xl font-black text-indigo-600">{avgDurationFormatted}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pages / Session</p>
              <p className="mt-1 text-xl font-black text-slate-900">{pagesPerSession}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bounce Rate</p>
              <p className="mt-1 text-xl font-black text-slate-900">{bounceRate || "N/A"}</p>
            </div>
          </div>

          <p className="mt-5 text-[11px] text-slate-500 leading-relaxed">
            A session times out after 30 minutes of rolling inactivity. Bounce rate represents single-page visits with minimal interaction time.
          </p>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-400 text-center border border-slate-100">
          Heartbeat pulse & active presence engine
        </div>
      </div>
    </div>
  );
}
