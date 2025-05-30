// src/services/textUtils.test.ts

import { describe, it, expect, vi } from 'vitest';
import {
  CharObject, // Import for type checking if needed, or use the local one in tests
  charObjectsToString,
  stringToCharObjects,
} from './textUtils';

// Helper to create CharObject for tests if needed, matching local definition
const createTestChar = (
  char: string,
  idSuffix: string | number = '',
  state: 'fresh' | 'dried' = 'dried'
): CharObject => ({
  id: `test-id-${idSuffix}`,
  char,
  state,
});

describe('Text Utilities', () => {
  describe('charObjectsToString', () => {
    it('should return an empty string for null or empty array input', () => {
      expect(charObjectsToString([])).toBe('');
      // @ts-ignore testing potentially undefined/null input if function was less strict
      // expect(charObjectsToString(null)).toBe("");
    });

    it('should return an empty string for an array containing one empty line ([[]])', () => {
      expect(charObjectsToString([[]])).toBe(''); // An empty line is just an empty string before join
    });

    it('should convert a single line of characters to a string', () => {
      const input: CharObject[][] = [
        [createTestChar('h', 1), createTestChar('i', 2)],
      ];
      expect(charObjectsToString(input)).toBe('hi');
    });

    it('should convert multiple lines of characters to a newline-separated string', () => {
      const input: CharObject[][] = [
        [createTestChar('h', 1), createTestChar('e', 2)],
        [
          createTestChar('l', 3),
          createTestChar('l', 4),
          createTestChar('o', 5),
        ],
      ];
      expect(charObjectsToString(input)).toBe('he\nllo');
    });

    it('should handle empty lines between non-empty lines', () => {
      const input: CharObject[][] = [
        [createTestChar('a', 1)],
        [], // empty line
        [createTestChar('b', 2)],
      ];
      expect(charObjectsToString(input)).toBe('a\n\nb');
    });

    it('should handle lines with mixed fresh and dried states', () => {
      const input: CharObject[][] = [
        [createTestChar('f', 1, 'fresh'), createTestChar('r', 2, 'fresh')],
        [createTestChar('d', 3, 'dried')],
      ];
      expect(charObjectsToString(input)).toBe('fr\nd');
    });
  });

  describe('stringToCharObjects', () => {
    it('should convert an empty string to an array with one empty line ([[]])', () => {
      const result = stringToCharObjects('');
      expect(result).toEqual([[]]);
    });

    it('should convert a single line string to CharObject[][]', () => {
      const result = stringToCharObjects('hi');
      expect(result.length).toBe(1);
      expect(result[0].length).toBe(2);
      expect(result[0][0]).toMatchObject({ char: 'h', state: 'dried' });
      expect(result[0][0].id).toEqual(expect.any(String));
      expect(result[0][1]).toMatchObject({ char: 'i', state: 'dried' });
      expect(result[0][1].id).toEqual(expect.any(String));
      expect(result[0][0].id).not.toBe(result[0][1].id); // Check for unique IDs
    });

    it('should convert a multi-line string to CharObject[][]', () => {
      const result = stringToCharObjects('hello\nworld');
      expect(result.length).toBe(2);
      expect(result[0].length).toBe(5);
      expect(result[1].length).toBe(5);
      expect(result[0][0]).toMatchObject({ char: 'h', state: 'dried' });
      expect(result[1][0]).toMatchObject({ char: 'w', state: 'dried' });
      expect(result[0][0].id).toEqual(expect.any(String));
      expect(result[1][4].id).toEqual(expect.any(String));
    });

    it('should handle empty lines between non-empty lines correctly', () => {
      const result = stringToCharObjects('a\n\nb'); // "a", empty string, "b"
      expect(result.length).toBe(3);
      expect(result[0].length).toBe(1);
      expect(result[0][0]).toMatchObject({ char: 'a', state: 'dried' });
      expect(result[1].length).toBe(0); // Empty line becomes empty array
      expect(result[2].length).toBe(1);
      expect(result[2][0]).toMatchObject({ char: 'b', state: 'dried' });
    });

    it('should ensure all generated CharObjects have state "dried" and unique IDs', () => {
      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(1234567890000);
      // Make Math.random return a sequence of different values to ensure ID uniqueness
      // when Date.now() is fixed.
      const mockMathRandom = vi
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.123456789) // For 'a'
        .mockReturnValueOnce(0.23456789) // For 'b'
        .mockReturnValueOnce(0.345678901); // For 'c'

      const result = stringToCharObjects('ab\nc'); // 3 characters: a, b, c

      const ids = result.flat().map((co) => co.id);
      const uniqueIds = new Set(ids);

      // Debugging log if needed:
      // console.log('Generated IDs:', ids);
      // console.log('Unique IDs:', Array.from(uniqueIds));

      expect(ids.length).toBe(uniqueIds.size); // All IDs should be unique

      result.flat().forEach((charObj) => {
        expect(charObj.state).toBe('dried');
        expect(charObj.id).toEqual(expect.any(String));
      });

      mockDateNow.mockRestore();
      mockMathRandom.mockRestore();
    });
  });
});
