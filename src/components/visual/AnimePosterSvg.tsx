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
          <defs>
            <linearGradient id="pkamui-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#080e18" />
              <stop offset="55%" stopColor="#122033" />
              <stop offset="100%" stopColor="#070c14" />
            </linearGradient>
            <radialGradient id="pkamui-moon" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="40%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#e8b94f" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#c1501f" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="420" fill="url(#pkamui-bg)" />
          {/* Golden Moon */}
          <circle cx="150" cy="115" r="60" fill="url(#pkamui-moon)" />
          <circle cx="150" cy="115" r="75" fill="none" stroke="#e8b94f" strokeWidth="1" opacity="0.3" strokeDasharray="6 4" />
          {/* Mountain Silhouettes */}
          <polygon points="0,220 80,160 150,210 230,140 300,190 300,420 0,420" fill="#132338" />
          <polygon points="0,280 70,240 140,270 220,225 300,260 300,420 0,420" fill="#0c1624" />
          {/* Torii Silhouette */}
          <g fill="#c1501f" opacity="0.95">
            <rect x="120" y="210" width="8" height="70" />
            <rect x="172" y="210" width="8" height="70" />
            <rect x="105" y="210" width="90" height="10" rx="2" fill="#e8b94f" />
            <rect x="114" y="226" width="72" height="6" />
          </g>
          {/* Sacred Snow & Bells */}
          <circle cx="150" cy="255" r="16" fill="#f97316" opacity="0.6" />
          <circle cx="150" cy="255" r="4" fill="#ffedd5" />
          {/* Title & Kanji */}
          <text x="270" y="55" fill="#e8b94f" opacity="0.35" fontFamily="'Shippori Mincho B1', serif" fontSize="40" textAnchor="end">神威</text>
          <text x="20" y="380" className="art-title" style={{ fill: '#ffffff', fontFamily: "'Cinzel', serif", fontWeight: 'bold' }}>Kamui</text>
        </svg>
      );

    case 'ashfall-district':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="pashfall-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#081017" />
              <stop offset="50%" stopColor="#0f2330" />
              <stop offset="100%" stopColor="#04090d" />
            </linearGradient>
            <radialGradient id="pashfall-neon" cx="50%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="420" fill="url(#pashfall-bg)" />
          {/* Cyberpunk Skyscrapers */}
          <rect x="25" y="90" width="55" height="250" fill="#091621" />
          <rect x="95" y="60" width="70" height="280" fill="#0d2131" />
          <rect x="180" y="100" width="60" height="240" fill="#08131d" />
          <rect x="250" y="40" width="45" height="300" fill="#0f273a" />
          {/* Holographic Beam */}
          <circle cx="150" cy="140" r="70" fill="url(#pashfall-neon)" />
          <line x1="150" y1="0" x2="150" y2="420" stroke="#38bdf8" strokeWidth="2" opacity="0.75" />
          {/* Title & Kanji */}
          <text x="270" y="55" fill="#38bdf8" opacity="0.35" fontFamily="'Shippori Mincho B1', serif" fontSize="40" textAnchor="end">灰降</text>
          <text x="20" y="380" className="art-title" style={{ fill: '#bae6fd', fontFamily: "'Cinzel', serif", fontWeight: 'bold' }}>Ashfall District</text>
        </svg>
      );

    case 'paper-moon-society':
      return (
        <svg className={className} viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="ppapermoon-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#140f06" />
              <stop offset="50%" stopColor="#291e0a" />
              <stop offset="100%" stopColor="#0d0a03" />
            </linearGradient>
            <radialGradient id="ppapermoon-glow" cx="50%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#e8b94f" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="420" fill="url(#ppapermoon-bg)" />
          <circle cx="150" cy="130" r="65" fill="url(#ppapermoon-glow)" />
          <circle cx="168" cy="125" r="58" fill="#140f06" opacity="0.85" />
          {/* Origami Cranes */}
          <g fill="#fef3c7" opacity="0.9">
            <polygon points="80,120 95,105 100,122 88,126" />
            <polygon points="210,110 225,95 230,112 218,116" />
          </g>
          {/* Title & Kanji */}
          <text x="270" y="55" fill="#e8b94f" opacity="0.35" fontFamily="'Shippori Mincho B1', serif" fontSize="40" textAnchor="end">紙月</text>
          <text x="20" y="380" className="art-title" style={{ fill: '#fef08a', fontFamily: "'Cinzel', serif", fontWeight: 'bold' }}>Paper Moon Society</text>
        </svg>
      );

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
          <circle cx="150" cy="170" r="85" fill="url(#pit-core)" />
          <circle cx="150" cy="170" r="70" fill="none" stroke="#a855f7" strokeWidth="4" strokeDasharray="10 8" opacity="0.6" />
          <circle cx="150" cy="170" r="46" fill="none" stroke="#c084fc" strokeWidth="3" opacity="0.8" />
          <circle cx="150" cy="170" r="14" fill="#f3e8ff" />
          <polygon points="0,320 60,300 120,330 180,310 240,292 270,316 300,300 300,420 0,420" fill="#080412" />
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
          <polygon points="0,200 80,140 150,180 230,110 300,160 300,420 0,420" fill="#140603" />
          <circle cx="150" cy="135" r="65" fill="url(#pnci-glow)" />
          <rect x="136" y="105" width="28" height="50" rx="4" fill="#c2410c" opacity="0.9" />
          <rect x="142" y="112" width="16" height="36" rx="2" fill="#ffedd5" opacity="0.95" />
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
          <circle cx="150" cy="180" r="80" fill="url(#pgh-glow)" />
          <path d="M70 280 Q 110 180 150 200 Q 200 170 230 280 Z" fill="#047857" opacity="0.85" />
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
          <circle cx="150" cy="160" r="75" fill="url(#psr-crt)" />
          <path
            d="M10 160 L60 160 L80 110 L100 210 L120 130 L140 190 L160 80 L180 240 L200 110 L220 190 L240 160 L290 160"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.95"
          />
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
