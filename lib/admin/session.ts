import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type AdminRole = "super_admin" | "admin";
export type AdminStatus = "active" | "inactive";

export type AdminProfile = {
  id: string;
  auth_user_id: string;
  full_name: string | null;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export async function getAuthUser() {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function getAdminContext() {
  noStore();
  const user = await getAuthUser();

  if (!user) return null;

  // Use the server-only service role for admin authorization lookup to avoid RLS/JWT timing pitfalls.
  const service = createServiceClient();
  const { data: admin, error: adminError } = await service
    .from("admins")
    .select("id, auth_user_id, full_name, email, role, status, created_at, updated_at, created_by")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (adminError || !admin) return null;
  if (admin.status !== "active") return null;

  return { user, admin: admin as AdminProfile };
}

export function isSuperAdmin(context: Awaited<ReturnType<typeof getAdminContext>>): boolean {
  return Boolean(context?.admin?.role === "super_admin");
}

