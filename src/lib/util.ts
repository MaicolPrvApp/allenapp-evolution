export const uid = () =>
  (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(0, 12);

export const nowIso = () => new Date().toISOString();
export const today = () => new Date().toISOString().slice(0, 10);

export function fmtDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60), s = Math.round(sec % 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}:${String(s).padStart(2, "0")}`;
}

export function fmtRest(sec: number) {
  if (!sec) return "nessuno";
  return sec >= 60 ? `${Math.floor(sec / 60)}'${sec % 60 ? String(sec % 60).padStart(2, "0") + '"' : ""}` : `${sec}"`;
}

export function age(birth: string) {
  if (!birth) return null;
  const b = new Date(birth), n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
}

export const fullName = (c: { firstName: string; lastName: string }) => `${c.firstName} ${c.lastName}`.trim();
export const initials = (c: { firstName: string; lastName: string }) =>
  ((c.firstName[0] ?? "") + (c.lastName[0] ?? "")).toUpperCase() || "?";

/** Estrae il primo numero da "40 kg", "42,5" ecc. */
export const num = (s: string) => {
  const m = String(s ?? "").replace(",", ".").match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : NaN;
};

export function daysAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? "oggi" : d === 1 ? "ieri" : `${d} giorni fa`;
}
