import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // Important pour que les chemins soient corrects dans le build Electron
  build: {
    outDir: "dist", // Assure-toi que Electron charge depuis ce dossier
  },
  server: {
    port: 5173, // Port par défaut, assure-toi qu'il correspond dans tes scripts
  },
});
