import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req) {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "fu2otsgk";
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY || "455363914784268";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || "unmifq-nIRpq1Kh9ugdFNvV_jos";

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const body = await req.json();
    if (!body.slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const publicId = `birthday_surprises/data/${body.slug}.json`;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: "raw" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Delete data error details:", error);
    return NextResponse.json({ error: error.message || "Failed to delete data" }, { status: 500 });
  }
}
