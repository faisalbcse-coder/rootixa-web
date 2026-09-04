import Link from "next/link";
import { Wrench, ExternalLink, QrCode, FileText, ImagePlus, Sparkles, Archive, Calculator } from "lucide-react";

// Icon mapper for Rootixa tools
function getToolIcon(id) {
  switch (id) {
    case "qr-code":
      return <QrCode className="h-4 w-4 text-indigo-600" />;
    case "cv-builder":
      return <FileText className="h-4 w-4 text-blue-600" />;
    case "image-resizer":
      return <ImagePlus className="h-4 w-4 text-emerald-600" />;
    case "bg-remover":
      return <Sparkles className="h-4 w-4 text-fuchsia-600" />;
    case "pdf-converter":
      return <Archive className="h-4 w-4 text-violet-600" />;
    case "invoice-generator":
      return <Calculator className="h-4 w-4 text-amber-600" />;
    default:
      return <Wrench className="h-4 w-4 text-slate-500" />;
  }
}

export function ToolsUsageSection({ tools = [], totalTrackedEvents = 0 }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Most Used Tools Table (2 cols) */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Wrench className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Most Used Tools
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Ranked by real platform operations logged across Rootixa.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {totalTrackedEvents.toLocaleString()} total uses
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th scope="col" className="py-2.5 pl-2 pr-4"># Rank</th>
                  <th scope="col" className="px-4 py-2.5">Tool Name</th>
                  <th scope="col" className="px-4 py-2.5">Category</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Uses</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Share</th>
                  <th scope="col" className="py-2.5 pr-2 pl-4 text-center">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tools.map((tool, idx) => (
                  <tr key={tool.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Rank */}
                    <td className="py-3.5 pl-2 pr-4 font-bold text-slate-400">
                      #{idx + 1}
                    </td>

                    {/* Tool Name with Icon */}
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
                          {getToolIcon(tool.id)}
                        </div>
                        <span>{tool.name}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 text-slate-500 font-medium">
                      {tool.category}
                    </td>

                    {/* Uses */}
                    <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
                      {tool.uses.toLocaleString()}
                    </td>

                    {/* Share */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                        {tool.share}%
                      </span>
                    </td>

                    {/* Tool Action / Link */}
                    <td className="py-3.5 pr-2 pl-4 text-center">
                      {tool.link !== "#" ? (
                        <Link
                          href={tool.link}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                          title="Open tool"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Coming Soon
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right: Tool Usage Distribution Chart (1 col) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Tool Usage Distribution
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Relative engagement share among available tools.
          </p>

          <div className="mt-5 space-y-4">
            {tools.map((tool) => (
              <div key={tool.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                    {tool.name}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {tool.uses.toLocaleString()} ({tool.share}%)
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500"
                    style={{ width: `${Math.max(tool.share, tool.uses > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-400 text-center border border-slate-100">
          Distribution updates in real-time as users execute tool actions.
        </div>
      </div>
    </div>
  );
}
