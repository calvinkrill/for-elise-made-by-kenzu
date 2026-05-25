import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudRain, 
  Wind, 
  Coffee, 
  Sparkles, 
  Heart, 
  Layers, 
  Sun, 
  Sunset, 
  Umbrella, 
  Smile, 
  Compass, 
  CheckCircle,
  Clock,
  BookOpen,
  Wifi,
  WifiOff
} from 'lucide-react';
import { EnvelopeData, PolaroidData, AmbientState } from './types';
import CloudBackground from './components/CloudBackground';
import MusicPlayer from './components/MusicPlayer';
import Envelope from './components/Envelope';
import PolaroidCard from './components/PolaroidCard';

export default function App() {
  // State for dynamic ambience 
  const [ambient, setAmbient] = useState<AmbientState>({
    rainEnabled: false,
    activeBgTheme: 'default',
    bloomActive: false,
    musicPlaying: false,
    rainOpacity: 0.4
  });

  // State to track which letter is currently reading
  const [activeEnvelopeId, setActiveEnvelopeId] = useState<number | null>(null);

  // Easter eggs & interactive popovers
  const [showTikTokEgg, setShowTikTokEgg] = useState(false);
  const [showCoffeePopup, setShowCoffeePopup] = useState(false);
  const [showFinalLetter, setShowFinalLetter] = useState(false);
  const [showVoiceMemo, setShowVoiceMemo] = useState(false);
  const [coffeeClickCount, setCoffeeClickCount] = useState(0);

  // Two-step entry flow state: 'message' | 'splash' | 'main'
  const [introStage, setIntroStage] = useState<'message' | 'splash' | 'main'>(() => {
    try {
      const unlocked = localStorage.getItem('for_elise_unlocked');
      if (unlocked === 'true') {
        return 'main';
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return 'message';
  });

  // Real-time and simulated network state capabilities
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showNetworkToast, setShowNetworkToast] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNetworkToast('Back online! Connecting your peaceful moments... ⛅');
      setTimeout(() => setShowNetworkToast(null), 4000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowNetworkToast('Offline Mode. Memory tapes & lofi ambient waves are kept locally 🌷☁️');
      setTimeout(() => setShowNetworkToast(null), 4500);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Audio nodes for synthetic synthesizers (rain/waves)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const waveNoiseRef = useRef<any | null>(null);
  const waveGainNodeRef = useRef<GainNode | null>(null);

  // --- Static & Generated Polaroid Card Data ---
  const polaroids: PolaroidData[] = [
    {
      id: 1,
      title: 'A Complete Family',
      subtitle: 'My ultimate wishing tree',
      imageSrc: '/src/assets/images/complete_family_1779711430315.png',
      emoji: '🏠',
      rotation: -3
    },
    {
      id: 2,
      title: 'A Quiet Beach',
      subtitle: 'My calm sunset sanctuary',
      imageSrc: '/src/assets/images/beach_sunset_1779711411843.png',
      emoji: '🌊',
      rotation: 4
    },
    {
      id: 3,
      title: 'True Beauty & School',
      subtitle: 'Stories of growth and purpose',
      imageSrc: '/src/assets/images/school_growth_1779711463832.png',
      emoji: '🎒',
      rotation: -2
    },
    {
      id: 4,
      title: 'Homemade Comfort',
      subtitle: 'Warming coffee after rain',
      imageSrc: '/src/assets/images/warm_coffee_1779711448354.png',
      emoji: '☕',
      rotation: 3
    }
  ];

  // --- Envelope Interactive Data ---
  const envelopes: EnvelopeData[] = [
    {
      id: 1,
      label: 'Envelope 01',
      question: "What's your absolute favorite flower?",
      answer: "A white tulip... simple and sincere. It represents me best, simple and real.",
      highlight: "Blooming tulips cascade onto your screen!",
      iconType: 'tulip'
    },
    {
      id: 2,
      label: 'Envelope 02',
      question: "What color represents peace to you?",
      answer: "Sky blue, cerulean, and black. Mostly soft sky blue.",
      highlight: "The entire digital sky soft transitions into pure blue serenity!",
      iconType: 'peace'
    },
    {
      id: 3,
      label: 'Envelope 03',
      question: "What memory would you relive forever if you could?",
      answer: "Having a complete, smiling family together.",
      highlight: "Handwritten note with emotional outlines is highlighted.",
      iconType: 'family'
    },
    {
      id: 4,
      label: 'Envelope 04',
      question: "What kind of moments make life feel real to you?",
      answer: "Quiet moments with people I love, with no pressure and enough time to rest.",
      highlight: "Soft ambient sparkles float softly in the atmosphere.",
      iconType: 'love'
    },
    {
      id: 5,
      label: 'Envelope 05',
      question: "What is one thing that always calms your heart?",
      answer: "Knowing that not everything has to be figured out all at once.",
      highlight: "Soft cozy rain drops wash away the heavy feeling.",
      iconType: 'heart'
    }
  ];

  // Synthesize soft ocean tide waves to pair with beach aesthetic
  const initOceanWaveSynth = () => {
    if (!audioCtxRef.current) {
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (!waveNoiseRef.current) {
      // Create white noise
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Filter noise into smooth ocean breeze (lowpass filter)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.005, ctx.currentTime); // very low whispering wave trace

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();

      // slow rhythmic Wave swelling (automatic tide frequency LFO)
      const oscillator = ctx.createOscillator();
      oscillator.frequency.value = 0.15; // 6.6 second cycles
      
      const oscGain = ctx.createGain();
      oscGain.gain.value = 150; // modulate filter frequency

      oscillator.connect(oscGain);
      oscGain.connect(filter.frequency);
      oscillator.start();

      // Slow gain modulation as well (tide roll-in volume)
      const ampOsc = ctx.createOscillator();
      ampOsc.frequency.value = 0.15;
      const ampGain = ctx.createGain();
      ampGain.gain.value = 0.012; // wave height

      ampOsc.connect(ampGain);
      ampGain.connect(gain.gain);
      ampOsc.start();

      waveNoiseRef.current = {
        source: noiseSource,
        filter,
        lfo: oscillator,
        ampLfo: ampOsc
      };
      waveGainNodeRef.current = gain;
    } else {
      // resume wave volume
      waveGainNodeRef.current?.gain.setValueAtTime(0.012, ctx.currentTime);
    }
  };

  const stopOceanWaveSynth = () => {
    if (waveGainNodeRef.current && audioCtxRef.current) {
      waveGainNodeRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    }
  };

  // Synchronize dynamic environmental events when envelopes are open
  const handleEnvelopeOpen = (id: number) => {
    setActiveEnvelopeId(id);

    // Dynamic triggers matching personalized items
    if (id === 1) {
      // Bloom white tulips
      setAmbient(prev => ({ ...prev, bloomActive: true }));
    } else if (id === 2) {
      // Peaceful pure Sky blue color shift
      setAmbient(prev => ({ ...prev, activeBgTheme: 'peaceful-sky' }));
    } else if (id === 5) {
      // Cozy rain calming toggle with soft synthetic ocean tide waves
      setAmbient(prev => ({ ...prev, rainEnabled: true }));
      try {
        initOceanWaveSynth();
      } catch (e) {
        console.log('Audio synthesis initialized post user action');
      }
    }
  };

  const handleEnvelopeClose = () => {
    setActiveEnvelopeId(null);
    // Reset flower bloom, but keep nice background setups
    setAmbient(prev => ({ ...prev, bloomActive: false }));
  };

  // Coffee click interaction logic
  const handleCoffeeClick = () => {
    setCoffeeClickCount(prev => prev + 1);
    setShowCoffeePopup(true);
    setTimeout(() => {
      setShowCoffeePopup(false);
    }, 5000);
  };

  // Synchronize URL path to /home and handle back/forward routing aesthetics
  useEffect(() => {
    if (window.location.pathname !== '/home') {
      window.history.replaceState(null, '', '/home');
    }
  }, []);

  // Prevent background scrolling while in intro stages to ensure fully focused immersion
  useEffect(() => {
    if (introStage !== 'main') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [introStage]);

  // Synthesize custom warm piano melodic chord progressions on opening the final letter
  const playFinalChimeChord = () => {
    if (!audioCtxRef.current) {
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const playTone = (freq: number, delayStart: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delayStart);

      gain.gain.setValueAtTime(0, ctx.currentTime + delayStart);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + delayStart + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delayStart + duration - 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delayStart);
      osc.stop(ctx.currentTime + delayStart + duration);
    };

    // Play Gmaj9 and Cadd9 nostalgic warm piano chord sequence
    const G4 = 392.00, B4 = 493.88, D5 = 587.33, F_sharp5 = 739.99, A5 = 880.00;
    const notes = [G4, B4, D5, F_sharp5, A5];
    notes.forEach((freq, idx) => {
      playTone(freq, idx * 0.15, 2.5);
    });
  };

  // Final letter trigger
  const handleOpenFinalLetter = () => {
    setShowFinalLetter(true);
    try {
      playFinalChimeChord();
    } catch(e) {}
  };

  // Toggle ambient weather modes manually
  const toggleRainManual = () => {
    const nextState = !ambient.rainEnabled;
    setAmbient(prev => ({ ...prev, rainEnabled: nextState }));
    if (nextState) {
      try {
        initOceanWaveSynth();
      } catch(e) {}
    } else {
      stopOceanWaveSynth();
    }
  };

  // Handle document clicks to close general pop-ups
  const closeEverything = () => {
    setShowTikTokEgg(false);
  };

  const handleStartApp = () => {
    if (introStage === 'message') {
      setIntroStage('splash');
      // Set background music to play automatically on user interaction to bypass autoplay blockers
      setAmbient(prev => ({ ...prev, musicPlaying: true }));
      setTimeout(() => {
        setIntroStage('main');
        try {
          localStorage.setItem('for_elise_unlocked', 'true');
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans relative" onClick={() => { closeEverything(); if (introStage === 'message') handleStartApp(); }}>
      {/* Immersive Atmospheric Sky Background */}
      <CloudBackground 
        rainEnabled={ambient.rainEnabled} 
        activeBgTheme={ambient.activeBgTheme} 
        bloomActive={ambient.bloomActive} 
      />

      {/* Atmospheric Top Header bar */}
      <header className="sticky top-0 z-40 bg-white/40 backdrop-blur-md border-b border-sky-100/30 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-sky-200/50 backdrop-blur-xs flex items-center justify-center text-sky-500 shadow-inner">
            ☁️
          </div>
          <div>
            <h1 className="text-base font-bold text-sky-900 tracking-wider font-display uppercase">
              FOR ELISE, MADE BY KENZU
            </h1>
            <p className="text-[10px] font-mono text-sky-600 font-medium uppercase tracking-widest">
              Built from your favorite little things 🌷
            </p>
          </div>
        </div>

        {/* Ambient environment setting dials */}
        <div className="flex items-center flex-wrap justify-center gap-3">
          {/* Theme cycle controls */}
          <div className="flex bg-sky-200/20 backdrop-blur-xs p-1 rounded-full border border-sky-300/10 text-xs">
            <button
              onClick={() => setAmbient(prev => ({ ...prev, activeBgTheme: 'default' }))}
              className={`px-3 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1 font-medium ${ambient.activeBgTheme === 'default' ? 'bg-white text-sky-600 shadow-xs' : 'text-sky-800/70 hover:text-sky-900'}`}
              title="Sky Morning Theme"
              id="theme-default-btn"
            >
              <Compass className="w-3 h-3" />
              <span>Sky Blue</span>
            </button>

            <button
              onClick={() => setAmbient(prev => ({ ...prev, activeBgTheme: 'late-afternoon' }))}
              className={`px-3 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1 font-medium ${ambient.activeBgTheme === 'late-afternoon' ? 'bg-white text-orange-600 shadow-xs' : 'text-sky-800/70 hover:text-sky-900'}`}
              title="Late Afternoon po"
              id="theme-afternoon-btn"
            >
              <Sun className="w-3 h-3" />
              <span>Afternoon</span>
            </button>

            <button
              onClick={() => setAmbient(prev => ({ ...prev, activeBgTheme: 'sunset-beach' }))}
              className={`px-3 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1 font-medium ${ambient.activeBgTheme === 'sunset-beach' ? 'bg-white text-indigo-700 shadow-xs' : 'text-sky-800/70 hover:text-sky-900'}`}
              title="Quiet Sunset Beach"
              id="theme-sunset-btn"
            >
              <Sunset className="w-3 h-3" />
              <span>Sunset Beach</span>
            </button>
          </div>

          {/* Rain toggle controller */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleRainManual(); }}
            className={`p-2.5 rounded-full transition border shadow-xs cursor-pointer ${ambient.rainEnabled ? 'bg-sky-500 text-white border-sky-400' : 'bg-white/90 text-sky-500 border-sky-100'}`}
            title="Calming Rain"
            id="rain-toggle-btn"
          >
            <CloudRain className="w-4 h-4 animate-pulse" />
          </button>

          {/* Real-time and Simulated Online/Offline Toggle and Indicator */}
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              const nextOnline = !isOnline;
              setIsOnline(nextOnline);
              setShowNetworkToast(nextOnline 
                ? 'Simulated: Connected to the sky-blue clouds! ⛅' 
                : 'Simulated: Working from local memory storage! 🌷🌧️'
              );
            }}
            className={`px-3 py-2 rounded-full transition border shadow-xs cursor-pointer flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-bold transition-all duration-300 ${isOnline ? 'bg-emerald-50/90 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-sm shadow-emerald-100/50' : 'bg-rose-50/90 text-rose-700 border-rose-200 hover:bg-rose-100 shadow-sm shadow-rose-100/50'}`}
            title="Click to manually toggle Network Online/Offline"
            id="network-toggle-btn"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>

          {/* Sincere message watermarking */}
          <div className="hidden lg:flex items-center gap-1 text-[10px] font-mono text-sky-400 border border-sky-200/30 px-3 py-2 rounded-full bg-white/20">
            <span>RAINY DAYS PREFFERED</span>
            <span>🌧️</span>
          </div>
        </div>
      </header>

      {/* Main Narrative Board */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 space-y-16">
        
        {/* 1. Hero Welcome Greeting Card */}
        <section className="text-center space-y-6 relative select-none">
          {/* Float clouds left/right highlights */}
          <div className="absolute -top-10 left-10 text-4xl animate-sway hidden lg:block opacity-70">☁️</div>
          <div className="absolute top-20 right-10 text-4xl animate-sway hidden lg:block opacity-60" style={{ animationDelay: '1.5s' }}>🌷</div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            {/* Heartfelt introduction title */}
            <h2 className="text-4xl md:text-6xl font-display font-extrabold text-sky-900 tracking-tight leading-none uppercase">
              FOR ELISE, MADE BY KENZU
            </h2>
            <div className="mt-4 flex items-center gap-2">
              <span className="h-[2px] w-8 bg-sky-300" />
              <p className="text-xs md:text-sm font-mono tracking-widest text-sky-500 uppercase font-semibold">
                Built from your favorite little things
              </p>
              <span className="h-[2px] w-8 bg-sky-300" />
            </div>
            
            {/* Soft glassmorphism quote container */}
            <p className="text-slate-700 max-w-2xl text-base md:text-lg italic font-serif leading-relaxed mt-6 bg-white/45 backdrop-blur-xs p-6 rounded-2xl border border-white/50 shadow-xs">
              “Every cloud holds a secret note, every soft wind carries feelings we keep hidden. Take a quiet breath, explore the floating envelopes, and discover a world tailored together with white tulips, rainy skies, and sincerity.”
            </p>
          </motion.div>

          {/* Floating synthesized ambient music card and Interactive coffee coaster side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-6">
            
            {/* Custom synthesized lullaby player */}
            <MusicPlayer 
              isPlaying={ambient.musicPlaying} 
              onPlayStateChange={(playing) => setAmbient(prev => ({ ...prev, musicPlaying: playing }))} 
            />

            {/* Interactive Coffee coaster with realistic rising steam lines */}
            <div 
              onClick={(e) => { e.stopPropagation(); handleCoffeeClick(); }}
              className="backdrop-blur-md bg-white/70 border border-sky-100 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 cursor-pointer hover:bg-white/90 hover:scale-102 transition duration-300"
              title="Steaming Hot Coffee - Click to trigger kind message"
              id="steaming-coffee-box"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* Steam particle waves floating up */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
                    <motion.span
                      animate={{ y: [-5, -20], x: [0, -3, 3, 0], opacity: [0, 0.8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                      className="text-xs text-slate-400"
                    >
                      ~
                    </motion.span>
                    <motion.span
                      animate={{ y: [-5, -24], x: [0, 4, -4, 0], opacity: [0, 0.9, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
                      className="text-xs text-slate-400"
                    >
                      ~
                    </motion.span>
                    <motion.span
                      animate={{ y: [-5, -18], x: [0, -2, 2, 0], opacity: [0, 0.7, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}
                      className="text-xs text-slate-400"
                    >
                      ~
                    </motion.span>
                  </div>

                  <div className="w-11 h-11 rounded-full bg-orange-100 border border-white shadow-inner flex items-center justify-center text-lg">
                    ☕
                  </div>
                </div>

                <div className="text-left">
                  <p className="text-xs font-mono tracking-wider text-amber-500 font-semibold uppercase">comfort food</p>
                  <p className="text-sm font-semibold text-sky-900 font-display">Homemade Brew</p>
                  <p className="text-[10px] text-sky-400">Cup clicks: {coffeeClickCount}</p>
                </div>
              </div>

              <div className="bg-sky-100 text-sky-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs">
                +
              </div>
            </div>
          </div>

          {/* Interactive Coffee steam dialog overlay */}
          <AnimatePresence>
            {showCoffeePopup && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-1/2 -translate-x-1/2 z-30 max-w-sm w-full bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-xl text-center flex items-center gap-3 justify-center"
              >
                <span className="text-xl">☕</span>
                <p className="text-xs font-mono text-amber-800 leading-normal font-medium">
                  {coffeeClickCount > 5 
                    ? "Careful boy! Too much espresso might keep your late-night minds awake... 😭" 
                    : "Serving a warm, homemade coffee po! A simple cup to calm your heart. 🤍"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 2. Interactive Animated Envelope Questions Grid */}
        <section className="space-y-8 select-none">
          <div className="text-center max-w-lg mx-auto">
            <h3 className="text-xl font-bold font-display text-sky-900 tracking-wider uppercase">
              Animated Envelope Questions
            </h3>
            <p className="text-xs text-sky-600 font-mono mt-1 uppercase tracking-widest">
              Tap each sealed capsule to disclose sincere notes po
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 justify-center max-w-5xl mx-auto pt-4" id="envelopes-grid-container">
            {envelopes.map((env) => (
              <Envelope
                key={env.id}
                data={env}
                isOpen={activeEnvelopeId === env.id}
                onOpen={() => handleEnvelopeOpen(env.id)}
                onClose={handleEnvelopeClose}
              />
            ))}
          </div>

          {/* Explanatory footer for interactivity tips */}
          <p className="text-center text-[10px] text-slate-400 font-mono italic">
            * Opening Envelope 01 blooms physical White Tulips; Envelope 02 shifts sky illumination; Envelope 05 starts raindrops.
          </p>
        </section>

        {/* 3. Polaroid Memoir Scrapbook Section */}
        <section className="space-y-10">
          <div className="text-center max-w-lg mx-auto select-none">
            <h3 className="text-xl font-bold font-display text-sky-900 tracking-wider uppercase">
              Memory polaroids
            </h3>
            <p className="text-xs text-sky-600 font-mono mt-1 uppercase tracking-widest">
              A scrapbook built from your beautiful answers po
            </p>
          </div>

          {/* Sizable responsive flex cards scroll list for mobile, grid for desktop */}
          <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-10 max-w-5xl mx-auto pt-6" id="polaroids-container">
            {polaroids.map((card) => (
              <PolaroidCard key={card.id} data={card} />
            ))}
          </div>
        </section>

        {/* 4. Large Gold Final Letters Section */}
        <section className="max-w-2xl mx-auto text-center pt-8 select-none">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-8 md:p-12 rounded-3xl bg-linear-to-b from-white/90 to-sky-50/80 border-2 border-amber-200/50 shadow-2xl relative overflow-hidden backdrop-blur-md"
            id="final-message-card"
          >
            {/* Sparkle background illustrations */}
            <div className="absolute top-4 left-4 text-amber-400/40 text-xl">✨</div>
            <div className="absolute bottom-4 right-4 text-amber-400/40 text-xl">🌷</div>

            <div className="space-y-6">
              <span className="text-3xl">✉️</span>
              <h3 className="text-2xl font-serif italic font-bold text-sky-950">
                A Letter in Soft Skies
              </h3>
              <p className="text-slate-600 font-serif leading-relaxed italic text-sm md:text-base max-w-md mx-auto">
                “You once mentioned that the smell after rain, quiet beach twilight, and неожиданно (unexpected) kind messages instantly warm your soul... so I sealed them all here.”
              </p>

              {/* Glowing elegant golden button */}
              <button
                onClick={handleOpenFinalLetter}
                className="mt-4 px-8 py-3.5 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 hover:from-amber-400 hover:to-amber-400 text-slate-800 font-display font-bold rounded-full shadow-[0_10px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_12px_28px_rgba(245,158,11,0.35)] transition duration-300 active:scale-95 cursor-pointer"
                id="open-final-letter-btn"
              >
                Open Final Letter 🌷
              </button>
            </div>
          </motion.div>
        </section>

      </main>

      {/* Hidden Easter Egg TikTok icon Floating component */}
      <div className="fixed bottom-6 left-6 z-50">
        <motion.button
          whileHover={{ scale: 1.15, rotate: 10 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.stopPropagation(); setShowTikTokEgg(true); }}
          className="w-12 h-12 bg-black hover:bg-slate-900 border border-white/60 shadow-xl rounded-full flex items-center justify-center cursor-pointer relative group"
          title="Floating easter egg ticker!"
          id="tiktok-easter-egg-btn"
        >
          {/* Custom SVG represent for TikTok in baby color palette */}
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5l12-2v13M9 10h12" />
            <path d="M12 18.5a3.5 3.5 0 11-7-0a3.5 3.5 0 017 0z" />
          </svg>
          <span className="absolute -top-1 -right-1 block text-xxs font-mono bg-pink-400 text-white font-bold rounded-full w-4 h-4 text-center leading-4">!</span>
        </motion.button>

        {/* Hidden Dialog for TikTok Easter Egg */}
        <AnimatePresence>
          {showTikTokEgg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -50 }}
              onClick={(e) => e.stopPropagation()} // halt bubbling so it does not auto close
              className="absolute bottom-16 left-0 bg-slate-950 text-white p-5 rounded-2xl shadow-2xl border border-sky-400/20 max-w-xs w-72"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⚠️</span>
                <p className="text-[10px] font-mono tracking-widest text-[#00FFFF] font-bold uppercase">ANTIDOTE FOR BOREDOM</p>
              </div>

              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                “Scrolling TikTok again are we po? HAHAHAHA! Here is your friendly sign to quiet down the infinite feed. Take some deep breaths, play the lullaby above, and sink into quiet memories.”
              </p>

              <p className="text-[10px] text-sky-400 font-mono mt-3 text-right">
                - Kenzo's secret code 🤍
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Beeping Circle Dot Voice Message Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.stopPropagation(); setShowVoiceMemo(true); }}
          className="backdrop-blur-md bg-white/95 border border-red-200/50 hover:border-red-300 shadow-xl px-4 py-2.5 rounded-full flex items-center gap-2.5 cursor-pointer text-xs font-mono font-bold text-slate-800"
          id="beeping-recording-indicator"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span>🔴 LIVE REC</span>
        </motion.button>
      </div>

      {/* Cinematic Modal for the Final Letter */}
      <AnimatePresence>
        {showFinalLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFinalLetter(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="bg-sky-50 border border-amber-100 p-8 md:p-12 rounded-3xl shadow-[0_45px_100px_rgba(15,23,42,0.3)] max-w-2xl w-full z-10 relative overflow-hidden"
              id="final-message-modal-content"
            >
              {/* Detailed watercolor floral backgrounds inside the final letter */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-amber-100/40 via-transparent to-transparent pointer-events-none rounded-full" />
              <div className="absolute -bottom-10 -left-10 text-6xl opacity-10 pointer-events-none select-none">🌷</div>

              {/* Heart letterhead */}
              <div className="flex items-center justify-center mb-8 gap-2">
                <Heart className="w-5 h-5 text-pink-400 fill-pink-400 animate-pulse" />
                <span className="font-mono text-xs text-amber-600 font-bold tracking-widest uppercase">THE SKY COMPASS</span>
                <Heart className="w-5 h-5 text-pink-400 fill-pink-400 animate-pulse" />
              </div>

              {/* Sincerely handwritten narrative */}
              <div className="font-serif italic text-lg md:text-xl text-slate-800 leading-relaxed space-y-6 text-center font-medium">
                <p>
                  You once said you liked quiet moments, soft skies, and meaningful conversations. Let yourself rest knowing that not everything has to be figured out all at once.
                </p>
                <p>
                  So I built this tiny patch of horizon po. A private ocean beach, a cup of coffee near a rainy window, and five little envelopes containing the honest answers we keep in our hearts.
                </p>
                <p className="text-xl md:text-2xl text-sky-700 font-bold font-display tracking-tight mt-8">
                  FOR ELISE, MADE BY KENZU 🌷☁️
                </p>
              </div>

              {/* Close footer button */}
              <div className="mt-10 pt-6 border-t border-sky-100 text-center">
                <button
                  onClick={() => setShowFinalLetter(false)}
                  className="px-6 py-2.5 bg-sky-100 hover:bg-sky-200 text-sky-800 font-mono text-xs font-bold rounded-full transition cursor-pointer"
                  id="final-letter-dismiss-btn"
                >
                  Return to Sky
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cinematic Modal for the Recorded Voice Message */}
      <AnimatePresence>
        {showVoiceMemo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVoiceMemo(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="bg-white border border-red-100 p-6 md:p-10 rounded-3xl shadow-[0_45px_100px_rgba(15,23,42,0.3)] max-w-xl w-full z-10 relative overflow-hidden"
              id="voice-memo-modal-content"
            >
              {/* Detailed decorations */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-red-50 via-transparent to-transparent pointer-events-none rounded-full" />
              <div className="absolute -bottom-10 -left-10 text-6xl opacity-5 pointer-events-none select-none">📻</div>

              {/* Recording Indicator Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                  </span>
                  <span className="font-mono text-xs text-red-500 font-bold tracking-widest uppercase">
                    🔴 Recording Message...
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400 tracking-wider">
                  PLAYTIME: 03:22
                </span>
              </div>

              {/* Sincere letter tape transcript */}
              <div className="font-serif text-slate-800 leading-relaxed space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-left text-sm md:text-base">
                <p className="font-semibold text-slate-900 text-lg">Hi Elise,</p>

                <p>I just wanted to say that I’m really happy I met you.</p>

                <p>
                  This website may look simple,<br />
                  but every part of it was inspired by the little things you shared —<br />
                  the sky blue colors,<br />
                  the tulips,<br />
                  the rainy days,<br />
                  the calm music,<br />
                  and the peaceful moments you love.
                </p>

                <p>
                  I listened to every answer carefully,<br />
                  and somehow,<br />
                  they made me appreciate you even more.
                </p>

                <p>
                  You have this quiet and sincere way of seeing life,<br />
                  and honestly,<br />
                  that’s rare.
                </p>

                <p>
                  Thank you for sharing pieces of yourself with me.<br />
                  Thank you for being someone genuine,<br />
                  comforting,<br />
                  and easy to talk to.
                </p>

                <p>
                  Maybe this is just a small digital letter,<br />
                  but behind every envelope,<br />
                  every animation,<br />
                  and every soft shade of blue,<br />
                  there’s someone truly grateful that our paths crossed.
                </p>

                <p className="font-medium text-slate-900">
                  Meeting you became one of the calmest and happiest parts of my days.
                </p>

                <p className="text-right text-sky-600 font-display font-semibold italic text-base md:text-lg mt-6 block">
                  — Kenzu 🌷☁️
                </p>
              </div>

              {/* Close button */}
              <div className="mt-8 pt-4 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowVoiceMemo(false)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold rounded-full transition cursor-pointer"
                  id="voice-memo-dismiss-btn"
                >
                  Close Tape Transcript
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Aesthetic Footer watermark */}
      <footer className="py-8 text-center text-xs font-mono text-sky-500/70 space-y-2 select-none">
        <div className="flex justify-center items-center gap-1.5 grayscale opacity-75">
          <span>WITH A SMILE</span>
          <span className="text-xs">🔊</span>
          <span>●</span>
          <span>WATERCOLOR MEMORIES</span>
        </div>
        <p className="tracking-wider text-[10px]">
          FOR ELISE, MADE BY KENZU 🌷☁️ · © 2026 FOR ELISE, MADE BY KENZU
        </p>
      </footer>

      {/* Intro Sequence Overlays */}
      <AnimatePresence mode="wait">
        {introStage === 'message' && (
          <motion.div
            key="intro-message"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onClick={handleStartApp}
            className="fixed inset-0 z-50 bg-sky-100 flex flex-col items-center justify-center p-4 text-center overflow-y-auto cursor-pointer select-none"
            id="intro-message-overlay"
          >
            {/* Dynamic floating backup sky particles */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-sky-100 to-sky-200 opacity-90" />
            <div className="absolute top-10 left-10 text-4xl animate-sway opacity-50 select-none">☁️</div>
            <div className="absolute top-20 right-14 text-4xl animate-sway opacity-40 select-none" style={{ animationDelay: '1s' }}>🌷</div>
            <div className="absolute bottom-20 left-16 text-4xl animate-sway opacity-40 select-none" style={{ animationDelay: '2s' }}>🌊</div>
            <div className="absolute bottom-10 right-10 text-4xl animate-sway opacity-50 select-none" style={{ animationDelay: '1.5s' }}>☁️</div>

            <div className="max-w-xl w-full bg-white/75 backdrop-blur-md border border-white/80 p-8 md:p-12 rounded-3xl shadow-[0_30px_70px_rgba(14,165,233,0.15)] space-y-6 md:space-y-8 relative z-10 transition">
              
              <h2 className="text-xl md:text-2xl font-display font-extrabold text-sky-950 tracking-tight flex items-center justify-center gap-2">
                ☁️ Before You Open This...
              </h2>

              <div className="font-serif text-slate-700 text-sm md:text-base leading-relaxed space-y-4 font-medium md:font-semibold">
                <p>This little sky-blue world was made from the things you love:</p>
                <div className="space-y-1 text-sky-900 italic">
                  <p>tulips,</p>
                  <p>rainy afternoons,</p>
                  <p>quiet beaches,</p>
                  <p>soft music,</p>
                  <p>and peaceful moments.</p>
                </div>

                <p className="pt-2">
                  Every envelope here holds a small piece of thought,<br />
                  a memory,<br />
                  or a feeling inspired by you.
                </p>

                <p>
                  So before you continue,<br />
                  I just hope this place makes you smile,<br />
                  even for a little while.
                </p>
              </div>

              <div className="space-y-5 pt-4 border-t border-sky-100/50">
                <p className="text-sky-600 font-display font-extrabold italic text-sm md:text-base tracking-wide">
                  For Elise, Made by Kenzu 🌷
                </p>

                <p className="inline-block px-5 py-2 bg-sky-200/40 text-sky-700 font-mono text-[10px] sm:text-xs tracking-widest font-bold animate-pulse rounded-full border border-sky-300/20">
                  [ Click Anywhere To Open ]
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {introStage === 'splash' && (
          <motion.div
            key="intro-splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 bg-gradient-to-tr from-sky-100 via-white to-sky-100 flex flex-col items-center justify-center p-6 text-center select-none"
            id="intro-splash-overlay"
          >
            {/* Background watercolor bloom */}
            <motion.div 
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 0.35 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute text-8xl md:text-[14rem] text-sky-200 pointer-events-none select-none"
            >
              ☁️
            </motion.div>

            <div className="z-10 space-y-6">
              {/* Pink heart visual pulsing center */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: [1, 1.15, 1], rotate: 0 }}
                transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
                className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-pink-300/50"
              >
                <Heart className="w-8 h-8 fill-white stroke-none" />
              </motion.div>

              <div className="space-y-2">
                <motion.h1 
                  initial={{ letterSpacing: "0.1em", opacity: 0, y: 10 }}
                  animate={{ letterSpacing: "0.3em", opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-2xl md:text-4xl font-display font-extrabold text-sky-950 tracking-wider uppercase leading-none"
                >
                  FOR ELISE
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="text-xs font-mono text-sky-600 tracking-widest uppercase font-semibold"
                >
                  MADE BY KENZU 🌷☁️
                </motion.p>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="text-slate-400 font-serif italic text-xs pt-4"
              >
                Unfolding your sky-blue world...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Network Connection Toast */}
      <AnimatePresence>
        {showNetworkToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-24 right-6 sm:bottom-28 sm:right-8 z-[60] px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-md border text-left flex items-start gap-3 max-w-sm w-[90vw] text-xs font-mono font-bold transition-all duration-300 ${isOnline ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800 shadow-emerald-100/40' : 'bg-rose-50/95 border-rose-200 text-rose-800 shadow-rose-100/40'}`}
            id="network-alert-toast"
          >
            {isOnline ? (
              <Wifi className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <WifiOff className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            )}
            <div className="flex flex-col gap-0.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'text-emerald-600' : 'text-rose-500'}`}>
                {isOnline ? 'NETWORK ONLINE' : 'OFFLINE MODE'}
              </span>
              <span className="text-slate-700/90 leading-relaxed font-semibold">
                {showNetworkToast}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
