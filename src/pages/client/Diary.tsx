import { useStore } from "../../data/store";
import { logsOf } from "../../data/selectors";
import { LogList } from "../../components/LogList";
import { useMe } from "./useMe";

export function Diary() {
  const me = useMe();
  const store = useStore();
  if (!me) return <p className="empty">Non ci sono ancora clienti.</p>;
  const logs = logsOf(store, me.id);
  return (
    <>
      <div className="page-head"><div><h1>Diario</h1><p className="muted">{logs.length} allenamenti registrati</p></div></div>
      <LogList logs={logs} exMap={new Map(store.exercises.map((e) => [e.id, e]))} />
    </>
  );
}
