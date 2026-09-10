import { NextResponse } from "next/server";

/**
 * Server-side AI Image Enhancer API endpoint.
 * Connects to external image super-resolution / upscale models if configured.
 */
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");
    const mode = formData.get("mode") || "auto";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No image file provided" },
        { status: 400 }
      );
    }

    const clipdropKey = process.env.CLIPDROP_API_KEY;

    if (clipdropKey) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const form = new FormData();
      form.append("image_file", new Blob([buffer], { type: file.type }), file.name || "input.png");

      // Clipdrop image upscaling endpoint
      const response = await fetch("https://clipdrop-api.co/image-upscaling/v1", {
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

    return NextResponse.json(
      {
        success: false,
        message:
          "No external cloud enhancement API key is configured on the server. Rootixa uses client-side bicubic super-resolution and unsharp mask tone mapping in your browser.",
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
