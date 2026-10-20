import { Link } from "react-router-dom";
import { useStore } from "../../data/store";
import { activePlanOf, lastLogOf } from "../../data/selectors";
import { daysAgo, fmtDuration, fullName, initials } from "../../lib/util";

export function Dashboard() {
  const { clients, plans, logs } = useStore();
  const active = clients.filter((c) => c.active);
  const weekAgo = Date.now() - 7 * 86400000;
  const recent = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const week = logs.filter((l) => new Date(l.date).getTime() > weekAgo).length;
  const noPlan = active.filter((c) => !activePlanOf({ plans }, c.id));
  const idle = active.filter((c) => {
    const l = lastLogOf({ logs }, c.id);
    return activePlanOf({ plans }, c.id) && (!l || new Date(l.date).getTime() < weekAgo);
  });
  const byId = new Map(clients.map((c) => [c.id, c]));

  return (
    <>
      <div className="page-head">
        <div><h1>Panoramica</h1><p className="muted">Come stanno andando i tuoi clienti.</p></div>
        <Link className="btn primary" to="/t/clienti?nuovo=1">Nuovo cliente</Link>
      </div>
      <div className="grid kpi">
        <div className="card"><div className="kpi-val">{active.length}</div><div className="kpi-lbl">Clienti attivi</div></div>
        <div className="card"><div className="kpi-val">{plans.filter((p) => p.clientId && p.active).length}</div><div className="kpi-lbl">Schede in corso</div></div>
        <div className="card"><div className="kpi-val">{week}</div><div className="kpi-lbl">Allenamenti in 7 giorni</div></div>
        <div className="card"><div className="kpi-val">{plans.filter((p) => !p.clientId).length}</div><div className="kpi-lbl">Modelli di scheda</div></div>
      </div>

      {(noPlan.length > 0 || idle.length > 0) && (
        <div className="section">
          <h2>Da seguire</h2>
          <div className="card list">
            {noPlan.map((c) => (
              <Link key={c.id} to={`/t/clienti/${c.id}?tab=schede`} className="row" style={{ color: "inherit", textDecoration: "none" }}>
                <span className="avatar">{initials(c)}</span>
                <span className="grow"><b>{fullName(c)}</b><br /><span className="muted small">Nessuna scheda assegnata</span></span>
                <span className="tag warn">Assegna scheda</span>
              </Link>
            ))}
            {idle.map((c) => {
              const l = lastLogOf({ logs }, c.id);
              return (
                <Link key={c.id} to={`/t/clienti/${c.id}?tab=diario`} className="row" style={{ color: "inherit", textDecoration: "none" }}>
                  <span className="avatar">{initials(c)}</span>
                  <span className="grow"><b>{fullName(c)}</b><br /><span className="muted small">{l ? `Ultimo allenamento ${daysAgo(l.date)}` : "Non ha ancora iniziato la scheda"}</span></span>
                  <span className="tag">Inattivo</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="section">
        <h2>Ultimi allenamenti</h2>
        {recent.length ? (
          <div className="card list">
            {recent.map((l) => {
              const c = byId.get(l.clientId);
              return (
                <Link key={l.id} to={`/t/clienti/${l.clientId}?tab=diario`} className="row" style={{ color: "inherit", textDecoration: "none" }}>
                  <span className="avatar">{c ? initials(c) : "?"}</span>
                  <span className="grow"><b>{c ? fullName(c) : "Cliente rimosso"}</b><br /><span className="muted small">{l.dayName} · {fmtDuration(l.durationSec)}{l.rpe ? ` · fatica ${l.rpe}/10` : ""}</span></span>
                  <span className="muted small">{daysAgo(l.date)}</span>
                </Link>
              );
            })}
          </div>
        ) : <p className="empty">Nessun allenamento registrato.</p>}
      </div>
    </>
  );
}
