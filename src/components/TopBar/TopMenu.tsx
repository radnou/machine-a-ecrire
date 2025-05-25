import React from "react";
import "./TopMenu.css";

interface TopMenuProps {
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
  isLeftSidebarVisible: boolean;
  isRightSidebarVisible: boolean;
}

const TopMenu: React.FC<TopMenuProps> = ({
  onToggleLeftSidebar,
  onToggleRightSidebar,
  isLeftSidebarVisible,
  isRightSidebarVisible,
}) => {
  return (
    <div className="top-menu-bar">
      <div className="sidebar-toggles">
        <button
          onClick={onToggleLeftSidebar}
          title={isLeftSidebarVisible ? "Masquer Gauche" : "Afficher Gauche"}
        >
          {isLeftSidebarVisible ? "⬅️" : "➡️"}
        </button>
      </div>

      <div className="file-actions">
        <button title="Ouvrir un fichier">📄</button>
        <button title="Ouvrir un dossier">📁</button>
        <button title="Enregistrer">💾</button>
        <button title="Exporter">📤</button>
        <button title="Imprimer">🖨️</button>
        <button title="Envoyer par e-mail">📧</button>
      </div>

      <div className="sidebar-toggles">
        <button
          onClick={onToggleRightSidebar}
          title={isRightSidebarVisible ? "Masquer Droite" : "Afficher Droite"}
        >
          {isRightSidebarVisible ? "➡️" : "⬅️"}
        </button>
      </div>
    </div>
  );
};

export default TopMenu;
