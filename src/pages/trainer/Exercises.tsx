import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../data/store";
import { EQUIPMENT, MUSCLES } from "../../data/exerciseLibrary";
import type { Equipment, MuscleGroup } from "../../data/types";
import { MuscleThumb, SearchBox } from "../../components/ui";
import { uid } from "../../lib/util";

export function Exercises() {
  const { exercises, saveExercise } = useStore();
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "">("");
  const [eq, setEq] = useState<Equipment | "">("");
  const [mine, setMine] = useState(false);
  const nav = useNavigate();

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return exercises
      .filter((e) => (!muscle || e.muscle === muscle || e.secondary.includes(muscle)) && (!eq || e.equipment === eq) && (!mine || e.custom) && (!t || e.name.toLowerCase().includes(t)))
      .sort((a, b) => MUSCLES.indexOf(a.muscle) - MUSCLES.indexOf(b.muscle) || a.name.localeCompare(b.name));
  }, [exercises, q, muscle, eq, mine]);

  const create = () => {
    const id = uid();
    saveExercise({ id, name: "Nuovo esercizio", muscle: muscle || "petto", secondary: [], equipment: eq || "corpo libero", description: "", videoUrl: "", custom: true });
    nav(`/t/esercizi/${id}`);
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Esercizi</h1><p className="muted">{exercises.length} esercizi in archivio, {exercises.filter((e) => e.custom).length} creati da te.</p></div>
        <button className="btn primary" onClick={create}>Nuovo esercizio</button>
      </div>
      <div className="row" style={{ marginBottom: 14 }}>
        <SearchBox value={q} onChange={setQ} placeholder="Cerca esercizio" />
        <select className="input" style={{ width: "auto" }} value={muscle} onChange={(e) => setMuscle(e.target.value as MuscleGroup)} aria-label="Distretto">
          <option value="">Tutti i distretti</option>{MUSCLES.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select className="input" style={{ width: "auto" }} value={eq} onChange={(e) => setEq(e.target.value as Equipment)} aria-label="Attrezzo">
          <option value="">Tutti gli attrezzi</option>{EQUIPMENT.map((m) => <option key={m}>{m}</option>)}
        </select>
        <label className="check small"><input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} />Solo i miei</label>
      </div>
      {list.length ? (
        <div className="grid">
          {list.map((e) => (
            <Link key={e.id} to={`/t/esercizi/${e.id}`} className="card link tight ex-card">
              <MuscleThumb muscle={e.muscle} />
              <div className="grow" style={{ minWidth: 0 }}>
                <b>{e.name}</b>
                <div className="muted small">{e.muscle} · {e.equipment}{e.videoUrl ? " · video" : ""}</div>
              </div>
              {e.custom && <span className="tag accent">Mio</span>}
            </Link>
          ))}
        </div>
      ) : <p className="empty">Nessun esercizio trovato.</p>}
    </>
  );
}
