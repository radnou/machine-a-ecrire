import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VirtualKeyboard from './VirtualKeyboard';
// Import the CSS module to allow checking for the container class if needed, though querying by role/test-id is better
import styles from './VirtualKeyboard.module.css';

describe('VirtualKeyboard Component', () => {
  let mockOnKeyPress: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnKeyPress = vi.fn();
  });

  afterEach(() => {
    cleanup(); // Clean up DOM after each test
  });

  describe('Visibility Control', () => {
    it('renders the keyboard when isVisible is true', () => {
      const { container } = render(<VirtualKeyboard isVisible={true} onKeyPress={mockOnKeyPress} />);
      // The main div has the class .keyboardContainer
      // querySelector can find it using the generated class name
      expect(container.querySelector(`.${styles.keyboardContainer}`)).toBeInTheDocument();
    });

    it('does not render the keyboard when isVisible is false', () => {
      const { container } = render(<VirtualKeyboard isVisible={false} onKeyPress={mockOnKeyPress} />);
      expect(container.querySelector(`.${styles.keyboardContainer}`)).not.toBeInTheDocument();
      // Since the component returns null, the container itself should be empty
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Key Press Interaction', () => {
    const keysToTest = ['A', 'Z', 'E', 'Q', 'S', 'W', 'X', 'Space', 'Enter', 'Backspace', 'Shift', 'P', 'M', 'N'];

    keysToTest.forEach((keyText) => {
      it(`calls onKeyPress with "${keyText}" when the "${keyText}" key is clicked`, () => {
        render(<VirtualKeyboard isVisible={true} onKeyPress={mockOnKeyPress} />);
        
        // Find button by its text content. This assumes the text content uniquely identifies the key.
        const keyButton = screen.getByText(keyText);
        fireEvent.click(keyButton);
        
        expect(mockOnKeyPress).toHaveBeenCalledTimes(1);
        expect(mockOnKeyPress).toHaveBeenCalledWith(keyText);
      });
    });

    it('calls onKeyPress multiple times for multiple key clicks', () => {
        render(<VirtualKeyboard isVisible={true} onKeyPress={mockOnKeyPress} />);
        
        const keyA = screen.getByText('A');
        const keyB = screen.getByText('B');
        const keySpace = screen.getByText('Space');

        fireEvent.click(keyA);
        expect(mockOnKeyPress).toHaveBeenCalledWith('A');
        
        fireEvent.click(keyB);
        expect(mockOnKeyPress).toHaveBeenCalledWith('B');

        fireEvent.click(keySpace);
        expect(mockOnKeyPress).toHaveBeenCalledWith('Space');

        expect(mockOnKeyPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Layout/Key Rendering (Basic)', () => {
    const expectedKeys = ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 
                           'Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
                           'W', 'X', 'C', 'V', 'B', 'N',
                           'Shift', 'Backspace', 'Enter', 'Space'];

    expectedKeys.forEach((keyText) => {
      it(`renders the "${keyText}" key`, () => {
        render(<VirtualKeyboard isVisible={true} onKeyPress={mockOnKeyPress} />);
        expect(screen.getByText(keyText)).toBeInTheDocument();
      });
    });
  });
});
