import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Building2,
  Clock,
  Wifi,
  BookOpen,
  Phone,
  Shield,
  ChevronRight,
  Star,
  Zap,
  Upload,
} from "lucide-react";

export const Route = createFileRoute("/")(  {
  component: Index,
  head: () => ({
    meta: [
      { title: "SupportAI — Smart Hostel Customer Support Chatbot" },
      {
        name: "description",
        content:
          "AI-powered customer support assistant for Sunrise Residency Hostel. Get instant answers about gate timings, mess hours, fees, outpasses and more.",
      },
      { name: "theme-color", content: "#0f0f1a" },
    ],
  }),
});

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
};

const SUGGESTIONS = [
  { icon: Clock, text: "What time does the hostel gate close?" },
  { icon: BookOpen, text: "What are the mess timings?" },
  { icon: ChevronRight, text: "How do I apply for an outpass?" },
  { icon: Building2, text: "What are the room rent charges?" },
  { icon: Phone, text: "How can I contact the warden?" },
  { icon: Wifi, text: "What are the Wi-Fi network names & password?" },
];

const STATS = [
  { label: "Students Helped", value: "2,400+" },
  { label: "Avg Response", value: "< 1s" },
  { label: "Satisfaction", value: "98%" },
];

function Index() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm **SupportAI** for **Sunrise Residency Hostel**.\n\nI can instantly answer questions about:\n• 🚪 Gate timings & curfew\n• 🍽️ Mess & meal schedule\n• 💰 Room fees & deposits\n• 📋 Outpass applications\n• 📶 Wi-Fi networks (floor-wise) & facilities\n• 📞 Warden contacts\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setShowSuggestions(false);

    const next: Message[] = [
      ...messages,
      { role: "user", content: trimmed, timestamp: new Date() },
    ];

    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "⚠️ Something went wrong. Please try again or contact hostel@sunriseresidency.in",
            timestamp: new Date(),
          },
        ]);
      } else {
        const data = (await res.json()) as { reply: string };
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.reply, timestamp: new Date() },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "🔌 Network error. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const formatTime = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className="chat-root">
      {/* Animated background */}
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="logo-name">SupportAI</div>
            <div className="logo-sub">Hostel Assistant</div>
          </div>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-hostel-card">
          <Building2 size={16} />
          <div>
            <div className="hostel-name">Sunrise Residency</div>
            <div className="hostel-tag">Premium Student Housing</div>
          </div>
        </div>

        <div className="sidebar-stats">
          {STATS.map((s) => (
            <div key={s.label} className="stat-item">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-features">
          <div className="feature-heading">Quick Topics</div>
          {[
            { icon: Clock, label: "Gate & Curfew" },
            { icon: BookOpen, label: "Mess Timings" },
            { icon: Building2, label: "Room & Fees" },
            { icon: Wifi, label: "Wi-Fi & Amenities" },
            { icon: Shield, label: "Rules & Safety" },
            { icon: Phone, label: "Contact Warden" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="feature-btn"
              onClick={() => void send(label)}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="online-badge">
            <span className="online-dot" />
            AI Online · 24/7
          </div>
          <a href="/setup" className="setup-link">
            <Upload size={11} /> Setup Your Own Bot
          </a>
          <div className="powered-by">
            <Zap size={11} />
            Powered by AI Engine
          </div>
        </div>
      </aside>

      {/* MAIN CHAT PANEL */}
      <main className="chat-panel">
        {/* Header */}
        <header className="chat-header">
          <div className="chat-header-left">
            <div className="header-avatar">
              <Bot size={18} />
              <span className="header-online-dot" />
            </div>
            <div>
              <div className="header-title">SupportAI Assistant</div>
              <div className="header-status">
                <span className="status-dot" />
                Active · Typically replies instantly
              </div>
            </div>
          </div>
          <div className="header-rating">
            <Star size={13} fill="currentColor" />
            <span>4.9</span>
          </div>
        </header>

        {/* Messages */}
        <div className="messages-area" ref={scrollRef}>
          {messages.map((m, i) => (
            <MessageBubble
              key={i}
              message={m}
              formatTime={formatTime}
              renderMarkdown={renderMarkdown}
            />
          ))}

          {loading && <TypingIndicator />}
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div className="suggestions-area">
            <div className="suggestions-label">💡 Suggested questions</div>
            <div className="suggestions-grid">
              {SUGGESTIONS.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  className="suggestion-chip"
                  onClick={() => void send(text)}
                >
                  <Icon size={13} />
                  <span>{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="input-area">
          <form onSubmit={onSubmit} className="input-form">
            <input
              ref={inputRef}
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the hostel..."
              className="chat-input"
              disabled={loading}
              autoComplete="off"
            />
            <button
              id="send-button"
              type="submit"
              disabled={loading || !input.trim()}
              className="send-btn"
            >
              <Send size={16} />
              <span>Send</span>
            </button>
          </form>
          <p className="input-footer">
            SupportAI · Sunrise Residency Hostel · Confidential
          </p>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .chat-root {
          font-family: 'Inter', sans-serif;
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: #0a0a14;
          color: #e2e8f0;
          position: relative;
        }

        /* ── Animated background orbs ── */
        .bg-orbs { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.12;
          animation: float 12s ease-in-out infinite alternate;
        }
        .orb-1 { width: 500px; height: 500px; background: #6366f1; top: -10%; left: -10%; animation-duration: 14s; }
        .orb-2 { width: 400px; height: 400px; background: #8b5cf6; bottom: 10%; right: -5%; animation-duration: 10s; animation-delay: -3s; }
        .orb-3 { width: 300px; height: 300px; background: #06b6d4; top: 40%; left: 30%; animation-duration: 16s; animation-delay: -6s; }
        @keyframes float { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,20px) scale(1.08); } }

        /* ── Sidebar ── */
        .sidebar {
          width: 260px;
          flex-shrink: 0;
          background: rgba(15, 15, 30, 0.85);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          padding: 20px 16px;
          gap: 0;
          position: relative;
          z-index: 1;
          overflow-y: auto;
        }
        @media (max-width: 640px) { .sidebar { display: none; } }

        .sidebar-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
        .logo-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: grid; place-items: center; color: #fff;
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
        }
        .logo-name { font-size: 16px; font-weight: 700; color: #fff; }
        .logo-sub { font-size: 11px; color: #7c8db0; }

        .sidebar-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 14px 0; }

        .sidebar-hostel-card {
          display: flex; align-items: center; gap: 10px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 10px;
          padding: 10px 12px;
          color: #a5b4fc;
          margin-bottom: 16px;
        }
        .hostel-name { font-size: 13px; font-weight: 600; color: #c7d2fe; }
        .hostel-tag { font-size: 10px; color: #7c8db0; }

        .sidebar-stats {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
          margin-bottom: 4px;
        }
        .stat-item {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 8px 6px;
          text-align: center;
        }
        .stat-value { font-size: 13px; font-weight: 700; color: #a5b4fc; }
        .stat-label { font-size: 9px; color: #7c8db0; margin-top: 2px; }

        .feature-heading { font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; }
        .feature-btn {
          display: flex; align-items: center; gap: 8px;
          width: 100%; padding: 8px 10px;
          background: transparent;
          border: none; border-radius: 8px;
          color: #94a3b8; font-size: 13px; font-family: inherit;
          cursor: pointer; transition: all .2s;
          text-align: left;
        }
        .feature-btn:hover { background: rgba(99,102,241,0.12); color: #a5b4fc; transform: translateX(3px); }

        .sidebar-footer { margin-top: auto; display: flex; flex-direction: column; gap: 6px; }
        .online-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: #64748b;
        }
        .online-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        .powered-by { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #475569; }
        .setup-link {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: #6366f1; text-decoration: none;
          padding: 5px 8px; border-radius: 7px;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.18);
          transition: all 0.2s;
        }
        .setup-link:hover { background: rgba(99,102,241,0.16); color: #a5b4fc; }

        /* ── Chat Panel ── */
        .chat-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
          background: rgba(10,10,20,0.6);
          backdrop-filter: blur(12px);
          min-width: 0;
        }

        .chat-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 24px;
          background: rgba(15,15,30,0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .chat-header-left { display: flex; align-items: center; gap: 12px; }
        .header-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: grid; place-items: center; color: #fff;
          position: relative;
          box-shadow: 0 0 16px rgba(99,102,241,0.35);
        }
        .header-online-dot {
          position: absolute; bottom: 1px; right: 1px;
          width: 10px; height: 10px; border-radius: 50%;
          background: #22c55e; border: 2px solid #0a0a14;
        }
        .header-title { font-size: 15px; font-weight: 600; color: #f1f5f9; }
        .header-status { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #64748b; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; }
        .header-rating {
          display: flex; align-items: center; gap: 4px;
          background: rgba(234,179,8,0.12); border: 1px solid rgba(234,179,8,0.2);
          border-radius: 20px; padding: 4px 10px;
          font-size: 12px; font-weight: 600; color: #fbbf24;
        }

        /* ── Messages ── */
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scroll-behavior: smooth;
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 2px; }

        .msg-row {
          display: flex;
          gap: 10px;
          animation: slideIn .3s ease-out;
        }
        @keyframes slideIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
        .msg-row.user { flex-direction: row-reverse; }

        .msg-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          display: grid; place-items: center;
          flex-shrink: 0;
        }
        .msg-avatar.bot {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 0 12px rgba(99,102,241,0.35);
        }
        .msg-avatar.user {
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          color: #fff;
          box-shadow: 0 0 12px rgba(14,165,233,0.35);
        }

        .msg-body { display: flex; flex-direction: column; max-width: 72%; gap: 4px; }
        .msg-row.user .msg-body { align-items: flex-end; }

        .msg-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.6;
        }
        .msg-bubble.bot {
          background: rgba(30,30,55,0.85);
          border: 1px solid rgba(99,102,241,0.18);
          border-bottom-left-radius: 4px;
          color: #e2e8f0;
          backdrop-filter: blur(8px);
        }
        .msg-bubble.user {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-bottom-right-radius: 4px;
          color: #fff;
          box-shadow: 0 4px 20px rgba(99,102,241,0.3);
        }
        .msg-time { font-size: 10px; color: #475569; padding: 0 4px; }

        /* ── Typing ── */
        .typing-row { display: flex; gap: 10px; align-items: flex-start; animation: slideIn .3s ease-out; }
        .typing-bubble {
          background: rgba(30,30,55,0.85);
          border: 1px solid rgba(99,102,241,0.18);
          border-radius: 18px; border-bottom-left-radius: 4px;
          padding: 14px 18px;
          display: flex; align-items: center; gap: 5px;
        }
        .typing-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          animation: bounce-dot 1.2s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: .2s; }
        .typing-dot:nth-child(3) { animation-delay: .4s; }
        @keyframes bounce-dot { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-8px); } }

        /* ── Suggestions ── */
        .suggestions-area {
          padding: 0 24px 14px;
          flex-shrink: 0;
        }
        .suggestions-label { font-size: 11px; color: #475569; margin-bottom: 8px; }
        .suggestions-grid { display: flex; flex-wrap: wrap; gap: 7px; }
        .suggestion-chip {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 20px;
          color: #94a3b8; font-size: 12px; font-family: inherit;
          cursor: pointer; transition: all .2s;
          white-space: nowrap;
        }
        .suggestion-chip:hover {
          background: rgba(99,102,241,0.2);
          border-color: rgba(99,102,241,0.4);
          color: #c7d2fe;
          transform: translateY(-1px);
        }

        /* ── Input ── */
        .input-area {
          padding: 14px 24px 18px;
          flex-shrink: 0;
          background: rgba(10,10,20,0.8);
          border-top: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
        }
        .input-form {
          display: flex; gap: 10px; align-items: center;
          background: rgba(25,25,45,0.9);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 14px;
          padding: 6px 8px 6px 16px;
          transition: border-color .2s, box-shadow .2s;
        }
        .input-form:focus-within {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08), 0 0 20px rgba(99,102,241,0.12);
        }
        .chat-input {
          flex: 1; background: transparent; border: none; outline: none;
          font-family: inherit; font-size: 14px; color: #e2e8f0;
          padding: 8px 0;
        }
        .chat-input::placeholder { color: #475569; }
        .send-btn {
          display: flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; border-radius: 10px;
          color: #fff; font-family: inherit; font-size: 13px; font-weight: 600;
          padding: 9px 16px; cursor: pointer;
          transition: all .2s;
          box-shadow: 0 4px 14px rgba(99,102,241,0.35);
          white-space: nowrap;
        }
        .send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.5);
        }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        @media (max-width: 480px) { .send-btn span { display: none; } }

        .input-footer { font-size: 10px; color: #334155; text-align: center; margin-top: 8px; }
      `}</style>
    </div>
  );
}

function MessageBubble({
  message,
  formatTime,
  renderMarkdown,
}: {
  message: Message;
  formatTime: (d?: Date) => string;
  renderMarkdown: (t: string) => string;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`msg-row ${isUser ? "user" : ""}`}>
      <div className={`msg-avatar ${isUser ? "user" : "bot"}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className="msg-body">
        <div
          className={`msg-bubble ${isUser ? "user" : "bot"}`}
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(message.content),
          }}
        />
        <span className="msg-time">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="typing-row">
      <div className="msg-avatar bot">
        <Bot size={16} />
      </div>
      <div className="typing-bubble">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}