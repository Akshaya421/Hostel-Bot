import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/website")({
  component: ChatbotWebsite,
  head: () => ({
    meta: [
      { title: "SupportAI — AI Customer Support Chatbot for Hostels" },
      {
        name: "description",
        content:
          "SupportAI is an AI-powered 24/7 customer support chatbot built for hostels, colleges, and student housing. Instant answers, zero wait time.",
      },
    ],
  }),
});

const DEMO_MESSAGES = [
  { role: "user", text: "What time does the gate close?" },
  {
    role: "bot",
    text: "🚪 Main gate closes at 10:00 PM (Mon–Sat) and 9:00 PM (Sunday). Please carry your ID card for re-entry.",
  },
  { role: "user", text: "What are the mess timings?" },
  {
    role: "bot",
    text: "🍽️ Mess Timings:\n• Breakfast: 7:30–9:30 AM\n• Lunch: 12:30–2:30 PM\n• Snacks: 5:00–6:00 PM\n• Dinner: 7:30–9:30 PM",
  },
  { role: "user", text: "How do I apply for an outpass?" },
  {
    role: "bot",
    text: "📋 Apply at least 1 day in advance through the hostel app. Warden approval required. Overnight passes need parent consent.",
  },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Instant Replies",
    desc: "Answer student queries in under 1 second — 24 hours a day, 7 days a week.",
  },
  {
    icon: "🧠",
    title: "AI-Powered",
    desc: "Trained on your hostel's data: timings, rules, fees, contacts and more.",
  },
  {
    icon: "📊",
    title: "Analytics",
    desc: "Track top questions, engagement trends, and peak support hours.",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    desc: "End-to-end secure. No student data leaves your own server.",
  },
  {
    icon: "🌐",
    title: "Multi-Channel",
    desc: "Deploy on your web app, WhatsApp, Telegram, or SMS with one codebase.",
  },
  {
    icon: "🎨",
    title: "Fully Customisable",
    desc: "Match your brand colours, name the bot, and write custom FAQs.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Connect your hostel data",
    desc: "Upload your FAQ sheet or let us auto-generate from your existing rules and schedules.",
  },
  {
    num: "02",
    title: "Deploy in one click",
    desc: "Embed the widget on your website or connect to WhatsApp/Telegram instantly.",
  },
  {
    num: "03",
    title: "Watch it work 24/7",
    desc: "Students get instant answers. You get analytics. Everyone wins.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Warden, Sunrise Residency",
    text: "SupportAI cut our repetitive queries by 80%. Students now get answers instantly without disturbing staff.",
    stars: 5,
  },
  {
    name: "Rahul Verma",
    role: "Student, Room 204",
    text: "I asked about the mess menu at midnight and got an instant reply. This is genuinely amazing.",
    stars: 5,
  },
  {
    name: "Dr. Anita Rao",
    role: "Principal, City College",
    text: "We deployed across 3 hostels in a day. The analytics dashboard alone is worth it.",
    stars: 5,
  },
];

const STATS = [
  { value: "2,400+", label: "Students Supported" },
  { value: "< 1s", label: "Avg Response Time" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "80%", label: "Query Deflection" },
];

function ChatbotWebsite() {
  const [demoIdx, setDemoIdx] = useState(0);
  const [visibleMsgs, setVisibleMsgs] = useState<typeof DEMO_MESSAGES>([]);
  const [typing, setTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (demoIdx >= DEMO_MESSAGES.length) return;
    const msg = DEMO_MESSAGES[demoIdx];
    if (msg.role === "user") {
      const t = setTimeout(() => {
        setVisibleMsgs((p) => [...p, msg]);
        setDemoIdx((i) => i + 1);
      }, 1200);
      return () => clearTimeout(t);
    } else {
      setTyping(true);
      const t = setTimeout(() => {
        setTyping(false);
        setVisibleMsgs((p) => [...p, msg]);
        setDemoIdx((i) => i + 1);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [demoIdx]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleMsgs, typing]);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#08080f", color: "#e2e8f0", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 2px; }

        .w-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(8,8,15,0.85); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 5%; height: 64px; }
        .w-nav-logo { font-size: 20px; font-weight: 800;
          background: linear-gradient(135deg, #6366f1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .w-nav-links { display: flex; gap: 32px; }
        .w-nav-links a { color: #94a3b8; text-decoration: none; font-size: 14px; font-weight: 500; transition: color .2s; }
        .w-nav-links a:hover { color: #a5b4fc; }
        .w-btn { padding: 10px 22px; border-radius: 10px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; border: none; }
        .w-btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; box-shadow: 0 4px 20px rgba(99,102,241,.35); }
        .w-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(99,102,241,.5); }
        .w-btn-outline { background: transparent; border: 1px solid rgba(99,102,241,.4); color: #a5b4fc; }
        .w-btn-outline:hover { background: rgba(99,102,241,.1); border-color: rgba(99,102,241,.7); }

        .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 100px 5% 60px; position: relative; overflow: hidden; }
        .hero-orb { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; }
        .hero-orb-1 { width: 600px; height: 600px; background: #6366f1; opacity: .08; top: -150px; left: -150px; }
        .hero-orb-2 { width: 500px; height: 500px; background: #8b5cf6; opacity: .07; bottom: -100px; right: -100px; }
        .hero-inner { display: flex; align-items: center; gap: 80px; max-width: 1200px; margin: 0 auto; width: 100%; position: relative; z-index: 1; }
        .hero-left { flex: 1; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px;
          background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.25); border-radius: 20px;
          font-size: 12px; font-weight: 600; color: #a5b4fc; margin-bottom: 24px; }
        .hero-badge span { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.4;} }
        .hero-h1 { font-size: clamp(36px,5vw,62px); font-weight: 900; line-height: 1.08; margin-bottom: 20px; }
        .hero-h1 span { background: linear-gradient(135deg, #6366f1, #a78bfa, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-p { font-size: 18px; color: #94a3b8; line-height: 1.7; margin-bottom: 32px; max-width: 480px; }
        .hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }
        .hero-right { flex: 1; max-width: 420px; }

        .demo-card { background: rgba(15,15,30,.9); border: 1px solid rgba(99,102,241,.2); border-radius: 20px;
          overflow: hidden; backdrop-filter: blur(20px); box-shadow: 0 24px 80px rgba(0,0,0,.5), 0 0 60px rgba(99,102,241,.1); }
        .demo-header { padding: 14px 18px; background: rgba(20,20,40,.8); border-bottom: 1px solid rgba(255,255,255,.06);
          display: flex; align-items: center; gap: 10px; }
        .demo-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg,#6366f1,#8b5cf6);
          display: grid; place-items: center; font-size: 16px; }
        .demo-title { font-size: 14px; font-weight: 600; color: #f1f5f9; }
        .demo-status { font-size: 11px; color: #22c55e; }
        .demo-msgs { height: 320px; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .demo-msgs::-webkit-scrollbar { display: none; }
        .dmsg { display: flex; gap: 8px; animation: fadeUp .3s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .dmsg.user { flex-direction: row-reverse; }
        .dmsg-bubble { max-width: 78%; padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.55; white-space: pre-wrap; }
        .dmsg-bubble.bot { background: rgba(30,30,55,.9); border: 1px solid rgba(99,102,241,.15); color: #e2e8f0; border-bottom-left-radius: 4px; }
        .dmsg-bubble.user { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border-bottom-right-radius: 4px; }
        .typing-b { display: flex; gap: 4px; align-items: center; padding: 12px 16px;
          background: rgba(30,30,55,.9); border: 1px solid rgba(99,102,241,.15);
          border-radius: 16px; border-bottom-left-radius: 4px; width: fit-content; }
        .td { width: 7px; height: 7px; border-radius: 50%; background: #6366f1; animation: bounce .9s infinite; }
        .td:nth-child(2){animation-delay:.15s} .td:nth-child(3){animation-delay:.3s}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-7px)}}
        .demo-input-bar { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,.05);
          display: flex; gap: 8px; align-items: center; }
        .demo-inp { flex:1; background: rgba(25,25,45,.8); border: 1px solid rgba(99,102,241,.2);
          border-radius: 10px; padding: 9px 13px; font-size: 13px; color: #94a3b8; font-family: inherit; outline: none; }
        .demo-send { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg,#6366f1,#8b5cf6);
          border: none; color: #fff; cursor: pointer; display: grid; place-items: center; font-size: 14px; }

        section { padding: 90px 5%; }
        .sec-label { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #6366f1; margin-bottom: 12px; }
        .sec-h2 { font-size: clamp(28px,4vw,44px); font-weight: 800; line-height: 1.15; margin-bottom: 16px; }
        .sec-h2 span { background: linear-gradient(135deg,#6366f1,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .sec-p { font-size: 17px; color: #94a3b8; line-height: 1.7; max-width: 560px; }
        .center { text-align: center; }
        .center .sec-p { margin: 0 auto; }

        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; max-width: 900px; margin: 60px auto 0; }
        .stat-card { background: rgba(15,15,30,.8); border: 1px solid rgba(99,102,241,.15); border-radius: 16px; padding: 28px 20px; text-align: center; }
        .stat-val { font-size: 36px; font-weight: 900; background: linear-gradient(135deg,#6366f1,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .stat-lbl { font-size: 13px; color: #64748b; margin-top: 6px; }

        .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 56px; }
        .feat-card { background: rgba(15,15,30,.7); border: 1px solid rgba(255,255,255,.06); border-radius: 16px;
          padding: 28px 24px; transition: all .25s; cursor: default; }
        .feat-card:hover { border-color: rgba(99,102,241,.35); background: rgba(99,102,241,.06); transform: translateY(-4px); }
        .feat-icon { font-size: 32px; margin-bottom: 14px; }
        .feat-title { font-size: 16px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
        .feat-desc { font-size: 14px; color: #64748b; line-height: 1.65; }

        .steps-row { display: flex; gap: 0; margin-top: 56px; position: relative; }
        .steps-row::before { content:''; position:absolute; top:28px; left:10%; right:10%; height:1px; background: linear-gradient(90deg,transparent,rgba(99,102,241,.3),transparent); }
        .step-item { flex:1; text-align:center; padding: 0 24px; }
        .step-num { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg,#6366f1,#8b5cf6);
          display: grid; place-items: center; margin: 0 auto 18px; font-size: 18px; font-weight: 800;
          box-shadow: 0 0 30px rgba(99,102,241,.4); }
        .step-title { font-size: 16px; font-weight: 700; color: #f1f5f9; margin-bottom: 10px; }
        .step-desc { font-size: 14px; color: #64748b; line-height: 1.65; }

        .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 56px; }
        .testi-card { background: rgba(15,15,30,.7); border: 1px solid rgba(255,255,255,.06); border-radius: 16px; padding: 28px; }
        .testi-stars { color: #fbbf24; font-size: 14px; margin-bottom: 14px; }
        .testi-text { font-size: 15px; color: #cbd5e1; line-height: 1.7; margin-bottom: 18px; }
        .testi-name { font-size: 14px; font-weight: 700; color: #f1f5f9; }
        .testi-role { font-size: 12px; color: #64748b; margin-top: 2px; }

        .cta-box { background: linear-gradient(135deg, rgba(99,102,241,.15), rgba(139,92,246,.1));
          border: 1px solid rgba(99,102,241,.25); border-radius: 24px; padding: 72px 48px; text-align: center;
          position: relative; overflow: hidden; }
        .cta-box::before { content:''; position:absolute; top:-80px; right:-80px; width:300px; height:300px;
          border-radius:50%; background:#6366f1; opacity:.06; filter:blur(60px); }

        .footer { padding: 40px 5%; border-top: 1px solid rgba(255,255,255,.05);
          display: flex; justify-content: space-between; align-items: center; }
        .footer-copy { font-size: 13px; color: #475569; }

        @media(max-width:900px){
          .hero-inner{flex-direction:column; gap:48px;}
          .hero-right{width:100%; max-width:100%;}
          .stats-grid{grid-template-columns:repeat(2,1fr);}
          .features-grid{grid-template-columns:repeat(2,1fr);}
          .testi-grid{grid-template-columns:1fr;}
          .steps-row{flex-direction:column; gap:32px;}
          .steps-row::before{display:none;}
          .w-nav-links{display:none;}
        }
        @media(max-width:600px){
          .features-grid{grid-template-columns:1fr;}
          .stats-grid{grid-template-columns:repeat(2,1fr);}
          .cta-box{padding:48px 24px;}
        }
      `}</style>

      {/* NAV */}
      <nav className="w-nav">
        <div className="w-nav-logo">⚡ SupportAI</div>
        <div className="w-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#testimonials">Reviews</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="w-btn w-btn-outline" onClick={() => window.open("/", "_self")}>Live Demo</button>
          <button className="w-btn w-btn-primary">Get Started Free</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-badge"><span />AI-Powered · 24/7 Active</div>
            <h1 className="hero-h1">
              Your Hostel's<br /><span>AI Support Agent</span><br />Never Sleeps
            </h1>
            <p className="hero-p">
              Deploy an intelligent chatbot that answers student queries instantly — gate timings, fees, mess menus, outpass rules and more. Zero wait time, zero staff effort.
            </p>
            <div className="hero-btns">
              <button className="w-btn w-btn-primary" style={{ fontSize: 15, padding: "13px 28px" }}
                onClick={() => window.open("/", "_self")}>
                Try Live Demo →
              </button>
              <button className="w-btn w-btn-outline" style={{ fontSize: 15, padding: "13px 28px" }}>
                Watch 2-min Tour
              </button>
            </div>
          </div>

          {/* ANIMATED DEMO */}
          <div className="hero-right">
            <div className="demo-card">
              <div className="demo-header">
                <div className="demo-avatar">🤖</div>
                <div>
                  <div className="demo-title">SupportAI Assistant</div>
                  <div className="demo-status">● Online · Replies instantly</div>
                </div>
              </div>
              <div className="demo-msgs" ref={chatRef}>
                {visibleMsgs.map((m, i) => (
                  <div key={i} className={`dmsg ${m.role}`}>
                    <div className={`dmsg-bubble ${m.role}`}>{m.text}</div>
                  </div>
                ))}
                {typing && (
                  <div className="dmsg">
                    <div className="typing-b">
                      <div className="td" /><div className="td" /><div className="td" />
                    </div>
                  </div>
                )}
              </div>
              <div className="demo-input-bar">
                <input className="demo-inp" placeholder="Ask anything about the hostel..." readOnly />
                <button className="demo-send">➤</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ paddingTop: 0 }}>
        <div className="stats-grid">
          {STATS.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-val">{s.value}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="center">
          <div className="sec-label">Features</div>
          <h2 className="sec-h2">Everything your hostel needs<br /><span>in one smart bot</span></h2>
          <p className="sec-p">From answering FAQs to tracking engagement — SupportAI handles it all, round the clock.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feat-card">
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: "rgba(15,15,30,.4)" }}>
        <div className="center">
          <div className="sec-label">How it works</div>
          <h2 className="sec-h2">Live in <span>under 10 minutes</span></h2>
          <p className="sec-p">No coding required. Just connect your hostel data and go live.</p>
        </div>
        <div className="steps-row">
          {STEPS.map((s) => (
            <div key={s.num} className="step-item">
              <div className="step-num">{s.num}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials">
        <div className="center">
          <div className="sec-label">Testimonials</div>
          <h2 className="sec-h2">Loved by <span>wardens & students</span></h2>
        </div>
        <div className="testi-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="testi-card">
              <div className="testi-stars">{"★".repeat(t.stars)}</div>
              <div className="testi-text">"{t.text}"</div>
              <div className="testi-name">{t.name}</div>
              <div className="testi-role">{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="pricing">
        <div className="cta-box">
          <div className="sec-label" style={{ marginBottom: 16 }}>Get Started Today</div>
          <h2 className="sec-h2" style={{ marginBottom: 16 }}>
            Deploy your AI chatbot<br /><span>completely free</span>
          </h2>
          <p className="sec-p" style={{ margin: "0 auto 36px" }}>
            No credit card. No setup fee. Start your free trial and see results on day one.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="w-btn w-btn-primary" style={{ fontSize: 16, padding: "14px 32px" }}
              onClick={() => window.open("/", "_self")}>
              Start Free Trial →
            </button>
            <button className="w-btn w-btn-outline" style={{ fontSize: 16, padding: "14px 32px" }}>
              Book a Demo Call
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="w-nav-logo" style={{ fontSize: 16 }}>⚡ SupportAI</div>
        <div className="footer-copy">© 2026 SupportAI · Built for Sunrise Residency Hostel</div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a key={l} href="#" style={{ color: "#475569", fontSize: 13, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
