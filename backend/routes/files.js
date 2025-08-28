import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import File from '../models/File.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Setup multer for file uploads
const upload = multer({
  dest: './uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// Upload a new file
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const newFile = await File.create({
      userId: req.user._id,
      filename: req.file.originalname,
      path: req.file.path,
      rowCount: 0 // You can calculate rows after parsing Excel
    });

    res.status(201).json({ success: true, file: newFile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// List all files of the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user._id });
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
