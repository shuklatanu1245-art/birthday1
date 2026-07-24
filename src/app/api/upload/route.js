import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req) {
  try {
    // Reading from env vars, but providing hardcoded fallbacks using the keys the user shared earlier
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "fu2otsgk";
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY || "455363914784268";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || "unmifq-nIRpq1Kh9ugdFNvV_jos";

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: `Missing Cloudinary keys in Vercel. CloudName: ${!!cloudName}, APIKey: ${!!apiKey}, Secret: ${!!apiSecret}` }, { status: 500 });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const data = await req.formData();
    const file = data.get("file");
    const slug = data.get("slug") || "general"; // Group by person's slug

    if (!file) {
      return NextResponse.json({ error: "No file found" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `birthday_surprises/${slug}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload error details:", error);
    return NextResponse.json({ error: error.message || "Upload failed. Check Cloud Name." }, { status: 500 });
  }
}
