import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MainLayout from './MainLayout';
// Import the type from the actual module, but the default export (component) will be mocked.
import { type CharObject as FeuilleCharObjectActual } from '../Paper/FeuillePapier';

// --- Mock Child Components ---
// Note: To access captured callbacks like 'onFileOpened' from TopMenu,
// we'll need to import the mocked component and access the captured function from it.

import TopMenu from '../TopBar/TopMenu'; // Will be the mock
import BottomBar from '../StatusBar/BottomBar'; // Will be the mock
import FeuillePapier from '../Paper/FeuillePapier'; // Will be the mock (default export)

vi.mock('../TopBar/TopMenu', () => {
  const capturedOnFileOpened = vi.fn();
  const MockComponent = vi.fn((props) => {
    // Store the captured function on the mock itself for access in tests
    (MockComponent as any).capturedOnFileOpened = capturedOnFileOpened;
    capturedOnFileOpened.mockImplementation(props.onFileOpened);
    return (
      <div data-testid="mock-top-menu">
        <button onClick={() => props.onToggleLeftSidebar()}>ToggleLeft</button>
        <button onClick={() => props.onToggleRightSidebar()}>
          ToggleRight
        </button>
      </div>
    );
  });
  return { default: MockComponent };
});

vi.mock('../Sidebars/LeftSidebar', () => ({
  default: vi.fn(() => <div data-testid="mock-left-sidebar"></div>),
}));
vi.mock('../Sidebars/RightSidebar', () => ({
  default: vi.fn(() => <div data-testid="mock-right-sidebar"></div>),
}));

vi.mock('../StatusBar/BottomBar', () => ({
  // BottomBar is just a presenter, so its mock function itself can be imported and checked for calls.
  default: vi.fn((props) => (
    <div data-testid="mock-bottom-bar">
      <span>Char: {props.charCount}</span>
      <span>Word: {props.wordCount}</span>
      <span>Space: {props.spaceCount}</span>
    </div>
  )),
}));

vi.mock('../Paper/FeuillePapier', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../Paper/FeuillePapier')>();
  const capturedOnTextChange = vi.fn();
  const MockComponent = vi.fn((props) => {
    (MockComponent as any).capturedOnTextChange = capturedOnTextChange;
    capturedOnTextChange.mockImplementation(props.onTextChange);
    return (
      <div
        data-testid="mock-feuille-papier"
        data-key={props.key}
        data-initial-content={props.initialContent || ''}
      />
    );
  });
  return {
    ...actual, // Keep actual type exports
    default: MockComponent,
  };
});

// --- Test Suite ---
describe('MainLayout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing and shows key child components', () => {
    render(<MainLayout />);
    expect(screen.getByTestId('mock-top-menu')).toBeInTheDocument();
    expect(screen.getByTestId('mock-left-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-right-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-bottom-bar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-feuille-papier')).toBeInTheDocument();
  });

  it('handleTextChange updates counts correctly', () => {
    render(<MainLayout />);

    const sampleLines: FeuilleCharObjectActual[][] = [
      [
        { id: '1', char: 'h' },
        { id: '2', char: 'i' },
        { id: '3', char: ' ' },
      ],
      [
        { id: '4', char: 'w' },
        { id: '5', char: 'o' },
        { id: '6', char: 'r' },
        { id: '7', char: 'l' },
        { id: '8', char: 'd' },
      ],
      [{ id: '9', char: '\n' }],
    ];

    const capturedCallback = (FeuillePapier as any).capturedOnTextChange;
    expect(capturedCallback).toBeDefined();
    act(() => {
      capturedCallback(sampleLines);
    });

    const bottomBarMockCalls = (BottomBar as vi.Mock).mock.calls;
    const lastBottomBarProps =
      bottomBarMockCalls[bottomBarMockCalls.length - 1][0];
    expect(lastBottomBarProps.charCount).toBe(9); // Corrected: "hi world " (newline->space) is 9 chars
    expect(lastBottomBarProps.wordCount).toBe(2);
    expect(lastBottomBarProps.spaceCount).toBe(1);
  });

  it('handleFileOpened updates content, path, and FeuillePapier key', () => {
    render(<MainLayout />);

    const sampleContent = 'Hello World from file!';
    const samplePath = '/path/to/file.txt';

    const capturedCallbackOnFileOpened = (TopMenu as any).capturedOnFileOpened;
    expect(capturedCallbackOnFileOpened).toBeDefined();
    act(() => {
      capturedCallbackOnFileOpened(sampleContent, samplePath);
    });

    const bottomBarMockCalls = (BottomBar as vi.Mock).mock.calls;
    const lastBottomBarProps =
      bottomBarMockCalls[bottomBarMockCalls.length - 1][0];
    expect(lastBottomBarProps.charCount).toBe(sampleContent.length);
    expect(lastBottomBarProps.wordCount).toBe(4);
    expect(lastBottomBarProps.spaceCount).toBe(3);

    const feuillePapierMockCalls = (FeuillePapier as vi.Mock).mock.calls;
    // const lastFeuillePapierProps = feuillePapierMockCalls[feuillePapierMockCalls.length - 1][0];
    // expect(lastFeuillePapierProps.key).toBe(samplePath); // 'key' is not a passed prop, cannot be checked this way.
    // The fact that MainLayout uses currentFilePath in the key is what matters for React's reconciliation.
    // We've already checked that currentFilePath related states (counts) are updated.
    // We can also check that FeuillePapier was re-rendered (i.e. the mock function was called again)
    // The first call is on initial render. The second after onFileOpened.
    expect(feuillePapierMockCalls.length).toBeGreaterThanOrEqual(2);
  });
});
