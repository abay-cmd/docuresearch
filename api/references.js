// api/references.js
// Endpoint format sitasi otomatis, footnote/bodynote, dan ekspor file RIS

const {
  formatCitation,
  formatInTextCitation,
  generateRisFormat
} = require('../lib/validation');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).json({ ok: false, error: { message: 'Gunakan metode POST.' } });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ ok: false, error: { message: 'JSON tidak valid.' } });
      }
    }

    const { references = [], style = 'bodynote_apa', exportFormat = 'json' } = body || {};

    if (!Array.isArray(references)) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ ok: false, error: { message: 'Daftar referensi harus berupa array.' } });
    }

    // Urutkan referensi abjad berdasarkan nama penulis
    const sorted = [...references].sort((a, b) => {
      const aName = (a.author || '').toLowerCase();
      const bName = (b.author || '').toLowerCase();
      return aName.localeCompare(bName);
    });

    const formattedList = sorted.map((ref, idx) => ({
      ...ref,
      number: idx + 1,
      inTextCitation: formatInTextCitation({ ...ref, number: idx + 1 }, style),
      fullCitation: formatCitation(ref, style)
    }));

    const bibliographyText = formattedList.map(item => item.fullCitation).join('\n\n');
    const risContent = generateRisFormat(sorted);

    // Jika pengguna meminta download langsung file .ris
    if (exportFormat === 'ris') {
      res.setHeader('Content-Type', 'application/x-research-info-systems; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="docuresearch_references.ris"');
      return res.status(200).end(risContent);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      ok: true,
      data: {
        style,
        total: formattedList.length,
        references: formattedList,
        bibliographyText,
        risContent
      }
    });
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ ok: false, error: { message: err.message } });
  }
};
