"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
// Variable pour savoir si on est en développement ou en production
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: node_path_1.default.join(__dirname, "preload.js"), // On créera ce fichier
            contextIsolation: true, // Recommandé pour la sécurité
            nodeIntegration: false, // Recommandé pour la sécurité
        },
    });
    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
        // Ouvre les outils de développement en mode dev
        win.webContents.openDevTools();
    }
    else {
        // En production, charge le fichier index.html buildé par Vite
        win.loadFile(node_path_1.default.join(__dirname, "..", "dist", "index.html"));
    }
}
electron_1.app.whenReady().then(createWindow);
// Quitte l'application lorsque toutes les fenêtres sont fermées (sauf sur macOS)
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
// Sur macOS, recrée une fenêtre si l'application est activée et qu'aucune fenêtre n'est ouverte
electron_1.app.on("activate", () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
