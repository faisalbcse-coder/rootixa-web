import { AdminLayoutClient } from "./components/admin-layout-client";
import { getAdminContext } from "@/lib/auth";

export const metadata = {
  title: "Rootixa Executive Console",
  description: "Monitor and manage your Rootixa platform.",
};

export default async function CeoRootLayout({ children }) {
  let context = null;
  try {
    context = await getAdminContext();
  } catch (error) {
    console.warn("Failed to retrieve admin context in CeoRootLayout:", error);
  }

  // If unauthenticated, render children directly without dashboard chrome
  if (!context) {
    return <>{children}</>;
  }

  const adminProfile = {
    fullName:
      context.admin?.full_name ||
      (context.user?.email ? context.user.email.split("@")[0] : "Rootixa Admin"),
    email: context.admin?.email || context.user?.email || "admin@rootixa.com",
    role: context.admin?.role === "super_admin" ? "Super Admin" : "Admin",
    status: context.admin?.status || "active",
    createdAt: context.admin?.created_at || null,
    isAuthenticated: true,
  };

  return (
    <AdminLayoutClient adminProfile={adminProfile}>
      {children}
    </AdminLayoutClient>
  );
}
