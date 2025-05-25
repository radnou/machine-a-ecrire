// src/App.tsx
import React from "react";
import FeuillePapier from "./components/FeuillePapier";
import "./App.css"; // Charger les styles globaux (ceux de typewriter-viewport etc.)

function App() {
  return (
    // Le body est déjà stylé pour centrer, donc App peut être simple
    <FeuillePapier />
  );
}

export default App;
