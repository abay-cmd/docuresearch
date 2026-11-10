// api/generate.js
// Endpoint pembuatan draf bab akademik menggunakan Gemini Pro Anti AI-Slop

const {
  callGeminiPro,
  buildAcademicSystemPrompt,
  generateAcademicFallback
} = require('../lib/gemini');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Hanya metode POST yang diizinkan.' }
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({
          ok: false,
          error: { code: 'INVALID_JSON', message: 'Format JSON tidak valid.' }
        });
      }
    }

    const {
      manuscriptType = 'skripsi',
      chapterId = 'bab1',
      chapterTitle = 'BAB I PENDAHULUAN',
      title = 'Penelitian Ilmiah',
      field = 'Ilmu Komputer',
      problemStatement = '',
      methodologyNotes = '',
      userReferences = '',
      customTemplate = '',
      apiKey = ''
    } = body || {};

    const systemInstruction = buildAcademicSystemPrompt(manuscriptType, chapterTitle);

    let prompt = `Susunlah naskah akademik tingkat tinggi dan komprehensif untuk bagian:
Judul Bagian: ${chapterTitle}
Jenis Karya: ${manuscriptType}
Judul Penelitian: "${title}"
Bidang Ilmu: ${field}

INFORMASI RISET PENDUKUNG DARI PENGGUNA:
1. Rumusan Masalah / Research Gap: ${problemStatement || 'Kaji secara kritis kesenjangan teoretis dan empiris yang relevan.'}
2. Catatan Metodologi: ${methodologyNotes || 'Sesuaikan dengan standar penelitian kuantitatif / kualitatif / eksperimental yang baku.'}
3. Dokumen Referensi Pengguna yang Harus Dirujuk:
${userReferences || 'Rujuklah literatur akademik mutakhir (5 tahun terakhir) dengan sitasi format ilmiah konsisten.'}

${customTemplate ? `PANDUAN TEMPLATE KHUSUS KAMPUS / JURNAL PENGGUNA:\n${customTemplate}\n` : ''}

INGAT: Tulis langsung teks naskah akademik berbobot ilmiah tanpa kata sapaan atau penutup AI.`;

    let generatedText = '';
    let modeUsed = 'gemini_pro';

    try {
      generatedText = await callGeminiPro(prompt, systemInstruction, apiKey);
    } catch (aiErr) {
      console.warn('[Gemini API Warning]:', aiErr.message, '-> Mengaktifkan Fallback Ilmiah.');
      generatedText = generateAcademicFallback(manuscriptType, chapterId, title, field, userReferences);
      modeUsed = 'academic_fallback_template';
    }

    return res.status(200).json({
      ok: true,
      data: {
        manuscriptType,
        chapterId,
        chapterTitle,
        content: generatedText,
        modeUsed,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Generate API Error]:', error);
    return res.status(500).json({
      ok: false,
      error: { code: 'GENERATION_FAILED', message: error.message }
    });
  }
};
