import { NextResponse } from "next/server";
import { getAllFeedbacksForAdmin, replyToFeedback } from "@/lib/feedback/store";
import { getAdminContext } from "@/lib/auth";

export async function GET(request) {
  try {
    const adminContext = await getAdminContext();
    if (!adminContext && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const category = searchParams.get("category") || "all";

    const feedbacks = await getAllFeedbacksForAdmin({ status, category });

    return NextResponse.json({
      success: true,
      feedbacks,
    });
  } catch (err) {
    console.error("Admin feedback fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const adminContext = await getAdminContext();
    if (!adminContext && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { feedbackId, adminReply, newStatus = "replied" } = body;

    if (!feedbackId || !adminReply || typeof adminReply !== "string" || !adminReply.trim()) {
      return NextResponse.json(
        { error: "feedbackId and adminReply are required" },
        { status: 400 }
      );
    }

    const adminName =
      adminContext?.admin?.full_name ||
      (adminContext?.user?.email ? adminContext.user.email.split("@")[0] : "Rootixa Admin");

    const result = await replyToFeedback({
      feedbackId,
      adminReply: adminReply.trim(),
      adminName,
      newStatus,
    });

    return NextResponse.json({
      success: true,
      message: "Reply saved and status updated successfully!",
      feedback: result.feedback,
    });
  } catch (err) {
    console.error("Admin feedback reply error:", err);
    return NextResponse.json({ error: "Failed to save reply" }, { status: 500 });
  }
}
