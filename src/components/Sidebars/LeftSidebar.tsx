import React from "react";
import "./LeftSidebar.css";

interface LeftSidebarProps {
  isVisible: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  // Données statiques pour l'instant
  const recentFiles = [
    { id: "1", name: "Document1.md" },
    { id: "2", name: "Notes_réunion.md" },
    { id: "3", name: "Idées_projet.txt" },
  ];

  const currentFolderFiles = [
    { id: "f1", name: "Projet Alpha", type: "folder" },
    { id: "f2", name: "README.md", type: "file" },
    { id: "f3", name: "todo.txt", type: "file" },
    { id: "f4", name: "images", type: "folder" },
  ];

  return (
    <aside className={`left-sidebar ${isVisible ? "" : "hidden"}`}>
      <div className="sidebar-section">
        <h4>Fichiers Récents</h4>
        <ul>
          {recentFiles.map((file) => (
            <li key={file.id}>📄 {file.name}</li>
          ))}
        </ul>
      </div>
      <div className="sidebar-section">
        <h4>Dossier Courant</h4>
        <ul>
          {currentFolderFiles.map((item) => (
            <li key={item.id}>
              {item.type === "folder" ? "📁" : "📄"} {item.name}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default LeftSidebar;
