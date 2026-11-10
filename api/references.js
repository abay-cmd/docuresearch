// api/references.js
// Endpoint format sitasi otomatis dan pembuatan Daftar Pustaka (APA, IEEE, Harvard)

const { formatCitation, formatInTextCitation } = require('../lib/validation');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: { message: 'Gunakan metode POST.' } });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {
        return res.status(400).json({ ok: false, error: { message: 'JSON tidak valid.' } });
      }
    }

    const { references = [], style = 'apa' } = body || {};

    if (!Array.isArray(references)) {
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

    return res.status(200).json({
      ok: true,
      data: {
        style,
        total: formattedList.length,
        references: formattedList,
        bibliographyText
      }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: { message: err.message } });
  }
};
