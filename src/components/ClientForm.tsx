import type { Client, Level, Sex } from "../data/types";

/** Campi anagrafici del cliente, condivisi tra creazione e modifica */
export function ClientFields({ c, set }: { c: Client; set<K extends keyof Client>(k: K, v: Client[K]): void }) {
  return (
    <div className="form-grid">
      <label className="field"><span>Nome</span><input value={c.firstName} onChange={(e) => set("firstName", e.target.value)} required autoFocus /></label>
      <label className="field"><span>Cognome</span><input value={c.lastName} onChange={(e) => set("lastName", e.target.value)} /></label>
      <label className="field"><span>Email</span><input type="email" value={c.email} onChange={(e) => set("email", e.target.value)} /></label>
      <label className="field"><span>Telefono</span><input type="tel" value={c.phone} onChange={(e) => set("phone", e.target.value)} /></label>
      <label className="field"><span>Data di nascita</span><input type="date" value={c.birthDate} onChange={(e) => set("birthDate", e.target.value)} /></label>
      <label className="field"><span>Sesso</span>
        <select value={c.sex} onChange={(e) => set("sex", e.target.value as Sex)}>
          <option value="">—</option><option value="F">Donna</option><option value="M">Uomo</option>
        </select>
      </label>
      <label className="field"><span>Obiettivo</span><input value={c.goal} onChange={(e) => set("goal", e.target.value)} placeholder="Es. dimagrimento, forza…" /></label>
      <label className="field"><span>Livello</span>
        <select value={c.level} onChange={(e) => set("level", e.target.value as Level)}>
          <option value="principiante">Principiante</option><option value="intermedio">Intermedio</option><option value="avanzato">Avanzato</option>
        </select>
      </label>
      <label className="field wide"><span>Note (infortuni, preferenze, disponibilità)</span><textarea value={c.notes} onChange={(e) => set("notes", e.target.value)} /></label>
    </div>
  );
}
