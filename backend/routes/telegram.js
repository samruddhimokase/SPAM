const express = require('express');
const router = express.Router();
const { detectScamMessage } = require('../utils/aiModels');

// POST /api/telegram/detect-scam
router.post('/detect-scam', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const analysis = detectScamMessage(text);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;