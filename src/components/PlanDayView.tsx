import { Fragment } from "react";
import type { Exercise, ID, PlanDay } from "../data/types";
import { fmtRest } from "../lib/util";

const GROUP_LABEL = { superset: "Superserie", circuit: "Circuito", single: "" };

/** Vista in sola lettura di un giorno di scheda (area cliente e stampa) */
export function PlanDayView({ day, exMap }: { day: PlanDay; exMap: Map<ID, Exercise> }) {
  return (
    <div className="stack" style={{ gap: 10 }}>
      {day.notes && <p className="muted small" style={{ margin: 0 }}>{day.notes}</p>}
      {day.blocks.map((b, bi) => (
        <div key={b.id} className={`block ${b.type}`}>
          <div style={{ padding: "10px 12px" }}>
            {b.type !== "single" && (
              <div className={`group-label ${b.type}`} style={{ marginBottom: 6 }}>
                {GROUP_LABEL[b.type]} · {b.sets} giri · recupero {fmtRest(b.restSec)}
              </div>
            )}
            {b.items.map((it, ii) => (
              <Fragment key={it.id}>
                <div className="ex-line" style={{ padding: "4px 0" }}>
                  <b className="mono muted" style={{ width: 28 }}>{bi + 1}{b.type !== "single" ? String.fromCharCode(97 + ii) : ""}</b>
                  <span className="grow">{exMap.get(it.exerciseId)?.name ?? "Esercizio rimosso"}</span>
                  <span className="presc">
                    {b.type === "single" ? `${b.sets} × ${it.reps}` : it.reps}
                    {it.load && ` · ${it.load}`}
                    {b.type === "single" && ` · ${fmtRest(b.restSec)}`}
                  </span>
                </div>
                {it.notes && <div className="muted small" style={{ marginLeft: 40 }}>{it.notes}</div>}
              </Fragment>
            ))}
          </div>
        </div>
      ))}
      {!day.blocks.length && <p className="empty">Giorno senza esercizi.</p>}
    </div>
  );
}
