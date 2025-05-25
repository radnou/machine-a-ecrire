import React from "react";
import "./BottomBar.css";

interface BottomBarProps {
  charCount: number;
  wordCount: number;
  spaceCount: number;
  timeSpent: string; // ex: "1h 25m"
}

const BottomBar: React.FC<BottomBarProps> = ({
  charCount,
  wordCount,
  spaceCount,
  timeSpent,
}) => {
  return (
    <div className="bottom-status-bar">
      <div className="stats">
        <span>Mots: {wordCount}</span>
        <span className="stat-divider">|</span>
        <span>Caractères: {charCount}</span>
        <span className="stat-divider">|</span>
        <span>Espaces: {spaceCount}</span>
      </div>
      <div className="time-spent">Temps passé: {timeSpent}</div>
    </div>
  );
};

export default BottomBar;
