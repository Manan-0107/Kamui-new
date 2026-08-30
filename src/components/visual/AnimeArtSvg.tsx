import React from 'react';
import { ANIME_CATALOG } from '@/lib/catalog';

interface AnimeArtSvgProps {
  animeId: string;
  className?: string;
}

export const AnimeArtSvg: React.FC<AnimeArtSvgProps> = ({ animeId, className = 'w-full h-full object-cover' }) => {
  switch (animeId) {
    case 'kamui':
      return (
        <svg className={className} viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="170" fill="#12131a" />
          <circle cx="220" cy="50" r="35" fill="#e8b94f" opacity="0.9" />
          <circle cx="220" cy="50" r="55" fill="#e8b94f" opacity="0.12" />
          <polygon points="0,110 60,90 130,115 190,80 250,100 300,90 300,170 0,170" fill="#1a2233" />
          <polygon points="0,140 90,130 180,145 300,130 300,170 0,170" fill="#0a0d14" />
          <text x="18" y="158" fill="#ece3d0" fontFamily="serif" fontSize="13">Kamui</text>
        </svg>
      );
    case 'ashfall-district':
      return (
        <svg className={className} viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="170" fill="#0d1a1e" />
          <rect x="30" y="60" width="22" height="90" fill="#13262c" />
          <rect x="60" y="40" width="26" height="110" fill="#0f2226" />
          <rect x="96" y="75" width="20" height="75" fill="#13262c" />
          <rect x="126" y="30" width="28" height="120" fill="#0f2226" />
          <rect x="164" y="55" width="22" height="95" fill="#13262c" />
          <rect x="196" y="20" width="26" height="130" fill="#0f2226" />
          <rect x="232" y="50" width="20" height="100" fill="#13262c" />
          <circle cx="82" cy="50" r="2" fill="#6fa8b5" />
          <circle cx="150" cy="40" r="2" fill="#6fa8b5" />
          <circle cx="234" cy="20" r="22" fill="#6fa8b5" opacity="0.25" />
          <text x="18" y="158" fill="#bfe3ea" fontFamily="serif" fontSize="12">Ashfall District</text>
        </svg>
      );
    case 'paper-moon-society':
      return (
        <svg className={className} viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="170" fill="#1c1912" />
          <circle cx="90" cy="50" r="30" fill="#e8b94f" opacity="0.85" />
          <path d="M180 30 C 200 55, 190 90, 150 110 C 190 120, 220 145, 210 165" fill="none" stroke="#3a2f1c" strokeWidth="2" opacity="0.7" />
          <circle cx="140" cy="130" r="4" fill="#e8b94f" opacity="0.8" />
          <circle cx="165" cy="145" r="3" fill="#e8b94f" opacity="0.6" />
          <text x="18" y="158" fill="#ece3d0" fontFamily="serif" fontSize="11">Paper Moon Society</text>
        </svg>
      );
    case 'iron-tide':
      return (
        <svg className={className} viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="170" fill="#151221" />
          <circle cx="150" cy="80" r="55" fill="none" stroke="#8a5fb0" strokeWidth="5" opacity="0.5" />
          <circle cx="150" cy="80" r="36" fill="none" stroke="#8a5fb0" strokeWidth="3" opacity="0.7" />
          <circle cx="150" cy="80" r="8" fill="#8a5fb0" />
          <path d="M0 130 C 60 115, 120 135, 180 115 C 240 98, 270 118, 300 105 L300 170 L0 170 Z" fill="#0d0b16" />
          <text x="18" y="158" fill="#d8c8ec" fontFamily="serif" fontSize="13">Iron Tide</text>
        </svg>
      );
    case 'nine-crows-inn':
      return (
        <svg className={className} viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="170" fill="#150e0a" />
          <path d="M140 45 L160 45 L165 130 L135 130 Z" fill="#c1501f" opacity="0.85" />
          <ellipse cx="150" cy="40" rx="20" ry="10" fill="#c1501f" opacity="0.85" />
          <path d="M60 90 q8 -11 20 -8 q-3 8 -13 13 q-3 3 -7 -5 Z" fill="#0c0806" />
          <path d="M220 100 q8 -11 20 -8 q-3 8 -13 13 q-3 3 -7 -5 Z" fill="#0c0806" />
          <text x="18" y="158" fill="#ece3d0" fontFamily="serif" fontSize="12">Nine Crows Inn</text>
        </svg>
      );
    case 'glasshouse':
      return (
        <svg className={className} viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="170" fill="#0e1c17" />
          <g stroke="#3f8f6e" strokeWidth="1" opacity="0.5">
            <line x1="0" y1="40" x2="300" y2="40" />
            <line x1="0" y1="90" x2="300" y2="90" />
            <line x1="0" y1="140" x2="300" y2="140" />
            <line x1="100" y1="0" x2="100" y2="170" />
            <line x1="200" y1="0" x2="200" y2="170" />
          </g>
          <path d="M150 150 C 130 130 90 130 90 110 C 90 96 112 88 130 100 C 132 82 158 74 172 94 C 190 82 214 96 208 116 C 224 120 226 140 204 148 C 210 162 190 170 168 160 C 164 170 156 174 150 170 Z" fill="#3f8f6e" opacity="0.75" />
          <text x="18" y="158" fill="#bfe6d4" fontFamily="serif" fontSize="13">Glasshouse</text>
        </svg>
      );
    case 'hollow-meridian':
      return (
        <svg className={className} viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="170" fill="#1a1108" />
          <circle cx="150" cy="80" r="50" fill="none" stroke="#e5824a" strokeWidth="2" opacity="0.6" />
          <line x1="150" y1="30" x2="150" y2="130" stroke="#e5824a" strokeWidth="1" opacity="0.5" />
          <line x1="100" y1="80" x2="200" y2="80" stroke="#e5824a" strokeWidth="1" opacity="0.5" />
          <polygon points="150,40 157,80 150,120 143,80" fill="#e5824a" opacity="0.85" />
          <polygon points="0,130 70,115 150,130 220,110 300,125 300,170 0,170" fill="#120b06" />
          <text x="18" y="158" fill="#f0c9a8" fontFamily="serif" fontSize="11">Hollow Meridian</text>
        </svg>
      );
    case 'static-requiem':
      return (
        <svg className={className} viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="170" fill="#0c1418" />
          <circle cx="150" cy="75" r="42" fill="none" stroke="#6fa8b5" strokeWidth="2" opacity="0.6" />
          <path d="M60 65 L110 65 L100 80 L140 50 L150 95 L170 40 L190 100 L210 65 L240 65" fill="none" stroke="#6fa8b5" strokeWidth="1.5" opacity="0.8" />
          <line x1="30" y1="130" x2="270" y2="120" stroke="#6fa8b5" strokeWidth="1" opacity="0.3" />
          <text x="18" y="158" fill="#bfdbe2" fontFamily="serif" fontSize="12">Static Requiem</text>
        </svg>
      );
    case 'long-thaw':
      return (
        <svg className={className} viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="170" fill="#0e1620" />
          <circle cx="90" cy="55" r="28" fill="#e8b94f" opacity="0.7" />
          <path d="M0 110 C 60 98 120 118 180 98 C 220 82 260 100 300 90 L300 170 L0 170 Z" fill="#101c28" />
          <path d="M0 140 L80 130 L160 148 L240 130 L300 142 L300 170 L0 170 Z" fill="#080e14" />
          <text x="18" y="158" fill="#ece3d0" fontFamily="serif" fontSize="12">The Long Thaw</text>
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="170" fill="#101522" />
          <circle cx="150" cy="75" r="50" fill="#e8b94f" opacity="0.5" />
          <text x="50%" y="88%" textAnchor="middle" fill="#ffffff" fontFamily="serif" fontSize="14">
            {ANIME_CATALOG[animeId]?.title || animeId}
          </text>
        </svg>
      );
  }
};
