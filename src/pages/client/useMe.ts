import { useStore } from "../../data/store";

/** Cliente corrente dell'area cliente (in futuro: l'utente che ha fatto l'accesso) */
export const useMe = () => useStore((s) => s.clients.find((c) => c.id === s.meId) ?? s.clients[0]);
