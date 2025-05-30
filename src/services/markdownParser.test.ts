// src/services/markdownParser.test.ts

import { describe, it, expect, vi } from 'vitest';
import {
  // CharObject, // Using local CharObject in tests for clarity or if imported type is complex
  charObjectsToMarkdown,
  markdownToCharObjects,
} from './markdownParser';

// Define a compatible CharObject for test data generation
interface TestCharObject {
  id: string;
  char: string;
  state: 'fresh' | 'dried';
}

const createTestChar = (
  char: string,
  idSuffix: string | number = '',
  state: 'fresh' | 'dried' = 'dried'
): TestCharObject => ({
  id: `test-id-${idSuffix}`,
  char,
  state,
});

describe('Markdown Parser Utilities', () => {
  describe('charObjectsToMarkdown', () => {
    it('should return an empty string for null or empty array input', () => {
      expect(charObjectsToMarkdown([])).toBe('');
    });

    it('should return an empty string for an array containing one empty line ([[]])', () => {
      // The current logic: [[]].map(line => line.join('')).join('\n') -> [""].join('\n') -> ""
      expect(charObjectsToMarkdown([[]])).toBe('');
    });

    it('should convert a single line of characters to a string', () => {
      const input: TestCharObject[][] = [
        [createTestChar('h', 1), createTestChar('i', 2)],
      ];
      expect(charObjectsToMarkdown(input)).toBe('hi');
    });

    it('should convert multiple lines of characters to a newline-separated string', () => {
      const input: TestCharObject[][] = [
        [createTestChar('h', 1), createTestChar('e', 2)],
        [
          createTestChar('l', 3),
          createTestChar('l', 4),
          createTestChar('o', 5),
        ],
      ];
      expect(charObjectsToMarkdown(input)).toBe('he\nllo');
    });

    it('should handle empty lines between non-empty lines (single newline output)', () => {
      const input: TestCharObject[][] = [
        [createTestChar('a', 1)],
        [], // empty line
        [createTestChar('b', 2)],
      ];
      // "a" + \n + "" + \n + "b" -> "a\n\nb"
      expect(charObjectsToMarkdown(input)).toBe('a\n\nb');
    });

    it('should ignore state and id properties, only using char', () => {
      const input: TestCharObject[][] = [
        [createTestChar('S', 1, 'fresh'), createTestChar('t', 2, 'dried')],
      ];
      expect(charObjectsToMarkdown(input)).toBe('St');
    });
  });

  describe('markdownToCharObjects', () => {
    it('should convert an empty string to an array with one empty line ([[]])', () => {
      const result = markdownToCharObjects('');
      expect(result).toEqual([[]]);
    });

    it('should convert a single line string to CharObject[][]', () => {
      const result = markdownToCharObjects('md');
      expect(result.length).toBe(1);
      expect(result[0].length).toBe(2);
      expect(result[0][0]).toMatchObject({ char: 'm', state: 'dried' });
      expect(result[0][0].id).toEqual(expect.any(String));
      expect(result[0][1]).toMatchObject({ char: 'd', state: 'dried' });
      expect(result[0][1].id).toEqual(expect.any(String));
      expect(result[0][0].id).not.toBe(result[0][1].id);
    });

    it('should convert a multi-line string (lines separated by \\n) to CharObject[][]', () => {
      const result = markdownToCharObjects('line1\nline2');
      expect(result.length).toBe(2);
      expect(result[0].length).toBe(5);
      expect(result[1].length).toBe(5);
      expect(result[0][0]).toMatchObject({ char: 'l', state: 'dried' });
      expect(result[1][0]).toMatchObject({ char: 'l', state: 'dried' });
    });

    it('should handle empty lines between non-empty lines correctly for Markdown', () => {
      const result = markdownToCharObjects('line1\n\nline3');
      expect(result.length).toBe(3);
      expect(result[0][0]).toMatchObject({ char: 'l', state: 'dried' });
      expect(result[1].length).toBe(0); // Empty line
      expect(result[2][0]).toMatchObject({ char: 'l', state: 'dried' });
    });

    it('should ensure all generated CharObjects have state "dried" and unique IDs', () => {
      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(1234567890123); // Slightly different time
      const mockMathRandom = vi
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.456)
        .mockReturnValueOnce(0.567)
        .mockReturnValueOnce(0.678);

      const result = markdownToCharObjects('xy\nz'); // 3 characters

      const ids = result.flat().map((co) => co.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);

      result.flat().forEach((charObj) => {
        expect(charObj.state).toBe('dried');
        expect(charObj.id).toEqual(expect.any(String));
      });

      mockDateNow.mockRestore();
      mockMathRandom.mockRestore();
    });
  });
});
