// api/auth.js
// Endpoint autentikasi akun pengguna (Email/Password & Google Sign-In)

const {
  registerUser,
  loginUser,
  loginOrRegisterGoogle,
  verifySessionToken
} = require('../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  const action = (req.query && req.query.action) || 'me';

  // GET: Cek sesi akun yang sedang aktif
  if (req.method === 'GET' && action === 'me') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    const session = verifySessionToken(token);
    if (!session) {
      return res.status(401).json({
        ok: false,
        error: { code: 'UNAUTHORIZED', message: 'Sesi Anda telah berakhir atau belum masuk.' }
      });
    }

    return res.status(200).json({
      ok: true,
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        tier: session.tier
      }
    });
  }

  // POST: Register / Login / Google Login
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {
        return res.status(400).json({ ok: false, error: { message: 'Format JSON tidak valid.' } });
      }
    }

    try {
      if (action === 'register') {
        const { name, email, password, university } = body || {};
        const result = registerUser(name, email, password, university);
        return res.status(201).json({
          ok: true,
          message: 'Akun Anda berhasil dibuat!',
          data: result
        });
      } else if (action === 'login') {
        const { email, password } = body || {};
        const result = loginUser(email, password);
        return res.status(200).json({
          ok: true,
          message: 'Berhasil masuk ke akun!',
          data: result
        });
      } else if (action === 'google') {
        const { credential } = body || {};
        if (!credential) {
          return res.status(400).json({ ok: false, error: { message: 'Token Google diperlukan.' } });
        }
        const result = await loginOrRegisterGoogle(credential);
        return res.status(200).json({
          ok: true,
          message: 'Berhasil masuk dengan akun Google!',
          data: result
        });
      } else {
        return res.status(400).json({ ok: false, error: { message: 'Aksi auth tidak dikenali.' } });
      }
    } catch (err) {
      return res.status(400).json({
        ok: false,
        error: { message: err.message || 'Gagal memproses autentikasi.' }
      });
    }
  }

  return res.status(405).json({ ok: false, error: { message: 'Metode HTTP tidak didukung.' } });
};
