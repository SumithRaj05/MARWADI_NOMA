import express from 'express';
import { login, verifyToken, verifyTokenRoute } from './middleware/auth.js';
import { upload } from './config/cloudinary.js';
import {
  getAllFinanceRecords,
  getFinanceRecordById,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
} from './controller.js';

const router = express.Router();

// Multer error handling middleware
const handleUpload = (req, res, next) => {
  upload.single('billImage')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: 'Error uploading file',
        error: err.message,
      });
    }
    next();
  });
};

// Auth routes
router.post('/auth/login', login);
router.get('/auth/verify', verifyToken, verifyTokenRoute);

// Finance routes (protected)
router.route('/finance')
  .get(verifyToken, getAllFinanceRecords)
  .post(verifyToken, handleUpload, createFinanceRecord);

router.route('/finance/:id')
  .get(verifyToken, getFinanceRecordById)
  .put(verifyToken, handleUpload, updateFinanceRecord)
  .delete(verifyToken, deleteFinanceRecord);

export default router;
