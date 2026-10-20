import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../data/store";
import type { Block, BlockType, Exercise, ID, Plan, PlanDay } from "../../data/types";
import { ExercisePicker } from "../../components/ExercisePicker";
import { PlanDayView } from "../../components/PlanDayView";
import { Icon } from "../../components/Icon";
import { Modal, toast, ask, isFramed } from "../../components/ui";
import { fullName, uid } from "../../lib/util";

// Editor scheda: ogni modifica viene salvata subito.

const REST_OPTIONS = [0, 15, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];

export function PlanEditor() {
  const { id } = useParams();
  const store = useStore();
  const plan = store.plans.find((p) => p.id === id);
  const nav = useNavigate();
  const [dayIdx, setDayIdx] = useState(0);
  const [picker, setPicker] = useState<null | { mode: "add" } | { mode: "group"; blockId: ID } | { mode: "replace"; blockId: ID; itemId: ID }>(null);
  const [assign, setAssign] = useState(false);
  const [preview, setPreview] = useState(false);

  if (!plan) return <p className="empty">Scheda non trovata. <Link to="/t/schede">Torna alle schede</Link></p>;
  const exMap = new Map(store.exercises.map((e) => [e.id, e]));
  const client = plan.clientId ? store.clients.find((c) => c.id === plan.clientId) : null;
  const di = Math.min(dayIdx, plan.days.length - 1);
  const day = plan.days[di];

  /** Applica una modifica a una copia della scheda e salva */
  const up = (fn: (p: Plan) => void) => {
    const p = structuredClone(plan);
    fn(p);
    store.savePlan(p);
  };
  const upDay = (fn: (d: PlanDay) => void) => up((p) => fn(p.days[di]));
  const upBlock = (bid: ID, fn: (b: Block) => void) => upDay((d) => { const b = d.blocks.find((x) => x.id === bid); if (b) fn(b); });

  const onPick = (ids: ID[]) => {
    if (!picker) return;
    if (picker.mode === "add") {
      upDay((d) => d.blocks.push(...ids.map((exerciseId): Block => ({
        id: uid(), type: "single", sets: 3, restSec: 90, items: [{ id: uid(), exerciseId, reps: "10", load: "", notes: "" }],
      }))));
    } else if (picker.mode === "group") {
      upBlock(picker.blockId, (b) => {
        b.items.push(...ids.map((exerciseId) => ({ id: uid(), exerciseId, reps: b.items[0]?.reps ?? "10", load: "", notes: "" })));
        if (b.type === "single") b.type = b.items.length > 2 ? "circuit" : "superset";
      });
    } else {
      const { itemId } = picker;
      upBlock(picker.blockId, (b) => { const it = b.items.find((i) => i.id === itemId); if (it) it.exerciseId = ids[0]; });
    }
    setPicker(null);
  };

  const backTo = client ? `/t/clienti/${client.id}` : "/t/schede";

  return (
    <>
      <Link to={backTo} className="back no-print"><Icon name="back" size={16} />{client ? fullName(client) : "Schede"}</Link>
      <div className="page-head no-print">
        <div>
          <input className="input" style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, textTransform: "uppercase", padding: "4px 8px", background: "transparent", borderColor: "transparent" }}
            value={plan.name} onChange={(e) => up((p) => (p.name = e.target.value))} aria-label="Nome scheda" />
          <p className="muted" style={{ paddingLeft: 8 }}>{client ? <>Assegnata a <b>{fullName(client)}</b></> : "Modello riutilizzabile"}</p>
        </div>
        <div className="row">
          <button className="btn" onClick={() => setPreview(true)}><Icon name="printer" size={18} />{isFramed ? "Anteprima" : "Anteprima e stampa"}</button>
          <button className="btn" onClick={() => setAssign(true)}><Icon name="copy" size={18} />{client ? "Duplica" : "Assegna a cliente"}</button>
          <button className="btn ghost danger icon" aria-label="Elimina scheda" onClick={async () => { if (await ask("Eliminare questa scheda?")) { store.deletePlan(plan.id); nav(backTo); } }}><Icon name="trash" /></button>
        </div>
      </div>

      <div className="card no-print" style={{ marginBottom: 18 }}>
        <div className="form-grid">
          <label className="field"><span>Obiettivo</span><input value={plan.goal} onChange={(e) => up((p) => (p.goal = e.target.value))} /></label>
          <label className="field"><span>Durata (settimane)</span><input type="number" min={1} max={52} value={plan.weeks} onChange={(e) => up((p) => (p.weeks = Math.max(1, +e.target.value || 1)))} /></label>
          {client && <label className="field"><span>Inizio</span><input type="date" value={plan.startDate} onChange={(e) => up((p) => (p.startDate = e.target.value))} /></label>}
          {client && <label className="field"><span>Stato</span>
            <select value={plan.active ? "1" : "0"} onChange={(e) => up((p) => (p.active = e.target.value === "1"))}><option value="1">Attiva (visibile in app)</option><option value="0">Conclusa</option></select>
          </label>}
          <label className="field wide"><span>Descrizione e indicazioni generali</span><textarea value={plan.description} onChange={(e) => up((p) => (p.description = e.target.value))} /></label>
        </div>
      </div>

      <div className="day-tabs no-print">
        {plan.days.map((d, i) => <button key={d.id} aria-pressed={i === di} onClick={() => setDayIdx(i)}>{d.name || `Giorno ${i + 1}`}</button>)}
        <button onClick={() => { up((p) => p.days.push({ id: uid(), name: `Giorno ${String.fromCharCode(65 + p.days.length)}`, notes: "", blocks: [] })); setDayIdx(plan.days.length); }}><Icon name="plus" size={14} /> Giorno</button>
      </div>

      {day && (
        <div className="no-print">
          <div className="row" style={{ marginBottom: 10 }}>
            <input className="input grow" style={{ maxWidth: 260 }} value={day.name} onChange={(e) => upDay((d) => (d.name = e.target.value))} aria-label="Nome giorno" />
            <button className="btn sm" onClick={() => { up((p) => { const c = structuredClone(p.days[di]); c.id = uid(); c.name += " (copia)"; c.blocks.forEach((b) => { b.id = uid(); b.items.forEach((i) => (i.id = uid())); }); p.days.splice(di + 1, 0, c); }); setDayIdx(di + 1); }}>Duplica giorno</button>
            {plan.days.length > 1 && <button className="btn sm ghost danger" onClick={async () => { if (await ask(`Eliminare ${day.name}?`)) { up((p) => p.days.splice(di, 1)); setDayIdx(Math.max(0, di - 1)); } }}>Elimina giorno</button>}
          </div>
          <label className="field" style={{ marginBottom: 14 }}><span>Note del giorno (riscaldamento, defaticamento…)</span>
            <input value={day.notes} onChange={(e) => upDay((d) => (d.notes = e.target.value))} />
          </label>

          {day.blocks.map((b, bi) => (
            <BlockEditor key={b.id} b={b} index={bi} last={bi === day.blocks.length - 1} exMap={exMap}
              onChange={(fn) => upBlock(b.id, fn)}
              onMove={(dir) => upDay((d) => { const [x] = d.blocks.splice(bi, 1); d.blocks.splice(bi + dir, 0, x); })}
              onRemove={() => upDay((d) => d.blocks.splice(bi, 1))}
              onLinkNext={() => upDay((d) => {
                const next = d.blocks[bi + 1]; if (!next) return;
                const cur = d.blocks[bi];
                cur.items.push(...next.items);
                cur.type = cur.items.length > 2 ? "circuit" : "superset";
                d.blocks.splice(bi + 1, 1);
              })}
              onSplit={() => upDay((d) => {
                const cur = d.blocks[bi];
                const rest = cur.items.slice(1).map((it): Block => ({ id: uid(), type: "single", sets: cur.sets, restSec: cur.restSec, items: [it] }));
                cur.items = cur.items.slice(0, 1); cur.type = "single";
                d.blocks.splice(bi + 1, 0, ...rest);
              })}
              onAddToGroup={() => setPicker({ mode: "group", blockId: b.id })}
              onReplace={(itemId) => setPicker({ mode: "replace", blockId: b.id, itemId })}
            />
          ))}
          {!day.blocks.length && <p className="empty">Aggiungi gli esercizi di questo giorno.</p>}
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn primary" onClick={() => setPicker({ mode: "add" })}><Icon name="plus" size={18} />Aggiungi esercizi</button>
            <span className="muted small">Per una superserie o un circuito usa «Collega al successivo» sul primo esercizio.</span>
          </div>
        </div>
      )}

      {picker && <ExercisePicker multi={picker.mode !== "replace"} onClose={() => setPicker(null)} onPick={onPick} />}
      {assign && <AssignModal plan={plan} onClose={() => setAssign(false)} />}
      {preview && <PrintPreview plan={plan} clientName={client ? fullName(client) : ""} exMap={exMap} onClose={() => setPreview(false)} />}
    </>
  );
}

function BlockEditor(props: {
  b: Block; index: number; last: boolean; exMap: Map<ID, Exercise>;
  onChange(fn: (b: Block) => void): void; onMove(dir: 1 | -1): void; onRemove(): void;
  onLinkNext(): void; onSplit(): void; onAddToGroup(): void; onReplace(itemId: ID): void;
}) {
  const { b, index, last, exMap, onChange } = props;
  const grouped = b.type !== "single";
  return (
    <div className={`block ${b.type}`}>
      <div className="block-head">
        <span className="num">{index + 1}</span>
        {grouped ? (
          <select className="input" style={{ width: "auto", padding: "5px 8px" }} value={b.type} onChange={(e) => onChange((x) => (x.type = e.target.value as BlockType))} aria-label="Tipo di gruppo">
            <option value="superset">Superserie</option><option value="circuit">Circuito</option>
          </select>
        ) : <b className="grow" style={{ minWidth: 0 }}>{exMap.get(b.items[0]?.exerciseId)?.name ?? "Esercizio"}</b>}
        {grouped && <span className="grow" />}
        <label className="mini">{grouped ? "Giri" : "Serie"}<input type="number" min={1} max={20} value={b.sets} onChange={(e) => onChange((x) => (x.sets = Math.max(1, +e.target.value || 1)))} /></label>
        <label className="mini">Recupero
          <select value={b.restSec} onChange={(e) => onChange((x) => (x.restSec = +e.target.value))}>
            {REST_OPTIONS.map((s) => <option key={s} value={s}>{s >= 60 ? `${Math.floor(s / 60)}'${s % 60 ? s % 60 : ""}` : `${s}"`}</option>)}
          </select>
        </label>
        <span className="row" style={{ gap: 2 }}>
          <button className="btn ghost icon" disabled={index === 0} onClick={() => props.onMove(-1)} aria-label="Sposta su"><Icon name="up" size={16} /></button>
          <button className="btn ghost icon" disabled={last} onClick={() => props.onMove(1)} aria-label="Sposta giù"><Icon name="down" size={16} /></button>
          <button className="btn ghost icon danger" onClick={props.onRemove} aria-label="Rimuovi"><Icon name="trash" size={16} /></button>
        </span>
      </div>
      {b.items.map((it, ii) => (
        <div key={it.id} className="block-item">
          <div>
            {grouped && <div className="name">{index + 1}{String.fromCharCode(97 + ii)}. {exMap.get(it.exerciseId)?.name ?? "Esercizio rimosso"}</div>}
            <button className="btn sm ghost" style={{ paddingLeft: 0 }} onClick={() => props.onReplace(it.id)}>Cambia esercizio</button>
          </div>
          <label className="field"><span>Ripetizioni</span><input value={it.reps} onChange={(e) => onChange((x) => (x.items[ii].reps = e.target.value))} placeholder="10, 8-12, 30s" /></label>
          <label className="field"><span>Carico</span><input value={it.load} onChange={(e) => onChange((x) => (x.items[ii].load = e.target.value))} placeholder="es. 40 kg" /></label>
          <div className="acts row" style={{ gap: 2, alignSelf: "end" }}>
            {grouped && <>
              <button className="btn ghost icon" disabled={ii === 0} onClick={() => onChange((x) => { const [m] = x.items.splice(ii, 1); x.items.splice(ii - 1, 0, m); })} aria-label="Sposta su"><Icon name="up" size={16} /></button>
              <button className="btn ghost icon" disabled={ii === b.items.length - 1} onClick={() => onChange((x) => { const [m] = x.items.splice(ii, 1); x.items.splice(ii + 1, 0, m); })} aria-label="Sposta giù"><Icon name="down" size={16} /></button>
              <button className="btn ghost icon danger" onClick={() => onChange((x) => { x.items.splice(ii, 1); if (x.items.length === 1) x.type = "single"; })} aria-label="Togli dal gruppo"><Icon name="x" size={16} /></button>
            </>}
          </div>
          <input className="input notes" value={it.notes} onChange={(e) => onChange((x) => (x.items[ii].notes = e.target.value))} placeholder="Note tecniche per il cliente (facoltative)" />
        </div>
      ))}
      <div className="row" style={{ padding: "8px 12px", borderTop: "1px solid var(--line)" }}>
        <button className="btn sm ghost" onClick={props.onAddToGroup}><Icon name="plus" size={14} />{grouped ? "Aggiungi al gruppo" : "Crea superserie"}</button>
        {!last && <button className="btn sm ghost" onClick={props.onLinkNext}><Icon name="link" size={14} />Collega al successivo</button>}
        {grouped && <button className="btn sm ghost" onClick={props.onSplit}>Separa</button>}
      </div>
    </div>
  );
}

function AssignModal({ plan, onClose }: { plan: Plan; onClose(): void }) {
  const { clients, duplicatePlan } = useStore();
  const nav = useNavigate();
  const go = (cid: ID | null) => {
    const nid = duplicatePlan(plan.id, cid);
    toast(cid ? "Scheda assegnata" : "Salvata come modello");
    onClose();
    nav(`/t/schede/${nid}`);
  };
  return (
    <Modal title={plan.clientId ? "Duplica scheda" : "Assegna a un cliente"} onClose={onClose}>
      <p className="muted small" style={{ marginTop: 0 }}>Viene creata una copia indipendente: le modifiche successive non toccano l'originale.</p>
      <button className="pick" onClick={() => go(null)}><span className="grow"><b>Come nuovo modello</b></span><Icon name="copy" /></button>
      {clients.filter((c) => c.active).map((c) => (
        <button key={c.id} className="pick" onClick={() => go(c.id)}><span className="grow"><b>{fullName(c)}</b><span className="muted small" style={{ display: "block" }}>{c.goal}</span></span><Icon name="plus" /></button>
      ))}
    </Modal>
  );
}

function PrintPreview({ plan, clientName, exMap, onClose }: { plan: Plan; clientName: string; exMap: Map<ID, Exercise>; onClose(): void }) {
  return (
    <div className="session" style={{ overflowY: "auto", display: "block" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="row no-print" style={{ marginBottom: 16 }}>
          <button className="btn" onClick={onClose}><Icon name="back" size={16} />Chiudi</button>
          <span className="grow" />
          {!isFramed && <button className="btn primary" onClick={() => print()}><Icon name="printer" size={18} />Stampa o salva PDF</button>}
        </div>
        <h1>{plan.name}</h1>
        <p className="muted">{[clientName, plan.goal, `${plan.weeks} settimane`].filter(Boolean).join(" · ")}</p>
        {plan.description && <p>{plan.description}</p>}
        {plan.days.map((d) => (
          <div key={d.id} className="section" style={{ breakInside: "avoid" }}>
            <h2 style={{ marginBottom: 8 }}>{d.name}</h2>
            <PlanDayView day={d} exMap={exMap} />
          </div>
        ))}
      </div>
    </div>
  );
}
