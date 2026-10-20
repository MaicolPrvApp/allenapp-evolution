import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../../data/store";
import { activePlanOf, lastLogOf } from "../../data/selectors";
import type { Client } from "../../data/types";
import { Modal, SearchBox, toast, useDraft } from "../../components/ui";
import { ClientFields } from "../../components/ClientForm";
import { daysAgo, fullName, initials, nowIso, uid } from "../../lib/util";

export const emptyClient = (): Client => ({
  id: uid(), firstName: "", lastName: "", email: "", phone: "", birthDate: "", sex: "",
  goal: "", level: "principiante", notes: "", active: true, createdAt: nowIso(),
});

export function Clients() {
  const { clients, plans, logs, saveClient } = useStore();
  const [q, setQ] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [params, setParams] = useSearchParams();
  const creating = params.get("nuovo") === "1";
  const nav = useNavigate();

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return clients
      .filter((c) => (showInactive || c.active) && (!t || `${fullName(c)} ${c.email} ${c.goal}`.toLowerCase().includes(t)))
      .sort((a, b) => fullName(a).localeCompare(fullName(b)));
  }, [clients, q, showInactive]);

  return (
    <>
      <div className="page-head">
        <div><h1>Clienti</h1><p className="muted">{clients.filter((c) => c.active).length} attivi</p></div>
        <button className="btn primary" onClick={() => setParams({ nuovo: "1" })}>Nuovo cliente</button>
      </div>
      <div className="row" style={{ marginBottom: 14 }}>
        <SearchBox value={q} onChange={setQ} placeholder="Cerca per nome, email, obiettivo" />
        <label className="check small"><input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />Mostra archiviati</label>
      </div>
      {list.length ? (
        <div className="grid">
          {list.map((c) => {
            const p = activePlanOf({ plans }, c.id), l = lastLogOf({ logs }, c.id);
            return (
              <Link key={c.id} to={`/t/clienti/${c.id}`} className="card link">
                <div className="row" style={{ flexWrap: "nowrap" }}>
                  <span className="avatar">{initials(c)}</span>
                  <div className="grow">
                    <h3>{fullName(c)}</h3>
                    <div className="muted small">{c.goal || "Obiettivo non indicato"}</div>
                  </div>
                  {!c.active && <span className="tag">Archiviato</span>}
                </div>
                <div className="row small" style={{ marginTop: 12 }}>
                  {p ? <span className="tag accent">{p.name}</span> : <span className="tag warn">Senza scheda</span>}
                  <span className="muted">{l ? `Ultimo allenamento ${daysAgo(l.date)}` : "Nessun allenamento"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : <p className="empty">{clients.length ? "Nessun cliente corrisponde alla ricerca." : "Aggiungi il tuo primo cliente."}</p>}

      {creating && <NewClient onClose={() => setParams({})} onSave={(c) => { saveClient(c); toast("Cliente aggiunto"); nav(`/t/clienti/${c.id}?tab=schede`); }} />}
    </>
  );
}

function NewClient({ onClose, onSave }: { onClose(): void; onSave(c: Client): void }) {
  const [c, set] = useDraft(emptyClient());
  return (
    <Modal title="Nuovo cliente" onClose={onClose} footer={<>
      <button className="btn ghost" onClick={onClose}>Annulla</button>
      <button className="btn primary" disabled={!c.firstName.trim()} onClick={() => onSave(c)}>Salva cliente</button>
    </>}>
      <ClientFields c={c} set={set} />
    </Modal>
  );
}
