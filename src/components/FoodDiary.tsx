import { useMemo, useState } from "react";
import { useStore } from "../data/store";
import type { Food, FoodLog, ID } from "../data/types";
import { MacroSummary } from "./MacroSummary";
import { FoodPicker } from "./FoodPicker";
import { Icon } from "./Icon";
import { Modal, toast } from "./ui";
import { ZERO, add, itemMacros } from "../lib/nutrition";
import { addDays, fmtDayLong, localDate } from "../lib/dates";
import { nowIso, num, uid } from "../lib/util";

const DEFAULT_MEALS = ["Colazione", "Spuntino", "Pranzo", "Merenda", "Cena"];

const dayMacros = (logs: FoodLog[], foods: Map<ID, Food>) => logs.reduce((t, l) => add(t, itemMacros(foods.get(l.foodId), l.grams)), ZERO);

/**
 * Diario alimentare di un cliente.
 * editable = area cliente (aggiunge e toglie alimenti); altrimenti vista del trainer.
 */
export function FoodDiary({ clientId, editable }: { clientId: ID; editable: boolean }) {
  const store = useStore();
  const [date, setDate] = useState(() => localDate(nowIso()));
  const [adding, setAdding] = useState<{ meal: string; foodId?: ID } | null>(null);
  const [grams, setGrams] = useState("100");
  const foodMap = useMemo(() => new Map(store.foods.map((f) => [f.id, f])), [store.foods]);
  const plan = store.mealPlans.filter((p) => p.clientId === clientId && p.active).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const mine = store.foodLogs.filter((l) => l.clientId === clientId);
  const logs = mine.filter((l) => l.date === date);
  const today = localDate(nowIso());

  // pasti del piano (nell'ordine del piano), poi quelli predefiniti, poi eventuali altri registrati
  const mealNames = [...new Set([...(plan?.meals.map((m) => m.name) ?? DEFAULT_MEALS), ...logs.map((l) => l.meal)])];
  const shift = (n: number) => setDate(localDate(addDays(new Date(`${date}T12:00`), n).toISOString()));

  const confirmAdd = () => {
    const g = num(grams);
    if (!adding?.foodId || !g) return;
    store.save("foodLogs", { id: uid(), clientId, date, meal: adding.meal, foodId: adding.foodId, grams: g, createdAt: nowIso() });
    setAdding(null);
  };
  const copyFromPlan = (meal: string) => {
    const m = plan?.meals.find((x) => x.name === meal);
    if (!m) return;
    m.items.forEach((it) => store.save("foodLogs", { id: uid(), clientId, date, meal, foodId: it.foodId, grams: it.grams, createdAt: nowIso() }));
    toast(`${meal} copiato dal piano`);
  };

  // ultimi 7 giorni per il riepilogo
  const week = Array.from({ length: 7 }, (_, i) => localDate(addDays(new Date(`${today}T12:00`), -6 + i).toISOString()));
  const weekKcal = week.map((d) => dayMacros(mine.filter((l) => l.date === d), foodMap).kcal);
  const max = Math.max(plan?.targetKcal ?? 0, ...weekKcal, 1);

  return (
    <div className="stack">
      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <button className="btn sm" aria-label="Giorno precedente" onClick={() => shift(-1)}><Icon name="back" /></button>
          <h3 className="grow" style={{ textAlign: "center", textTransform: "capitalize" }}>{date === today ? "Oggi" : fmtDayLong(new Date(`${date}T12:00`))}</h3>
          <button className="btn sm" aria-label="Giorno successivo" disabled={date >= today} onClick={() => shift(1)}><Icon name="forward" /></button>
        </div>
        <MacroSummary m={dayMacros(logs, foodMap)} target={plan?.targetKcal} />
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>Ultimi 7 giorni</h3>
        <div className="diary-week">
          {week.map((d, i) => (
            <button key={d} className={`diary-day${d === date ? " on" : ""}`} onClick={() => setDate(d)} title={`${Math.round(weekKcal[i])} kcal`}>
              <span className="diary-bar"><i style={{ height: `${(weekKcal[i] / max) * 100}%` }} />{plan?.targetKcal ? <b style={{ bottom: `${(plan.targetKcal / max) * 100}%` }} /> : null}</span>
              <span className="mono small">{Math.round(weekKcal[i]) || "–"}</span>
              <span className="muted small">{new Date(`${d}T12:00`).toLocaleDateString("it-IT", { weekday: "short" })}</span>
            </button>
          ))}
        </div>
        {plan?.targetKcal ? <p className="muted small" style={{ margin: "8px 0 0" }}>La linea indica l'obiettivo del piano: {plan.targetKcal} kcal.</p> : null}
      </div>

      {mealNames.map((meal) => {
        const items = logs.filter((l) => l.meal === meal);
        if (!editable && !items.length) return null;
        return (
          <div key={meal} className="card">
            <div className="row" style={{ marginBottom: items.length ? 8 : 0 }}>
              <h3 className="grow">{meal}</h3>
              {items.length > 0 && <MacroSummary m={dayMacros(items, foodMap)} compact />}
            </div>
            {items.length > 0 && (
              <div className="list">
                {items.map((l) => {
                  const f = foodMap.get(l.foodId);
                  return (
                    <div key={l.id} className="row" style={{ padding: "8px 0" }}>
                      <span className="grow">{f?.name ?? "Alimento"}</span>
                      <b className="mono">{l.grams} g</b>
                      <span className="muted small mono" style={{ minWidth: 70, textAlign: "right" }}>{Math.round(itemMacros(f, l.grams).kcal)} kcal</span>
                      {editable && <button className="btn sm ghost" aria-label="Togli" onClick={() => store.remove("foodLogs", l.id)}><Icon name="trash" /></button>}
                    </div>
                  );
                })}
              </div>
            )}
            {editable && (
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn sm" onClick={() => { setGrams("100"); setAdding({ meal }); }}><Icon name="plus" /> Aggiungi alimento</button>
                {!items.length && plan?.meals.some((m) => m.name === meal) && <button className="btn sm ghost" onClick={() => copyFromPlan(meal)}>Come da piano</button>}
              </div>
            )}
          </div>
        );
      })}
      {!editable && !logs.length && <p className="empty">Nessun pasto registrato in questo giorno.</p>}

      {adding && !adding.foodId && <FoodPicker onPick={(id) => setAdding({ ...adding, foodId: id })} onClose={() => setAdding(null)} />}
      {adding?.foodId && (
        <Modal title={foodMap.get(adding.foodId)?.name ?? "Quantità"} onClose={() => setAdding(null)}
          footer={<><button className="btn" onClick={() => setAdding(null)}>Annulla</button><button className="btn primary" onClick={confirmAdd}>Aggiungi a {adding.meal}</button></>}>
          <label className="field">
            <span>Quantità in grammi</span>
            <input type="number" inputMode="decimal" min={1} value={grams} autoFocus onChange={(e) => setGrams(e.target.value)} onKeyDown={(e) => e.key === "Enter" && confirmAdd()} />
          </label>
          <MacroSummary m={itemMacros(foodMap.get(adding.foodId), num(grams) || 0)} compact />
        </Modal>
      )}
    </div>
  );
}
