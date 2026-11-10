// lib/auth.js
// Sistem autentikasi pengguna DocuResearch:
// 1. Registrasi & Login Email/Password dengan enkripsi PBKDF2/Crypto
// 2. Login via Google / Gmail (Google Identity Services OAuth)
// 3. Manajemen Token Sesi Aman (HMAC SHA-256)

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const USERS_FILE_PATH = path.join(__dirname, '../data/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'docuresearch-super-secret-key-2026';

// Memuat daftar pengguna dari file data/users.json
function loadUsers() {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(USERS_FILE_PATH)) {
      const raw = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      return Array.isArray(data.users) ? data.users : [];
    }
  } catch (err) {
    console.error('[Auth Load Error]:', err.message);
  }
  return [];
}

// Simpan pengguna ke file fisik
function saveUsers(users) {
  try {
    const payload = {
      meta: {
        appName: 'DocuResearch Users DB',
        totalUsers: users.length,
        lastUpdated: new Date().toISOString()
      },
      users
    };
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Auth Save Error]:', err.message);
  }
}

// Hash password dengan salt menggunakan crypto PBKDF2
function hashPassword(password, salt) {
  const activeSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, activeSalt, 1000, 64, 'sha512').toString('hex');
  return { salt: activeSalt, hash };
}

// Verifikasi password
function verifyPassword(password, salt, storedHash) {
  const { hash } = hashPassword(password, salt);
  return hash === storedHash;
}

// Buat Auth Token Sesi Aman (Header.Payload.Signature)
function createSessionToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    userId: user.id,
    email: user.email,
    name: user.name,
    tier: user.tier || 'free',
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 hari
  })).toString('base64url');

  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

// Verifikasi Token Sesi
function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (signature !== expectedSig) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (data.exp && Date.now() > data.exp) return null; // Kedaluwarsa
    return data;
  } catch (e) {
    return null;
  }
}

// Verifikasi Google ID Token melalui endpoint resmi Google OAuth
function verifyGoogleToken(idToken) {
  return new Promise((resolve, reject) => {
    // Dukungan mode simulasi lokal jika pengujian tanpa Google Client ID riil
    if (idToken && (idToken.startsWith('mock_') || idToken === 'demo_google_token')) {
      return resolve({
        googleId: 'google_user_' + Date.now(),
        email: 'akademisi.indonesia@gmail.com',
        name: 'Peneliti Akademik (Google)',
        picture: '',
        emailVerified: true
      });
    }

    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode === 200 && json.email) {
            resolve({
              googleId: json.sub,
              email: json.email,
              name: json.name || json.email.split('@')[0],
              picture: json.picture || '',
              emailVerified: json.email_verified === 'true' || json.email_verified === true
            });
          } else {
            reject(new Error(json.error_description || 'Token Google tidak valid.'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Registrasi pengguna baru dengan email & password
function registerUser(name, email, password, university = '') {
  if (!email || !password || !name) {
    throw new Error('Nama, email, dan password wajib diisi.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = loadUsers();

  if (users.some(u => u.email === cleanEmail)) {
    throw new Error('Email ini sudah terdaftar. Silakan masuk.');
  }

  const { salt, hash } = hashPassword(password);
  const newUser = {
    id: `usr_${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    university: university.trim(),
    tier: 'free',
    passwordHash: hash,
    salt,
    authProvider: 'local',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  const token = createSessionToken(newUser);
  return {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      university: newUser.university,
      tier: newUser.tier
    },
    token
  };
}

// Login pengguna dengan email & password
function loginUser(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const users = loadUsers();
  const user = users.find(u => u.email === cleanEmail);

  if (!user) {
    throw new Error('Akun tidak ditemukan. Silakan mendaftar terlebih dahulu.');
  }

  if (user.authProvider === 'google' && !user.passwordHash) {
    throw new Error('Akun ini terdaftar via Google. Silakan masuk dengan tombol Google / Gmail.');
  }

  const isValid = verifyPassword(password, user.salt, user.passwordHash);
  if (!isValid) {
    throw new Error('Kata sandi yang Anda masukkan salah.');
  }

  const token = createSessionToken(user);
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      university: user.university || '',
      tier: user.tier || 'free'
    },
    token
  };
}

// Login atau Auto-Register pengguna via Google / Gmail
async function loginOrRegisterGoogle(idToken) {
  const googleData = await verifyGoogleToken(idToken);
  const users = loadUsers();
  let user = users.find(u => u.email === googleData.email);

  if (!user) {
    // Buat akun baru otomatis dari data Google
    user = {
      id: `usr_g_${Date.now()}`,
      googleId: googleData.googleId,
      name: googleData.name,
      email: googleData.email,
      picture: googleData.picture,
      university: '',
      tier: 'free',
      authProvider: 'google',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);
  }

  const token = createSessionToken(user);
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture || '',
      tier: user.tier || 'free'
    },
    token
  };
}

module.exports = {
  registerUser,
  loginUser,
  loginOrRegisterGoogle,
  verifySessionToken
};
