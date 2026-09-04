"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BarChart3, Users, Globe2, Sparkles } from "lucide-react";

export function AnalyticsSectionNav({ activeTab = "all" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const tabs = [
    { id: "all", label: "All Analytics", icon: Sparkles },
    { id: "visitors", label: "Visitor Analytics", icon: Globe2 },
    { id: "product", label: "Product Analytics", icon: Users },
  ];

  const handleTabChange = (tabId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tabId);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition-all cursor-pointer ${
              isActive
                ? "bg-white font-bold text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
