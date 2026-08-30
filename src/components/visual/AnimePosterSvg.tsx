import React from 'react';
import { ANIME_CATALOG } from '@/lib/catalog';

interface AnimePosterSvgProps {
  animeId: string;
  className?: string;
}

const COVER_IMAGES: Record<string, string> = {
  'kamui': '/covers/kamui.jpg',
  'ashfall-district': '/covers/ashfall-district.jpg',
  'paper-moon-society': '/covers/paper-moon-society.jpg',
};

export const AnimePosterSvg: React.FC<AnimePosterSvgProps> = ({ animeId, className = 'art' }) => {
  const customCover = COVER_IMAGES[animeId];

  if (customCover) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <img
          src={customCover}
          alt={ANIME_CATALOG[animeId]?.title || animeId}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  switch (animeId) {
    case 'iron-tide':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="pit-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a0718" />
              <stop offset="60%" stopColor="#1e113a" />
              <stop offset="100%" stopColor="#0d081c" />
            </linearGradient>
            <radialGradient id="pit-core" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#e9d5ff" />
              <stop offset="40%" stopColor="#9333ea" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b0764" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="420" fill="url(#pit-bg)" />
          {/* Glowing Reactor Core */}
          <circle cx="150" cy="170" r="85" fill="url(#pit-core)" />
          <circle cx="150" cy="170" r="70" fill="none" stroke="#a855f7" strokeWidth="4" strokeDasharray="10 8" opacity="0.6" />
          <circle cx="150" cy="170" r="46" fill="none" stroke="#c084fc" strokeWidth="3" opacity="0.8" />
          <circle cx="150" cy="170" r="14" fill="#f3e8ff" />
          {/* HUD Target markers */}
          <g stroke="#c084fc" strokeWidth="2" opacity="0.7">
            <line x1="150" y1="70" x2="150" y2="100" />
            <line x1="150" y1="240" x2="150" y2="270" />
            <line x1="50" y1="170" x2="80" y2="170" />
            <line x1="220" y1="170" x2="250" y2="170" />
          </g>
          {/* Mecha Pilot Frame Silhouette */}
          <polygon points="110,130 150,90 190,130 170,220 130,220" fill="#140b26" opacity="0.9" />
          <polygon points="0,320 60,300 120,330 180,310 240,292 270,316 300,300 300,420 0,420" fill="#080412" />
          {/* Title & Kanji */}
          <text x="270" y="55" fill="#a855f7" opacity="0.3" fontFamily="'Shippori Mincho B1', serif" fontSize="40" textAnchor="end">鉄潮</text>
          <text x="20" y="380" className="art-title" style={{ fill: '#e9d5ff', fontFamily: "'Cinzel', serif", fontWeight: 'bold' }}>Iron Tide</text>
        </svg>
      );

    case 'nine-crows-inn':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="pnci-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#180a06" />
              <stop offset="60%" stopColor="#2c1109" />
              <stop offset="100%" stopColor="#100503" />
            </linearGradient>
            <radialGradient id="pnci-glow" cx="50%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="40%" stopColor="#ea580c" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="420" fill="url(#pnci-bg)" />
          {/* Mountain Pass Silhouette */}
          <polygon points="0,200 80,140 150,180 230,110 300,160 300,420 0,420" fill="#140603" />
          {/* Traditional Glowing Lantern */}
          <circle cx="150" cy="135" r="65" fill="url(#pnci-glow)" />
          <rect x="136" y="105" width="28" height="50" rx="4" fill="#c2410c" opacity="0.9" />
          <rect x="142" y="112" width="16" height="36" rx="2" fill="#ffedd5" opacity="0.95" />
          {/* Crows Silhouettes */}
          <g fill="#060201">
            <path d="M60 110 q10 -14 24 -10 q-4 10 -16 16 q-4 4 -8 -6 Z" />
            <path d="M220 130 q10 -14 24 -10 q-4 10 -16 16 q-4 4 -8 -6 Z" />
            <path d="M90 170 q10 -14 24 -10 q-4 10 -16 16 q-4 4 -8 -6 Z" />
            <path d="M200 70 q8 -11 20 -8 q-3 8 -13 13 q-3 3 -7 -5 Z" />
          </g>
          {/* Falling Snow */}
          <circle cx="60" cy="90" r="2" fill="#ffedd5" opacity="0.8" />
          <circle cx="180" cy="170" r="2.5" fill="#ffedd5" opacity="0.9" />
          <circle cx="250" cy="80" r="1.5" fill="#ffedd5" opacity="0.7" />
          {/* Title & Kanji */}
          <text x="270" y="55" fill="#ea580c" opacity="0.3" fontFamily="'Shippori Mincho B1', serif" fontSize="40" textAnchor="end">九烏</text>
          <text x="20" y="380" className="art-title" style={{ fill: '#ffedd5', fontFamily: "'Cinzel', serif", fontWeight: 'bold' }}>Nine Crows Inn</text>
        </svg>
      );

    case 'glasshouse':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="pgh-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#031812" />
              <stop offset="60%" stopColor="#073327" />
              <stop offset="100%" stopColor="#02140f" />
            </linearGradient>
            <radialGradient id="pgh-glow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#059669" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="420" fill="url(#pgh-bg)" />
          {/* Greenhouse Glass Arch */}
          <g stroke="#34d399" strokeWidth="1" opacity="0.3">
            <line x1="150" y1="0" x2="150" y2="420" strokeWidth="2" />
            <line x1="0" y1="90" x2="300" y2="90" />
            <line x1="0" y1="180" x2="300" y2="180" />
            <line x1="0" y1="270" x2="300" y2="270" />
            <line x1="75" y1="0" x2="75" y2="420" />
            <line x1="225" y1="0" x2="225" y2="420" />
          </g>
          {/* Glowing Botanical Sanctuary */}
          <circle cx="150" cy="180" r="80" fill="url(#pgh-glow)" />
          <path d="M70 280 Q 110 180 150 200 Q 200 170 230 280 Z" fill="#047857" opacity="0.85" />
          <path d="M100 320 Q 150 240 200 320 Z" fill="#10b981" opacity="0.9" />
          <circle cx="130" cy="190" r="4" fill="#f43f5e" opacity="0.9" />
          <circle cx="170" cy="170" r="4" fill="#fb7185" opacity="0.95" />
          {/* Title & Kanji */}
          <text x="270" y="55" fill="#10b981" opacity="0.3" fontFamily="'Shippori Mincho B1', serif" fontSize="40" textAnchor="end">温室</text>
          <text x="20" y="380" className="art-title" style={{ fill: '#a7f3d0', fontFamily: "'Cinzel', serif", fontWeight: 'bold' }}>Glasshouse</text>
        </svg>
      );

    case 'hollow-meridian':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="phm-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a0f07" />
              <stop offset="60%" stopColor="#2e1a0d" />
              <stop offset="100%" stopColor="#110a05" />
            </linearGradient>
            <radialGradient id="phm-sun" cx="50%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f97316" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="420" fill="url(#phm-bg)" />
          <circle cx="150" cy="150" r="75" fill="url(#phm-sun)" />
          {/* Astrolabe compass rings */}
          <circle cx="150" cy="150" r="85" fill="none" stroke="#fb923c" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
          <polygon points="150,90 160,150 150,210 140,150" fill="#fed7aa" opacity="0.9" />
          <polygon points="0,290 80,240 150,280 230,220 300,270 300,420 0,420" fill="#180d06" />
          {/* Title & Kanji */}
          <text x="270" y="55" fill="#f97316" opacity="0.3" fontFamily="'Shippori Mincho B1', serif" fontSize="40" textAnchor="end">子午</text>
          <text x="20" y="380" className="art-title" style={{ fill: '#fed7aa', fontFamily: "'Cinzel', serif", fontWeight: 'bold' }}>Hollow Meridian</text>
        </svg>
      );

    case 'static-requiem':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="psr-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#081014" />
              <stop offset="50%" stopColor="#0e232c" />
              <stop offset="100%" stopColor="#050a0d" />
            </linearGradient>
            <radialGradient id="psr-crt" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="420" fill="url(#psr-bg)" />
          {/* Oscilloscope Waveform */}
          <circle cx="150" cy="160" r="75" fill="url(#psr-crt)" />
          <path
            d="M10 160 L60 160 L80 110 L100 210 L120 130 L140 190 L160 80 L180 240 L200 110 L220 190 L240 160 L290 160"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.95"
          />
          {/* Title & Kanji */}
          <text x="270" y="55" fill="#38bdf8" opacity="0.3" fontFamily="'Shippori Mincho B1', serif" fontSize="40" textAnchor="end">雑音</text>
          <text x="20" y="380" className="art-title" style={{ fill: '#bae6fd', fontFamily: "'Cinzel', serif", fontWeight: 'bold' }}>Static Requiem</text>
        </svg>
      );

    case 'long-thaw':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="plt-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#08111b" />
              <stop offset="50%" stopColor="#0f2235" />
              <stop offset="100%" stopColor="#050c14" />
            </linearGradient>
            <radialGradient id="plt-aurora" cx="50%" cy="25%" r="60%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="420" fill="url(#plt-bg)" />
          <path d="M0 60 Q 80 20 150 60 T 300 30 L 300 160 Q 200 120 150 140 T 0 120 Z" fill="url(#plt-aurora)" />
          <circle cx="110" cy="110" r="38" fill="#fbbf24" opacity="0.85" />
          <polygon points="0,240 80,180 150,220 230,150 300,200 300,420 0,420" fill="#0d1c2c" />
          {/* Title & Kanji */}
          <text x="270" y="55" fill="#67e8f9" opacity="0.3" fontFamily="'Shippori Mincho B1', serif" fontSize="40" textAnchor="end">雪解</text>
          <text x="20" y="380" className="art-title" style={{ fill: '#e0f2fe', fontFamily: "'Cinzel', serif", fontWeight: 'bold' }}>The Long Thaw</text>
        </svg>
      );

    default:
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="420" fill="#101522" />
          <circle cx="150" cy="160" r="60" fill="#e8b94f" opacity="0.5" />
          <text x="50%" y="85%" textAnchor="middle" fill="#ffffff" fontFamily="'Cinzel', serif" fontSize="16">
            {ANIME_CATALOG[animeId]?.title || animeId}
          </text>
        </svg>
      );
  }
};

