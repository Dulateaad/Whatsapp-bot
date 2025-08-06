const Tesseract = require("tesseract.js");

async function extractTextFromImage(mediaBuffer) {
  try {
    const result = await Tesseract.recognize(mediaBuffer, 'eng');
    return result.data.text;
  } catch (err) {
    console.error("OCR error:", err);
    return "";
  }
}

module.exports = { extractTextFromImage };
