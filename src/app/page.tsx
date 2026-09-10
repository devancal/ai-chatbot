'use client';

import { FormEvent, useMemo, useState } from 'react';

type Mode = 'general' | 'engineering';
type Message = { role: 'user' | 'assistant'; content: string };

const starters = {
  general: [
    'Help me understand a hard topic',
    'Write or improve something',
    'Brainstorm an idea',
  ],
  engineering: [
    'Solve an engineering problem',
    'Check my design assumptions',
    'Walk through a calculation',
  ],
};

export default function Home() {
  const [mode, setMode] = useState<Mode>('general');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (mode === 'engineering' ? 'Engineering Mode' : 'General Mode'),
    [mode]
  );

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, messages: next }),
      });

      if (!res.ok || !res.body) throw new Error(await res.text());

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      setMessages([...next, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages([...next, { role: 'assistant', content: full }]);
      }
    } catch (err) {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: `Couldn’t connect to the model yet. ${
            err instanceof Error ? err.message : ''
          }`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="mark">A</div>
          <span>Aurum</span>
        </div>

        <button className="newChat" onClick={() => setMessages([])}>
          ＋ New chat
        </button>

        <div className="sideLabel">Chats</div>
        <div className="emptyHistory">Your conversations will appear here.</div>

        <div className="sidebarBottom">
          <button className="ghost">Settings</button>
          <div className="profile">
            <div className="avatar">D</div>
            <div>
              <strong>Guest</strong>
              <span>Local session</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="mainPanel">
        <header className="topbar">
          <div className="modeSwitch">
            <button
              className={mode === 'general' ? 'active' : ''}
              onClick={() => setMode('general')}
            >
              General
            </button>
            <button
              className={mode === 'engineering' ? 'active' : ''}
              onClick={() => setMode('engineering')}
            >
              Engineering
            </button>
          </div>
          <div className="modeBadge">{title}</div>
        </header>

        <div className="conversation">
          {messages.length === 0 ? (
            <div className="hero">
              <div className="heroIcon">A</div>
              <h1>What are we working on?</h1>
              <p>
                {mode === 'engineering'
                  ? 'Engineering-focused reasoning with assumptions, units, verification, and design tradeoffs.'
                  : 'Ask anything. Think, write, build, learn, or figure something out.'}
              </p>

              <div className="starterGrid">
                {starters[mode].map((starter) => (
                  <button key={starter} onClick={() => setInput(starter)}>
                    {starter}
                    <span>↗</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <div className="bubble">
                    {message.content ||
                      (loading && index === messages.length - 1 ? 'Thinking…' : '')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="composerWrap">
          <form className="composer" onSubmit={send}>
            <button type="button" className="attach" aria-label="Attach file">
              ＋
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'engineering'
                  ? 'Ask an engineering question…'
                  : 'Message Aurum…'
              }
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button className="send" disabled={!input.trim() || loading}>
              ↑
            </button>
          </form>
          <div className="disclaimer">
            Aurum can make mistakes. Verify important technical, safety, and engineering information.
          </div>
        </div>
      </section>
    </main>
  );
}
