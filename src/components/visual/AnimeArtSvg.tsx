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
        <svg className={className} viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="kamui-art-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#080e18" />
              <stop offset="55%" stopColor="#122033" />
              <stop offset="100%" stopColor="#070c14" />
            </linearGradient>
            <radialGradient id="kamui-art-moon" cx="72%" cy="30%" r="45%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="40%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#e8b94f" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#c1501f" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="kamui-art-flame" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#9a3412" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="225" fill="url(#kamui-art-bg)" />
          {/* Golden Celestial Moon */}
          <circle cx="290" cy="65" r="46" fill="url(#kamui-art-moon)" />
          <circle cx="290" cy="65" r="62" fill="none" stroke="#e8b94f" strokeWidth="1" opacity="0.3" strokeDasharray="4 4" />
          {/* North Frost Mountain Ranges */}
          <polygon points="0,130 90,80 180,120 270,60 360,110 400,85 400,225 0,225" fill="#132338" opacity="0.8" />
          <polygon points="0,165 70,135 150,170 240,115 320,155 400,125 400,225 0,225" fill="#0d1827" />
          <polygon points="0,195 100,165 200,190 300,150 400,180 400,225 0,225" fill="#060b12" />
          {/* Sacred Torii Gate Silhouette */}
          <g fill="#c1501f" opacity="0.95">
            <rect x="70" y="105" width="8" height="60" rx="1" />
            <rect x="112" y="105" width="8" height="60" rx="1" />
            <rect x="58" y="105" width="74" height="8" rx="2" fill="#e8b94f" />
            <rect x="64" y="118" width="62" height="5" rx="1" />
          </g>
          {/* Exiled Wolf-God Silhouette */}
          <path
            d="M210 145 Q 230 115 260 120 Q 280 125 295 145 Q 285 165 260 160 Q 230 165 210 145 Z"
            fill="#e2e8f0"
            opacity="0.9"
          />
          <polygon points="285,125 295,105 305,128" fill="#e2e8f0" />
          <polygon points="275,122 282,108 290,125" fill="#e2e8f0" />
          <circle cx="292" cy="126" r="2.5" fill="#38bdf8" />
          {/* Shrine Bells & Embers */}
          <circle cx="95" cy="140" r="16" fill="url(#kamui-art-flame)" />
          <circle cx="95" cy="140" r="4" fill="#ffedd5" />
          <circle cx="160" cy="90" r="1.5" fill="#e0f2fe" opacity="0.9" />
          <circle cx="340" cy="130" r="2" fill="#fef08a" opacity="0.8" />
          <circle cx="45" cy="70" r="1.5" fill="#ffffff" opacity="0.75" />
          {/* Kanji Mark */}
          <text x="375" y="45" fill="#e8b94f" opacity="0.35" fontFamily="'Shippori Mincho B1', serif" fontSize="34" textAnchor="end">神威</text>
        </svg>
      );

    case 'ashfall-district':
      return (
        <svg className={className} viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="ashfall-art-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#081017" />
              <stop offset="50%" stopColor="#0f2330" />
              <stop offset="100%" stopColor="#04090d" />
            </linearGradient>
            <radialGradient id="ashfall-art-neon" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="225" fill="url(#ashfall-art-bg)" />
          {/* Cyberpunk Skyscrapers */}
          <rect x="40" y="50" width="45" height="175" fill="#091621" />
          <rect x="95" y="30" width="55" height="195" fill="#0d2131" />
          <rect x="160" y="70" width="60" height="155" fill="#08131d" />
          <rect x="230" y="20" width="65" height="205" fill="#0f273a" />
          <rect x="305" y="60" width="50" height="165" fill="#091824" />
          {/* Holographic Megastructure Beam */}
          <circle cx="200" cy="90" r="65" fill="url(#ashfall-art-neon)" />
          <line x1="200" y1="0" x2="200" y2="225" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
          {/* Glowing Windows & Neon Signs */}
          <g fill="#38bdf8" opacity="0.75">
            <rect x="105" y="50" width="6" height="10" />
            <rect x="118" y="50" width="6" height="10" />
            <rect x="105" y="70" width="6" height="10" />
            <rect x="118" y="70" width="6" height="10" fill="#f43f5e" />
            <rect x="245" y="40" width="8" height="12" fill="#fbbf24" />
            <rect x="260" y="40" width="8" height="12" />
            <rect x="245" y="65" width="8" height="12" fill="#38bdf8" />
            <rect x="260" y="65" width="8" height="12" fill="#f43f5e" />
          </g>
          {/* Cyber Grid Base & Scanlines */}
          <polygon points="0,170 200,140 400,170 400,225 0,225" fill="#03080c" />
          <line x1="0" y1="180" x2="400" y2="180" stroke="#0284c7" strokeWidth="1" opacity="0.5" />
          <line x1="0" y1="200" x2="400" y2="200" stroke="#0284c7" strokeWidth="1" opacity="0.7" />
          {/* Ash Particles */}
          <circle cx="80" cy="120" r="1.5" fill="#67e8f9" opacity="0.9" />
          <circle cx="150" cy="100" r="2" fill="#f43f5e" opacity="0.8" />
          <circle cx="280" cy="110" r="2" fill="#67e8f9" opacity="0.9" />
          <circle cx="340" cy="80" r="1.5" fill="#fbbf24" opacity="0.7" />
          {/* Kanji watermark */}
          <text x="375" y="45" fill="#38bdf8" opacity="0.3" fontFamily="'Shippori Mincho B1', serif" fontSize="34" textAnchor="end">灰降</text>
        </svg>
      );

    case 'paper-moon-society':
      return (
        <svg className={className} viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="papermoon-art-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#140f06" />
              <stop offset="50%" stopColor="#291e0a" />
              <stop offset="100%" stopColor="#0d0a03" />
            </linearGradient>
            <radialGradient id="papermoon-art-glow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#e8b94f" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="225" fill="url(#papermoon-art-bg)" />
          {/* Giant Paper Moon with Origami Texture */}
          <circle cx="200" cy="85" r="56" fill="url(#papermoon-art-glow)" />
          <circle cx="218" cy="80" r="50" fill="#140f06" opacity="0.85" />
          {/* Grand Victorian Conservatory Arches */}
          <g stroke="#e8b94f" strokeWidth="1.2" fill="none" opacity="0.35">
            <path d="M40 225 L40 90 Q200 10 360 90 L360 225" />
            <path d="M90 225 L90 120 Q200 50 310 120 L310 225" />
            <line x1="200" y1="30" x2="200" y2="225" />
          </g>
          {/* Floating Origami Cranes */}
          <g fill="#fef3c7" opacity="0.9">
            <polygon points="110,75 125,60 130,78 118,82" />
            <polygon points="280,65 295,50 300,68 288,72" />
            <polygon points="150,120 160,108 165,122 155,125" opacity="0.75" />
            <polygon points="245,130 255,118 260,132 250,135" opacity="0.75" />
          </g>
          {/* Golden Lantern Warm Glow */}
          <circle cx="80" cy="150" r="24" fill="#fbbf24" opacity="0.25" />
          <circle cx="320" cy="150" r="24" fill="#fbbf24" opacity="0.25" />
          {/* Library Floor Silhouette */}
          <polygon points="0,175 120,160 200,165 280,160 400,175 400,225 0,225" fill="#0a0802" />
          {/* Kanji watermark */}
          <text x="375" y="45" fill="#e8b94f" opacity="0.35" fontFamily="'Shippori Mincho B1', serif" fontSize="34" textAnchor="end">紙月</text>
        </svg>
      );

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
            <linearGradient id="it-trench" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2e1065" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0f051d" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect width="400" height="225" fill="url(#it-bg)" />
          {/* Deep ocean light beams */}
          <polygon points="120,0 200,0 260,225 90,225" fill="#a855f7" opacity="0.08" />
          <polygon points="220,0 310,0 390,225 240,225" fill="#38bdf8" opacity="0.06" />
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
          <path d="M0 60 Q 100 80 200 65 T 400 70 L 400 225 L 0 225 Z" fill="#1c0c07" opacity="0.6" />
          <polygon points="0,120 70,80 140,110 230,60 320,105 400,75 400,225 0,225" fill="#110704" />
          <circle cx="200" cy="95" r="55" fill="url(#nci-lantern)" />
          <rect x="188" y="70" width="24" height="42" rx="4" fill="#c2410c" opacity="0.9" />
          <rect x="193" y="75" width="14" height="32" rx="2" fill="#ffedd5" opacity="0.95" />
          <line x1="200" y1="55" x2="200" y2="70" stroke="#78350f" strokeWidth="2" />
          <path d="M90 60 Q 98 48 108 52 Q 103 62 90 60 Z" fill="#050201" />
          <path d="M120 45 Q 126 36 134 39 Q 130 47 120 45 Z" fill="#050201" />
          <path d="M290 50 Q 298 38 308 42 Q 303 52 290 50 Z" fill="#050201" />
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
          <g stroke="#34d399" strokeWidth="1" opacity="0.3">
            <line x1="200" y1="0" x2="200" y2="225" strokeWidth="2" />
            <line x1="0" y1="50" x2="400" y2="50" />
            <line x1="0" y1="120" x2="400" y2="120" />
            <line x1="100" y1="0" x2="100" y2="225" />
            <line x1="300" y1="0" x2="300" y2="225" />
            <path d="M0,0 L200,80 L400,0" fill="none" strokeWidth="1.5" />
          </g>
          <circle cx="200" cy="110" r="65" fill="url(#gh-glow)" />
          <path d="M120 180 Q 150 120 200 140 Q 250 110 280 180 Q 200 210 120 180 Z" fill="#047857" opacity="0.85" />
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
          <circle cx="200" cy="90" r="60" fill="url(#hm-sun)" />
          <circle cx="200" cy="90" r="70" fill="none" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
          <polygon points="0,150 90,130 180,155 270,125 350,150 400,135 400,225 0,225" fill="#1b0e06" />
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
          <circle cx="200" cy="110" r="60" fill="url(#sr-crt)" />
          <path
            d="M20 110 L80 110 L100 70 L120 150 L140 90 L160 130 L180 50 L200 170 L220 70 L240 140 L260 90 L280 120 L300 110 L380 110"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.95"
          />
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
          <path d="M0 40 Q 100 10 200 45 T 400 20 L 400 120 Q 300 90 200 110 T 0 90 Z" fill="url(#lt-aurora)" />
          <circle cx="110" cy="70" r="32" fill="#fbbf24" opacity="0.85" />
          <polygon points="0,150 80,95 160,140 240,80 320,130 400,90 400,225 0,225" fill="#0d1b2a" />
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
