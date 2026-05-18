const router = require('express').Router();
const db     = require('../db');
const { protect, wardenOrAdmin } = require('../middleware/authMiddleware');

// GET /api/complaints
router.get('/', protect, async (req, res) => {
  const isPrivileged = ['admin','warden'].includes(req.user.role);
  let sql = `SELECT c.*, u.name AS student_name, a.name AS assigned_to_name
             FROM complaints c
             JOIN users u ON u.id = c.student_id
             LEFT JOIN users a ON a.id = c.assigned_to`;
  const params = [];
  if (!isPrivileged) { sql += ' WHERE c.student_id=?'; params.push(req.user.id); }
  sql += ' ORDER BY c.created_at DESC';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// POST /api/complaints - raise complaint
router.post('/', protect, async (req, res) => {
  const { category, title, description, priority = 'medium' } = req.body;
  if (!category || !title || !description)
    return res.status(400).json({ error: 'Category, title, description required' });

  const [result] = await db.query(
    'INSERT INTO complaints (student_id,category,title,description,priority) VALUES (?,?,?,?,?)',
    [req.user.id, category, title, description, priority]
  );

  // Notify warden
  await db.query(
    `INSERT INTO notifications (user_id,title,message,type)
     SELECT id,'New Complaint', CONCAT('Complaint: ', ?), 'warning'
     FROM users WHERE role IN ('admin','warden')`,
    [title]
  );

  res.status(201).json({ id: result.insertId, message: 'Complaint raised' });
});

// PUT /api/complaints/:id/assign
router.put('/:id/assign', protect, wardenOrAdmin, async (req, res) => {
  const { assigned_to } = req.body;
  await db.query(
    `UPDATE complaints SET assigned_to=?, status='assigned' WHERE id=?`,
    [assigned_to, req.params.id]
  );
  res.json({ message: 'Assigned' });
});

// PUT /api/complaints/:id/resolve
router.put('/:id/resolve', protect, wardenOrAdmin, async (req, res) => {
  const { resolution } = req.body;
  const [[c]] = await db.query('SELECT * FROM complaints WHERE id=?', [req.params.id]);
  if (!c) return res.status(404).json({ error: 'Not found' });

  await db.query(
    `UPDATE complaints SET status='resolved', resolution=?, resolved_at=NOW() WHERE id=?`,
    [resolution, req.params.id]
  );
  await db.query(
    `INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)`,
    [c.student_id, 'Complaint Resolved', `Your complaint "${c.title}" has been resolved.`, 'success']
  );
  res.json({ message: 'Resolved' });
});

// PUT /api/complaints/:id/reopen
router.put('/:id/reopen', protect, async (req, res) => {
  await db.query(`UPDATE complaints SET status='open', resolved_at=NULL WHERE id=?`, [req.params.id]);
  res.json({ message: 'Complaint reopened' });
});

// GET /api/complaints/stats
router.get('/stats', protect, wardenOrAdmin, async (req, res) => {
  const [[stats]] = await db.query(`
    SELECT
      COUNT(*) AS total,
      SUM(status='open') AS open_count,
      SUM(status='resolved') AS resolved_count,
      SUM(priority='emergency') AS emergency_count,
      AVG(TIMESTAMPDIFF(HOUR,created_at,IFNULL(resolved_at,NOW()))) AS avg_resolution_hours
    FROM complaints
  `);
  res.json(stats);
});

module.exports = router;
