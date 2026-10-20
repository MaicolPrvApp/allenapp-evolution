import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../data/store";
import { activePlanOf, logsOf } from "../../data/selectors";
import { PlanDayView } from "../../components/PlanDayView";
import { Icon } from "../../components/Icon";
import { daysAgo } from "../../lib/util";
import { Link } from "react-router-dom";
import { fmtDayLong, fmtTime } from "../../lib/dates";
import { useMe } from "./useMe";

export function Today() {
  const me = useMe();
  const store = useStore();
  const nav = useNavigate();
  const plan = me ? activePlanOf(store, me.id) : undefined;
  const logs = me ? logsOf(store, me.id) : [];
  // giorno consigliato: quello dopo l'ultimo svolto
  const lastIdx = plan ? plan.days.findIndex((d) => d.id === logs.find((l) => l.planId === plan.id)?.dayId) : -1;
  const suggested = plan && plan.days.length ? (lastIdx + 1) % plan.days.length : 0;
  const [sel, setSel] = useState<number | null>(null);
  const di = sel ?? suggested;

  if (!me) return <p className="empty">Non ci sono ancora clienti.</p>;
  const exMap = new Map(store.exercises.map((e) => [e.id, e]));

  return (
    <>
      <div className="page-head">
        <div><h1>Ciao {me.firstName}</h1><p className="muted">{logs[0] ? `Ultimo allenamento ${daysAgo(logs[0].date)}.` : "Pronto per il primo allenamento?"}</p></div>
      </div>
      {(() => {
        const next = store.appointments.filter((a) => a.clientId === me.id && a.status !== "annullato" && new Date(a.start) >= new Date()).sort((a, b) => a.start.localeCompare(b.start))[0];
        const unread = store.messages.filter((m) => m.clientId === me.id && m.from === "trainer" && !m.read).length;
        return (next || unread > 0) && (
          <div className="row" style={{ marginBottom: 16 }}>
            {next && <Link to="/c/agenda" className="card link tight grow"><span className="muted small">Prossimo appuntamento</span><br /><b style={{ textTransform: "capitalize" }}>{fmtDayLong(new Date(next.start))} · {fmtTime(next.start)}</b> <span className="muted small">{next.type}{next.status === "richiesto" ? " · da confermare" : ""}</span></Link>}
            {unread > 0 && <Link to="/c/messaggi" className="card link tight"><span className="badge">{unread}</span> <b>nuovi messaggi</b></Link>}
          </div>
        );
      })()}
      {!plan ? (
        <p className="empty">Il tuo trainer non ti ha ancora assegnato una scheda.</p>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <h2>{plan.name}</h2>
            {plan.description && <p className="muted" style={{ marginBottom: 0 }}>{plan.description}</p>}
          </div>
          <div className="day-tabs">
            {plan.days.map((d, i) => (
              <button key={d.id} aria-pressed={i === di} onClick={() => setSel(i)}>
                {d.name}{i === suggested ? " · oggi" : ""}
              </button>
            ))}
          </div>
          {plan.days[di] && (
            <>
              <PlanDayView day={plan.days[di]} exMap={exMap} />
              <div className="row" style={{ marginTop: 18 }}>
                <button className="btn primary big grow" disabled={!plan.days[di].blocks.length} onClick={() => nav(`/c/sessione/${plan.id}/${plan.days[di].id}`)}>
                  <Icon name="play" />Inizia {plan.days[di].name}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
