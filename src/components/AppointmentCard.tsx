import type { Appointment, Client } from "../data/types";
import { fmtTime } from "../lib/dates";
import { fullName } from "../lib/util";
import type { ReactNode } from "react";

const STATUS: Record<Appointment["status"], [string, string]> = {
  confermato: ["Confermato", "ok"], richiesto: ["Da confermare", "warn"], annullato: ["Annullato", ""], libero: ["Posto libero", "accent"],
};

export function AppointmentCard({ a, client, actions }: { a: Appointment; client?: Client; actions?: ReactNode }) {
  const [label, cls] = STATUS[a.status];
  const end = new Date(new Date(a.start).getTime() + a.durationMin * 60000).toISOString();
  return (
    <div className="card tight row" style={{ opacity: a.status === "annullato" ? 0.55 : 1, flexWrap: "nowrap", alignItems: "flex-start" }}>
      <div className="mono" style={{ minWidth: 54 }}><b>{fmtTime(a.start)}</b><div className="muted small">{fmtTime(end)}</div></div>
      <div className="grow">
        <b>{client ? fullName(client) : a.status === "libero" ? "Disponibile" : "Cliente rimosso"}</b>
        <div className="muted small" style={{ textTransform: "capitalize" }}>{a.type}{a.location ? ` · ${a.location}` : ""}</div>
        {a.notes && <div className="small" style={{ marginTop: 2 }}>{a.notes}</div>}
        {actions && <div className="row" style={{ marginTop: 8, gap: 6 }}>{actions}</div>}
      </div>
      <span className={`tag ${cls}`}>{label}</span>
    </div>
  );
}
