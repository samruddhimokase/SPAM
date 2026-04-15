const Tesseract = require('tesseract.js');
const { detectScamMessage } = require('./aiModels');

/**
 * Perform OCR on an image and analyze the extracted text
 */
const analyzeScreenshot = async (imagePath) => {
  try {
    // 1. Extract text from image
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng',
      { logger: m => console.log(m) }
    );

    // 2. Clean text
    const cleanText = text.replace(/\n/g, ' ').trim();

    // 3. Analyze for scam patterns
    const analysis = detectScamMessage(cleanText);

    return {
      success: true,
      extractedText: cleanText,
      analysis: {
        ...analysis,
        risk: analysis.riskScore > 70 ? "High" : (analysis.riskScore > 40 ? "Medium" : "Low"),
        score: analysis.riskScore,
        intent: analysis.flags.join(' / ') || "None Detected"
      }
    };
  } catch (error) {
    console.error('OCR analysis error:', error);
    return {
      success: false,
      error: 'Failed to process image'
    };
  }
};

module.exports = {
  analyzeScreenshot
};