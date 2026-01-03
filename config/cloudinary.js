import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Fix for SSL certificate issues (corporate networks/proxies)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log to verify credentials are loaded
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***loaded***' : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***loaded***' : 'MISSING',
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sambhav_bills',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  },
});

// Multer upload middleware
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;
