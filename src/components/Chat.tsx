import { useEffect, useRef, useState } from "react";
import { useStore } from "../data/store";
import type { ID, Message } from "../data/types";
import { fmtTime } from "../lib/dates";

/** Conversazione tra trainer e un cliente, vista da uno dei due lati */
export function Chat({ clientId, me }: { clientId: ID; me: Message["from"] }) {
  const all = useStore((s) => s.messages);
  const { sendMessage, markRead } = useStore();
  const list = all.filter((m) => m.clientId === clientId).sort((a, b) => a.date.localeCompare(b.date));
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const unread = list.some((m) => m.from !== me && !m.read);

  useEffect(() => { if (unread) markRead(clientId, me); }, [unread, clientId, me, markRead]);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [list.length]);

  let lastDay = "";
  return (
    <div className="chat card">
      <div className="chat-list">
        {list.map((m) => {
          const day = new Date(m.date).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
          const sep = day !== lastDay ? (lastDay = day) : null;
          return (
            <div key={m.id}>
              {sep && <div className="chat-day">{sep}</div>}
              <div className={`bubble ${m.from === me ? "mine" : ""}`}>
                {m.text}
                <span className="bubble-time">{fmtTime(m.date)}</span>
              </div>
            </div>
          );
        })}
        {!list.length && <p className="muted small" style={{ textAlign: "center" }}>Nessun messaggio. Scrivi il primo.</p>}
        <div ref={end} />
      </div>
      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { sendMessage(clientId, me, text.trim()); setText(""); } }}>
        <input className="input grow" value={text} onChange={(e) => setText(e.target.value)} placeholder="Scrivi un messaggio" aria-label="Messaggio" />
        <button className="btn primary" disabled={!text.trim()}>Invia</button>
      </form>
    </div>
  );
}
