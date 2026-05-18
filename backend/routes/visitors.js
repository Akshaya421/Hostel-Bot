const router = require('express').Router();
const db     = require('../db');
const { protect } = require('../middleware/authMiddleware');

// POST /api/visitors - register visitor
router.post('/', protect, async (req, res) => {
  if (!['admin','warden','security'].includes(req.user.role))
    return res.status(403).json({ error: 'Not authorized' });

  const { visitor_name, visitor_phone, id_type, id_number, purpose, host_student_id } = req.body;
  if (!visitor_name || !visitor_phone || !id_type || !id_number || !purpose || !host_student_id)
    return res.status(400).json({ error: 'All visitor fields required' });

  // Check visiting hours (10 AM – 7 PM)
  const hour = new Date().getHours();
  if (hour < 10 || hour >= 19)
    return res.status(400).json({ error: 'Visitor hours: 10:00 AM – 7:00 PM only' });

  const [result] = await db.query(
    `INSERT INTO visitors (visitor_name,visitor_phone,id_type,id_number,purpose,host_student_id,recorded_by)
     VALUES (?,?,?,?,?,?,?)`,
    [visitor_name, visitor_phone, id_type, id_number, purpose, host_student_id, req.user.id]
  );
  res.status(201).json({ id: result.insertId, message: 'Visitor registered' });
});

// PUT /api/visitors/:id/checkout
router.put('/:id/checkout', protect, async (req, res) => {
  await db.query('UPDATE visitors SET check_out=NOW() WHERE id=?', [req.params.id]);
  res.json({ message: 'Checked out' });
});

// GET /api/visitors - today's log
router.get('/', protect, async (req, res) => {
  if (!['admin','warden','security'].includes(req.user.role))
    return res.status(403).json({ error: 'Not authorized' });
  const { date } = req.query;
  const filterDate = date || new Date().toISOString().slice(0,10);
  const [rows] = await db.query(
    `SELECT v.*, u.name AS host_name
     FROM visitors v JOIN users u ON u.id=v.host_student_id
     WHERE DATE(v.check_in)=? ORDER BY v.check_in DESC`,
    [filterDate]
  );
  res.json(rows);
});

module.exports = router;
