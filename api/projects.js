// api/projects.js
// Endpoint penyimpanan dan pemanggilan naskah akademik dengan verifikasi PIN

const {
  saveManuscriptToStorage,
  getManuscriptFromStorage,
  listManuscripts
} = require('../lib/sheets');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Ambil detail naskah dengan PIN atau list naskah tersimpan
  if (req.method === 'GET') {
    try {
      const { id, pin } = req.query;
      if (id) {
        if (!pin) {
          return res.status(401).json({
            ok: false,
            error: { code: 'PIN_REQUIRED', message: 'PIN akses wajib diisi untuk membuka naskah ini.' }
          });
        }
        const result = await getManuscriptFromStorage(id, pin);
        if (!result.success) {
          return res.status(403).json({
            ok: false,
            error: { code: 'ACCESS_DENIED', message: result.error }
          });
        }
        return res.status(200).json({ ok: true, data: result.manuscript });
      }

      const list = await listManuscripts();
      return res.status(200).json({ ok: true, data: { manuscripts: list } });
    } catch (err) {
      return res.status(500).json({ ok: false, error: { message: err.message } });
    }
  }

  // POST: Simpan atau perbarui naskah
  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {
          return res.status(400).json({ ok: false, error: { message: 'JSON tidak valid' } });
        }
      }

      if (!body || !body.title) {
        return res.status(400).json({
          ok: false,
          error: { message: 'Judul naskah wajib diisi.' }
        });
      }

      const saveResult = await saveManuscriptToStorage(body);
      return res.status(200).json({
        ok: true,
        message: 'Naskah berhasil disimpan.',
        data: saveResult
      });
    } catch (err) {
      return res.status(500).json({ ok: false, error: { message: err.message } });
    }
  }

  return res.status(405).json({ ok: false, error: { message: 'Metode tidak didukung.' } });
};
