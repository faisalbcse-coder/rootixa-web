import { redirect } from "next/navigation";
import { MessageSquare, Clock, CheckCircle2, Star } from "lucide-react";
import { getAdminContext } from "@/lib/auth";
import { getAllFeedbacksForAdmin } from "@/lib/feedback/store";
import { AdminStatCard } from "@/app/ceo/components/admin-stat-card";
import { FeedbackClientView } from "./feedback-client-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Feedback & User Inbox | Rootixa Console",
  description: "Review user suggestions, issue reports, and reply to community feedback.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CeoFeedbackPage() {
  let adminContext = null;
  try {
    adminContext = await getAdminContext();
  } catch {
    // ignore
  }

  if (!adminContext && process.env.NODE_ENV === "production") {
    redirect("/ceo");
  }

  const feedbacks = await getAllFeedbacksForAdmin();

  // Calculate quick stats from real data only
  const total = feedbacks.length;
  const pending = feedbacks.filter((f) => f.status === "pending").length;
  const replied = feedbacks.filter((f) => f.status === "replied" || f.status === "resolved").length;
  const avgRating = total > 0
    ? (feedbacks.reduce((sum, f) => sum + (Number(f.rating) || 5), 0) / total).toFixed(1)
    : "—";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          User Feedback & Inbox
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review community suggestions, bug reports, and send updates to users.
        </p>
      </div>

      {/* Stats Cards */}
      <section aria-label="Feedback Statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            title="Total Submissions"
            value={total}
            change={total > 0 ? `${total} verified entries` : "No submissions yet"}
            changeType="neutral"
            icon={MessageSquare}
            isMock={false}
          />
          <AdminStatCard
            title="Pending Replies"
            value={pending}
            change={pending > 0 ? `${pending} awaiting reply` : "All caught up"}
            changeType={pending > 0 ? "negative" : "positive"}
            icon={Clock}
            isMock={false}
          />
          <AdminStatCard
            title="Replied / Handled"
            value={replied}
            change={total > 0 ? `${Math.round((replied / total) * 100)}% resolution rate` : "No records yet"}
            changeType="positive"
            icon={CheckCircle2}
            isMock={false}
          />
          <AdminStatCard
            title="Average Rating"
            value={total > 0 ? `${avgRating} ★` : "—"}
            change={total > 0 ? "Community satisfaction" : "No ratings yet"}
            changeType={total > 0 ? "positive" : "neutral"}
            icon={Star}
            isMock={false}
          />
        </div>
      </section>

      {/* Interactive Management View */}
      <section aria-label="Feedback List and Reply Center">
        <FeedbackClientView initialFeedbacks={feedbacks} />
      </section>
    </div>
  );
}
