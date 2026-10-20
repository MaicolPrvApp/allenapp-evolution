import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../data/store";
import type { ID, MealPlan } from "../../data/types";
import { FoodPicker } from "../../components/FoodPicker";
import { MacroSummary } from "../../components/MacroSummary";
import { Icon } from "../../components/Icon";
import { Modal, ask, toast } from "../../components/ui";
import { itemMacros, mealMacros, planMacros } from "../../lib/nutrition";
import { fullName, uid } from "../../lib/util";

// Editor piano alimentare: ogni modifica viene salvata subito, i totali si aggiornano dal vivo.

export function MealPlanEditor() {
  const { id } = useParams();
  const store = useStore();
  const plan = store.mealPlans.find((p) => p.id === id);
  const nav = useNavigate();
  const foodMap = useMemo(() => new Map(store.foods.map((f) => [f.id, f])), [store.foods]);
  const [pickFor, setPickFor] = useState<ID | null>(null);
  const [assign, setAssign] = useState(false);
  if (!plan) return <p className="empty">Piano non trovato. <Link to="/t/alimentazione">Torna all'alimentazione</Link></p>;
  const client = plan.clientId ? store.clients.find((c) => c.id === plan.clientId) : null;
  const backTo = client ? `/t/clienti/${client.id}?tab=alimentazione` : "/t/alimentazione";
  const up = (fn: (p: MealPlan) => void) => { const p = structuredClone(plan); fn(p); p.updatedAt = new Date().toISOString(); store.save("mealPlans", p); };
  const total = planMacros(plan, foodMap);

  return (
    <>
      <Link to={backTo} className="back"><Icon name="back" size={16} />{client ? fullName(client) : "Alimentazione"}</Link>
      <div className="page-head">
        <div>
          <input className="input" style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, textTransform: "uppercase", padding: "4px 8px", background: "transparent", borderColor: "transparent" }}
            value={plan.name} onChange={(e) => up((p) => (p.name = e.target.value))} aria-label="Nome piano" />
          <p className="muted" style={{ paddingLeft: 8 }}>{client ? <>Assegnato a <b>{fullName(client)}</b></> : "Modello riutilizzabile"}</p>
        </div>
        <div className="row">
          <button className="btn" onClick={() => setAssign(true)}><Icon name="copy" size={18} />{client ? "Duplica" : "Assegna a cliente"}</button>
          <button className="btn ghost danger icon" aria-label="Elimina piano" onClick={async () => { if (await ask("Eliminare questo piano alimentare?", "Elimina")) { store.remove("mealPlans", plan.id); nav(backTo); } }}><Icon name="trash" /></button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <MacroSummary m={total} target={plan.targetKcal} />
        <div className="form-grid" style={{ marginTop: 14 }}>
          <label className="field"><span>Obiettivo calorico (kcal)</span><input inputMode="numeric" value={plan.targetKcal ?? ""} onChange={(e) => up((p) => (p.targetKcal = e.target.value ? +e.target.value || null : null))} /></label>
          {client && <label className="field"><span>Stato</span>
            <select value={plan.active ? "1" : "0"} onChange={(e) => up((p) => (p.active = e.target.value === "1"))}><option value="1">Attivo (visibile in app)</option><option value="0">Concluso</option></select>
          </label>}
          <label className="field wide"><span>Indicazioni generali</span><textarea value={plan.notes} onChange={(e) => up((p) => (p.notes = e.target.value))} /></label>
        </div>
      </div>

      <div className="stack">
        {plan.meals.map((m, mi) => (
          <div key={m.id} className="block">
            <div className="block-head">
              <input className="input" style={{ width: 160, padding: "5px 8px" }} value={m.name} onChange={(e) => up((p) => (p.meals[mi].name = e.target.value))} aria-label="Nome pasto" />
              <input className="input" type="time" style={{ width: 110, padding: "5px 8px" }} value={m.time} onChange={(e) => up((p) => (p.meals[mi].time = e.target.value))} aria-label="Orario" />
              <span className="grow" />
              <MacroSummary m={mealMacros(m, foodMap)} compact />
              <button className="btn ghost icon" disabled={mi === 0} onClick={() => up((p) => { const [x] = p.meals.splice(mi, 1); p.meals.splice(mi - 1, 0, x); })} aria-label="Sposta su"><Icon name="up" size={16} /></button>
              <button className="btn ghost icon danger" onClick={() => up((p) => p.meals.splice(mi, 1))} aria-label="Elimina pasto"><Icon name="trash" size={16} /></button>
            </div>
            {m.items.map((it, ii) => {
              const f = foodMap.get(it.foodId);
              return (
                <div key={it.id} className="meal-item">
                  <span>{f?.name ?? "Alimento rimosso"}</span>
                  <label className="mini" style={{ justifySelf: "start" }}><input inputMode="numeric" value={it.grams} onChange={(e) => up((p) => (p.meals[mi].items[ii].grams = +e.target.value || 0))} aria-label="Grammi" />g</label>
                  <span className="mi-macros"><MacroSummary m={itemMacros(f, it.grams)} compact /></span>
                  <button className="btn ghost icon danger" onClick={() => up((p) => p.meals[mi].items.splice(ii, 1))} aria-label="Togli"><Icon name="x" size={16} /></button>
                </div>
              );
            })}
            <div className="row" style={{ padding: "8px 12px", borderTop: "1px solid var(--line)" }}>
              <button className="btn sm ghost" onClick={() => setPickFor(m.id)}><Icon name="plus" size={14} />Aggiungi alimento</button>
            </div>
          </div>
        ))}
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn" onClick={() => up((p) => p.meals.push({ id: uid(), name: "Nuovo pasto", time: "", items: [] }))}><Icon name="plus" size={18} />Aggiungi pasto</button>
      </div>

      {pickFor && <FoodPicker onClose={() => setPickFor(null)} onPick={(foodId) => {
        up((p) => p.meals.find((m) => m.id === pickFor)?.items.push({ id: uid(), foodId, grams: 100 }));
        setPickFor(null);
      }} />}
      {assign && (
        <Modal title={plan.clientId ? "Duplica piano" : "Assegna a un cliente"} onClose={() => setAssign(false)}>
          <p className="muted small" style={{ marginTop: 0 }}>Viene creata una copia indipendente.</p>
          <button className="pick" onClick={() => { const nid = store.duplicateMealPlan(plan.id, null); setAssign(false); toast("Salvato come modello"); nav(`/t/alimentazione/${nid}`); }}><span className="grow"><b>Come nuovo modello</b></span><Icon name="copy" /></button>
          {store.clients.filter((c) => c.active).map((c) => (
            <button key={c.id} className="pick" onClick={() => { const nid = store.duplicateMealPlan(plan.id, c.id); setAssign(false); toast("Piano assegnato"); nav(`/t/alimentazione/${nid}`); }}>
              <span className="grow"><b>{fullName(c)}</b><span className="muted small" style={{ display: "block" }}>{c.goal}</span></span><Icon name="plus" />
            </button>
          ))}
        </Modal>
      )}
    </>
  );
}
