import { useStore } from "../../data/store";
import type { Anamnesis, Client } from "../../data/types";
import { toast, useDraft } from "../../components/ui";
import { fmtDate } from "../../lib/util";

const blank = (clientId: string): Anamnesis => ({
  clientId, conditions: "", injuries: "", surgeries: "", medications: "", activity: "", sports: "", sleepHours: null,
  smoker: false, goalsDetail: "", availability: "", medicalCertificateExpiry: "", consent: false, updatedAt: "",
});

/** Questionario anamnestico e sportivo */
export function ClientAnamnesis({ client }: { client: Client }) {
  const stored = useStore((s) => s.anamneses.find((a) => a.clientId === client.id));
  const saveAnamnesis = useStore((s) => s.saveAnamnesis);
  const [a, set] = useDraft<Anamnesis>(stored ?? blank(client.id));
  const certDays = a.medicalCertificateExpiry ? Math.ceil((new Date(a.medicalCertificateExpiry).getTime() - Date.now()) / 86400000) : null;
  const ta = (k: keyof Anamnesis, label: string, ph = "") => (
    <label className="field wide"><span>{label}</span><textarea value={String(a[k] ?? "")} placeholder={ph} onChange={(e) => set(k, e.target.value as never)} style={{ minHeight: 60 }} /></label>
  );

  return (
    <div className="card">
      {certDays !== null && (
        <p className={`tag ${certDays < 0 ? "warn" : certDays < 30 ? "warn" : "ok"}`} style={{ marginTop: 0 }}>
          {certDays < 0 ? "Certificato medico scaduto" : `Certificato medico valido ancora ${certDays} giorni`}
        </p>
      )}
      <div className="form-grid">
        {ta("conditions", "Patologie note", "Es. ipertensione, diabete, asma…")}
        {ta("injuries", "Infortuni e dolori", "Zona, quando, se ancora presenti")}
        {ta("surgeries", "Interventi chirurgici")}
        {ta("medications", "Farmaci assunti")}
        <label className="field"><span>Livello di attività</span>
          <select value={a.activity} onChange={(e) => set("activity", e.target.value as Anamnesis["activity"])}>
            <option value="">—</option><option value="sedentario">Sedentario</option><option value="leggero">Leggero</option><option value="moderato">Moderato</option><option value="intenso">Intenso</option>
          </select>
        </label>
        <label className="field"><span>Ore di sonno</span><input type="number" min={0} max={14} value={a.sleepHours ?? ""} onChange={(e) => set("sleepHours", e.target.value === "" ? null : +e.target.value)} /></label>
        <label className="field"><span>Scadenza certificato medico</span><input type="date" value={a.medicalCertificateExpiry} onChange={(e) => set("medicalCertificateExpiry", e.target.value)} /></label>
        <label className="check" style={{ alignSelf: "end", paddingBottom: 10 }}><input type="checkbox" checked={a.smoker} onChange={(e) => set("smoker", e.target.checked)} />Fumatore</label>
        {ta("sports", "Sport praticati")}
        {ta("goalsDetail", "Obiettivi nel dettaglio")}
        {ta("availability", "Disponibilità (giorni e orari)")}
        <label className="check wide"><input type="checkbox" checked={a.consent} onChange={(e) => set("consent", e.target.checked)} />Il cliente ha dato il consenso al trattamento dei dati sanitari</label>
      </div>
      <div className="row" style={{ marginTop: 16 }}>
        <span className="muted small grow">{stored?.updatedAt ? `Aggiornata il ${fmtDate(stored.updatedAt)}` : "Non ancora compilata"}</span>
        <button className="btn primary" onClick={() => { saveAnamnesis(a); toast("Anamnesi salvata"); }}>Salva anamnesi</button>
      </div>
    </div>
  );
}
