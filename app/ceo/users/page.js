import { redirect } from "next/navigation";
import { Users, UserCheck, UserX, UserPlus } from "lucide-react";
import { getAdminContext } from "@/lib/auth";
import { getUserStats, getUsersList } from "@/lib/admin/users-data";
import { AdminStatCard } from "@/app/ceo/components/admin-stat-card";
import { UsersClientView } from "./components/users-client-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Users Management | Rootixa Console",
  description: "Manage and monitor Rootixa users.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CeoUsersPage({ searchParams }) {
  const adminContext = await getAdminContext();
  if (!adminContext) {
    redirect("/ceo");
  }

  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page || 1);
  const search = String(resolvedParams?.q || "").trim();
  const status = String(resolvedParams?.status || "all");
  const sort = String(resolvedParams?.sort || "newest");

  const [stats, usersResult] = await Promise.all([
    getUserStats(),
    getUsersList({ page, perPage: 20, search, status, sort }),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Users
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor Rootixa users.
          </p>
        </div>

        {/* Reserved space for future user-management actions */}
        <div className="flex items-center gap-2" aria-hidden="true" />
      </div>

      {/* User Statistics Cards */}
      <section aria-label="User Statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            title="Total Users"
            value={stats.total.value}
            change={stats.total.label}
            changeType="neutral"
            icon={Users}
            state={stats.total.state}
            isMock={false}
          />

          <AdminStatCard
            title="Active Users"
            value={stats.active.value}
            change={stats.active.label}
            changeType="positive"
            icon={UserCheck}
            state={stats.active.state}
            isMock={false}
          />

          <AdminStatCard
            title="Inactive Users"
            value={stats.inactive.value}
            change={stats.inactive.label}
            changeType={stats.inactive.value !== "0" ? "negative" : "neutral"}
            icon={UserX}
            state={stats.inactive.state}
            isMock={false}
          />

          <AdminStatCard
            title="New Users"
            value={stats.newUsers.value}
            change={stats.newUsers.label}
            changeType="positive"
            icon={UserPlus}
            state={stats.newUsers.state}
            isMock={false}
          />
        </div>
      </section>

      {/* Users Management: Search, Filters, Table & Pagination */}
      <section aria-label="Users Directory">
        <UsersClientView
          users={usersResult.items}
          total={usersResult.total}
          totalPages={usersResult.totalPages}
          currentPage={usersResult.page}
          perPage={usersResult.perPage}
          initialSearch={search}
          initialStatus={status}
          initialSort={sort}
        />
      </section>
    </div>
  );
}
