import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
// Note: CaractereFrappe is now imported dynamically later
import gsap from 'gsap'; // Import gsap to have its type, it will be mocked

// Simple instance mock, can be defined outside.
const mockTimelineInstance = {
  set: vi.fn().mockReturnThis(),
  to: vi.fn().mockReturnThis(),
};

vi.mock('gsap', async (importOriginal) => {
  const actualGsap = await importOriginal<typeof gsap>();

  const mockTimelineFunc = vi.fn(() => mockTimelineInstance);
  const mockRandomFunc = vi.fn((min: number, max: number) => (min + max) / 2);

  return {
    ...actualGsap,
    default: { 
      timeline: mockTimelineFunc,
      utils: { ...actualGsap.utils, random: mockRandomFunc },
    },
    timeline: mockTimelineFunc,
    utils: { ...actualGsap.utils, random: mockRandomFunc },
  };
});

const mockAudioInstancePlay = vi.fn(() => Promise.resolve());
const mockAudioInstancePause = vi.fn();
const mockAudioInstanceLoad = vi.fn();
const mockAudioInstance = {
  play: mockAudioInstancePlay,
  pause: mockAudioInstancePause,
  load: mockAudioInstanceLoad,
  src: '',
  currentTime: 0,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  canPlayType: vi.fn().mockReturnValue('probably'),
  cloneNode: vi.fn(() => mockAudioInstance),
};
const MockAudioConstructor = vi.fn(() => mockAudioInstance);
vi.stubGlobal('Audio', MockAudioConstructor); // Stub global Audio constructor


describe('CaractereFrappe Component', () => {
  // Dynamically import CaractereFrappe
  let CaractereFrappe: React.FC<{ char: string }>;

  beforeAll(async () => {
    const module = await import('./CaractereFrappe');
    CaractereFrappe = module.default;
  });

  beforeEach(() => {
    vi.clearAllMocks(); 
    mockAudioInstancePlay.mockClear();
    mockAudioInstancePause.mockClear();
    mockAudioInstanceLoad.mockClear();
    mockAudioInstance.src = '';
    mockAudioInstance.currentTime = 0;
    mockTimelineInstance.set.mockClear(); 
    mockTimelineInstance.to.mockClear();   
    
    // If gsap.timeline or gsap.utils.random are used directly and are vi.fn(), clear them.
    if (vi.isMockFunction(gsap.timeline)) {
      (gsap.timeline as vi.Mock).mockClear();
    }
    if (vi.isMockFunction(gsap.utils.random)) {
      (gsap.utils.random as vi.Mock).mockClear();
    }
    // Clear the Audio constructor mock if needed for specific tests (e.g. to check number of instantiations)
    // MockAudioConstructor.mockClear(); 
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the passed character correctly', () => {
    render(<CaractereFrappe char="A" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders a space character as &nbsp;', () => {
    const { container } = render(<CaractereFrappe char=" " />);
    const spanElement = container.querySelector('span.caractere-frappe');
    expect(spanElement).not.toBeNull();
    expect(spanElement?.innerHTML).toBe('&nbsp;');
  });

  it('initializes GSAP timeline on mount and calls set and to', () => {
    render(<CaractereFrappe char="B" />);
    // Access the mocks via the gsap object itself
    expect(gsap.timeline).toHaveBeenCalledTimes(1);
    expect(mockTimelineInstance.set).toHaveBeenCalled();
    expect(mockTimelineInstance.to).toHaveBeenCalled();
    expect(gsap.utils.random).toHaveBeenCalled();
  });
  
  it('attempts to play sound via GSAP timeline onComplete hook', () => {
    render(<CaractereFrappe char="C" />);
    
    expect(gsap.timeline).toHaveBeenCalledTimes(1);
    
    // Get the options passed to gsap.timeline (which is now the mock function)
    const timelineOptions = (gsap.timeline as vi.Mock).mock.calls[0][0];
    expect(timelineOptions).toBeDefined();
    expect(timelineOptions.onComplete).toBeInstanceOf(Function);
    
    // Execute the onComplete callback
    if (timelineOptions.onComplete) {
      timelineOptions.onComplete();
    }
    
    expect(mockAudioInstancePlay).toHaveBeenCalled(); // Check the specific mock function for play
  });
});
