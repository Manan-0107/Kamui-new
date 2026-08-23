import React from "react";
import { motion } from "motion/react";

export default function KamuiEye({ size = 26, className = "", animateSpin = true, isHovered = false }) {
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center select-none flex-none ${className}`}
      style={{ width: size, height: size }}
      whileHover={animateSpin ? { rotate: 360, scale: 1.15 } : {}}
      transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-[0_0_10px_rgba(255,20,50,0.85)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="kamui-red-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff1133" />
            <stop offset="65%" stopColor="#d90429" />
            <stop offset="100%" stopColor="#800010" />
          </radialGradient>
          <linearGradient id="kamui-blade-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#151515" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>

        {/* Outer Black Bezel */}
        <circle cx="100" cy="100" r="98" fill="#000000" />

        {/* Sharingan Blood-Red Iris */}
        <circle cx="100" cy="100" r="92" fill="url(#kamui-red-bg)" />

        {/* Thin Inner Black Guide Ring */}
        <circle cx="100" cy="100" r="92" fill="none" stroke="#000000" strokeWidth="4" />

        {/* 3 Kamui Mangekyo Swirling Blades (Accurate mathematical pinwheel) */}
        <g fill="url(#kamui-blade-grad)">
          {[0, 120, 240].map((angle) => (
            <g key={angle} transform={`rotate(${angle} 100 100)`}>
              {/* Main Swirling Pinwheel Blade */}
              <path
                d="M 100 100 
                   C 108 65, 125 35, 162 14 
                   C 178 30, 188 56, 190 84 
                   C 176 56, 150 40, 124 38 
                   C 152 64, 164 100, 150 134 
                   C 134 112, 116 102, 100 100 Z"
              />
              {/* Extended Vortex Arc Hook */}
              <path
                d="M 100 100
                   C 112 60, 140 28, 175 32
                   C 142 42, 118 68, 108 92
                   Z"
              />
              <path
                d="M 162 14
                   C 176 28, 187 50, 190 75
                   C 178 52, 156 34, 130 25
                   C 142 20, 152 16, 162 14 Z"
              />
            </g>
          ))}
        </g>

        {/* Central Black Hub surrounding Pupil */}
        <circle cx="100" cy="100" r="26" fill="#000000" />

        {/* Central Red Core / Pupil */}
        <circle cx="100" cy="100" r="17" fill="url(#kamui-red-bg)" stroke="#000000" strokeWidth="2.5" />
      </svg>
    </motion.div>
  );
}
