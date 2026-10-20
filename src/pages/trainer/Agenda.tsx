import { useState } from "react";
import { useStore } from "../../data/store";
import type { Appointment, AppointmentType, ID } from "../../data/types";
import { AppointmentCard } from "../../components/AppointmentCard";
import { Icon } from "../../components/Icon";
import { Modal, ask, toast } from "../../components/ui";
import { addDays, fmtDayLong, localDate, localTime, sameDay, startOfWeek, toIso } from "../../lib/dates";
import { fullName, uid } from "../../lib/util";

const TYPES: AppointmentType[] = ["allenamento", "valutazione", "consulenza", "lezione di gruppo"];

export function Agenda() {
  const { appointments, clients, save, remove } = useStore();
  const [week, setWeek] = useState(() => startOfWeek(new Date()));
  const [edit, setEdit] = useState<Appointment | null>(null);
  const byId = new Map(clients.map((c) => [c.id, c]));
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const inWeek = appointments.filter((a) => { const d = new Date(a.start); return d >= week && d < addDays(week, 7); });
  const requests = appointments.filter((a) => a.status === "richiesto" && new Date(a.start) >= new Date());
  const label = `${days[0].toLocaleDateString("it-IT", { day: "numeric", month: "short" })} – ${days[6].toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}`;

  const blank = (day?: Date): Appointment => {
    const d = day ?? new Date();
    return { id: uid(), clientId: clients[0]?.id ?? null, type: "allenamento", start: toIso(localDate(d.toISOString()), "18:00"), durationMin: 60, location: "Sala pesi", notes: "", status: "confermato" };
  };
  const setStatus = (a: Appointment, status: Appointment["status"]) => { save("appointments", { ...a, status }); toast(status === "confermato" ? "Appuntamento confermato" : "Appuntamento annullato"); };

  return (
    <>
      <div className="page-head">
        <div><h1>Agenda</h1><p className="muted">Appuntamenti, valutazioni e posti prenotabili dai clienti.</p></div>
        <button className="btn primary" onClick={() => setEdit(blank())}>Nuovo appuntamento</button>
      </div>

      {requests.length > 0 && (
        <div className="section" style={{ marginTop: 0, marginBottom: 20 }}>
          <h2 style={{ marginBottom: 10 }}>Richieste da confermare</h2>
          <div className="stack" style={{ gap: 8 }}>
            {requests.map((a) => (
              <AppointmentCard key={a.id} a={a} client={a.clientId ? byId.get(a.clientId) : undefined} actions={<>
                <span className="small muted">{fmtDayLong(new Date(a.start))}</span>
                <button className="btn sm primary" onClick={() => setStatus(a, "confermato")}>Conferma</button>
                <button className="btn sm" onClick={() => setStatus(a, "annullato")}>Rifiuta</button>
              </>} />
            ))}
          </div>
        </div>
      )}

      <div className="row" style={{ marginBottom: 14 }}>
        <button className="btn icon" onClick={() => setWeek(addDays(week, -7))} aria-label="Settimana precedente"><Icon name="back" /></button>
        <button className="btn" onClick={() => setWeek(startOfWeek(new Date()))}>Oggi</button>
        <button className="btn icon" onClick={() => setWeek(addDays(week, 7))} aria-label="Settimana successiva" style={{ transform: "scaleX(-1)" }}><Icon name="back" /></button>
        <b style={{ marginLeft: 6 }}>{label}</b>
        <span className="muted small">{inWeek.filter((a) => a.status !== "annullato" && a.status !== "libero").length} appuntamenti</span>
      </div>

      <div className="stack" style={{ gap: 18 }}>
        {days.map((d) => {
          const list = inWeek.filter((a) => sameDay(new Date(a.start), d)).sort((a, b) => a.start.localeCompare(b.start));
          const isToday = sameDay(d, new Date());
          return (
            <div key={d.toISOString()}>
              <div className="row" style={{ marginBottom: 8 }}>
                <h3 className="grow" style={{ textTransform: "capitalize", color: isToday ? "var(--accent)" : undefined }}>{fmtDayLong(d)}{isToday ? " · oggi" : ""}</h3>
                <button className="btn sm ghost" onClick={() => setEdit(blank(d))}><Icon name="plus" size={14} />Aggiungi</button>
              </div>
              {list.length ? (
                <div className="stack" style={{ gap: 8 }}>
                  {list.map((a) => (
                    <AppointmentCard key={a.id} a={a} client={a.clientId ? byId.get(a.clientId) : undefined} actions={<>
                      <button className="btn sm" onClick={() => setEdit(a)}>Modifica</button>
                      {a.status === "richiesto" && <button className="btn sm primary" onClick={() => setStatus(a, "confermato")}>Conferma</button>}
                      {(a.status === "confermato" || a.status === "richiesto") && <button className="btn sm ghost" onClick={() => setStatus(a, "annullato")}>Annulla</button>}
                    </>} />
                  ))}
                </div>
              ) : <div className="muted small" style={{ padding: "4px 0 0" }}>Nessun appuntamento</div>}
            </div>
          );
        })}
      </div>

      {edit && <AppointmentForm initial={edit} onClose={() => setEdit(null)} onDelete={async (id) => { if (await ask("Eliminare l'appuntamento?", "Elimina")) { remove("appointments", id); setEdit(null); } }} />}
    </>
  );
}

function AppointmentForm({ initial, onClose, onDelete }: { initial: Appointment; onClose(): void; onDelete(id: ID): void }) {
  const { clients, appointments, save } = useStore();
  const [a, setA] = useState(initial);
  const [date, setDate] = useState(localDate(initial.start));
  const [time, setTime] = useState(localTime(initial.start));
  const [repeat, setRepeat] = useState(1);
  const exists = appointments.some((x) => x.id === a.id);
  const isFree = a.clientId === null;

  const submit = () => {
    const start = toIso(date, time);
    for (let w = 0; w < (exists ? 1 : repeat); w++) {
      const s = new Date(start); s.setDate(s.getDate() + 7 * w);
      save("appointments", { ...a, id: w ? uid() : a.id, start: s.toISOString(), status: isFree ? "libero" : a.status === "libero" ? "confermato" : a.status });
    }
    toast(exists ? "Appuntamento aggiornato" : repeat > 1 ? `${repeat} appuntamenti creati` : "Appuntamento creato");
    onClose();
  };

  return (
    <Modal title={exists ? "Modifica appuntamento" : "Nuovo appuntamento"} onClose={onClose} footer={<>
      {exists && <button className="btn ghost danger" onClick={() => onDelete(a.id)}>Elimina</button>}
      <span className="grow" />
      <button className="btn ghost" onClick={onClose}>Annulla</button>
      <button className="btn primary" onClick={submit}>Salva</button>
    </>}>
      <div className="form-grid">
        <label className="field wide"><span>Cliente</span>
          <select value={a.clientId ?? ""} onChange={(e) => setA({ ...a, clientId: e.target.value || null })}>
            <option value="">Posto libero, prenotabile dai clienti</option>
            {clients.filter((c) => c.active).map((c) => <option key={c.id} value={c.id}>{fullName(c)}</option>)}
          </select>
        </label>
        <label className="field"><span>Tipo</span>
          <select value={a.type} onChange={(e) => setA({ ...a, type: e.target.value as AppointmentType })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <label className="field"><span>Giorno</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="field"><span>Ora</span><input type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} /></label>
        <label className="field"><span>Durata (minuti)</span>
          <select value={a.durationMin} onChange={(e) => setA({ ...a, durationMin: +e.target.value })}>{[30, 45, 60, 75, 90, 120].map((m) => <option key={m} value={m}>{m}</option>)}</select>
        </label>
        <label className="field"><span>Luogo</span><input value={a.location} onChange={(e) => setA({ ...a, location: e.target.value })} placeholder="Sala pesi, online…" /></label>
        {!exists && <label className="field"><span>Ripeti ogni settimana</span>
          <select value={repeat} onChange={(e) => setRepeat(+e.target.value)}>{[1, 2, 4, 8, 12].map((n) => <option key={n} value={n}>{n === 1 ? "No" : `${n} settimane`}</option>)}</select>
        </label>}
        <label className="field wide"><span>Note</span><input value={a.notes} onChange={(e) => setA({ ...a, notes: e.target.value })} /></label>
      </div>
    </Modal>
  );
}
