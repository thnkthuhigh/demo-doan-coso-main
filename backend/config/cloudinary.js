import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import { Readable } from "stream";

dotenv.config();

// Configure Cloudinary with your actual credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "di0wu5kyl",
  api_key: process.env.CLOUDINARY_API_KEY || "957483758987246",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "iiVeKkwHqHmbScrWTqmYRWxT5M4",
});

// Use memory storage instead of CloudinaryStorage
const storage = multer.memoryStorage();

// Configure Multer with the memory storage
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedFormats.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to upload buffer to Cloudinary
export const uploadToCloudinary = (buffer, folder = 'avatars') => {
  return new Promise((resolve, reject) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: `user-avatar-${uniqueSuffix}`,
        transformation: [
          { width: 500, height: 500, crop: "limit" },
          { quality: "auto:good" },
        ],
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    const readableStream = Readable.from(buffer);
    readableStream.pipe(stream);
  });
};

export { cloudinary, upload };
