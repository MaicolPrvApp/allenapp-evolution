import { useEffect, useState, type ReactNode } from "react";
import { create } from "zustand";
import { Icon } from "./Icon";
import type { MuscleGroup } from "../data/types";

export function Modal({ title, onClose, children, footer }: { title: ReactNode; onClose(): void; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <h2 className="grow">{title}</h2>
          <button className="btn ghost icon" onClick={onClose} aria-label="Chiudi"><Icon name="x" /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-head row end">{footer}</div>}
      </div>
    </div>
  );
}

const useToastStore = create<{ msg: string | null; show(m: string): void }>((set) => ({
  msg: null,
  show: (msg) => {
    set({ msg });
    setTimeout(() => set((s) => (s.msg === msg ? { msg: null } : s)), 2200);
  },
}));
export const toast = (m: string) => useToastStore.getState().show(m);
export function Toaster() {
  const msg = useToastStore((s) => s.msg);
  return msg ? <div className="toast" role="status">{msg}</div> : null;
}

// Colore per distretto muscolare, usato nelle miniature degli esercizi
const HUE: Record<MuscleGroup, number> = {
  petto: 210, dorso: 190, spalle: 260, bicipiti: 290, tricipiti: 320, avambracci: 340,
  quadricipiti: 20, femorali: 35, glutei: 0, polpacci: 50, addome: 140, cardio: 170, "total body": 100,
};
export function MuscleThumb({ muscle }: { muscle: MuscleGroup }) {
  const h = HUE[muscle] ?? 210;
  return (
    <span className="mthumb" style={{ background: `hsl(${h} 70% 55% / .16)`, color: `hsl(${h} 75% 62%)` }}>
      {muscle.slice(0, 3)}
    </span>
  );
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange(v: string): void; placeholder: string }) {
  return (
    <label className="search grow field" style={{ minWidth: 200 }}>
      <Icon name="search" size={16} />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </label>
  );
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange(v: T): void; items: [T, string][] }) {
  return (
    <div className="tabs" role="tablist">
      {items.map(([k, label]) => (
        <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)}>{label}</button>
      ))}
    </div>
  );
}

/** Stato locale di un form che si salva solo su conferma */
export function useDraft<T>(initial: T) {
  const [draft, setDraft] = useState<T>(initial);
  const set = <K extends keyof T>(k: K, v: T[K]) => setDraft((d) => ({ ...d, [k]: v }));
  return [draft, set, setDraft] as const;
}

export function LineChart({ points, unit = "" }: { points: { label: string; value: number }[]; unit?: string }) {
  if (points.length < 2) return <p className="muted small">Servono almeno due sessioni per disegnare l'andamento.</p>;
  const W = 640, H = 220, L = 44, R = 12, T = 12, B = 28;
  const vals = points.map((p) => p.value);
  let min = Math.min(...vals), max = Math.max(...vals);
  if (min === max) { min -= 1; max += 1; }
  // scala "pulita": passo 1/2/5 × 10^n, così le etichette sono numeri tondi
  const raw = (max - min) / 3, mag = 10 ** Math.floor(Math.log10(raw));
  const stepV = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  min = Math.floor(min / stepV) * stepV; max = Math.ceil(max / stepV) * stepV;
  const x = (i: number) => L + (i * (W - L - R)) / (points.length - 1);
  const y = (v: number) => T + (1 - (v - min) / (max - min)) * (H - T - B);
  const ticks: number[] = [];
  for (let t = min; t <= max + stepV / 2; t += stepV) ticks.push(t);
  const step = Math.ceil(points.length / 6);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Andamento">
      {ticks.map((t) => (
        <g key={t}>
          <line className="grid-line" x1={L} x2={W - R} y1={y(t)} y2={y(t)} />
          <text className="axis" x={L - 6} y={y(t) + 4} textAnchor="end">{+t.toFixed(2)}</text>
        </g>
      ))}
      {points.map((p, i) => i % step === 0 || i === points.length - 1 ? (
        <text key={i} className="axis" x={x(i)} y={H - 8} textAnchor="middle">{p.label}</text>
      ) : null)}
      <path className="line" d={points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ")} />
      {points.map((p, i) => (
        <circle key={i} className="dot" cx={x(i)} cy={y(p.value)} r={4}><title>{`${p.label}: ${p.value}${unit}`}</title></circle>
      ))}
    </svg>
  );
}

// Conferma dentro l'app (al posto di window.confirm, che alcuni contenitori bloccano)
const useAskStore = create<{ q: { msg: string; ok: string; resolve(v: boolean): void } | null }>(() => ({ q: null }));
export const ask = (msg: string, ok = "Conferma") =>
  new Promise<boolean>((resolve) => useAskStore.setState({ q: { msg, ok, resolve } }));
export function AskDialog() {
  const q = useAskStore((s) => s.q);
  if (!q) return null;
  const close = (v: boolean) => { useAskStore.setState({ q: null }); q.resolve(v); };
  return (
    <Modal title="Sei sicuro?" onClose={() => close(false)} footer={<>
      <button className="btn ghost" onClick={() => close(false)}>Annulla</button>
      <button className="btn primary" onClick={() => close(true)} autoFocus>{q.ok}</button>
    </>}>
      <p style={{ margin: 0 }}>{q.msg}</p>
    </Modal>
  );
}

/** true quando l'app gira dentro un'altra pagina (anteprima): niente stampa né video incorporati */
export const isFramed = (() => { try { return window.self !== window.top; } catch { return true; } })();
