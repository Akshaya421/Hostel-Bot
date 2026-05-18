const router = require('express').Router();
const db     = require('../db');
const { protect } = require('../middleware/authMiddleware');

// GET /api/mess/menu - full weekly menu
router.get('/menu', protect, async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM mess_menu ORDER BY FIELD(day_of_week,"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), meal_type'
  );
  res.json(rows);
});

// GET /api/mess/today - today's menu
router.get('/today', protect, async (req, res) => {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today = days[new Date().getDay()];
  const [rows] = await db.query('SELECT * FROM mess_menu WHERE day_of_week=?', [today]);
  res.json({ day: today, meals: rows });
});

// PUT /api/mess/menu/:id - update menu item (admin/warden)
router.put('/menu/:id', protect, async (req, res) => {
  if (!['admin','warden'].includes(req.user.role))
    return res.status(403).json({ error: 'Not authorized' });
  const { items } = req.body;
  await db.query('UPDATE mess_menu SET items=? WHERE id=?', [items, req.params.id]);
  res.json({ message: 'Menu updated' });
});

// POST /api/mess/attendance - mark attendance
router.post('/attendance', protect, async (req, res) => {
  if (!['admin','warden'].includes(req.user.role))
    return res.status(403).json({ error: 'Not authorized' });
  const { student_id, meal_date, meal_type, status = 'present' } = req.body;
  await db.query(
    `INSERT INTO mess_attendance (student_id,meal_date,meal_type,status)
     VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE status=VALUES(status)`,
    [student_id, meal_date, meal_type, status]
  );
  res.json({ message: 'Attendance marked' });
});

// GET /api/mess/attendance - get attendance for a date
router.get('/attendance', protect, async (req, res) => {
  const { date, student_id } = req.query;
  let sql = `SELECT ma.*, u.name FROM mess_attendance ma JOIN users u ON u.id=ma.student_id WHERE 1=1`;
  const params = [];
  if (date) { sql += ' AND meal_date=?'; params.push(date); }
  if (student_id) { sql += ' AND ma.student_id=?'; params.push(student_id); }
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

module.exports = router;
