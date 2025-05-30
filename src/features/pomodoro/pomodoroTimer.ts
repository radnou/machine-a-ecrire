// src/features/pomodoro/pomodoroTimer.ts

export interface PomodoroConfig {
  workDuration: number; // in seconds
  shortBreakDuration: number; // in seconds
  longBreakDuration: number; // in seconds
  longBreakInterval: number; // number of work cycles before a long break
}

export type PomodoroState = 'IDLE' | 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

export type OnTickCallback = (currentTime: number) => void;
export type OnStateChangeCallback = (
  newState: PomodoroState,
  currentCycle: number,
  newDuration: number
) => void;
export type OnPeriodEndCallback = (
  endedState: PomodoroState,
  currentCycle: number
) => void;

export class PomodoroTimer {
  private config: PomodoroConfig;
  private onTick: OnTickCallback;
  private onStateChange: OnStateChangeCallback;
  private onPeriodEnd: OnPeriodEndCallback;

  private _currentTimeInSeconds: number = 0;
  private _currentState: PomodoroState = 'IDLE';
  private _currentCycle: number = 0; // Number of WORK periods completed in the current set
  private intervalId: NodeJS.Timeout | null = null;
  private _isPaused: boolean = false;

  constructor(
    config: PomodoroConfig,
    onTick: OnTickCallback,
    onStateChange: OnStateChangeCallback,
    onPeriodEnd: OnPeriodEndCallback
  ) {
    this.config = config;
    this.onTick = onTick;
    this.onStateChange = onStateChange;
    this.onPeriodEnd = onPeriodEnd;
    this._currentTimeInSeconds = config.workDuration; // Initialize with work duration
    // Initial onStateChange might be desired by some UIs, but typically start() triggers the first real state.
    // this.onStateChange(this._currentState, this._currentCycle, this._currentTimeInSeconds);
  }

  private _tick(): void {
    if (this._isPaused) return;

    this._currentTimeInSeconds--;
    this.onTick(this._currentTimeInSeconds);

    if (this._currentTimeInSeconds <= 0) {
      this._endCurrentPeriod();
    }
  }

  private _getDurationForState(state: PomodoroState): number {
    switch (state) {
      case 'WORK':
        return this.config.workDuration;
      case 'SHORT_BREAK':
        return this.config.shortBreakDuration;
      case 'LONG_BREAK':
        return this.config.longBreakDuration;
      default: // IDLE or others
        return this.config.workDuration; // Default to work duration for initial setup if IDLE
    }
  }

  private _startPeriod(state: PomodoroState): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this._isPaused = false;
    this._currentState = state;
    this._currentTimeInSeconds = this._getDurationForState(state);

    // Notify state change
    this.onStateChange(
      this._currentState,
      this._currentCycle,
      this._currentTimeInSeconds
    );
    this.onTick(this._currentTimeInSeconds); // Initial tick for the new period

    if (state !== 'IDLE') {
      this.intervalId = setInterval(() => this._tick(), 1000);
    }
  }

  private _endCurrentPeriod(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const endedState = this._currentState;
    let cycleForCallback = this._currentCycle;

    if (endedState === 'WORK') {
      this._currentCycle++; // Increment first
      cycleForCallback = this._currentCycle; // Use the updated cycle for the callback
    }

    this.onPeriodEnd(endedState, cycleForCallback); // Pass the correct cycle number

    let nextState: PomodoroState;
    if (endedState === 'WORK') {
      // _currentCycle is already incremented
      if (
        this._currentCycle > 0 &&
        this._currentCycle % this.config.longBreakInterval === 0
      ) {
        nextState = 'LONG_BREAK';
      } else {
        nextState = 'SHORT_BREAK';
      }
    } else {
      // SHORT_BREAK or LONG_BREAK
      nextState = 'WORK';
      // Cycle management for starting new work after break:
      // If currentCycle means "completed work periods in this set leading to long break",
      // then after a LONG_BREAK, when we transition to WORK, currentCycle might reset,
      // or this new WORK period starts a new set.
      // The current logic: _currentCycle is not reset after LONG_BREAK automatically.
      // It continues incrementing. If we want it to reset, it should be done here or in start().
      // For now, the tests imply currentCycle represents total completed work sessions or sessions in current set.
      // The test "should transition from WORK to LONG_BREAK after longBreakInterval cycles" checks for cycle 2.
      // The test "should transition from LONG_BREAK to WORK" checks that onStateChange for WORK has cycle 2.
      // This implies cycle count is not reset after long break in current logic.
    }
    this._startPeriod(nextState);
  }

  public start(): void {
    if (this._currentState === 'IDLE') {
      this._currentCycle = 0; // Reset/start cycles
      // Transition to the first WORK period
      // _startPeriod will increment cycle for WORK if it's the first one.
      // No, _endCurrentPeriod increments cycle. So, WORK starts with currentCycle.
      // Let's make WORK period increment the cycle at its start if coming from break/idle
      if (
        this._currentState === 'IDLE' ||
        this._currentState === 'SHORT_BREAK' ||
        this._currentState === 'LONG_BREAK'
      ) {
        // Starting a new work session, effectively.
        // If we want currentCycle to mean "upcoming work cycle number", then increment here.
        // If it means "completed work cycles for this set", it's incremented in _endCurrentPeriod.
        // Let's stick to _currentCycle = completed work periods.
        // So, if IDLE, the first WORK period is part of cycle 1 (which completes at WORK end).
        // If we reset cycles upon starting from IDLE:
        // this._currentCycle = 0; // This is already the default for a new instance or after full reset.
      }
      this._startPeriod('WORK');
    } else if (this._isPaused) {
      this._isPaused = false;
      // Resume: start the interval again without changing time or state
      if (this._currentState !== 'IDLE') {
        // Should not be IDLE if paused, but as a safeguard
        this.intervalId = setInterval(() => this._tick(), 1000);
        // Optional: notify of resume if needed, e.g. onStateChange(this._currentState, this._currentCycle, this._currentTimeInSeconds, true /* resumed */);
        console.log(
          `[PomodoroTimer] Resumed: ${this._currentState} at ${this._currentTimeInSeconds}s, cycle ${this._currentCycle}`
        );
      }
    }
    // If already running and not paused, start() does nothing.
  }

  public pause(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this._isPaused = true;
      console.log(
        `[PomodoroTimer] Paused: ${this._currentState} at ${this._currentTimeInSeconds}s, cycle ${this._currentCycle}`
      );
      // Optional: notify of pause, e.g. onStateChange(this._currentState, this._currentCycle, this._currentTimeInSeconds, false /* running */, true /* paused */);
    }
  }

  public reset(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this._isPaused = false;
    const previousState = this._currentState;
    this._currentState = 'IDLE';
    this._currentCycle = 0; // Reset cycles
    this._currentTimeInSeconds = this.config.workDuration; // Reset time to initial work duration

    if (previousState !== 'IDLE') {
      // Only call onStateChange if it actually changed to IDLE
      this.onStateChange(
        this._currentState,
        this._currentCycle,
        this._currentTimeInSeconds
      );
    }
    this.onTick(this._currentTimeInSeconds); // Reflect reset time
    console.log('[PomodoroTimer] Reset to IDLE.');
  }

  public skip(): void {
    if (this._currentState !== 'IDLE') {
      console.log(
        `[PomodoroTimer] Skipping period: ${this._currentState}, cycle ${this._currentCycle}`
      );
      this._endCurrentPeriod(); // This will handle transitions and start the next period
    }
  }

  public getCurrentState(): {
    state: PomodoroState;
    time: number;
    cycle: number;
    isPaused: boolean;
  } {
    return {
      state: this._currentState,
      time: this._currentTimeInSeconds,
      cycle: this._currentCycle, // This represents completed work cycles in current set
      isPaused: this._isPaused,
    };
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('[PomodoroTimer] Destroyed.');
    // Release references to callbacks if necessary, though JS garbage collection should handle it.
  }
}
