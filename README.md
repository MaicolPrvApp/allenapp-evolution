# Kinetika

Web app per personal trainer, installabile come app su PC e telefono.

- **Area trainer**: clienti, schede di allenamento (giorni, serie, ripetizioni, carichi, recuperi, superserie e circuiti), modelli riutilizzabili, generatore automatico di schede, archivio esercizi con esercizi propri e video, valutazioni corporee e plicometria (Jackson-Pollock 3 e 7 pliche), anamnesi, agenda con posti prenotabili, piani alimentari con archivio alimenti e calcolo dei macro, messaggi, diario degli allenamenti dei clienti.
- **Area cliente**: scheda del giorno, allenamento guidato con timer di recupero e suoni, agenda e prenotazioni, piano alimentare, progressi (carichi, peso, massa grassa), diario, messaggi.

La mappa completa delle funzionalità e delle fasi è in [docs/mappa-funzionalita.md](docs/mappa-funzionalita.md).

## Sviluppo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # crea dist/
```

Stack: React 18, TypeScript, Vite, React Router, Zustand.

## Struttura

```
src/
  data/        modello dati (types.ts), archivio esercizi, dati di esempio, store
  components/  componenti condivisi (layout, modali, editor, grafici)
  pages/
    trainer/   panoramica, clienti, schede, esercizi, impostazioni
    client/    allenamento del giorno, sessione guidata, diario, progressi
```

Tutti i dati passano da `src/data/store.ts`. Oggi vengono salvati nel browser (localStorage); per passare a un database online con accesso trainer/cliente basta sostituire la persistenza mantenendo le stesse azioni.

## Pubblicazione

Il workflow `.github/workflows/pages.yml` compila e pubblica l'app su GitHub Pages a ogni push su `main`. In GitHub: *Settings → Pages → Source: GitHub Actions*.
