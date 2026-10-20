import { useMemo, useState } from "react";
import { useStore } from "../data/store";
import { MUSCLES } from "../data/exerciseLibrary";
import type { ID, MuscleGroup } from "../data/types";
import { Modal, MuscleThumb, SearchBox } from "./ui";

/** Selezione di uno o più esercizi dall'archivio */
export function ExercisePicker({ onPick, onClose, multi = true }: { onPick(ids: ID[]): void; onClose(): void; multi?: boolean }) {
  const exercises = useStore((s) => s.exercises);
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "">("");
  const [sel, setSel] = useState<ID[]>([]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return exercises
      .filter((e) => (!muscle || e.muscle === muscle) && (!t || e.name.toLowerCase().includes(t)))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, q, muscle]);

  const toggle = (id: ID) => {
    if (!multi) return onPick([id]);
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  return (
    <Modal
      title="Scegli esercizi"
      onClose={onClose}
      footer={multi && (
        <>
          <span className="muted small grow">{sel.length ? `${sel.length} selezionati` : "Tocca per selezionare"}</span>
          <button className="btn primary" disabled={!sel.length} onClick={() => onPick(sel)}>Aggiungi</button>
        </>
      )}
    >
      <div className="row" style={{ marginBottom: 12 }}>
        <SearchBox value={q} onChange={setQ} placeholder="Cerca esercizio" />
        <select className="input" style={{ width: "auto" }} value={muscle} onChange={(e) => setMuscle(e.target.value as MuscleGroup)} aria-label="Distretto">
          <option value="">Tutti i distretti</option>
          {MUSCLES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      {list.map((e) => (
        <button key={e.id} className="pick" aria-pressed={sel.includes(e.id)} onClick={() => toggle(e.id)}>
          <MuscleThumb muscle={e.muscle} />
          <span className="grow">
            <b>{e.name}</b>
            <span className="muted small" style={{ display: "block" }}>{e.muscle} · {e.equipment}</span>
          </span>
          {sel.includes(e.id) && <span className="tag accent">{sel.indexOf(e.id) + 1}</span>}
        </button>
      ))}
      {!list.length && <p className="empty">Nessun esercizio trovato.</p>}
    </Modal>
  );
}
