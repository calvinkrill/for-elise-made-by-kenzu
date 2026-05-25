import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CloudProps {
  rainEnabled: boolean;
  activeBgTheme: 'default' | 'peaceful-sky' | 'sunset-beach' | 'late-afternoon';
  bloomActive: boolean;
}

export default function CloudBackground({ rainEnabled, activeBgTheme, bloomActive }: CloudProps) {
  // Generate random values once using useMemo to avoid shifting elements on every render
  const rainDrops = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 2,
      duration: 1 + Math.random() * 1.2,
      opacity: 0.2 + Math.random() * 0.4,
      length: `${20 + Math.random() * 30}px`,
    }));
  }, []);

  const floatingPetals = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 6,
      duration: 8 + Math.random() * 8,
      size: 16 + Math.random() * 24,
      rotation: Math.random() * 360,
      rotationDir: Math.random() > 0.5 ? 1 : -1,
    }));
  }, []);

  const bloomingTulips = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      bottom: `${-30 + Math.random() * 20}px`,
      scale: 0.6 + Math.random() * 0.5,
      rotation: -15 + Math.random() * 30,
    }));
  }, []);

  // Theme-specific CSS gradients
  const themeClasses = {
    default: 'from-sky-100 via-cyan-50 to-blue-100',
    'peaceful-sky': 'from-sky-400 via-sky-200 to-sky-100 text-sky-900',
    'sunset-beach': 'from-indigo-200 via-pink-100 to-amber-100',
    'late-afternoon': 'from-sky-300 via-orange-100 to-amber-100',
  };

  return (
    <div className={`fixed inset-0 w-full h-full overflow-hidden transition-all duration-[2000s] ease-in-out bg-gradient-to-b ${themeClasses[activeBgTheme]} -z-50`}>
      {/* Soft color glowing light overlays */}
      <div className="absolute inset-0 bg-radial-gradient from-white/30 via-transparent to-transparent opacity-60 pointer-events-none" />

      {/* Floating clouds drifting across */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Soft drift clouds via Framer Motion */}
        <motion.div
          animate={{ x: ['-20%', '100%'] }}
          transition={{ repeat: Infinity, duration: 45, ease: 'linear' }}
          className="absolute top-10 opacity-35"
        >
          <svg width="220" height="120" viewBox="0 0 200 100" fill="white">
            <path d="M 50,80 A 30,30 0 0,1 80,50 A 45,45 0 0,1 150,50 A 30,30 0 0,1 180,80 Z" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ x: ['100%', '-20%'] }}
          transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
          className="absolute top-[35%] opacity-25"
        >
          <svg width="280" height="150" viewBox="0 0 200 100" fill="white">
            <path d="M 30,70 A 25,25 0 0,1 60,40 A 40,40 0 0,1 130,40 A 25,25 0 0,1 160,70 Z" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ x: ['-40%', '100%'] }}
          transition={{ repeat: Infinity, duration: 55, ease: 'linear', delay: 10 }}
          className="absolute top-[65%] opacity-40"
        >
          <svg width="190" height="100" viewBox="0 0 200 100" fill="white">
            <path d="M 40,75 A 25,25 0 0,1 70,45 A 35,35 0 0,1 130,45 A 25,25 0 0,1 160,75 Z" />
          </svg>
        </motion.div>
      </div>

      {/* Interactive Rain Drops */}
      {rainEnabled && (
        <div id="rain-drops-container" className="absolute inset-0 pointer-events-none z-10">
          {rainDrops.map((drop) => (
            <motion.div
              key={drop.id}
              initial={{ y: -100 }}
              animate={{ y: '100vh', x: [0, -15] }}
              transition={{
                duration: drop.duration,
                repeat: Infinity,
                delay: drop.delay,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                left: drop.left,
                width: '1px',
                height: drop.length,
                background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.7))',
                opacity: drop.opacity,
              }}
            />
          ))}
          {/* Soft glass water droplets on foreground overlay */}
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[0.5px] transition-all" />
        </div>
      )}

      {/* Floating White Tulip Petals */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {floatingPetals.map((petal) => (
          <motion.div
            key={petal.id}
            initial={{ y: -50, x: petal.left, opacity: 0, rotate: petal.rotation }}
            animate={{
              y: '105vh',
              x: [
                `calc(${petal.left} - 0px)`,
                `calc(${petal.left} - 60px)`,
                `calc(${petal.left} + 40px)`,
                `calc(${petal.left} - 40px)`,
              ],
              opacity: [0, 0.9, 0.9, 0],
              rotate: [petal.rotation, petal.rotation + 180 * petal.rotationDir, petal.rotation + 360 * petal.rotationDir],
            }}
            transition={{
              duration: petal.duration,
              repeat: Infinity,
              delay: petal.delay,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              width: petal.size,
              height: petal.size,
            }}
          >
            {/* White/Soft Pink Tulip Petal SVG */}
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-sm opacity-80"
            >
              <path
                d="M50 15C30 35 25 70 50 90C75 70 70 35 50 15Z"
                fill="url(#petalGradient)"
              />
              <path
                d="M50 15C42 35 40 65 50 90"
                stroke="#FFEAEF"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.6"
              />
              <defs>
                <linearGradient id="petalGradient" x1="50" y1="15" x2="50" y2="90" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="70%" stopColor="#FFF1F4" />
                  <stop offset="100%" stopColor="#FFE0E7" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Screen-wide Bloom white tulips when activated */}
      <AnimatePresence>
        {bloomActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-30"
          >
            {bloomingTulips.map((t) => (
              <motion.div
                key={t.id}
                initial={{ y: 200, scale: 0, opacity: 0, rotate: t.rotation }}
                animate={{ y: 0, scale: t.scale, opacity: 0.95 }}
                exit={{ y: 200, scale: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 60, delay: t.id * 0.15 }}
                style={{
                  position: 'absolute',
                  left: t.left,
                  bottom: t.bottom,
                  transformOrigin: 'bottom center',
                }}
              >
                {/* Beautiful Detailed Handcrafted SVG White Tulip Flower */}
                <div className="flex flex-col items-center">
                  {/* Tulip Bud */}
                  <svg width="80" height="110" viewBox="0 0 80 110" fill="none" className="drop-shadow-md">
                    {/* Left Petal */}
                    <path
                      d="M20 70C10 50 15 20 40 10C35 40 25 70 20 70Z"
                      fill="#FFF5F7"
                      stroke="#FFE3E8"
                      strokeWidth="1"
                    />
                    {/* Center Petal */}
                    <path
                      d="M40 110C10 90 10 30 40 10C70 30 70 90 40 110Z"
                      fill="url(#tulipBodyGrad)"
                      stroke="#FEE2E6"
                      strokeWidth="1.5"
                    />
                    {/* Right Petal */}
                    <path
                      d="M60 70C70 50 65 20 40 10C45 40 55 70 60 70Z"
                      fill="#FFF0F3"
                      stroke="#FDDDE2"
                      strokeWidth="1"
                    />
                    {/* Inner highlight */}
                    <path
                      d="M40 30C35 50 35 80 40 105"
                      stroke="#FFECEF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="tulipBodyGrad" x1="40" y1="10" x2="40" y2="110" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="60%" stopColor="#FFF1F4" />
                        <stop offset="100%" stopColor="#FFDEE4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Green Stem */}
                  <div className="w-1.5 h-64 bg-linear-to-b from-emerald-300 to-emerald-500 rounded-full shadow-inner opacity-90 -mt-1" />
                  {/* Leaf */}
                  <div className="absolute bottom-20 left-4 w-8 h-16 bg-gradient-to-tr from-emerald-400 to-emerald-300 rounded-ellipse rotate-[25deg] shadow-xs" style={{ borderRadius: '50% 0 50% 0' }} />
                  <div className="absolute bottom-12 right-4 w-9 h-18 bg-gradient-to-tl from-emerald-400 to-emerald-300 rounded-ellipse -rotate-[35deg] shadow-xs" style={{ borderRadius: '0 50% 0 50%' }} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
