import React from "react";
import "./LeftSidebar.css";

interface LeftSidebarProps {
  isVisible: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <aside className={`left-sidebar ${isVisible ? "" : "hidden"}`}>
      <div className="sidebar-section">
        <h4>Fichiers Récents</h4>
        <ul>
          <li>📄 Document1.md</li>
          <li>📄 Notes_ réunion.md</li>
        </ul>
      </div>
      <div className="sidebar-section">
        <h4>Dossier Courant</h4>
        <ul>
          <li>📁 Projet Alpha</li>
          <li>📄 README.md</li>
          <li>📄 todo.txt</li>
        </ul>
      </div>
    </aside>
  );
};

export default LeftSidebar;
