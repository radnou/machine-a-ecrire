import React, { useState, useEffect, useCallback, useRef } from "react";
import CaractereFrappe from "./CaractereFrappe";
import "./TypewriterView.css"; // Assure-toi que c'est le bon fichier CSS

const CHARACTER_WIDTH_ESTIMATE_PX = 10.5; // Sera mesuré
const LINE_HEIGHT_PX = 28; // Sera mesuré
const PAPER_INITIAL_PADDING_PX = 40;

const PAPER_CONTENT_CHARS_WIDE = 70; // Largeur FIXE du contenu du papier en caractères
const PAPER_CONTENT_LINES_HIGH_DEFAULT = 25;

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
  const measureCharRef = useRef<HTMLSpanElement>(null);
  const measureLineRef = useRef<HTMLDivElement>(null);

  const [charWidth, setCharWidth] = useState(CHARACTER_WIDTH_ESTIMATE_PX);
  const [lineHeight, setLineHeight] = useState(LINE_HEIGHT_PX);

  // paperContentCharsWide est maintenant une constante (ou pourrait être un état si on veut le changer via des options)
  // Pour l'instant, c'est la constante PAPER_CONTENT_CHARS_WIDE définie ci-dessus.

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

  const getInitialPaperXForNewLine = useCallback(() => {
    if (viewportRef.current) {
      const viewportWidth = viewportRef.current.offsetWidth;
      const typingPointXInViewport =
        (viewportWidth * FIXED_CURSOR_VIEWPORT_X_PERCENT) / 100;
      return typingPointXInViewport - PAPER_INITIAL_PADDING_PX;
    }
    return 0;
  }, [viewportRef]);

  useEffect(() => {
    const calculateDimensionsAndPosition = () => {
      if (
        viewportRef.current &&
        measureCharRef.current &&
        measureLineRef.current
      ) {
        const measuredCharWidth = measureCharRef.current.offsetWidth;
        const measuredLineHeight = measureLineRef.current.offsetHeight;

        let charW =
          measuredCharWidth > 0
            ? measuredCharWidth
            : CHARACTER_WIDTH_ESTIMATE_PX;
        let lineH =
          measuredLineHeight > 0 ? measuredLineHeight : LINE_HEIGHT_PX;

        setCharWidth(charW);
        setLineHeight(lineH);

        const viewportHeight = viewportRef.current.offsetHeight;
        const typingPointYInViewport =
          (viewportHeight * FIXED_CURSOR_VIEWPORT_Y_PERCENT) / 100;

        const initialX = getInitialPaperXForNewLine();
        const initialY = typingPointYInViewport - PAPER_INITIAL_PADDING_PX;

        setPaperSheetX(initialX);
        setPaperSheetY(initialY);
      }
    };

    calculateDimensionsAndPosition(); // Appel initial
    // Une seule fois suffit si la taille de la police de base ne change pas,
    // ou si le recalcul de charW/lineH suffit.
    // Si PAPER_CONTENT_CHARS_WIDE devait changer avec la taille du viewport, alors l'écouteur resize serait plus critique ici.
    // Pour une largeur de papier fixe, on peut même enlever l'écouteur resize si le point de frappe % est stable.
    // Gardons-le pour l'instant au cas où la taille de police de base changerait dynamiquement (zoom navigateur).
    window.addEventListener("resize", calculateDimensionsAndPosition);
    return () =>
      window.removeEventListener("resize", calculateDimensionsAndPosition);
  }, [getInitialPaperXForNewLine]); // Retiré charWidth et lineHeight pour éviter boucle si valeurs par défaut utilisées

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      const currentLineChars = allLines[currentLineIndex] || [];

      if (event.key.length === 1) {
        if (currentLineChars.length >= PAPER_CONTENT_CHARS_WIDE) {
          // Utilise la constante
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
        setPaperSheetX(getInitialPaperXForNewLine());
        setPaperSheetY((prevY) => prevY - lineHeight);
        setBellRungForThisLine(false);
      }
    },
    [
      allLines,
      currentLineIndex,
      bellRungForThisLine,
      getInitialPaperXForNewLine,
      charWidth,
      lineHeight,
      // paperContentCharsWide n'est plus un état, donc plus une dépendance ici
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
      style={{ minHeight: `${lineHeight}px` }}
    >
      {lineChars.map((charObj) => (
        <CaractereFrappe key={charObj.id} char={charObj.char} />
      ))}
    </div>
  ));

  return (
    <>
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

      <div className="typewriter-viewport" ref={viewportRef}>
        <div
          className="fixed-cursor-overlay"
          style={{
            left: `${FIXED_CURSOR_VIEWPORT_X_PERCENT}%`,
            top: `${FIXED_CURSOR_VIEWPORT_Y_PERCENT}%`,
            transform: `translateX(-50%) translateY(-${lineHeight * 0.65}px)`,
            opacity: cursorBlinkVisible ? 1 : 0,
          }}
        />

        <div
          className="paper-sheet"
          style={{
            width: `${paperSheetWidthPx}px`,
            height: `${paperSheetHeightPx}px`,
            transform: `translate(${paperSheetX}px, ${paperSheetY}px)`,
            padding: `${PAPER_INITIAL_PADDING_PX}px`,
            fontFamily: '"Courier Prime", "Courier New", Courier, monospace',
            fontSize: "1.1rem",
            lineHeight: "1.8",
            "--paper-initial-padding-px": `${PAPER_INITIAL_PADDING_PX}px`,
            "--paper-margin-line-right-offset-px": "60px",
          }}
        >
          {paperContent}
        </div>
      </div>
    </>
  );
};

export default FeuillePapier;
