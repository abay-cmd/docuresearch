// lib/sheets.js
// Integrasi database DocuResearch:
// 1. Google Sheets API v4 (Cloud Production)
// 2. Local JSON Database File di data/docuresearch_database.json (Mode Lokal Komputer)

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

const DB_FILE_PATH = path.join(__dirname, '../data/docuresearch_database.json');

const localStore = {
  manuscripts: new Map()
};

function initLocalDatabase() {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (data.manuscripts && Array.isArray(data.manuscripts)) {
        data.manuscripts.forEach(m => localStore.manuscripts.set(m.id, m));
      }
    } else {
      // Seed initial sample manuscript
      const sampleId = 'doc_sample_01';
      const sampleData = {
        id: sampleId,
        title: 'Pengembangan Model Prediksi Risiko Akademik Menggunakan Algoritma Machine Learning Teroptimasi',
        manuscriptType: 'tesis',
        authorName: 'Ahmad Fauzan, S.Kom',
        authorIdNumber: '2208107010045',
        programStudy: 'Magister Ilmu Komputer',
        faculty: 'Fakultas Matematika dan Ilmu Pengetahuan Alam',
        university: 'Universitas Indonesia',
        city: 'Depok',
        year: '2026',
        supervisor1: 'Prof. Dr. Ir. Hendra Kusuma, M.Eng.',
        supervisor2: 'Dr. Eng. Dian Pratama, S.T., M.T.',
        pin: '1234',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        chapters: {
          bab1: '1.1 Latar Belakang Masalah\nIntegrasi teknologi kecerdasan buatan dalam sektor pendidikan tinggi telah membuka peluang besar...',
          bab2: '2.1 Kajian Pustaka Terkait\nBerbagai literatur mutakhir mengkaji penerapan model prediksi performa akademik...'
        },
        references: [
          {
            id: 'ref1',
            author: 'Rahman, A., & Setiawan, B.',
            year: '2023',
            title: 'Optimasi Model Pembelajaran Mesin untuk Prediksi Retensi Mahasiswa',
            journal: 'Jurnal Sistem Informasi dan Informatika',
            volume: '15',
            issue: '2',
            pages: '112-125',
            doi: '10.1234/jsii.v15i2.5678'
          },
          {
            id: 'ref2',
            author: 'Kusuma, H., Pratama, D., & Chen, M.',
            year: '2022',
            title: 'Adaptive Early Warning Systems in Higher Education: An Empirical Study',
            journal: 'IEEE Transactions on Learning Technologies',
            volume: '8',
            issue: '4',
            pages: '340-352',
            doi: '10.1109/TLT.2022.314159'
          }
        ]
      };

      localStore.manuscripts.set(sampleId, sampleData);
      persistLocalFile();
    }
  } catch (err) {
    console.error('[DocuResearch DB Init Error]:', err.message);
  }
}

function persistLocalFile() {
  try {
    const all = Array.from(localStore.manuscripts.values());
    const payload = {
      meta: {
        appName: 'DocuResearch Academic Database',
        lastUpdated: new Date().toISOString(),
        totalManuscripts: all.length
      },
      manuscripts: all
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DocuResearch Persist Error]:', err.message);
  }
}

initLocalDatabase();

function getSheetsClient() {
  if (!GOOGLE_SERVICE_ACCOUNT_JSON || !SPREADSHEET_ID) return null;
  try {
    const credentials = typeof GOOGLE_SERVICE_ACCOUNT_JSON === 'string'
      ? JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON)
      : GOOGLE_SERVICE_ACCOUNT_JSON;

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    return google.sheets({ version: 'v4', auth });
  } catch (err) {
    return null;
  }
}

async function saveManuscriptToStorage(manuscript) {
  const id = manuscript.id || `doc_${Date.now()}`;
  const now = new Date().toISOString();

  const record = {
    ...manuscript,
    id,
    updatedAt: now,
    createdAt: manuscript.createdAt || now
  };

  localStore.manuscripts.set(id, record);
  persistLocalFile();

  const sheets = getSheetsClient();
  if (!sheets || !SPREADSHEET_ID) {
    return {
      success: true,
      id,
      storage: 'local_file',
      filePath: DB_FILE_PATH,
      message: 'Naskah akademik berhasil disimpan di database lokal komputer Anda.'
    };
  }

  try {
    // Simpan ke Google Sheets tab 'manuscripts'
    const row = [
      record.id,
      record.title,
      record.manuscriptType,
      record.authorName,
      record.authorIdNumber || '',
      record.university || '',
      record.year || '',
      record.pin || '',
      JSON.stringify(record.chapters || {}),
      JSON.stringify(record.references || []),
      record.updatedAt
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'manuscripts!A:K',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] }
    });

    return {
      success: true,
      id,
      storage: 'google_sheets_live',
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`,
      message: 'Naskah akademik berhasil disinkronkan ke Google Sheets.'
    };
  } catch (err) {
    return {
      success: true,
      id,
      storage: 'local_fallback',
      filePath: DB_FILE_PATH,
      message: `Google Sheets gagal (${err.message}), naskah dicadangkan di file lokal.`
    };
  }
}

async function getManuscriptFromStorage(id, pin) {
  if (localStore.manuscripts.has(id)) {
    const doc = localStore.manuscripts.get(id);
    if (doc.pin && String(doc.pin).trim() !== String(pin).trim()) {
      return { success: false, error: 'PIN akses naskah tidak cocok.' };
    }
    return { success: true, manuscript: doc, source: 'local_file' };
  }
  return { success: false, error: 'Naskah tidak ditemukan.' };
}

async function listManuscripts() {
  return Array.from(localStore.manuscripts.values()).map(m => ({
    id: m.id,
    title: m.title,
    manuscriptType: m.manuscriptType,
    authorName: m.authorName,
    university: m.university,
    year: m.year,
    updatedAt: m.updatedAt
  })).reverse();
}

module.exports = {
  saveManuscriptToStorage,
  getManuscriptFromStorage,
  listManuscripts,
  DB_FILE_PATH
};
