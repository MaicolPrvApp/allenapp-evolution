import type { Macros } from "../lib/nutrition";
import { split } from "../lib/nutrition";

const r = (n: number) => Math.round(n).toLocaleString("it-IT");

/** Calorie e macronutrienti con barra di ripartizione */
export function MacroSummary({ m, target, compact = false }: { m: Macros; target?: number | null; compact?: boolean }) {
  const s = split(m);
  if (compact)
    return <span className="mono small muted">{r(m.kcal)} kcal · P {r(m.protein)} · C {r(m.carbs)} · G {r(m.fat)}</span>;
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="row" style={{ gap: 18, alignItems: "baseline" }}>
        <span><span className="kpi-val" style={{ fontSize: 32 }}>{r(m.kcal)}</span> <span className="muted">kcal{target ? ` su ${r(target)}` : ""}</span></span>
        <span>Proteine <b>{r(m.protein)} g</b></span>
        <span>Carboidrati <b>{r(m.carbs)} g</b></span>
        <span>Grassi <b>{r(m.fat)} g</b></span>
      </div>
      <div className="macro-bar" aria-hidden="true">
        <i style={{ width: `${s.protein}%`, background: "var(--accent)" }} />
        <i style={{ width: `${s.carbs}%`, background: "var(--warn)" }} />
        <i style={{ width: `${s.fat}%`, background: "var(--bad)" }} />
      </div>
      <div className="row small muted" style={{ gap: 14 }}>
        <span><span className="dot" style={{ background: "var(--accent)" }} />Proteine {Math.round(s.protein)}%</span>
        <span><span className="dot" style={{ background: "var(--warn)" }} />Carboidrati {Math.round(s.carbs)}%</span>
        <span><span className="dot" style={{ background: "var(--bad)" }} />Grassi {Math.round(s.fat)}%</span>
      </div>
    </div>
  );
}
