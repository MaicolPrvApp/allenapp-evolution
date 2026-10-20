import { useSearchParams } from "react-router-dom";
import { useStore } from "../../data/store";
import { Chat } from "../../components/Chat";
import { daysAgo, fullName, initials } from "../../lib/util";

export function Messages() {
  const { clients, messages } = useStore();
  const [params, setParams] = useSearchParams();
  const active = clients.filter((c) => c.active);
  const convs = active.map((c) => {
    const list = messages.filter((m) => m.clientId === c.id).sort((a, b) => b.date.localeCompare(a.date));
    return { c, last: list[0], unread: list.filter((m) => m.from === "client" && !m.read).length };
  }).sort((a, b) => (b.last?.date ?? "").localeCompare(a.last?.date ?? ""));
  const sel = params.get("c") ?? convs[0]?.c.id;
  const selClient = clients.find((c) => c.id === sel);

  return (
    <>
      <div className="page-head"><div><h1>Messaggi</h1><p className="muted">Comunica con i tuoi clienti direttamente nell'app.</p></div></div>
      <div className="conv-layout">
        <div className="card list" style={{ padding: "4px 12px" }}>
          {convs.map(({ c, last, unread }) => (
            <button key={c.id} className="pick" aria-pressed={c.id === sel} onClick={() => setParams({ c: c.id })} style={{ borderRadius: 10, padding: 8 }}>
              <span className="avatar">{initials(c)}</span>
              <span className="grow" style={{ minWidth: 0 }}>
                <b>{fullName(c)}</b>
                <span className="muted small" style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{last ? last.text : "Nessun messaggio"}</span>
              </span>
              {unread > 0 ? <span className="badge">{unread}</span> : last && <span className="muted small">{daysAgo(last.date)}</span>}
            </button>
          ))}
        </div>
        {selClient ? (
          <div>
            <h2 style={{ marginBottom: 10 }}>{fullName(selClient)}</h2>
            <Chat key={selClient.id} clientId={selClient.id} me="trainer" />
          </div>
        ) : <p className="empty">Nessun cliente attivo.</p>}
      </div>
    </>
  );
}
