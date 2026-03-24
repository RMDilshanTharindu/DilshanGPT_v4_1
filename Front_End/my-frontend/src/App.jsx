import { useState, useRef, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:8000/chat"; // change to your backend URL

// Lightweight markdown renderer (bold, italic, bullets, numbered lists)
function renderMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  let listItems = [];
  let listType = null;
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    elements.push(
      <Tag key={key++} style={{ paddingLeft: "1.4em", margin: "6px 0", display: "flex", flexDirection: "column", gap: "4px" }}>
        {listItems.map((item, i) => <li key={i}>{inlineMarkdown(item)}</li>)}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  const inlineMarkdown = (str) => {
    const parts = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let last = 0, m;
    while ((m = regex.exec(str)) !== null) {
      if (m.index > last) parts.push(str.slice(last, m.index));
      if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
      else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
      else if (m[4]) parts.push(<code key={m.index} style={{ background: "rgba(124,109,250,0.15)", padding: "1px 6px", borderRadius: "4px", fontSize: "12.5px" }}>{m[4]}</code>);
      last = m.index + m[0].length;
    }
    if (last < str.length) parts.push(str.slice(last));
    return parts;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const ulMatch = line.match(/^[\s]*[-*]\s+(.*)/);
    const olMatch = line.match(/^[\s]*\d+\.\s+(.*)/);

    if (ulMatch) {
      if (listType === "ol") flushList();
      listType = "ul";
      listItems.push(ulMatch[1]);
    } else if (olMatch) {
      if (listType === "ul") flushList();
      listType = "ol";
      listItems.push(olMatch[1]);
    } else {
      flushList();
      if (line.trim() === "") {
        elements.push(<br key={key++} />);
      } else {
        elements.push(<p key={key++} style={{ margin: "3px 0" }}>{inlineMarkdown(line)}</p>);
      }
    }
  }
  flushList();
  return elements;
}

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
                {msg.role === "assistant" ? renderMarkdown(msg.text) : msg.text}
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