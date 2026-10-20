import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../data/store";
import { activePlanOf, logsOf } from "../../data/selectors";
import { PlanDayView } from "../../components/PlanDayView";
import { Icon } from "../../components/Icon";
import { daysAgo } from "../../lib/util";
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
