import React from "react";
import "./BottomBar.css";

const BottomBar: React.FC = () => {
  return (
    <div className="bottom-status-bar">
      <div className="stats">
        <span>Mots: 0</span>
        <span className="stat-divider">|</span>
        <span>Caractères: 0</span>
        <span className="stat-divider">|</span>
        <span>Espaces: 0</span>
      </div>
      <div className="time-spent">Temps passé: 0m</div>
    </div>
  );
};

export default BottomBar;
