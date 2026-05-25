import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Music, SkipForward } from 'lucide-react';

interface MusicPlayerProps {
  isPlaying: boolean;
  onPlayStateChange: (playing: boolean) => void;
}

interface Note {
  note: string;
  duration: number; // in beats
}

export default function MusicPlayer({ isPlaying, onPlayStateChange }: MusicPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<number | null>(null);
  const currentOscsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);

  // Frequency map for musical notes
  const NOTE_FREQS: { [key: string]: number } = {
    'G3': 196.00, 'A3': 220.00, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.00,
    'A4': 440.00, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
  };

  const tracks = useMemo(() => [
    {
      title: 'With A Smile',
      artist: 'Eraserheads (Lullaby Synthesis)',
      bpm: 80,
      notes: [
        // Intro melody - G major scale
        { note: 'G4', duration: 0.5 }, { note: 'B4', duration: 0.5 },
        { note: 'D5', duration: 0.5 }, { note: 'B4', duration: 0.5 },
        { note: 'A4', duration: 0.5 }, { note: 'C5', duration: 0.5 },
        { note: 'E5', duration: 0.5 }, { note: 'C5', duration: 0.5 },
        // "Lift your head... baby don't be scared"
        { note: 'B4', duration: 0.5 }, { note: 'D5', duration: 0.5 },
        { note: 'G5', duration: 0.5 }, { note: 'D5', duration: 0.5 },
        { note: 'B4', duration: 0.5 }, { note: 'A4', duration: 0.5 },
        { note: 'G4', duration: 1.0 },
        
        { note: 'G4', duration: 0.5 }, { note: 'B4', duration: 0.5 },
        { note: 'D5', duration: 0.5 }, { note: 'B4', duration: 0.5 },
        { note: 'A4', duration: 0.5 }, { note: 'C5', duration: 0.5 },
        { note: 'E5', duration: 0.5 }, { note: 'C5', duration: 0.5 },
        // "Of the things that could go wrong"
        { note: 'B4', duration: 0.5 }, { note: 'D5', duration: 0.5 },
        { note: 'G5', duration: 0.5 }, { note: 'D5', duration: 0.5 },
        { note: 'B4', duration: 0.5 }, { note: 'C5', duration: 0.5 },
        { note: 'A4', duration: 1.5 },
        
        // "In a while you'll be hand in hand"
        { note: 'C4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
        { note: 'G4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
        { note: 'D4', duration: 0.5 }, { note: 'F#4', duration: 0.5 },
        { note: 'A4', duration: 0.5 }, { note: 'F#4', duration: 0.5 },
        // "With a smile..."
        { note: 'G4', duration: 0.5 }, { note: 'B4', duration: 0.5 },
        { note: 'D5', duration: 0.5 }, { note: 'D4', duration: 0.5 },
        { note: 'C4', duration: 1.0 }, { note: 'C4', duration: 1.0 }
      ]
    },
    {
      title: 'Beach Coffee Chords',
      artist: 'Aesthetic Sea Ambient',
      bpm: 60,
      notes: [
        { note: 'G3', duration: 1.0 }, { note: 'B3', duration: 1.0 }, { note: 'D4', duration: 1.0 }, { note: 'G4', duration: 1.0 },
        { note: 'C4', duration: 1.0 }, { note: 'E4', duration: 1.0 }, { note: 'G4', duration: 1.0 }, { note: 'C5', duration: 1.0 },
        { note: 'A3', duration: 1.0 }, { note: 'C4', duration: 1.0 }, { note: 'E4', duration: 1.0 }, { note: 'A4', duration: 1.0 },
        { note: 'D4', duration: 1.0 }, { note: 'F#4', duration: 1.0 }, { note: 'A4', duration: 1.0 }, { note: 'D5', duration: 1.0 },
      ]
    },
    {
      title: 'Nostalgia School Bells',
      artist: 'Growth & Purpose Motif',
      bpm: 75,
      notes: [
        { note: 'E4', duration: 0.5 }, { note: 'G#4', duration: 0.5 }, { note: 'B4', duration: 1.0 },
        { note: 'F#4', duration: 0.5 }, { note: 'A4', duration: 0.5 }, { note: 'C#5', duration: 1.0 },
        { note: 'G#4', duration: 0.5 }, { note: 'B4', duration: 0.5 }, { note: 'E5', duration: 1.0 },
        { note: 'A4', duration: 1.0 }, { note: 'B4', duration: 1.0 },
      ]
    }
  ], []);

  // Initialize Audio Context and Synthesizer
  const initAudio = () => {
    if (!audioCtxRef.current) {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Master output gain
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;

      // Beautiful long decay delay node to create dream-like ambient echoes
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.4;
      const delayFeedback = ctx.createGain();
      delayFeedback.gain.value = 0.35;

      delay.connect(delayFeedback);
      delayFeedback.connect(delay); // loop back
      delay.connect(gainNode);

      delayNodeRef.current = delay;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Play a single synthesized note
  const playNote = (noteName: string, durationSecs: number, time: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx || isMuted) return;

    const freq = NOTE_FREQS[noteName];
    if (!freq) return;

    // Create twin oscillators (Sine & Triangle) for a warm physical "music-box" tone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    
    const noteGain = ctx.createGain();

    osc1.frequency.setValueAtTime(freq, time);
    osc1.type = 'sine';

    osc2.frequency.setValueAtTime(freq * 2, time); // beautiful light upper-octave overtone
    osc2.type = 'triangle';

    // Soft music box touch envelope: pluck start, smooth release
    noteGain.gain.setValueAtTime(0, time);
    noteGain.gain.linearRampToValueAtTime(0.25, time + 0.01);
    noteGain.gain.exponentialRampToValueAtTime(0.001, time + durationSecs - 0.05);

    osc1.connect(noteGain);
    osc2.connect(noteGain);

    // Route direct output + soft ambient delay
    noteGain.connect(gainNodeRef.current!);
    if (delayNodeRef.current) {
      noteGain.connect(delayNodeRef.current);
    }

    osc1.start(time);
    osc2.start(time);

    osc1.stop(time + durationSecs);
    osc2.stop(time + durationSecs);

    // Track active oscillators to stop them on pause/cleanup
    currentOscsRef.current.push(osc1, osc2);
    setTimeout(() => {
      currentOscsRef.current = currentOscsRef.current.filter(o => o !== osc1 && o !== osc2);
    }, durationSecs * 1000 + 100);
  };

  // Starts the interactive loop sequencer
  const startSequencer = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
    }

    const currentTrack = tracks[activeTrackIdx];
    const beatLengthMs = (60 / currentTrack.bpm) * 1000;
    let step = 0;

    const scheduleNextNotes = () => {
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'suspended') return;

      const currentNote = currentTrack.notes[step];
      const noteDuration = (60 / currentTrack.bpm) * currentNote.duration;

      // Play Note directly in Web Audio context scheduler
      playNote(currentNote.note, noteDuration, ctx.currentTime);

      step = (step + 1) % currentTrack.notes.length;
    };

    // Run first step instantly
    scheduleNextNotes();

    // Set interval for next notes
    synthIntervalRef.current = window.setInterval(() => {
      scheduleNextNotes();
    }, beatLengthMs * 0.5); // Eighth-note granularity representation
  };

  // Controls volume updating in realtime
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume, audioCtxRef.current?.currentTime || 0);
    }
  }, [volume, isMuted]);

  // Stops all synthesis
  const stopSynthesis = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    currentOscsRef.current.forEach((o) => {
      try { o.stop(); } catch(e) {}
    });
    currentOscsRef.current = [];
  };

  // Handle Play/Pause changes
  useEffect(() => {
    if (isPlaying) {
      initAudio();
      startSequencer();
    } else {
      stopSynthesis();
    }

    return () => stopSynthesis();
  }, [isPlaying, activeTrackIdx]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      stopSynthesis();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const handlePlayToggle = () => {
    onPlayStateChange(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleNextTrack = () => {
    stopSynthesis();
    setActiveTrackIdx((prev) => (prev + 1) % tracks.length);
    if (!isPlaying) {
      onPlayStateChange(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-md bg-white/70 border border-sky-100 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-6 max-w-sm w-full mx-auto"
      id="ambient-music-player"
    >
      <div className="flex items-center gap-3">
        {/* Animated Vinyl/Tulip player Disc */}
        <div className="relative">
          <motion.div
            animate={isPlaying ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="w-12 h-12 bg-sky-200 rounded-full flex items-center justify-center border-2 border-white shadow-inner cursor-pointer"
            onClick={handlePlayToggle}
          >
            <span className="text-xl">🌷</span>
          </motion.div>
          {isPlaying && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1">
            <Music className="w-3.5 h-3.5 text-sky-500" />
            <p className="text-xs font-mono tracking-widest text-sky-400 font-medium">NOW PLAYING</p>
          </div>
          <p className="text-sm font-semibold text-sky-900 truncate max-w-[150px] font-display">
            {tracks[activeTrackIdx].title}
          </p>
          <p className="text-[10px] text-sky-500 font-medium truncate max-w-[150px]">
            {tracks[activeTrackIdx].artist}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleMuteToggle}
          className="p-1.5 hover:bg-sky-50 rounded-full transition text-sky-600 cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
          id="music-player-mute-btn"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={handlePlayToggle}
          className="p-2.5 bg-sky-400 hover:bg-sky-500 text-white rounded-full transition shadow-md hover:shadow-lg cursor-pointer"
          id="music-player-play-btn"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
        </button>

        <button
          onClick={handleNextTrack}
          className="p-1.5 hover:bg-sky-50 rounded-full transition text-sky-600 cursor-pointer"
          title="Next track"
          id="music-player-next-btn"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
