# Mappa funzionalità: riferimento EvolutionFit → Kinetika

Ricavata dalle pagine pubbliche del sito di riferimento (software personal trainer, app clienti, archivio esercizi, generatore schede, diete, agenda, versioni e prezzi) e dal loro centro assistenza. Il sito non era raggiungibile direttamente da qui, quindi i dettagli vengono dai testi indicizzati: alcuni punti potrebbero essere cambiati.

Legenda fase: **F1** = nucleo (questa prima anteprima), **F2/F3/F4** = fasi successive.

## Lato trainer (gestionale web)

| Area | Cosa fa nel riferimento | Fase |
|---|---|---|
| Anagrafica clienti | Scheda cliente con dati, contatti, obiettivo, note, storico di schede, misure e appuntamenti | F1 |
| Schede di allenamento | Editor con giorni, esercizi, serie, ripetizioni, recupero, carico, note per esercizio, riordino | F1 |
| Superserie e circuiti | Raggruppare esercizi in superserie o circuiti | F1 |
| Modelli di scheda | Schede riutilizzabili da duplicare e assegnare a più clienti | F1 |
| Archivio esercizi | 1000+ esercizi con immagini/video e mappe muscolari, filtri per distretto e attrezzo, esercizi personali | F1 (archivio base + esercizi propri, video tramite link) |
| Assegnazione all'app | La scheda assegnata compare subito nell'app del cliente | F1 |
| Stampa / invio scheda | Stampa in più formati con il proprio logo, invio per email | F2 |
| Valutazioni corporee | Peso, circonferenze, antropometria con grafici di andamento | F2 |
| Plicometria | Pliche con formule (es. Jackson-Pollock) e % massa grassa | F2 |
| Anamnesi | Questionario sanitario/sportivo del cliente | F2 |
| Agenda appuntamenti | Calendario con promemoria automatici, collegato alla scheda cliente | F3 |
| Piani alimentari | Archivio alimenti (900+), piani per pasti, modelli, calcolo macro, invio in app | F3 |
| Generatore automatico schede | Propone una scheda da obiettivo, livello, giorni e durata | F3 |
| Monitoraggio a distanza | Vedere diario allenamenti e alimentare dei clienti | F1 (diario allenamenti), F3 (alimentare) |
| Chat e notifiche | Messaggi trainer ↔ cliente, notifiche push | F4 |
| Pagamenti | Incassi tramite partner esterno | F4 (da decidere) |

## Lato cliente (app)

| Area | Cosa fa nel riferimento | Fase |
|---|---|---|
| Scheda del giorno | Consultare la scheda assegnata, giorno per giorno | F1 |
| Esecuzione guidata | Segnare serie fatte, carichi usati, timer di recupero | F1 |
| Diario allenamenti | Storico delle sessioni svolte | F1 |
| Progressi | Grafici di carichi e misure | F1 (carichi), F2 (misure) |
| Misure personali | Il cliente inserisce peso e misure | F2 |
| Piano alimentare e diario alimentare | Vedere il piano, registrare i pasti | F3 |
| Prenotazioni | Prenotare/annullare appuntamenti e lezioni | F3 |
| Lezioni live / streaming | Calendario lezioni in diretta | F4 |
| Chat con il trainer | Messaggi | F4 |

## Scelte per Kinetika

- Nome, logo, testi e grafica propri: si replicano funzioni e flusso, non il marchio.
- Web app responsive installabile come PWA (PC e telefono).
- Stack: React + TypeScript + Vite, dati dietro un livello di accesso unico così da passare in seguito a un database online (es. Supabase) senza riscrivere le schermate.
- F1 salva i dati nel browser: va bene per provare, non per l'uso reale con più clienti. Il passaggio al database con account trainer/cliente è il primo passo della F2.
