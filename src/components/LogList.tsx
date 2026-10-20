import { useState } from "react";
import type { Exercise, ID, WorkoutLog } from "../data/types";
import { volume } from "../data/selectors";
import { fmtDate, fmtDuration } from "../lib/util";
import { Icon } from "./Icon";
import { ask } from "./ui";

/** Diario allenamenti: elenco sessioni espandibili con le serie registrate */
export function LogList({ logs, exMap, onDelete }: { logs: WorkoutLog[]; exMap: Map<ID, Exercise>; onDelete?(id: ID): void }) {
  const [open, setOpen] = useState<ID | null>(null);
  if (!logs.length) return <p className="empty">Nessun allenamento registrato.</p>;
  return (
    <div className="stack" style={{ gap: 8 }}>
      {logs.map((l) => {
        const isOpen = open === l.id;
        const byEx = new Map<string, { name: string; sets: string[] }>();
        l.sets.filter((s) => s.done).forEach((s) => {
          const k = s.itemId;
          if (!byEx.has(k)) byEx.set(k, { name: exMap.get(s.exerciseId)?.name ?? "Esercizio", sets: [] });
          byEx.get(k)!.sets.push(`${s.reps}${s.load ? ` × ${s.load}` : ""}`);
        });
        const vol = volume(l);
        return (
          <div key={l.id} className="card tight">
            <button className="row" style={{ width: "100%", border: 0, background: "none", padding: 0, textAlign: "left" }} onClick={() => setOpen(isOpen ? null : l.id)} aria-expanded={isOpen}>
              <span className="grow">
                <b>{l.dayName}</b> <span className="muted small">· {fmtDate(l.date)}</span><br />
                <span className="muted small">
                  {fmtDuration(l.durationSec)} · {l.sets.filter((s) => s.done).length} serie
                  {vol ? ` · ${Math.round(vol).toLocaleString("it-IT")} kg sollevati` : ""}
                  {l.rpe ? ` · fatica ${l.rpe}/10` : ""}
                </span>
              </span>
              <Icon name={isOpen ? "up" : "down"} size={16} />
            </button>
            {isOpen && (
              <div style={{ marginTop: 10 }}>
                <table className="t">
                  <thead><tr><th>Esercizio</th><th>Serie (rip × carico)</th></tr></thead>
                  <tbody>
                    {[...byEx.values()].map((e, i) => <tr key={i}><td>{e.name}</td><td className="mono small">{e.sets.join("  ·  ")}</td></tr>)}
                  </tbody>
                </table>
                {l.notes && <p className="small" style={{ marginBottom: 0 }}><b>Note:</b> {l.notes}</p>}
                {onDelete && <div className="row end" style={{ marginTop: 8 }}><button className="btn sm ghost danger" onClick={async () => (await ask("Eliminare questo allenamento dal diario?", "Elimina")) && onDelete(l.id)}>Elimina</button></div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
