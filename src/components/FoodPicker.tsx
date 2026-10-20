import { useMemo, useState } from "react";
import { useStore } from "../data/store";
import type { ID } from "../data/types";
import { Modal, SearchBox } from "./ui";

export function FoodPicker({ onPick, onClose }: { onPick(id: ID): void; onClose(): void }) {
  const foods = useStore((s) => s.foods);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return foods.filter((f) => !t || f.name.toLowerCase().includes(t) || f.category.includes(t)).sort((a, b) => a.name.localeCompare(b.name));
  }, [foods, q]);
  return (
    <Modal title="Scegli alimento" onClose={onClose}>
      <div className="row" style={{ marginBottom: 12 }}><SearchBox value={q} onChange={setQ} placeholder="Cerca alimento o categoria" /></div>
      {list.map((f) => (
        <button key={f.id} className="pick" onClick={() => onPick(f.id)}>
          <span className="grow"><b>{f.name}</b><span className="muted small" style={{ display: "block" }}>{f.category} · per 100 g: {f.kcal} kcal · P {f.protein} · C {f.carbs} · G {f.fat}</span></span>
        </button>
      ))}
      {!list.length && <p className="empty">Nessun alimento trovato. Puoi aggiungerlo dall'archivio alimenti.</p>}
    </Modal>
  );
}
