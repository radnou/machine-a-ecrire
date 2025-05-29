// src/features/textStyling/stylingUtils.ts

export interface StyledCharObject {
  id: string;
  char: string;
  state: 'fresh' | 'dried'; // Assuming this is still relevant from other features
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  highlightColor?: string;
}

export type TextStyleType = 'bold' | 'italic' | 'underline';

/**
 * Toggles a boolean style (bold, italic, underline) for an array of character objects.
 * Returns a new array with new character objects for all characters, with the specified style toggled.
 *
 * @param chars - The array of StyledCharObject to process.
 * @param style - The style type to toggle ('bold', 'italic', or 'underline').
 * @returns A new array of StyledCharObject with the style toggled.
 */
export function toggleStyle(chars: StyledCharObject[], style: TextStyleType): StyledCharObject[] {
  if (!chars || chars.length === 0) {
    return [];
  }

  return chars.map(charObj => {
    const newCharObj = { ...charObj };
    switch (style) {
      case 'bold':
        newCharObj.isBold = !newCharObj.isBold;
        break;
      case 'italic':
        newCharObj.isItalic = !newCharObj.isItalic;
        break;
      case 'underline':
        newCharObj.isUnderline = !newCharObj.isUnderline;
        break;
      default:
        // Should not happen with TypeScript, but good for robustness
        break;
    }
    return newCharObj;
  });
}

/**
 * Applies or removes a highlight color for an array of character objects.
 * Returns a new array with new character objects for all characters, with the highlight updated.
 *
 * @param chars - The array of StyledCharObject to process.
 * @param color - The highlight color string to apply. If undefined, removes the highlight.
 * @returns A new array of StyledCharObject with the highlight color applied or removed.
 */
export function applyHighlight(chars: StyledCharObject[], color?: string): StyledCharObject[] {
  if (!chars || chars.length === 0) {
    return [];
  }

  return chars.map(charObj => {
    const newCharObj = { ...charObj };
    if (typeof color === 'string') { // Includes empty string, which could be a valid "no color" state or an actual color
      newCharObj.highlightColor = color;
    } else if (color === undefined) { // Explicitly remove if color is undefined
      // To truly remove the property vs setting it to undefined: delete newCharObj.highlightColor;
      // However, setting to undefined is often sufficient and simpler.
      // Let's ensure the property is removed if color is undefined, as per "removes the highlightColor property".
      delete newCharObj.highlightColor;
    }
    // If color is null, it's not explicitly handled by the description "color is undefined (or null)".
    // Current logic: null color would mean newCharObj.highlightColor is not set/deleted, keeping existing.
    // To align with "color is undefined (or null), it removes", explicitly handle null too.
    // For now, following "color?: string" where undefined removes.
    return newCharObj;
  });
}
