const router = require('express').Router();
const db     = require('../db');

const TOPICS = {
  gate: {
    keywords: ['gate','curfew','close','timing','entry','exit','lock'],
    reply: '🚪 Main gate closes at **10:00 PM** (Mon–Sat) and **9:00 PM** (Sunday).\nPlease carry your ID card for re-entry.'
  },
  mess: {
    keywords: ['mess','food','breakfast','lunch','dinner','snacks','meal','eat','canteen'],
    reply: '🍽️ Mess Timings:\n• Breakfast: 7:30 AM – 9:30 AM\n• Lunch: 12:30 PM – 2:30 PM\n• Snacks: 5:00 PM – 6:00 PM\n• Dinner: 7:30 PM – 9:30 PM'
  },
  outpass: {
    keywords: ['outpass','leave','go out','permission','pass','outside'],
    reply: '📋 Outpass Applications:\n• Apply at least **1 day in advance** through the hostel app\n• Warden approval required\n• Overnight passes need parent consent'
  },
  fees: {
    keywords: ['fee','rent','room rent','charge','cost','price','pay','payment','money','amount'],
    reply: '💰 Room Charges (per month):\n• Single Room: ₹8,000\n• Double Sharing: ₹5,500\n• Triple Sharing: ₹4,000\n• Security Deposit: ₹10,000 (refundable)'
  },
  wifi: {
    keywords: ['wifi','wi-fi','internet','network','bandwidth','speed','connection','password'],
    reply: '🌐 **Wi-Fi Details — Sunrise Residency Hostel**\n\nFree high-speed Wi-Fi is available **24/7** on all floors.\n\n📶 Network Names & Password:\n• Floor 1 → **Hostel-Floor-1**\n• Floor 2 → **Hostel-Floor-2**\n• Floor 3 → **Hostel-Floor-3**\n• Floor 4 → **Hostel-Floor-4**\n• Floor 5 → **Hostel-Floor-5**\n\n🔑 Password: **Hostel@123456789**\n\n⚡ Connect to your floor network for the best signal. For issues, contact the IT desk at reception.'
  },
  visitor: {
    keywords: ['visitor','visit','guest','parents','family','meet','friend'],
    reply: '👥 Visitor Policy:\n• Allowed in common lounge only\n• Timings: **10:00 AM – 7:00 PM**\n• Valid government ID mandatory\n• No visitors in rooms'
  },
  laundry: {
    keywords: ['laundry','washing','wash','clothes','ironing'],
    reply: '👕 Laundry pickup: **Monday & Thursday** mornings (8–10 AM).\nReturn within 2 days. Extra charges apply for ironing.'
  },
  complaint: {
    keywords: ['complaint','problem','issue','broken','repair','maintenance','fix'],
    reply: '🔧 Raise a Complaint:\n• Use the **Complaints** section in this app\n• Or visit the hostel reception register\n• Emergency issues: Call warden directly'
  },
  warden: {
    keywords: ['warden','contact','number','phone','call','staff','office','email'],
    reply: '📞 Contact Details:\n• Warden (Boys): +91-9876500011\n• Warden (Girls): +91-9876500022\n• Office Email: hostel@sunriseresidency.in\n• Office Hours: 9 AM – 6 PM'
  },
  rules: {
    keywords: ['rules','regulation','prohibited','smoking','alcohol','ragging','allowed','policy'],
    reply: '📜 Hostel Rules:\n• ❌ No smoking/alcohol/drugs\n• ❌ Ragging is strictly prohibited\n• ✅ Maintain silence after 10 PM\n• ✅ Keep rooms clean\n• ID card must be worn at all times'
  },
  security: {
    keywords: ['security','safe','safety','CCTV','camera','guard'],
    reply: '🛡️ Security Features:\n• 24/7 CCTV surveillance\n• Security guard at main gate\n• Biometric entry system\n• Emergency call button in corridors'
  },
  hostel: {
    keywords: ['hostel','sunrise','residency','facility','amenities','address','location'],
    reply: '🏨 Sunrise Residency Hostel\n• Location: Near City College, Hyderabad\n• Capacity: 300 students\n• Facilities: Wi-Fi, Mess, Laundry, Gym, Study Hall\n• Type: Co-ed (separate wings)'
  }
};

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { messages, session_id } = req.body;
    if (!Array.isArray(messages) || !messages.length)
      return res.status(400).json({ error: 'messages array required' });

    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
    let reply = '🤖 I\'m not sure about that. Please contact **hostel@sunriseresidency.in** or call the warden.\n\nYou can also visit the hostel office (9 AM – 6 PM).';
    let matchedTopic = 'unknown';

    for (const [topic, { keywords, reply: r }] of Object.entries(TOPICS)) {
      if (keywords.some(k => lastMsg.includes(k))) {
        reply = r;
        matchedTopic = topic;
        break;
      }
    }

    // Log to DB (non-blocking)
    db.query(
      'INSERT INTO chat_logs (session_id,user_query,bot_reply,matched_topic) VALUES (?,?,?,?)',
      [session_id || 'anonymous', messages[messages.length-1]?.content, reply, matchedTopic]
    ).catch(() => {});

    res.json({ reply, topic: matchedTopic });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/chat/stats - chat analytics
router.get('/stats', async (req, res) => {
  const [[total]] = await db.query('SELECT COUNT(*) AS total FROM chat_logs');
  const [topics]  = await db.query(`
    SELECT matched_topic AS topic, COUNT(*) AS count
    FROM chat_logs GROUP BY matched_topic ORDER BY count DESC LIMIT 10
  `);
  const [daily] = await db.query(`
    SELECT DATE(created_at) AS date, COUNT(*) AS count
    FROM chat_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE(created_at) ORDER BY date ASC
  `);
  res.json({ total: total.total, topTopics: topics, dailyUsage: daily });
});

module.exports = router;
