import type { AppData, ID, Plan, WorkoutLog } from "./types";

export const plansOf = (d: Pick<AppData, "plans">, clientId: ID) => d.plans.filter((p) => p.clientId === clientId);

/** Scheda in uso: l'ultima attiva assegnata al cliente */
export const activePlanOf = (d: Pick<AppData, "plans">, clientId: ID): Plan | undefined =>
  plansOf(d, clientId).filter((p) => p.active).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

export const logsOf = (d: Pick<AppData, "logs">, clientId: ID): WorkoutLog[] =>
  d.logs.filter((l) => l.clientId === clientId).sort((a, b) => b.date.localeCompare(a.date));

export const lastLogOf = (d: Pick<AppData, "logs">, clientId: ID) => logsOf(d, clientId)[0];

export const volume = (l: WorkoutLog) =>
  l.sets.reduce((t, s) => {
    const kg = parseFloat(String(s.load).replace(",", ".").replace("+", "")), r = parseFloat(s.reps);
    return s.done && !isNaN(kg) && !isNaN(r) ? t + kg * r : t;
  }, 0);

export const exerciseCount = (p: Plan) => p.days.reduce((t, d) => t + d.blocks.reduce((u, b) => u + b.items.length, 0), 0);
