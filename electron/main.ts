import { app, BrowserWindow } from "electron";
import path from "node:path";

// Variable pour savoir si on est en développement ou en production
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // On créera ce fichier
      contextIsolation: true, // Recommandé pour la sécurité
      nodeIntegration: false, // Recommandé pour la sécurité
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    // Ouvre les outils de développement en mode dev
    win.webContents.openDevTools();
  } else {
    // En production, charge le fichier index.html buildé par Vite
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(createWindow);

// Quitte l'application lorsque toutes les fenêtres sont fermées (sauf sur macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Sur macOS, recrée une fenêtre si l'application est activée et qu'aucune fenêtre n'est ouverte
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
