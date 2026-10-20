// Modello dati dell'app. Ogni entità ha un id stringa così da poter passare
// a un database online senza cambiare le schermate.

export type ID = string;

export type Sex = "M" | "F" | "";
export type Level = "principiante" | "intermedio" | "avanzato";

export interface Client {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string; // yyyy-mm-dd
  sex: Sex;
  goal: string;
  level: Level;
  notes: string;
  active: boolean;
  createdAt: string; // ISO
}

export type MuscleGroup =
  | "petto" | "dorso" | "spalle" | "bicipiti" | "tricipiti" | "avambracci"
  | "quadricipiti" | "femorali" | "glutei" | "polpacci" | "addome" | "cardio" | "total body";

export type Equipment =
  | "corpo libero" | "bilanciere" | "manubri" | "macchina" | "cavi" | "kettlebell"
  | "elastici" | "panca" | "sbarra" | "cardio" | "altro";

export interface Exercise {
  id: ID;
  name: string;
  muscle: MuscleGroup;
  secondary: MuscleGroup[];
  equipment: Equipment;
  description: string;
  videoUrl: string;
  custom: boolean; // creato dal trainer
}

export type BlockType = "single" | "superset" | "circuit";

/** Un esercizio dentro un blocco. Per i blocchi "single" c'è un solo item. */
export interface BlockItem {
  id: ID;
  exerciseId: ID;
  reps: string; // "10", "8-12", "30s", "max"
  load: string; // "40 kg", "70%", "corpo libero"
  notes: string;
}

/**
 * Blocco della scheda: un esercizio singolo, una superserie o un circuito.
 * `sets` = serie (o giri per superserie/circuiti), `restSec` = recupero dopo ogni serie/giro.
 */
export interface Block {
  id: ID;
  type: BlockType;
  sets: number;
  restSec: number;
  items: BlockItem[];
}

export interface PlanDay {
  id: ID;
  name: string;
  notes: string;
  blocks: Block[];
}

export interface Plan {
  id: ID;
  name: string;
  description: string;
  goal: string;
  /** null = modello riutilizzabile, altrimenti scheda assegnata al cliente */
  clientId: ID | null;
  startDate: string;
  weeks: number;
  active: boolean;
  days: PlanDay[];
  createdAt: string;
  updatedAt: string;
}

export interface SetLog {
  blockId: ID;
  itemId: ID;
  exerciseId: ID;
  setIndex: number;
  reps: string;
  load: string;
  done: boolean;
}

export interface WorkoutLog {
  id: ID;
  clientId: ID;
  planId: ID;
  dayId: ID;
  dayName: string;
  date: string; // ISO
  durationSec: number;
  sets: SetLog[];
  rpe: number | null; // fatica percepita 1-10
  notes: string;
}

export interface AppData {
  version: number;
  clients: Client[];
  exercises: Exercise[];
  plans: Plan[];
  logs: WorkoutLog[];
  assessments: Assessment[];
  anamneses: Anamnesis[];
  appointments: Appointment[];
  foods: Food[];
  mealPlans: MealPlan[];
  messages: Message[];
}

// ---- Valutazioni e anamnesi ----

export type SkinfoldSite = "pettorale" | "ascellare" | "tricipite" | "sottoscapolare" | "addominale" | "soprailiaca" | "coscia";
export type SkinfoldMethod = "jp3" | "jp7" | "";
export type Circumference = "torace" | "vita" | "fianchi" | "braccio" | "coscia" | "polpaccio";

export interface Assessment {
  id: ID;
  clientId: ID;
  date: string; // yyyy-mm-dd
  weight: number | null; // kg
  height: number | null; // cm
  restingHr: number | null; // battiti a riposo
  circ: Partial<Record<Circumference, number>>; // cm
  folds: Partial<Record<SkinfoldSite, number>>; // mm
  method: SkinfoldMethod;
  notes: string;
}

export interface Anamnesis {
  clientId: ID;
  conditions: string; // patologie
  injuries: string; // infortuni e dolori
  surgeries: string;
  medications: string;
  activity: "sedentario" | "leggero" | "moderato" | "intenso" | "";
  sports: string;
  sleepHours: number | null;
  smoker: boolean;
  goalsDetail: string;
  availability: string; // giorni e orari
  medicalCertificateExpiry: string; // scadenza certificato medico
  consent: boolean; // consenso al trattamento dei dati
  updatedAt: string;
}

// ---- Agenda ----

export type AppointmentType = "allenamento" | "valutazione" | "consulenza" | "lezione di gruppo";
export type AppointmentStatus = "confermato" | "richiesto" | "annullato" | "libero";

export interface Appointment {
  id: ID;
  /** null = posto libero prenotabile dai clienti */
  clientId: ID | null;
  type: AppointmentType;
  start: string; // ISO
  durationMin: number;
  location: string;
  notes: string;
  status: AppointmentStatus;
}

// ---- Alimentazione ----

export type FoodCategory = "cereali" | "carne" | "pesce" | "uova e latticini" | "legumi" | "verdura" | "frutta" | "grassi e frutta secca" | "altro";

/** Valori per 100 g */
export interface Food {
  id: ID;
  name: string;
  category: FoodCategory;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  custom: boolean;
}

export interface MealItem { id: ID; foodId: ID; grams: number }
export interface Meal { id: ID; name: string; time: string; items: MealItem[] }

export interface MealPlan {
  id: ID;
  name: string;
  /** null = modello */
  clientId: ID | null;
  targetKcal: number | null;
  notes: string;
  active: boolean;
  meals: Meal[];
  createdAt: string;
  updatedAt: string;
}

// ---- Messaggi ----

export interface Message {
  id: ID;
  clientId: ID;
  from: "trainer" | "client";
  text: string;
  date: string; // ISO
  read: boolean;
}
