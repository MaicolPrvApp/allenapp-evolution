import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppData, Client, Exercise, ID, Plan, WorkoutLog } from "./types";
import { createSeed } from "./seed";
import { nowIso, uid } from "../lib/util";

// Unico punto di accesso ai dati. Oggi salva nel browser (localStorage);
// per passare a un database online basta sostituire la persistenza mantenendo le stesse azioni.

export type Role = "trainer" | "client";

interface UiState {
  role: Role;
  /** Cliente impersonato nell'area cliente (in produzione sarà l'utente autenticato) */
  meId: ID | null;
}

interface Actions {
  setRole(role: Role): void;
  setMe(id: ID | null): void;

  saveClient(c: Client): void;
  deleteClient(id: ID): void;

  saveExercise(e: Exercise): void;
  deleteExercise(id: ID): void;

  savePlan(p: Plan): void;
  deletePlan(id: ID): void;
  duplicatePlan(id: ID, clientId: ID | null): ID;

  addLog(l: WorkoutLog): void;
  deleteLog(id: ID): void;

  resetDemo(): void;
  importData(d: AppData): void;
}

export type Store = AppData & UiState & Actions;

const upsert = <T extends { id: ID }>(list: T[], x: T) =>
  list.some((y) => y.id === x.id) ? list.map((y) => (y.id === x.id ? x : y)) : [...list, x];

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...createSeed(),
      role: "trainer",
      meId: null,

      setRole: (role) => set({ role }),
      setMe: (meId) => set({ meId }),

      saveClient: (c) => set((s) => ({ clients: upsert(s.clients, c) })),
      deleteClient: (id) =>
        set((s) => ({
          clients: s.clients.filter((c) => c.id !== id),
          plans: s.plans.filter((p) => p.clientId !== id),
          logs: s.logs.filter((l) => l.clientId !== id),
          meId: s.meId === id ? null : s.meId,
        })),

      saveExercise: (e) => set((s) => ({ exercises: upsert(s.exercises, e) })),
      deleteExercise: (id) => set((s) => ({ exercises: s.exercises.filter((e) => e.id !== id) })),

      savePlan: (p) => set((s) => ({ plans: upsert(s.plans, { ...p, updatedAt: nowIso() }) })),
      deletePlan: (id) => set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),
      duplicatePlan: (id, clientId) => {
        const src = get().plans.find((p) => p.id === id);
        if (!src) return "";
        // nuovi id a giorni/blocchi/item così le due schede restano indipendenti
        const copy: Plan = structuredClone(src);
        copy.id = uid();
        copy.clientId = clientId;
        copy.name = clientId === src.clientId ? `${src.name} (copia)` : src.name;
        copy.startDate = clientId ? new Date().toISOString().slice(0, 10) : "";
        copy.createdAt = copy.updatedAt = nowIso();
        copy.days.forEach((d) => {
          d.id = uid();
          d.blocks.forEach((b) => {
            b.id = uid();
            b.items.forEach((i) => (i.id = uid()));
          });
        });
        set((s) => ({ plans: [...s.plans, copy] }));
        return copy.id;
      },

      addLog: (l) => set((s) => ({ logs: [...s.logs, l] })),
      deleteLog: (id) => set((s) => ({ logs: s.logs.filter((l) => l.id !== id) })),

      resetDemo: () => set({ ...createSeed(), meId: null }),
      importData: (d) => set({ clients: d.clients, exercises: d.exercises, plans: d.plans, logs: d.logs, meId: null }),
    }),
    { name: "allenapp-data", version: 1 }
  )
);

/** Esporta solo i dati (senza azioni né stato dell'interfaccia) */
export function exportData(): AppData {
  const { version, clients, exercises, plans, logs } = useStore.getState();
  return { version, clients, exercises, plans, logs };
}

export const useExerciseMap = () => {
  const exercises = useStore((s) => s.exercises);
  return new Map(exercises.map((e) => [e.id, e]));
};
