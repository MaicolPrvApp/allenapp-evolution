import { Chat } from "../../components/Chat";
import { useMe } from "./useMe";

export function ClientMessages() {
  const me = useMe();
  if (!me) return <p className="empty">Non ci sono ancora clienti.</p>;
  return (
    <>
      <div className="page-head"><div><h1>Messaggi</h1><p className="muted">Scrivi al tuo trainer.</p></div></div>
      <Chat key={me.id} clientId={me.id} me="client" />
    </>
  );
}
