// src/services/textUtils.ts

/**
 * Represents a character object used within the editor/FeuillePapier.
 * Defined locally for service decoupling.
 */
export interface CharObject {
  id: string;
  char: string;
  state: 'fresh' | 'dried';
}

/**
 * Converts an array of lines, where each line is an array of CharObjects,
 * into a single plain text string with lines separated by newline characters.
 *
 * @param lines - The CharObject[][] structure (e.g., from FeuillePapier).
 * @returns A plain text string representation.
 */
export function charObjectsToString(lines: CharObject[][]): string {
  if (!lines || lines.length === 0) {
    return "";
  }

  return lines
    .map(lineArray => 
      lineArray.map(charObj => charObj.char).join('')
    )
    .join('\n');
}

/**
 * Converts a plain text string into the CharObject[][] structure
 * used by FeuillePapier.
 *
 * @param text - The plain text string.
 * @returns The CharObject[][] structure.
 */
export function stringToCharObjects(text: string): CharObject[][] {
  // If the input string is empty, represent it as a document with one empty line.
  if (text === "") {
    return [[]];
  }

  const lines = text.split('\n');
  return lines.map(lineString => {
    if (lineString === "") {
      return []; // Represent an empty line as an empty array of CharObjects
    }
    return lineString.split('').map((charStr): CharObject => ({
      id: `char-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      char: charStr,
      state: 'dried', // Default to 'dried' when converting from plain text
    }));
  });
}
