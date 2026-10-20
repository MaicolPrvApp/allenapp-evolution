import type { Block, BlockItem, Equipment, Exercise, ID, Level, Plan, PlanDay } from "../data/types";
import { nowIso, uid } from "./util";

// Generatore automatico di schede: sceglie lo split dai giorni disponibili,
// gli esercizi dagli schemi motori compatibili con attrezzatura e livello,
// e serie/ripetizioni/recuperi dall'obiettivo.

export type Goal = "ipertrofia" | "forza" | "dimagrimento" | "tonificazione" | "condizionamento";
export type Place = "palestra" | "casa" | "corpo libero";

export interface GenInput {
  goal: Goal;
  level: Level;
  days: 2 | 3 | 4 | 5;
  place: Place;
  minutes: 30 | 45 | 60 | 75;
  seed: number; // cambia per ottenere una variante
}

type Slot = "knee" | "hinge" | "pushH" | "pushV" | "pullH" | "pullV" | "lunge" | "ham" | "shoulders" | "biceps" | "triceps" | "core" | "calves";

const CANDIDATES: Record<Slot, ID[]> = {
  knee: ["ex-squat", "ex-leg-press", "ex-front-squat", "ex-goblet-squat", "ex-bulgarian", "ex-elastico-squat", "ex-squat-cl", "ex-jump-squat"],
  hinge: ["ex-stacco", "ex-rdl", "ex-hip-thrust", "ex-rdl-man", "ex-swing", "ex-ponte-glutei"],
  pushH: ["ex-panca-piana", "ex-chest-press", "ex-panca-inclinata-man", "ex-dip", "ex-piegamenti", "ex-piegamenti-ginocchia"],
  pushV: ["ex-lento-avanti", "ex-shoulder-press-man", "ex-pike-pushup"],
  pullH: ["ex-rematore-bil", "ex-pulley", "ex-rematore-man", "ex-elastico-row", "ex-superman"],
  pullV: ["ex-trazioni", "ex-lat-machine", "ex-pullover-cavo", "ex-elastico-row", "ex-superman"],
  lunge: ["ex-affondi", "ex-bulgarian", "ex-step-up", "ex-affondi-cl"],
  ham: ["ex-leg-curl", "ex-good-morning", "ex-rdl-man", "ex-ponte-glutei", "ex-kickback-cavo"],
  shoulders: ["ex-alzate-laterali", "ex-face-pull", "ex-alzate-90", "ex-alzate-frontali", "ex-pike-pushup"],
  biceps: ["ex-curl-bil", "ex-curl-man", "ex-curl-martello", "ex-curl-cavo"],
  triceps: ["ex-pushdown", "ex-french-press", "ex-estensioni-man", "ex-dip-panca"],
  core: ["ex-plank", "ex-dead-bug", "ex-crunch-inverso", "ex-pallof", "ex-plank-laterale", "ex-russian-twist", "ex-crunch"],
  calves: ["ex-calf-in-piedi", "ex-calf-seduto"],
};
const CARDIO: ID[] = ["ex-burpees", "ex-mountain-climber", "ex-jumping-jack", "ex-swing", "ex-jump-squat"];
/** Esercizi tecnici sconsigliati a chi inizia */
const ADVANCED = new Set<ID>(["ex-stacco", "ex-front-squat", "ex-trazioni", "ex-dip", "ex-good-morning"]);
/** Servono attrezzi da palestra anche se classificati a corpo libero (parallele) */
const GYM_ONLY = new Set<ID>(["ex-dip", "ex-leg-raise"]);

const PLACE_EQUIPMENT: Record<Place, Equipment[] | null> = {
  palestra: null,
  casa: ["corpo libero", "manubri", "elastici", "kettlebell", "altro"],
  "corpo libero": ["corpo libero"],
};

const TEMPLATES: Record<string, Slot[]> = {
  fullA: ["knee", "pushH", "pullH", "hinge", "pushV", "core", "biceps", "triceps"],
  fullB: ["hinge", "pushV", "pullV", "lunge", "pushH", "core", "shoulders", "calves"],
  fullC: ["knee", "pullV", "pushH", "ham", "shoulders", "core", "triceps", "biceps"],
  push: ["pushH", "pushV", "pushH", "shoulders", "triceps", "core", "triceps"],
  pull: ["hinge", "pullV", "pullH", "shoulders", "biceps", "core", "biceps"],
  legs: ["knee", "hinge", "lunge", "ham", "calves", "core", "knee"],
  upperA: ["pushH", "pullH", "pushV", "pullV", "shoulders", "biceps", "triceps"],
  upperB: ["pullV", "pushH", "pullH", "pushV", "triceps", "biceps", "shoulders"],
  lowerA: ["knee", "hinge", "lunge", "ham", "calves", "core", "knee"],
  lowerB: ["hinge", "knee", "lunge", "ham", "core", "calves", "hinge"],
};
const DAY_NAMES: Record<string, string> = {
  fullA: "Total body A", fullB: "Total body B", fullC: "Total body C", push: "Spinta", pull: "Trazione", legs: "Gambe",
  upperA: "Parte alta A", upperB: "Parte alta B", lowerA: "Parte bassa A", lowerB: "Parte bassa B",
};

function split(days: number, level: Level): string[] {
  if (days === 2) return ["fullA", "fullB"];
  if (days === 3) return level === "principiante" ? ["fullA", "fullB", "fullC"] : ["push", "pull", "legs"];
  if (days === 4) return ["upperA", "lowerA", "upperB", "lowerB"];
  return ["push", "pull", "legs", "upperA", "lowerB"];
}

interface Params { mainSets: number; mainReps: string; mainRest: number; accSets: number; accReps: string; accRest: number; grouping: "none" | "superset" | "circuit" }
const PARAMS: Record<Goal, Params> = {
  forza: { mainSets: 5, mainReps: "5", mainRest: 180, accSets: 3, accReps: "8", accRest: 120, grouping: "none" },
  ipertrofia: { mainSets: 4, mainReps: "8-10", mainRest: 120, accSets: 3, accReps: "10-12", accRest: 75, grouping: "none" },
  tonificazione: { mainSets: 3, mainReps: "12", mainRest: 75, accSets: 3, accReps: "12-15", accRest: 60, grouping: "superset" },
  dimagrimento: { mainSets: 3, mainReps: "12", mainRest: 60, accSets: 3, accReps: "15", accRest: 60, grouping: "circuit" },
  condizionamento: { mainSets: 3, mainReps: "10", mainRest: 60, accSets: 4, accReps: "40s", accRest: 90, grouping: "circuit" },
};
const EX_PER_DAY: Record<GenInput["minutes"], number> = { 30: 4, 45: 5, 60: 6, 75: 7 };

/** Pseudo-casuale riproducibile dal seed */
const rng = (seed: number) => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

export function generatePlan(input: GenInput, exercises: Exercise[]): Plan {
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const allowed = PLACE_EQUIPMENT[input.place];
  const ok = (id: ID) => {
    const e = byId.get(id);
    return !!e && (!allowed || (allowed.includes(e.equipment) && !GYM_ONLY.has(id))) && !(input.level === "principiante" && ADVANCED.has(id));
  };
  const rand = rng(input.seed + 1);
  const p = PARAMS[input.goal];
  const beginner = input.level === "principiante";
  const n = EX_PER_DAY[input.minutes];
  const isTime = (id: ID) => ["ex-plank", "ex-plank-laterale", "ex-wall-sit"].includes(id);

  const days: PlanDay[] = split(input.days, input.level).map((tpl, di) => {
    const used = new Set<ID>();
    const picks: ID[] = [];
    for (const slot of TEMPLATES[tpl]) {
      if (picks.length >= n) break;
      const pool = CANDIDATES[slot].filter((id) => ok(id) && !used.has(id));
      if (!pool.length) continue;
      // i primi candidati sono i preferiti: la variante sceglie tra i primi tre
      const id = pool[Math.floor(rand() * Math.min(3, pool.length) + (di % 2 ? 0.4 : 0)) % pool.length];
      used.add(id);
      picks.push(id);
    }
    const reps = (id: ID, r: string) => (isTime(id) ? (input.goal === "forza" ? "40s" : "30s") : r);
    const item = (id: ID, r: string): BlockItem => ({ id: uid(), exerciseId: id, reps: reps(id, r), load: "", notes: "" });
    const blocks: Block[] = [];
    const mains = picks.slice(0, 2), acc = picks.slice(2);
    mains.forEach((id) => blocks.push({ id: uid(), type: "single", sets: Math.max(2, p.mainSets - (beginner ? 1 : 0)), restSec: p.mainRest, items: [item(id, p.mainReps)] }));
    const accSets = Math.max(2, p.accSets - (beginner ? 1 : 0));
    if (p.grouping === "none") acc.forEach((id) => blocks.push({ id: uid(), type: "single", sets: accSets, restSec: p.accRest, items: [item(id, p.accReps)] }));
    else if (p.grouping === "superset") {
      for (let i = 0; i < acc.length; i += 2) {
        const pair = acc.slice(i, i + 2);
        blocks.push({ id: uid(), type: pair.length > 1 ? "superset" : "single", sets: accSets, restSec: p.accRest, items: pair.map((id) => item(id, p.accReps)) });
      }
    } else if (acc.length) {
      blocks.push({ id: uid(), type: acc.length > 2 ? "circuit" : "superset", sets: accSets, restSec: p.accRest, items: acc.map((id) => item(id, p.accReps)) });
    }
    if (input.goal === "dimagrimento" || input.goal === "condizionamento") {
      const cardio = CARDIO.filter((id) => ok(id) && !used.has(id)).slice(0, 2);
      if (cardio.length) blocks.push({ id: uid(), type: cardio.length > 1 ? "superset" : "single", sets: beginner ? 3 : 4, restSec: 45, items: cardio.map((id) => item(id, "30s")) });
    }
    return { id: uid(), name: DAY_NAMES[tpl], notes: "Riscaldamento: 5-8 minuti di cardio leggero e mobilità articolare.", blocks };
  });

  const goalLabel = input.goal[0].toUpperCase() + input.goal.slice(1);
  return {
    id: uid(), name: `${goalLabel} · ${input.days} giorni`, clientId: null, goal: goalLabel,
    description: `Generata automaticamente: livello ${input.level}, ${input.place}, circa ${input.minutes} minuti a seduta. Rivedi carichi ed esercizi prima di assegnarla.`,
    startDate: "", weeks: input.goal === "forza" ? 6 : 8, active: true, days, createdAt: nowIso(), updatedAt: nowIso(),
  };
}
