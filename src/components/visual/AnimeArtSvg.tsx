import React from 'react';
import { ANIME_CATALOG } from '@/lib/catalog';

interface AnimeArtSvgProps {
  animeId: string;
  className?: string;
}

const COVER_IMAGES: Record<string, string> = {
  'kamui': '/covers/kamui.jpg',
  'ashfall-district': '/covers/ashfall-district.jpg',
  'paper-moon-society': '/covers/paper-moon-society.jpg',
};

export const AnimeArtSvg: React.FC<AnimeArtSvgProps> = ({ animeId, className = 'w-full h-full object-cover' }) => {
  const customCover = COVER_IMAGES[animeId];

  if (customCover) {
    return (
      <img
        src={customCover}
        alt={ANIME_CATALOG[animeId]?.title || animeId}
        className={className}
        loading="lazy"
      />
    );
  }

  switch (animeId) {
    case 'iron-tide':
      return (
        <svg className={className} viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="it-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#080614" />
              <stop offset="60%" stopColor="#170f2f" />
              <stop offset="100%" stopColor="#0a0518" />
            </linearGradient>
            <radialGradient id="it-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d8b4fe" stopOpacity="1" />
              <stop offset="40%" stopColor="#9333ea" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b0764" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="it-trench" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2e1065" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0f051d" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect width="400" height="225" fill="url(#it-bg)" />
          {/* Deep ocean light beams */}
          <polygon points="120,0 200,0 260,225 90,225" fill="#a855f7" opacity="0.08" />
          <polygon points="220,0 310,0 390,225 240,225" fill="#38bdf8" opacity="0.06" />
          {/* Bioluminescent particles */}
          <circle cx="60" cy="80" r="2" fill="#c084fc" opacity="0.8" />
          <circle cx="110" cy="140" r="1.5" fill="#38bdf8" opacity="0.7" />
          <circle cx="320" cy="60" r="2.5" fill="#c084fc" opacity="0.9" />
          <circle cx="280" cy="170" r="1.5" fill="#e9d5ff" opacity="0.6" />
          {/* Giant Mecha Core & HUD */}
          <circle cx="200" cy="100" r="75" fill="url(#it-core)" />
          <circle cx="200" cy="100" r="60" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
          <circle cx="200" cy="100" r="38" fill="none" stroke="#c084fc" strokeWidth="3" opacity="0.8" />
          <circle cx="200" cy="100" r="12" fill="#f3e8ff" />
          {/* Mechanical Frame Silhouettes */}
          <polygon points="170,80 185,60 215,60 230,80 220,120 180,120" fill="#1e1035" opacity="0.9" />
          <line x1="120" y1="100" x2="160" y2="100" stroke="#c084fc" strokeWidth="2" opacity="0.8" />
          <line x1="240" y1="100" x2="280" y2="100" stroke="#c084fc" strokeWidth="2" opacity="0.8" />
          {/* Trench sea floor */}
          <polygon points="0,170 80,150 160,180 250,140 330,175 400,155 400,225 0,225" fill="url(#it-trench)" />
          {/* Kanji watermark */}
          <text x="375" y="45" fill="#9333ea" opacity="0.25" fontFamily="'Shippori Mincho B1', serif" fontSize="36" textAnchor="end">鉄潮</text>
        </svg>
      );

    case 'nine-crows-inn':
      return (
        <svg className={className} viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="nci-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#140905" />
              <stop offset="50%" stopColor="#260f08" />
              <stop offset="100%" stopColor="#0d0503" />
            </linearGradient>
            <radialGradient id="nci-lantern" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="40%" stopColor="#ea580c" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="225" fill="url(#nci-bg)" />
          {/* Fog & Snow layers */}
          <path d="M0 60 Q 100 80 200 65 T 400 70 L 400 225 L 0 225 Z" fill="#1c0c07" opacity="0.6" />
          {/* Mountain Pass Silhouette */}
          <polygon points="0,120 70,80 140,110 230,60 320,105 400,75 400,225 0,225" fill="#110704" />
          {/* Glowing Red Torii / Traditional Inn Lantern */}
          <circle cx="200" cy="95" r="55" fill="url(#nci-lantern)" />
          <rect x="188" y="70" width="24" height="42" rx="4" fill="#c2410c" opacity="0.9" />
          <rect x="193" y="75" width="14" height="32" rx="2" fill="#ffedd5" opacity="0.95" />
          <line x1="200" y1="55" x2="200" y2="70" stroke="#78350f" strokeWidth="2" />
          {/* Flying Crows Silhouettes */}
          <path d="M90 60 Q 98 48 108 52 Q 103 62 90 60 Z" fill="#050201" />
          <path d="M120 45 Q 126 36 134 39 Q 130 47 120 45 Z" fill="#050201" />
          <path d="M290 50 Q 298 38 308 42 Q 303 52 290 50 Z" fill="#050201" />
          <path d="M330 70 Q 337 60 345 63 Q 341 71 330 70 Z" fill="#050201" />
          {/* Blizzard flakes */}
          <circle cx="50" cy="90" r="1.5" fill="#ffedd5" opacity="0.8" />
          <circle cx="150" cy="130" r="2" fill="#ffedd5" opacity="0.9" />
          <circle cx="260" cy="80" r="1.5" fill="#ffedd5" opacity="0.7" />
          <circle cx="340" cy="140" r="2" fill="#ffedd5" opacity="0.8" />
          {/* Kanji watermark */}
          <text x="375" y="45" fill="#ea580c" opacity="0.25" fontFamily="'Shippori Mincho B1', serif" fontSize="36" textAnchor="end">九烏</text>
        </svg>
      );

    case 'glasshouse':
      return (
        <svg className={className} viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="gh-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#041812" />
              <stop offset="60%" stopColor="#093024" />
              <stop offset="100%" stopColor="#02130e" />
            </linearGradient>
            <radialGradient id="gh-glow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="225" fill="url(#gh-bg)" />
          {/* Greenhouse Glass Cathedral Framework */}
          <g stroke="#34d399" strokeWidth="1" opacity="0.3">
            <line x1="200" y1="0" x2="200" y2="225" strokeWidth="2" />
            <line x1="0" y1="50" x2="400" y2="50" />
            <line x1="0" y1="120" x2="400" y2="120" />
            <line x1="100" y1="0" x2="100" y2="225" />
            <line x1="300" y1="0" x2="300" y2="225" />
            <path d="M0,0 L200,80 L400,0" fill="none" strokeWidth="1.5" />
            <path d="M0,80 L200,140 L400,80" fill="none" strokeWidth="1.5" />
          </g>
          {/* Lush glowing botanical foliage */}
          <circle cx="200" cy="110" r="65" fill="url(#gh-glow)" />
          <path d="M120 180 Q 150 120 200 140 Q 250 110 280 180 Q 200 210 120 180 Z" fill="#047857" opacity="0.85" />
          <path d="M160 200 Q 200 150 240 200 Z" fill="#10b981" opacity="0.9" />
          {/* Rose/Flora Petals & Frost sparkles */}
          <circle cx="180" cy="130" r="3" fill="#f43f5e" opacity="0.8" />
          <circle cx="220" cy="120" r="3" fill="#fb7185" opacity="0.9" />
          <circle cx="195" cy="105" r="2" fill="#a7f3d0" opacity="0.9" />
          <circle cx="250" cy="140" r="2.5" fill="#f43f5e" opacity="0.75" />
          {/* Kanji watermark */}
          <text x="375" y="45" fill="#10b981" opacity="0.25" fontFamily="'Shippori Mincho B1', serif" fontSize="36" textAnchor="end">温室</text>
        </svg>
      );

    case 'hollow-meridian':
      return (
        <svg className={className} viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="hm-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#180e06" />
              <stop offset="60%" stopColor="#2d1a0b" />
              <stop offset="100%" stopColor="#100904" />
            </linearGradient>
            <radialGradient id="hm-sun" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f97316" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="225" fill="url(#hm-bg)" />
          {/* Grand shifting landscape */}
          <circle cx="200" cy="90" r="60" fill="url(#hm-sun)" />
          {/* Astrolabe / Celestial Meridian Rings */}
          <circle cx="200" cy="90" r="70" fill="none" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
          <line x1="200" y1="10" x2="200" y2="170" stroke="#f97316" strokeWidth="1" opacity="0.5" />
          <line x1="120" y1="90" x2="280" y2="90" stroke="#f97316" strokeWidth="1" opacity="0.5" />
          <polygon points="200,45 208,90 200,135 192,90" fill="#fed7aa" opacity="0.9" />
          {/* Shifting horizon cliffs */}
          <polygon points="0,150 90,130 180,155 270,125 350,150 400,135 400,225 0,225" fill="#1b0e06" />
          <polygon points="0,180 120,165 240,185 400,160 400,225 0,225" fill="#0d0703" />
          {/* Kanji watermark */}
          <text x="375" y="45" fill="#f97316" opacity="0.25" fontFamily="'Shippori Mincho B1', serif" fontSize="36" textAnchor="end">子午</text>
        </svg>
      );

    case 'static-requiem':
      return (
        <svg className={className} viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sr-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#081014" />
              <stop offset="50%" stopColor="#0d212a" />
              <stop offset="100%" stopColor="#050a0d" />
            </linearGradient>
            <radialGradient id="sr-crt" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="225" fill="url(#sr-bg)" />
          {/* Scanlines effect */}
          <g stroke="#38bdf8" strokeWidth="0.5" opacity="0.12">
            {Array.from({ length: 18 }).map((_, i) => (
              <line key={i} x1="0" y1={i * 13} x2="400" y2={i * 13} />
            ))}
          </g>
          {/* Oscilloscope Glowing Waveform */}
          <circle cx="200" cy="110" r="60" fill="url(#sr-crt)" />
          <path
            d="M20 110 L80 110 L100 70 L120 150 L140 90 L160 130 L180 50 L200 170 L220 70 L240 140 L260 90 L280 120 L300 110 L380 110"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.95"
          />
          {/* Transmitter Tower Silhouette */}
          <polygon points="195,30 205,30 215,225 185,225" fill="#040d12" opacity="0.7" />
          <line x1="170" y1="60" x2="230" y2="60" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
          <line x1="160" y1="90" x2="240" y2="90" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5" />
          {/* Kanji watermark */}
          <text x="375" y="45" fill="#38bdf8" opacity="0.25" fontFamily="'Shippori Mincho B1', serif" fontSize="36" textAnchor="end">雑音</text>
        </svg>
      );

    case 'long-thaw':
      return (
        <svg className={className} viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="lt-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#08111a" />
              <stop offset="50%" stopColor="#0f2133" />
              <stop offset="100%" stopColor="#060c14" />
            </linearGradient>
            <radialGradient id="lt-aurora" cx="50%" cy="20%" r="60%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="225" fill="url(#lt-bg)" />
          {/* Aurora Borealis ribbon */}
          <path d="M0 40 Q 100 10 200 45 T 400 20 L 400 120 Q 300 90 200 110 T 0 90 Z" fill="url(#lt-aurora)" />
          {/* Golden Sun breaking through glacier */}
          <circle cx="110" cy="70" r="32" fill="#fbbf24" opacity="0.85" />
          <circle cx="110" cy="70" r="50" fill="#fbbf24" opacity="0.15" />
          {/* Glacial Ice Peaks */}
          <polygon points="0,150 80,95 160,140 240,80 320,130 400,90 400,225 0,225" fill="#0d1b2a" />
          <polygon points="0,180 100,145 200,175 300,140 400,170 400,225 0,225" fill="#070e17" />
          {/* Sacred ice crystalline sparkles */}
          <circle cx="90" cy="115" r="2" fill="#e0f2fe" opacity="0.9" />
          <circle cx="230" cy="100" r="2.5" fill="#fef08a" opacity="0.85" />
          <circle cx="310" cy="140" r="1.5" fill="#e0f2fe" opacity="0.75" />
          {/* Kanji watermark */}
          <text x="375" y="45" fill="#67e8f9" opacity="0.25" fontFamily="'Shippori Mincho B1', serif" fontSize="36" textAnchor="end">雪解</text>
        </svg>
      );

    default:
      return (
        <svg className={className} viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="225" fill="#101522" />
          <circle cx="200" cy="100" r="50" fill="#e8b94f" opacity="0.5" />
          <text x="50%" y="85%" textAnchor="middle" fill="#ffffff" fontFamily="'Cinzel', serif" fontSize="16">
            {ANIME_CATALOG[animeId]?.title || animeId}
          </text>
        </svg>
      );
  }
};

