import { Compass, ExternalLink, HelpCircle, Tag } from "lucide-react";

export function TrafficSourcesSection({ trafficSources = [], utmCampaigns = [] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Main Traffic Sources Table (2 cols) */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Compass className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Traffic Sources
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Where visitors originate before browsing Rootixa.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {trafficSources.length} channels
            </span>
          </div>

          {trafficSources.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th scope="col" className="py-2.5 pl-2 pr-4">Channel / Source</th>
                    <th scope="col" className="px-4 py-2.5 text-right">Visitors</th>
                    <th scope="col" className="px-4 py-2.5 text-right">Sessions</th>
                    <th scope="col" className="px-4 py-2.5 text-right">Page Views</th>
                    <th scope="col" className="py-2.5 pr-2 pl-4 text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trafficSources.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pl-2 pr-4 font-bold text-slate-900">
                        {s.source}
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
                        {s.visitors.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-600 font-medium">
                        {s.sessions.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-600 font-medium">
                        {s.pageViews.toLocaleString()}
                      </td>
                      <td className="py-3.5 pr-2 pl-4 text-right">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                          {s.share}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center">
              <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">Not enough traffic source data yet</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Traffic channels will categorize automatically as external links and direct visitors arrive.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Standardized referrer taxonomy</span>
          <span>Preserves privacy</span>
        </div>
      </div>

      {/* 2. UTM Campaigns Breakdown (1 col) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Tag className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              UTM Campaigns
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Performance of custom marketing tags and promotional links.
          </p>

          {utmCampaigns.length > 0 ? (
            <div className="mt-5 space-y-3">
              {utmCampaigns.slice(0, 5).map((u, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs truncate max-w-[170px]">
                      {u.campaign}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-indigo-600">
                      {u.count} hits
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                    <span>Source: {u.source}</span>
                    <span>&bull;</span>
                    <span>Medium: {u.medium}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No active UTM tags logged</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add ?utm_source=... to marketing links to trace campaigns.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-400 text-center border border-slate-100">
          Supports utm_source, utm_medium, and utm_campaign.
        </div>
      </div>
    </div>
  );
}
