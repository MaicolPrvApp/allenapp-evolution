import type { AppData, Appointment, Assessment, Block, BlockItem, Client, FoodLog, Meal, MealPlan, Message, Plan, PlanDay, WorkoutLog } from "./types";
import { FOODS } from "./foodLibrary";
import { LIBRARY } from "./exerciseLibrary";
import { nowIso, uid } from "../lib/util";
import { localDate } from "../lib/dates";

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

  const extra = createExtras([giulia, marco, sara], iso);
  return { version: 4, clients: [giulia, marco, sara], exercises: LIBRARY, plans: [template, giuliaPlan, marcoPlan], logs, ...extra };
}

/** Dati dimostrativi dei moduli valutazioni, agenda, alimentazione e messaggi */
export function createExtras(clients: Client[], iso: (daysBack: number) => string) {
  const [giulia, marco, sara] = clients;
  const day = (daysBack: number) => iso(daysBack).slice(0, 10);

  const assessments: Assessment[] = [];
  if (giulia) [[56, 64.8, 28, 22, 26], [28, 63.9, 26, 20, 24], [2, 63.1, 24, 18, 22]].forEach(([back, w, tri, sup, cos]) =>
    assessments.push({ id: uid(), clientId: giulia.id, date: day(back), weight: w, height: 167, restingHr: 64,
      circ: { vita: 72 - (56 - back) / 14, fianchi: 98 - (56 - back) / 20, braccio: 28, coscia: 56 }, folds: { tricipite: tri, soprailiaca: sup, coscia: cos }, method: "jp3", notes: "" }));
  if (marco) [[84, 82.5, 14, 22, 15], [42, 83.6, 12, 20, 14], [5, 84.4, 11, 18, 13]].forEach(([back, w, pet, add, cos]) =>
    assessments.push({ id: uid(), clientId: marco.id, date: day(back), weight: w, height: 180, restingHr: 58,
      circ: { torace: 104 + (84 - back) / 40, vita: 84, fianchi: 98, braccio: 38 + (84 - back) / 80, coscia: 60 }, folds: { pettorale: pet, addominale: add, coscia: cos }, method: "jp3", notes: "" }));

  const anamneses = giulia ? [{
    clientId: giulia.id, conditions: "Nessuna", injuries: "Condropatia rotulea ginocchio sinistro (2023), oggi asintomatica.", surgeries: "", medications: "",
    activity: "moderato" as const, sports: "Corsa 1 volta a settimana", sleepHours: 7, smoker: false, goalsDetail: "Rinforzare gambe e glutei, migliorare la postura.",
    availability: "Lun, mer, ven dopo le 18", medicalCertificateExpiry: day(-120), consent: true, updatedAt: iso(56),
  }] : [];

  // agenda: settimana corrente, ore piene
  const at = (daysAhead: number, h: number) => { const d = new Date(); d.setDate(d.getDate() + daysAhead); d.setHours(h, 0, 0, 0); return d.toISOString(); };
  const appointments: Appointment[] = [
    ...(giulia ? [{ id: uid(), clientId: giulia.id, type: "allenamento" as const, start: at(0, 18), durationMin: 60, location: "Sala pesi", notes: "", status: "confermato" as const }] : []),
    ...(marco ? [{ id: uid(), clientId: marco.id, type: "valutazione" as const, start: at(1, 7), durationMin: 45, location: "Studio", notes: "Plicometria e circonferenze", status: "confermato" as const }] : []),
    ...(sara ? [{ id: uid(), clientId: sara.id, type: "consulenza" as const, start: at(2, 19), durationMin: 30, location: "Online", notes: "Prima consulenza", status: "richiesto" as const }] : []),
    { id: uid(), clientId: null, type: "allenamento", start: at(1, 18), durationMin: 60, location: "Sala pesi", notes: "", status: "libero" },
    { id: uid(), clientId: null, type: "allenamento", start: at(3, 9), durationMin: 60, location: "Sala pesi", notes: "", status: "libero" },
    { id: uid(), clientId: null, type: "lezione di gruppo", start: at(4, 19), durationMin: 45, location: "Sala corsi", notes: "Circuito funzionale", status: "libero" },
  ];

  const meal = (name: string, time: string, items: [string, number][]): Meal => ({ id: uid(), name, time, items: items.map(([foodId, grams]) => ({ id: uid(), foodId, grams })) });
  const marcoMeals: Meal[] = [
    meal("Colazione", "07:30", [["f-avena", 80], ["f-latte-ps", 250], ["f-banana", 120], ["f-whey", 30]]),
    meal("Pranzo", "13:00", [["f-riso", 110], ["f-pollo", 180], ["f-zucchine", 200], ["f-olio", 15]]),
    meal("Spuntino", "16:30", [["f-yogurt-greco", 170], ["f-mandorle", 25], ["f-mela", 150]]),
    meal("Cena", "20:30", [["f-patate", 300], ["f-salmone", 180], ["f-broccoli", 200], ["f-olio", 10], ["f-pane-int", 60]]),
  ];
  const mealPlans: MealPlan[] = [
    { id: uid(), name: "Ipertrofia 2500 kcal", clientId: marco?.id ?? null, targetKcal: 2500, notes: "Bere almeno 2,5 litri d'acqua. Nei giorni di riposo togliere 40 g di riso a pranzo.", active: true, meals: marcoMeals, createdAt: iso(30), updatedAt: iso(30) },
    { id: uid(), name: "Base 1800 kcal", clientId: null, targetKcal: 1800, notes: "Modello di partenza per dimagrimento.", active: true, createdAt: iso(60), updatedAt: iso(60), meals: [
      meal("Colazione", "07:30", [["f-yogurt-greco", 170], ["f-avena", 40], ["f-frutti-bosco", 100]]),
      meal("Pranzo", "13:00", [["f-pasta-int", 70], ["f-tonno-nat", 120], ["f-pomodori", 150], ["f-olio", 10]]),
      meal("Spuntino", "16:30", [["f-mela", 150], ["f-noci", 15]]),
      meal("Cena", "20:00", [["f-merluzzo", 200], ["f-patate", 200], ["f-spinaci", 200], ["f-olio", 10]]),
    ] },
  ];

  const messages: Message[] = [];
  if (giulia) messages.push(
    { id: uid(), clientId: giulia.id, from: "trainer", text: "Ciao Giulia, da questa settimana aumentiamo lo squat a 42,5 kg se le ultime serie ti sono sembrate facili.", date: iso(4), read: true },
    { id: uid(), clientId: giulia.id, from: "client", text: "Perfetto! Il ginocchio va bene, nessun fastidio.", date: iso(3), read: false },
  );
  if (marco) messages.push({ id: uid(), clientId: marco.id, from: "client", text: "Domani posso spostare la valutazione alle 8?", date: iso(0.1), read: false });

  return { assessments, anamneses, appointments, foods: FOODS, mealPlans, foodLogs: createFoodLogs(mealPlans), messages };
}

/** Diario alimentare di esempio: gli ultimi giorni ricalcano il piano attivo con piccole variazioni */
export function createFoodLogs(mealPlans: MealPlan[]): FoodLog[] {
  const out: FoodLog[] = [];
  const now = Date.now();
  for (const p of mealPlans) {
    if (!p.clientId || !p.active) continue;
    for (const back of [3, 2, 1, 0]) {
      const date = localDate(new Date(now - back * 86400000).toISOString());
      const meals = back === 0 ? p.meals.slice(0, 1) : p.meals;
      meals.forEach((m, mi) => m.items.forEach((it, ii) => {
        if (back === 2 && mi === meals.length - 1 && ii === 0) return; // un alimento saltato
        const grams = Math.round(it.grams * (1 + (((back + mi + ii) % 3) - 1) * 0.1));
        out.push({ id: uid(), clientId: p.clientId!, date, meal: m.name, foodId: it.foodId, grams, createdAt: nowIso() });
      }));
    }
  }
  return out;
}
