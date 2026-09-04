import { Radio, Smartphone, Monitor, Tablet, Globe, HelpCircle } from "lucide-react";

function getDeviceIcon(category) {
  if (category === "Mobile") return <Smartphone className="h-3.5 w-3.5 text-slate-500" />;
  if (category === "Tablet") return <Tablet className="h-3.5 w-3.5 text-slate-500" />;
  return <Monitor className="h-3.5 w-3.5 text-slate-500" />;
}

export function LiveVisitorsCard({ liveVisitors }) {
  const { count = 0, list = [] } = liveVisitors || {};

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Real-Time Live Visitors
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
                <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
                Live Pulse
              </span>
            </div>
          </div>

          <div className="text-sm font-extrabold text-slate-900">
            <span className="text-emerald-600 text-lg">{count}</span>{" "}
            <span className="text-slate-500 font-semibold text-xs">
              {count === 1 ? "visitor online right now" : "visitors online right now"}
            </span>
          </div>
        </div>

        {list.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th scope="col" className="py-2.5 pl-2 pr-4">Location</th>
                  <th scope="col" className="px-4 py-2.5">Current Page</th>
                  <th scope="col" className="px-4 py-2.5">Device</th>
                  <th scope="col" className="py-2.5 pr-2 pl-4 text-right">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((v, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 pl-2 pr-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span>{v.countryName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-indigo-600 font-semibold">
                      {v.currentPage}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        {getDeviceIcon(v.deviceCategory)}
                        <span>{v.deviceCategory}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-2 pl-4 text-right text-slate-500 font-medium text-[11px]">
                      {v.lastActiveFormatted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700">No active visitors right now</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live presence updates in real-time as visitors navigate Rootixa.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>5-minute rolling activity window</span>
        <span>Anonymized telemetry</span>
      </div>
    </div>
  );
}
