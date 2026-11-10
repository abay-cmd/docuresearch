// lib/validation.js
// Struktur naskah akademik, validasi data, formatting sitasi, dan aturan Anti AI-Slop ketat

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
      { id: 'bab1', title: 'BAB I PENDAHULUAN', sections: ['1.1 Latar Belakang Masalah', '1.2 Identifikasi Masalah', '1.3 Batasan Masalah', '1.4 Rumusan Masalah', '1.5 Tujuan Penelitian', '1.6 Manfaat Penelitian', '1.7 Sistematika Penulisan'] },
      { id: 'bab2', title: 'BAB II TINJAUAN PUSTAKA DAN LANDASAN TEORI', sections: ['2.1 Kajian Teori Utama', '2.2 Tinjauan Substansi Konseptual', '2.3 Matriks Penelitian Terdahulu', '2.4 Kerangka Konseptual', '2.5 Pertanyaan Penelitian'] },
      { id: 'bab3', title: 'BAB III METODOLOGI PENELITIAN', sections: ['3.1 Pendekatan dan Desain Penelitian', '3.2 Tempat dan Waktu Penelitian', '3.3 Sumber Data dan Informan', '3.4 Teknik Pengumpulan Data', '3.5 Pemeriksaan Keabsahan Data', '3.6 Teknik Analisis Data'] },
      { id: 'bab4', title: 'BAB IV HASIL PENELITIAN DAN PEMBAHASAN', sections: ['4.1 Gambaran Umum Objek Penelitian', '4.2 Temuan Empiris Lapangan', '4.3 Pembahasan Analitis dan Kebaruan (Novelty)'] },
      { id: 'bab5', title: 'BAB V KESIMPULAN DAN SARAN', sections: ['5.1 Kesimpulan', '5.2 Implikasi Penelitian', '5.3 Saran dan Rekomendasi'] },
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
 * Daftar kata dan simbol AI SLOP yang dilarang keras dalam naskah ilmiah
 */
const FORBIDDEN_AI_SLOP = [
  'unlock your potential',
  'revolutionize your workflow',
  'seamless experience',
  'delve into',
  'in today\'s fast-paced digital era',
  'di era revolusi industri 4.0 yang serba cepat ini',
  'di era digital yang serba cepat ini',
  'seiring dengan perkembangan zaman yang pesat',
  'seperti yang kita ketahui bersama',
  'perlu diingat bahwa',
  'tentu saja',
  'tidak dapat dipungkiri bahwa',
  'sebagai kesimpulan akhir dapat dikatakan',
  'dalam artikel ini saya akan',
  'halo',
  'semoga membantu',
  'semoga bermanfaat',
  '✨', '🔥', '🚀', '⭐', '💡', '📌', '✦', '•'
];

/**
 * Pembersih teks ketat sesuai kriteria penulisan akademik (Anti AI-Slop & Anti-Markdown)
 */
function sanitizeAntiAiSlop(text) {
  if (typeof text !== 'string') return '';
  let cleaned = text;

  // 1. Hapus emoji dekoratif & simbol non-standar
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  cleaned = cleaned.replace(/[•✦★☆✓✔]/gu, '');

  // 2. Hapus awalan dan akhiran basa-basi obrolan AI
  cleaned = cleaned.replace(/^(?:Tentu[,\.]?\s*|Baik[,\.]?\s*|Berikut\s*(?:adalah\s*)?(?:draf|naskah|hasil)[^:\n]*:?\s*|Here\s*is\s*the\s*draft[^:\n]*:?\s*)/i, '');
  cleaned = cleaned.replace(/\n*(?:Semoga\s*(?:bermanfaat|membantu)|Silakan\s*disesuaikan|Harap\s*beri\s*tahu\s*jika\s*ada\s*tambahan)[^\n]*$/i, '');

  // 3. Bersihkan simbol format khas AI: markdown hashtag (#)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // 4. Bersihkan markdown asterisk (*) dan cetak tebal/miring berlebihan
  cleaned = cleaned.replace(/\*{3,}([^*]+)\*{3,}/g, '$1');
  cleaned = cleaned.replace(/\*{2}([^*]+)\*{2}/g, '$1');
  cleaned = cleaned.replace(/\*([^*\n]+)\*/g, '$1');
  cleaned = cleaned.replace(/^\s*\*\s+/gm, '');

  // 5. Bersihkan em-dash (— atau --) ganti dengan tanda hubung tunggal atau struktur kalimat
  cleaned = cleaned.replace(/[\u2014\u2013]/g, ' - ');
  cleaned = cleaned.replace(/\s*--\s*/g, ' - ');

  // 6. Ganti singkatan "vs", "vs.", atau "versus" menjadi komparasi baku
  cleaned = cleaned.replace(/\b(?:vs\.|vs|versus)\b/gi, 'dibandingkan dengan');

  // 7. Ganti kata klise AI "holistik", "komprehensif", "lanskap"
  cleaned = cleaned.replace(/\bholistik\b/gi, 'menyeluruh');
  cleaned = cleaned.replace(/\bkomprehensif\b/gi, 'mendalam');
  cleaned = cleaned.replace(/\blanskap\b/gi, 'ranah kajian');

  // 8. Bersihkan kutipan ganda aneh ("") atau pembungkus tanda kutip berlebihan
  cleaned = cleaned.replace(/\(\s*""\s*\)/g, '');
  cleaned = cleaned.replace(/""+/g, '"');

  // 9. DILARANG KERAS memulai awal paragraf dengan konjungsi:
  // (Namun, Sehingga, Oleh karena itu, Dengan demikian, Maka, Selanjutnya, Selain itu, Di samping itu, Akan tetapi, dsb)
  const forbiddenInitialConjunctions = [
    { regex: /^(\s*)Namun,\s+/gm, repl: '$1Kondisi empiris menunjukkan bahwa ' },
    { regex: /^(\s*)Namun\s+/gm, repl: '$1Kondisi empiris menunjukkan bahwa ' },
    { regex: /^(\s*)Sehingga,\s+/gm, repl: '$1Hal tersebut berimplikasi pada ' },
    { regex: /^(\s*)Sehingga\s+/gm, repl: '$1Hal tersebut berimplikasi pada ' },
    { regex: /^(\s*)Oleh karena itu,\s+/gm, repl: '$1Memperhatikan fenomena tersebut, ' },
    { regex: /^(\s*)Oleh karena itu\s+/gm, repl: '$1Memperhatikan fenomena tersebut, ' },
    { regex: /^(\s*)Dengan demikian,\s+/gm, repl: '$1Rangkaian temuan tersebut menegaskan bahwa ' },
    { regex: /^(\s*)Dengan demikian\s+/gm, repl: '$1Rangkaian temuan tersebut menegaskan bahwa ' },
    { regex: /^(\s*)Maka,\s+/gm, repl: '$1Konsekuensi logis dari keadaan ini adalah ' },
    { regex: /^(\s*)Maka\s+/gm, repl: '$1Konsekuensi logis dari keadaan ini adalah ' },
    { regex: /^(\s*)Selanjutnya,\s+/gm, repl: '$1Kajian tahap berikutnya memfokuskan pada ' },
    { regex: /^(\s*)Selanjutnya\s+/gm, repl: '$1Kajian tahap berikutnya memfokuskan pada ' },
    { regex: /^(\s*)Selain itu,\s+/gm, repl: '$1Aspek substansial lain yang teridentifikasi adalah ' },
    { regex: /^(\s*)Selain itu\s+/gm, repl: '$1Aspek substansial lain yang teridentifikasi adalah ' },
    { regex: /^(\s*)Di samping itu,\s+/gm, repl: '$1Faktor komplementer yang turut memengaruhi adalah ' },
    { regex: /^(\s*)Di samping itu\s+/gm, repl: '$1Faktor komplementer yang turut memengaruhi adalah ' },
    { regex: /^(\s*)Akan tetapi,\s+/gm, repl: '$1Kenyataan di lapangan mengindikasikan bahwa ' },
    { regex: /^(\s*)Akan tetapi\s+/gm, repl: '$1Kenyataan di lapangan mengindikasikan bahwa ' },
    { regex: /^(\s*)Bahkan,\s+/gm, repl: '$1Penelusuran lebih mendalam memperlihatkan bahwa ' },
    { regex: /^(\s*)Bahkan\s+/gm, repl: '$1Penelusuran lebih mendalam memperlihatkan bahwa ' },
    { regex: /^(\s*)Kemudian,\s+/gm, repl: '$1Pada tahapan berikutnya, ' },
    { regex: /^(\s*)Kemudian\s+/gm, repl: '$1Pada tahapan berikutnya, ' },
    { regex: /^(\s*)Lalu,\s+/gm, repl: '$1Pada tahapan berikutnya, ' },
    { regex: /^(\s*)Lalu\s+/gm, repl: '$1Pada tahapan berikutnya, ' }
  ];

  forbiddenInitialConjunctions.forEach(({ regex, repl }) => {
    cleaned = cleaned.replace(regex, repl);
  });

  return cleaned.trim();
}

/**
 * Generator Format Sitasi (Bodynote APA 7th, Footnote Chicago/Turabian, IEEE, Harvard)
 */
function formatCitation(ref, style = 'bodynote_apa') {
  const author = ref.author || 'Anonim';
  const year = ref.year || 'n.d.';
  const title = ref.title || 'Judul Tidak Diketahui';
  const journal = ref.journal || ref.publisher || 'Jurnal Ilmiah';
  const vol = ref.volume ? `${ref.volume}` : '';
  const issue = ref.issue ? `(${ref.issue})` : '';
  const pages = ref.pages ? `, ${ref.pages}` : '';
  const doi = ref.doi ? ` https://doi.org/${ref.doi}` : (ref.url ? ` ${ref.url}` : '');

  if (style === 'footnote' || style === 'footnote_chicago') {
    return `${author}, "${title}," ${journal} ${vol}${issue ? `, no. ${issue.replace(/[()]/g, '')}` : ''} (${year})${pages ? `: ${pages.replace(/^[,\s]+/, '')}` : ''}.${doi}`;
  } else if (style === 'ieee') {
    return `${author}, "${title}," ${journal}, vol. ${vol || '1'}, no. ${issue.replace(/[()]/g, '') || '1'}${pages}, ${year}.${doi}`;
  } else if (style === 'harvard') {
    return `${author}, ${year}. ${title}. ${journal}, ${vol}${issue}${pages}.${doi}`;
  } else {
    // Default: Bodynote APA 7th Edition
    return `${author}. (${year}). ${title}. ${journal}, ${vol}${issue}${pages}.${doi}`;
  }
}

/**
 * Format In-Text Citation
 */
function formatInTextCitation(ref, style = 'bodynote_apa', pageNumber = '') {
  const authors = (ref.author || 'Anonim').split(',');
  const firstAuthorLastName = authors[0].trim().split(' ').pop();
  const year = ref.year || 'n.d.';
  const pageStr = pageNumber ? `: ${pageNumber}` : '';

  if (style === 'footnote' || style === 'footnote_chicago') {
    const num = ref.number || 1;
    const superscripts = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];
    const sup = String(num).split('').map(d => superscripts[parseInt(d, 10)] || d).join('');
    return `${sup}`;
  } else if (style === 'ieee') {
    return `[${ref.number || 1}]`;
  } else if (style === 'bodynote_page') {
    return `(${firstAuthorLastName}, ${year}${pageStr || ': 45'})`;
  }
  return `(${firstAuthorLastName}, ${year})`;
}

/**
 * Ekspor seluruh referensi ke standar internasional format file RIS (.ris)
 */
function generateRisFormat(references) {
  if (!Array.isArray(references) || references.length === 0) return '';

  return references.map(ref => {
    const authors = (ref.author || '').split(/,|&| dan /).map(a => a.trim()).filter(Boolean);
    const authorTags = authors.length > 0 
      ? authors.map(a => `AU  - ${a}`).join('\n')
      : 'AU  - Unknown Author';

    const pages = (ref.pages || '').split('-');
    const sp = pages[0] ? pages[0].trim() : '';
    const ep = pages[1] ? pages[1].trim() : '';

    return [
      'TY  - JOUR',
      `TI  - ${ref.title || 'Untitled'}`,
      authorTags,
      `PY  - ${ref.year || ''}`,
      `JO  - ${ref.journal || ref.publisher || 'Academic Journal'}`,
      ref.volume ? `VL  - ${ref.volume}` : '',
      ref.issue ? `IS  - ${ref.issue.replace(/[()]/g, '')}` : '',
      sp ? `SP  - ${sp}` : '',
      ep ? `EP  - ${ep}` : '',
      ref.doi ? `DO  - ${ref.doi}` : '',
      ref.url ? `UR  - ${ref.url}` : '',
      'ER  - '
    ].filter(Boolean).join('\n');
  }).join('\n\n');
}

module.exports = {
  MANUSCRIPT_TYPES,
  FORBIDDEN_AI_SLOP,
  sanitizeAntiAiSlop,
  formatCitation,
  formatInTextCitation,
  generateRisFormat
};
