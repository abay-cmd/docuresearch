// api/health.js
// Status kesehatan sistem DocuResearch dan kesiapan AI Gemini Pro

const { SERVER_GEMINI_KEY } = require('../lib/gemini');
const { DB_FILE_PATH } = require('../lib/sheets');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  return res.status(200).json({
    ok: true,
    service: 'DocuResearch Academic AI Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aiEngine: {
      provider: 'Google Gemini Pro',
      serverKeyConfigured: Boolean(SERVER_GEMINI_KEY),
      byokSupported: true
    },
    database: {
      mode: process.env.SPREADSHEET_ID ? 'google_sheets_live' : 'local_json_persisted',
      localPath: DB_FILE_PATH
    }
  });
};
