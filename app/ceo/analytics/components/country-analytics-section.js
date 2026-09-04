import { Globe, MapPin, HelpCircle } from "lucide-react";

function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2 || countryCode === "XX" || countryCode === "UNKNOWN") {
    return "🌐";
  }
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
}

export function CountryAnalyticsSection({ countries = [], hasLocationData = false }) {
  const validCountries = countries.filter((c) => c.code !== "UNKNOWN" && c.code !== "XX");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Country Table (2 cols) */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Globe className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Visitors by Country
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Aggregated visitor locations derived from server edge headers.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {validCountries.length} countries
            </span>
          </div>

          {hasLocationData && validCountries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th scope="col" className="py-2.5 pl-2 pr-4">#</th>
                    <th scope="col" className="px-4 py-2.5">Country</th>
                    <th scope="col" className="px-4 py-2.5 text-right">Visitors</th>
                    <th scope="col" className="px-4 py-2.5 text-right">Sessions</th>
                    <th scope="col" className="px-4 py-2.5 text-right">Page Views</th>
                    <th scope="col" className="py-2.5 pr-2 pl-4 text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validCountries.map((c, idx) => (
                    <tr key={c.code} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pl-2 pr-4 font-bold text-slate-400">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base leading-none">{getFlagEmoji(c.code)}</span>
                          <span>{c.name}</span>
                          <span className="text-[10px] font-mono font-semibold text-slate-400">
                            ({c.code})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
                        {c.visitors.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-600 font-medium">
                        {c.sessions.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-600 font-medium">
                        {c.pageViews.toLocaleString()}
                      </td>
                      <td className="py-3.5 pr-2 pl-4 text-right">
                        <span className="inline-flex rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700">
                          {c.share}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">Not enough location data yet</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                Geographic distribution will show here as live visitors arrive from various regions.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Approximate country-level precision</span>
          <span>Zero IP logging</span>
        </div>
      </div>

      {/* 2. Visual Country Distribution (1 col) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Geographic Share
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Relative distribution of visitor traffic across regions.
          </p>

          {hasLocationData && validCountries.length > 0 ? (
            <div className="mt-5 space-y-3.5">
              {validCountries.slice(0, 7).map((c) => (
                <div key={c.code} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-2 truncate max-w-[170px]">
                      <span>{getFlagEmoji(c.code)}</span>
                      <span>{c.name}</span>
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {c.visitors} ({c.share}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${Math.max(Number(c.share), 6)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">Not enough location data yet</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Visual distribution requires active regional visitors.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-400 text-center border border-slate-100">
          Rankings dynamically adjust to incoming global traffic.
        </div>
      </div>
    </div>
  );
}
