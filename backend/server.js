require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');

const authRoutes       = require('./routes/auth');
const roomRoutes       = require('./routes/rooms');
const outpassRoutes    = require('./routes/outpass');
const feeRoutes        = require('./routes/fees');
const complaintRoutes  = require('./routes/complaints');
const messRoutes       = require('./routes/mess');
const visitorRoutes    = require('./routes/visitors');
const chatRoutes       = require('./routes/chat');
const dashboardRoutes  = require('./routes/dashboard');
const pdfSetupRoutes   = require('./routes/pdf-setup');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: function(origin, callback) {
    // Allow any localhost port (dev) or configured FRONTEND_URL
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4321',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localhost:8082',
      'http://localhost:8083',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    if (!origin || allowed.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' });
app.use('/api/', limiter);

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/rooms',      roomRoutes);
app.use('/api/outpass',    outpassRoutes);
app.use('/api/fees',       feeRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/mess',       messRoutes);
app.use('/api/visitors',   visitorRoutes);
app.use('/api/chat',       chatRoutes);
app.use('/api/dashboard',  dashboardRoutes);
app.use('/api/pdf-setup',  pdfSetupRoutes);

// Health check
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', time: new Date().toISOString(), db: 'hostel_db' })
);

// 404 handler
app.use((req, res) => res.status(404).json({ error: `Route ${req.path} not found` }));

// Global error handler
app.use((err, req, res, _next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Hostel Backend running at http://localhost:${PORT}`);
  console.log(`📋 API Docs: http://localhost:${PORT}/api/health`);
});
