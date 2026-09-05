import { NextResponse } from "next/server";
import { saveFeedback, getRecentFeedbacks } from "@/lib/feedback/store";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      category = "suggestion",
      rating = 5,
      toolName = "General",
      title = "",
      message,
      userName = "Community Member",
      userEmail,
      wantsReply = true,
      deviceInfo = "",
      attachment = null,
    } = body;

    // Validation: Message must be at least 3 characters
    if (!message || typeof message !== "string" || message.trim().length < 3) {
      return NextResponse.json(
        { error: "Please write a brief message or suggestion." },
        { status: 400 }
      );
    }

    // Validation: Email is required so admin can reply and send updates!
    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address so we can reply with updates." },
        { status: 400 }
      );
    }

    const result = await saveFeedback({
      category,
      rating: Number(rating) || 5,
      tool_name: toolName,
      title,
      message: message.trim(),
      user_name: userName.trim() || "Community Member",
      user_email: userEmail.trim().toLowerCase(),
      wants_reply: Boolean(wantsReply),
      device_info: deviceInfo,
      attachment: attachment && typeof attachment === "object" ? attachment : null,
    });

    return NextResponse.json({
      success: true,
      referenceId: result.referenceId,
      message: "Thank you! Your feedback has been sent to the Rootixa admin team.",
      feedback: result.feedback,
    });
  } catch (err) {
    console.error("Feedback submission error:", err);
    return NextResponse.json(
      { error: "Failed to submit feedback. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = Number(searchParams.get("limit")) || 6;

    const feedbacks = await getRecentFeedbacks({
      limit: Math.min(limit, 20),
      category: category || null,
    });

    return NextResponse.json({
      success: true,
      feedbacks,
    });
  } catch (err) {
    console.error("Feedback fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch feedback." },
      { status: 500 }
    );
  }
}
