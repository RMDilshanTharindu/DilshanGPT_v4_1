import { useState, useRef, useEffect } from "react";

const API_URL = "http://localhost:8000/chat"; // change to your backend URL

const GREETING = {
  id: "greeting",
  role: "assistant",
  text: "Hello. I'm DilshanGPT — a RAG-powered assistant. Ask me anything.",
  ts: new Date(),
};

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DilshanGPT() {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), role: "user", text, ts: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: text }),
      });
      const data = await res.json();
      const reply = data["DilshanGPT"] ?? "No response received.";
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: reply, ts: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "⚠ Could not reach the server. Check your backend.",
          ts: new Date(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0a0f;
          --surface: #111118;
          --border: rgba(255,255,255,0.07);
          --accent: #7c6dfa;
          --accent2: #3ecfcf;
          --text: #e8e8f0;
          --muted: #5a5a72;
          --user-bg: #1a1a2e;
          --bot-bg: #0f0f1a;
          --radius: 16px;
          --font-head: 'Syne', sans-serif;
          --font-mono: 'DM Mono', monospace;
        }

        body { background: var(--bg); }

        .app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 780px;
          margin: 0 auto;
          font-family: var(--font-mono);
          color: var(--text);
          background: var(--bg);
          position: relative;
        }

        /* ─── Header ─── */
        .header {
          padding: 28px 32px 24px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 120% at 10% -20%, rgba(124,109,250,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .header-top {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .logo-mark {
          width: 40px; height: 40px;
          border: 1.5px solid var(--accent);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          box-shadow: 0 0 18px rgba(124,109,250,0.3), inset 0 0 12px rgba(124,109,250,0.1);
        }
        .logo-mark svg { width: 22px; height: 22px; }
        .header-title {
          font-family: var(--font-head);
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .header-title span { color: var(--accent); }
        .badge {
          margin-left: auto;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--accent2);
          border: 1px solid rgba(62,207,207,0.3);
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(62,207,207,0.06);
        }
        .header-sub {
          margin-top: 8px;
          font-size: 11.5px;
          color: var(--muted);
          letter-spacing: 0.3px;
        }

        /* ─── Messages ─── */
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .msg-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
          animation: fadeUp 0.3s ease forwards;
          opacity: 0;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .msg-meta {
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 0.8px;
          text-transform: uppercase;
          padding: 0 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .msg-meta.user { justify-content: flex-end; }

        .bubble {
          padding: 14px 18px;
          border-radius: var(--radius);
          font-size: 14px;
          line-height: 1.7;
          max-width: 86%;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .bubble.user {
          align-self: flex-end;
          background: var(--user-bg);
          border: 1px solid rgba(124,109,250,0.25);
          border-bottom-right-radius: 4px;
          color: #d4d0ff;
        }
        .bubble.assistant {
          align-self: flex-start;
          background: var(--bot-bg);
          border: 1px solid var(--border);
          border-bottom-left-radius: 4px;
        }
        .bubble.error { border-color: rgba(255,90,90,0.3); color: #ff7070; }

        /* ─── Typing indicator ─── */
        .typing-wrap {
          animation: fadeUp 0.3s ease forwards;
          opacity: 0;
        }
        .typing-label {
          font-size: 10px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 0 4px 4px;
        }
        .typing {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 14px 18px;
          background: var(--bot-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          border-bottom-left-radius: 4px;
        }
        .dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--accent);
          animation: blink 1.2s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; background: var(--accent2); }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0%,80%,100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }

        /* ─── Input ─── */
        .input-area {
          padding: 20px 32px 28px;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
          background: linear-gradient(to top, var(--bg) 60%, transparent);
        }
        .input-wrap {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 12px 14px;
          transition: border-color 0.2s;
        }
        .input-wrap:focus-within {
          border-color: rgba(124,109,250,0.5);
          box-shadow: 0 0 0 3px rgba(124,109,250,0.08);
        }
        textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          font-family: var(--font-mono);
          font-size: 13.5px;
          color: var(--text);
          line-height: 1.6;
          min-height: 22px;
          max-height: 160px;
          overflow-y: auto;
          scrollbar-width: thin;
        }
        textarea::placeholder { color: var(--muted); }

        .send-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: var(--accent);
          color: #fff;
          transition: all 0.2s;
        }
        .send-btn:hover:not(:disabled) {
          background: #9b8ffc;
          transform: scale(1.05);
        }
        .send-btn:disabled {
          background: rgba(124,109,250,0.2);
          cursor: default;
          color: var(--muted);
        }
        .input-hint {
          margin-top: 8px;
          font-size: 10px;
          color: var(--muted);
          text-align: center;
          letter-spacing: 0.4px;
        }

        /* ─── Scrollbar ─── */
        .messages::-webkit-scrollbar { width: 4px; }
        .messages::-webkit-scrollbar-track { background: transparent; }
        .messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
      `}</style>

      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-top">
            <div className="logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="header-title"><span>Dilshan</span>GPT</span>
            <span className="badge">RAG · Demo</span>
          </div>
          <p className="header-sub">Retrieval-Augmented Generation · Backend by Dilshan</p>
        </header>

        {/* Messages */}
        <div className="messages">
          {messages.map((msg) => (
            <div className="msg-group" key={msg.id}>
              <div className={`msg-meta ${msg.role}`}>
                {msg.role === "user" ? (
                  <>
                    <span>{formatTime(msg.ts)}</span>
                    <span>you</span>
                  </>
                ) : (
                  <>
                    <span>DilshanGPT</span>
                    <span>{formatTime(msg.ts)}</span>
                  </>
                )}
              </div>
              <div className={`bubble ${msg.role}${msg.error ? " error" : ""}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="typing-wrap">
              <div className="typing-label">DilshanGPT</div>
              <div className="typing">
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <div className="input-wrap">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask something…"
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button className="send-btn" onClick={send} disabled={!input.trim() || loading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="input-hint">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </>
  );
}
