import { NextResponse } from "next/server";
import { getLiveVisitors } from "@/lib/analytics/tracker";
import { getAdminContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminContext = await getAdminContext();
    if (!adminContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const liveData = await getLiveVisitors();
    return NextResponse.json(liveData);
  } catch (err) {
    console.error("Live analytics API error:", err);
    return NextResponse.json({ count: 0, list: [] }, { status: 500 });
  }
}
