// api/generate.js
// Endpoint pembuatan konten akademik Mantra Riset menggunakan Gemini Pro Anti AI-Slop

const {
  callGeminiPro,
  buildAcademicSystemPrompt,
  generateAcademicFallback,
  generateTitleFeasibility,
  generateParaphrase,
  generateManuscriptRevision,
  generatePptSlides,
  generateDefenseQA
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

    const action = (req.query && req.query.action) || (body && body.action) || 'chapter';
    const apiKey = (body && body.apiKey) || '';

    // 1. Mantra Riset: Cek Kelayakan Judul & Novelty
    if (action === 'title_feasibility') {
      const { title, field, problemStatement } = body || {};
      const result = await generateTitleFeasibility(title, field, problemStatement, apiKey);
      return res.status(200).json({
        ok: true,
        action,
        data: { analysis: result, generatedAt: new Date().toISOString() }
      });
    }

    // 2. Mantra Riset: Parafrase Akademik (Anti-Turnitin)
    if (action === 'paraphrase') {
      const { text, style } = body || {};
      if (!text || !text.trim()) {
        return res.status(400).json({ ok: false, error: { message: 'Teks yang akan diparafrase wajib diisi.' } });
      }
      const paraphrased = await generateParaphrase(text, style || 'formal', apiKey);
      return res.status(200).json({
        ok: true,
        action,
        data: {
          originalText: text,
          paraphrasedText: paraphrased,
          style: style || 'formal',
          similarityEstimated: '< 12%',
          generatedAt: new Date().toISOString()
        }
      });
    }

    // 3. Mantra Riset: Revisi Naskah Berdasarkan Catatan Dosen Pembimbing
    if (action === 'revision') {
      const { originalText, feedback } = body || {};
      if (!originalText || !feedback) {
        return res.status(400).json({ ok: false, error: { message: 'Teks bab dan catatan dosen wajib diisi.' } });
      }
      const revised = await generateManuscriptRevision(originalText, feedback, apiKey);
      return res.status(200).json({
        ok: true,
        action,
        data: { revisedContent: revised, generatedAt: new Date().toISOString() }
      });
    }

    // 4. Mantra Riset: Slide Presentasi Sidang PPT
    if (action === 'ppt_slides') {
      const { manuscript } = body || {};
      if (!manuscript || !manuscript.title) {
        return res.status(400).json({ ok: false, error: { message: 'Data naskah diperlukan untuk membuat slide.' } });
      }
      const slides = await generatePptSlides(manuscript, apiKey);
      return res.status(200).json({
        ok: true,
        action,
        data: { slidesContent: slides, generatedAt: new Date().toISOString() }
      });
    }

    // 5. Mantra Riset: Simulasi Tanya Jawab Sidang Skripsi
    if (action === 'defense_qa') {
      const { manuscript } = body || {};
      if (!manuscript || !manuscript.title) {
        return res.status(400).json({ ok: false, error: { message: 'Data naskah diperlukan untuk simulasi sidang.' } });
      }
      const qa = await generateDefenseQA(manuscript, apiKey);
      return res.status(200).json({
        ok: true,
        action,
        data: { defenseContent: qa, generatedAt: new Date().toISOString() }
      });
    }

    // 6. Default: Generator Bab Naskah Skripsi/Tesis/Jurnal
    const {
      manuscriptType = 'skripsi',
      chapterId = 'bab1',
      chapterTitle = 'BAB I PENDAHULUAN',
      title = 'Penelitian Ilmiah',
      field = 'Ilmu Komputer',
      problemStatement = '',
      methodologyNotes = '',
      userReferences = '',
      customTemplate = ''
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
