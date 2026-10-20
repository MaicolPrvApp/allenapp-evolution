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
}
