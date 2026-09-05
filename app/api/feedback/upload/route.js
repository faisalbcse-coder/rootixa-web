import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/service";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = [
  "png", "jpg", "jpeg", "webp", "gif", "svg",
  "pdf", "txt", "doc", "docx", "zip"
];

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit. Please upload a smaller file." },
        { status: 400 }
      );
    }

    const originalName = file.name || "attachment";
    const ext = path.extname(originalName).slice(1).toLowerCase() || "bin";

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `File type .${ext} is not supported. Please upload an image (PNG, JPG, WebP) or document (PDF).` },
        { status: 400 }
      );
    }

    const safeUniqueName = `fb_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    let publicUrl = null;

    // 1. Try Supabase Storage (primary for cloud & serverless)
    try {
      const service = createServiceClient();
      const { error: uploadError } = await service.storage
        .from("feedback_attachments")
        .upload(safeUniqueName, buffer, {
          contentType: file.type || `application/${ext}`,
          upsert: true,
        });

      if (!uploadError) {
        const { data: urlData } = service.storage
          .from("feedback_attachments")
          .getPublicUrl(safeUniqueName);
        if (urlData?.publicUrl) {
          publicUrl = urlData.publicUrl;
        }
      } else {
        console.warn("Supabase storage upload error:", uploadError);
      }
    } catch (storageErr) {
      console.warn("Supabase client error in upload handler:", storageErr);
    }

    // 2. Fallback to local filesystem (for offline local development)
    if (!publicUrl) {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "feedback");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, safeUniqueName);
        fs.writeFileSync(filePath, buffer);
        publicUrl = `/uploads/feedback/${safeUniqueName}`;
      } catch (fsErr) {
        console.warn("Local filesystem write fallback failed:", fsErr);
      }
    }

    if (!publicUrl) {
      throw new Error("Unable to save file to cloud or local storage.");
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      name: originalName,
      size: file.size,
      type: file.type || `application/${ext}`,
    });
  } catch (err) {
    console.error("Feedback file upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}
