// src/components/Chatbot.js — AI gardening assistant powered by Claude
import React, { useState, useRef, useEffect } from 'react';

const SYSTEM_PROMPT = `You are a friendly, expert home gardening assistant called "GardenAI". 
You help users with:
- Plant care tips and watering schedules
- Diagnosing plant health issues
- Soil, sunlight, and fertilizer advice
- Seasonal gardening guidance
- Pest and disease control
Keep answers concise (2-4 sentences max), practical, and encouraging. 
Always use a friendly tone. Use an occasional relevant emoji.`;

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! 🌱 I\'m GardenAI. Ask me anything about plant care!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text }]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.role !== 'bot' || m !== messages[0])
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [...history, { role: 'user', content: text }],
        }),
      });

      const data = await response.json();
      const reply = data.content?.map(c => c.text || '').join('') || 'Sorry, I could not respond right now.';
      setMessages(m => [...m, { role: 'bot', text: reply }]);
    } catch {
      setMessages(m => [...m, { role: 'bot', text: 'Oops! Something went wrong. Please try again. 🌿' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button className="chatbot-fab" onClick={() => setOpen(o => !o)} title="GardenAI Chat">
        {open ? '✕' : '🌱'}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span style={{ fontSize: 22 }}>🌱</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>GardenAI</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>Your gardening expert</div>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg ${m.role}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="chatbot-msg bot" style={{ opacity: 0.6 }}>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
                Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="chatbot-input">
            <input
              placeholder="Ask about plant care…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              disabled={loading}
            />
            <button className="chatbot-send" onClick={send} disabled={loading}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
