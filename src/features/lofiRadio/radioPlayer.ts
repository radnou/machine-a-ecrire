// src/features/lofiRadio/radioPlayer.ts

export interface RadioStream {
  name: string;
  url: string;
  genre?: string;
}

export interface RadioPlayerConfig {
  initialVolume?: number;
  streams: RadioStream[];
}

export type PlaybackState = 'IDLE' | 'PLAYING' | 'PAUSED'; // Simplified for now

export type OnRadioStateChangeCallback = (
  newState: PlaybackState,
  currentStream?: RadioStream
) => void;
export type OnRadioStreamChangeCallback = (newStream: RadioStream) => void;
export type OnRadioVolumeChangeCallback = (newVolume: number) => void;
export type OnRadioErrorCallback = (error: string, streamUrl?: string) => void;

const DEFAULT_VOLUME = 0.5;
const MIN_VOLUME = 0;
const MAX_VOLUME = 1;

export class RadioPlayer {
  private config: RadioPlayerConfig;
  private streams: RadioStream[];
  private currentStream: RadioStream | null = null;
  private currentStreamIndex: number = -1;
  private playbackState: PlaybackState = 'IDLE';
  private volume: number;

  // Callbacks
  private onStateChange: OnRadioStateChangeCallback;
  private onStreamChange: OnRadioStreamChangeCallback;
  private onVolumeChange: OnRadioVolumeChangeCallback;
  private onError: OnRadioErrorCallback;

  constructor(
    config: RadioPlayerConfig,
    callbacks: {
      onStateChange: OnRadioStateChangeCallback;
      onStreamChange: OnRadioStreamChangeCallback;
      onVolumeChange: OnRadioVolumeChangeCallback;
      onError: OnRadioErrorCallback;
    }
  ) {
    this.config = config;
    this.streams = config.streams || [];
    this.volume =
      typeof config.initialVolume === 'number'
        ? Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, config.initialVolume))
        : DEFAULT_VOLUME;

    this.onStateChange = callbacks.onStateChange;
    this.onStreamChange = callbacks.onStreamChange;
    this.onVolumeChange = callbacks.onVolumeChange;
    this.onError = callbacks.onError;

    // Initialize with the first stream if available, but keep state IDLE
    if (this.streams.length > 0) {
      // this.currentStream = this.streams[0];
      // this.currentStreamIndex = 0;
      // No, let's select stream explicitly or on first play
    }
  }

  // Simplified _updateStream, primary responsibility is to set stream and call onStreamChange
  private _setStreamByIndex(newIndex: number): boolean {
    if (newIndex >= 0 && newIndex < this.streams.length) {
      const oldStream = this.currentStream;
      this.currentStreamIndex = newIndex;
      this.currentStream = this.streams[this.currentStreamIndex];

      if (this.currentStream && oldStream?.url !== this.currentStream.url) {
        this.onStreamChange(this.currentStream);
      }
      return true;
    }
    return false;
  }

  public play(streamUrl?: string): void {
    console.log(
      `[RadioPlayer] play called. Url: ${streamUrl}, Current Stream: ${this.currentStream?.url}, State: ${this.playbackState}`
    );

    const initialStreamUrlBeforePlay = this.currentStream?.url;
    let streamChangedViaUrlArg = false;

    if (streamUrl) {
      const targetIndex = this.streams.findIndex((s) => s.url === streamUrl);
      if (targetIndex === -1) {
        this.onError(`Stream URL not found: ${streamUrl}`, streamUrl);
        return;
      }
      if (this.currentStreamIndex !== targetIndex) {
        this._setStreamByIndex(targetIndex); // Sets currentStream, currentStreamIndex, calls onStreamChange
        streamChangedViaUrlArg = true;
      }
    }

    if (!this.currentStream && this.streams.length > 0) {
      // Default to first stream if none is current and play is called
      this._setStreamByIndex(0); // Sets currentStream, currentStreamIndex, calls onStreamChange
      streamChangedViaUrlArg = true; // Technically the stream "changed" from null to stream[0]
    }

    if (!this.currentStream) {
      this.onError('No stream selected or available to play.');
      return;
    }

    // If state is not PLAYING, or if the stream was just changed by this play() call,
    // then update state to PLAYING and notify.
    if (
      this.playbackState !== 'PLAYING' ||
      streamChangedViaUrlArg ||
      this.currentStream.url !== initialStreamUrlBeforePlay
    ) {
      this.playbackState = 'PLAYING';
      this.onStateChange(this.playbackState, this.currentStream);
    }
    console.log(`[RadioPlayer] Now Playing: ${this.currentStream.name}`);
  }

  public pause(): void {
    if (this.playbackState === 'PLAYING') {
      this.playbackState = 'PAUSED';
      this.onStateChange(this.playbackState, this.currentStream);
      console.log(`[RadioPlayer] Paused: ${this.currentStream?.name}`);
    }
  }

  /**
   * Selects a stream by its URL. If found, sets it as current, calls onStreamChange,
   * and sets playbackState to IDLE, calling onStateChange.
   * @param streamUrl The URL of the stream to select.
   * @returns True if stream was found and selected, false otherwise.
   */
  public selectStream(streamUrl: string): boolean {
    const index = this.streams.findIndex((s) => s.url === streamUrl);
    if (index === -1) {
      this.onError(`Stream URL not found: ${streamUrl}`, streamUrl);
      return false;
    }

    const oldStreamUrl = this.currentStream?.url;
    const oldPlaybackState = this.playbackState;

    this._setStreamByIndex(index); // Sets currentStream, currentStreamIndex, calls onStreamChange if different

    this.playbackState = 'IDLE';
    // Notify state change if state changed OR if stream changed (even if state was already IDLE)
    if (
      oldPlaybackState !== 'IDLE' ||
      oldStreamUrl !== this.currentStream?.url
    ) {
      this.onStateChange(this.playbackState, this.currentStream);
    }
    return true;
  }

  public nextStream(): void {
    if (this.streams.length === 0) return;
    let newIndex = (this.currentStreamIndex + 1) % this.streams.length;
    if (this.currentStreamIndex === -1 && this.streams.length > 0) {
      newIndex = 0;
    }

    const oldStreamUrl = this.currentStream?.url;
    const oldPlaybackState = this.playbackState;
    this._setStreamByIndex(newIndex); // This calls onStreamChange if stream is different

    this.playbackState = 'IDLE';
    if (
      oldPlaybackState !== 'IDLE' ||
      oldStreamUrl !== this.currentStream?.url
    ) {
      this.onStateChange(this.playbackState, this.currentStream);
    }
    console.log(`[RadioPlayer] Next Stream: ${this.currentStream?.name}`);
  }

  public previousStream(): void {
    if (this.streams.length === 0) return;
    let newIndex =
      (this.currentStreamIndex - 1 + this.streams.length) % this.streams.length;
    if (this.currentStreamIndex === -1 && this.streams.length > 0) {
      newIndex = 0;
    }

    const oldStreamUrl = this.currentStream?.url;
    const oldPlaybackState = this.playbackState;
    this._setStreamByIndex(newIndex); // This calls onStreamChange if stream is different

    this.playbackState = 'IDLE';
    if (
      oldPlaybackState !== 'IDLE' ||
      oldStreamUrl !== this.currentStream?.url
    ) {
      this.onStateChange(this.playbackState, this.currentStream);
    }
    console.log(`[RadioPlayer] Previous Stream: ${this.currentStream?.name}`);
  }

  public setVolume(volume: number): void {
    const clampedVolume = Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume));
    if (this.volume !== clampedVolume) {
      this.volume = clampedVolume;
      this.onVolumeChange(this.volume);
      console.log(`[RadioPlayer] Volume set to: ${this.volume}`);
    }
  }

  public getCurrentStream(): RadioStream | null {
    return this.currentStream;
  }

  public getPlaybackState(): PlaybackState {
    return this.playbackState;
  }

  public getVolume(): number {
    return this.volume;
  }
}
