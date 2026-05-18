const router = require('express').Router();
const db     = require('../db');
const { protect, wardenOrAdmin } = require('../middleware/authMiddleware');

// GET /api/outpass - list (admin/warden sees all; student sees own)
router.get('/', protect, async (req, res) => {
  const isPrivileged = ['admin','warden'].includes(req.user.role);
  let sql = `SELECT o.*, u.name AS student_name, u.email,
             a.name AS approved_by_name
             FROM outpasses o
             JOIN users u ON u.id = o.student_id
             LEFT JOIN users a ON a.id = o.approved_by`;
  const params = [];
  if (!isPrivileged) { sql += ' WHERE o.student_id = ?'; params.push(req.user.id); }
  sql += ' ORDER BY o.created_at DESC';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// POST /api/outpass - student applies
router.post('/', protect, async (req, res) => {
  const { destination, purpose, departure_date, return_date, type = 'day' } = req.body;
  if (!destination || !purpose || !departure_date || !return_date)
    return res.status(400).json({ error: 'All fields required' });

  // Enforce 24-hour advance rule
  const dep = new Date(departure_date);
  const now = new Date();
  const diffHours = (dep - now) / 36e5;
  if (diffHours < 20)
    return res.status(400).json({ error: 'Apply at least 1 day in advance' });

  const [result] = await db.query(
    'INSERT INTO outpasses (student_id,destination,purpose,departure_date,return_date,type) VALUES (?,?,?,?,?,?)',
    [req.user.id, destination, purpose, departure_date, return_date, type]
  );

  // Create notification for warden
  await db.query(
    `INSERT INTO notifications (user_id, title, message, type)
     SELECT id, 'New Outpass Request', CONCAT(? , ' applied for outpass'), 'info'
     FROM users WHERE role='warden'`,
    [req.user.name]
  );

  res.status(201).json({ id: result.insertId, message: 'Outpass applied' });
});

// PUT /api/outpass/:id/approve
router.put('/:id/approve', protect, wardenOrAdmin, async (req, res) => {
  const [[op]] = await db.query('SELECT * FROM outpasses WHERE id=?', [req.params.id]);
  if (!op) return res.status(404).json({ error: 'Not found' });

  await db.query(
    'UPDATE outpasses SET status="approved", approved_by=?, updated_at=NOW() WHERE id=?',
    [req.user.id, req.params.id]
  );
  await db.query(
    `INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)`,
    [op.student_id, 'Outpass Approved', 'Your outpass request has been approved.', 'success']
  );
  res.json({ message: 'Outpass approved' });
});

// PUT /api/outpass/:id/reject
router.put('/:id/reject', protect, wardenOrAdmin, async (req, res) => {
  const { rejection_reason } = req.body;
  const [[op]] = await db.query('SELECT * FROM outpasses WHERE id=?', [req.params.id]);
  if (!op) return res.status(404).json({ error: 'Not found' });

  await db.query(
    'UPDATE outpasses SET status="rejected", rejection_reason=?, approved_by=?, updated_at=NOW() WHERE id=?',
    [rejection_reason || 'No reason provided', req.user.id, req.params.id]
  );
  await db.query(
    `INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)`,
    [op.student_id, 'Outpass Rejected', `Rejected: ${rejection_reason || 'No reason'}`, 'error']
  );
  res.json({ message: 'Outpass rejected' });
});

// PUT /api/outpass/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  const [[op]] = await db.query('SELECT * FROM outpasses WHERE id=? AND student_id=?', [req.params.id, req.user.id]);
  if (!op) return res.status(404).json({ error: 'Not found' });
  if (!['pending','approved'].includes(op.status))
    return res.status(400).json({ error: 'Cannot cancel in current state' });

  await db.query('UPDATE outpasses SET status="cancelled" WHERE id=?', [req.params.id]);
  res.json({ message: 'Cancelled' });
});

module.exports = router;
