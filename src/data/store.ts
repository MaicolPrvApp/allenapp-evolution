import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Anamnesis, AppData, Appointment, Assessment, Client, Exercise, Food, ID, MealPlan, Message, Plan, WorkoutLog } from "./types";
import { createExtras, createSeed } from "./seed";
import { LIBRARY } from "./exerciseLibrary";
import { nowIso, uid } from "../lib/util";

// Unico punto di accesso ai dati. Oggi salva nel browser (localStorage);
// per passare a un database online basta sostituire la persistenza mantenendo le stesse azioni.

export type Role = "trainer" | "client";

interface UiState {
  role: Role;
  /** Cliente impersonato nell'area cliente (in produzione sarà l'utente autenticato) */
  meId: ID | null;
}

/** Collezioni con id, gestite dalle azioni generiche save/remove */
type Collections = {
  assessments: Assessment;
  appointments: Appointment;
  foods: Food;
  mealPlans: MealPlan;
  messages: Message;
};
type CollName = keyof Collections;

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

  save<K extends CollName>(coll: K, item: Collections[K]): void;
  remove(coll: CollName, id: ID): void;
  saveAnamnesis(a: Anamnesis): void;
  duplicateMealPlan(id: ID, clientId: ID | null): ID;
  sendMessage(clientId: ID, from: Message["from"], text: string): void;
  markRead(clientId: ID, reader: Message["from"]): void;

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
          assessments: s.assessments.filter((a) => a.clientId !== id),
          anamneses: s.anamneses.filter((a) => a.clientId !== id),
          appointments: s.appointments.filter((a) => a.clientId !== id),
          mealPlans: s.mealPlans.filter((p) => p.clientId !== id),
          messages: s.messages.filter((m) => m.clientId !== id),
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

      save: (coll, item) => set((s) => ({ [coll]: upsert(s[coll] as { id: ID }[], item) }) as Partial<Store>),
      remove: (coll, id) => set((s) => ({ [coll]: (s[coll] as { id: ID }[]).filter((x) => x.id !== id) }) as Partial<Store>),
      saveAnamnesis: (a) =>
        set((s) => ({ anamneses: [...s.anamneses.filter((x) => x.clientId !== a.clientId), { ...a, updatedAt: nowIso() }] })),
      duplicateMealPlan: (id, clientId) => {
        const src = get().mealPlans.find((p) => p.id === id);
        if (!src) return "";
        const copy: MealPlan = structuredClone(src);
        copy.id = uid();
        copy.clientId = clientId;
        copy.name = clientId === src.clientId ? `${src.name} (copia)` : src.name;
        copy.createdAt = copy.updatedAt = nowIso();
        copy.meals.forEach((m) => { m.id = uid(); m.items.forEach((i) => (i.id = uid())); });
        set((s) => ({ mealPlans: [...s.mealPlans, copy] }));
        return copy.id;
      },
      sendMessage: (clientId, from, text) =>
        set((s) => ({ messages: [...s.messages, { id: uid(), clientId, from, text, date: nowIso(), read: false }] })),
      markRead: (clientId, reader) =>
        set((s) => ({ messages: s.messages.map((m) => (m.clientId === clientId && m.from !== reader && !m.read ? { ...m, read: true } : m)) })),

      resetDemo: () => set({ ...createSeed(), meId: null }),
      importData: (d) => {
        const empty = { assessments: [], anamneses: [], appointments: [], foods: createSeed().foods, mealPlans: [], messages: [] };
        set({ ...empty, ...d, version: 3, meId: null });
      },
    }),
    {
      name: "kinetika-data",
      version: 3,
      // la versione 1 non aveva valutazioni, agenda, alimentazione e messaggi: li aggiunge con dati di esempio
      migrate: (state, from) => {
        const s = state as Store;
        if (from < 2) {
          const now = Date.now();
          Object.assign(s, createExtras(s.clients ?? [], (b) => new Date(now - b * 86400000).toISOString()), { version: 2 });
        }
        if (from < 3) {
          // aggiunge gli esercizi nuovi dell'archivio di base senza toccare quelli esistenti
          const have = new Set((s.exercises ?? []).map((e) => e.id));
          s.exercises = [...(s.exercises ?? []), ...LIBRARY.filter((e) => !have.has(e.id))];
        }
        return s;
      },
    }
  )
);

/** Esporta solo i dati (senza azioni né stato dell'interfaccia) */
export function exportData(): AppData {
  const { version, clients, exercises, plans, logs, assessments, anamneses, appointments, foods, mealPlans, messages } = useStore.getState();
  return { version, clients, exercises, plans, logs, assessments, anamneses, appointments, foods, mealPlans, messages };
}
