// src/services/fileSystemAPI.ts

export interface FileData {
  path: string;
  content: string;
}

export const openFileDialog = async (): Promise<FileData | null> => {
  console.log("Appel simulé à Electron: openFileDialog");
  // Simulation: retourne un fichier de test après un délai
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        path: "/chemin/vers/monfichier_test.md",
        content:
          "# Titre de Test\n\nCeci est un contenu de test chargé depuis un fichier simulé.",
      });
    }, 500);
  });
};

export const saveFileDialog = async (
  content: string,
  currentPath?: string
): Promise<string | null> => {
  console.log("Appel simulé à Electron: saveFileDialog", {
    content,
    currentPath,
  });
  // Simulation: retourne un chemin de sauvegarde après un délai
  return new Promise((resolve) => {
    setTimeout(() => {
      const path = currentPath || "/chemin/vers/nouveau_fichier_sauvegardé.md";
      console.log(`Contenu sauvegardé (simulé) dans : ${path}`);
      resolve(path);
    }, 500);
  });
};

export const openFolderDialog = async (): Promise<string[] | null> => {
  console.log("Appel simulé à Electron: openFolderDialog");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(["fichier1.md", "fichier2.txt", "sous_dossier/"]);
    }, 500);
  });
};
