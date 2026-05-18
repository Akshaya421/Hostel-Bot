const router  = require('express').Router();
const multer  = require('multer');
const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// ── In-memory storage (no disk writes) ───────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
});

// ── Smart FAQ generator (works without any API key) ───────────
function generateFAQsFromText(orgName, text, email, phone) {
  // Clean and truncate text
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?;:()\-–]/g, '')
    .trim()
    .slice(0, 8000);

  // Split into sentences
  const sentences = cleaned
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 300);

  // Extract key sentences (those with important keywords)
  const importantKeywords = [
    'must', 'shall', 'required', 'mandatory', 'prohibited', 'allowed',
    'policy', 'rule', 'regulation', 'fee', 'charge', 'timing', 'time',
    'hour', 'apply', 'process', 'eligibility', 'contact', 'penalty',
    'fine', 'leave', 'permission', 'restrict', 'allow', 'forbid',
    'procedure', 'deadline', 'submit', 'document', 'valid', 'expire'
  ];

  const scored = sentences.map(s => {
    const lower = s.toLowerCase();
    const score = importantKeywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
    return { s, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topSentences = scored.slice(0, 10).map(x => x.s);

  // Build FAQ pairs
  const faqs = topSentences.map((sentence, i) => {
    const lower = sentence.toLowerCase();
    let question = '';

    if (lower.includes('fee') || lower.includes('charge') || lower.includes('cost'))
      question = `What are the fees or charges mentioned?`;
    else if (lower.includes('time') || lower.includes('hour') || lower.includes('timing'))
      question = `What are the timings or hours of operation?`;
    else if (lower.includes('prohibited') || lower.includes('forbidden') || lower.includes('not allowed'))
      question = `What activities or items are prohibited?`;
    else if (lower.includes('allowed') || lower.includes('permit') || lower.includes('eligible'))
      question = `What is permitted or who is eligible?`;
    else if (lower.includes('apply') || lower.includes('submit') || lower.includes('procedure'))
      question = `How do I apply or what is the procedure?`;
    else if (lower.includes('contact') || lower.includes('reach') || lower.includes('call'))
      question = `How can I contact the organization?`;
    else if (lower.includes('document') || lower.includes('id') || lower.includes('proof'))
      question = `What documents are required?`;
    else if (lower.includes('penalty') || lower.includes('fine') || lower.includes('violation'))
      question = `What are the penalties for violations?`;
    else if (lower.includes('leave') || lower.includes('permission') || lower.includes('absent'))
      question = `How do I get permission or apply for leave?`;
    else
      question = `What is the rule regarding "${sentence.split(' ').slice(0, 6).join(' ')}..."?`;

    return {
      question,
      answer: sentence.trim() + '.',
      category: 'policy',
      order_index: i + 1,
    };
  });

  // Always add contact FAQ
  faqs.push({
    question: `How can I contact ${orgName}?`,
    answer: `You can reach ${orgName} via Email: ${email} or Phone: ${phone}.`,
    category: 'contact',
    order_index: faqs.length + 1,
  });

  return faqs;
}

// ── Gemini-powered FAQ generator (used if GEMINI_API_KEY set) ─
async function generateFAQsWithGemini(orgName, text, email, phone) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are an FAQ generator. Given the following organization document, extract exactly 10 most common/useful FAQ question-answer pairs that would help customers or members of "${orgName}".

Return ONLY a valid JSON array in this exact format:
[
  { "question": "...", "answer": "...", "category": "policy|fees|rules|contact|procedure" },
  ...
]

Organization Document:
${text.slice(0, 6000)}

Contact Info: Email: ${email}, Phone: ${phone}

Generate 10 FAQs. The last FAQ must be about how to contact ${orgName}.
`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  // Extract JSON from markdown code block if present
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/(\[[\s\S]*\])/);
  const jsonStr = jsonMatch ? jsonMatch[1] : raw;
  const parsed = JSON.parse(jsonStr.trim());

  return parsed.map((f, i) => ({ ...f, order_index: i + 1 }));
}

// ── POST /api/pdf-setup  (multipart/form-data) ────────────────
router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file is required' });

    const { org_name, email, phone } = req.body;
    if (!org_name || !email || !phone)
      return res.status(400).json({ error: 'org_name, email and phone are required' });

    // 1. Parse PDF
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length < 50)
      return res.status(400).json({ error: 'PDF appears to be empty or unreadable (scanned image PDFs are not supported)' });

    // 2. Generate FAQs
    let faqs;
    if (process.env.GEMINI_API_KEY) {
      try {
        faqs = await generateFAQsWithGemini(org_name, extractedText, email, phone);
      } catch (aiErr) {
        console.warn('Gemini failed, using smart fallback:', aiErr.message);
        faqs = generateFAQsFromText(org_name, extractedText, email, phone);
      }
    } else {
      faqs = generateFAQsFromText(org_name, extractedText, email, phone);
    }

    // 3. Store org in DB
    const orgId = uuidv4();
    await db.query(
      `INSERT INTO org_setups (id, org_name, email, phone, pdf_page_count, pdf_char_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE org_name=VALUES(org_name), email=VALUES(email), phone=VALUES(phone)`,
      [orgId, org_name, email, phone, pdfData.numpages, extractedText.length]
    );

    // 4. Store FAQs in DB (replace old ones for same org email)
    await db.query('DELETE FROM org_faqs WHERE org_email = ?', [email]);
    for (const faq of faqs) {
      await db.query(
        `INSERT INTO org_faqs (org_id, org_email, org_name, question, answer, category, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orgId, email, org_name, faq.question, faq.answer, faq.category || 'general', faq.order_index]
      );
    }

    res.json({
      success: true,
      org_id: orgId,
      org_name,
      pages: pdfData.numpages,
      faqs,
    });
  } catch (err) {
    console.error('PDF Setup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/pdf-setup/faqs?email=xxx ─────────────────────────
router.get('/faqs', async (req, res) => {
  try {
    const { email } = req.query;
    const where = email ? 'WHERE org_email = ?' : '';
    const params = email ? [email] : [];
    const [rows] = await db.query(
      `SELECT org_name, question, answer, category, order_index
       FROM org_faqs ${where} ORDER BY org_email, order_index`,
      params
    );
    res.json({ faqs: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/pdf-setup/orgs  (list all submitted orgs) ────────
router.get('/orgs', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, org_name, email, phone, pdf_page_count, pdf_char_count, created_at
       FROM org_setups ORDER BY created_at DESC`
    );
    res.json({ orgs: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
