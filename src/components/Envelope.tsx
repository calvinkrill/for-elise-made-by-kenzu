import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Heart } from 'lucide-react';
import { EnvelopeData } from '../types';

interface EnvelopeProps {
  key?: React.Key;
  data: EnvelopeData;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function Envelope({ data, isOpen, onOpen, onClose }: EnvelopeProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col items-center select-none">
      {/* Small interactive Grid Envelope */}
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onOpen}
        className="relative w-64 h-40 bg-linear-to-b from-sky-200/90 to-sky-300/80 rounded-xl p-4 shadow-[0_12px_24px_-10px_rgba(14,165,233,0.3)] border border-white/40 cursor-pointer flex items-center justify-center overflow-hidden"
        id={`envelope-anchor-${data.id}`}
      >
        {/* Soft wind drift shine line */}
        <div className="absolute inset-x-0 top-0 h-10 bg-linear-to-b from-white/20 to-transparent pointer-events-none" />

        {/* Vintage Fold Back Panel SVG lines */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Diagonals to look like a realistic pocket */}
          <svg className="w-full h-full" width="100%" height="100%">
            {/* Left fold line */}
            <line x1="0" y1="40" x2="128" y2="105" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
            {/* Right fold line */}
            <line x1="256" y1="40" x2="128" y2="105" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
            {/* Bottom fold line */}
            <line x1="0" y1="160" x2="128" y2="105" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
            <line x1="256" y1="160" x2="128" y2="105" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Realistic Envelope Flap that moves on hover */}
        <motion.div
          animate={
            isOpen 
              ? { rotateX: 180, y: -10, zIndex: 0 } 
              : isHovered 
                ? { rotateX: 25, transformOrigin: 'top center' } 
                : { rotateX: 0, transformOrigin: 'top center' }
          }
          transition={{ duration: 0.4 }}
          className="absolute inset-x-0 top-0 h-16 bg-gradient-to-t from-sky-300 to-sky-100 border-b border-sky-400/20 z-10"
          style={{
            clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)',
            transformOrigin: 'top center',
          }}
        />

        {/* Red/Golden Wax Seal sticker */}
        <motion.div
          animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1 }}
          className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-pink-100 border-2 border-white shadow-md flex items-center justify-center z-20"
        >
          <span className="text-pink-400 text-sm">🌷</span>
        </motion.div>

        {/* Little sliding letter card teaser inside the envelope */}
        <motion.div
          animate={isOpen ? { y: -50, opacity: 0.5 } : { y: 15 }}
          className="w-5/6 h-[70%] bg-white/95 rounded-md p-3 shadow-inner flex flex-col justify-between"
        >
          <div className="w-1/3 h-1 bg-sky-200 rounded-full" />
          <p className="text-[10px] font-mono text-sky-400 text-center tracking-wider uppercase font-medium">
            {data.label}
          </p>
          <div className="w-full h-1 bg-slate-100 rounded-full" />
        </motion.div>
      </motion.div>

      {/* Title label under envelope */}
      <p className="mt-3 text-xs font-mono font-medium tracking-widest text-sky-600 uppercase">
        {data.label}
      </p>

      {/* Cinematic Focused Letter Modals */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark glass backdrop filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-md cursor-pointer"
            />

            {/* Cinematic Letter Container */}
            <motion.div
              initial={{ scale: 0.9, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 120 }}
              className="relative backdrop-blur-xl bg-white/95 border border-white/60 p-8 md:p-10 rounded-3xl shadow-[0_30px_60px_rgba(15,23,42,0.18)] max-w-lg w-full z-10"
              id={`letter-detailed-${data.id}`}
            >
              {/* Tulip corner designs inside the message */}
              <div className="absolute top-4 left-4 text-sky-200/50 text-xl pointer-events-none">🌷</div>
              <div className="absolute bottom-4 right-4 text-sky-200/50 text-xl pointer-events-none">☁️</div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition cursor-pointer"
                aria-label="Close Letter"
                id={`letter-close-btn-${data.id}`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Envelope Marker header */}
              <div className="flex items-center gap-2 mb-6 justify-center">
                <span className="text-xs font-mono bg-sky-100 text-sky-600 px-3 py-1 rounded-full font-medium tracking-widest uppercase">
                  {data.label}
                </span>
                <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
              </div>

              {/* Sincere Detailed Handwritten Letter Content */}
              <div className="text-center font-sans space-y-6">
                {/* Heartfelt Question prompt */}
                <h4 className="text-base md:text-lg font-display text-sky-500 font-semibold tracking-wide uppercase">
                  {data.question}
                </h4>

                {/* Separator flower petal */}
                <div className="flex items-center justify-center gap-2 opacity-60">
                  <div className="h-[1px] w-12 bg-linear-to-r from-transparent to-sky-300" />
                  <span className="text-pink-300 text-xs">●</span>
                  <div className="h-[1px] w-12 bg-linear-to-l from-transparent to-sky-300" />
                </div>

                {/* Hand-written / Serif Sincere Response */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-serif italic text-xl md:text-2xl text-slate-800 leading-relaxed font-semibold px-4"
                >
                  「 {data.answer} 」
                </motion.div>

                {/* Optional description explaining what special animation was triggered */}
                {data.highlight && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.6 }}
                    className="text-xs font-mono text-sky-400 tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <Heart className="w-3.5 h-3.5 fill-sky-400 text-sky-400 animate-pulse" />
                    {data.highlight}
                  </motion.p>
                )}
              </div>

              {/* Bottom Card Signatures */}
              <div className="mt-10 border-t border-sky-100 pt-6 flex justify-between items-center text-xs font-mono text-slate-400 select-none">
                <p>Kenzo's Sky Letters</p>
                <div className="flex items-center gap-1 text-sky-500 font-medium">
                  <span>Sincere and Sincere</span>
                  <span className="text-sm">🤍</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
