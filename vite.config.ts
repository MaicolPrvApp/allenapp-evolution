import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base relativa: l'app funziona sia su GitHub Pages sia in qualsiasi sottocartella
export default defineConfig({
  base: "./",
  plugins: [react()],
});
