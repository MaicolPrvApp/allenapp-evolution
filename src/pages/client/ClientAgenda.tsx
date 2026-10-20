import { useState } from "react";
import { useStore } from "../../data/store";
import type { AppointmentType } from "../../data/types";
import { AppointmentCard } from "../../components/AppointmentCard";
import { Modal, ask, toast } from "../../components/ui";
import { fmtDayLong, localDate, toIso } from "../../lib/dates";
import { uid } from "../../lib/util";
import { useMe } from "./useMe";

/** Area cliente: i miei appuntamenti, posti liberi da prenotare, richiesta di un nuovo appuntamento */
export function ClientAgenda() {
  const me = useMe();
  const { appointments, save } = useStore();
  const [asking, setAsking] = useState(false);
  if (!me) return <p className="empty">Non ci sono ancora clienti.</p>;
  const now = new Date();
  const mine = appointments.filter((a) => a.clientId === me.id && new Date(a.start) >= now && a.status !== "annullato").sort((a, b) => a.start.localeCompare(b.start));
  const free = appointments.filter((a) => a.status === "libero" && new Date(a.start) >= now).sort((a, b) => a.start.localeCompare(b.start));

  return (
    <>
      <div className="page-head">
        <div><h1>Agenda</h1><p className="muted">Prenota un posto o chiedi un appuntamento al tuo trainer.</p></div>
        <button className="btn" onClick={() => setAsking(true)}>Richiedi appuntamento</button>
      </div>
      <h2 style={{ marginBottom: 10 }}>I miei appuntamenti</h2>
      {mine.length ? (
        <div className="stack" style={{ gap: 8 }}>
          {mine.map((a) => (
            <AppointmentCard key={a.id} a={a} client={me} actions={<>
              <span className="small muted" style={{ textTransform: "capitalize" }}>{fmtDayLong(new Date(a.start))}</span>
              <button className="btn sm ghost" onClick={async () => {
                if (!(await ask("Annullare l'appuntamento?", "Annulla appuntamento"))) return;
                // un posto preso dalla lista torna libero, un appuntamento personale viene annullato
                save("appointments", a.notes === "prenotato dall'app" ? { ...a, clientId: null, status: "libero", notes: "" } : { ...a, status: "annullato" });
                toast("Appuntamento annullato");
              }}>Annulla</button>
            </>} />
          ))}
        </div>
      ) : <p className="empty">Nessun appuntamento in programma.</p>}

      <h2 className="section" style={{ marginBottom: 10 }}>Posti disponibili</h2>
      {free.length ? (
        <div className="stack" style={{ gap: 8 }}>
          {free.map((a) => (
            <AppointmentCard key={a.id} a={a} actions={<>
              <span className="small muted" style={{ textTransform: "capitalize" }}>{fmtDayLong(new Date(a.start))}</span>
              <button className="btn sm primary" onClick={() => { save("appointments", { ...a, clientId: me.id, status: "confermato", notes: "prenotato dall'app" }); toast("Prenotazione confermata"); }}>Prenota</button>
            </>} />
          ))}
        </div>
      ) : <p className="empty">Al momento non ci sono posti liberi.</p>}

      {asking && <RequestForm clientId={me.id} onClose={() => setAsking(false)} />}
    </>
  );
}

function RequestForm({ clientId, onClose }: { clientId: string; onClose(): void }) {
  const save = useStore((s) => s.save);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const [date, setDate] = useState(localDate(tomorrow.toISOString()));
  const [time, setTime] = useState("18:00");
  const [type, setType] = useState<AppointmentType>("allenamento");
  const [notes, setNotes] = useState("");
  return (
    <Modal title="Richiedi un appuntamento" onClose={onClose} footer={<>
      <button className="btn ghost" onClick={onClose}>Annulla</button>
      <button className="btn primary" onClick={() => {
        save("appointments", { id: uid(), clientId, type, start: toIso(date, time), durationMin: 60, location: "", notes, status: "richiesto" });
        toast("Richiesta inviata al trainer"); onClose();
      }}>Invia richiesta</button>
    </>}>
      <div className="form-grid">
        <label className="field"><span>Tipo</span>
          <select value={type} onChange={(e) => setType(e.target.value as AppointmentType)}>
            <option value="allenamento">Allenamento</option><option value="valutazione">Valutazione</option><option value="consulenza">Consulenza</option>
          </select>
        </label>
        <label className="field"><span>Giorno</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="field"><span>Ora</span><input type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} /></label>
        <label className="field wide"><span>Messaggio per il trainer</span><input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Facoltativo" /></label>
      </div>
    </Modal>
  );
}
