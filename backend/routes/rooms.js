const router  = require('express').Router();
const db      = require('../db');
const { protect, adminOnly, wardenOrAdmin } = require('../middleware/authMiddleware');

// GET /api/rooms - list all rooms
router.get('/', protect, async (req, res) => {
  const { status, type } = req.query;
  let sql = 'SELECT * FROM rooms WHERE 1=1';
  const params = [];
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (type)   { sql += ' AND type = ?';   params.push(type);   }
  sql += ' ORDER BY floor, room_number';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// GET /api/rooms/stats
router.get('/stats', protect, wardenOrAdmin, async (req, res) => {
  const [[stats]] = await db.query(`
    SELECT
      COUNT(*) AS total,
      SUM(status='available') AS available,
      SUM(status='occupied')  AS occupied,
      SUM(status='maintenance') AS maintenance,
      SUM(capacity) AS total_capacity,
      SUM(occupied) AS total_occupied
    FROM rooms
  `);
  res.json(stats);
});

// GET /api/rooms/:id
router.get('/:id', protect, async (req, res) => {
  const [[room]] = await db.query('SELECT * FROM rooms WHERE id=?', [req.params.id]);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const [students] = await db.query(
    `SELECT u.id, u.name, u.email, sp.admission_no, sp.course
     FROM student_profiles sp JOIN users u ON u.id = sp.user_id
     WHERE sp.room_id = ?`, [req.params.id]
  );
  res.json({ ...room, students });
});

// POST /api/rooms - add room
router.post('/', protect, adminOnly, async (req, res) => {
  const { room_number, floor, type, capacity, monthly_fee } = req.body;
  if (!room_number || !floor || !type || !capacity || !monthly_fee)
    return res.status(400).json({ error: 'All room fields are required' });

  const [result] = await db.query(
    'INSERT INTO rooms (room_number,floor,type,capacity,monthly_fee) VALUES (?,?,?,?,?)',
    [room_number, floor, type, capacity, monthly_fee]
  );
  res.status(201).json({ id: result.insertId, message: 'Room added' });
});

// PUT /api/rooms/:id/allocate
router.put('/:id/allocate', protect, wardenOrAdmin, async (req, res) => {
  const { student_id } = req.body;
  const [[room]] = await db.query('SELECT * FROM rooms WHERE id=?', [req.params.id]);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (room.occupied >= room.capacity)
    return res.status(400).json({ error: 'Room is already full' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE student_profiles SET room_id=? WHERE user_id=?', [req.params.id, student_id]);
    await conn.query('UPDATE rooms SET occupied=occupied+1, status=IF(occupied+1>=capacity,"occupied","occupied") WHERE id=?', [req.params.id]);
    await conn.commit();
    res.json({ message: 'Room allocated successfully' });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// PUT /api/rooms/:id/vacate
router.put('/:id/vacate', protect, wardenOrAdmin, async (req, res) => {
  const { student_id } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE student_profiles SET room_id=NULL WHERE user_id=?', [student_id]);
    await conn.query(`UPDATE rooms SET occupied=GREATEST(occupied-1,0),
      status=IF(GREATEST(occupied-1,0)=0,'available','occupied') WHERE id=?`, [req.params.id]);
    await conn.commit();
    res.json({ message: 'Room vacated' });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// PUT /api/rooms/:id/status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  const { status } = req.body;
  await db.query('UPDATE rooms SET status=? WHERE id=?', [status, req.params.id]);
  res.json({ message: 'Status updated' });
});

module.exports = router;
