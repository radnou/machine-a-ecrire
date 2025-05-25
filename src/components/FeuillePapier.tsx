import React, { useState, useEffect, useCallback, useRef } from "react";
import CaractereFrappe from "./CaractereFrappe";
import "./FeuillePapier.css"; // Assure-toi que ce fichier contient les styles précédents

// --- Constantes (ajuste-les précisément !) ---
const CHARACTER_WIDTH_ESTIMATE_PX = 10.5;
const LINE_HEIGHT_PX = 28;
const PAPER_INITIAL_PADDING_PX = 40; // Marge interne du papier où le texte commence

const PAPER_CONTENT_CHARS_WIDE = 70;
const PAPER_SHEET_WIDTH_PX =
  PAPER_CONTENT_CHARS_WIDE * CHARACTER_WIDTH_ESTIMATE_PX +
  2 * PAPER_INITIAL_PADDING_PX;
// PAPER_SHEET_HEIGHT_PX etc. (comme défini précédemment)

const FIXED_CURSOR_VIEWPORT_X_PERCENT = 50;
const FIXED_CURSOR_VIEWPORT_Y_PERCENT = 30;

// Pour la clochette
const CHARS_IN_BELL_ZONE = 7; // La clochette sonne X caractères avant la fin de la ligne de contenu
const BELL_SOUND_SRC = "/sounds/typewriter-bell.mp3"; // Place ton fichier son ici
const bellSound =
  typeof Audio !== "undefined" ? new Audio(BELL_SOUND_SRC) : null;

interface CharObject {
  id: string;
  char: string;
}

const FeuillePapier: React.FC = () => {
  const viewportRef = useRef<HTMLDivElement>(null);

  // Position du coin supérieur gauche du PAPIER par rapport au VIEWPORT
  const [paperSheetX, setPaperSheetX] = useState(0);
  const [paperSheetY, setPaperSheetY] = useState(0);

  // Lignes de texte
  const [allLines, setAllLines] = useState<CharObject[][]>([[]]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const [cursorBlinkVisible, setCursorBlinkVisible] = useState(true);
  const [bellRungForThisLine, setBellRungForThisLine] = useState(false);

  // Position X de départ du papier pour que son contenu (après padding) soit aligné avec le curseur fixe
  const getInitialPaperXForNewLine = useCallback(() => {
    if (viewportRef.current) {
      const viewportWidth = viewportRef.current.offsetWidth;
      const typingPointXInViewport =
        (viewportWidth * FIXED_CURSOR_VIEWPORT_X_PERCENT) / 100;
      return typingPointXInViewport - PAPER_INITIAL_PADDING_PX;
    }
    return 0; // Valeur par défaut
  }, [viewportRef]);

  // Calculer la position initiale du papier
  useEffect(() => {
    if (viewportRef.current) {
      const viewportHeight = viewportRef.current.offsetHeight;
      const typingPointYInViewport =
        (viewportHeight * FIXED_CURSOR_VIEWPORT_Y_PERCENT) / 100;

      setPaperSheetX(getInitialPaperXForNewLine());
      setPaperSheetY(typingPointYInViewport - PAPER_INITIAL_PADDING_PX);
    }
  }, [getInitialPaperXForNewLine]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      const currentLineChars = allLines[currentLineIndex] || [];

      if (event.key.length === 1) {
        // Caractère imprimable
        const newChar: CharObject = {
          id: `char-${Date.now()}-${Math.random()}`,
          char: event.key,
        };
        const newLineContent = [...currentLineChars, newChar];
        const newAllLines = [...allLines];
        newAllLines[currentLineIndex] = newLineContent;
        setAllLines(newAllLines);

        setPaperSheetX((prevX) => prevX - CHARACTER_WIDTH_ESTIMATE_PX);

        // Logique de la clochette
        // Nombre de caractères sur la ligne actuelle *après* ajout
        const charsOnCurrentLine = newLineContent.length;
        if (
          !bellRungForThisLine &&
          charsOnCurrentLine >= PAPER_CONTENT_CHARS_WIDE - CHARS_IN_BELL_ZONE &&
          charsOnCurrentLine < PAPER_CONTENT_CHARS_WIDE // Évite de sonner si on dépasse déjà
        ) {
          if (bellSound) {
            bellSound.currentTime = 0;
            bellSound
              .play()
              .catch((error) =>
                console.error("Erreur lecture son clochette:", error)
              );
          }
          setBellRungForThisLine(true);
        }
      } else if (event.key === "Backspace") {
        if (currentLineChars.length > 0) {
          const newLineContent = currentLineChars.slice(0, -1);
          const newAllLines = [...allLines];
          newAllLines[currentLineIndex] = newLineContent;
          setAllLines(newAllLines);

          setPaperSheetX((prevX) => prevX + CHARACTER_WIDTH_ESTIMATE_PX);

          // Si on recule et qu'on sort de la zone de la clochette
          const charsOnCurrentLine = newLineContent.length;
          if (
            bellRungForThisLine &&
            charsOnCurrentLine < PAPER_CONTENT_CHARS_WIDE - CHARS_IN_BELL_ZONE
          ) {
            setBellRungForThisLine(false);
          }
        }
        // TODO: Gérer backspace en début de ligne pour remonter à la ligne précédente
      } else if (event.key === "Enter") {
        // 1. Finaliser la ligne actuelle (déjà fait par la structure de allLines)
        // 2. Passer à la ligne suivante
        setCurrentLineIndex((prevIndex) => prevIndex + 1);
        setAllLines((prevLines) => [...prevLines, []]); // Ajoute une nouvelle ligne vide

        // 3. Réinitialiser la position X du papier pour la nouvelle ligne
        setPaperSheetX(getInitialPaperXForNewLine());
        // 4. Décaler le papier vers le haut (diminuer Y)
        setPaperSheetY((prevY) => prevY - LINE_HEIGHT_PX);
        // 5. Réinitialiser la clochette
        setBellRungForThisLine(false);
      }
    },
    [
      allLines,
      currentLineIndex,
      bellRungForThisLine,
      getInitialPaperXForNewLine,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const intervalId = setInterval(() => setCursorBlinkVisible((v) => !v), 500);
    return () => clearInterval(intervalId);
  }, []);

  const paperContent = allLines.map((lineChars, lineIdx) => (
    <div
      key={`line-${lineIdx}`}
      className="paper-line"
      style={{ minHeight: `${LINE_HEIGHT_PX}px` }}
    >
      {lineChars.map((charObj) => (
        <CaractereFrappe key={charObj.id} char={charObj.char} />
      ))}
    </div>
  ));

  return (
    <div className="typewriter-viewport" ref={viewportRef}>
      {cursorBlinkVisible && (
        <div
          className="fixed-cursor-overlay"
          style={{
            left: `${FIXED_CURSOR_VIEWPORT_X_PERCENT}%`,
            top: `${FIXED_CURSOR_VIEWPORT_Y_PERCENT}%`,
            // Si tu veux un curseur bloc comme '█'
            // width: `${CHARACTER_WIDTH_ESTIMATE_PX}px`,
            // height: `${LINE_HEIGHT_PX * 0.8}px`, // Ajuster la hauteur
            // backgroundColor: '#111',
          }}
        >
          {/* Laisse vide si c'est un bloc, ou '█' si tu veux un caractère texte */}
          {/* Pour un bloc CSS, le style ci-dessus suffit, pas besoin de contenu */}
        </div>
      )}

      <div
        className="paper-sheet"
        style={{
          width: `${PAPER_SHEET_WIDTH_PX}px`,
          // height: `${PAPER_SHEET_HEIGHT_PX}px`, // Tu peux fixer la hauteur ou la laisser grandir
          transform: `translate(${paperSheetX}px, ${paperSheetY}px)`,
          padding: `${PAPER_INITIAL_PADDING_PX}px`, // Le padding est maintenant ici
        }}
      >
        {paperContent}
      </div>
    </div>
  );
};

export default FeuillePapier;
