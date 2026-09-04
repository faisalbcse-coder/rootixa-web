"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/auth";
import { updateToolStatus, getToolDetails } from "@/lib/admin/tools-data";

/**
 * Toggle tool operational status (live, maintenance, development).
 * Strictly gated by executive authentication.
 */
export async function toggleToolStatusAction({ toolId, status, notice = "" }) {
  const adminContext = await getAdminContext();
  if (!adminContext) {
    return { success: false, error: "Unauthorized. Executive privileges required." };
  }

  if (!toolId || !["live", "maintenance", "development"].includes(status)) {
    return { success: false, error: "Invalid tool status parameter provided." };
  }

  try {
    const result = await updateToolStatus(toolId, status, notice);
    if (!result.success) {
      return { success: false, error: "Failed to persist tool status change." };
    }

    revalidatePath("/ceo/tools");
    revalidatePath("/ceo");
    revalidatePath("/ceo/analytics");

    const readableStatus =
      status === "live"
        ? "Live (Operational)"
        : status === "maintenance"
        ? "Maintenance Mode"
        : "In Development";

    return {
      success: true,
      message: `Tool status updated to ${readableStatus}.`,
    };
  } catch (err) {
    console.error("Exception in toggleToolStatusAction:", err);
    return {
      success: false,
      error: "An unexpected error occurred while updating tool status.",
    };
  }
}

/**
 * Fetch detailed telemetry for a single tool for modal inspection.
 */
export async function fetchToolDetailsAction(toolId) {
  const adminContext = await getAdminContext();
  if (!adminContext) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    const tool = await getToolDetails(toolId);
    if (!tool) {
      return { success: false, error: "Tool could not be found." };
    }
    return { success: true, tool };
  } catch (err) {
    console.error("Exception in fetchToolDetailsAction:", err);
    return { success: false, error: "Failed to retrieve tool telemetry." };
  }
}
