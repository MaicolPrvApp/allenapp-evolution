import { HashRouter, MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AskDialog, Toaster, isFramed } from "./components/ui";
import { useStore } from "./data/store";
import { Dashboard } from "./pages/trainer/Dashboard";
import { Clients } from "./pages/trainer/Clients";
import { ClientDetail } from "./pages/trainer/ClientDetail";
import { Plans } from "./pages/trainer/Plans";
import { PlanEditor } from "./pages/trainer/PlanEditor";
import { Exercises } from "./pages/trainer/Exercises";
import { ExerciseDetail } from "./pages/trainer/ExerciseDetail";
import { Settings } from "./pages/trainer/Settings";
import { Today } from "./pages/client/Today";
import { Session } from "./pages/client/Session";
import { Diary } from "./pages/client/Diary";
import { Progress } from "./pages/client/Progress";

// HashRouter: funziona su qualsiasi hosting statico (GitHub Pages) senza configurare il server.
// Dentro un'anteprima incorporata l'indirizzo non è modificabile, quindi la navigazione resta in memoria.
const Router = isFramed ? MemoryRouter : HashRouter;

export function App() {
  const role = useStore((s) => s.role);
  return (
    <Router>
      <Routes>
        <Route path="/c/sessione/:planId/:dayId" element={<Session />} />
        <Route element={<Layout />}>
          <Route index element={<Navigate to={role === "client" ? "/c" : "/t"} replace />} />
          <Route path="/t" element={<Dashboard />} />
          <Route path="/t/clienti" element={<Clients />} />
          <Route path="/t/clienti/:id" element={<ClientDetail />} />
          <Route path="/t/schede" element={<Plans />} />
          <Route path="/t/schede/:id" element={<PlanEditor />} />
          <Route path="/t/esercizi" element={<Exercises />} />
          <Route path="/t/esercizi/:id" element={<ExerciseDetail />} />
          <Route path="/t/impostazioni" element={<Settings />} />
          <Route path="/c" element={<Today />} />
          <Route path="/c/diario" element={<Diary />} />
          <Route path="/c/progressi" element={<Progress />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster />
      <AskDialog />
    </Router>
  );
}
