import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FeuillePapier from './FeuillePapier'; // Adjust path if necessary
// CharObject is imported from FeuillePapier's perspective which now includes state
import { Line, CharObject } from './FeuillePapier';

// Mock Audio
const mockAudioInstance = {
  play: vi.fn(),
  pause: vi.fn(),
  load: vi.fn(),
  currentTime: 0,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  canPlayType: vi.fn().mockReturnValue('probably'),
};
vi.spyOn(window, 'Audio').mockImplementation(() => mockAudioInstance as any);

// Mock CaractereFrappe to inspect props passed to it
vi.mock('../CaractereFrappe', () => {
  const MockComponent = vi.fn(
    (
      { char, state, key, charId } // Added charId
    ) => (
      <span
        data-testid={`char-${char}`}
        data-state={state}
        data-key={key}
        data-char-id={charId}
      >
        {char}
      </span>
    )
  );
  return { default: MockComponent };
});

// Import the mocked CaractereFrappe to access its mock properties
import CaractereFrappe from '../CaractereFrappe';

describe('FeuillePapier Component', () => {
  let mockOnTextChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnTextChange = vi.fn();
    mockAudioInstance.play.mockClear();
    mockAudioInstance.pause.mockClear();
    mockAudioInstance.load.mockClear();
    (CaractereFrappe as vi.Mock).mockClear(); // Clear mock calls before each test
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders without crashing and shows initial paper sheet and cursor', () => {
    // Passing initialContent as empty string for consistency with how component handles it
    const { container } = render(
      <FeuillePapier onTextChange={mockOnTextChange} initialContent="" />
    );
    expect(container.querySelector('.paper-sheet')).toBeInTheDocument();
    expect(
      container.querySelector('.fixed-cursor-overlay')
    ).toBeInTheDocument();
  });

  it('handles character input correctly and calls onTextChange with fresh state', () => {
    render(<FeuillePapier onTextChange={mockOnTextChange} initialContent="" />);

    fireEvent.keyDown(window, { key: 'a' });
    expect(mockOnTextChange).toHaveBeenCalledTimes(1);
    expect(mockOnTextChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.objectContaining({
            char: 'a',
            id: expect.any(String),
            state: 'fresh',
          }),
        ]),
      ])
    );

    fireEvent.keyDown(window, { key: 'b' });
    expect(mockOnTextChange).toHaveBeenCalledTimes(2);
    // When 'b' is typed, 'a' is still fresh as its timer hasn't fired.
    // The onTextChange callback reflects the current state of all characters.
    const firstCharPrevCall = mockOnTextChange.mock.calls[0][0][0][0]; // from 'a' keydown

    expect(mockOnTextChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.arrayContaining([
          // expect.objectContaining({ char: 'a', id: expect.any(String), state: 'fresh' }),
          firstCharPrevCall, // 'a' character object from previous call
          expect.objectContaining({
            char: 'b',
            id: expect.any(String),
            state: 'fresh',
          }),
        ]),
      ])
    );
  });

  it('handles backspace correctly and calls onTextChange', () => {
    // initialContent will have 'dried' characters
    const initialContentString = 'ab';
    render(
      <FeuillePapier
        onTextChange={mockOnTextChange}
        initialContent={initialContentString}
      />
    );

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
        expect.arrayContaining([
          expect.objectContaining({ char: 'a', id: expect.any(String) }),
        ]),
      ])
    );
    let lastCallArg = mockOnTextChange.mock.calls[1][0] as Line[]; // call index 1
    expect(lastCallArg.length).toBe(1);
    expect(lastCallArg[0].length).toBe(1);

    // Second backspace
    fireEvent.keyDown(window, { key: 'Backspace' });
    expect(mockOnTextChange).toHaveBeenCalledTimes(3);
    expect(mockOnTextChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([expect.arrayContaining([])])
    );
    lastCallArg = mockOnTextChange.mock.calls[2][0] as Line[]; // call index 2
    expect(lastCallArg.length).toBe(1);
    expect(lastCallArg[0].length).toBe(0);
  });

  it('handles Enter key correctly and calls onTextChange', () => {
    const initialContentString = 'a';
    render(
      <FeuillePapier
        onTextChange={mockOnTextChange}
        initialContent={initialContentString}
      />
    );

    // Called once on init
    expect(mockOnTextChange).toHaveBeenCalledTimes(1);
    expect(mockOnTextChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.objectContaining({ char: 'a', id: expect.any(String) }),
        ]),
      ])
    );

    // Press Enter
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(mockOnTextChange).toHaveBeenCalledTimes(2);
    expect(mockOnTextChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.objectContaining({ char: 'a', id: expect.any(String) }),
        ]),
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
        expect.arrayContaining([
          expect.objectContaining({ char: 'a', id: expect.any(String) }),
        ]),
        expect.arrayContaining([
          expect.objectContaining({ char: 'b', id: expect.any(String) }),
        ]),
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

describe('FeuillePapier Component - Ink Drying Effect', () => {
  let mockOnTextChange: ReturnType<typeof vi.fn>;
  const INK_DRYING_TIME_MS_TEST = 2000; // Align with component

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnTextChange = vi.fn();
    (CaractereFrappe as vi.Mock).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('newly typed characters are initially "fresh" and passed to CaractereFrappe', () => {
    render(<FeuillePapier onTextChange={mockOnTextChange} initialContent="" />);

    act(() => {
      fireEvent.keyDown(window, { key: 'x' });
    });

    expect(mockOnTextChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.objectContaining({ char: 'x', state: 'fresh' }),
        ]),
      ])
    );

    const xCharCalls = (CaractereFrappe as vi.Mock).mock.calls.filter(
      (call) => call[0].char === 'x'
    );
    expect(xCharCalls.length).toBeGreaterThanOrEqual(1);
    expect(xCharCalls[xCharCalls.length - 1][0]).toEqual(
      expect.objectContaining({ char: 'x', state: 'fresh' })
    );
  });

  it('characters transition to "dried" state after timeout and update CaractereFrappe', () => {
    render(<FeuillePapier onTextChange={mockOnTextChange} initialContent="" />);

    let capturedCharId = ''; // Use this to store the actual charId
    act(() => {
      fireEvent.keyDown(window, { key: 'y' });
    });

    const allCalls = (CaractereFrappe as vi.Mock).mock.calls;
    const firstCallForY = allCalls.find((call) => call[0].char === 'y');
    expect(firstCallForY).toBeDefined();
    // firstCallForY[0] is the props object: { char, state, key, charId }
    expect(firstCallForY![0]).toMatchObject({ char: 'y', state: 'fresh' });
    capturedCharId = firstCallForY![0].charId; // Capture the charId prop
    expect(capturedCharId).toEqual(expect.any(String));
    expect(capturedCharId).not.toBe('');

    act(() => {
      vi.advanceTimersByTime(INK_DRYING_TIME_MS_TEST + 100);
    });

    // Filter calls based on the captured charId
    const allCallsForSpecificCharId = (
      CaractereFrappe as vi.Mock
    ).mock.calls.filter((call) => call[0].charId === capturedCharId);

    expect(allCallsForSpecificCharId.length).toBe(2);
    expect(allCallsForSpecificCharId[0][0]).toMatchObject({
      char: 'y',
      state: 'fresh',
      charId: capturedCharId,
    });
    expect(allCallsForSpecificCharId[1][0]).toMatchObject({
      char: 'y',
      state: 'dried',
      charId: capturedCharId,
    });

    expect(mockOnTextChange).toHaveBeenCalledTimes(1);
  });

  it('characters from initialContent are "dried"', () => {
    render(
      <FeuillePapier onTextChange={mockOnTextChange} initialContent="hi" />
    );

    expect(mockOnTextChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.objectContaining({ char: 'h', state: 'dried' }),
          expect.objectContaining({ char: 'i', state: 'dried' }),
        ]),
      ])
    );

    const hCall = (CaractereFrappe as vi.Mock).mock.calls.find(
      (call) => call[0].char === 'h'
    );
    const iCall = (CaractereFrappe as vi.Mock).mock.calls.find(
      (call) => call[0].char === 'i'
    );
    expect(hCall).toBeDefined();
    expect(hCall![0]).toEqual(
      expect.objectContaining({ char: 'h', state: 'dried' })
    );
    expect(iCall).toBeDefined();
    expect(iCall![0]).toEqual(
      expect.objectContaining({ char: 'i', state: 'dried' })
    );
  });

  it('backspace on a "fresh" character calls clearTimeout', () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    render(<FeuillePapier onTextChange={mockOnTextChange} initialContent="" />);

    act(() => {
      fireEvent.keyDown(window, { key: 'z' });
    });

    const zCharInitialCall = (CaractereFrappe as vi.Mock).mock.calls.find(
      (call) => call[0].char === 'z'
    );
    expect(zCharInitialCall).toBeDefined();
    expect(zCharInitialCall![0].state).toBe('fresh');

    act(() => {
      fireEvent.keyDown(window, { key: 'Backspace' });
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });
});
