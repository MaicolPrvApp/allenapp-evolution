import type { Equipment, Exercise, MuscleGroup } from "./types";

// Archivio esercizi di base. Descrizioni brevi scritte per Kinetika.
type Row = [id: string, name: string, muscle: MuscleGroup, equipment: Equipment, secondary: MuscleGroup[], description: string];

const rows: Row[] = [
  // Petto
  ["ex-panca-piana", "Panca piana con bilanciere", "petto", "bilanciere", ["tricipiti", "spalle"], "Scapole addotte, piedi a terra. Scendi al petto controllando e spingi in verticale."],
  ["ex-panca-inclinata-man", "Panca inclinata con manubri", "petto", "manubri", ["spalle", "tricipiti"], "Panca a 30°. Manubri all'altezza del petto, spingi chiudendo leggermente in alto."],
  ["ex-croci-man", "Croci con manubri", "petto", "manubri", ["spalle"], "Gomiti leggermente flessi e fissi, apri fino a sentire l'allungamento del petto."],
  ["ex-croci-cavi", "Croci ai cavi", "petto", "cavi", ["spalle"], "Busto leggermente inclinato in avanti, porta le mani a incontrarsi davanti al petto."],
  ["ex-piegamenti", "Piegamenti sulle braccia", "petto", "corpo libero", ["tricipiti", "addome"], "Corpo in linea retta, mani poco oltre le spalle, petto vicino al pavimento."],
  ["ex-chest-press", "Chest press", "petto", "macchina", ["tricipiti", "spalle"], "Regola il sedile con le maniglie a metà petto. Spingi senza bloccare i gomiti."],
  ["ex-dip", "Dip alle parallele", "petto", "corpo libero", ["tricipiti", "spalle"], "Busto inclinato in avanti per enfatizzare il petto, scendi fino a gomiti a 90°."],
  // Dorso
  ["ex-trazioni", "Trazioni alla sbarra", "dorso", "sbarra", ["bicipiti", "avambracci"], "Presa prona poco più larga delle spalle. Tira portando il petto verso la sbarra."],
  ["ex-lat-machine", "Lat machine avanti", "dorso", "macchina", ["bicipiti"], "Tira la barra al petto alto portando i gomiti verso i fianchi."],
  ["ex-rematore-bil", "Rematore con bilanciere", "dorso", "bilanciere", ["bicipiti", "femorali"], "Busto inclinato a circa 45°, schiena neutra. Tira il bilanciere verso l'ombelico."],
  ["ex-rematore-man", "Rematore con manubrio", "dorso", "manubri", ["bicipiti"], "Una mano e un ginocchio sulla panca. Tira il manubrio verso l'anca."],
  ["ex-pulley", "Pulley basso", "dorso", "cavi", ["bicipiti"], "Busto fermo, tira il triangolo verso l'addome stringendo le scapole."],
  ["ex-stacco", "Stacco da terra", "dorso", "bilanciere", ["glutei", "femorali", "quadricipiti"], "Bilanciere sopra il metà piede, schiena neutra, spingi il pavimento ed estendi le anche."],
  ["ex-pullover-cavo", "Pullover al cavo alto", "dorso", "cavi", ["petto"], "Braccia quasi tese, porta la barra dal viso alle cosce usando i dorsali."],
  ["ex-hyperext", "Iperestensioni", "dorso", "panca", ["glutei", "femorali"], "Sulla panca a 45°, scendi con schiena neutra e risali fino all'allineamento."],
  // Spalle
  ["ex-lento-avanti", "Lento avanti con bilanciere", "spalle", "bilanciere", ["tricipiti"], "In piedi, glutei e addome contratti. Spingi il bilanciere sopra la testa."],
  ["ex-shoulder-press-man", "Shoulder press con manubri", "spalle", "manubri", ["tricipiti"], "Seduto con schienale, manubri all'altezza delle orecchie, spingi in alto."],
  ["ex-alzate-laterali", "Alzate laterali", "spalle", "manubri", [], "Gomiti leggermente flessi, solleva fino all'altezza delle spalle senza slanci."],
  ["ex-alzate-frontali", "Alzate frontali", "spalle", "manubri", ["petto"], "Solleva davanti a te fino all'altezza degli occhi, alternato o insieme."],
  ["ex-face-pull", "Face pull", "spalle", "cavi", ["dorso"], "Corda all'altezza del viso, tira verso la fronte aprendo i gomiti."],
  ["ex-alzate-90", "Alzate a 90°", "spalle", "manubri", ["dorso"], "Busto parallelo al pavimento, apri le braccia lavorando il deltoide posteriore."],
  // Braccia
  ["ex-curl-bil", "Curl con bilanciere", "bicipiti", "bilanciere", ["avambracci"], "Gomiti fermi ai fianchi, fletti senza oscillare con il busto."],
  ["ex-curl-man", "Curl con manubri alternato", "bicipiti", "manubri", ["avambracci"], "Ruota il palmo verso l'alto durante la salita."],
  ["ex-curl-martello", "Curl a martello", "bicipiti", "manubri", ["avambracci"], "Presa neutra, palmi che si guardano per tutto il movimento."],
  ["ex-curl-cavo", "Curl al cavo basso", "bicipiti", "cavi", [], "Tensione costante; controlla bene la fase di discesa."],
  ["ex-french-press", "French press", "tricipiti", "bilanciere", [], "Sdraiato, porta il bilanciere verso la fronte flettendo solo i gomiti."],
  ["ex-pushdown", "Push down al cavo", "tricipiti", "cavi", [], "Gomiti fermi ai fianchi, estendi completamente in basso."],
  ["ex-estensioni-man", "Estensioni sopra la testa con manubrio", "tricipiti", "manubri", [], "Manubrio dietro la testa con due mani, estendi verso l'alto."],
  ["ex-dip-panca", "Dip su panca", "tricipiti", "panca", ["petto"], "Mani sul bordo della panca, scendi flettendo i gomiti all'indietro."],
  ["ex-wrist-curl", "Wrist curl", "avambracci", "bilanciere", [], "Avambracci appoggiati, fletti solo i polsi."],
  // Gambe
  ["ex-squat", "Squat con bilanciere", "quadricipiti", "bilanciere", ["glutei", "femorali", "addome"], "Bilanciere sui trapezi, scendi con ginocchia in linea con le punte, schiena neutra."],
  ["ex-front-squat", "Front squat", "quadricipiti", "bilanciere", ["glutei", "addome"], "Bilanciere sulle spalle anteriori, gomiti alti, busto il più verticale possibile."],
  ["ex-goblet-squat", "Goblet squat", "quadricipiti", "kettlebell", ["glutei"], "Kettlebell al petto, scendi tra le ginocchia mantenendo il busto alto."],
  ["ex-leg-press", "Leg press", "quadricipiti", "macchina", ["glutei"], "Piedi a larghezza spalle, scendi fino a 90° senza staccare il bacino."],
  ["ex-leg-extension", "Leg extension", "quadricipiti", "macchina", [], "Estendi completamente e controlla la discesa."],
  ["ex-affondi", "Affondi con manubri", "quadricipiti", "manubri", ["glutei"], "Passo lungo, ginocchio posteriore verso terra, busto eretto."],
  ["ex-bulgarian", "Bulgarian split squat", "quadricipiti", "manubri", ["glutei"], "Piede posteriore sulla panca, scendi in verticale sulla gamba anteriore."],
  ["ex-step-up", "Step up", "quadricipiti", "manubri", ["glutei"], "Sali sul rialzo spingendo con il tallone della gamba d'appoggio."],
  ["ex-rdl", "Stacco rumeno", "femorali", "bilanciere", ["glutei", "dorso"], "Ginocchia leggermente flesse, porta indietro le anche con bilanciere vicino alle gambe."],
  ["ex-leg-curl", "Leg curl sdraiato", "femorali", "macchina", [], "Bacino premuto sulla panca, fletti portando i talloni verso i glutei."],
  ["ex-good-morning", "Good morning", "femorali", "bilanciere", ["dorso", "glutei"], "Bilanciere sui trapezi, inclina il busto in avanti spingendo indietro le anche."],
  ["ex-hip-thrust", "Hip thrust", "glutei", "bilanciere", ["femorali"], "Scapole sulla panca, bilanciere sulle anche, estendi fino ad allineare il busto."],
  ["ex-ponte-glutei", "Ponte glutei", "glutei", "corpo libero", ["femorali"], "Supino, piedi a terra, solleva il bacino stringendo i glutei."],
  ["ex-abductor", "Abductor machine", "glutei", "macchina", [], "Apri le gambe contro resistenza, controlla la chiusura."],
  ["ex-kickback-cavo", "Slanci indietro al cavo", "glutei", "cavi", ["femorali"], "Cavigliera al cavo basso, estendi l'anca senza inarcare la schiena."],
  ["ex-calf-in-piedi", "Calf raise in piedi", "polpacci", "macchina", [], "Sali sulle punte il più possibile e scendi lentamente in allungamento."],
  ["ex-calf-seduto", "Calf raise seduto", "polpacci", "macchina", [], "Lavora il soleo: ginocchia a 90°, movimento completo."],
  // Addome
  ["ex-plank", "Plank", "addome", "corpo libero", ["spalle"], "Avambracci a terra, corpo in linea, addome e glutei contratti."],
  ["ex-plank-laterale", "Plank laterale", "addome", "corpo libero", ["glutei"], "Appoggio su un avambraccio, bacino alto e in linea."],
  ["ex-crunch", "Crunch", "addome", "corpo libero", [], "Solleva le spalle da terra avvicinando lo sterno al bacino."],
  ["ex-crunch-inverso", "Crunch inverso", "addome", "corpo libero", [], "Porta le ginocchia al petto sollevando il bacino da terra."],
  ["ex-leg-raise", "Leg raise alla sbarra", "addome", "sbarra", ["avambracci"], "In sospensione, solleva le gambe senza oscillare."],
  ["ex-russian-twist", "Russian twist", "addome", "corpo libero", [], "Seduto con busto inclinato, ruota da un lato all'altro."],
  ["ex-dead-bug", "Dead bug", "addome", "corpo libero", [], "Supino, estendi braccio e gamba opposti mantenendo la zona lombare a terra."],
  ["ex-pallof", "Pallof press", "addome", "cavi", [], "Di lato al cavo, spingi le mani in avanti resistendo alla rotazione."],
  ["ex-ab-wheel", "Ruota addominale", "addome", "altro", ["spalle", "dorso"], "In ginocchio, rotola in avanti mantenendo il bacino in retroversione."],
  // Total body / cardio
  ["ex-burpees", "Burpees", "total body", "corpo libero", ["petto", "quadricipiti"], "Accosciata, piedi indietro in plank, piegamento, ritorno e salto."],
  ["ex-swing", "Kettlebell swing", "total body", "kettlebell", ["glutei", "femorali"], "Spinta esplosiva delle anche, braccia rilassate fino all'altezza del petto."],
  ["ex-thruster", "Thruster con manubri", "total body", "manubri", ["quadricipiti", "spalle"], "Squat frontale seguito da spinta sopra la testa in un unico movimento."],
  ["ex-mountain-climber", "Mountain climber", "total body", "corpo libero", ["addome"], "In plank, porta le ginocchia al petto alternandole velocemente."],
  ["ex-jumping-jack", "Jumping jack", "cardio", "corpo libero", [], "Salta aprendo gambe e braccia, richiudi a ritmo."],
  ["ex-corda", "Salto della corda", "cardio", "altro", ["polpacci"], "Salti piccoli sugli avampiedi, polsi che guidano la corda."],
  ["ex-tapis", "Tapis roulant", "cardio", "cardio", [], "Camminata o corsa alla velocità e pendenza indicate."],
  ["ex-bike", "Cyclette", "cardio", "cardio", ["quadricipiti"], "Mantieni la cadenza e la resistenza indicate."],
  ["ex-vogatore", "Vogatore", "cardio", "cardio", ["dorso", "quadricipiti"], "Spingi con le gambe, poi tira con le braccia; ritorno in ordine inverso."],
  ["ex-ellittica", "Ellittica", "cardio", "cardio", [], "Movimento fluido, busto eretto, usa anche le braccia."],
  ["ex-elastico-row", "Rematore con elastico", "dorso", "elastici", ["bicipiti"], "Elastico fissato davanti, tira verso l'addome stringendo le scapole."],
  ["ex-elastico-squat", "Squat con elastico", "quadricipiti", "elastici", ["glutei"], "Elastico sotto i piedi e sulle spalle, esegui uno squat completo."],
];

export const LIBRARY: Exercise[] = rows.map(([id, name, muscle, equipment, secondary, description]) => ({
  id, name, muscle, equipment, secondary, description, videoUrl: "", custom: false,
}));

export const MUSCLES: MuscleGroup[] = [
  "petto", "dorso", "spalle", "bicipiti", "tricipiti", "avambracci",
  "quadricipiti", "femorali", "glutei", "polpacci", "addome", "total body", "cardio",
];

export const EQUIPMENT: Equipment[] = [
  "corpo libero", "bilanciere", "manubri", "macchina", "cavi", "kettlebell",
  "elastici", "panca", "sbarra", "cardio", "altro",
];
