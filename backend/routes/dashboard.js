const router = require('express').Router();
const db     = require('../db');
const { protect, wardenOrAdmin } = require('../middleware/authMiddleware');

// GET /api/dashboard - full admin dashboard summary
router.get('/', protect, wardenOrAdmin, async (req, res) => {
  const [[rooms]]      = await db.query(`SELECT COUNT(*) AS total, SUM(status='available') AS available, SUM(status='occupied') AS occupied, SUM(status='maintenance') AS maintenance FROM rooms`);
  const [[students]]   = await db.query(`SELECT COUNT(*) AS total FROM users WHERE role='student' AND is_active=1`);
  const [[fees]]       = await db.query(`SELECT SUM(CASE WHEN status='paid' THEN amount ELSE 0 END) AS collected, SUM(CASE WHEN status IN('pending','overdue') THEN amount ELSE 0 END) AS pending FROM fee_records`);
  const [[complaints]] = await db.query(`SELECT COUNT(*) AS total, SUM(status='open') AS open_count, SUM(status='resolved') AS resolved FROM complaints`);
  const [[outpasses]]  = await db.query(`SELECT COUNT(*) AS total, SUM(status='pending') AS pending_approvals FROM outpasses`);
  const [recentActivity] = await db.query(`
    (SELECT 'complaint' AS type, title AS detail, created_at FROM complaints ORDER BY created_at DESC LIMIT 3)
    UNION ALL
    (SELECT 'outpass', CONCAT(destination,' - ',purpose), created_at FROM outpasses ORDER BY created_at DESC LIMIT 3)
    UNION ALL
    (SELECT 'fee_paid', CONCAT('₹',amount,' ',fee_type), paid_date FROM fee_records WHERE status='paid' ORDER BY paid_date DESC LIMIT 3)
    ORDER BY created_at DESC LIMIT 6
  `);

  // Monthly fee collection for chart (last 6 months)
  const [monthlyFees] = await db.query(`
    SELECT month_year, SUM(CASE WHEN status='paid' THEN amount ELSE 0 END) AS collected
    FROM fee_records
    WHERE month_year >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 5 MONTH),'%Y-%m')
    GROUP BY month_year ORDER BY month_year ASC
  `);

  res.json({ rooms, students, fees, complaints, outpasses, recentActivity, monthlyFees });
});

// GET /api/dashboard/notifications
router.get('/notifications', protect, async (req, res) => {
  const [rows] = await db.query(
    `SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 20`,
    [req.user.id]
  );
  res.json(rows);
});

// PUT /api/dashboard/notifications/:id/read
router.put('/notifications/:id/read', protect, async (req, res) => {
  await db.query('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ message: 'Marked read' });
});

module.exports = router;
