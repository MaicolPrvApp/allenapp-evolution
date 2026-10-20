import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../data/store";
import { FOOD_CATEGORIES } from "../../data/foodLibrary";
import type { Food, FoodCategory, ID, MealPlan } from "../../data/types";
import { MacroSummary } from "../../components/MacroSummary";
import { Modal, SearchBox, Tabs, ask, toast } from "../../components/ui";
import { planMacros } from "../../lib/nutrition";
import { fmtDate, fullName, nowIso, uid } from "../../lib/util";

type Tab = "modelli" | "assegnati" | "alimenti";

export const emptyMealPlan = (clientId: ID | null): MealPlan => ({
  id: uid(), name: clientId ? "Nuovo piano alimentare" : "Nuovo modello", clientId, targetKcal: null, notes: "", active: true,
  meals: ["Colazione", "Pranzo", "Spuntino", "Cena"].map((name, i) => ({ id: uid(), name, time: ["07:30", "13:00", "16:30", "20:00"][i], items: [] })),
  createdAt: nowIso(), updatedAt: nowIso(),
});

export function Nutrition() {
  const { mealPlans, foods, clients, save } = useStore();
  const [tab, setTab] = useState<Tab>("modelli");
  const nav = useNavigate();
  const foodMap = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods]);
  const byId = new Map(clients.map((c) => [c.id, c]));
  const list = mealPlans.filter((p) => (tab === "modelli" ? !p.clientId : !!p.clientId)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <>
      <div className="page-head">
        <div><h1>Alimentazione</h1><p className="muted">Piani alimentari con calcolo di calorie e macronutrienti.</p></div>
        {tab !== "alimenti" && <button className="btn primary" onClick={() => { const p = emptyMealPlan(null); save("mealPlans", p); nav(`/t/alimentazione/${p.id}`); }}>Nuovo modello</button>}
      </div>
      <Tabs<Tab> value={tab} onChange={setTab} items={[["modelli", "Modelli"], ["assegnati", "Assegnati ai clienti"], ["alimenti", "Archivio alimenti"]]} />
      {tab === "alimenti" ? <FoodArchive /> : list.length ? (
        <div className="grid">
          {list.map((p) => {
            const c = p.clientId ? byId.get(p.clientId) : null;
            const m = planMacros(p, foodMap);
            return (
              <Link key={p.id} to={`/t/alimentazione/${p.id}`} className="card link">
                <div className="row"><h3 className="grow">{p.name}</h3>{p.clientId && (p.active ? <span className="tag ok">Attivo</span> : <span className="tag">Concluso</span>)}</div>
                {c && <div className="small" style={{ marginTop: 4 }}>{fullName(c)}</div>}
                <div style={{ marginTop: 8 }}><MacroSummary m={m} compact /></div>
                <div className="muted small">{p.meals.length} pasti · aggiornato il {fmtDate(p.updatedAt)}</div>
              </Link>
            );
          })}
        </div>
      ) : <p className="empty">{tab === "modelli" ? "Nessun modello di piano alimentare." : "Nessun piano assegnato. Assegnalo dalla pagina del cliente."}</p>}
    </>
  );
}

function FoodArchive() {
  const { foods, mealPlans, save, remove } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<FoodCategory | "">("");
  const [edit, setEdit] = useState<Food | null>(null);
  const t = q.trim().toLowerCase();
  const list = foods.filter((f) => (!cat || f.category === cat) && (!t || f.name.toLowerCase().includes(t))).sort((a, b) => a.name.localeCompare(b.name));
  const used = (id: ID) => mealPlans.some((p) => p.meals.some((m) => m.items.some((i) => i.foodId === id)));

  return (
    <>
      <div className="row" style={{ marginBottom: 14 }}>
        <SearchBox value={q} onChange={setQ} placeholder="Cerca alimento" />
        <select className="input" style={{ width: "auto" }} value={cat} onChange={(e) => setCat(e.target.value as FoodCategory)} aria-label="Categoria">
          <option value="">Tutte le categorie</option>{FOOD_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="btn primary" onClick={() => setEdit({ id: uid(), name: "", category: cat || "altro", kcal: 0, protein: 0, carbs: 0, fat: 0, custom: true })}>Nuovo alimento</button>
      </div>
      <div className="card" style={{ overflowX: "auto", padding: 8 }}>
        <table className="t">
          <thead><tr><th>Alimento (100 g)</th><th>Kcal</th><th>Prot.</th><th>Carb.</th><th>Grassi</th><th /></tr></thead>
          <tbody>
            {list.map((f) => (
              <tr key={f.id}>
                <td><b>{f.name}</b> <span className="muted small">{f.category}</span>{f.custom && <span className="tag accent" style={{ marginLeft: 6 }}>Mio</span>}</td>
                <td className="mono">{f.kcal}</td><td className="mono">{f.protein}</td><td className="mono">{f.carbs}</td><td className="mono">{f.fat}</td>
                <td><button className="btn sm" onClick={() => setEdit(f)}>Modifica</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && (
        <Modal title={edit.name || "Nuovo alimento"} onClose={() => setEdit(null)} footer={<>
          {foods.some((f) => f.id === edit.id) && <button className="btn ghost danger" disabled={used(edit.id)} title={used(edit.id) ? "È usato in un piano" : ""}
            onClick={async () => { if (await ask("Eliminare l'alimento?", "Elimina")) { remove("foods", edit.id); setEdit(null); } }}>Elimina</button>}
          <span className="grow" />
          <button className="btn primary" disabled={!edit.name.trim()} onClick={() => { save("foods", edit); toast("Alimento salvato"); setEdit(null); }}>Salva</button>
        </>}>
          <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
            <label className="field wide"><span>Nome</span><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} autoFocus /></label>
            <label className="field wide"><span>Categoria</span><select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value as FoodCategory })}>{FOOD_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            {(["kcal", "protein", "carbs", "fat"] as const).map((k) => (
              <label key={k} className="field"><span>{{ kcal: "Kcal", protein: "Proteine g", carbs: "Carboidrati g", fat: "Grassi g" }[k]}</span>
                <input inputMode="decimal" value={edit[k]} onChange={(e) => setEdit({ ...edit, [k]: parseFloat(e.target.value.replace(",", ".")) || 0 })} /></label>
            ))}
          </div>
          <p className="muted small">Valori per 100 g di prodotto.</p>
        </Modal>
      )}
    </>
  );
}
