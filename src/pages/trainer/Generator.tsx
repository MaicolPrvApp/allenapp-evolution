import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../data/store";
import type { ID, Level } from "../../data/types";
import { PlanDayView } from "../../components/PlanDayView";
import { toast } from "../../components/ui";
import { generatePlan, type GenInput, type Goal, type Place } from "../../lib/generator";
import { fullName, today } from "../../lib/util";

const GOALS: [Goal, string][] = [["ipertrofia", "Ipertrofia"], ["forza", "Forza"], ["tonificazione", "Tonificazione"], ["dimagrimento", "Dimagrimento"], ["condizionamento", "Condizionamento"]];

export function Generator() {
  const { exercises, clients, savePlan } = useStore();
  const nav = useNavigate();
  const [input, setInput] = useState<GenInput>({ goal: "ipertrofia", level: "intermedio", days: 3, place: "palestra", minutes: 60, seed: 1 });
  const [clientId, setClientId] = useState<ID | "">("");
  const plan = useMemo(() => generatePlan(input, exercises), [input, exercises]);
  const exMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const set = <K extends keyof GenInput>(k: K, v: GenInput[K]) => setInput((i) => ({ ...i, [k]: v }));
  const chip = <T extends string | number>(value: T, cur: T, label: string, on: (v: T) => void) => (
    <button key={String(value)} aria-pressed={value === cur} onClick={() => on(value)}>{label}</button>
  );

  const keep = () => {
    const p = { ...plan, clientId: clientId || null, startDate: clientId ? today() : "" };
    savePlan(p);
    toast(clientId ? "Scheda assegnata" : "Salvata tra i modelli");
    nav(`/t/schede/${p.id}`);
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Generatore schede</h1><p className="muted">Scegli obiettivo, livello e disponibilità: la scheda si compone da sola e puoi rifinirla nell'editor.</p></div>
      </div>
      <div className="card stack" style={{ gap: 14 }}>
        <div className="field"><span>Obiettivo</span><div className="day-tabs" style={{ margin: 0 }}>{GOALS.map(([g, l]) => chip(g, input.goal, l, (v) => set("goal", v)))}</div></div>
        <div className="field"><span>Livello</span><div className="day-tabs" style={{ margin: 0 }}>{(["principiante", "intermedio", "avanzato"] as Level[]).map((l) => chip(l, input.level, l[0].toUpperCase() + l.slice(1), (v) => set("level", v)))}</div></div>
        <div className="field"><span>Giorni a settimana</span><div className="day-tabs" style={{ margin: 0 }}>{([2, 3, 4, 5] as const).map((d) => chip(d, input.days, `${d} giorni`, (v) => set("days", v)))}</div></div>
        <div className="field"><span>Dove si allena</span><div className="day-tabs" style={{ margin: 0 }}>{(["palestra", "casa", "corpo libero"] as Place[]).map((p) => chip(p, input.place, p === "casa" ? "Casa (manubri, elastici)" : p[0].toUpperCase() + p.slice(1), (v) => set("place", v)))}</div></div>
        <div className="field"><span>Durata della seduta</span><div className="day-tabs" style={{ margin: 0 }}>{([30, 45, 60, 75] as const).map((m) => chip(m, input.minutes, `${m} min`, (v) => set("minutes", v)))}</div></div>
      </div>

      <div className="section">
        <div className="row" style={{ marginBottom: 12 }}>
          <h2 className="grow">{plan.name}</h2>
          <button className="btn" onClick={() => set("seed", input.seed + 1)}>Genera un'altra variante</button>
        </div>
        <p className="muted small" style={{ marginTop: 0 }}>{plan.description}</p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "start" }}>
          {plan.days.map((d) => (
            <div key={d.id}>
              <h3 style={{ marginBottom: 8 }}>{d.name}</h3>
              <PlanDayView day={{ ...d, notes: "" }} exMap={exMap} />
            </div>
          ))}
        </div>
        <div className="card row section">
          <label className="field grow" style={{ minWidth: 220 }}><span>Destinazione</span>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Salva come modello</option>
              {clients.filter((c) => c.active).map((c) => <option key={c.id} value={c.id}>Assegna a {fullName(c)}</option>)}
            </select>
          </label>
          <button className="btn primary big" style={{ alignSelf: "end" }} onClick={keep}>Salva e apri nell'editor</button>
        </div>
      </div>
    </>
  );
}
