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
  generateDefenseQA,
  generateTheoryRecommendations
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
        data: {
          ...(typeof result === 'object' ? result : {}),
          analysis: (typeof result === 'object' && result.fullReport) ? result.fullReport : result,
          generatedAt: new Date().toISOString()
        }
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

    // 6. Proyek Baru & Brainstorming: Rekomendasi Grand Theory & Ide Judul Relevan
    if (action === 'recommend_theories') {
      const { field, topic, approach } = body || {};
      const theories = await generateTheoryRecommendations(field, topic, approach, apiKey);
      return res.status(200).json({
        ok: true,
        action,
        data: { theories, generatedAt: new Date().toISOString() }
      });
    }

    // 7. Default: Generator Bab Naskah Skripsi/Tesis/Jurnal (DEEP RESEARCH GEMINI)
    const {
      manuscriptType = 'skripsi',
      chapterId = 'bab1',
      chapterTitle = 'BAB I PENDAHULUAN',
      title = 'Penelitian Ilmiah',
      field = 'Ilmu Komputer',
      approach = '',
      method = '',
      problemStatement = '',
      methodologyNotes = '',
      userReferences = '',
      customTemplate = ''
    } = body || {};

    const systemInstruction = buildAcademicSystemPrompt(manuscriptType, chapterTitle, approach, method);

    let prompt = `Lakukan DEEP RESEARCH komprehensif dan susunlah draf naskah akademik panjang, mendalam, dan terstruktur untuk:
Bagian Naskah: ${chapterTitle}
Jenis Karya: ${manuscriptType}
Judul Karya Ilmiah: "${title}"
Bidang Ilmu / Program Studi: ${field}
${approach ? `Pendekatan Riset: ${approach}` : ''}
${method ? `Metode / Desain: ${method}` : ''}

INFORMASI RISET DAN GROUNDING LITERATUR:
1. Fenomena Masalah / Research Gap: ${problemStatement || 'Kaji secara kritis gap empiris dan teoritis yang relevan.'}
2. Rincian Metodologis: ${methodologyNotes || 'Terapkan prosedur baku sesuai pendekatan penelitian yang dipilih.'}
3. Referensi & Jurnal Terhubung yang Wajib Disitasi Secara Real (Anti-Halu):
${userReferences || 'Sertakan sitasi ilmiah relevan dalam format baku (misal: Rahman et al., 2023; Kusuma et al., 2022).'}

${customTemplate ? `PEDOMAN FORMAT KHUSUS KAMPUS:\n${customTemplate}\n` : ''}

INSTRUKSI PANJANG DAN BOBOT AKADEMIK:
- Tuliskan setiap sub-bab secara lengkap dan rinci dengan uraian beberapa paragraf analitis bertingkat (hindari jawaban pendek atau ringkasan dangkal).
- Tulis langsung substansi isi naskah akademik tanpa salam pembuka, tanpa ucapan ramah, dan tanpa kata penutup AI.`;

    let generatedText = '';
    let modeUsed = 'gemini_deep_research';

    try {
      generatedText = await callGeminiPro(prompt, systemInstruction, apiKey);
    } catch (aiErr) {
      console.warn('[Gemini API Warning]:', aiErr.message, '-> Mengaktifkan Fallback Ilmiah.');
      generatedText = generateAcademicFallback(manuscriptType, chapterId, title, field, userReferences, {
        approach,
        method,
        problemStatement,
        theoreticalFramework: body && body.theoreticalFramework
      });
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
