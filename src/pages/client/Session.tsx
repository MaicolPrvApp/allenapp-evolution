import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../data/store";
import type { Block, BlockItem, SetLog } from "../../data/types";
import { Icon } from "../../components/Icon";
import { toast, ask } from "../../components/ui";
import { countSound, endSound, unlockAudio } from "../../lib/sound";
import { embedUrl } from "../../lib/video";
import { fmtDuration, uid } from "../../lib/util";

// Allenamento guidato: una schermata per serie, timer di recupero automatico, riepilogo finale.

type Step =
  | { kind: "work"; block: Block; bi: number; item: BlockItem; ii: number; round: number }
  | { kind: "rest"; secs: number; nextLabel: string }
  | { kind: "done" };

const key = (blockId: string, itemId: string, round: number) => `${blockId}:${itemId}:${round}`;

export function Session() {
  const { planId, dayId } = useParams();
  const store = useStore();
  const nav = useNavigate();
  const plan = store.plans.find((p) => p.id === planId);
  const day = plan?.days.find((d) => d.id === dayId);
  const exMap = useMemo(() => new Map(store.exercises.map((e) => [e.id, e])), [store.exercises]);

  const steps = useMemo<Step[]>(() => {
    if (!day) return [];
    const out: Step[] = [];
    day.blocks.forEach((block, bi) => {
      for (let round = 0; round < block.sets; round++) {
        block.items.forEach((item, ii) => out.push({ kind: "work", block, bi, item, ii, round }));
        const lastOfAll = bi === day.blocks.length - 1 && round === block.sets - 1;
        if (block.restSec > 0 && !lastOfAll) {
          const next = round < block.sets - 1 ? block.items[0] : day.blocks[bi + 1]?.items[0];
          out.push({ kind: "rest", secs: block.restSec, nextLabel: exMap.get(next?.exerciseId ?? "")?.name ?? "" });
        }
      }
    });
    out.push({ kind: "done" });
    return out;
  }, [day, exMap]);

  // carichi usati l'ultima volta per lo stesso esercizio, per precompilare
  const lastLoads = useMemo(() => {
    const m = new Map<string, string>();
    store.logs.filter((l) => l.clientId === plan?.clientId).sort((a, b) => a.date.localeCompare(b.date))
      .forEach((l) => l.sets.forEach((s) => s.done && s.load && m.set(s.exerciseId, s.load)));
    return m;
  }, [store.logs, plan?.clientId]);

  const [idx, setIdx] = useState(0);
  const [sets, setSets] = useState<Record<string, SetLog>>({});
  const [startedAt] = useState(Date.now());
  const [rpe, setRpe] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  // schermo sempre acceso durante l'allenamento, dove supportato
  useEffect(() => {
    let lock: { release(): Promise<void> } | null = null;
    (navigator as unknown as { wakeLock?: { request(t: string): Promise<typeof lock> } }).wakeLock?.request("screen").then((l) => (lock = l)).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, []);

  if (!plan || !day) return <div className="session"><p className="empty">Allenamento non trovato.</p><button className="btn" onClick={() => nav("/c")}>Indietro</button></div>;

  const step = steps[idx];
  const workSteps = steps.filter((s) => s.kind === "work").length;
  const doneCount = Object.values(sets).filter((s) => s.done).length;
  const go = (d: number) => { setShowInfo(false); setIdx((i) => Math.max(0, Math.min(steps.length - 1, i + d))); };

  const record = (s: Extract<Step, { kind: "work" }>, patch: Partial<SetLog>) => {
    const k = key(s.block.id, s.item.id, s.round);
    setSets((prev) => ({
      ...prev,
      [k]: {
        ...(prev[k] ?? { blockId: s.block.id, itemId: s.item.id, exerciseId: s.item.exerciseId, setIndex: s.round, reps: defReps(s.item), load: lastLoads.get(s.item.exerciseId) ?? s.item.load, done: false }),
        ...patch,
      },
    }));
  };

  const finish = () => {
    store.addLog({
      id: uid(), clientId: plan.clientId!, planId: plan.id, dayId: day.id, dayName: day.name, date: new Date().toISOString(),
      durationSec: Math.round((Date.now() - startedAt) / 1000), sets: Object.values(sets), rpe, notes,
    });
    toast("Allenamento salvato");
    nav("/c/diario");
  };
  const exit = async () => { if (!doneCount || (await ask("Uscire? Le serie segnate non verranno salvate.", "Esci"))) nav("/c"); };

  return (
    <div className="session">
      <div className="session-top">
        <button className="btn ghost icon" onClick={exit} aria-label="Esci"><Icon name="x" /></button>
        <div className="progress"><i style={{ width: `${(idx / (steps.length - 1)) * 100}%` }} /></div>
        <span className="mono small muted">{doneCount}/{workSteps}</span>
      </div>

      {step.kind === "work" && (() => {
        const ex = exMap.get(step.item.exerciseId);
        const cur = sets[key(step.block.id, step.item.id, step.round)];
        const reps = cur?.reps ?? defReps(step.item);
        const load = cur?.load ?? lastLoads.get(step.item.exerciseId) ?? step.item.load;
        const grouped = step.block.type !== "single";
        const video = embedUrl(ex?.videoUrl ?? "");
        return (
          <div className="session-body">
            <div className="muted small" style={{ textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700 }}>
              {day.name} · {grouped ? `${step.block.type === "superset" ? "Superserie" : "Circuito"} ${step.bi + 1}${String.fromCharCode(97 + step.ii)} · giro` : "Serie"} {step.round + 1} di {step.block.sets}
            </div>
            <h1>{ex?.name ?? "Esercizio"}</h1>
            <div className="big-presc">{step.item.reps}{step.item.load && <span className="muted" style={{ fontSize: 26 }}> · {step.item.load}</span>}</div>
            {step.item.notes && <p className="muted" style={{ margin: 0 }}>{step.item.notes}</p>}
            <div className="set-inputs">
              <label className="field"><span>Ripetizioni</span><input inputMode="decimal" value={reps} onChange={(e) => record(step, { reps: e.target.value })} /></label>
              <label className="field"><span>Carico</span><input value={load} onChange={(e) => record(step, { load: e.target.value })} placeholder="kg" /></label>
            </div>
            {(ex?.description || ex?.videoUrl) && <button className="btn ghost sm" onClick={() => setShowInfo((v) => !v)}>{showInfo ? "Nascondi" : "Come si esegue"}</button>}
            {showInfo && ex && (
              <div style={{ width: "100%", textAlign: "left" }}>
                {ex.description && <p>{ex.description}</p>}
                {video ? <div className="video"><iframe src={video} title={ex.name} allowFullScreen /></div> : ex.videoUrl && <a href={ex.videoUrl} target="_blank" rel="noreferrer">Guarda il video</a>}
              </div>
            )}
            <div className="row" style={{ width: "100%" }}>
              <button className="btn" onClick={() => go(-1)} disabled={idx === 0} aria-label="Indietro"><Icon name="back" /></button>
              <button className="btn primary big grow" onClick={() => { unlockAudio(); record(step, { reps, load, done: true }); go(1); }}><Icon name="check" />Serie fatta</button>
              <button className="btn" onClick={() => go(1)} aria-label="Salta"><Icon name="skip" /></button>
            </div>
          </div>
        );
      })()}

      {step.kind === "rest" && <Rest key={idx} secs={step.secs} next={step.nextLabel} onDone={() => go(1)} onBack={() => go(-1)} />}

      {step.kind === "done" && (
        <div className="session-body">
          <h1>Ottimo lavoro!</h1>
          <p className="muted" style={{ margin: 0 }}>{doneCount} serie su {workSteps} · {fmtDuration((Date.now() - startedAt) / 1000)}</p>
          <div style={{ width: "100%" }}>
            <p style={{ marginBottom: 8 }}><b>Quanto è stato faticoso?</b> <span className="muted small">(1 leggero, 10 massimo)</span></p>
            <div className="rpe">{Array.from({ length: 10 }, (_, i) => <button key={i} aria-pressed={rpe === i + 1} onClick={() => setRpe(i + 1)}>{i + 1}</button>)}</div>
          </div>
          <label className="field" style={{ width: "100%", textAlign: "left" }}><span>Note per il trainer</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Come ti sei sentito, fastidi, carichi da rivedere…" /></label>
          <div className="row" style={{ width: "100%" }}>
            <button className="btn" onClick={() => go(-1)}><Icon name="back" /></button>
            <button className="btn primary big grow" onClick={finish}>Salva allenamento</button>
          </div>
        </div>
      )}
    </div>
  );
}

const defReps = (it: BlockItem) => it.reps.split(/[-–]/)[0].trim();

function Rest({ secs, next, onDone, onBack }: { secs: number; next: string; onDone(): void; onBack(): void }) {
  const [end, setEnd] = useState(() => Date.now() + secs * 1000);
  const [total, setTotal] = useState(secs);
  const [now, setNow] = useState(Date.now());
  const lastBeep = useRef(-1);
  const left = Math.max(0, Math.ceil((end - now) / 1000));

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (left <= 3 && left > 0 && lastBeep.current !== left) { lastBeep.current = left; countSound(); }
    if (left === 0) { endSound(); onDone(); }
  }, [left, onDone]);

  const R = 108, C = 2 * Math.PI * R;
  const add = (d: number) => { setEnd((e) => e + d * 1000); setTotal((t) => Math.max(1, t + d)); };
  return (
    <div className="session-body">
      <div className="muted small" style={{ textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700 }}>Recupero</div>
      <div className="ring">
        <svg width="240" height="240" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
          <circle cx="120" cy="120" r={R} fill="none" stroke="var(--accent)" strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - left / total)} style={{ transition: "stroke-dashoffset .2s linear" }} />
        </svg>
        <div className="t">{fmtDuration(left)}</div>
      </div>
      {next && <p className="muted" style={{ margin: 0 }}>Prossimo: <b style={{ color: "var(--fg)" }}>{next}</b></p>}
      <div className="row">
        <button className="btn" onClick={() => add(-15)}>−15"</button>
        <button className="btn" onClick={() => add(15)}>+15"</button>
      </div>
      <div className="row" style={{ width: "100%" }}>
        <button className="btn" onClick={onBack}><Icon name="back" /></button>
        <button className="btn primary big grow" onClick={onDone}><Icon name="skip" />Salta recupero</button>
      </div>
    </div>
  );
}
