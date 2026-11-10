// lib/validation.js
// Struktur naskah akademik, validasi data, formatting sitasi, dan aturan Anti AI-Slop

const MANUSCRIPT_TYPES = {
  skripsi: {
    label: 'Skripsi (Sarjana S1)',
    chapters: [
      { id: 'cover', title: 'Halaman Sampul (Cover)', isFrontMatter: true },
      { id: 'approval', title: 'Halaman Pengesahan / Persetujuan', isFrontMatter: true },
      { id: 'declaration', title: 'Pernyataan Keaslian Karya', isFrontMatter: true },
      { id: 'motto', title: 'Motto dan Persembahan', isFrontMatter: true },
      { id: 'preface', title: 'Kata Pengantar & Ucapan Terima Kasih', isFrontMatter: true },
      { id: 'abstract_id', title: 'Abstrak (Bahasa Indonesia)', isFrontMatter: true },
      { id: 'abstract_en', title: 'Abstract (English)', isFrontMatter: true },
      { id: 'toc', title: 'Daftar Isi', isFrontMatter: true },
      { id: 'tot', title: 'Daftar Tabel', isFrontMatter: true },
      { id: 'tof', title: 'Daftar Gambar', isFrontMatter: true },
      { id: 'bab1', title: 'BAB I PENDAHULUAN', sections: ['1.1 Latar Belakang Masalah', '1.2 Identifikasi Masalah', '1.3 Batasan Masalah', '1.4 Rumusan Masalah', '1.5 Tujuan Penelitian', '1.6 Manfaat Penelitian'] },
      { id: 'bab2', title: 'BAB II TINJAUAN PUSTAKA DAN LANDASAN TEORI', sections: ['2.1 Kajian Pustaka Terkait', '2.2 Landasan Teori', '2.3 Kerangka Konseptual / Pemikiran', '2.4 Hipotesis Penelitian'] },
      { id: 'bab3', title: 'BAB III METODOLOGI PENELITIAN', sections: ['3.1 Desain Penelitian', '3.2 Populasi dan Sampel', '3.3 Definisi Operasional Variabel', '3.4 Teknik Pengumpulan Data', '3.5 Instrumen Penelitian', '3.6 Teknik Analisis Data'] },
      { id: 'bab4', title: 'BAB IV HASIL PENELITIAN DAN PEMBAHASAN', sections: ['4.1 Deskripsi Data Hasil Penelitian', '4.2 Pengujian Hipotesis / Analisis Data', '4.3 Pembahasan (Discussion)'] },
      { id: 'bab5', title: 'BAB V KESIMPULAN DAN SARAN', sections: ['5.1 Kesimpulan', '5.2 Implikasi Praktis & Teoritis', '5.3 Keterbatasan Penelitian', '5.4 Saran untuk Penelitian Selanjutnya'] },
      { id: 'references', title: 'DAFTAR PUSTAKA', isBackMatter: true },
      { id: 'appendix', title: 'LAMPIRAN', isBackMatter: true }
    ]
  },
  tesis: {
    label: 'Tesis (Magister S2)',
    chapters: [
      { id: 'cover', title: 'Halaman Sampul (Cover)', isFrontMatter: true },
      { id: 'approval', title: 'Halaman Pengesahan Komisi Penguji', isFrontMatter: true },
      { id: 'declaration', title: 'Pernyataan Keaslian dan Bebas Plagiasi', isFrontMatter: true },
      { id: 'preface', title: 'Kata Pengantar & Ucapan Terima Kasih', isFrontMatter: true },
      { id: 'abstract_id', title: 'Abstrak (Bahasa Indonesia)', isFrontMatter: true },
      { id: 'abstract_en', title: 'Abstract (English)', isFrontMatter: true },
      { id: 'toc', title: 'Daftar Isi', isFrontMatter: true },
      { id: 'tot', title: 'Daftar Tabel', isFrontMatter: true },
      { id: 'tof', title: 'Daftar Gambar', isFrontMatter: true },
      { id: 'bab1', title: 'BAB I PENDAHULUAN', sections: ['1.1 Latar Belakang & Research Gap', '1.2 Rumusan Masalah Riset', '1.3 Pertanyaan Penelitian', '1.4 Tujuan Penelitian', '1.5 Kebaruan Penelitian (Novelty)'] },
      { id: 'bab2', title: 'BAB II KAJIAN TEORITIS DAN MODEL KONSEPTUAL', sections: ['2.1 Tinjauan Teori Utama (Grand Theory)', '2.2 Tinjauan Variabel Terkait', '2.3 Sintesis Penelitian Terdahulu', '2.4 Model Konseptual & Pengembangan Hipotesis'] },
      { id: 'bab3', title: 'BAB III METODE PENELITIAN', sections: ['3.1 Pendekatan & Paradigma Riset', '3.2 Teknik Pengambilan Sampel', '3.3 Pengembangan & Validitas Instrumen', '3.4 Prosedur Analisis Statistik / Tematik'] },
      { id: 'bab4', title: 'BAB IV ANALISIS HASIL DAN PEMBAHASAN MENDALAM', sections: ['4.1 Profil Partisipan & Statistik Deskriptif', '4.2 Temuan Empiris & Pengujian Model', '4.3 Pembahasan Kritis Lintas Literatur'] },
      { id: 'bab5', title: 'BAB V KESIMPULAN, KONTRIBUSI, DAN SARAN', sections: ['5.1 Kesimpulan Teoretis', '5.2 Kontribusi Ilmiah & Manajerial', '5.3 Keterbatasan Riset', '5.4 Agenda Riset Mendatang'] },
      { id: 'references', title: 'DAFTAR PUSTAKA', isBackMatter: true },
      { id: 'appendix', title: 'LAMPIRAN DATA & KUESIONER', isBackMatter: true }
    ]
  },
  disertasi: {
    label: 'Disertasi (Doktoral S3)',
    chapters: [
      { id: 'cover', title: 'Halaman Sampul (Cover)', isFrontMatter: true },
      { id: 'approval', title: 'Halaman Pengesahan Promotor & Ko-Promotor', isFrontMatter: true },
      { id: 'declaration', title: 'Pernyataan Integritas Akademik & Orisinalitas', isFrontMatter: true },
      { id: 'preface', title: 'Prakata & Ucapan Terima Kasih Promotor', isFrontMatter: true },
      { id: 'abstract_id', title: 'Abstrak (Bahasa Indonesia)', isFrontMatter: true },
      { id: 'abstract_en', title: 'Abstract (English)', isFrontMatter: true },
      { id: 'toc', title: 'Daftar Isi', isFrontMatter: true },
      { id: 'bab1', title: 'BAB I PENDAHULUAN & FILOSOFI PENELITIAN', sections: ['1.1 Latar Belakang Ontologis & Epistemologis', '1.2 Identifikasi Kesenjangan Teoretis (Theoretical Gap)', '1.3 Pertanyaan Riset Doktoral', '1.4 Klaim Orisinalitas & Novelty Ilmiah'] },
      { id: 'bab2', title: 'BAB II KERANGKA TEORETIS & PROPOSISI RISET', sections: ['2.1 Landasan Teori Lintas Disiplin', '2.2 Evaluasi Kritis Literatur Mutakhir', '2.3 Kerangka Pemikiran Epistemik', '2.4 Formulasi Proposisi / Hipotesis'] },
      { id: 'bab3', title: 'BAB III METODOLOGI RISET TINGKAT LANJUT', sections: ['3.1 Metodologi & Justifikasi Paradigma', '3.2 Protokol Pengujian & Rigor', '3.3 Validitas Konstruk & Reliabilitas Lanjut', '3.4 Prosedur Triangulasi Data'] },
      { id: 'bab4', title: 'BAB IV TEMUAN EMPIRIS DAN PENGEMBANGAN MODEL BARU', sections: ['4.1 Eksplorasi Data & Temuan Utama', '4.2 Verifikasi Model Teoretis Baru', '4.3 Diskusi Komparatif dengan Teori Dominan'] },
      { id: 'bab5', title: 'BAB V DISKUSI FILOSOFIS, KONTRIBUSI ILMIAH, DAN IMPLIKASI', sections: ['5.1 Konstruksi Teori Baru (Theoretical Proposition)', '5.2 Implikasi Kebijakan & Praktis', '5.3 Batasan Epistemik', '5.4 Arah Riset Lanjutan'] },
      { id: 'references', title: 'DAFTAR PUSTAKA', isBackMatter: true },
      { id: 'appendix', title: 'LAMPIRAN RISET LENGKAP', isBackMatter: true }
    ]
  },
  artikel_ilmiah: {
    label: 'Artikel Jurnal Ilmiah (Format IMRAD)',
    chapters: [
      { id: 'title_meta', title: 'Judul, Penulis, Afiliasi, & Kontak Korespondensi', isFrontMatter: true },
      { id: 'abstract_all', title: 'Abstract & Keywords (200-250 kata)', isFrontMatter: true },
      { id: 'introduction', title: '1. INTRODUCTION', sections: ['Background & Context', 'Literature Review & Gap', 'Research Objective & Contribution'] },
      { id: 'methodology', title: '2. METHODOLOGY', sections: ['Research Design & Dataset', 'Proposed Framework / Architecture', 'Evaluation Metrics & Validation Procedures'] },
      { id: 'results', title: '3. RESULTS', sections: ['Empirical Findings & Data Presentation', 'Comparative Analysis', 'Statistical / Experimental Verification'] },
      { id: 'discussion', title: '4. DISCUSSION', sections: ['Interpretation of Results', 'Comparison with Existing Studies', 'Theoretical & Practical Implications', 'Threats to Validity / Limitations'] },
      { id: 'conclusion', title: '5. CONCLUSION', sections: ['Summary of Main Contributions', 'Future Research Work'] },
      { id: 'references', title: 'REFERENCES', isBackMatter: true }
    ]
  },
  slr: {
    label: 'Systematic Literature Review (Protokol PRISMA 2020)',
    chapters: [
      { id: 'title_meta', title: 'Judul, Penulis, Afiliasi, & Korespondensi', isFrontMatter: true },
      { id: 'abstract_slr', title: 'Structured Abstract (Background, Objectives, Methods, Results, Conclusion)', isFrontMatter: true },
      { id: 'introduction', title: '1. INTRODUCTION', sections: ['1.1 Research Context & Rationale', '1.2 Research Questions (RQs)'] },
      { id: 'methods', title: '2. SYSTEMATIC REVIEW METHODOLOGY (PRISMA)', sections: ['2.1 Search Strategy & Databases (Scopus, IEEE, Web of Science, PubMed)', '2.2 Inclusion & Exclusion Criteria', '2.3 Study Selection Process', '2.4 Quality Assessment & Risk of Bias', '2.5 Data Extraction & Synthesis Strategy'] },
      { id: 'results', title: '3. RESULTS & TAXONOMY', sections: ['3.1 PRISMA Flow Diagram Results', '3.2 Publication Trends & Demographic Overview', '3.3 Synthesis per Research Question (RQ1, RQ2, RQ3)'] },
      { id: 'discussion', title: '4. DISCUSSION & OPEN CHALLENGES', sections: ['4.1 Critical Analysis of Existing Approaches', '4.2 Open Challenges & Research Gaps', '4.3 Limitations of the Review'] },
      { id: 'conclusion', title: '5. CONCLUSION & FUTURE ROADMAP', sections: ['5.1 Summary of Findings', '5.2 Practical Guidelines for Researchers'] },
      { id: 'references', title: 'REFERENCES', isBackMatter: true }
    ]
  }
};

/**
 * Daftar kata-kata AI SLOP yang dilarang keras dalam naskah ilmiah
 */
const FORBIDDEN_AI_SLOP = [
  'unlock your potential',
  'revolutionize your workflow',
  'seamless experience',
  'delve into',
  'in today\'s fast-paced digital era',
  'di era revolusi industri 4.0 yang serba cepat ini',
  'seiring dengan perkembangan zaman yang pesat',
  'seperti yang kita ketahui bersama',
  'perlu diingat bahwa',
  'tentu saja',
  'tidak dapat dipungkiri bahwa',
  'sebagai kesimpulan akhir dapat dikatakan',
  'dalam artikel ini saya akan',
  'halo',
  'semoga membantu',
  '✨', '🔥', '🚀', '⭐', '💡', '📌'
];

/**
 * Pembersih teks untuk memastikan terbebas dari AI Slop
 */
function sanitizeAntiAiSlop(text) {
  if (typeof text !== 'string') return '';
  let cleaned = text;

  // Hapus karakter emoji dekoratif
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  // Hapus awalan obrolan AI jika ada
  cleaned = cleaned.replace(/^(Tentu,\s*berikut\s*adalah|Baik,\s*ini\s*adalah|Berikut\s*draf\s*yang\s*Anda\s*minta|Here\s*is\s*the\s*draft)[^:\n]*:?\s*/i, '');
  cleaned = cleaned.replace(/\n*(Semoga\s*bermanfaat|Silakan\s*disesuaikan|Harap\s*beri\s*tahu\s*jika\s*ada\s*tambahan)[^\n]*$/i, '');

  return cleaned.trim();
}

/**
 * Generator Format Sitasi (APA 7th, IEEE, Harvard)
 */
function formatCitation(ref, style = 'apa') {
  const author = ref.author || 'Anonim';
  const year = ref.year || 'n.d.';
  const title = ref.title || 'Judul Tidak Diketahui';
  const journal = ref.journal || ref.publisher || 'Jurnal Ilmiah';
  const vol = ref.volume ? `${ref.volume}` : '';
  const issue = ref.issue ? `(${ref.issue})` : '';
  const pages = ref.pages ? `, ${ref.pages}` : '';
  const doi = ref.doi ? ` https://doi.org/${ref.doi}` : (ref.url ? ` ${ref.url}` : '');

  if (style === 'ieee') {
    // [1] A. B. Author, "Title," Journal, vol. x, no. x, pp. x-x, Year.
    return `${author}, "${title}," *${journal}*, vol. ${vol || '1'}, no. ${issue.replace(/[()]/g, '') || '1'}${pages}, ${year}.${doi}`;
  } else if (style === 'harvard') {
    // Author, Year. Title. Journal, Volume(Issue), pp.pages.
    return `${author}, ${year}. ${title}. *${journal}*, ${vol}${issue}${pages}.${doi}`;
  } else {
    // Default: APA 7th Edition
    // Author. (Year). Title. Journal, Volume(Issue), pages. DOI
    return `${author}. (${year}). ${title}. *${journal}*, *${vol}*${issue}${pages}.${doi}`;
  }
}

/**
 * Format In-Text Citation
 */
function formatInTextCitation(ref, style = 'apa') {
  const authors = (ref.author || 'Anonim').split(',');
  const firstAuthorLastName = authors[0].trim().split(' ').pop();
  const year = ref.year || 'n.d.';

  if (style === 'ieee') {
    return `[${ref.number || 1}]`;
  }
  return `(${firstAuthorLastName}, ${year})`;
}

module.exports = {
  MANUSCRIPT_TYPES,
  FORBIDDEN_AI_SLOP,
  sanitizeAntiAiSlop,
  formatCitation,
  formatInTextCitation
};
