import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../data/store";
import { EQUIPMENT, MUSCLES } from "../../data/exerciseLibrary";
import type { Equipment, Exercise, MuscleGroup } from "../../data/types";
import { Icon } from "../../components/Icon";
import { toast, useDraft, ask } from "../../components/ui";
import { embedUrl } from "../../lib/video";

export function ExerciseDetail() {
  const { id } = useParams();
  const ex = useStore((s) => s.exercises.find((e) => e.id === id));
  if (!ex) return <p className="empty">Esercizio non trovato. <Link to="/t/esercizi">Torna all'archivio</Link></p>;
  return <Editor key={ex.id} ex={ex} />;
}

function Editor({ ex }: { ex: Exercise }) {
  const { saveExercise, deleteExercise, plans } = useStore();
  const [e, set] = useDraft(ex);
  const nav = useNavigate();
  const used = plans.filter((p) => p.days.some((d) => d.blocks.some((b) => b.items.some((i) => i.exerciseId === ex.id)))).length;
  const dirty = JSON.stringify(e) !== JSON.stringify(ex);
  const video = embedUrl(e.videoUrl);

  return (
    <>
      <Link to="/t/esercizi" className="back"><Icon name="back" size={16} />Esercizi</Link>
      <div className="page-head">
        <div><h1>{e.name || "Esercizio"}</h1><p className="muted">{ex.custom ? "Creato da te" : "Archivio di base"} · usato in {used} schede</p></div>
      </div>
      <div className="card">
        <div className="form-grid">
          <label className="field wide"><span>Nome</span><input value={e.name} onChange={(x) => set("name", x.target.value)} /></label>
          <label className="field"><span>Distretto principale</span>
            <select value={e.muscle} onChange={(x) => set("muscle", x.target.value as MuscleGroup)}>{MUSCLES.map((m) => <option key={m}>{m}</option>)}</select>
          </label>
          <label className="field"><span>Attrezzo</span>
            <select value={e.equipment} onChange={(x) => set("equipment", x.target.value as Equipment)}>{EQUIPMENT.map((m) => <option key={m}>{m}</option>)}</select>
          </label>
          <div className="field wide"><span>Muscoli secondari</span>
            <div className="row">
              {MUSCLES.filter((m) => m !== e.muscle).map((m) => (
                <label key={m} className="check small" style={{ marginRight: 8 }}>
                  <input type="checkbox" checked={e.secondary.includes(m)} onChange={(x) => set("secondary", x.target.checked ? [...e.secondary, m] : e.secondary.filter((s) => s !== m))} />{m}
                </label>
              ))}
            </div>
          </div>
          <label className="field wide"><span>Esecuzione</span><textarea value={e.description} onChange={(x) => set("description", x.target.value)} /></label>
          <label className="field wide"><span>Video (link YouTube o Vimeo)</span><input type="url" value={e.videoUrl} onChange={(x) => set("videoUrl", x.target.value)} placeholder="https://youtu.be/…" /></label>
        </div>
        {video && <div className="video" style={{ marginTop: 14 }}><iframe src={video} title={e.name} allowFullScreen /></div>}
        {e.videoUrl && !video && <p className="small"><a href={e.videoUrl} target="_blank" rel="noreferrer">Apri il video</a></p>}
        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn ghost danger" disabled={used > 0} title={used ? "È usato in alcune schede" : ""} onClick={async () => { if (await ask("Eliminare l'esercizio?")) { deleteExercise(ex.id); nav("/t/esercizi"); } }}>Elimina</button>
          <span className="grow" />
          <button className="btn primary" disabled={!dirty || !e.name.trim()} onClick={() => { saveExercise(e); toast("Esercizio salvato"); }}>Salva</button>
        </div>
      </div>
    </>
  );
}
