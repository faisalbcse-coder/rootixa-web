"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { getUserDetails } from "@/lib/admin/users-data";

/**
 * Toggle user account status (active <-> inactive).
 * Strictly enforces admin authorization.
 */
export async function toggleUserStatusAction({ userId, newStatus }) {
  const adminContext = await getAdminContext();
  if (!adminContext) {
    return { success: false, error: "Unauthorized. Executive privileges required." };
  }

  if (!userId || (newStatus !== "active" && newStatus !== "inactive")) {
    return { success: false, error: "Invalid parameters provided." };
  }

  // Prevent admin from deactivating their own account
  if (userId === adminContext.user.id && newStatus === "inactive") {
    return { success: false, error: "Self-deactivation is prohibited." };
  }

  try {
    const service = createServiceClient();
    const { data: existingUser, error: fetchErr } = await service.auth.admin.getUserById(userId);
    if (fetchErr || !existingUser?.user) {
      return { success: false, error: "User not found in system." };
    }

    const currentAppMeta = existingUser.user.app_metadata || {};

    if (newStatus === "inactive") {
      const { error: updateErr } = await service.auth.admin.updateUserById(userId, {
        app_metadata: {
          ...currentAppMeta,
          status: "inactive",
          deactivated_at: new Date().toISOString(),
          deactivated_by: adminContext.user.id,
        },
        ban_duration: "876000h", // ~100 years ban in Supabase Auth
      });

      if (updateErr) {
        console.error("Error deactivating user:", updateErr.message);
        return { success: false, error: `Failed to deactivate user: ${updateErr.message}` };
      }
    } else {
      const { error: updateErr } = await service.auth.admin.updateUserById(userId, {
        app_metadata: {
          ...currentAppMeta,
          status: "active",
          activated_at: new Date().toISOString(),
          activated_by: adminContext.user.id,
        },
        ban_duration: "none", // Remove ban in Supabase Auth
      });

      if (updateErr) {
        console.error("Error activating user:", updateErr.message);
        return { success: false, error: `Failed to activate user: ${updateErr.message}` };
      }
    }

    revalidatePath("/ceo/users");
    revalidatePath("/ceo");

    return {
      success: true,
      message:
        newStatus === "active"
          ? "User activated successfully."
          : "User deactivated successfully.",
    };
  } catch (err) {
    console.error("Exception in toggleUserStatusAction:", err);
    return { success: false, error: "An unexpected error occurred while updating user status." };
  }
}

/**
 * Fetch detailed user metadata on demand for the user details modal.
 */
export async function fetchUserDetailsAction(userId) {
  const adminContext = await getAdminContext();
  if (!adminContext) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    const user = await getUserDetails(userId);
    if (!user) {
      return { success: false, error: "User details could not be found." };
    }
    return { success: true, user };
  } catch (err) {
    console.error("Exception in fetchUserDetailsAction:", err);
    return { success: false, error: "Failed to retrieve user details." };
  }
}
