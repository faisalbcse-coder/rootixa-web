import { NextResponse } from "next/server";

/**
 * Server-side AI Background Removal API endpoint.
 * Keeps external AI provider credentials strictly server-side.
 */
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No image file provided" },
        { status: 400 }
      );
    }

    // Check for optional server-side AI provider keys (e.g. Clipdrop, Remove.bg, Replicate)
    const clipdropKey = process.env.CLIPDROP_API_KEY;
    const removeBgKey = process.env.REMOVE_BG_API_KEY;

    if (clipdropKey) {
      // Example Clipdrop API integration
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const form = new FormData();
      form.append("image_file", new Blob([buffer], { type: file.type }), file.name || "input.png");

      const response = await fetch("https://clipdrop-api.co/remove-background/v1", {
        method: "POST",
        headers: {
          "x-api-key": clipdropKey,
        },
        body: form,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { success: false, message: "Clipdrop API error: " + errorText },
          { status: response.status }
        );
      }

      const resultBuffer = await response.arrayBuffer();
      return new NextResponse(resultBuffer, {
        headers: {
          "Content-Type": "image/png",
        },
      });
    }

    if (removeBgKey) {
      // Example Remove.bg API integration
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const form = new FormData();
      form.append("image_file", new Blob([buffer], { type: file.type }), file.name || "input.png");
      form.append("size", "auto");

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": removeBgKey,
        },
        body: form,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { success: false, message: "Remove.bg API error: " + errorText },
          { status: response.status }
        );
      }

      const resultBuffer = await response.arrayBuffer();
      return new NextResponse(resultBuffer, {
        headers: {
          "Content-Type": "image/png",
        },
      });
    }

    // If no cloud AI key is configured in environment variables
    return NextResponse.json(
      {
        success: false,
        message:
          "No external cloud AI API key (CLIPDROP_API_KEY or REMOVE_BG_API_KEY) is configured on the server. Rootixa utilizes the in-browser Neural Vision engine for free, private, client-side processing.",
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
