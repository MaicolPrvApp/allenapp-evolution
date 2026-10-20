import { useMemo, useState } from "react";
import { useStore } from "../../data/store";
import { logsOf, volume } from "../../data/selectors";
import { LineChart } from "../../components/ui";
import { num } from "../../lib/util";
import { analyze } from "../../lib/body";
import { useMe } from "./useMe";

const short = (iso: string) => new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short" });

export function Progress() {
  const me = useMe();
  const store = useStore();
  const logs = useMemo(() => (me ? logsOf(store, me.id).slice().reverse() : []), [store, me]);
  const exMap = new Map(store.exercises.map((e) => [e.id, e]));

  // esercizi con almeno un carico numerico registrato
  const exIds = useMemo(() => {
    const count = new Map<string, number>();
    logs.forEach((l) => new Set(l.sets.filter((s) => s.done && !isNaN(num(s.load))).map((s) => s.exerciseId)).forEach((id) => count.set(id, (count.get(id) ?? 0) + 1)));
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  }, [logs]);
  const [exId, setExId] = useState<string>("");
  const cur = exId || exIds[0] || "";

  if (!me) return <p className="empty">Non ci sono ancora clienti.</p>;
  const body = store.assessments.filter((a) => a.clientId === me.id).sort((a, b) => a.date.localeCompare(b.date))
    .map((a) => ({ date: a.date, weight: a.weight, bf: analyze(a, me.sex, me.birthDate).bodyFat }));

  const loadPoints = logs.flatMap((l) => {
    const loads = l.sets.filter((s) => s.done && s.exerciseId === cur).map((s) => num(s.load)).filter((n) => !isNaN(n));
    return loads.length ? [{ label: short(l.date), value: Math.max(...loads) }] : [];
  });
  const volPoints = logs.map((l) => ({ label: short(l.date), value: Math.round(volume(l)) })).filter((p) => p.value > 0);
  const month = logs.filter((l) => new Date(l.date).getMonth() === new Date().getMonth() && new Date(l.date).getFullYear() === new Date().getFullYear()).length;
  const best = loadPoints.length ? Math.max(...loadPoints.map((p) => p.value)) : null;

  return (
    <>
      <div className="page-head"><div><h1>Progressi</h1><p className="muted">Carichi, peso e composizione corporea nel tempo.</p></div></div>
      <div className="grid kpi">
        <div className="card"><div className="kpi-val">{logs.length}</div><div className="kpi-lbl">Allenamenti totali</div></div>
        <div className="card"><div className="kpi-val">{month}</div><div className="kpi-lbl">Questo mese</div></div>
        <div className="card"><div className="kpi-val">{best ?? "—"}{best !== null && <small style={{ fontSize: 18 }}> kg</small>}</div><div className="kpi-lbl">Record esercizio scelto</div></div>
      </div>
      <div className="card section">
        <div className="row" style={{ marginBottom: 10 }}>
          <h2 className="grow">Carico massimo</h2>
          {exIds.length > 0 && (
            <select className="input" style={{ width: "auto" }} value={cur} onChange={(e) => setExId(e.target.value)} aria-label="Esercizio">
              {exIds.map((id) => <option key={id} value={id}>{exMap.get(id)?.name ?? "Esercizio"}</option>)}
            </select>
          )}
        </div>
        {exIds.length ? <LineChart points={loadPoints} unit=" kg" /> : <p className="muted small">Registra i carichi durante l'allenamento per vedere l'andamento.</p>}
      </div>
      {body.length > 0 && (
        <div className="grid section" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <div className="card"><h2 style={{ marginBottom: 10 }}>Peso (kg)</h2><LineChart points={body.filter((b) => b.weight !== null).map((b) => ({ label: short(b.date), value: b.weight! }))} unit=" kg" /></div>
          <div className="card"><h2 style={{ marginBottom: 10 }}>Massa grassa (%)</h2><LineChart points={body.filter((b) => b.bf !== null).map((b) => ({ label: short(b.date), value: Math.round(b.bf! * 10) / 10 }))} unit=" %" /></div>
        </div>
      )}
      <div className="card section">
        <h2 style={{ marginBottom: 10 }}>Volume per allenamento (kg)</h2>
        <LineChart points={volPoints} unit=" kg" />
      </div>
    </>
  );
}
