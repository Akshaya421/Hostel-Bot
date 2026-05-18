import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import {
  Upload,
  FileText,
  Mail,
  Phone,
  Building2,
  Sparkles,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
  head: () => ({
    meta: [
      { title: "SupportAI — PDF Bot Setup" },
      {
        name: "description",
        content:
          "Upload your organization's policy PDF and let AI generate a smart FAQ chatbot for your customers in seconds.",
      },
    ],
  }),
});

type FAQ = {
  question: string;
  answer: string;
  category: string;
  order_index: number;
};

type Step = "form" | "processing" | "done";

const CATEGORY_COLORS: Record<string, string> = {
  policy:    "badge-policy",
  fees:      "badge-fees",
  rules:     "badge-rules",
  contact:   "badge-contact",
  procedure: "badge-procedure",
  general:   "badge-general",
};

function SetupPage() {
  const [step, setStep]         = useState<Step>("form");
  const [orgName, setOrgName]   = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [file, setFile]         = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [faqs, setFaqs]         = useState<FAQ[]>([]);
  const [orgId, setOrgId]       = useState("");
  const [pages, setPages]       = useState(0);
  const [error, setError]       = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const fileRef                 = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
    else setError("Only PDF files are accepted.");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    if (chosen?.type === "application/pdf") {
      setFile(chosen);
      setError("");
    } else {
      setError("Only PDF files are accepted.");
    }
  };

  const handleSubmit = async () => {
    if (!orgName.trim()) return setError("Organization name is required.");
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setError("Valid email is required.");
    if (!phone.trim()) return setError("Phone number is required.");
    if (!file) return setError("Please upload a PDF file.");

    setError("");
    setStep("processing");

    try {
      const form = new FormData();
      form.append("pdf", file);
      form.append("org_name", orgName.trim());
      form.append("email", email.trim());
      form.append("phone", phone.trim());

      const res = await fetch("http://localhost:5000/api/pdf-setup", {
        method: "POST",
        body: form,
      });

      const data = await res.json() as {
        success?: boolean;
        org_id?: string;
        faqs?: FAQ[];
        pages?: number;
        error?: string;
      };

      if (!res.ok || !data.success) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStep("form");
        return;
      }

      setFaqs(data.faqs ?? []);
      setOrgId(data.org_id ?? "");
      setPages(data.pages ?? 0);
      setStep("done");
    } catch {
      setError("Network error — make sure the backend server is running.");
      setStep("form");
    }
  };

  return (
    <div className="setup-root">
      {/* Animated background */}
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="setup-container">
        {/* ── Header ── */}
        <header className="setup-header">
          <div className="header-logo">
            <div className="logo-icon"><Sparkles size={20} /></div>
            <span className="logo-text">SupportAI</span>
          </div>
          <div className="header-badge">
            <Zap size={11} /> PDF → FAQ Bot Setup
          </div>
        </header>

        {/* ── Hero ── */}
        {step !== "done" && (
          <div className="hero-section">
            <h1 className="hero-title">
              Turn your <span className="gradient-text">policy PDF</span> into<br />
              a smart customer chatbot
            </h1>
            <p className="hero-sub">
              Upload your organization's document, add your contact info, and AI will
              auto-generate the top FAQs for your customers — in seconds.
            </p>
          </div>
        )}

        {/* ── STEP: FORM ── */}
        {step === "form" && (
          <div className="form-card">
            {/* PDF Drop Zone */}
            <div
              className={`drop-zone ${dragOver ? "drag-active" : ""} ${file ? "has-file" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              id="pdf-drop-zone"
            >
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="pdf-file-input"
              />
              {file ? (
                <div className="file-preview">
                  <div className="file-icon"><FileText size={28} /></div>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button
                    className="file-remove"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="drop-content">
                  <div className="drop-icon"><Upload size={30} /></div>
                  <div className="drop-title">Drag & drop your PDF here</div>
                  <div className="drop-sub">or click to browse · Max 10 MB</div>
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="fields-grid">
              <div className="field-group full-width">
                <label className="field-label" htmlFor="org-name-input">
                  <Building2 size={13} /> Organization Name
                </label>
                <input
                  id="org-name-input"
                  className="field-input"
                  placeholder="e.g. Sunrise Engineering College"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="email-input">
                  <Mail size={13} /> Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  className="field-input"
                  placeholder="admin@org.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="phone-input">
                  <Phone size={13} /> Phone Number
                </label>
                <input
                  id="phone-input"
                  type="tel"
                  className="field-input"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="error-msg">⚠️ {error}</div>
            )}

            <button
              id="generate-faqs-btn"
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!file || !orgName || !email || !phone}
            >
              <Sparkles size={16} />
              Generate FAQs with AI
              <ArrowRight size={16} />
            </button>

            <p className="form-footer">
              Your PDF is processed securely and never stored permanently on our servers.
            </p>
          </div>
        )}

        {/* ── STEP: PROCESSING ── */}
        {step === "processing" && (
          <div className="processing-card">
            <div className="processing-icon">
              <Loader2 size={40} className="spin" />
            </div>
            <h2 className="processing-title">Analysing your document…</h2>
            <p className="processing-sub">
              Reading PDF content, extracting key rules and policies,<br />
              and generating FAQs tailored to your organization.
            </p>
            <div className="processing-steps">
              {[
                "📄 Parsing PDF text",
                "🧠 Identifying key rules & policies",
                "🤖 Generating FAQ pairs with AI",
                "💾 Saving to database",
              ].map((s, i) => (
                <div key={i} className="proc-step" style={{ animationDelay: `${i * 0.4}s` }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: DONE ── */}
        {step === "done" && (
          <div className="done-section">
            {/* Success banner */}
            <div className="success-banner">
              <div className="success-icon"><CheckCircle2 size={28} /></div>
              <div>
                <div className="success-title">🎉 Your FAQ Bot is Ready!</div>
                <div className="success-sub">
                  {faqs.length} FAQs generated from {pages} page{pages !== 1 ? "s" : ""} · Org ID: <code>{orgId.slice(0, 8)}…</code>
                </div>
              </div>
            </div>

            {/* FAQ list */}
            <div className="faq-list">
              <div className="faq-list-header">
                <Sparkles size={16} />
                Generated FAQs for <strong>{orgName}</strong>
              </div>

              {faqs.map((faq, i) => (
                <div key={i} className={`faq-item ${expanded === i ? "faq-open" : ""}`}>
                  <button
                    className="faq-question"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    id={`faq-item-${i}`}
                  >
                    <div className="faq-q-left">
                      <span className="faq-num">{i + 1}</span>
                      <span>{faq.question}</span>
                      <span className={`faq-badge ${CATEGORY_COLORS[faq.category] ?? "badge-general"}`}>
                        {faq.category}
                      </span>
                    </div>
                    {expanded === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {expanded === i && (
                    <div className="faq-answer">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="done-actions">
              <a href="/" className="action-btn primary">
                <Sparkles size={15} /> Open Chatbot
              </a>
              <button
                className="action-btn secondary"
                onClick={() => {
                  setStep("form");
                  setFile(null);
                  setFaqs([]);
                  setOrgName(""); setEmail(""); setPhone("");
                }}
              >
                Upload Another PDF
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .setup-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: #080812;
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 16px 60px;
          position: relative;
          overflow-x: hidden;
        }

        /* ── Background orbs ── */
        .bg-orbs { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(90px); opacity: 0.10;
          animation: float 14s ease-in-out infinite alternate;
        }
        .orb-1 { width: 600px; height: 600px; background: #6366f1; top: -15%; left: -15%; animation-duration: 16s; }
        .orb-2 { width: 450px; height: 450px; background: #8b5cf6; bottom: 5%; right: -10%; animation-duration: 12s; animation-delay: -4s; }
        .orb-3 { width: 350px; height: 350px; background: #06b6d4; top: 50%; left: 35%; animation-duration: 18s; animation-delay: -8s; }
        @keyframes float { from { transform: translate(0,0) scale(1); } to { transform: translate(40px, 25px) scale(1.1); } }

        /* ── Container ── */
        .setup-container {
          width: 100%; max-width: 700px;
          position: relative; z-index: 1;
          display: flex; flex-direction: column; gap: 32px;
        }

        /* ── Header ── */
        .setup-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px 0 0;
        }
        .header-logo { display: flex; align-items: center; gap: 10px; }
        .logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: grid; place-items: center; color: #fff;
          box-shadow: 0 0 18px rgba(99,102,241,0.45);
        }
        .logo-text { font-size: 18px; font-weight: 700; color: #fff; }
        .header-badge {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.25);
          color: #a5b4fc; border-radius: 20px; padding: 5px 12px;
        }

        /* ── Hero ── */
        .hero-section { text-align: center; }
        .hero-title {
          font-size: clamp(26px, 5vw, 40px);
          font-weight: 800; line-height: 1.2;
          color: #f1f5f9; margin-bottom: 14px;
        }
        .gradient-text {
          background: linear-gradient(135deg, #818cf8, #c084fc);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-sub { font-size: 15px; color: #64748b; line-height: 1.7; }

        /* ── Form Card ── */
        .form-card {
          background: rgba(15,15,30,0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 28px;
          display: flex; flex-direction: column; gap: 20px;
        }

        /* ── Drop Zone ── */
        .drop-zone {
          border: 2px dashed rgba(99,102,241,0.3);
          border-radius: 14px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s;
          background: rgba(99,102,241,0.04);
        }
        .drop-zone:hover, .drag-active {
          border-color: rgba(99,102,241,0.65);
          background: rgba(99,102,241,0.1);
          transform: scale(1.005);
        }
        .has-file { border-style: solid; border-color: rgba(99,102,241,0.5); }
        .drop-icon {
          width: 56px; height: 56px; border-radius: 14px;
          background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25);
          display: grid; place-items: center; color: #818cf8; margin: 0 auto 12px;
        }
        .drop-title { font-size: 15px; font-weight: 600; color: #c7d2fe; margin-bottom: 4px; }
        .drop-sub { font-size: 12px; color: #475569; }

        .file-preview { display: flex; align-items: center; gap: 14px; }
        .file-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3);
          display: grid; place-items: center; color: #a5b4fc; flex-shrink: 0;
        }
        .file-info { flex: 1; text-align: left; }
        .file-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }
        .file-size { font-size: 11px; color: #64748b; margin-top: 2px; }
        .file-remove {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.2);
          color: #f87171; display: grid; place-items: center;
          cursor: pointer; transition: all 0.2s;
        }
        .file-remove:hover { background: rgba(239,68,68,0.22); }

        /* ── Fields ── */
        .fields-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        .full-width { grid-column: 1 / -1; }
        .field-group { display: flex; flex-direction: column; gap: 7px; }
        .field-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600; color: #7c8db0;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .field-input {
          background: rgba(25,25,50,0.8);
          border: 1px solid rgba(99,102,241,0.18);
          border-radius: 10px; padding: 11px 14px;
          font-family: inherit; font-size: 14px; color: #e2e8f0;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input::placeholder { color: #475569; }
        .field-input:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
        }
        @media (max-width: 500px) { .fields-grid { grid-template-columns: 1fr; } }

        /* ── Error ── */
        .error-msg {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px; padding: 10px 14px;
          font-size: 13px; color: #fca5a5;
        }

        /* ── Submit ── */
        .submit-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; border-radius: 12px; padding: 14px 24px;
          font-family: inherit; font-size: 15px; font-weight: 700; color: #fff;
          cursor: pointer; transition: all 0.25s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.55);
        }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .form-footer { font-size: 11px; color: #334155; text-align: center; }

        /* ── Processing ── */
        .processing-card {
          background: rgba(15,15,30,0.85); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; padding: 48px 28px;
          text-align: center; display: flex; flex-direction: column;
          align-items: center; gap: 16px;
        }
        .processing-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.25);
          display: grid; place-items: center; color: #818cf8;
        }
        .spin { animation: spin 1.2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .processing-title { font-size: 22px; font-weight: 700; color: #f1f5f9; }
        .processing-sub { font-size: 14px; color: #64748b; line-height: 1.7; }
        .processing-steps { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .proc-step {
          background: rgba(99,102,241,0.07);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 8px; padding: 9px 16px;
          font-size: 13px; color: #94a3b8;
          animation: fadeSlide 0.4s ease-out both;
        }
        @keyframes fadeSlide { from { opacity:0; transform: translateX(-10px); } to { opacity:1; transform: none; } }

        /* ── Done Section ── */
        .done-section { display: flex; flex-direction: column; gap: 20px; }

        .success-banner {
          display: flex; align-items: center; gap: 16px;
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 14px; padding: 18px 20px;
        }
        .success-icon { color: #22c55e; flex-shrink: 0; }
        .success-title { font-size: 17px; font-weight: 700; color: #f1f5f9; }
        .success-sub { font-size: 12px; color: #64748b; margin-top: 3px; }
        .success-sub code {
          font-family: monospace; font-size: 11px;
          background: rgba(99,102,241,0.15); padding: 1px 5px; border-radius: 4px; color: #a5b4fc;
        }

        /* ── FAQ List ── */
        .faq-list {
          background: rgba(15,15,30,0.85); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; overflow: hidden;
        }
        .faq-list-header {
          display: flex; align-items: center; gap: 8px;
          padding: 16px 20px;
          font-size: 13px; font-weight: 600; color: #7c8db0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(99,102,241,0.06);
        }
        .faq-item { border-bottom: 1px solid rgba(255,255,255,0.05); }
        .faq-item:last-child { border-bottom: none; }
        .faq-question {
          width: 100%; display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
          padding: 14px 20px; background: transparent; border: none;
          color: #cbd5e1; font-family: inherit; font-size: 13px;
          text-align: left; cursor: pointer; transition: background 0.2s;
        }
        .faq-question:hover, .faq-open .faq-question {
          background: rgba(99,102,241,0.07); color: #e2e8f0;
        }
        .faq-q-left { display: flex; align-items: center; gap: 10px; flex: 1; }
        .faq-num {
          width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
          background: rgba(99,102,241,0.15); font-size: 11px; font-weight: 700;
          color: #818cf8; display: grid; place-items: center;
        }
        .faq-badge {
          font-size: 10px; font-weight: 600; padding: 2px 7px;
          border-radius: 12px; text-transform: capitalize; flex-shrink: 0;
        }
        .badge-policy    { background: rgba(99,102,241,0.15); color: #818cf8; }
        .badge-fees      { background: rgba(34,197,94,0.12);  color: #4ade80; }
        .badge-rules     { background: rgba(239,68,68,0.12);  color: #f87171; }
        .badge-contact   { background: rgba(6,182,212,0.12);  color: #22d3ee; }
        .badge-procedure { background: rgba(234,179,8,0.12);  color: #fbbf24; }
        .badge-general   { background: rgba(148,163,184,0.12); color: #94a3b8; }

        .faq-answer {
          padding: 4px 20px 16px 52px;
          font-size: 13px; color: #94a3b8; line-height: 1.7;
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn { from { opacity:0; transform: translateY(-4px); } to { opacity:1; transform:none; } }

        /* ── Done Actions ── */
        .done-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .action-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 12px 22px; border-radius: 12px;
          font-family: inherit; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; text-decoration: none;
        }
        .action-btn.primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; color: #fff;
          box-shadow: 0 4px 16px rgba(99,102,241,0.4);
        }
        .action-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(99,102,241,0.55); }
        .action-btn.secondary {
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25); color: #a5b4fc;
        }
        .action-btn.secondary:hover { background: rgba(99,102,241,0.18); }
      `}</style>
    </div>
  );
}
