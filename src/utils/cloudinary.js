import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder: "quotes-app",
      allowed_formats: ["jpg", "png", "jpeg","webp"],
      transformation: [{ width: 400, height: 400, crop: "limit" }],
    };
  },
});

const upload = multer({ storage: storage, limits: { fileSize: 1 * 1024 * 1024 }, });

export { cloudinary, upload };
