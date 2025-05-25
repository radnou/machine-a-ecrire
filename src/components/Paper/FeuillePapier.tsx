import React, { useState, useEffect, useCallback, useRef } from "react";
import CaractereFrappe from "../CaractereFrappe";
// Change cet import pour pointer vers les styles spécifiques au papier/contenu,
// les styles du viewport sont maintenant dans MainLayout.css
import "./PaperStyles.css"; // Nouveau fichier CSS suggéré pour les styles UNIQUEMENT du papier et du texte

// --- Constantes (ajuste-les précisément !) ---
const CHARACTER_WIDTH_ESTIMATE_PX = 10.5;
const LINE_HEIGHT_PX = 28;
const PAPER_INITIAL_PADDING_PX = 40;

const PAPER_CONTENT_CHARS_WIDE = 90;
const PAPER_CONTENT_LINES_HIGH_DEFAULT = 25; // Pour la hauteur initiale du papier

// Ces pourcentages sont maintenant par rapport au layout-main-content
const FIXED_CURSOR_AREA_X_PERCENT = 50;
const FIXED_CURSOR_AREA_Y_PERCENT = 20; // Plus haut dans la zone de contenu

const CHARS_IN_BELL_ZONE = 7;
const BELL_SOUND_SRC = "/sounds/typewriter-bell.mp3";
const bellSound =
  typeof Audio !== "undefined" ? new Audio(BELL_SOUND_SRC) : null;

interface CharObject {
  id: string;
  char: string;
}

const FeuillePapier: React.FC = () => {
  // Ce ref pointera maintenant vers le conteneur de .paper-sheet DANS layout-main-content
  const mainContentRef = useRef<HTMLDivElement>(null);
  const measureCharRef = useRef<HTMLSpanElement>(null);
  const measureLineRef = useRef<HTMLDivElement>(null);

  const [charWidth, setCharWidth] = useState(CHARACTER_WIDTH_ESTIMATE_PX);
  const [lineHeight, setLineHeight] = useState(LINE_HEIGHT_PX);

  const paperContentWidthPx = PAPER_CONTENT_CHARS_WIDE * charWidth;
  const paperSheetWidthPx = paperContentWidthPx + 2 * PAPER_INITIAL_PADDING_PX;
  const paperContentHeightPx = PAPER_CONTENT_LINES_HIGH_DEFAULT * lineHeight;
  const paperSheetHeightPx =
    paperContentHeightPx + 2 * PAPER_INITIAL_PADDING_PX;

  const [paperSheetX, setPaperSheetX] = useState(0);
  const [paperSheetY, setPaperSheetY] = useState(0);

  const [allLines, setAllLines] = useState<CharObject[][]>([[]]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const [cursorBlinkVisible, setCursorBlinkVisible] = useState(true);
  const [bellRungForThisLine, setBellRungForThisLine] = useState(false);

  const [currentTextInsertionPoint, setCurrentTextInsertionPoint] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    let didCancel = false;
    const calculateDimensionsAndPosition = () => {
      if (
        !didCancel &&
        mainContentRef.current &&
        measureCharRef.current &&
        measureLineRef.current
      ) {
        const measuredCharWidth = measureCharRef.current.offsetWidth;
        const measuredLineHeight = measureLineRef.current.offsetHeight;

        const newCharW = measuredCharWidth > 0 ? measuredCharWidth : charWidth;
        const newLineH =
          measuredLineHeight > 0 ? measuredLineHeight : lineHeight;

        if (newCharW !== charWidth && !didCancel) setCharWidth(newCharW);
        if (newLineH !== lineHeight && !didCancel) setLineHeight(newLineH);

        const mainContentWidth = mainContentRef.current.clientWidth; // Utilise la largeur de la zone de contenu
        const mainContentHeight = mainContentRef.current.clientHeight;
        const typingPointXInMainContent =
          (mainContentWidth * FIXED_CURSOR_AREA_X_PERCENT) / 100;
        const typingPointYInMainContent =
          (mainContentHeight * FIXED_CURSOR_AREA_Y_PERCENT) / 100;

        const newPaperX =
          typingPointXInMainContent -
          PAPER_INITIAL_PADDING_PX -
          currentTextInsertionPoint.x;
        const newPaperY =
          typingPointYInMainContent -
          PAPER_INITIAL_PADDING_PX -
          currentTextInsertionPoint.y;

        if (!didCancel) {
          setPaperSheetX(newPaperX);
          setPaperSheetY(newPaperY);
        }
      }
    };

    const runInitialCalculations = () => {
      if (measureCharRef.current && measureLineRef.current) {
        const measuredCharWidth = measureCharRef.current.offsetWidth;
        const measuredLineHeight = measureLineRef.current.offsetHeight;
        if (
          measuredCharWidth > 0 &&
          charWidth !== measuredCharWidth &&
          !didCancel
        ) {
          setCharWidth(measuredCharWidth);
        }
        if (
          measuredLineHeight > 0 &&
          lineHeight !== measuredLineHeight &&
          !didCancel
        ) {
          setLineHeight(measuredLineHeight);
        }
      }
      setTimeout(() => {
        if (!didCancel) calculateDimensionsAndPosition();
      }, 0);
    };

    runInitialCalculations();
    window.addEventListener("resize", calculateDimensionsAndPosition);

    return () => {
      didCancel = true;
      window.removeEventListener("resize", calculateDimensionsAndPosition);
    };
  }, [charWidth, lineHeight, currentTextInsertionPoint, mainContentRef]); // mainContentRef au lieu de viewportRef

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      const currentLineChars = allLines[currentLineIndex] || [];
      let newInsertionX = currentTextInsertionPoint.x;
      let newInsertionY = currentTextInsertionPoint.y;

      if (event.key.length === 1) {
        if (currentLineChars.length >= PAPER_CONTENT_CHARS_WIDE) {
          console.log("Fin de ligne atteinte, input bloqué.");
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

        newInsertionX += charWidth;
        setPaperSheetX((prevX) => prevX - charWidth);

        const charsOnCurrentLine = newLineContent.length;
        if (
          !bellRungForThisLine &&
          charsOnCurrentLine >= PAPER_CONTENT_CHARS_WIDE - CHARS_IN_BELL_ZONE &&
          charsOnCurrentLine < PAPER_CONTENT_CHARS_WIDE
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

          newInsertionX -= charWidth;
          setPaperSheetX((prevX) => prevX + charWidth);

          const charsOnCurrentLine = newLineContent.length;
          if (
            bellRungForThisLine &&
            charsOnCurrentLine < PAPER_CONTENT_CHARS_WIDE - CHARS_IN_BELL_ZONE
          ) {
            setBellRungForThisLine(false);
          }
        }
      } else if (event.key === "Enter") {
        setCurrentLineIndex((prevIndex) => prevIndex + 1);
        setAllLines((prevLines) => [...prevLines, []]);

        newInsertionX = 0;
        newInsertionY += lineHeight;

        if (mainContentRef.current) {
          // Utilise mainContentRef
          const mainContentWidth = mainContentRef.current.clientWidth;
          const typingPointXInMainContent =
            (mainContentWidth * FIXED_CURSOR_AREA_X_PERCENT) / 100;
          const targetPaperX =
            typingPointXInMainContent - PAPER_INITIAL_PADDING_PX;
          setPaperSheetX(targetPaperX);

          const mainContentHeight = mainContentRef.current.clientHeight;
          const typingPointYInMainContent =
            (mainContentHeight * FIXED_CURSOR_AREA_Y_PERCENT) / 100;
          const targetPaperY =
            typingPointYInMainContent -
            PAPER_INITIAL_PADDING_PX -
            newInsertionY;
          setPaperSheetY(targetPaperY);
        }
        setBellRungForThisLine(false);
      }
      setCurrentTextInsertionPoint({ x: newInsertionX, y: newInsertionY });
    },
    [
      allLines,
      currentLineIndex,
      bellRungForThisLine,
      charWidth,
      lineHeight,
      currentTextInsertionPoint,
      mainContentRef, // mainContentRef au lieu de viewportRef
    ]
  );

  useEffect(() => {
    // L'écouteur d'événements doit être sur un élément qui a le focus,
    // ou globalement puis filtré. Pour l'instant, global reste.
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
      style={{ minHeight: `${lineHeight}px` }}
    >
      {lineChars.map((charObj) => (
        <CaractereFrappe key={charObj.id} char={charObj.char} />
      ))}
    </div>
  ));

  return (
    // Ce div est le conteneur DANS la zone layout-main-content
    // Il doit avoir position relative pour son propre fixed-cursor-overlay
    <div
      className="feuille-papier-active-area"
      ref={mainContentRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          fontFamily: '"Courier Prime", "Courier New", Courier, monospace',
          fontSize: "1.1rem",
        }}
      >
        <span ref={measureCharRef}>M</span>
        <div
          ref={measureLineRef}
          style={{ lineHeight: "1.8", minHeight: "1.8rem" }}
        >
          TestLine
        </div>
      </div>

      {cursorBlinkVisible && (
        <div
          className="fixed-cursor-overlay"
          style={{
            // Ces % sont maintenant par rapport à feuille-papier-active-area
            left: `${FIXED_CURSOR_AREA_X_PERCENT}%`,
            top: `${FIXED_CURSOR_AREA_Y_PERCENT}%`,
            transform: `translateX(-50%) translateY(-${lineHeight * 0.65}px)`,
            opacity: 1, // Toujours visible, le clignotement géré par cursorBlinkVisible plus haut si besoin
            // Styles pour le curseur "guide métallique" (width, height, bg) sont dans le CSS
          }}
        />
      )}

      <div
        className="paper-sheet"
        style={{
          width: `${paperSheetWidthPx}px`,
          height: `${paperSheetHeightPx}px`,
          transform: `translate(${paperSheetX}px, ${paperSheetY}px)`,
          // Le padding est maintenant dans le CSS de .paper-sheet
          // fontFamily, fontSize, lineHeight sont aussi dans le CSS de .paper-sheet
          "--paper-initial-padding-px": `${PAPER_INITIAL_PADDING_PX}px`,
          "--paper-margin-line-right-offset-px": "60px",
        }}
      >
        {paperContent}
      </div>
    </div>
  );
};

export default FeuillePapier;
