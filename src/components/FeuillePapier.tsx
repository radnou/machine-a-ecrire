import React, { useState, useEffect, useCallback } from "react";
import CaractereFrappe from "./CaractereFrappe";
import "./FeuillePapier.css"; // Nous créerons ce fichier CSS

interface CharObject {
  id: string; // Pour la key unique de React
  char: string;
}

const FeuillePapier: React.FC = () => {
  const [textChars, setTextChars] = useState<CharObject[]>([]);
  const [cursorVisible, setCursorVisible] = useState(true);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    event.preventDefault(); // Empêche le comportement par défaut pour certaines touches

    if (event.key.length === 1) {
      // Gère les caractères imprimables
      setTextChars((prevChars) => [
        ...prevChars,
        { id: `char-${Date.now()}-${Math.random()}`, char: event.key },
      ]);
    } else if (event.key === "Backspace") {
      setTextChars((prevChars) => prevChars.slice(0, -1));
    } else if (event.key === "Enter") {
      setTextChars((prevChars) => [
        ...prevChars,
        { id: `char-${Date.now()}-${Math.random()}`, char: "\n" }, // Représente un saut de ligne
      ]);
    }
    // On ajoutera le mouvement du chariot et l'avance papier plus tard
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  // Effet pour le clignotement du curseur
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500); // Clignote toutes les 500ms
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="feuille-papier">
      <div className="zone-texte">
        {textChars.map((charObj) =>
          charObj.char === "\n" ? (
            <br key={charObj.id} />
          ) : (
            <CaractereFrappe key={charObj.id} char={charObj.char} />
          )
        )}
        {cursorVisible && <span className="cursor">█</span>}
      </div>
    </div>
  );
};

export default FeuillePapier;
