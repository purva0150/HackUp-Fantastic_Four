// Popup.jsx — PhishGuard.AI Chrome Extension
// React + Tailwind CSS (inlined via CDN build) — Manifest V3
 
import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Chrome,
  Wifi,
  Loader2,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Dna,
  Zap,
} from "lucide-react";
 
// ─── State Machine ────────────────────────────────────────────────────────────
const VIEWS = { AUTH: "AUTH", DASHBOARD: "DASHBOARD", REPORT: "REPORT" };
 
// ─── Mock report data (replace with real AI analysis) ────────────────────────
const MOCK_REPORT = {
  score: 88,
  summary: "Suspicious Link Detected",
  detail:
    "The link leads to 'paypa1.com' instead of the legitimate 'paypal.com'. Classic homograph phishing.",
  sender: "support@paypa1.com",
  subject: "Urgent: Verify Your Account",
};
 
// ─── Utility: score → color tier ─────────────────────────────────────────────
function getRiskTier(score) {
  if (score >= 70) return { label: "CRITICAL", color: "#ff2d55", glow: "#ff2d5566", text: "text-red-400" };
  if (score >= 40) return { label: "MODERATE", color: "#ffd60a", glow: "#ffd60a55", text: "text-yellow-400" };
  return { label: "SAFE", color: "#30d158", glow: "#30d15855", text: "text-emerald-400" };
}
 
// ─── SVG Semi-Circular Gauge ──────────────────────────────────────────────────
function RiskGauge({ score }) {
  const tier = getRiskTier(score);
  const animRef = useRef(null);
  const [displayed, setDisplayed] = useState(0);
 
  // Animate score counter
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = (timestamp) => {
      if (!animRef.current) animRef.current = timestamp;
      const progress = Math.min((timestamp - animRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayed(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);
 
  // SVG arc math for semi-circle gauge
  const R = 72;
  const cx = 100;
  const cy = 95;
  const strokeWidth = 10;
  const startAngle = Math.PI; // left
  const endAngle = 0;         // right (half circle)
  const totalAngle = Math.PI;
  const arcLength = R * totalAngle;
 
  const scoreAngle = Math.PI - (score / 100) * Math.PI;
  const filledLen = (score / 100) * arcLength;
 
  function polarToXY(angle) {
    return {
      x: cx + R * Math.cos(angle),
      y: cy - R * Math.sin(angle),
    };
  }
 
  const s = polarToXY(Math.PI);
  const e = polarToXY(0);
  const f = polarToXY(scoreAngle);
 
  // Background arc path (full half circle)
  const bgPath = `M ${s.x} ${s.y} A ${R} ${R} 0 0 1 ${e.x} ${e.y}`;
  // Filled arc path
  const fillPath = `M ${s.x} ${s.y} A ${R} ${R} 0 ${score > 50 ? 1 : 0} 1 ${f.x} ${f.y}`;
 
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: 200, height: 110 }}>
        <svg viewBox="0 0 200 110" width="200" height="110">
          {/* Glow filter */}
          <defs>
            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={tier.color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={tier.color} />
            </linearGradient>
          </defs>
 
          {/* Track */}
          <path
            d={bgPath}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
 
          {/* Filled arc */}
          <path
            d={fillPath}
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#glow)"
            style={{ transition: "all 0.1s" }}
          />
 
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const angle = Math.PI - (pct / 100) * Math.PI;
            const inner = polarToXY_r(angle, R - 14, cx, cy);
            const outer = polarToXY_r(angle, R - 6, cx, cy);
            return (
              <line
                key={pct}
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke="#334155"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}
 
          {/* Needle dot at tip */}
          <circle
            cx={f.x}
            cy={f.y}
            r="5"
            fill={tier.color}
            filter="url(#glow)"
            style={{ transition: "all 0.1s" }}
          />
 
          {/* Score text */}
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            fontSize="32"
            fontWeight="700"
            fontFamily="'JetBrains Mono', 'Courier New', monospace"
            fill={tier.color}
            filter="url(#glow)"
          >
            {displayed}%
          </text>
 
          {/* Label */}
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fontFamily="'JetBrains Mono', monospace"
            fill="#475569"
            letterSpacing="3"
          >
            PHISH RISK
          </text>
 
          {/* Scale labels */}
          <text x="22" y="105" fontSize="7" fill="#334155" fontFamily="monospace">LOW</text>
          <text x="155" y="105" fontSize="7" fill="#334155" fontFamily="monospace">HIGH</text>
        </svg>
      </div>
 
      {/* Risk tier badge */}
      <div
        className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold tracking-widest"
        style={{
          background: `${tier.color}18`,
          border: `1px solid ${tier.color}44`,
          color: tier.color,
          boxShadow: `0 0 12px ${tier.glow}`,
          fontFamily: "monospace",
        }}
      >
        {score >= 70 ? <ShieldX size={11} /> : score >= 40 ? <ShieldAlert size={11} /> : <ShieldCheck size={11} />}
        {tier.label} THREAT
      </div>
    </div>
  );
}
 
function polarToXY_r(angle, r, cx, cy) {
  return { x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle) };
}
 
// ─── View: AUTH ───────────────────────────────────────────────────────────────
function AuthView({ onSignIn }) {
  const [hover, setHover] = useState(false);
  const [pulse, setPulse] = useState(false);
 
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(t);
  }, []);
 
  return (
    <div className="flex flex-col items-center justify-center h-full gap-7 px-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="relative flex items-center justify-center w-20 h-20 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            border: "1px solid #22d3ee33",
            boxShadow: pulse
              ? "0 0 32px #22d3ee44, inset 0 0 20px #22d3ee11"
              : "0 0 16px #22d3ee22, inset 0 0 10px #22d3ee08",
            transition: "box-shadow 1s ease",
          }}
        >
          <ShieldCheck size={38} color="#22d3ee" strokeWidth={1.5} />
          <div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: "#22d3ee", boxShadow: "0 0 10px #22d3ee" }}
          >
            <Zap size={9} color="#0f172a" />
          </div>
        </div>
 
        <div className="text-center">
          <h1
            className="text-2xl font-black tracking-tight"
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              background: "linear-gradient(90deg, #22d3ee, #818cf8, #22d3ee)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 3s linear infinite",
            }}
          >
            PhishGuard.AI
          </h1>
          <p className="text-xs mt-1 tracking-widest" style={{ color: "#475569", fontFamily: "monospace" }}>
            THREAT INTELLIGENCE ENGINE
          </p>
        </div>
      </div>
 
      {/* Divider */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, #1e293b)" }} />
        <span className="text-xs" style={{ color: "#334155", fontFamily: "monospace" }}>SECURE AUTH</span>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, #1e293b, transparent)" }} />
      </div>
 
      {/* Sign in button */}
      <button
        onClick={onSignIn}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200"
        style={{
          background: hover
            ? "linear-gradient(135deg, #22d3ee18, #818cf818)"
            : "linear-gradient(135deg, #0f172a, #1e293b)",
          border: hover ? "1px solid #22d3ee66" : "1px solid #1e293b",
          color: hover ? "#e2e8f0" : "#94a3b8",
          boxShadow: hover ? "0 0 20px #22d3ee22" : "none",
          fontFamily: "monospace",
          letterSpacing: "0.05em",
        }}
      >
        {/* Google SVG icon */}
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </button>
 
      <p className="text-center text-xs" style={{ color: "#1e293b", fontFamily: "monospace" }}>
        v1.0.0 · End-to-end encrypted
      </p>
    </div>
  );
}
 
// ─── View: DASHBOARD ──────────────────────────────────────────────────────────
function DashboardView({ onAnalyze }) {
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState(0);
  const [hover, setHover] = useState(false);
 
  const handleClick = () => {
    setLoading(true);
    const interval = setInterval(() => setDots((d) => (d + 1) % 4), 300);
    setTimeout(() => {
      clearInterval(interval);
      onAnalyze();
    }, 1500);
  };
 
  return (
    <div className="flex flex-col h-full px-5 py-5 gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} color="#22d3ee" />
          <span
            className="font-black text-sm tracking-wider"
            style={{ fontFamily: "monospace", color: "#22d3ee" }}
          >
            PhishGuard.AI
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
          style={{ background: "#0f291a", border: "1px solid #30d15833" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            style={{ boxShadow: "0 0 6px #30d158", animation: "pulse 2s infinite" }} />
          <span className="text-xs" style={{ color: "#30d158", fontFamily: "monospace" }}>LIVE</span>
        </div>
      </div>
 
      {/* Main analyze button */}
      <div className="flex-1 flex items-center justify-center">
        {!loading ? (
          <button
            onClick={handleClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="relative w-full py-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300"
            style={{
              background: hover
                ? "linear-gradient(135deg, #22d3ee14, #818cf814)"
                : "linear-gradient(135deg, #0a1628, #111827)",
              border: hover ? "1px solid #22d3ee55" : "1px solid #1e293b",
              boxShadow: hover
                ? "0 0 40px #22d3ee22, inset 0 0 30px #22d3ee08"
                : "inset 0 0 20px #00000033",
              cursor: "pointer",
            }}
          >
            {/* Animated corner accents */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l rounded-tl"
              style={{ borderColor: hover ? "#22d3ee88" : "#334155" }} />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r rounded-tr"
              style={{ borderColor: hover ? "#22d3ee88" : "#334155" }} />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l rounded-bl"
              style={{ borderColor: hover ? "#22d3ee88" : "#334155" }} />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r rounded-br"
              style={{ borderColor: hover ? "#22d3ee88" : "#334155" }} />
 
            <div
              className="flex items-center justify-center w-14 h-14 rounded-full"
              style={{
                background: hover ? "#22d3ee18" : "#0f172a",
                border: "1px solid",
                borderColor: hover ? "#22d3ee55" : "#1e293b",
                boxShadow: hover ? "0 0 24px #22d3ee33" : "none",
                transition: "all 0.3s",
              }}
            >
              <FileSearch size={26} color={hover ? "#22d3ee" : "#475569"} />
            </div>
 
            <div className="text-center">
              <p
                className="font-bold text-base tracking-wider"
                style={{
                  fontFamily: "monospace",
                  color: hover ? "#e2e8f0" : "#64748b",
                  transition: "color 0.3s",
                }}
              >
                EVALUATE SELECTED MAIL
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#334155", fontFamily: "monospace" }}>
                AI forensic analysis · ~2s
              </p>
            </div>
          </button>
        ) : (
          <div className="w-full py-8 flex flex-col items-center gap-4">
            {/* DNA Animation */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <Dna
                size={32}
                color="#22d3ee"
                style={{
                  animation: "spin 1s linear infinite",
                  filter: "drop-shadow(0 0 8px #22d3ee)",
                }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: "2px solid #22d3ee22",
                  animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
                }}
              />
            </div>
            <div className="text-center">
              <p
                className="font-bold text-sm tracking-widest"
                style={{ fontFamily: "monospace", color: "#22d3ee" }}
              >
                ANALYZING DNA{".".repeat(dots)}
              </p>
              <p className="text-xs mt-1" style={{ color: "#475569", fontFamily: "monospace" }}>
                Scanning headers · links · metadata
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full h-0.5 rounded-full" style={{ background: "#1e293b" }}>
              <div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #22d3ee, #818cf8)",
                  boxShadow: "0 0 8px #22d3ee",
                  animation: "progress 1.5s ease-out forwards",
                }}
              />
            </div>
          </div>
        )}
      </div>
 
      {/* Status bar */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-xl"
        style={{ background: "#0a0f1a", border: "1px solid #0f172a" }}
      >
        <div className="flex items-center gap-2">
          <Wifi size={12} color="#30d158" />
          <span className="text-xs" style={{ color: "#475569", fontFamily: "monospace" }}>
            Connected to Gmail
          </span>
        </div>
        <span className="text-xs" style={{ color: "#1e293b", fontFamily: "monospace" }}>
          ●●●●● SECURE
        </span>
      </div>
    </div>
  );
}
 
// ─── View: REPORT ─────────────────────────────────────────────────────────────
function ReportView({ report, onBack }) {
  const tier = getRiskTier(report.score);
  const [hover, setHover] = useState(false);
 
  const openFullReport = () => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({
        url: chrome.runtime.getURL("full_report.html"),
      });
    } else {
      // Dev fallback
      window.open("full_report.html", "_blank");
    }
  };
 
  return (
    <div className="flex flex-col h-full px-5 py-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs flex items-center gap-1 transition-colors"
          style={{ color: "#334155", fontFamily: "monospace" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#22d3ee")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}
        >
          ← BACK
        </button>
        <span
          className="font-black text-xs tracking-widest"
          style={{ fontFamily: "monospace", color: "#22d3ee" }}
        >
          THREAT REPORT
        </span>
        <div style={{ width: 40 }} />
      </div>
 
      {/* Gauge */}
      <div className="flex justify-center">
        <RiskGauge score={report.score} />
      </div>
 
      {/* Alert card */}
      <div
        className="rounded-xl p-3 flex flex-col gap-2"
        style={{
          background: `${tier.color}08`,
          border: `1px solid ${tier.color}33`,
        }}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} color={tier.color} />
          <span
            className="text-xs font-bold tracking-wide"
            style={{ color: tier.color, fontFamily: "monospace" }}
          >
            {report.summary}
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "#64748b", fontFamily: "monospace" }}>
          {report.detail}
        </p>
      </div>
 
      {/* Meta rows */}
      <div className="flex flex-col gap-1.5">
        {[
          { label: "FROM", value: report.sender, bad: true },
          { label: "SUBJ", value: report.subject, bad: false },
        ].map(({ label, value, bad }) => (
          <div key={label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
            style={{ background: "#0a0f1a", border: "1px solid #0f172a" }}>
            <span className="text-xs w-8 shrink-0" style={{ color: "#334155", fontFamily: "monospace" }}>
              {label}
            </span>
            <span className="text-xs truncate flex-1"
              style={{ color: bad ? "#ff2d55" : "#64748b", fontFamily: "monospace" }}>
              {value}
            </span>
            {bad && <XCircle size={11} color="#ff2d55" />}
          </div>
        ))}
      </div>
 
      {/* Full report button */}
      <button
        onClick={openFullReport}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="w-full py-2.5 rounded-xl text-xs font-bold tracking-widest flex items-center justify-center gap-2 transition-all duration-200"
        style={{
          background: hover
            ? `linear-gradient(135deg, ${tier.color}22, ${tier.color}11)`
            : "transparent",
          border: `1px solid ${tier.color}${hover ? "88" : "44"}`,
          color: tier.color,
          boxShadow: hover ? `0 0 20px ${tier.glow}` : "none",
          fontFamily: "monospace",
        }}
      >
        <FileSearch size={13} />
        FULL FORENSIC REPORT
      </button>
    </div>
  );
}
 
// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState(VIEWS.AUTH);
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');
 
        * { box-sizing: border-box; margin: 0; padding: 0; }
 
        body {
          width: 320px;
          height: 480px;
          background: #060d1a;
          color: #e2e8f0;
          overflow: hidden;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
        }
 
        #root {
          width: 320px;
          height: 480px;
          position: relative;
          overflow: hidden;
        }
 
        /* Animated grid background */
        #root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
          z-index: 0;
        }
 
        /* Vignette */
        #root::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 50%, #060d1a 100%);
          pointer-events: none;
          z-index: 1;
        }
 
        .view-container {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
 
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
 
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
 
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
 
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
 
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
 
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
 
        .view-container > * {
          animation: fadeIn 0.25s ease-out;
        }
 
        button { cursor: pointer; outline: none; background: none; border: none; }
        button:focus-visible { outline: 2px solid #22d3ee; }
      `}</style>
 
      <div className="view-container">
        {view === VIEWS.AUTH && (
          <AuthView onSignIn={() => setView(VIEWS.DASHBOARD)} />
        )}
        {view === VIEWS.DASHBOARD && (
          <DashboardView onAnalyze={() => setView(VIEWS.REPORT)} />
        )}
        {view === VIEWS.REPORT && (
          <ReportView
            report={MOCK_REPORT}
            onBack={() => setView(VIEWS.DASHBOARD)}
          />
        )}
      </div>
    </>
  );
}
    