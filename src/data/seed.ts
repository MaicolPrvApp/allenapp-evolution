import type { AppData, Block, BlockItem, Client, Plan, PlanDay, WorkoutLog } from "./types";
import { LIBRARY } from "./exerciseLibrary";
import { uid } from "../lib/util";

// Dati dimostrativi: due clienti, un modello e due schede assegnate con qualche sessione già svolta.

const item = (exerciseId: string, reps: string, load = "", notes = ""): BlockItem => ({ id: uid(), exerciseId, reps, load, notes });
const single = (exerciseId: string, sets: number, reps: string, restSec: number, load = "", notes = ""): Block =>
  ({ id: uid(), type: "single", sets, restSec, items: [item(exerciseId, reps, load, notes)] });
const group = (type: "superset" | "circuit", sets: number, restSec: number, items: BlockItem[]): Block =>
  ({ id: uid(), type, sets, restSec, items });
const day = (name: string, blocks: Block[], notes = ""): PlanDay => ({ id: uid(), name, notes, blocks });

export function createSeed(): AppData {
  const now = new Date();
  const iso = (daysBack: number) => new Date(now.getTime() - daysBack * 86400000).toISOString();

  const giulia: Client = {
    id: uid(), firstName: "Giulia", lastName: "Ferri", email: "giulia@example.com", phone: "333 111 2233",
    birthDate: "1994-05-12", sex: "F", goal: "Tonificazione e forza", level: "intermedio",
    notes: "Lieve fastidio al ginocchio sinistro: evitare salti ad alto impatto.", active: true, createdAt: iso(60),
  };
  const marco: Client = {
    id: uid(), firstName: "Marco", lastName: "Rinaldi", email: "marco@example.com", phone: "347 555 9876",
    birthDate: "1988-11-03", sex: "M", goal: "Ipertrofia", level: "avanzato", notes: "", active: true, createdAt: iso(120),
  };
  const sara: Client = {
    id: uid(), firstName: "Sara", lastName: "Conti", email: "sara@example.com", phone: "",
    birthDate: "2000-02-20", sex: "F", goal: "Dimagrimento", level: "principiante", notes: "Si allena a casa con manubri ed elastici.", active: true, createdAt: iso(10),
  };

  const template: Plan = {
    id: uid(), name: "Full body principianti", description: "Tre sedute a settimana per imparare i movimenti base.", goal: "Condizionamento generale",
    clientId: null, startDate: "", weeks: 6, active: true, createdAt: iso(90), updatedAt: iso(90),
    days: [
      day("Giorno A", [
        single("ex-goblet-squat", 3, "12", 90, "12 kg"),
        single("ex-chest-press", 3, "12", 90),
        single("ex-lat-machine", 3, "12", 90),
        group("circuit", 2, 60, [item("ex-plank", "30s"), item("ex-ponte-glutei", "15"), item("ex-dead-bug", "10")]),
      ]),
      day("Giorno B", [
        single("ex-leg-press", 3, "12", 90),
        single("ex-shoulder-press-man", 3, "10", 90),
        single("ex-pulley", 3, "12", 90),
        group("superset", 2, 60, [item("ex-crunch", "15"), item("ex-plank-laterale", "20s")]),
      ]),
    ],
  };

  const giuliaPlan: Plan = {
    id: uid(), name: "Forza e tono · blocco 1", description: "Upper/lower su 4 giorni.", goal: giulia.goal,
    clientId: giulia.id, startDate: iso(21).slice(0, 10), weeks: 8, active: true, createdAt: iso(21), updatedAt: iso(21),
    days: [
      day("Lower", [
        single("ex-squat", 4, "8", 120, "40 kg", "Scendi sotto il parallelo se il ginocchio non dà fastidio."),
        single("ex-rdl", 3, "10", 90, "35 kg"),
        group("superset", 3, 75, [item("ex-hip-thrust", "12", "50 kg"), item("ex-leg-curl", "12", "20 kg")]),
        single("ex-calf-in-piedi", 3, "15", 45),
      ], "Riscaldamento: 8 minuti di cyclette e mobilità anche."),
      day("Upper", [
        single("ex-panca-inclinata-man", 4, "10", 90, "12 kg"),
        single("ex-trazioni", 4, "6", 120, "elastico verde"),
        group("superset", 3, 60, [item("ex-alzate-laterali", "12", "6 kg"), item("ex-face-pull", "15", "15 kg")]),
        group("circuit", 2, 60, [item("ex-pushdown", "12", "15 kg"), item("ex-curl-man", "12", "8 kg"), item("ex-plank", "40s")]),
      ]),
    ],
  };

  const marcoPlan: Plan = {
    id: uid(), name: "Ipertrofia push/pull/legs", description: "Volume medio-alto, 6 sedute.", goal: marco.goal,
    clientId: marco.id, startDate: iso(35).slice(0, 10), weeks: 10, active: true, createdAt: iso(35), updatedAt: iso(35),
    days: [
      day("Push", [
        single("ex-panca-piana", 4, "6-8", 150, "85 kg"),
        single("ex-panca-inclinata-man", 3, "8-10", 90, "30 kg"),
        single("ex-lento-avanti", 3, "8", 120, "50 kg"),
        group("superset", 3, 60, [item("ex-alzate-laterali", "15", "10 kg"), item("ex-pushdown", "12", "30 kg")]),
      ]),
      day("Pull", [
        single("ex-stacco", 3, "5", 180, "140 kg"),
        single("ex-trazioni", 4, "8", 120, "+10 kg"),
        single("ex-rematore-bil", 3, "10", 90, "70 kg"),
        group("superset", 3, 60, [item("ex-curl-bil", "10", "35 kg"), item("ex-curl-martello", "12", "14 kg")]),
      ]),
      day("Legs", [
        single("ex-squat", 4, "6-8", 180, "110 kg"),
        single("ex-leg-press", 3, "12", 120, "200 kg"),
        single("ex-leg-curl", 3, "12", 60, "45 kg"),
        single("ex-calf-in-piedi", 4, "12", 45, "80 kg"),
      ]),
    ],
  };

  const logs: WorkoutLog[] = [];
  const addLog = (c: Client, p: Plan, di: number, daysBack: number, bump: number) => {
    const d = p.days[di];
    const sets = d.blocks.flatMap((b) =>
      Array.from({ length: b.sets }, (_, s) =>
        b.items.map((it) => {
          const base = parseFloat(it.load.replace(",", ".").replace("+", ""));
          const load = isNaN(base) ? it.load : `${base + bump} kg`;
          return { blockId: b.id, itemId: it.id, exerciseId: it.exerciseId, setIndex: s, reps: it.reps.split("-")[0], load, done: true };
        })
      ).flat()
    );
    logs.push({ id: uid(), clientId: c.id, planId: p.id, dayId: d.id, dayName: d.name, date: iso(daysBack), durationSec: 3000 + daysBack * 13, sets, rpe: 7, notes: "" });
  };
  [[20, -5], [17, -5], [13, -2.5], [10, -2.5], [6, 0], [3, 0]].forEach(([back, bump], i) => addLog(giulia, giuliaPlan, i % 2, back, bump));
  [[30, -10], [26, -10], [22, -5], [18, -5], [12, 0], [8, 0], [4, 2.5], [2, 2.5]].forEach(([back, bump], i) => addLog(marco, marcoPlan, i % 3, back, bump));

  return { version: 1, clients: [giulia, marco, sara], exercises: LIBRARY, plans: [template, giuliaPlan, marcoPlan], logs };
}
