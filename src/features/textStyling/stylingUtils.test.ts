// src/features/textStyling/stylingUtils.test.ts

import { describe, it, expect } from 'vitest';
import {
  StyledCharObject,
  TextStyleType,
  toggleStyle,
  applyHighlight,
} from './stylingUtils';

// Helper to create StyledCharObject for tests
const createChar = (
  id: string, 
  char: string, 
  state: 'fresh' | 'dried' = 'dried',
  isBold = false, 
  isItalic = false, 
  isUnderline = false, 
  highlightColor?: string
): StyledCharObject => ({
  id,
  char,
  state,
  isBold,
  isItalic,
  isUnderline,
  highlightColor,
});

describe('Text Styling Utilities', () => {
  describe('toggleStyle', () => {
    const initialChars: StyledCharObject[] = [
      createChar('id1', 'a'),
      createChar('id2', 'b', 'fresh', true), // Initially bold
    ];

    it('should return an empty array if input is empty', () => {
      expect(toggleStyle([], 'bold')).toEqual([]);
    });

    it('should toggle "bold" style correctly', () => {
      // First toggle: a becomes bold, b becomes not bold
      const boldedOnce = toggleStyle(initialChars, 'bold');
      expect(boldedOnce[0].isBold).toBe(true);
      expect(boldedOnce[1].isBold).toBe(false); // Was true, now false

      // Second toggle: a becomes not bold, b becomes bold again
      const boldedTwice = toggleStyle(boldedOnce, 'bold');
      expect(boldedTwice[0].isBold).toBe(false);
      expect(boldedTwice[1].isBold).toBe(true);
    });

    it('should toggle "italic" style correctly', () => {
      const italicedOnce = toggleStyle(initialChars, 'italic');
      expect(italicedOnce[0].isItalic).toBe(true);
      expect(italicedOnce[1].isItalic).toBe(true); // b was not italic, now is

      const italicedTwice = toggleStyle(italicedOnce, 'italic');
      expect(italicedTwice[0].isItalic).toBe(false);
      expect(italicedTwice[1].isItalic).toBe(false);
    });

    it('should toggle "underline" style correctly', () => {
      const underlinedOnce = toggleStyle(initialChars, 'underline');
      expect(underlinedOnce[0].isUnderline).toBe(true);
      expect(underlinedOnce[1].isUnderline).toBe(true);

      const underlinedTwice = toggleStyle(underlinedOnce, 'underline');
      expect(underlinedTwice[0].isUnderline).toBe(false);
      expect(underlinedTwice[1].isUnderline).toBe(false);
    });

    it('should maintain other style properties when one is toggled', () => {
      const charWithMultipleStyles: StyledCharObject[] = [
        createChar('id1', 'c', 'dried', true, false, true, 'yellow'), // Bold, Underline, Highlighted
      ];
      const toggledItalic = toggleStyle(charWithMultipleStyles, 'italic');
      expect(toggledItalic[0].isBold).toBe(true); // Should remain bold
      expect(toggledItalic[0].isItalic).toBe(true); // Should become italic
      expect(toggledItalic[0].isUnderline).toBe(true); // Should remain underlined
      expect(toggledItalic[0].highlightColor).toBe('yellow'); // Should remain highlighted
    });

    it('should return new array and new character objects (immutability)', () => {
      const original: StyledCharObject[] = [createChar('id1', 'a')];
      const styled = toggleStyle(original, 'bold');
      
      expect(styled).not.toBe(original); // New array
      expect(styled[0]).not.toBe(original[0]); // New char object
      expect(styled[0].isBold).toBe(true);
      expect(original[0].isBold).toBe(false); // Original object unchanged
    });
  });

  describe('applyHighlight', () => {
    const initialChars: StyledCharObject[] = [
      createChar('id1', 'a'),
      createChar('id2', 'b', 'fresh', false, false, false, 'blue'), // Initially blue highlight
    ];

    it('should return an empty array if input is empty', () => {
      expect(applyHighlight([], 'yellow')).toEqual([]);
    });

    it('should apply a highlight color to all characters', () => {
      const highlighted = applyHighlight(initialChars, 'yellow');
      expect(highlighted[0].highlightColor).toBe('yellow');
      expect(highlighted[1].highlightColor).toBe('yellow'); // Overwrites existing blue
    });

    it('should change an existing highlight color', () => {
      const highlighted = applyHighlight(initialChars, 'green');
      expect(highlighted[1].highlightColor).toBe('green');
    });

    it('should remove highlight if color is undefined', () => {
      const unhighlighted = applyHighlight(initialChars, undefined);
      expect(unhighlighted[0].highlightColor).toBeUndefined();
      expect(unhighlighted[1].highlightColor).toBeUndefined(); // Blue highlight removed
    });
    
    it('should handle applying an empty string as a color', () => {
        // The function `applyHighlight` sets `highlightColor = color` if color is a string.
        // An empty string is a string.
        const highlightedWithEmpty = applyHighlight(initialChars, ""); 
        expect(highlightedWithEmpty[0].highlightColor).toBe("");
        expect(highlightedWithEmpty[1].highlightColor).toBe("");
      });

    it('should return new array and new character objects (immutability)', () => {
      const original: StyledCharObject[] = [createChar('id1', 'a')];
      const highlighted = applyHighlight(original, 'yellow');
      
      expect(highlighted).not.toBe(original); // New array
      expect(highlighted[0]).not.toBe(original[0]); // New char object
      expect(highlighted[0].highlightColor).toBe('yellow');
      expect(original[0].highlightColor).toBeUndefined(); // Original object unchanged
    });
  });
});
