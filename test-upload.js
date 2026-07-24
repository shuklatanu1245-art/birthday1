const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
  try {
    const buffer = Buffer.from("dummy data for image"); // Not a real image, but should trigger upload error or success
    console.log("Keys:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `birthday_surprises/test` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });
    console.log("Success:", result);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
