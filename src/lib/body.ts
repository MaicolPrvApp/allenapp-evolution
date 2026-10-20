import type { Assessment, Circumference, SkinfoldMethod, SkinfoldSite, Sex } from "../data/types";

// Calcoli di composizione corporea: Jackson-Pollock (3 e 7 pliche) con conversione di Siri.

export const SITES_BY_METHOD: Record<Exclude<SkinfoldMethod, "">, Record<"M" | "F", SkinfoldSite[]>> = {
  jp3: { M: ["pettorale", "addominale", "coscia"], F: ["tricipite", "soprailiaca", "coscia"] },
  jp7: {
    M: ["pettorale", "ascellare", "tricipite", "sottoscapolare", "addominale", "soprailiaca", "coscia"],
    F: ["pettorale", "ascellare", "tricipite", "sottoscapolare", "addominale", "soprailiaca", "coscia"],
  },
};

export const ALL_SITES: SkinfoldSite[] = ["pettorale", "ascellare", "tricipite", "sottoscapolare", "addominale", "soprailiaca", "coscia"];
export const CIRCS: Circumference[] = ["torace", "vita", "fianchi", "braccio", "coscia", "polpaccio"];

export function bodyDensity(method: SkinfoldMethod, sex: Sex, age: number, sum: number): number | null {
  if (!method || !sex || !age || !sum) return null;
  if (method === "jp3") {
    return sex === "M"
      ? 1.10938 - 0.0008267 * sum + 0.0000016 * sum * sum - 0.0002574 * age
      : 1.0994921 - 0.0009929 * sum + 0.0000023 * sum * sum - 0.0001392 * age;
  }
  return sex === "M"
    ? 1.112 - 0.00043499 * sum + 0.00000055 * sum * sum - 0.00028826 * age
    : 1.097 - 0.00046971 * sum + 0.00000056 * sum * sum - 0.00012828 * age;
}

export interface BodyResult {
  bmi: number | null;
  sum: number | null;
  bodyFat: number | null; // %
  fatMass: number | null; // kg
  leanMass: number | null; // kg
  whr: number | null; // rapporto vita/fianchi
  missingSites: SkinfoldSite[];
}

/** Età alla data della valutazione */
const ageAt = (birth: string, date: string) => {
  if (!birth) return 0;
  const b = new Date(birth), d = new Date(date);
  let a = d.getFullYear() - b.getFullYear();
  if (d < new Date(d.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
};

export function analyze(a: Assessment, sex: Sex, birthDate: string): BodyResult {
  const bmi = a.weight && a.height ? a.weight / (a.height / 100) ** 2 : null;
  const whr = a.circ.vita && a.circ.fianchi ? a.circ.vita / a.circ.fianchi : null;
  let sum: number | null = null, bodyFat: number | null = null, missing: SkinfoldSite[] = [];
  if (a.method && (sex === "M" || sex === "F")) {
    const sites = SITES_BY_METHOD[a.method][sex];
    missing = sites.filter((s) => !a.folds[s]);
    if (!missing.length) {
      sum = sites.reduce((t, s) => t + (a.folds[s] ?? 0), 0);
      const bd = bodyDensity(a.method, sex, ageAt(birthDate, a.date), sum);
      if (bd) bodyFat = Math.max(2, 495 / bd - 450);
    }
  }
  const fatMass = bodyFat !== null && a.weight ? (a.weight * bodyFat) / 100 : null;
  return { bmi, sum, bodyFat, fatMass, leanMass: fatMass !== null && a.weight ? a.weight - fatMass : null, whr, missingSites: missing };
}

export function bmiLabel(b: number) {
  return b < 18.5 ? "sottopeso" : b < 25 ? "normopeso" : b < 30 ? "sovrappeso" : "obesità";
}
