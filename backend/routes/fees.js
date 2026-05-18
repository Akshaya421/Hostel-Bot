const router = require('express').Router();
const db     = require('../db');
const { protect, adminOnly, wardenOrAdmin } = require('../middleware/authMiddleware');

// GET /api/fees - list fees (role-scoped)
router.get('/', protect, async (req, res) => {
  const isPrivileged = ['admin','warden'].includes(req.user.role);
  let sql = `SELECT f.*, u.name AS student_name
             FROM fee_records f JOIN users u ON u.id = f.student_id`;
  const params = [];
  if (!isPrivileged) { sql += ' WHERE f.student_id=?'; params.push(req.user.id); }
  sql += ' ORDER BY f.due_date DESC';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// GET /api/fees/summary - admin total stats
router.get('/summary', protect, wardenOrAdmin, async (req, res) => {
  const [[summary]] = await db.query(`
    SELECT
      SUM(CASE WHEN status='paid' THEN amount ELSE 0 END)    AS total_collected,
      SUM(CASE WHEN status='pending' THEN amount ELSE 0 END) AS total_pending,
      SUM(CASE WHEN status='overdue' THEN amount ELSE 0 END) AS total_overdue,
      COUNT(DISTINCT student_id) AS total_students
    FROM fee_records
  `);
  res.json(summary);
});

// POST /api/fees - create fee record (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  const { student_id, amount, fee_type, due_date, month_year, notes } = req.body;
  if (!student_id || !amount || !fee_type || !due_date)
    return res.status(400).json({ error: 'Required: student_id, amount, fee_type, due_date' });

  const [result] = await db.query(
    'INSERT INTO fee_records (student_id,amount,fee_type,due_date,month_year,notes,status) VALUES (?,?,?,?,?,?,"pending")',
    [student_id, amount, fee_type, due_date, month_year, notes]
  );
  res.status(201).json({ id: result.insertId, message: 'Fee record created' });
});

// PUT /api/fees/:id/pay - mark as paid
router.put('/:id/pay', protect, async (req, res) => {
  const { payment_mode, transaction_id } = req.body;
  const [[fee]] = await db.query('SELECT * FROM fee_records WHERE id=?', [req.params.id]);
  if (!fee) return res.status(404).json({ error: 'Fee record not found' });

  // Student can only pay own fees
  if (req.user.role === 'student' && fee.student_id !== req.user.id)
    return res.status(403).json({ error: 'Access denied' });

  await db.query(
    `UPDATE fee_records
     SET status='paid', paid_date=CURDATE(), payment_mode=?, transaction_id=? WHERE id=?`,
    [payment_mode || 'online', transaction_id || `TXN${Date.now()}`, req.params.id]
  );
  await db.query(
    `INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)`,
    [fee.student_id, 'Payment Successful', `₹${fee.amount} paid successfully.`, 'success']
  );
  res.json({ message: 'Payment recorded' });
});

// GET /api/fees/overdue - flag overdue, send reminders
router.post('/check-overdue', protect, adminOnly, async (req, res) => {
  const [updated] = await db.query(
    `UPDATE fee_records SET status='overdue'
     WHERE status='pending' AND due_date < CURDATE()`
  );
  res.json({ updated: updated.affectedRows, message: 'Overdue fees updated' });
});

module.exports = router;
