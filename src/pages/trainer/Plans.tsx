import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../data/store";
import { exerciseCount } from "../../data/selectors";
import { SearchBox, Tabs } from "../../components/ui";
import { fmtDate, fullName } from "../../lib/util";
import { emptyPlan } from "./newPlan";

type Tab = "modelli" | "assegnate";

export function Plans() {
  const { plans, clients, savePlan } = useStore();
  const [tab, setTab] = useState<Tab>("modelli");
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const byId = new Map(clients.map((c) => [c.id, c]));
  const t = q.trim().toLowerCase();
  const list = plans
    .filter((p) => (tab === "modelli" ? !p.clientId : !!p.clientId))
    .filter((p) => !t || `${p.name} ${p.goal} ${p.clientId ? fullName(byId.get(p.clientId) ?? { firstName: "", lastName: "" }) : ""}`.toLowerCase().includes(t))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const create = () => {
    const p = emptyPlan(null);
    savePlan(p);
    nav(`/t/schede/${p.id}`);
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Schede</h1><p className="muted">I modelli si riutilizzano; le schede assegnate appartengono a un cliente.</p></div>
        <button className="btn primary" onClick={create}>Nuovo modello</button>
      </div>
      <Tabs<Tab> value={tab} onChange={setTab} items={[["modelli", "Modelli"], ["assegnate", "Assegnate ai clienti"]]} />
      <div className="row" style={{ marginBottom: 14 }}><SearchBox value={q} onChange={setQ} placeholder="Cerca scheda o cliente" /></div>
      {list.length ? (
        <div className="grid">
          {list.map((p) => {
            const c = p.clientId ? byId.get(p.clientId) : null;
            return (
              <Link key={p.id} to={`/t/schede/${p.id}`} className="card link">
                <div className="row"><h3 className="grow">{p.name}</h3>{p.clientId && (p.active ? <span className="tag ok">Attiva</span> : <span className="tag">Conclusa</span>)}</div>
                {c && <div className="small" style={{ marginTop: 4 }}>{fullName(c)}</div>}
                <div className="muted small" style={{ marginTop: 6 }}>
                  {p.days.length} giorni · {exerciseCount(p)} esercizi{p.goal ? ` · ${p.goal}` : ""}
                </div>
                <div className="muted small">Aggiornata il {fmtDate(p.updatedAt)}</div>
              </Link>
            );
          })}
        </div>
      ) : <p className="empty">{tab === "modelli" ? "Nessun modello. Creane uno per assegnarlo velocemente ai clienti." : "Nessuna scheda assegnata. Assegnala dalla pagina del cliente."}</p>}
    </>
  );
}
