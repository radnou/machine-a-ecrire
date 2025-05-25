// src/components/FeuillePapier.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import CaractereFrappe from "./CaractereFrappe";
// Assure-toi d'importer le bon fichier CSS (TypewriterView.css ou équivalent)
import "./TypewriterView.css"; // MODIFIÉ pour pointer vers le CSS correct supposé

// --- Constantes de base (peuvent être ajustées) ---
const PAPER_INITIAL_PADDING_PX = 40; // Marge interne du papier
const PAPER_CONTENT_CHARS_WIDE_DEFAULT = 70; // Nombre de caractères par défaut
const PAPER_CONTENT_LINES_HIGH_DEFAULT = 25; // Nombre de lignes par défaut

const FIXED_CURSOR_VIEWPORT_X_PERCENT = 50;
const FIXED_CURSOR_VIEWPORT_Y_PERCENT = 30;

const CHARS_IN_BELL_ZONE = 7;
const BELL_SOUND_SRC = "/sounds/typewriter-bell.mp3";
const bellSound =
  typeof Audio !== "undefined" ? new Audio(BELL_SOUND_SRC) : null;

interface CharObject {
  id: string;
  char: string;
}

const FeuillePapier: React.FC = () => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureCharRef = useRef<HTMLSpanElement>(null); // Pour mesurer un caractère
  const measureLineRef = useRef<HTMLDivElement>(null); // Pour mesurer la hauteur d'une ligne

  // --- États pour les dimensions calculées ---
  const [charWidth, setCharWidth] = useState(10.5); // Valeur par défaut
  const [lineHeight, setLineHeight] = useState(28); // Valeur par défaut
  const [paperContentCharsWide, setPaperContentCharsWide] = useState(
    PAPER_CONTENT_CHARS_WIDE_DEFAULT
  );

  // Dimensions calculées du papier
  const paperContentWidthPx = paperContentCharsWide * charWidth;
  const paperSheetWidthPx = paperContentWidthPx + 2 * PAPER_INITIAL_PADDING_PX;
  const paperContentHeightPx = PAPER_CONTENT_LINES_HIGH_DEFAULT * lineHeight; // Hauteur basée sur un nombre de lignes fixe pour l'instant
  const paperSheetHeightPx =
    paperContentHeightPx + 2 * PAPER_INITIAL_PADDING_PX;

  const [paperSheetX, setPaperSheetX] = useState(0);
  const [paperSheetY, setPaperSheetY] = useState(0);

  const [allLines, setAllLines] = useState<CharObject[][]>([[]]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const [cursorBlinkVisible, setCursorBlinkVisible] = useState(true);
  const [bellRungForThisLine, setBellRungForThisLine] = useState(false);

  const getInitialPaperXForNewLine = useCallback(() => {
    if (viewportRef.current) {
      const viewportWidth = viewportRef.current.offsetWidth;
      const typingPointXInViewport =
        (viewportWidth * FIXED_CURSOR_VIEWPORT_X_PERCENT) / 100;
      return typingPointXInViewport - PAPER_INITIAL_PADDING_PX;
    }
    return 0;
  }, [viewportRef]); // Ajout des dépendances manquantes

  // Mesurer les dimensions réelles et initialiser/ajuster la position du papier
  useEffect(() => {
    const calculateDimensionsAndPosition = () => {
      if (
        viewportRef.current &&
        measureCharRef.current &&
        measureLineRef.current
      ) {
        const measuredCharWidth =
          measureCharRef.current.offsetWidth || charWidth;
        const measuredLineHeight =
          measureLineRef.current.offsetHeight || lineHeight;
        setCharWidth(measuredCharWidth);
        setLineHeight(measuredLineHeight);

        // Optionnel: Rendre PAPER_CONTENT_CHARS_WIDE responsif (simplifié ici)
        // const availableWidthForText = viewportRef.current.offsetWidth - (2 * PAPER_INITIAL_PADDING_PX) - (quelques marges de sécurité);
        // const newPaperContentCharsWide = Math.max(10, Math.floor(availableWidthForText / measuredCharWidth));
        // setPaperContentCharsWide(newPaperContentCharsWide);
        // Pour l'instant, on garde PAPER_CONTENT_CHARS_WIDE_DEFAULT

        const viewportHeight = viewportRef.current.offsetHeight;
        const typingPointYInViewport =
          (viewportHeight * FIXED_CURSOR_VIEWPORT_Y_PERCENT) / 100;

        const initialX = getInitialPaperXForNewLine(); // Utilise la version mise à jour
        const initialY = typingPointYInViewport - PAPER_INITIAL_PADDING_PX;

        setPaperSheetX(initialX);
        setPaperSheetY(initialY);
      }
    };

    calculateDimensionsAndPosition(); // Calcul initial
    window.addEventListener("resize", calculateDimensionsAndPosition); // Recalculer au redimensionnement
    return () =>
      window.removeEventListener("resize", calculateDimensionsAndPosition);
  }, [getInitialPaperXForNewLine, charWidth, lineHeight]); // Dépendances pour le recalcul

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      const currentLineChars = allLines[currentLineIndex] || [];

      if (event.key.length === 1) {
        if (currentLineChars.length >= paperContentCharsWide) {
          // Utilise l'état dynamique
          console.log("Fin de ligne atteinte (max chars), input bloqué.");
          return;
        }

        const newChar: CharObject = {
          id: `char-${Date.now()}-${Math.random()}`,
          char: event.key,
        };
        const newLineContent = [...currentLineChars, newChar];
        const newAllLines = [...allLines];
        newAllLines[currentLineIndex] = newLineContent;
        setAllLines(newAllLines);

        setPaperSheetX((prevX) => prevX - charWidth); // Utilise charWidth mesuré

        const charsOnCurrentLine = newLineContent.length;
        if (
          !bellRungForThisLine &&
          charsOnCurrentLine >= paperContentCharsWide - CHARS_IN_BELL_ZONE &&
          charsOnCurrentLine < paperContentCharsWide
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

          setPaperSheetX((prevX) => prevX + charWidth); // Utilise charWidth mesuré

          const charsOnCurrentLine = newLineContent.length;
          if (
            bellRungForThisLine &&
            charsOnCurrentLine < paperContentCharsWide - CHARS_IN_BELL_ZONE
          ) {
            setBellRungForThisLine(false);
          }
        }
        // TODO: Gérer backspace en début de ligne
      } else if (event.key === "Enter") {
        setCurrentLineIndex((prevIndex) => prevIndex + 1);
        setAllLines((prevLines) => [...prevLines, []]);
        setPaperSheetX(getInitialPaperXForNewLine());
        setPaperSheetY((prevY) => prevY - lineHeight); // Utilise lineHeight mesuré
        setBellRungForThisLine(false);
      }
    },
    [
      allLines,
      currentLineIndex,
      bellRungForThisLine,
      getInitialPaperXForNewLine,
      charWidth, // Ajouté comme dépendance
      lineHeight, // Ajouté comme dépendance
      paperContentCharsWide, // Ajouté comme dépendance
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
      style={{ minHeight: `${lineHeight}px` }} // Utilise lineHeight mesuré
    >
      {lineChars.map((charObj) => (
        <CaractereFrappe key={charObj.id} char={charObj.char} />
      ))}
    </div>
  ));

  return (
    <>
      {/* Éléments de mesure cachés */}
      <div
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          fontFamily: '"Courier Prime", "Courier New", Courier, monospace',
          fontSize: "1.1rem",
        }}
      >
        <span ref={measureCharRef}>M</span>{" "}
        {/* Caractère typique pour la largeur */}
        <div
          ref={measureLineRef}
          style={{ lineHeight: "1.8", minHeight: "1.8rem" }}
        >
          TestLine
        </div>
      </div>

      <div className="typewriter-viewport" ref={viewportRef}>
        {cursorBlinkVisible && (
          <div
            className="fixed-cursor-overlay"
            style={{
              left: `${FIXED_CURSOR_VIEWPORT_X_PERCENT}%`,
              top: `${FIXED_CURSOR_VIEWPORT_Y_PERCENT}%`,
              width: `${charWidth}px`, // Largeur d'un caractère
              height: `${lineHeight * 0.85}px`, // Hauteur un peu moins que la ligne
              backgroundColor: "#1A1A1A", // Couleur encre
              transform: "translateX(-50%) translateY(-2px)", // Ajuste pour un meilleur centrage visuel
              // Ajoute une opacité pour le clignotement si géré par JS, sinon gère avec la classe CSS
            }}
          />
        )}

        <div
          className="paper-sheet"
          style={{
            width: `${paperSheetWidthPx}px`,
            height: `${paperSheetHeightPx}px`,
            transform: `translate(${paperSheetX}px, ${paperSheetY}px)`,
            padding: `${PAPER_INITIAL_PADDING_PX}px`,
            fontFamily: '"Courier Prime", "Courier New", Courier, monospace', // Assurer la cohérence
            fontSize: "1.1rem",
            lineHeight: "1.8",
          }}
        >
          {paperContent}
        </div>
      </div>
    </>
  );
};

export default FeuillePapier;
