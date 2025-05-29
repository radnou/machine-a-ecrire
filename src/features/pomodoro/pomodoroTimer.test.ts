// src/features/pomodoro/pomodoroTimer.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PomodoroTimer,
  PomodoroConfig,
  PomodoroState,
  OnTickCallback,
  OnStateChangeCallback,
  OnPeriodEndCallback,
} from './pomodoroTimer';

const TEST_CONFIG: PomodoroConfig = {
  workDuration: 10,       // 10 seconds for WORK
  shortBreakDuration: 5,  // 5 seconds for SHORT_BREAK
  longBreakDuration: 8,   // 8 seconds for LONG_BREAK
  longBreakInterval: 2,     // Long break after 2 WORK cycles
};

describe('PomodoroTimer', () => {
  let mockOnTick: OnTickCallback;
  let mockOnStateChange: OnStateChangeCallback;
  let mockOnPeriodEnd: OnPeriodEndCallback;
  let timer: PomodoroTimer;

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnTick = vi.fn();
    mockOnStateChange = vi.fn();
    mockOnPeriodEnd = vi.fn();
    timer = new PomodoroTimer(TEST_CONFIG, mockOnTick, mockOnStateChange, mockOnPeriodEnd);
  });

  afterEach(() => {
    timer.destroy(); // Ensure interval is cleared
    vi.restoreAllMocks(); // Clears spies, mocks, and resets fake timers to real
  });

  it('should initialize in IDLE state with workDuration set as currentTime', () => {
    const initialState = timer.getCurrentState();
    expect(initialState.state).toBe('IDLE');
    expect(initialState.time).toBe(TEST_CONFIG.workDuration);
    expect(initialState.cycle).toBe(0); // Completed work cycles
    expect(initialState.isPaused).toBe(false);
    // expect(mockOnStateChange).toHaveBeenCalledWith('IDLE', 0, TEST_CONFIG.workDuration); // Constructor doesn't call it by default
  });

  describe('start()', () => {
    it('should transition from IDLE to WORK state and start ticking', () => {
      timer.start();
      expect(mockOnStateChange).toHaveBeenCalledWith('WORK', 0, TEST_CONFIG.workDuration);
      expect(mockOnTick).toHaveBeenCalledWith(TEST_CONFIG.workDuration); // Initial tick

      vi.advanceTimersByTime(1000); // Advance 1 second
      expect(mockOnTick).toHaveBeenCalledWith(TEST_CONFIG.workDuration - 1);
      expect(timer.getCurrentState().time).toBe(TEST_CONFIG.workDuration - 1);
      expect(timer.getCurrentState().state).toBe('WORK');
    });

    it('should resume from PAUSED state', () => {
      timer.start(); // IDLE -> WORK
      vi.advanceTimersByTime(3000); // WORK ticks for 3s, time = 7s
      expect(timer.getCurrentState().time).toBe(TEST_CONFIG.workDuration - 3);
      
      timer.pause();
      expect(timer.getCurrentState().isPaused).toBe(true);
      const timeWhenPaused = timer.getCurrentState().time;

      vi.advanceTimersByTime(2000); // Timer should not tick
      expect(timer.getCurrentState().time).toBe(timeWhenPaused);
      
      timer.start(); // Resume
      expect(timer.getCurrentState().isPaused).toBe(false);
      expect(mockOnTick).toHaveBeenLastCalledWith(timeWhenPaused); // Should tick with paused time upon resume if onTick is called by start. (Current design: start() doesn't call onTick, next interval does)
                                                                   // Let's verify next tick
      vi.advanceTimersByTime(1000);
      expect(mockOnTick).toHaveBeenCalledWith(timeWhenPaused - 1);
      expect(timer.getCurrentState().time).toBe(timeWhenPaused - 1);
    });
  });

  describe('Period Transitions', () => {
    it('should transition from WORK to SHORT_BREAK', () => {
      timer.start(); // To WORK
      expect(mockOnStateChange).toHaveBeenCalledWith('WORK', 0, TEST_CONFIG.workDuration);

      vi.advanceTimersByTime(TEST_CONFIG.workDuration * 1000); // End of WORK period
      
      expect(mockOnPeriodEnd).toHaveBeenCalledWith('WORK', 1); // Cycle 1 completed
      expect(mockOnStateChange).toHaveBeenCalledWith('SHORT_BREAK', 1, TEST_CONFIG.shortBreakDuration);
      expect(timer.getCurrentState().state).toBe('SHORT_BREAK');
      expect(timer.getCurrentState().time).toBe(TEST_CONFIG.shortBreakDuration);
      expect(timer.getCurrentState().cycle).toBe(1); // Cycle 1 WORK completed
    });

    it('should transition from SHORT_BREAK to WORK', () => {
      timer.start(); // WORK
      vi.advanceTimersByTime(TEST_CONFIG.workDuration * 1000); // End WORK -> SHORT_BREAK
      expect(timer.getCurrentState().state).toBe('SHORT_BREAK');
      
      vi.advanceTimersByTime(TEST_CONFIG.shortBreakDuration * 1000); // End SHORT_BREAK
      
      expect(mockOnPeriodEnd).toHaveBeenCalledWith('SHORT_BREAK', 1);
      expect(mockOnStateChange).toHaveBeenCalledWith('WORK', 1, TEST_CONFIG.workDuration);
      expect(timer.getCurrentState().state).toBe('WORK');
      expect(timer.getCurrentState().time).toBe(TEST_CONFIG.workDuration);
      expect(timer.getCurrentState().cycle).toBe(1); // Still in context of cycle 1 until next WORK completes
    });

    it('should transition from WORK to LONG_BREAK after longBreakInterval cycles', () => {
      // Cycle 1: WORK -> SHORT_BREAK
      timer.start(); // Start WORK 1 (cycle becomes 0 initially in onStateChange for WORK)
      expect(mockOnStateChange).toHaveBeenCalledWith('WORK', 0, TEST_CONFIG.workDuration);
      vi.advanceTimersByTime(TEST_CONFIG.workDuration * 1000); // End WORK 1
      expect(mockOnPeriodEnd).toHaveBeenCalledWith('WORK', 1); // Cycle 1 (WORK) completed
      expect(mockOnStateChange).toHaveBeenCalledWith('SHORT_BREAK', 1, TEST_CONFIG.shortBreakDuration);
      
      vi.advanceTimersByTime(TEST_CONFIG.shortBreakDuration * 1000); // End SHORT_BREAK 1
      expect(mockOnPeriodEnd).toHaveBeenCalledWith('SHORT_BREAK', 1);
      expect(mockOnStateChange).toHaveBeenCalledWith('WORK', 1, TEST_CONFIG.workDuration); // Start WORK 2

      // Cycle 2: WORK -> LONG_BREAK (as longBreakInterval = 2)
      vi.advanceTimersByTime(TEST_CONFIG.workDuration * 1000); // End WORK 2
      expect(mockOnPeriodEnd).toHaveBeenCalledWith('WORK', 2); // Cycle 2 (WORK) completed
      expect(mockOnStateChange).toHaveBeenCalledWith('LONG_BREAK', 2, TEST_CONFIG.longBreakDuration);
      
      expect(timer.getCurrentState().state).toBe('LONG_BREAK');
      expect(timer.getCurrentState().time).toBe(TEST_CONFIG.longBreakDuration);
      expect(timer.getCurrentState().cycle).toBe(2); // 2 WORK cycles completed
    });
    
    it('should transition from LONG_BREAK to WORK', () => {
      // Simulate state to be LONG_BREAK, cycle 2
      timer.start(); // WORK
      vi.advanceTimersByTime(TEST_CONFIG.workDuration * 1000); // SHORT_BREAK
      vi.advanceTimersByTime(TEST_CONFIG.shortBreakDuration * 1000); // WORK
      vi.advanceTimersByTime(TEST_CONFIG.workDuration * 1000); // LONG_BREAK
      expect(timer.getCurrentState().state).toBe('LONG_BREAK');
      expect(timer.getCurrentState().cycle).toBe(2);

      vi.advanceTimersByTime(TEST_CONFIG.longBreakDuration * 1000); // End LONG_BREAK
      expect(mockOnPeriodEnd).toHaveBeenCalledWith('LONG_BREAK', 2);
      // After a LONG_BREAK, the next WORK period begins.
      // The cycle count behavior after long break might vary based on interpretation.
      // Current: cycle count is not reset until a full reset() or new explicit start from IDLE.
      // Or, if _endCurrentPeriod resets cycle to 0 for LONG_BREAK -> WORK transition.
      // My current logic does not reset cycle after long break automatically.
      expect(mockOnStateChange).toHaveBeenCalledWith('WORK', 2, TEST_CONFIG.workDuration);
      expect(timer.getCurrentState().state).toBe('WORK');
      expect(timer.getCurrentState().time).toBe(TEST_CONFIG.workDuration);
      // expect(timer.getCurrentState().cycle).toBe(0); // If cycle resets for a new set
    });
  });

  describe('pause()', () => {
    it('should pause the timer and stop ticks', () => {
      timer.start(); // WORK
      vi.advanceTimersByTime(2000); // Time = 8s
      expect(mockOnTick).toHaveBeenCalledWith(TEST_CONFIG.workDuration - 2);
      
      timer.pause();
      expect(timer.getCurrentState().isPaused).toBe(true);
      const lastTickCount = mockOnTick.mock.calls.length;

      vi.advanceTimersByTime(3000); // Advance while paused
      expect(mockOnTick.mock.calls.length).toBe(lastTickCount); // onTick should not have been called
      expect(timer.getCurrentState().time).toBe(TEST_CONFIG.workDuration - 2); // Time should not change
    });
  });

  describe('reset()', () => {
    it('should reset the timer to IDLE state, cycle 0, and full workDuration', () => {
      timer.start(); // WORK
      vi.advanceTimersByTime(TEST_CONFIG.workDuration * 1000); // SHORT_BREAK
      vi.advanceTimersByTime(3000); // SHORT_BREAK ticks for 3s
      expect(timer.getCurrentState().state).toBe('SHORT_BREAK');
      expect(timer.getCurrentState().cycle).toBe(1);

      timer.reset();
      
      expect(mockOnStateChange).toHaveBeenCalledWith('IDLE', 0, TEST_CONFIG.workDuration);
      expect(mockOnTick).toHaveBeenLastCalledWith(TEST_CONFIG.workDuration); // Reflects reset time
      
      const stateAfterReset = timer.getCurrentState();
      expect(stateAfterReset.state).toBe('IDLE');
      expect(stateAfterReset.time).toBe(TEST_CONFIG.workDuration);
      expect(stateAfterReset.cycle).toBe(0);
      expect(stateAfterReset.isPaused).toBe(false); // Reset also clears paused state
      
      // Interval should be cleared
      const lastTickCount = mockOnTick.mock.calls.length;
      vi.advanceTimersByTime(2000);
      expect(mockOnTick.mock.calls.length).toBe(lastTickCount); // No new ticks as it's IDLE
    });
  });

  describe('skip()', () => {
    it('should skip from WORK to SHORT_BREAK', () => {
      timer.start(); // WORK
      vi.advanceTimersByTime(3000); // WORK ticks for 3s, time = 7s
      
      timer.skip();
      
      expect(mockOnPeriodEnd).toHaveBeenCalledWith('WORK', 1); // Cycle 1 completed
      expect(mockOnStateChange).toHaveBeenCalledWith('SHORT_BREAK', 1, TEST_CONFIG.shortBreakDuration);
      expect(timer.getCurrentState().state).toBe('SHORT_BREAK');
      expect(timer.getCurrentState().time).toBe(TEST_CONFIG.shortBreakDuration);
    });

    it('should skip from SHORT_BREAK to WORK', () => {
      timer.start(); // WORK
      vi.advanceTimersByTime(TEST_CONFIG.workDuration * 1000); // End WORK -> SHORT_BREAK
      expect(timer.getCurrentState().state).toBe('SHORT_BREAK');
      vi.advanceTimersByTime(2000); // SHORT_BREAK ticks for 2s
      
      timer.skip();
      
      expect(mockOnPeriodEnd).toHaveBeenCalledWith('SHORT_BREAK', 1);
      expect(mockOnStateChange).toHaveBeenCalledWith('WORK', 1, TEST_CONFIG.workDuration);
      expect(timer.getCurrentState().state).toBe('WORK');
    });

    it('should correctly handle multiple skips leading to LONG_BREAK', () => {
      timer.start(); // WORK 1
      timer.skip();  // -> SHORT_BREAK 1 (WORK 1 done, cycle 1)
      expect(mockOnPeriodEnd).toHaveBeenCalledWith('WORK', 1);
      expect(mockOnStateChange).toHaveBeenCalledWith('SHORT_BREAK', 1, TEST_CONFIG.shortBreakDuration);

      timer.skip();  // -> WORK 2 (SHORT_BREAK 1 done)
      expect(mockOnPeriodEnd).toHaveBeenCalledWith('SHORT_BREAK', 1);
      expect(mockOnStateChange).toHaveBeenCalledWith('WORK', 1, TEST_CONFIG.workDuration);

      timer.skip();  // -> LONG_BREAK (WORK 2 done, cycle 2, interval met)
      expect(mockOnPeriodEnd).toHaveBeenCalledWith('WORK', 2);
      expect(mockOnStateChange).toHaveBeenCalledWith('LONG_BREAK', 2, TEST_CONFIG.longBreakDuration);
      expect(timer.getCurrentState().state).toBe('LONG_BREAK');
    });
  });
});
