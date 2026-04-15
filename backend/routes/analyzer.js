const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { analyzeScreenshot } = require('../utils/ocrEngine');
const { analyzeLinkSafety } = require('../utils/aiModels');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// POST /api/analyzer/analyze
router.post('/analyze', upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await analyzeScreenshot(req.file.path);
    
    if (!result.success) {
      return res.status(500).json({ message: result.error });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/analyzer/analyze-url
router.post('/analyze-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    const result = analyzeLinkSafety(url);
    res.json({ success: true, analysis: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;