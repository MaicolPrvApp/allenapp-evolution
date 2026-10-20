import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../data/store";
import type { Client } from "../../data/types";
import { MacroSummary } from "../../components/MacroSummary";
import { FoodDiary } from "../../components/FoodDiary";
import { Icon } from "../../components/Icon";
import { Modal, toast } from "../../components/ui";
import { planMacros } from "../../lib/nutrition";
import { fmtDate } from "../../lib/util";
import { emptyMealPlan } from "./Nutrition";

export function ClientNutrition({ client }: { client: Client }) {
  const store = useStore();
  const nav = useNavigate();
  const [pick, setPick] = useState(false);
  const foodMap = useMemo(() => new Map(store.foods.map((f) => [f.id, f])), [store.foods]);
  const list = store.mealPlans.filter((p) => p.clientId === client.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const templates = store.mealPlans.filter((p) => !p.clientId);

  return (
    <>
      <div className="row" style={{ marginBottom: 14 }}>
        <button className="btn primary" onClick={() => setPick(true)}>Assegna da modello</button>
        <button className="btn" onClick={() => { const p = emptyMealPlan(client.id); store.save("mealPlans", p); nav(`/t/alimentazione/${p.id}`); }}>Crea piano da zero</button>
      </div>
      {list.length ? (
        <div className="stack">
          {list.map((p) => (
            <div key={p.id} className="card row">
              <div className="grow">
                <div className="row"><h3>{p.name}</h3>{p.active ? <span className="tag ok">Attivo</span> : <span className="tag">Concluso</span>}</div>
                <MacroSummary m={planMacros(p, foodMap)} compact />
                <div className="muted small">Creato il {fmtDate(p.createdAt)}</div>
              </div>
              <button className="btn sm" onClick={() => store.save("mealPlans", { ...p, active: !p.active })}>{p.active ? "Concludi" : "Riattiva"}</button>
              <Link className="btn sm primary" to={`/t/alimentazione/${p.id}`}>Apri</Link>
            </div>
          ))}
        </div>
      ) : <p className="empty">Nessun piano alimentare assegnato.</p>}
      <h2 style={{ margin: "24px 0 12px" }}>Diario alimentare</h2>
      <FoodDiary clientId={client.id} editable={false} />
      {pick && (
        <Modal title="Scegli un modello" onClose={() => setPick(false)}>
          {templates.length ? templates.map((t) => (
            <button key={t.id} className="pick" onClick={() => { const nid = store.duplicateMealPlan(t.id, client.id); setPick(false); toast("Piano assegnato"); nav(`/t/alimentazione/${nid}`); }}>
              <span className="grow"><b>{t.name}</b><span style={{ display: "block" }}><MacroSummary m={planMacros(t, foodMap)} compact /></span></span><Icon name="plus" />
            </button>
          )) : <p className="empty">Non hai ancora modelli. Creane uno dalla sezione Alimentazione.</p>}
        </Modal>
      )}
    </>
  );
}
