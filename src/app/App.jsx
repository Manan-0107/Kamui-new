import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Search,
  Bell,
  Star,
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Info,
  Clock,
  Heart,
  Flame,
  Eye,
  Sparkles
} from "lucide-react";
import KamuiEye from "./components/KamuiEye.jsx";

const PARTICLES = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  x: 4 + (i * 3.9) % 92,
  y: 4 + (i * 7.3) % 90,
  size: 1 + (i % 3),
  duration: 3.5 + (i % 5),
  delay: (i * 0.3) % 4.5
}));

const TICKER_ITEMS = [
  "👁️ KAMUI SPACE-TIME · Naruto Shippuden Ep 375 (Kakashi vs Obito) 4K Remastered",
  "🔥 Jujutsu Kaisen S2 EP23 Shibuya Climax streaming now",
  "⚡ 1.6M Shinobi watching Bleach: Thousand-Year Blood War",
  "🆕 Demon Slayer: Hashira Training Arc EP8 just dropped",
  "⭐ Solo Leveling Season 2 officially confirmed",
  "🎌 Attack on Titan Final Chapter available in Ultra HD",
  "🆕 Chainsaw Man: Reze Arc Movie teaser premiering tonight",
  "💀 Berserk 1997 Memorial Edition now uncensored"
];

const GLOBAL_CSS = `
  @keyframes float-up {
    0%   { transform: translateY(0px) scale(1);    opacity: 0; }
    15%  { opacity: 0.85; }
    85%  { opacity: 0.45; }
    100% { transform: translateY(-120px) scale(0.3); opacity: 0; }
  }
  @keyframes marquee-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes sharingan-pulse {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(229, 9, 20, 0.6), 0 0 35px rgba(229, 9, 20, 0.2); 
    }
    50% { 
      box-shadow: 0 0 38px rgba(229, 9, 20, 0.95), 0 0 65px rgba(255, 42, 85, 0.55), 0 0 90px rgba(180, 0, 30, 0.35); 
    }
  }
  @keyframes twinkle-dim {
    0%, 100% { opacity: 0.18; }
    50%      { opacity: 0.03; }
  }
  @keyframes twinkle-mid {
    0%, 100% { opacity: 0.55; }
    40%      { opacity: 0.1;  }
    80%      { opacity: 0.7;  }
  }
  @keyframes twinkle-bright {
    0%, 100% { opacity: 0.88; }
    25%      { opacity: 0.2;  }
    60%      { opacity: 1;    }
  }
  @keyframes kamui-vortex-breathe {
    0%, 100% { transform: translate(-50%,-50%) scale(1) rotate(0deg);    opacity: 0.7; }
    50%      { transform: translate(-50%,-50%) scale(1.12) rotate(12deg); opacity: 1;   }
  }
  @keyframes kamui-teleport-shoot {
    0%   { transform: rotate(-32deg) translateX(0);      opacity: 0; width: 0px;  }
    4%   { opacity: 1;  width: 60px; }
    96%  { opacity: 0.5; }
    100% { transform: rotate(-32deg) translateX(-600px); opacity: 0; width: 0px;  }
  }
  .pulse-btn     { animation: sharingan-pulse 2.2s ease-in-out infinite; }
  .marquee-track { animation: marquee-scroll 32s linear infinite; }
  .marquee-track:hover { animation-play-state: paused; }
  .shoot-a { animation: kamui-teleport-shoot 9s  2s  linear infinite; }
  .shoot-b { animation: kamui-teleport-shoot 9s  11s linear infinite; }
  .shoot-c { animation: kamui-teleport-shoot 9s  20s linear infinite; }
`;

const STARS_DATA = [
  ...Array.from({ length: 90 }, (_, i) => ({ id: `d${i}`, x: (i * 7.31 + 2.1) % 100, y: (i * 11.73 + 5.4) % 100, size: 1, cls: "twinkle-dim", dur: 2 + (i % 6), delay: (i * 0.41) % 7 })),
  ...Array.from({ length: 50 }, (_, i) => ({ id: `m${i}`, x: (i * 13.1 + 8.3) % 100, y: (i * 9.43 + 15.2) % 100, size: 1.5, cls: "twinkle-mid", dur: 3 + (i % 5), delay: (i * 0.63 + 1) % 8 })),
  ...Array.from({ length: 22 }, (_, i) => ({ id: `b${i}`, x: (i * 19.7 + 12.6) % 100, y: (i * 15.3 + 8.1) % 100, size: 2, cls: "twinkle-bright", dur: 2 + (i % 4), delay: (i * 0.8) % 5 })),
  ...Array.from({ length: 7 }, (_, i) => ({ id: `s${i}`, x: (i * 31.4 + 20.5) % 100, y: (i * 27.1 + 18.3) % 100, size: 2.5, cls: "twinkle-bright", dur: 1.5 + (i % 3), delay: (i * 1.2) % 4 }))
];

const NEBULAS_DATA = [
  { id: "na", color: "229, 9, 20", x: 10, y: 20, w: 560, h: 400, blur: 140, dur: 16 },
  { id: "nb", color: "255, 42, 85", x: 74, y: 55, w: 500, h: 440, blur: 125, dur: 20 },
  { id: "nc", color: "139, 0, 20", x: 38, y: 78, w: 660, h: 360, blur: 160, dur: 24 },
  { id: "nd", color: "220, 20, 60", x: 92, y: 12, w: 420, h: 440, blur: 110, dur: 18 }
];

const GENRES = ["All", "Shounen", "Action", "Supernatural", "Dark Fantasy", "Sci-Fi", "Psychological", "Horror", "Adventure"];

const FEATURED_SHOWS = [
  {
    title: "Naruto Shippuden",
    subtitle: "The Fourth Great Ninja War — Kamui Dimension",
    description: "Kakashi Hatake and Obito Uchiha clash in the isolated Kamui dimension. Two former comrades bound by a single Sharingan eye fight for the destiny of the entire Shinobi world.",
    tags: ["Shounen", "Action", "Supernatural", "Kamui"],
    rating: 9.9,
    year: 2024,
    episodes: 500,
    studio: "Pierrot",
    viewers: 1789420,
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&h=900&fit=crop&auto=format",
    accentColor: "#e50914"
  },
  {
    title: "Jujutsu Kaisen",
    subtitle: "Season 2 — Shibuya Incident Climax",
    description: "The Shibuya Incident erupts into an all-out apocalyptic battle. Sukuna unleashes his Malevolent Shrine while sorcerers risk everything against the ultimate curse.",
    tags: ["Action", "Supernatural", "Dark Fantasy"],
    rating: 9.2,
    year: 2023,
    episodes: 47,
    studio: "MAPPA",
    viewers: 1245890,
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&h=900&fit=crop&auto=format",
    accentColor: "#ff2a55"
  },
  {
    title: "Demon Slayer",
    subtitle: "Hashira Training & Infinity Castle",
    description: "Tanjiro Kamado and the Demon Slayer Corps cross into the dimensional labyrinth of the Infinity Castle for the final war against Muzan Kibutsuji.",
    tags: ["Action", "Adventure", "Supernatural"],
    rating: 9.4,
    year: 2024,
    episodes: 8,
    studio: "ufotable",
    viewers: 1420110,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&h=900&fit=crop&auto=format",
    accentColor: "#ff1e46"
  },
  {
    title: "Bleach: TYBW",
    subtitle: "The Thousand-Year Blood War — Part 3",
    description: "The Soul Society teeters on collapse as Ichigo Kurosaki and the Shinigami Captains face the Quincy King Yhwach in a clash of divine reiatsu.",
    tags: ["Action", "Supernatural", "Shounen"],
    rating: 9.1,
    year: 2024,
    episodes: 13,
    studio: "Pierrot",
    viewers: 994230,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&h=900&fit=crop&auto=format",
    accentColor: "#dc2626"
  }
];

const ALL_ANIME = [
  { id: 1, title: "Naruto Shippuden", sub: "War Arc", genre: "Shounen", rating: 9.9, badge: "KAMUI 4K", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=560&fit=crop&auto=format" },
  { id: 2, title: "Jujutsu Kaisen", sub: "Season 2", genre: "Action", rating: 9.2, badge: "EP 23 NEW", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&h=560&fit=crop&auto=format" },
  { id: 3, title: "Demon Slayer", sub: "Hashira Training", genre: "Action", rating: 9.4, badge: "EP 8 NEW", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=560&fit=crop&auto=format" },
  { id: 4, title: "Bleach: TYBW", sub: "Part 3", genre: "Shounen", rating: 9.1, badge: "EP 13 NEW", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=560&fit=crop&auto=format" },
  { id: 5, title: "Hunter x Hunter", sub: "Chimera Ant", genre: "Shounen", rating: 9.9, badge: null, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=560&fit=crop&auto=format" },
  { id: 6, title: "Attack on Titan", sub: "Final Season", genre: "Dark Fantasy", rating: 9.9, badge: null, image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=560&fit=crop&auto=format" },
  { id: 7, title: "Chainsaw Man", sub: "Season 1", genre: "Dark Fantasy", rating: 8.9, badge: null, image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=560&fit=crop&auto=format" },
  { id: 8, title: "Solo Leveling", sub: "Season 1", genre: "Action", rating: 9.0, badge: "NEW", image: "https://images.unsplash.com/photo-1533240332153-8b3bf4c0f0d5?w=400&h=560&fit=crop&auto=format" },
  { id: 9, title: "Tokyo Ghoul", sub: "Root A", genre: "Horror", rating: 8.1, badge: null, image: "https://images.unsplash.com/photo-1492515114975-b062d1a270ae?w=400&h=560&fit=crop&auto=format" },
  { id: 10, title: "Steins;Gate", sub: "Season 1", genre: "Sci-Fi", rating: 9.1, badge: null, image: "https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?w=400&h=560&fit=crop&auto=format" },
  { id: 11, title: "Death Note", sub: "Complete Series", genre: "Psychological", rating: 9.0, badge: null, image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=560&fit=crop&auto=format" },
  { id: 12, title: "Berserk", sub: "Memorial Edition", genre: "Dark Fantasy", rating: 9.3, badge: "18+ UNCUT", image: "https://images.unsplash.com/photo-1574375927818-6e7b3dd63d83?w=400&h=560&fit=crop&auto=format" },
  { id: 13, title: "Fullmetal Alchemist", sub: "Brotherhood", genre: "Action", rating: 9.2, badge: null, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=560&fit=crop&auto=format" },
  { id: 14, title: "Vinland Saga", sub: "Season 2", genre: "Action", rating: 9.0, badge: null, image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=560&fit=crop&auto=format" },
  { id: 15, title: "One Piece", sub: "Egghead Arc", genre: "Adventure", rating: 9.3, badge: "NEW", image: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=560&fit=crop&auto=format" }
];

const TRENDING = ALL_ANIME.slice(0, 7);

const CONTINUE_WATCHING = [
  { id: 1, title: "Naruto Shippuden", sub: "Episode 375", ep: "Kakashi vs. Obito — The Final Bond", progress: 78, image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&h=300&fit=crop&auto=format" },
  { id: 2, title: "Jujutsu Kaisen", sub: "Season 2", ep: "Episode 23 — Right and Wrong", progress: 92, image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&h=300&fit=crop&auto=format" },
  { id: 3, title: "Demon Slayer", sub: "Hashira Training", ep: "Episode 8 — The Hashira Assemble", progress: 45, image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&h=300&fit=crop&auto=format" },
  { id: 4, title: "Bleach: TYBW", sub: "Part 3", ep: "Episode 13 — The Dark Arm", progress: 30, image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&h=300&fit=crop&auto=format" }
];

const TOP_RATED = [
  { id: 1, title: "Naruto Shippuden", genre: "Shounen / Shinobi War", year: 2017, rating: 9.92, views: "82.4M", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=120&h=160&fit=crop&auto=format" },
  { id: 2, title: "Hunter x Hunter (2011)", genre: "Action / Supernatural", year: 2011, rating: 9.04, views: "39.1M", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=120&h=160&fit=crop&auto=format" },
  { id: 3, title: "Fullmetal Alchemist: Brotherhood", genre: "Action / Adventure", year: 2009, rating: 9.12, views: "48.2M", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=160&fit=crop&auto=format" },
  { id: 4, title: "Steins;Gate", genre: "Sci-Fi / Thriller", year: 2011, rating: 9.07, views: "31.7M", image: "https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?w=120&h=160&fit=crop&auto=format" },
  { id: 5, title: "Vinland Saga", genre: "Historical / Action", year: 2019, rating: 8.97, views: "18.9M", image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=120&h=160&fit=crop&auto=format" }
];

function LiveViewers({ base }) {
  const [count, setCount] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => Math.max(0, c + Math.floor(Math.random() * 80) - 35)), 2200);
    return () => clearInterval(id);
  }, []);
  return <span>{count.toLocaleString()}</span>;
}

function AnimatedBar({ progress }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(progress), 450);
    return () => clearTimeout(t);
  }, [progress]);
  return (
    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(229,9,20,0.85)]" style={{ width: `${w}%` }} />
    </div>
  );
}

function HeroParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.id % 3 === 0 ? "rgba(229,9,20,0.85)" : p.id % 3 === 1 ? "rgba(255,42,85,0.75)" : "rgba(255,255,255,0.4)",
            boxShadow: p.id % 2 === 0 ? "0 0 6px rgba(229,9,20,0.9)" : "none",
            animation: `float-up ${p.duration}s ${p.delay}s infinite linear`
          }}
        />
      ))}
    </div>
  );
}

function Starfield() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {NEBULAS_DATA.map((n) => (
        <div
          key={n.id}
          className="absolute rounded-full"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: n.w,
            height: n.h,
            background: `rgba(${n.color},0.16)`,
            filter: `blur(${n.blur}px)`,
            transform: "translate(-50%,-50%)",
            animation: `kamui-vortex-breathe ${n.dur}s ease-in-out infinite`
          }}
        />
      ))}
      {STARS_DATA.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animation: `${s.cls} ${s.dur}s ${s.delay}s ease-in-out infinite`
          }}
        />
      ))}
      {[
        { cls: "shoot-a", top: "12%", right: "16%" },
        { cls: "shoot-b", top: "26%", right: "44%" },
        { cls: "shoot-c", top: "6%", right: "68%" }
      ].map((ss) => (
        <div
          key={ss.cls}
          className={`absolute h-[1.5px] rounded-full ${ss.cls}`}
          style={{
            top: ss.top,
            right: ss.right,
            background: "linear-gradient(to left, rgba(255,42,85,0.95), transparent)",
            boxShadow: "0 0 6px rgba(229,9,20,0.8)",
            transformOrigin: "right center"
          }}
        />
      ))}
    </div>
  );
}

function MarqueeTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative bg-secondary/70 border-y border-border overflow-hidden py-2.5 backdrop-blur-md shadow-[0_0_20px_rgba(229,9,20,0.1)]">
      <div className="flex gap-0 marquee-track whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-6 px-6 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-default">
            {item}
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block shadow-[0_0_8px_rgba(229,9,20,0.9)]" />
          </span>
        ))}
      </div>
    </div>
  );
}

function PortraitCard({ item, index = 0 }) {
  const [liked, setLiked] = useState(false);
  return (
    <motion.div
      className="relative flex-none w-40 sm:w-44 rounded-xl overflow-hidden cursor-pointer group border border-border/40 hover:border-primary/80 transition-all duration-300 shadow-xl shadow-black/60 hover:shadow-[0_0_20px_rgba(229,9,20,0.35)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
    >
      <div className="bg-card aspect-[2/3]">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050408] via-[#050408]/30 to-transparent" />

      {item.badge && (
        <motion.div
          className="absolute top-2 left-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-wide shadow-[0_0_12px_rgba(229,9,20,0.8)] border border-red-400/40"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          {item.badge}
        </motion.div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          setLiked((l) => !l);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1.5 rounded-full backdrop-blur-sm"
      >
        <Heart className={`w-3.5 h-3.5 transition-colors drop-shadow-md ${liked ? "text-primary fill-primary" : "text-white"}`} />
      </button>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-red-600/80 scale-90 group-hover:scale-100 transition-transform duration-300 border border-red-400/50">
          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-bold text-sm leading-tight tracking-wide group-hover:text-red-400 transition-colors truncate" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{item.title}</p>
        <p className="text-muted-foreground text-xs mt-0.5 truncate">{item.sub}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Star className="w-3 h-3 text-red-500 fill-red-500 drop-shadow-[0_0_4px_rgba(229,9,20,0.8)]" />
          <span className="text-red-400 text-xs font-bold">{item.rating}</span>
          <span className="text-muted-foreground/70 text-xs">· {item.genre}</span>
        </div>
      </div>
    </motion.div>
  );
}

function LandscapeCard({ item }) {
  return (
    <motion.div
      className="relative flex-none w-64 sm:w-72 rounded-xl overflow-hidden cursor-pointer group border border-border/40 hover:border-primary/80 transition-all duration-300 shadow-xl shadow-black/60 hover:shadow-[0_0_20px_rgba(229,9,20,0.35)]"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="bg-card aspect-video">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050408] via-[#050408]/30 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-red-600/80 border border-red-400/50">
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-bold text-sm tracking-wide group-hover:text-red-400 transition-colors" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{item.title}</p>
        <p className="text-muted-foreground text-xs mt-0.5 truncate">{item.ep}</p>
        <AnimatedBar progress={item.progress} />
        <p className="text-muted-foreground/80 text-xs mt-1 font-medium">{item.progress}% complete</p>
      </div>
    </motion.div>
  );
}

function ScrollRow({ title, icon, children }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-primary drop-shadow-[0_0_10px_rgba(229,9,20,0.8)]">{icon}</span>}
          <h2 className="text-2xl font-extrabold text-foreground tracking-wide" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center hover:border-primary/80 hover:bg-primary/20 hover:text-primary transition-all">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center hover:border-primary/80 hover:bg-primary/20 hover:text-primary transition-all">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
          <button className="text-primary text-xs font-bold tracking-wide uppercase hover:text-red-400 transition-colors flex items-center gap-1 ml-2">
            See all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {children}
      </div>
    </section>
  );
}

function Nav({ onSearch, searchQuery }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-colors"
      animate={{
        backgroundColor: scrolled ? "rgba(5,4,8,0.96)" : "rgba(0,0,0,0.35)",
        borderBottomColor: scrolled ? "rgba(229,9,20,0.3)" : "rgba(229,9,20,0.08)",
        backdropFilter: scrolled ? "blur(20px)" : "blur(8px)"
      }}
      transition={{ duration: 0.3 }}
      style={{ borderBottomWidth: 1, borderBottomStyle: "solid" }}
    >
      <div className="px-6 lg:px-16 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          {/* Brand Logo with Kamui Mangekyo Sharingan integrated */}
          <motion.div className="flex items-center cursor-pointer group" whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 400 }}>
            <div className="flex items-center tracking-[0.14em] font-extrabold text-3xl select-none" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
              <span className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">K</span>
              <span className="inline-flex items-center justify-center mx-[2px] relative transform translate-y-[-1px]">
                <KamuiEye size={25} className="group-hover:rotate-[360deg] transition-transform duration-700 ease-out" />
              </span>
              <span className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">MUI</span>
            </div>
            <span className="ml-2.5 text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(229,9,20,0.5)] hidden sm:block">
              STREAM
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-7 text-sm font-semibold">
            {["Home", "Browse", "Movies", "Schedule", "My List"].map((link) => (
              <a key={link} href="#" className={`transition-colors relative group py-1 ${link === "Home" ? "text-white font-bold" : "text-zinc-300/80 hover:text-red-400"}`}>
                {link}
                <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-400 transition-all duration-300 ${link === "Home" ? "w-full shadow-[0_0_10px_rgba(229,9,20,0.9)]" : "w-0 group-hover:w-full shadow-[0_0_8px_rgba(229,9,20,0.7)]"}`} />
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.div
                key="open"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="flex items-center bg-black/90 border border-red-500/60 rounded-full px-4 py-1.5 gap-2 backdrop-blur-md shadow-[0_0_15px_rgba(229,9,20,0.35)] overflow-hidden"
              >
                <Search className="w-4 h-4 text-red-400 flex-none" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search anime..."
                  className="bg-transparent text-sm outline-none w-full text-white placeholder:text-zinc-500"
                  onBlur={() => {
                    setSearchOpen(false);
                    onSearch("");
                  }}
                />
              </motion.div>
            ) : (
              <motion.button
                key="closed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 rounded-full bg-black/60 hover:bg-red-950/60 border border-red-900/40 hover:border-red-500/60 flex items-center justify-center transition-all duration-200 backdrop-blur-sm text-zinc-300 hover:text-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              >
                <Search className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          <button className="w-9 h-9 rounded-full bg-black/60 hover:bg-red-950/60 border border-red-900/40 hover:border-red-500/60 flex items-center justify-center transition-all duration-200 backdrop-blur-sm relative text-zinc-300 hover:text-white shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            <Bell className="w-4 h-4" />
            <motion.span
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(229,9,20,1)]"
              animate={{ scale: [1, 1.45, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            />
          </button>

          {/* Profile with Sharingan Eye Avatar Ring */}
          <motion.div
            className="w-8 h-8 rounded-full bg-black border border-red-500/80 shadow-[0_0_12px_rgba(229,9,20,0.6)] flex items-center justify-center cursor-pointer select-none p-0.5 relative group"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.93 }}
          >
            <KamuiEye size={26} className="group-hover:rotate-[360deg] transition-transform duration-700" />
          </motion.div>

          <button className="md:hidden ml-1 text-zinc-300 hover:text-red-400 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-b border-red-900/40 px-6 py-5 flex flex-col gap-4 overflow-hidden shadow-2xl"
          >
            {["Home", "Browse", "Movies", "Schedule", "My List"].map((link) => (
              <a key={link} href="#" className={`text-sm font-semibold transition-all py-1 ${link === "Home" ? "text-red-400 font-bold" : "text-zinc-300/80 hover:text-red-300 hover:pl-2"}`} onClick={() => setMenuOpen(false)}>
                {link}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function Hero() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const show = FEATURED_SHOWS[idx];
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % FEATURED_SHOWS.length), 7e3);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="relative h-screen min-h-[640px] max-h-[940px] flex items-end"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={idx}
          className="absolute inset-0 bg-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
        >
          <img src={show.image} alt={show.title} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(105deg,rgba(5,4,8,0.97) 0%,rgba(5,4,8,0.65) 45%,rgba(5,4,8,0.18) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(5,4,8,1) 0%,rgba(5,4,8,0.25) 45%,transparent 70%)" }} />
        </motion.div>
      </AnimatePresence>

      <HeroParticles />

      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.16] blur-[85px] pointer-events-none transition-all duration-1000"
        style={{ background: show.accentColor }}
      />

      <div className="absolute bottom-8 right-8 lg:right-16 flex gap-2 z-20">
        {FEATURED_SHOWS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="relative h-1 rounded-full overflow-hidden transition-all duration-300"
            style={{ width: i === idx ? 32 : 12, background: "rgba(255,255,255,0.18)" }}
          >
            {i === idx && (
              <motion.div
                className="absolute inset-0 rounded-full shadow-[0_0_10px_rgba(229,9,20,0.9)]"
                style={{ background: show.accentColor }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: paused ? 0 : 7, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => setIdx((i) => (i - 1 + FEATURED_SHOWS.length) % FEATURED_SHOWS.length)}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 border border-red-500/30 flex items-center justify-center hover:bg-red-950/70 hover:border-red-500/60 backdrop-blur-sm transition-all shadow-[0_0_12px_rgba(0,0,0,0.6)]"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={() => setIdx((i) => (i + 1) % FEATURED_SHOWS.length)}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 border border-red-500/30 flex items-center justify-center hover:bg-red-950/70 hover:border-red-500/60 backdrop-blur-sm transition-all shadow-[0_0_12px_rgba(0,0,0,0.6)]"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      <div className="absolute top-24 right-8 lg:right-16 hidden lg:flex flex-col gap-2 z-20">
        {FEATURED_SHOWS.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => setIdx(i)}
            className="relative w-20 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300"
            style={{ borderColor: i === idx ? show.accentColor : "rgba(255,255,255,0.1)", opacity: i === idx ? 1 : 0.4 }}
            whileHover={{ opacity: 1, scale: 1.06 }}
          >
            <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          className="relative z-10 px-6 lg:px-16 pb-16 lg:pb-20 max-w-2xl"
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 18 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="flex items-center gap-2 mb-4"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2.2 }}
          >
            <span className="w-2 h-2 rounded-full inline-block shadow-[0_0_8px_rgba(229,9,20,1)]" style={{ background: show.accentColor }} />
            <span className="text-xs font-extrabold tracking-widest uppercase" style={{ color: show.accentColor }}>Trending #1 This Week</span>
          </motion.div>

          <h1 className="text-6xl lg:text-8xl font-black text-white leading-none mb-2 tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            {show.title}
          </h1>
          <p className="font-bold text-lg mb-4 tracking-wide" style={{ color: show.accentColor }}>{show.subtitle}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-red-500 fill-red-500 drop-shadow-[0_0_6px_rgba(229,9,20,0.9)]" />
              <span className="text-red-400 font-bold text-base">{show.rating}</span>
            </div>
            <span className="text-red-950">|</span>
            <span className="text-muted-foreground">{show.year}</span>
            <span className="text-red-950">|</span>
            <span className="text-muted-foreground">{show.episodes} Episodes</span>
            <span className="text-red-950">|</span>
            <span className="text-muted-foreground">{show.studio}</span>
            <span className="text-red-950">|</span>
            <span className="flex items-center gap-1 text-red-400 font-semibold">
              <Eye className="w-3.5 h-3.5" />
              <LiveViewers base={show.viewers} /> watching
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {show.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 border rounded-full font-semibold backdrop-blur-sm shadow-[0_0_8px_rgba(229,9,20,0.2)]"
                style={{ borderColor: `${show.accentColor}55`, color: show.accentColor, background: `${show.accentColor}18` }}
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-zinc-300 text-sm leading-relaxed mb-8 max-w-lg">{show.description}</p>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              className="pulse-btn flex items-center gap-2.5 text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide active:scale-95 shadow-xl shadow-red-600/40 border border-red-400/40"
              style={{ background: `linear-gradient(135deg, ${show.accentColor}, #990011)` }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              <Play className="w-4 h-4 fill-white" /> Watch Now
            </motion.button>
            <motion.button
              className="flex items-center gap-2 bg-white/10 hover:bg-white/18 text-white px-6 py-3.5 rounded-full font-semibold text-sm backdrop-blur-sm border border-red-500/20 hover:border-red-500/60 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Info className="w-4 h-4" /> Details
            </motion.button>
            <motion.button
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-red-500/20 hover:border-red-500/60 flex items-center justify-center transition-all group"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className="w-4 h-4 text-white group-hover:text-primary transition-colors" />
            </motion.button>
            <motion.button
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-red-500/20 hover:border-red-500/60 flex items-center justify-center transition-all group"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
            >
              <BookmarkPlus className="w-4 h-4 text-white group-hover:text-primary transition-colors" />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function GenreSection({ active, setActive }) {
  const filtered = active === "All" ? ALL_ANIME : ALL_ANIME.filter((a) => a.genre === active);
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-foreground mb-5 tracking-wide flex items-center gap-2" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
        <span>Browse by Genre</span>
      </h2>
      <div className="flex flex-wrap gap-2 mb-7">
        {GENRES.map((g) => (
          <motion.button
            key={g}
            onClick={() => setActive(g)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${active === g ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white shadow-lg shadow-red-950/60 border border-red-400/50" : "bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary border border-border"}`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {g}
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4"
        >
          {filtered.length > 0 ? (
            filtered.map((item, i) => <PortraitCard key={item.id} item={item} index={i} />)
          ) : (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <p className="text-lg font-semibold">No titles for this genre yet.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function TopRatedSection() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-foreground tracking-wide flex items-center gap-2" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
          <span>Top Rated All Time</span>
        </h2>
        <button className="text-primary text-xs font-bold tracking-wide uppercase hover:text-red-400 transition-colors flex items-center gap-1">
          Full List <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-3">
        {TOP_RATED.map((item, i) => (
          <motion.div
            key={item.id}
            className="flex items-center gap-4 p-3 lg:p-4 rounded-xl bg-card border border-border hover:border-primary/60 hover:bg-primary/10 cursor-pointer group transition-all duration-200 shadow-md shadow-black/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            whileHover={{ x: 5 }}
          >
            <span
              className={`text-2xl font-bold w-8 text-center flex-none ${i === 0 ? "text-red-500 font-black drop-shadow-[0_0_6px_rgba(229,9,20,0.8)]" : i === 1 ? "text-rose-400" : i === 2 ? "text-red-400" : "text-muted-foreground"}`}
              style={{ fontFamily: "'Rajdhani',sans-serif" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="w-10 h-14 rounded-lg overflow-hidden flex-none bg-secondary">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{item.title}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{item.genre} · {item.year}</p>
            </div>
            <div className="hidden sm:flex items-center gap-1 flex-none text-muted-foreground text-xs mr-3">
              <Eye className="w-3.5 h-3.5 text-red-500/80" />{item.views}
            </div>
            <div className="flex items-center gap-1 flex-none mr-2">
              <Star className="w-3.5 h-3.5 text-red-500 fill-red-500 drop-shadow-[0_0_4px_rgba(229,9,20,0.8)]" />
              <span className="text-red-400 font-bold text-sm">{item.rating}</span>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 bg-primary/40 transition-all shadow-[0_0_12px_rgba(229,9,20,0.8)] border border-red-500/50">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border mt-20 px-6 lg:px-16 py-14 bg-[#050408]">
      <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
        <div className="max-w-xs">
          <div className="flex items-center tracking-[0.14em] font-extrabold text-2xl mb-3 select-none group cursor-pointer" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            <span className="text-white">K</span>
            <span className="inline-flex items-center justify-center mx-[2px] transform translate-y-[-1px]">
              <KamuiEye size={20} className="group-hover:rotate-[360deg] transition-transform duration-700 ease-out" />
            </span>
            <span className="text-white">MUI</span>
            <span className="ml-2 text-xs font-black tracking-widest text-red-500">STREAM</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">The ultimate dimension for anime. Stream thousands of episodes in HD — subtitled and dubbed with space-time velocity.</p>
          <div className="flex gap-3 mt-5">
            {["App Store", "Google Play"].map((label) => (
              <button key={label} className="px-4 py-2 rounded-lg bg-secondary border border-border text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary transition-all">{label}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-12 text-sm">
          {[
            { heading: "Discover", links: ["Kamui Originals", "Shinobi War Arc", "Trending", "Movies", "Top Rated"] },
            { heading: "Account", links: ["My List", "History", "Settings", "Premium Pass", "Help Center"] },
            { heading: "Company", links: ["About Kamui", "Careers", "Press", "Privacy Policy", "Terms of Use"] }
          ].map(({ heading, links }) => (
            <div key={heading}>
              <p className="font-bold text-foreground mb-3 tracking-wide" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{heading}</p>
              <div className="space-y-2">
                {links.map((l) => (
                  <a key={l} href="#" className="block text-muted-foreground hover:text-primary transition-colors text-xs">{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-muted-foreground text-xs">
        <p>© 2024 KamuiStream Inc. Powered by Space-Time Kamui Ninjutsu.</p>
        <p>Crafted with passion for anime fans worldwide.</p>
      </div>
    </footer>
  );
}

export default function App() {
  const [activeGenre, setActiveGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredTrending = searchQuery ? TRENDING.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase())) : TRENDING;

  return (
    <div className="bg-background text-foreground min-h-screen relative selection:bg-primary/30 selection:text-white">
      <style>{GLOBAL_CSS}</style>
      <Starfield />
      <Nav onSearch={setSearchQuery} searchQuery={searchQuery} />
      <Hero />
      <MarqueeTicker />
      <main className="px-6 lg:px-16 relative z-10 space-y-16 pb-8 mt-10">
        <ScrollRow title="Continue Watching" icon={<Clock className="w-5 h-5" />}>
          {CONTINUE_WATCHING.map((item) => <LandscapeCard key={item.id} item={item} />)}
        </ScrollRow>
        <ScrollRow title={searchQuery ? `Results for "${searchQuery}"` : "Trending This Week"} icon={<Flame className="w-5 h-5" />}>
          {filteredTrending.length > 0 ? (
            filteredTrending.map((item, i) => <PortraitCard key={item.id} item={item} index={i} />)
          ) : (
            <p className="text-muted-foreground text-sm py-8 flex-none">No results found.</p>
          )}
        </ScrollRow>
        <GenreSection active={activeGenre} setActive={setActiveGenre} />
        <TopRatedSection />
      </main>
      <Footer />
    </div>
  );
}
