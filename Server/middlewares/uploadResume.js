import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});


const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "resumes",            // 🔥 separate folder
    resource_type: "raw",         // 🔥 IMPORTANT for PDF/DOCX
    access_mode: "public"         // 🔥 allow axios fetch
  }
});

const uploadResume = multer({ storage });

export default uploadResume;
