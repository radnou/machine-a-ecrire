import React, { useState, useEffect, useCallback, useRef } from "react";
import CaractereFrappe from "../CaractereFrappe";
import "./PaperStyles.css";

const CHARACTER_WIDTH_ESTIMATE_PX = 10.5;
const LINE_HEIGHT_PX = 28;
const PAPER_INITIAL_PADDING_PX = 40;

const PAPER_CONTENT_CHARS_WIDE = 70;
const PAPER_CONTENT_LINES_HIGH_DEFAULT = 25;

const FIXED_CURSOR_VIEWPORT_X_PERCENT = 50;
const FIXED_CURSOR_VIEWPORT_Y_PERCENT = 30;

const CHARS_IN_BELL_ZONE = 7;
const BELL_SOUND_SRC = "/sounds/typewriter-bell.mp3";
const bellSound =
  typeof Audio !== "undefined" ? new Audio(BELL_SOUND_SRC) : null;

export interface CharObject {
  id: string;
  char: string;
  state: 'fresh' | 'dried'; // New property
}

export interface FeuillePapierProps {
  initialContent?: string;
  onTextChange?: (allLines: CharObject[][]) => void;
}

const INK_DRYING_TIME_MS = 2000; // 2 seconds

const FeuillePapier: React.FC<FeuillePapierProps> = ({
  initialContent,
  onTextChange,
}) => {
  const mainContentRef = useRef<HTMLDivElement>(null);
  const dryingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
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

  // Function to update a character's state to 'dried'
  const dryCharacter = useCallback((charId: string) => {
    setAllLines((prevAllLines) => {
      let charFoundAndUpdated = false;
      const newAllLines = prevAllLines.map(line =>
        line.map(charObj => {
          if (charObj.id === charId && charObj.state === 'fresh') {
            charFoundAndUpdated = true;
            return { ...charObj, state: 'dried' as 'dried' };
          }
          return charObj;
        })
      );
      if (charFoundAndUpdated && onTextChange) {
        // Optional: notify parent about this specific type of change if needed
        // For now, onTextChange is primarily for text content, not just state updates
        // Consider if a separate callback for state changes is ever needed
      }
      return charFoundAndUpdated ? newAllLines : prevAllLines;
    });
    dryingTimeoutsRef.current.delete(charId);
  }, [onTextChange]); // Added onTextChange to dependencies, though not strictly used in current logic for state update

  const [cursorBlinkVisible, setCursorBlinkVisible] = useState(true);
  const [bellRungForThisLine, setBellRungForThisLine] = useState(false);

  const [currentTextInsertionPoint, setCurrentTextInsertionPoint] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    let didCancel = false;
    const calculateInitialDimensionsAndPosition = () => {
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

        let charChanged = false;
        let lineHeightChanged = false;

        if (Math.abs(newCharW - charWidth) > 0.1) {
          setCharWidth(newCharW);
          charChanged = true;
        }
        if (Math.abs(newLineH - lineHeight) > 0.1) {
          setLineHeight(newLineH);
          lineHeightChanged = true;
        }

        if (
          charChanged ||
          lineHeightChanged ||
          (paperSheetX === 0 &&
            paperSheetY === 0 &&
            currentTextInsertionPoint.x === 0 &&
            currentTextInsertionPoint.y === 0)
        ) {
          const mainContentWidth = mainContentRef.current.clientWidth;
          const mainContentHeight = mainContentRef.current.clientHeight;
          const typingPointXInArea =
            (mainContentWidth * FIXED_CURSOR_VIEWPORT_X_PERCENT) / 100;
          const typingPointYInArea =
            (mainContentHeight * FIXED_CURSOR_VIEWPORT_Y_PERCENT) / 100;

          const newPaperX =
            typingPointXInArea -
            PAPER_INITIAL_PADDING_PX -
            currentTextInsertionPoint.x;
          const newPaperY =
            typingPointYInArea -
            PAPER_INITIAL_PADDING_PX -
            currentTextInsertionPoint.y;

          if (!didCancel) {
            setPaperSheetX(newPaperX);
            setPaperSheetY(newPaperY);
          }
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (!didCancel) calculateInitialDimensionsAndPosition();
    }, 50);

    return () => {
      didCancel = true;
      clearTimeout(timeoutId);
    };
  }, [charWidth, lineHeight, currentTextInsertionPoint, mainContentRef]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();

      let newAllLinesState = allLines.map((line) => [...line]);
      let currentLineChars = newAllLinesState[currentLineIndex] || [];

      let newInsertionX = currentTextInsertionPoint.x;
      let newInsertionY = currentTextInsertionPoint.y;

      if (event.key.length === 1) {
        if (currentLineChars.length >= PAPER_CONTENT_CHARS_WIDE) {
          console.log("Fin de ligne atteinte, input bloqué.");
          return;
        }
        const charId = `char-${Date.now()}-${Math.random()}`;
        const newChar: CharObject = {
          id: charId,
          char: event.key,
          state: 'fresh', // Initialize as fresh
        };
        currentLineChars.push(newChar);
        newAllLinesState[currentLineIndex] = currentLineChars;

        // Clear previous timeout for this charId if any (should not happen for new chars)
        if (dryingTimeoutsRef.current.has(charId)) {
          clearTimeout(dryingTimeoutsRef.current.get(charId)!);
        }
        // Set timeout to dry the character
        const timeoutId = setTimeout(() => {
          dryCharacter(charId);
        }, INK_DRYING_TIME_MS);
        dryingTimeoutsRef.current.set(charId, timeoutId);

        newInsertionX += charWidth;
        setPaperSheetX((prevX) => prevX - charWidth);

        const charsOnCurrentLine = currentLineChars.length;
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
          const removedChar = currentLineChars.pop();
          if (removedChar && dryingTimeoutsRef.current.has(removedChar.id)) {
            clearTimeout(dryingTimeoutsRef.current.get(removedChar.id)!);
            dryingTimeoutsRef.current.delete(removedChar.id);
          }
          newAllLinesState[currentLineIndex] = currentLineChars;

          newInsertionX -= charWidth;
          setPaperSheetX((prevX) => prevX + charWidth);

          const charsOnCurrentLine = currentLineChars.length;
          if (
            bellRungForThisLine &&
            charsOnCurrentLine < PAPER_CONTENT_CHARS_WIDE - CHARS_IN_BELL_ZONE
          ) {
            setBellRungForThisLine(false);
          }
        }
      } else if (event.key === "Enter") {
        setCurrentLineIndex((prevIndex) => prevIndex + 1);
        newAllLinesState = [...newAllLinesState, []];

        newInsertionX = 0;
        newInsertionY += lineHeight;

        if (mainContentRef.current) {
          const mainContentWidth = mainContentRef.current.clientWidth;
          const typingPointXInArea =
            (mainContentWidth * FIXED_CURSOR_VIEWPORT_X_PERCENT) / 100;
          const targetPaperX = typingPointXInArea - PAPER_INITIAL_PADDING_PX;
          setPaperSheetX(targetPaperX);

          const mainContentHeight = mainContentRef.current.clientHeight;
          const typingPointYInArea =
            (mainContentHeight * FIXED_CURSOR_VIEWPORT_Y_PERCENT) / 100;
          const targetPaperY =
            typingPointYInArea - PAPER_INITIAL_PADDING_PX - newInsertionY;
          setPaperSheetY(targetPaperY);
        }
        setBellRungForThisLine(false);
      }

      setAllLines(newAllLinesState);
      setCurrentTextInsertionPoint({ x: newInsertionX, y: newInsertionY });

      if (onTextChange) {
        onTextChange(newAllLinesState);
      }
    },
    [
      allLines,
      currentLineIndex,
      bellRungForThisLine,
      charWidth,
      lineHeight,
      currentTextInsertionPoint,
      mainContentRef,
      onTextChange,
    ]
  );

  useEffect(() => {
    if (initialContent) {
      const lines = initialContent.split("\n");
      const newAllLinesData: CharObject[][] = lines.map((line) =>
        line.split("").map((char) => ({
          id: `loaded-${Date.now()}-${Math.random()}`,
          char,
          state: 'dried' as 'dried', // Initial content is considered dried
        }))
      );
      setAllLines(newAllLinesData);

      const lastLineIndex = newAllLinesData.length - 1;
      const lastLineLength = newAllLinesData[lastLineIndex]?.length || 0;

      setCurrentLineIndex(lastLineIndex);
      const initialInsertionY = lastLineIndex * lineHeight;
      const initialInsertionX = lastLineLength * charWidth;
      setCurrentTextInsertionPoint({
        x: initialInsertionX,
        y: initialInsertionY,
      });

      if (mainContentRef.current) {
        const mainContentWidth = mainContentRef.current.clientWidth;
        const typingPointXInArea =
          (mainContentWidth * FIXED_CURSOR_VIEWPORT_X_PERCENT) / 100;
        const initialPaperX =
          typingPointXInArea - PAPER_INITIAL_PADDING_PX - initialInsertionX;
        setPaperSheetX(initialPaperX);

        const mainContentHeight = mainContentRef.current.clientHeight;
        const typingPointYInArea =
          (mainContentHeight * FIXED_CURSOR_VIEWPORT_Y_PERCENT) / 100;
        const initialPaperY =
          typingPointYInArea - PAPER_INITIAL_PADDING_PX - initialInsertionY;
        setPaperSheetY(initialPaperY);
      }
      if (onTextChange) {
        onTextChange(newAllLinesData);
      }
    } else {
      setAllLines([[]]);
      setCurrentLineIndex(0);
      setCurrentTextInsertionPoint({ x: 0, y: 0 });
      if (mainContentRef.current) {
        // Position initial du papier vide
        const mainContentWidth = mainContentRef.current.clientWidth;
        const typingPointXInArea =
          (mainContentWidth * FIXED_CURSOR_VIEWPORT_X_PERCENT) / 100;
        setPaperSheetX(typingPointXInArea - PAPER_INITIAL_PADDING_PX);

        const mainContentHeight = mainContentRef.current.clientHeight;
        const typingPointYInArea =
          (mainContentHeight * FIXED_CURSOR_VIEWPORT_Y_PERCENT) / 100;
        setPaperSheetY(typingPointYInArea - PAPER_INITIAL_PADDING_PX);
      }
    }
  }, [initialContent, charWidth, lineHeight, mainContentRef, onTextChange]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      // Only remove the event listener here. Timeout cleanup will be separate.
    };
  }, [handleKeyPress]); 

  // Effect for unmount cleanup of all drying timeouts
  useEffect(() => {
    return () => {
      dryingTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      dryingTimeoutsRef.current.clear();
      // console.log("FeuillePapier unmounted, all drying timeouts cleared."); // For actual debugging
    };
  }, []); // Empty dependency array means this runs only on unmount

  useEffect(() => {
    const intervalId = setInterval(() => setCursorBlinkVisible((v) => !v), 500);
    return () => clearInterval(intervalId);
  }, []);

  // Ensure dryCharacter is part of handleKeyPress's dependency array if it changes
  // This might require further memoization of handleKeyPress or its parts.
  // For now, assuming dryCharacter is stable due to useCallback.

  const paperContent = allLines.map((lineChars, lineIdx) => (
    <div
      key={`line-${lineIdx}`}
      className="paper-line"
      style={{ minHeight: `${lineHeight}px` }}
    >
      {lineChars.map((charObj) => (
        <CaractereFrappe key={charObj.id} char={charObj.char} state={charObj.state} charId={charObj.id} />
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
