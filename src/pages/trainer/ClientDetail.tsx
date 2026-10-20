import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useStore } from "../../data/store";
import { logsOf, plansOf, exerciseCount } from "../../data/selectors";
import type { Client, ID } from "../../data/types";
import { ClientFields } from "../../components/ClientForm";
import { LogList } from "../../components/LogList";
import { Icon } from "../../components/Icon";
import { Modal, Tabs, toast, useDraft, ask } from "../../components/ui";
import { age, fmtDate, fullName, initials } from "../../lib/util";
import { emptyPlan } from "./newPlan";
import { ClientAssessments } from "./ClientAssessments";
import { ClientAnamnesis } from "./ClientAnamnesis";
import { ClientNutrition } from "./ClientNutrition";

type Tab = "schede" | "diario" | "valutazioni" | "anamnesi" | "alimentazione" | "profilo";

export function ClientDetail() {
  const { id } = useParams();
  const client = useStore((s) => s.clients.find((c) => c.id === id));
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "schede";
  if (!client) return <p className="empty">Cliente non trovato. <Link to="/t/clienti">Torna ai clienti</Link></p>;
  const a = age(client.birthDate);

  return (
    <>
      <Link to="/t/clienti" className="back"><Icon name="back" size={16} />Clienti</Link>
      <div className="page-head">
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <span className="avatar lg">{initials(client)}</span>
          <div>
            <h1>{fullName(client)}</h1>
            <p className="muted">{[client.goal, client.level, a !== null ? `${a} anni` : ""].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        <div className="row">
          <Link className="btn" to={`/t/messaggi?c=${client.id}`}>Scrivi</Link>
          <OpenClientApp id={client.id} />
        </div>
      </div>
      <Tabs<Tab> value={tab} onChange={(t) => setParams({ tab: t })} items={[["schede", "Schede"], ["diario", "Diario"], ["valutazioni", "Valutazioni"], ["anamnesi", "Anamnesi"], ["alimentazione", "Alimentazione"], ["profilo", "Profilo"]]} />
      {tab === "schede" && <ClientPlans client={client} />}
      {tab === "diario" && <ClientDiary id={client.id} />}
      {tab === "valutazioni" && <ClientAssessments client={client} />}
      {tab === "anamnesi" && <ClientAnamnesis key={client.id} client={client} />}
      {tab === "alimentazione" && <ClientNutrition client={client} />}
      {tab === "profilo" && <ClientProfile key={client.id} client={client} />}
    </>
  );
}

function OpenClientApp({ id }: { id: ID }) {
  const setMe = useStore((s) => s.setMe);
  const nav = useNavigate();
  return <button className="btn" onClick={() => { setMe(id); nav("/c"); }}>Vedi la sua app</button>;
}

function ClientPlans({ client }: { client: Client }) {
  const store = useStore();
  const nav = useNavigate();
  const [pick, setPick] = useState(false);
  const list = plansOf(store, client.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const templates = store.plans.filter((p) => !p.clientId);

  const createEmpty = () => {
    const p = emptyPlan(client.id, client.goal);
    store.savePlan(p);
    nav(`/t/schede/${p.id}`);
  };
  const fromTemplate = (tid: ID) => {
    const nid = store.duplicatePlan(tid, client.id);
    setPick(false);
    toast("Scheda assegnata");
    nav(`/t/schede/${nid}`);
  };

  return (
    <>
      <div className="row" style={{ marginBottom: 14 }}>
        <button className="btn primary" onClick={() => setPick(true)}>Assegna da modello</button>
        <button className="btn" onClick={createEmpty}>Crea scheda da zero</button>
      </div>
      {list.length ? (
        <div className="stack">
          {list.map((p) => (
            <div key={p.id} className="card row">
              <div className="grow">
                <div className="row"><h3>{p.name}</h3>{p.active ? <span className="tag ok">Attiva</span> : <span className="tag">Conclusa</span>}</div>
                <div className="muted small">{p.days.length} giorni · {exerciseCount(p)} esercizi · {p.weeks} settimane{p.startDate ? ` · dal ${fmtDate(p.startDate)}` : ""}</div>
              </div>
              <button className="btn sm" onClick={() => store.savePlan({ ...p, active: !p.active })}>{p.active ? "Concludi" : "Riattiva"}</button>
              <Link className="btn sm primary" to={`/t/schede/${p.id}`}>Apri</Link>
            </div>
          ))}
        </div>
      ) : <p className="empty">Nessuna scheda: assegnane una da un modello o creala da zero.</p>}

      {pick && (
        <Modal title="Scegli un modello" onClose={() => setPick(false)}>
          {templates.length ? templates.map((t) => (
            <button key={t.id} className="pick" onClick={() => fromTemplate(t.id)}>
              <span className="grow"><b>{t.name}</b><span className="muted small" style={{ display: "block" }}>{t.days.length} giorni · {exerciseCount(t)} esercizi{t.goal ? ` · ${t.goal}` : ""}</span></span>
              <Icon name="plus" />
            </button>
          )) : <p className="empty">Non hai ancora modelli. Creane uno dalla sezione Schede.</p>}
        </Modal>
      )}
    </>
  );
}

function ClientDiary({ id }: { id: ID }) {
  const store = useStore();
  const exMap = new Map(store.exercises.map((e) => [e.id, e]));
  return <LogList logs={logsOf(store, id)} exMap={exMap} onDelete={store.deleteLog} />;
}

function ClientProfile({ client }: { client: Client }) {
  const { saveClient, deleteClient } = useStore();
  const [c, set] = useDraft(client);
  const nav = useNavigate();
  const dirty = JSON.stringify(c) !== JSON.stringify(client);
  return (
    <div className="card">
      <ClientFields c={c} set={set} />
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn ghost danger" onClick={async () => { if (await ask(`Eliminare ${fullName(client)} con schede e diario?`)) { deleteClient(client.id); nav("/t/clienti"); } }}>Elimina</button>
        <button className="btn" onClick={() => { saveClient({ ...client, active: !client.active }); toast(client.active ? "Cliente archiviato" : "Cliente riattivato"); }}>{client.active ? "Archivia" : "Riattiva"}</button>
        <span className="grow" />
        <button className="btn primary" disabled={!dirty || !c.firstName.trim()} onClick={() => { saveClient({ ...c, active: client.active }); toast("Profilo salvato"); }}>Salva modifiche</button>
      </div>
    </div>
  );
}
