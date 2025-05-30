// src/services/markdownParser.ts

/**
 * Represents a character object.
 * Defined locally for service decoupling.
 */
export interface CharObject {
  id: string;
  char: string;
  state: 'fresh' | 'dried';
}

/**
 * Converts an array of lines (CharObject[][]) to a Markdown string.
 * For this basic version, it treats each line as a paragraph separated by a single newline.
 * More advanced versions would handle Markdown syntax and paragraph spacing differently.
 *
 * @param lines - The CharObject[][] structure.
 * @returns A Markdown string representation.
 */
export function charObjectsToMarkdown(lines: CharObject[][]): string {
  if (!lines || lines.length === 0) {
    return '';
  }

  // Identical to charObjectsToString for this basic version
  return lines
    .map((lineArray) => lineArray.map((charObj) => charObj.char).join(''))
    .join('\n');
}

/**
 * Converts a Markdown string into the CharObject[][] structure.
 * For this basic version, it treats the Markdown string as plain text,
 * splitting by newlines. No actual Markdown syntax is parsed.
 *
 * @param markdown - The Markdown string.
 * @returns The CharObject[][] structure.
 */
export function markdownToCharObjects(markdown: string): CharObject[][] {
  // If the input string is empty, represent it as a document with one empty line.
  if (markdown === '') {
    return [[]];
  }

  // Identical to stringToCharObjects for this basic version
  const lines = markdown.split('\n');
  return lines.map((lineString) => {
    if (lineString === '') {
      return []; // Represent an empty line as an empty array of CharObjects
    }
    return lineString.split('').map(
      (charStr): CharObject => ({
        id: `char-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        char: charStr,
        state: 'dried', // Default to 'dried' when converting from Markdown text
      })
    );
  });
}
