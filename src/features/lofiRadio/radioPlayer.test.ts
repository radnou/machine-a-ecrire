// src/features/lofiRadio/radioPlayer.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  RadioPlayer,
  RadioPlayerConfig,
  RadioStream,
  PlaybackState,
  OnRadioStateChangeCallback,
  OnRadioStreamChangeCallback,
  OnRadioVolumeChangeCallback,
  OnRadioErrorCallback,
} from './radioPlayer';

const STREAMS_MOCK: RadioStream[] = [
  { name: "Chilled Cow", url: "chilledcow.pls", genre: "Lofi" },
  { name: "Coffee Beats", url: "coffee.pls", genre: "Jazz Hop" },
  { name: "Synthwave FM", url: "synthwave.fm", genre: "Retrowave" },
];

const TEST_CONFIG: RadioPlayerConfig = {
  initialVolume: 0.75,
  streams: STREAMS_MOCK,
};

describe('RadioPlayer', () => {
  let mockOnStateChange: OnRadioStateChangeCallback;
  let mockOnStreamChange: OnRadioStreamChangeCallback;
  let mockOnVolumeChange: OnRadioVolumeChangeCallback;
  let mockOnError: OnRadioErrorCallback;
  let player: RadioPlayer;

  beforeEach(() => {
    mockOnStateChange = vi.fn();
    mockOnStreamChange = vi.fn();
    mockOnVolumeChange = vi.fn();
    mockOnError = vi.fn();
    // Correctly pass callback functions with matching keys
    player = new RadioPlayer(TEST_CONFIG, {
      onStateChange: mockOnStateChange,
      onStreamChange: mockOnStreamChange,
      onVolumeChange: mockOnVolumeChange,
      onError: mockOnError,
    });
  });

  it('should initialize with default values', () => {
    expect(player.getPlaybackState()).toBe('IDLE');
    expect(player.getCurrentStream()).toBeNull();
    expect(player.getVolume()).toBe(TEST_CONFIG.initialVolume);
    expect(mockOnStateChange).not.toHaveBeenCalled(); // Constructor doesn't call it
    expect(mockOnStreamChange).not.toHaveBeenCalled();
    expect(mockOnVolumeChange).not.toHaveBeenCalled(); // Volume is set, but callback only on change by setVolume
  });
  
  it('should initialize with default volume 0.5 if not provided', () => {
    const configNoVolume: RadioPlayerConfig = { streams: STREAMS_MOCK };
    // Correctly pass callback functions with matching keys
    const playerNoVolume = new RadioPlayer(configNoVolume, { 
        onStateChange: mockOnStateChange, 
        onStreamChange: mockOnStreamChange, 
        onVolumeChange: mockOnVolumeChange, 
        onError: mockOnError 
    });
    expect(playerNoVolume.getVolume()).toBe(0.5);
  });


  describe('play()', () => {
    it('should play the first stream if no stream is current and no URL is provided', () => {
      player.play();
      expect(player.getPlaybackState()).toBe('PLAYING');
      expect(player.getCurrentStream()).toBe(STREAMS_MOCK[0]);
      expect(mockOnStreamChange).toHaveBeenCalledWith(STREAMS_MOCK[0]);
      expect(mockOnStateChange).toHaveBeenCalledWith('PLAYING', STREAMS_MOCK[0]);
    });

    it('should play the specified stream by URL', () => {
      player.play(STREAMS_MOCK[1].url);
      expect(player.getPlaybackState()).toBe('PLAYING');
      expect(player.getCurrentStream()).toBe(STREAMS_MOCK[1]);
      expect(mockOnStreamChange).toHaveBeenCalledWith(STREAMS_MOCK[1]); // from selectStream via play
      expect(mockOnStateChange).toHaveBeenCalledWith('PLAYING', STREAMS_MOCK[1]); // from play
    });

    it('should call onError if playing an invalid stream URL', () => {
      player.play("invalid.url");
      expect(mockOnError).toHaveBeenCalledWith("Stream URL not found: invalid.url", "invalid.url");
      expect(player.getPlaybackState()).toBe('IDLE'); // Should remain IDLE or current state if already playing something else
    });

    it('should resume playing the current stream if paused', () => {
      player.play(STREAMS_MOCK[0].url); // Play first stream
      player.pause(); // Pause it
      expect(player.getPlaybackState()).toBe('PAUSED');
      
      player.play(); // Resume (no URL)
      expect(player.getPlaybackState()).toBe('PLAYING');
      expect(player.getCurrentStream()).toBe(STREAMS_MOCK[0]);
      // onStateChange should be called for PLAYING state
      expect(mockOnStateChange).toHaveBeenLastCalledWith('PLAYING', STREAMS_MOCK[0]);
    });
    
    it('should do nothing if already playing the current stream and play() is called again', () => {
      player.play(STREAMS_MOCK[0].url);
      mockOnStateChange.mockClear();
      mockOnStreamChange.mockClear();
      
      player.play(); // Call play again without args
      expect(mockOnStateChange).not.toHaveBeenCalled();
      expect(mockOnStreamChange).not.toHaveBeenCalled();
      expect(player.getPlaybackState()).toBe('PLAYING');
    });

    it('should switch and play if called with a different stream URL while already playing', () => {
        player.play(STREAMS_MOCK[0].url); // Playing stream 0
        expect(player.getCurrentStream()).toBe(STREAMS_MOCK[0]);
        
        player.play(STREAMS_MOCK[1].url); // Play stream 1
        expect(player.getCurrentStream()).toBe(STREAMS_MOCK[1]);
        expect(player.getPlaybackState()).toBe('PLAYING');
        expect(mockOnStreamChange).toHaveBeenCalledWith(STREAMS_MOCK[1]);
        expect(mockOnStateChange).toHaveBeenLastCalledWith('PLAYING', STREAMS_MOCK[1]);
      });

    it('should handle playing with an empty stream list', () => {
        const emptyPlayer = new RadioPlayer({ streams: [] }, { 
            onStateChange: mockOnStateChange, 
            onStreamChange: mockOnStreamChange, 
            onVolumeChange: mockOnVolumeChange, 
            onError: mockOnError 
        });
        emptyPlayer.play();
        expect(mockOnError).toHaveBeenCalledWith("No stream selected or available to play.");
        expect(emptyPlayer.getPlaybackState()).toBe('IDLE');
    });
  });

  describe('pause()', () => {
    it('should set state to PAUSED if playing', () => {
      player.play(STREAMS_MOCK[0].url);
      player.pause();
      expect(player.getPlaybackState()).toBe('PAUSED');
      expect(mockOnStateChange).toHaveBeenCalledWith('PAUSED', STREAMS_MOCK[0]);
    });

    it('should do nothing if already PAUSED or IDLE', () => {
      player.pause(); // Currently IDLE
      expect(mockOnStateChange).not.toHaveBeenCalled();
      
      player.play(STREAMS_MOCK[0].url); // PLAYING
      player.pause(); // PAUSED
      mockOnStateChange.mockClear();
      player.pause(); // Already PAUSED
      expect(mockOnStateChange).not.toHaveBeenCalled();
    });
  });

  describe('selectStream()', () => {
    it('should select a stream, call onStreamChange, and set state to IDLE', () => {
      player.selectStream(STREAMS_MOCK[1].url);
      expect(player.getCurrentStream()).toBe(STREAMS_MOCK[1]);
      expect(mockOnStreamChange).toHaveBeenCalledWith(STREAMS_MOCK[1]);
      expect(player.getPlaybackState()).toBe('IDLE');
      expect(mockOnStateChange).toHaveBeenCalledWith('IDLE', STREAMS_MOCK[1]);
    });

    it('should call onError if selecting an invalid stream URL', () => {
      player.selectStream("invalid.url");
      expect(mockOnError).toHaveBeenCalledWith("Stream URL not found: invalid.url", "invalid.url");
      expect(player.getCurrentStream()).toBeNull(); // No stream should be selected
    });

    it('should change stream and go to IDLE if playing', () => {
        player.play(STREAMS_MOCK[0].url); // Playing stream 0
        player.selectStream(STREAMS_MOCK[1].url); // Select stream 1
        
        expect(player.getCurrentStream()).toBe(STREAMS_MOCK[1]);
        expect(mockOnStreamChange).toHaveBeenCalledWith(STREAMS_MOCK[1]);
        expect(player.getPlaybackState()).toBe('IDLE');
        expect(mockOnStateChange).toHaveBeenLastCalledWith('IDLE', STREAMS_MOCK[1]);
      });
  });

  describe('nextStream() / previousStream()', () => {
    it('should select the next stream and loop', () => {
      player.selectStream(STREAMS_MOCK[0].url); // Current is 0
      player.nextStream();
      expect(player.getCurrentStream()).toBe(STREAMS_MOCK[1]);
      expect(mockOnStreamChange).toHaveBeenCalledWith(STREAMS_MOCK[1]);
      
      player.nextStream();
      expect(player.getCurrentStream()).toBe(STREAMS_MOCK[2]);
      
      player.nextStream(); // Loop
      expect(player.getCurrentStream()).toBe(STREAMS_MOCK[0]);
      // All these should set state to IDLE
      expect(player.getPlaybackState()).toBe('IDLE');
    });

    it('should select the previous stream and loop', () => {
      player.selectStream(STREAMS_MOCK[0].url); // Current is 0
      player.previousStream(); // Loop to last
      expect(player.getCurrentStream()).toBe(STREAMS_MOCK[STREAMS_MOCK.length - 1]);
      expect(mockOnStreamChange).toHaveBeenCalledWith(STREAMS_MOCK[STREAMS_MOCK.length - 1]);
      
      player.previousStream();
      expect(player.getCurrentStream()).toBe(STREAMS_MOCK[STREAMS_MOCK.length - 2]);
      expect(player.getPlaybackState()).toBe('IDLE');
    });
    
    it('nextStream should select first stream if none selected', () => {
        player.nextStream();
        expect(player.getCurrentStream()).toBe(STREAMS_MOCK[0]);
        expect(mockOnStreamChange).toHaveBeenCalledWith(STREAMS_MOCK[0]);
        expect(player.getPlaybackState()).toBe('IDLE');
    });

    it('previousStream should select first stream if none selected (could also be last)', () => {
        player.previousStream();
        expect(player.getCurrentStream()).toBe(STREAMS_MOCK[0]); // Or STREAMS_MOCK[STREAMS_MOCK.length-1] based on preference
        expect(mockOnStreamChange).toHaveBeenCalledWith(STREAMS_MOCK[0]);
        expect(player.getPlaybackState()).toBe('IDLE');
    });

    it('should do nothing if stream list is empty', () => {
        const emptyPlayer = new RadioPlayer({ streams: [] }, { 
            onStateChange: mockOnStateChange, 
            onStreamChange: mockOnStreamChange, 
            onVolumeChange: mockOnVolumeChange, 
            onError: mockOnError 
        });
        emptyPlayer.nextStream();
        expect(emptyPlayer.getCurrentStream()).toBeNull();
        emptyPlayer.previousStream();
        expect(emptyPlayer.getCurrentStream()).toBeNull();
    });
  });

  describe('setVolume()', () => {
    it('should set volume and call onVolumeChange', () => {
      const newVolume = 0.5;
      player.setVolume(newVolume);
      expect(player.getVolume()).toBe(newVolume);
      expect(mockOnVolumeChange).toHaveBeenCalledWith(newVolume);
    });

    it('should clamp volume to 0 if set below 0', () => {
      player.setVolume(-0.5);
      expect(player.getVolume()).toBe(0);
      expect(mockOnVolumeChange).toHaveBeenCalledWith(0);
    });

    it('should clamp volume to 1 if set above 1', () => {
      player.setVolume(1.5);
      expect(player.getVolume()).toBe(1);
      expect(mockOnVolumeChange).toHaveBeenCalledWith(1);
    });

    it('should not call onVolumeChange if volume is not changed', () => {
        const currentVolume = player.getVolume();
        player.setVolume(currentVolume);
        expect(mockOnVolumeChange).not.toHaveBeenCalled();
    });
  });
});
