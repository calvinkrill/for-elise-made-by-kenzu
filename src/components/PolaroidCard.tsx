import React from 'react';
import { motion } from 'motion/react';
import { PolaroidData } from '../types';

interface PolaroidCardProps {
  key?: React.Key;
  data: PolaroidData;
}

export default function PolaroidCard({ data }: PolaroidCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: data.rotation }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      whileHover={{
        scale: 1.05,
        rotate: data.rotation > 0 ? data.rotation - 4 : data.rotation + 4,
        y: -10,
        zIndex: 10,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="relative bg-white p-4 pb-8 rounded-xs shadow-[0_15px_30px_rgba(15,23,42,0.08)] border border-slate-100 max-w-xs w-full flex-none cursor-pointer group"
      id={`memory-card-${data.id}`}
    >
      {/* Tape decoration at the top of the polaroid to simulate organic scrapbooking */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-sky-200/40 backdrop-blur-[1px] rotate-[-2deg] z-10 border border-white/20 shadow-xs pointer-events-none" />

      {/* Glossy Photo Frame Container */}
      <div className="relative aspect-3/4 overflow-hidden bg-slate-100 rounded-sm border border-slate-200/50">
        <img
          src={data.imageSrc}
          alt={data.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover select-none transition duration-700 group-hover:scale-110"
        />
        {/* Sky glow tint overlay */}
        <div className="absolute inset-0 bg-linear-to-tr from-sky-400/10 via-transparent to-white/10 pointer-events-none" />
        
        {/* Soft floating emoji badge */}
        <span className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-xs border border-sky-100">
          {data.emoji}
        </span>
      </div>

      {/* Heartfelt Handwritten Note Card bottom portion */}
      <div className="mt-5 text-center select-none">
        <h3 className="font-serif italic text-lg text-slate-800 font-semibold tracking-tight">
          {data.title}
        </h3>
        <p className="text-xs font-mono font-medium text-sky-500 mt-2 tracking-wide uppercase">
          {data.subtitle}
        </p>
      </div>

      {/* Decorative floral watermark corner */}
      <div className="absolute bottom-2 right-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-sky-200 select-none">
        🌷
      </div>
    </motion.div>
  );
}
