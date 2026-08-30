import React from 'react';
import { ANIME_CATALOG } from '@/lib/catalog';

interface AnimePosterSvgProps {
  animeId: string;
  className?: string;
}

export const AnimePosterSvg: React.FC<AnimePosterSvgProps> = ({ animeId, className = 'art' }) => {
  switch (animeId) {
    case 'kamui':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="420" fill="#12131a" />
          <circle cx="220" cy="90" r="42" fill="#e8b94f" opacity="0.9" />
          <circle cx="220" cy="90" r="70" fill="#e8b94f" opacity="0.12" />
          <polygon points="0,260 60,200 130,250 190,180 250,230 300,200 300,420 0,420" fill="#1a2233" />
          <polygon points="0,300 90,270 180,300 300,270 300,420 0,420" fill="#0a0d14" />
          <path d="M50 340 C46 322 52 306 64 296 C72 290 82 288 88 292 C93 284 104 280 111 285 C108 292 103 295 100 298 C107 299 114 305 116 313 C120 311 126 311 128 316 C121 318 117 322 118 327 C112 324 105 325 100 329 C93 324 85 323 78 327 C69 323 58 325 51 333 C48 335 46 338 50 340 Z" fill="#0a0d14" />
          <text x="18" y="392" className="art-title">Kamui</text>
        </svg>
      );
    case 'ashfall-district':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="420" fill="#0d1a1e" />
          <rect x="30" y="180" width="26" height="160" fill="#13262c" />
          <rect x="66" y="140" width="30" height="200" fill="#0f2226" />
          <rect x="106" y="200" width="24" height="140" fill="#13262c" />
          <rect x="140" y="120" width="34" height="220" fill="#0f2226" />
          <rect x="184" y="170" width="26" height="170" fill="#13262c" />
          <rect x="220" y="90" width="30" height="250" fill="#0f2226" />
          <rect x="260" y="160" width="24" height="180" fill="#13262c" />
          <circle cx="82" cy="160" r="2" fill="#6fa8b5" />
          <circle cx="150" cy="140" r="2" fill="#6fa8b5" />
          <circle cx="196" cy="190" r="2" fill="#6fa8b5" />
          <circle cx="234" cy="112" r="2" fill="#6fa8b5" />
          <circle cx="270" cy="200" r="2" fill="#6fa8b5" />
          <circle cx="234" cy="80" r="30" fill="#6fa8b5" opacity="0.25" />
          <text x="18" y="392" className="art-title" style={{ fill: '#bfe3ea' }}>Ashfall District</text>
        </svg>
      );
    case 'paper-moon-society':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="420" fill="#1c1912" />
          <circle cx="90" cy="90" r="36" fill="#e8b94f" opacity="0.85" />
          <path d="M180 60 C 200 90, 190 140, 150 160 C 190 170, 220 210, 210 250 C 250 240, 270 200, 260 160 C 240 130, 200 90, 180 60 Z" fill="#3a2f1c" opacity="0.7" />
          <circle cx="140" cy="220" r="5" fill="#e8b94f" opacity="0.8" />
          <circle cx="165" cy="240" r="4" fill="#e8b94f" opacity="0.6" />
          <circle cx="120" cy="250" r="4" fill="#e8b94f" opacity="0.5" />
          <line x1="30" y1="360" x2="270" y2="360" stroke="#3a2f1c" strokeWidth="2" />
          <text x="18" y="392" className="art-title">Paper Moon Society</text>
        </svg>
      );
    case 'iron-tide':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="420" fill="#151221" />
          <circle cx="150" cy="170" r="70" fill="none" stroke="#8a5fb0" strokeWidth="6" opacity="0.5" />
          <circle cx="150" cy="170" r="46" fill="none" stroke="#8a5fb0" strokeWidth="4" opacity="0.7" />
          <circle cx="150" cy="170" r="10" fill="#8a5fb0" />
          <g stroke="#8a5fb0" strokeWidth="4" opacity="0.6">
            <line x1="150" y1="86" x2="150" y2="104" />
            <line x1="150" y1="236" x2="150" y2="254" />
            <line x1="66" y1="170" x2="84" y2="170" />
            <line x1="216" y1="170" x2="234" y2="170" />
          </g>
          <path d="M0 320 C 60 300, 120 330, 180 310 C 240 292, 270 316, 300 300 L300 420 L0 420 Z" fill="#0d0b16" />
          <text x="18" y="392" className="art-title" style={{ fill: '#d8c8ec' }}>Iron Tide</text>
        </svg>
      );
    case 'nine-crows-inn':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="420" fill="#150e0a" />
          <path d="M140 120 L160 120 L168 300 L132 300 Z" fill="#c1501f" opacity="0.85" />
          <ellipse cx="150" cy="112" rx="26" ry="14" fill="#c1501f" opacity="0.85" />
          <g fill="#0c0806">
            <path d="M60 200 q10 -14 24 -10 q-4 10 -16 16 q-4 4 -8 -6 Z" />
            <path d="M220 230 q10 -14 24 -10 q-4 10 -16 16 q-4 4 -8 -6 Z" />
            <path d="M90 270 q10 -14 24 -10 q-4 10 -16 16 q-4 4 -8 -6 Z" />
          </g>
          <text x="18" y="392" className="art-title">Nine Crows Inn</text>
        </svg>
      );
    case 'glasshouse':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="420" fill="#0e1c17" />
          <g stroke="#3f8f6e" strokeWidth="1" opacity="0.5">
            <line x1="0" y1="90" x2="300" y2="90" />
            <line x1="0" y1="180" x2="300" y2="180" />
            <line x1="0" y1="270" x2="300" y2="270" />
            <line x1="100" y1="0" x2="100" y2="420" />
            <line x1="200" y1="0" x2="200" y2="420" />
          </g>
          <path d="M150 340 C 130 300 90 300 90 260 C 90 236 112 224 130 236 C 132 210 158 200 172 220 C 190 210 214 224 208 250 C 224 254 226 280 204 288 C 210 310 190 330 168 320 C 164 336 156 342 150 340 Z" fill="#3f8f6e" opacity="0.75" />
          <text x="18" y="392" className="art-title" style={{ fill: '#bfe6d4' }}>Glasshouse</text>
        </svg>
      );
    case 'hollow-meridian':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="420" fill="#1a1108" />
          <circle cx="150" cy="170" r="64" fill="none" stroke="#e5824a" strokeWidth="2" opacity="0.6" />
          <line x1="150" y1="90" x2="150" y2="250" stroke="#e5824a" strokeWidth="1" opacity="0.5" />
          <line x1="70" y1="170" x2="230" y2="170" stroke="#e5824a" strokeWidth="1" opacity="0.5" />
          <polygon points="150,110 160,170 150,230 140,170" fill="#e5824a" opacity="0.85" />
          <polygon points="0,320 70,270 150,310 220,260 300,300 300,420 0,420" fill="#120b06" />
          <text x="18" y="392" className="art-title" style={{ fill: '#f0c9a8' }}>Hollow Meridian</text>
        </svg>
      );
    case 'static-requiem':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="420" fill="#0c1418" />
          <circle cx="150" cy="160" r="50" fill="none" stroke="#6fa8b5" strokeWidth="2" opacity="0.6" />
          <path d="M60 150 L110 150 L100 170 L140 130 L150 190 L170 110 L190 200 L210 150 L240 150" fill="none" stroke="#6fa8b5" strokeWidth="1.5" opacity="0.8" />
          <line x1="30" y1="260" x2="270" y2="240" stroke="#6fa8b5" strokeWidth="1" opacity="0.3" />
          <line x1="30" y1="280" x2="270" y2="300" stroke="#6fa8b5" strokeWidth="1" opacity="0.25" />
          <text x="18" y="392" className="art-title" style={{ fill: '#bfdbe2' }}>Static Requiem</text>
        </svg>
      );
    case 'long-thaw':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="420" fill="#0e1620" />
          <circle cx="90" cy="100" r="30" fill="#e8b94f" opacity="0.7" />
          <path d="M0 260 C 60 240 120 270 180 240 C 220 220 260 240 300 220 L300 420 L0 420 Z" fill="#101c28" />
          <path d="M0 320 L80 300 L160 330 L240 300 L300 320 L300 420 L0 420 Z" fill="#080e14" />
          <path d="M120 300 C 130 260 150 240 160 300" fill="none" stroke="#3a5a70" strokeWidth="4" opacity="0.6" />
          <text x="18" y="392" className="art-title">The Long Thaw</text>
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="420" fill="#101522" />
          <circle cx="150" cy="160" r="60" fill="#e8b94f" opacity="0.5" />
          <text x="50%" y="85%" textAnchor="middle" fill="#ffffff" fontFamily="serif" fontSize="16">
            {ANIME_CATALOG[animeId]?.title || animeId}
          </text>
        </svg>
      );
  }
};
