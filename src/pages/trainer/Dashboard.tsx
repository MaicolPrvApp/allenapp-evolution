import { Link } from "react-router-dom";
import { useStore } from "../../data/store";
import { activePlanOf, lastLogOf } from "../../data/selectors";
import { AppointmentCard } from "../../components/AppointmentCard";
import { sameDay } from "../../lib/dates";
import { daysAgo, fmtDuration, fullName, initials } from "../../lib/util";

export function Dashboard() {
  const { clients, plans, logs, appointments, messages, anamneses } = useStore();
  const active = clients.filter((c) => c.active);
  const weekAgo = Date.now() - 7 * 86400000;
  const recent = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const week = logs.filter((l) => new Date(l.date).getTime() > weekAgo).length;
  const noPlan = active.filter((c) => !activePlanOf({ plans }, c.id));
  const idle = active.filter((c) => {
    const l = lastLogOf({ logs }, c.id);
    return activePlanOf({ plans }, c.id) && (!l || new Date(l.date).getTime() < weekAgo);
  });
  const byId = new Map(clients.map((c) => [c.id, c]));
  const todayList = appointments.filter((a) => sameDay(new Date(a.start), new Date()) && a.status !== "annullato").sort((a, b) => a.start.localeCompare(b.start));
  const requests = appointments.filter((a) => a.status === "richiesto" && new Date(a.start) >= new Date()).length;
  const unread = messages.filter((m) => m.from === "client" && !m.read).length;
  const certs = anamneses.filter((a) => a.medicalCertificateExpiry && byId.get(a.clientId)?.active)
    .map((a) => ({ c: byId.get(a.clientId)!, days: Math.ceil((new Date(a.medicalCertificateExpiry).getTime() - Date.now()) / 86400000) }))
    .filter((x) => x.days < 30);
  const link = { color: "inherit", textDecoration: "none" };

  return (
    <>
      <div className="page-head">
        <div><h1>Panoramica</h1><p className="muted">Come stanno andando i tuoi clienti.</p></div>
        <Link className="btn primary" to="/t/clienti?nuovo=1">Nuovo cliente</Link>
      </div>
      <div className="grid kpi">
        <div className="card"><div className="kpi-val">{active.length}</div><div className="kpi-lbl">Clienti attivi</div></div>
        <div className="card"><div className="kpi-val">{todayList.filter((a) => a.status !== "libero").length}</div><div className="kpi-lbl">Appuntamenti oggi</div></div>
        <div className="card"><div className="kpi-val">{week}</div><div className="kpi-lbl">Allenamenti in 7 giorni</div></div>
        <Link to="/t/messaggi" className="card link"><div className="kpi-val">{unread}</div><div className="kpi-lbl">Messaggi da leggere</div></Link>
      </div>

      <div className="section">
        <div className="row" style={{ marginBottom: 12 }}><h2 className="grow">Oggi</h2><Link to="/t/agenda" className="btn sm">Apri agenda{requests ? ` · ${requests} richieste` : ""}</Link></div>
        {todayList.length ? <div className="stack" style={{ gap: 8 }}>{todayList.map((a) => <AppointmentCard key={a.id} a={a} client={a.clientId ? byId.get(a.clientId) : undefined} />)}</div>
          : <p className="empty">Nessun appuntamento oggi.</p>}
      </div>

      {(noPlan.length > 0 || idle.length > 0 || certs.length > 0) && (
        <div className="section">
          <h2>Da seguire</h2>
          <div className="card list">
            {noPlan.map((c) => (
              <Link key={c.id} to={`/t/clienti/${c.id}?tab=schede`} className="row" style={link}>
                <span className="avatar">{initials(c)}</span>
                <span className="grow"><b>{fullName(c)}</b><br /><span className="muted small">Nessuna scheda assegnata</span></span>
                <span className="tag warn">Assegna scheda</span>
              </Link>
            ))}
            {idle.map((c) => {
              const l = lastLogOf({ logs }, c.id);
              return (
                <Link key={c.id} to={`/t/clienti/${c.id}?tab=diario`} className="row" style={link}>
                  <span className="avatar">{initials(c)}</span>
                  <span className="grow"><b>{fullName(c)}</b><br /><span className="muted small">{l ? `Ultimo allenamento ${daysAgo(l.date)}` : "Non ha ancora iniziato la scheda"}</span></span>
                  <span className="tag">Inattivo</span>
                </Link>
              );
            })}
            {certs.map(({ c, days }) => (
              <Link key={c.id} to={`/t/clienti/${c.id}?tab=anamnesi`} className="row" style={link}>
                <span className="avatar">{initials(c)}</span>
                <span className="grow"><b>{fullName(c)}</b><br /><span className="muted small">{days < 0 ? "Certificato medico scaduto" : `Certificato medico in scadenza tra ${days} giorni`}</span></span>
                <span className="tag warn">Certificato</span>
              </Link>
            ))}
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
                <Link key={l.id} to={`/t/clienti/${l.clientId}?tab=diario`} className="row" style={link}>
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
