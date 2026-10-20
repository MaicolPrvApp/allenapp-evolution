import { useState } from "react";
import { useStore } from "../../data/store";
import type { Assessment, Client, Circumference, SkinfoldMethod, SkinfoldSite } from "../../data/types";
import { ALL_SITES, CIRCS, SITES_BY_METHOD, analyze, bmiLabel } from "../../lib/body";
import { LineChart, Modal, ask, toast } from "../../components/ui";
import { fmtDate, today, uid } from "../../lib/util";

const n1 = (v: number | null | undefined, unit = "") => (v === null || v === undefined || isNaN(v) ? "—" : `${(Math.round(v * 10) / 10).toLocaleString("it-IT")}${unit}`);
const short = (d: string) => new Date(d).toLocaleDateString("it-IT", { day: "numeric", month: "short" });

/** Storico delle valutazioni del cliente con grafici di peso e massa grassa */
export function ClientAssessments({ client }: { client: Client }) {
  const all = useStore((s) => s.assessments);
  const list = all.filter((a) => a.clientId === client.id).sort((a, b) => a.date.localeCompare(b.date));
  const [edit, setEdit] = useState<Assessment | null>(null);
  const rows = list.map((a) => ({ a, r: analyze(a, client.sex, client.birthDate) }));
  const last = rows[rows.length - 1], first = rows[0];
  const delta = (k: "bodyFat" | "leanMass", unit: string) => {
    if (!last || !first || last === first) return null;
    const a = first.r[k], b = last.r[k];
    if (a === null || b === null) return null;
    const d = b - a;
    return `${d > 0 ? "+" : ""}${n1(d)}${unit} dal ${short(first.a.date)}`;
  };
  const newOne = (): Assessment => ({
    id: uid(), clientId: client.id, date: today(), weight: last?.a.weight ?? null, height: last?.a.height ?? null, restingHr: null,
    circ: {}, folds: {}, method: last?.a.method || "jp3", notes: "",
  });

  return (
    <>
      <div className="row" style={{ marginBottom: 14 }}>
        <button className="btn primary" onClick={() => setEdit(newOne())}>Nuova valutazione</button>
        {!client.sex && <span className="muted small">Indica il sesso nel profilo per calcolare la massa grassa.</span>}
      </div>
      {last ? (
        <>
          <div className="grid kpi">
            <div className="card"><div className="kpi-val">{n1(last.a.weight)}<small style={{ fontSize: 18 }}> kg</small></div><div className="kpi-lbl">Peso</div></div>
            <div className="card"><div className="kpi-val">{n1(last.r.bmi)}</div><div className="kpi-lbl">BMI{last.r.bmi ? ` · ${bmiLabel(last.r.bmi)}` : ""}</div></div>
            <div className="card"><div className="kpi-val">{n1(last.r.bodyFat)}<small style={{ fontSize: 18 }}> %</small></div><div className="kpi-lbl">Massa grassa</div><div className="small muted">{delta("bodyFat", " punti")}</div></div>
            <div className="card"><div className="kpi-val">{n1(last.r.leanMass)}<small style={{ fontSize: 18 }}> kg</small></div><div className="kpi-lbl">Massa magra</div><div className="small muted">{delta("leanMass", " kg")}</div></div>
          </div>
          <div className="grid section" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <div className="card"><h3 style={{ marginBottom: 8 }}>Peso (kg)</h3><LineChart points={rows.filter((x) => x.a.weight).map((x) => ({ label: short(x.a.date), value: x.a.weight! }))} unit=" kg" /></div>
            <div className="card"><h3 style={{ marginBottom: 8 }}>Massa grassa (%)</h3><LineChart points={rows.filter((x) => x.r.bodyFat !== null).map((x) => ({ label: short(x.a.date), value: Math.round(x.r.bodyFat! * 10) / 10 }))} unit=" %" /></div>
          </div>
          <div className="card section" style={{ overflowX: "auto" }}>
            <table className="t">
              <thead><tr><th>Data</th><th>Peso</th><th>BMI</th><th>Σ pliche</th><th>% MG</th><th>Magra</th><th>Vita</th><th>Fianchi</th><th /></tr></thead>
              <tbody>
                {[...rows].reverse().map(({ a, r }) => (
                  <tr key={a.id}>
                    <td>{fmtDate(a.date)}</td><td>{n1(a.weight, " kg")}</td><td>{n1(r.bmi)}</td><td>{n1(r.sum, " mm")}</td>
                    <td><b>{n1(r.bodyFat, "%")}</b></td><td>{n1(r.leanMass, " kg")}</td><td>{n1(a.circ.vita, " cm")}</td><td>{n1(a.circ.fianchi, " cm")}</td>
                    <td><button className="btn sm" onClick={() => setEdit(a)}>Apri</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : <p className="empty">Nessuna valutazione. Registra peso, circonferenze e pliche per seguire i progressi.</p>}
      {edit && <AssessmentForm initial={edit} client={client} onClose={() => setEdit(null)} />}
    </>
  );
}

function AssessmentForm({ initial, client, onClose }: { initial: Assessment; client: Client; onClose(): void }) {
  const { save, remove, assessments } = useStore();
  const [a, setA] = useState(initial);
  const exists = assessments.some((x) => x.id === a.id);
  const r = analyze(a, client.sex, client.birthDate);
  const needed: SkinfoldSite[] = a.method && (client.sex === "M" || client.sex === "F") ? SITES_BY_METHOD[a.method][client.sex] : [];
  const num = (v: string) => (v === "" ? null : parseFloat(v.replace(",", ".")));
  const setFold = (s: SkinfoldSite, v: string) => setA({ ...a, folds: { ...a.folds, [s]: num(v) ?? undefined } });
  const setCirc = (c: Circumference, v: string) => setA({ ...a, circ: { ...a.circ, [c]: num(v) ?? undefined } });

  return (
    <Modal title={exists ? `Valutazione del ${fmtDate(a.date)}` : "Nuova valutazione"} onClose={onClose} footer={<>
      {exists && <button className="btn ghost danger" onClick={async () => { if (await ask("Eliminare questa valutazione?", "Elimina")) { remove("assessments", a.id); onClose(); } }}>Elimina</button>}
      <span className="grow" />
      <button className="btn ghost" onClick={onClose}>Annulla</button>
      <button className="btn primary" onClick={() => { save("assessments", a); toast("Valutazione salvata"); onClose(); }}>Salva</button>
    </>}>
      <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
        <label className="field"><span>Data</span><input type="date" value={a.date} onChange={(e) => setA({ ...a, date: e.target.value })} /></label>
        <label className="field"><span>Peso (kg)</span><input inputMode="decimal" value={a.weight ?? ""} onChange={(e) => setA({ ...a, weight: num(e.target.value) })} /></label>
        <label className="field"><span>Altezza (cm)</span><input inputMode="decimal" value={a.height ?? ""} onChange={(e) => setA({ ...a, height: num(e.target.value) })} /></label>
        <label className="field"><span>FC a riposo</span><input inputMode="numeric" value={a.restingHr ?? ""} onChange={(e) => setA({ ...a, restingHr: num(e.target.value) })} /></label>
      </div>

      <h3 style={{ margin: "18px 0 8px" }}>Circonferenze (cm)</h3>
      <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
        {CIRCS.map((c) => <label key={c} className="field"><span>{c}</span><input inputMode="decimal" value={a.circ[c] ?? ""} onChange={(e) => setCirc(c, e.target.value)} /></label>)}
      </div>

      <div className="row" style={{ margin: "18px 0 8px" }}>
        <h3 className="grow">Plicometria (mm)</h3>
        <select className="input" style={{ width: "auto" }} value={a.method} onChange={(e) => setA({ ...a, method: e.target.value as SkinfoldMethod })} aria-label="Metodo">
          <option value="jp3">Jackson-Pollock 3 pliche</option>
          <option value="jp7">Jackson-Pollock 7 pliche</option>
          <option value="">Nessun calcolo</option>
        </select>
      </div>
      <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
        {ALL_SITES.map((s) => (
          <label key={s} className="field" style={{ opacity: needed.length && !needed.includes(s) ? 0.55 : 1 }}>
            <span>{s}{needed.includes(s) ? " *" : ""}</span>
            <input inputMode="decimal" value={a.folds[s] ?? ""} onChange={(e) => setFold(s, e.target.value)} />
          </label>
        ))}
      </div>

      <div className="card tight" style={{ marginTop: 16, background: "var(--accent-soft)", borderColor: "transparent" }}>
        <div className="row" style={{ gap: 18 }}>
          <span>BMI <b>{n1(r.bmi)}</b></span>
          <span>Σ pliche <b>{n1(r.sum, " mm")}</b></span>
          <span>Massa grassa <b>{n1(r.bodyFat, "%")}</b></span>
          <span>Massa magra <b>{n1(r.leanMass, " kg")}</b></span>
          <span>Vita/fianchi <b>{r.whr ? r.whr.toFixed(2) : "—"}</b></span>
        </div>
        {r.missingSites.length > 0 && <div className="small muted" style={{ marginTop: 6 }}>Per la % di massa grassa mancano: {r.missingSites.join(", ")}.</div>}
      </div>
      <label className="field" style={{ marginTop: 14 }}><span>Note</span><textarea value={a.notes} onChange={(e) => setA({ ...a, notes: e.target.value })} /></label>
    </Modal>
  );
}
