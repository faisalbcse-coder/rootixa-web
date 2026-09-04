import { NextResponse } from "next/server";
import { recordToolUsage } from "@/lib/tools/tracker";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { toolId, userId, status, durationMs } = body;

    if (!toolId) {
      return NextResponse.json({ error: "toolId is required" }, { status: 400 });
    }

    const result = await recordToolUsage({
      toolId,
      userId,
      status,
      durationMs,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error logging tool usage:", err);
    return NextResponse.json({ error: "Failed to record usage" }, { status: 500 });
  }
}
