import { useMemo } from "react";
import { useStore } from "../../data/store";
import { MacroSummary } from "../../components/MacroSummary";
import { itemMacros, mealMacros, planMacros } from "../../lib/nutrition";
import { useMe } from "./useMe";

/** Area cliente: piano alimentare attivo */
export function ClientMeals() {
  const me = useMe();
  const { mealPlans, foods } = useStore();
  const foodMap = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods]);
  if (!me) return <p className="empty">Non ci sono ancora clienti.</p>;
  const plan = mealPlans.filter((p) => p.clientId === me.id && p.active).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  return (
    <>
      <div className="page-head"><div><h1>Alimentazione</h1><p className="muted">Il piano preparato dal tuo trainer.</p></div></div>
      {!plan ? <p className="empty">Non hai ancora un piano alimentare.</p> : (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ marginBottom: 10 }}>{plan.name}</h2>
            <MacroSummary m={planMacros(plan, foodMap)} target={plan.targetKcal} />
            {plan.notes && <p style={{ marginBottom: 0 }}>{plan.notes}</p>}
          </div>
          <div className="stack">
            {plan.meals.map((m) => (
              <div key={m.id} className="card">
                <div className="row" style={{ marginBottom: 8 }}>
                  <h3 className="grow">{m.name}{m.time && <span className="muted mono small"> · {m.time}</span>}</h3>
                  <MacroSummary m={mealMacros(m, foodMap)} compact />
                </div>
                <div className="list">
                  {m.items.map((it) => {
                    const f = foodMap.get(it.foodId);
                    return (
                      <div key={it.id} className="row" style={{ padding: "8px 0" }}>
                        <span className="grow">{f?.name ?? "Alimento"}</span>
                        <b className="mono">{it.grams} g</b>
                        <span className="muted small mono" style={{ minWidth: 70, textAlign: "right" }}>{Math.round(itemMacros(f, it.grams).kcal)} kcal</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
