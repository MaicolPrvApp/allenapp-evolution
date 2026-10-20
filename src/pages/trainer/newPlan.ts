import type { ID, Plan } from "../../data/types";
import { nowIso, today, uid } from "../../lib/util";

export const emptyPlan = (clientId: ID | null, goal = ""): Plan => ({
  id: uid(), name: clientId ? "Nuova scheda" : "Nuovo modello", description: "", goal, clientId,
  startDate: clientId ? today() : "", weeks: 6, active: true, createdAt: nowIso(), updatedAt: nowIso(),
  days: [{ id: uid(), name: "Giorno A", notes: "", blocks: [] }],
});
