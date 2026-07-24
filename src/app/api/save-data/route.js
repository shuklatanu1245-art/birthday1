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

    const jsonString = JSON.stringify(body);
    const buffer = Buffer.from(jsonString);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          resource_type: "raw", 
          folder: "birthday_surprises/data",
          public_id: `${body.slug}.json`,
          overwrite: true
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: result.secure_url, message: "Data saved successfully" });
  } catch (error) {
    console.error("Save data error details:", error);
    return NextResponse.json({ error: error.message || "Failed to save data" }, { status: 500 });
  }
}
