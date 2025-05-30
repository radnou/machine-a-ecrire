import React from 'react';
import './TopMenu.css';
import {
  openFileDialog,
  saveFileDialog,
  openFolderDialog,
} from '../../services/fileSystemAPI';

interface TopMenuProps {
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
  isLeftSidebarVisible: boolean;
  isRightSidebarVisible: boolean;
  currentFileContent: string; // Pour la sauvegarde
  onFileOpened: (content: string, path: string) => void; // Pour mettre à jour le contenu
}

const TopMenu: React.FC<TopMenuProps> = ({
  onToggleLeftSidebar,
  onToggleRightSidebar,
  isLeftSidebarVisible,
  isRightSidebarVisible,
  currentFileContent,
  onFileOpened,
}) => {
  const handleOpenFile = async () => {
    const file = await openFileDialog();
    if (file) {
      onFileOpened(file.content, file.path);
      console.log('Fichier ouvert:', file.path);
    }
  };

  const handleOpenFolder = async () => {
    const files = await openFolderDialog();
    if (files) {
      console.log('Dossier ouvert, fichiers:', files);
      // Logique pour afficher ces fichiers dans LeftSidebar
    }
  };

  const handleSaveFile = async () => {
    // TODO: Obtenir le chemin actuel du fichier s'il existe
    const savedPath = await saveFileDialog(currentFileContent, undefined);
    if (savedPath) {
      console.log('Fichier sauvegardé:', savedPath);
      // TODO: Mettre à jour l'état du fichier actuel avec le nouveau chemin
    }
  };

  return (
    <div className="top-menu-bar">
      <div className="sidebar-toggles">
        <button
          onClick={onToggleLeftSidebar}
          title={isLeftSidebarVisible ? 'Masquer Gauche' : 'Afficher Gauche'}
        >
          {isLeftSidebarVisible ? '⬅️' : '➡️'}
        </button>
      </div>

      <div className="file-actions">
        <button onClick={handleOpenFile} title="Ouvrir un fichier">
          📄
        </button>
        <button onClick={handleOpenFolder} title="Ouvrir un dossier">
          📁
        </button>
        <button onClick={handleSaveFile} title="Enregistrer">
          💾
        </button>
        <button title="Exporter">📤</button>
        <button title="Imprimer">🖨️</button>
        <button title="Envoyer par e-mail">📧</button>
      </div>

      <div className="sidebar-toggles">
        <button
          onClick={onToggleRightSidebar}
          title={isRightSidebarVisible ? 'Masquer Droite' : 'Afficher Droite'}
        >
          {isRightSidebarVisible ? '➡️' : '⬅️'}
        </button>
      </div>
    </div>
  );
};

export default TopMenu;
