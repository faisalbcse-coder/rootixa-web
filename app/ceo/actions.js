"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginCeo(_previousState, formData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";
  const errors = {};

  if (!emailPattern.test(email)) errors.email = "Please enter a valid email address.";
  if (!password) errors.password = "Password is required.";

  if (Object.keys(errors).length) return { errors };

  try {
    const supabase = await createClient({ remember });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return { message: "Invalid credentials or unauthorized access." };
    }

    // Verify admin privileges directly in public.admins table
    const service = createServiceClient();
    const { data: admin, error: adminError } = await service
      .from("admins")
      .select("role, status")
      .eq("auth_user_id", data.user.id)
      .maybeSingle();

    const isAllowed = !adminError && admin && admin.status === "active" && (admin.role === "admin" || admin.role === "super_admin");
    if (!isAllowed) {
      await supabase.auth.signOut();
      return { message: "Access denied. This account lacks executive privileges." };
    }

    const cookieStore = await cookies();
    cookieStore.set("admin_remember", remember ? "1" : "0", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    });
  } catch (error) {
    console.error("Executive login error:", error);
    return { message: "Security gateway temporarily unavailable. Please try again." };
  }

  redirect("/ceo");
}

export async function logoutCeo() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Supabase sign out error:", err);
  }

  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      if (
        cookie.name.startsWith("sb-") ||
        cookie.name.startsWith("admin_") ||
        cookie.name.includes("auth-token")
      ) {
        cookieStore.delete(cookie.name);
      }
    }
  } catch (err) {
    console.warn("Cookie cleanup error:", err);
  }

  redirect("/ceo");
}

