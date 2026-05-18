const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../db');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, phone, password, role = 'student' } = req.body;
  if (!name || !email || !phone || !password)
    return res.status(400).json({ error: 'All fields required' });

  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) return res.status(409).json({ error: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    'INSERT INTO users (name, email, phone, password, role) VALUES (?,?,?,?,?)',
    [name, email, phone, hashed, role]
  );
  const userId = result.insertId;

  // Create student profile if role is student
  if (role === 'student') {
    await db.query('INSERT INTO student_profiles (user_id) VALUES (?)', [userId]);
  }

  const [[user]] = await db.query('SELECT id,name,email,role FROM users WHERE id=?', [userId]);
  res.status(201).json({ token: signToken(user), user });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const [[user]] = await db.query('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const { password: _, ...safeUser } = user;
  res.json({ token: signToken(safeUser), user: safeUser });
});

// GET /api/auth/me
const { protect } = require('../middleware/authMiddleware');
router.get('/me', protect, async (req, res) => {
  const [[user]] = await db.query(
    'SELECT id,name,email,phone,role,created_at FROM users WHERE id=?',
    [req.user.id]
  );
  res.json(user);
});

module.exports = router;
