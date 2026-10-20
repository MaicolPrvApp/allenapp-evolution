// Utilità per l'agenda (settimana che inizia di lunedì, ora locale)

export const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const startOfWeek = (d: Date) => { const x = startOfDay(d); return addDays(x, -((x.getDay() + 6) % 7)); };
export const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
export const fmtDayLong = (d: Date) => d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
export const fmtDayShort = (d: Date) => d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });

/** "2026-10-20" + "18:30" → ISO in ora locale */
export const toIso = (date: string, time: string) => new Date(`${date}T${time || "00:00"}`).toISOString();
const pad = (n: number) => String(n).padStart(2, "0");
export const localDate = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
export const localTime = (iso: string) => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
