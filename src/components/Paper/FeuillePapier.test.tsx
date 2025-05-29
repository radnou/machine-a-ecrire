import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeuillePapier from './FeuillePapier'; // Adjust path if necessary
import { Line, Char } from './FeuillePapier'; // Assuming types are exported

// Mock Audio
const mockAudioInstance = {
  play: vi.fn(),
  pause: vi.fn(),
  load: vi.fn(),
  currentTime: 0,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  canPlayType: vi.fn().mockReturnValue('probably'),
  // Add any other methods or properties your component might use
};
vi.spyOn(window, 'Audio').mockImplementation(() => mockAudioInstance as any);

describe('FeuillePapier Component', () => {
  let mockOnTextChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnTextChange = vi.fn();
    mockAudioInstance.play.mockClear();
    mockAudioInstance.pause.mockClear();
    mockAudioInstance.load.mockClear();
  });

  it('renders without crashing and shows initial paper sheet and cursor', () => {
    const { container } = render(<FeuillePapier onTextChange={mockOnTextChange} initialText={[]} />);
    expect(container.querySelector('.paper-sheet')).toBeInTheDocument();
    expect(container.querySelector('.fixed-cursor-overlay')).toBeInTheDocument();
  });

  it('handles character input correctly and calls onTextChange', () => {
    const { container } = render(<FeuillePapier onTextChange={mockOnTextChange} initialText={[]} />);
    const activeArea = container.querySelector('.feuille-papier-active-area');
    expect(activeArea).toBeInTheDocument();

    // The component listens to window keydown events.
    // We simulate this by firing events on the window, or if that doesn't work,
    // we might need to rethink how events are captured or dispatched in test.
    // For now, let's assume direct dispatch to activeArea is okay if window doesn't work.
    // However, the component's useEffect for keydown is on `window`.
    fireEvent.keyDown(window, { key: 'a' });
    // expect(screen.getByText('a')).toBeInTheDocument(); // This might be tricky with CaractereFrappe animations
    // We'll check the onTextChange callback for verification first
    expect(mockOnTextChange).toHaveBeenCalledTimes(1);
    expect(mockOnTextChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.arrayContaining([expect.objectContaining({ char: 'a', id: expect.any(String) })]),
      ])
    );

    fireEvent.keyDown(window, { key: 'b' });
    // expect(screen.getByText('b')).toBeInTheDocument();
    expect(mockOnTextChange).toHaveBeenCalledTimes(2);
    expect(mockOnTextChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.objectContaining({ char: 'a', id: expect.any(String) }),
          expect.objectContaining({ char: 'b', id: expect.any(String) }),
        ]),
      ])
    );
  });

  it('handles backspace correctly and calls onTextChange', () => {
    const initialContentString = "ab";
    render(<FeuillePapier onTextChange={mockOnTextChange} initialContent={initialContentString} />);
    
    // Called once on init
    expect(mockOnTextChange).toHaveBeenCalledTimes(1);
    expect(mockOnTextChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.objectContaining({ char: 'a', id: expect.any(String) }),
          expect.objectContaining({ char: 'b', id: expect.any(String) }),
        ]),
      ])
    );

    // First backspace
    fireEvent.keyDown(window, { key: 'Backspace' });
    expect(mockOnTextChange).toHaveBeenCalledTimes(2);
    expect(mockOnTextChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.arrayContaining([expect.objectContaining({ char: 'a', id: expect.any(String) })]),
      ])
    );
    let lastCallArg = mockOnTextChange.mock.calls[1][0] as Line[]; // call index 1
    expect(lastCallArg.length).toBe(1); 
    expect(lastCallArg[0].length).toBe(1); 

    // Second backspace
    fireEvent.keyDown(window, { key: 'Backspace' });
    expect(mockOnTextChange).toHaveBeenCalledTimes(3);
    expect(mockOnTextChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.arrayContaining([]), 
      ])
    );
    lastCallArg = mockOnTextChange.mock.calls[2][0] as Line[]; // call index 2
    expect(lastCallArg.length).toBe(1); 
    expect(lastCallArg[0].length).toBe(0);
  });

  it('handles Enter key correctly and calls onTextChange', () => {
    const initialContentString = "a";
    render(<FeuillePapier onTextChange={mockOnTextChange} initialContent={initialContentString} />);

    // Called once on init
    expect(mockOnTextChange).toHaveBeenCalledTimes(1);
    expect(mockOnTextChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.arrayContaining([expect.objectContaining({ char: 'a', id: expect.any(String) })]),
      ])
    );
    
    // Press Enter
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(mockOnTextChange).toHaveBeenCalledTimes(2);
    expect(mockOnTextChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.arrayContaining([expect.objectContaining({ char: 'a', id: expect.any(String) })]),
        expect.arrayContaining([]), 
      ])
    );
    let lastCallArg = mockOnTextChange.mock.calls[1][0] as Line[];
    expect(lastCallArg.length).toBe(2); 
    expect(lastCallArg[0].length).toBe(1); 
    expect(lastCallArg[1].length).toBe(0);

    // Type 'b' on the new line
    fireEvent.keyDown(window, { key: 'b' });
    expect(mockOnTextChange).toHaveBeenCalledTimes(3);
    expect(mockOnTextChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.arrayContaining([expect.objectContaining({ char: 'a', id: expect.any(String) })]),
        expect.arrayContaining([expect.objectContaining({ char: 'b', id: expect.any(String) })]),
      ])
    );
    lastCallArg = mockOnTextChange.mock.calls[2][0] as Line[];
    expect(lastCallArg.length).toBe(2);
    expect(lastCallArg[0].length).toBe(1);
    expect(lastCallArg[1].length).toBe(1);
  });

  // TODO: Add tests for cursor movement if necessary
  // TODO: Add tests for complex scenarios (e.g., backspace at start of line, enter in middle of line)
});
