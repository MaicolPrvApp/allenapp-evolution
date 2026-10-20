import { useRef } from "react";
import { exportData, useStore } from "../../data/store";
import type { AppData } from "../../data/types";
import { toast, ask } from "../../components/ui";

export function Settings() {
  const { resetDemo, importData } = useStore();
  const file = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `allenapp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const load = async (f: File) => {
    try {
      const d = JSON.parse(await f.text()) as AppData;
      if (!Array.isArray(d.clients) || !Array.isArray(d.plans) || !Array.isArray(d.exercises) || !Array.isArray(d.logs)) throw new Error();
      if (await ask("Sostituire tutti i dati attuali con quelli del file?")) { importData(d); toast("Dati importati"); }
    } catch { toast("File non valido"); }
  };

  return (
    <>
      <div className="page-head"><div><h1>Impostazioni</h1><p className="muted">In questa versione di prova i dati restano nel browser di questo dispositivo.</p></div></div>
      <div className="stack">
        <div className="card">
          <h3>Backup</h3>
          <p className="muted small">Scarica un file con clienti, schede, esercizi e diario, oppure ricaricalo su un altro dispositivo.</p>
          <div className="row">
            <button className="btn" onClick={download}>Scarica backup</button>
            <button className="btn" onClick={() => file.current?.click()}>Importa backup</button>
            <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
          </div>
        </div>
        <div className="card">
          <h3>Dati dimostrativi</h3>
          <p className="muted small">Ripristina i clienti e le schede di esempio. Cancella tutto ciò che hai inserito.</p>
          <button className="btn danger" onClick={async () => { if (await ask("Cancellare tutti i dati e ripristinare l'esempio?")) { resetDemo(); toast("Dati di esempio ripristinati"); } }}>Ripristina esempio</button>
        </div>
      </div>
    </>
  );
}
