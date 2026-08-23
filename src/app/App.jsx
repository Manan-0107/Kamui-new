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
  Eye
} from "lucide-react";
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: 5 + i * 4.1 % 90,
  y: 5 + i * 7.7 % 88,
  size: 1 + i % 3,
  duration: 4 + i % 6,
  delay: i * 0.35 % 5
}));
const TICKER_ITEMS = [
  "\u{1F534} LIVE \xB7 Jujutsu Kaisen S2 EP23 now streaming",
  "\u26A1 1.4M viewers watching Attack on Titan right now",
  "\u{1F195} Demon Slayer: Hashira Training EP8 just dropped",
  "\u{1F525} Bleach: TYBW Part 3 trending in 52 countries",
  "\u2B50 New season confirmed \u2014 Re:Zero Season 3",
  "\u{1F38C} Vinland Saga wins Best Anime of the Year",
  "\u{1F195} Spy x Family Season 2 finale this Sunday",
  "\u{1F480} Chainsaw Man Season 2 officially greenlit"
];
const GLOBAL_CSS = `
  @keyframes float-up {
    0%   { transform: translateY(0px) scale(1);    opacity: 0; }
    15%  { opacity: 0.7; }
    85%  { opacity: 0.4; }
    100% { transform: translateY(-110px) scale(0.4); opacity: 0; }
  }
  @keyframes marquee-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 18px rgba(124,58,237,0.5); }
    50%       { box-shadow: 0 0 38px rgba(124,58,237,0.95), 0 0 64px rgba(225,29,132,0.4); }
  }
  @keyframes twinkle-dim {
    0%, 100% { opacity: 0.18; }
    50%      { opacity: 0.04; }
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
  @keyframes nebula-breathe {
    0%, 100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.7; }
    50%      { transform: translate(-50%,-50%) scale(1.09); opacity: 1;   }
  }
  @keyframes shoot {
    0%   { transform: rotate(-32deg) translateX(0);      opacity: 0; width: 0px;  }
    4%   { opacity: 1;  width: 55px; }
    96%  { opacity: 0.4; }
    100% { transform: rotate(-32deg) translateX(-560px); opacity: 0; width: 0px;  }
  }
  .pulse-btn     { animation: pulse-glow 2.4s ease-in-out infinite; }
  .marquee-track { animation: marquee-scroll 34s linear infinite; }
  .marquee-track:hover { animation-play-state: paused; }
  .shoot-a { animation: shoot 10s  3s  linear infinite; }
  .shoot-b { animation: shoot 10s  14s linear infinite; }
  .shoot-c { animation: shoot 10s  25s linear infinite; }
`;
const STARS_DATA = [
  ...Array.from({ length: 90 }, (_, i) => ({ id: `d${i}`, x: (i * 7.31 + 2.1) % 100, y: (i * 11.73 + 5.4) % 100, size: 1, cls: "twinkle-dim", dur: 2 + i % 6, delay: i * 0.41 % 7 })),
  ...Array.from({ length: 50 }, (_, i) => ({ id: `m${i}`, x: (i * 13.1 + 8.3) % 100, y: (i * 9.43 + 15.2) % 100, size: 1.5, cls: "twinkle-mid", dur: 3 + i % 5, delay: (i * 0.63 + 1) % 8 })),
  ...Array.from({ length: 22 }, (_, i) => ({ id: `b${i}`, x: (i * 19.7 + 12.6) % 100, y: (i * 15.3 + 8.1) % 100, size: 2, cls: "twinkle-bright", dur: 2 + i % 4, delay: i * 0.8 % 5 })),
  ...Array.from({ length: 7 }, (_, i) => ({ id: `s${i}`, x: (i * 31.4 + 20.5) % 100, y: (i * 27.1 + 18.3) % 100, size: 2.5, cls: "twinkle-bright", dur: 1.5 + i % 3, delay: i * 1.2 % 4 }))
];
const NEBULAS_DATA = [
  { id: "na", color: "76,29,149", x: 8, y: 18, w: 520, h: 360, blur: 130, dur: 18 },
  { id: "nb", color: "139,22,87", x: 72, y: 58, w: 460, h: 410, blur: 110, dur: 22 },
  { id: "nc", color: "18,18,82", x: 38, y: 78, w: 620, h: 320, blur: 150, dur: 26 },
  { id: "nd", color: "88,18,130", x: 90, y: 10, w: 380, h: 400, blur: 105, dur: 20 }
];
const GENRES = ["All", "Action", "Romance", "Sci-Fi", "Fantasy", "Horror", "Comedy", "Sports", "Slice of Life"];
const FEATURED_SHOWS = [
  {
    title: "Attack on Titan",
    subtitle: "The Final Season \u2014 Part 3",
    description: "With the Wall Titans unleashed, Eren Yeager marches toward global annihilation. The Survey Corps must cross enemy lines and stop their former friend before everything they swore to protect burns to ash.",
    tags: ["Dark Fantasy", "Action", "Drama"],
    rating: 9.9,
    year: 2023,
    episodes: 87,
    studio: "MAPPA",
    viewers: 1247832,
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&h=900&fit=crop&auto=format",
    accentColor: "#e11d84"
  },
  {
    title: "Jujutsu Kaisen",
    subtitle: "Season 2 \u2014 Shibuya Incident",
    description: "The Hidden Inventory arc unravels the tragic past of Gojo Satoru. Then the Shibuya Incident erupts \u2014 an all-out war that will forever change the world of sorcery and leave nothing unscathed.",
    tags: ["Action", "Supernatural", "Horror"],
    rating: 9.1,
    year: 2023,
    episodes: 47,
    studio: "MAPPA",
    viewers: 982451,
    image: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=1600&h=900&fit=crop&auto=format",
    accentColor: "#7c3aed"
  },
  {
    title: "Demon Slayer",
    subtitle: "Hashira Training Arc",
    description: "Tanjiro and the Demon Slayer Corps brace for the final confrontation against Muzan. The Hashira Training Arc pushes every warrior to their absolute limit \u2014 only the strongest will survive.",
    tags: ["Action", "Adventure", "Shounen"],
    rating: 9.3,
    year: 2024,
    episodes: 8,
    studio: "ufotable",
    viewers: 1103774,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=900&fit=crop&auto=format",
    accentColor: "#f97316"
  },
  {
    title: "Bleach: TYBW",
    subtitle: "The Thousand-Year Blood War \u2014 Part 3",
    description: "The Soul Society teeters on collapse. Ichigo Kurosaki and the Shinigami captains face the unstoppable might of Yhwach in a war that will decide the fate of every world.",
    tags: ["Action", "Supernatural", "Shounen"],
    rating: 9,
    year: 2024,
    episodes: 13,
    studio: "Pierrot",
    viewers: 876340,
    image: "https://images.unsplash.com/photo-1492515114975-b062d1a270ae?w=1600&h=900&fit=crop&auto=format",
    accentColor: "#06b6d4"
  }
];
const ALL_ANIME = [
  { id: 1, title: "Jujutsu Kaisen", sub: "Season 2", genre: "Action", rating: 9.1, badge: "EP 23 NEW", image: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400&h=560&fit=crop&auto=format" },
  { id: 2, title: "Demon Slayer", sub: "Hashira Training", genre: "Action", rating: 9.3, badge: "EP 8 NEW", image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=560&fit=crop&auto=format" },
  { id: 3, title: "Bleach: TYBW", sub: "Part 3", genre: "Action", rating: 9, badge: "EP 13 NEW", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=560&fit=crop&auto=format" },
  { id: 4, title: "Chainsaw Man", sub: "Season 1", genre: "Horror", rating: 8.9, badge: null, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=560&fit=crop&auto=format" },
  { id: 5, title: "Tokyo Ghoul", sub: "Season 1", genre: "Horror", rating: 7.9, badge: null, image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=560&fit=crop&auto=format" },
  { id: 6, title: "Steins;Gate", sub: "Season 1", genre: "Sci-Fi", rating: 9.1, badge: null, image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=560&fit=crop&auto=format" },
  { id: 7, title: "Psycho-Pass", sub: "Season 1", genre: "Sci-Fi", rating: 8.5, badge: null, image: "https://images.unsplash.com/photo-1533240332153-8b3bf4c0f0d5?w=400&h=560&fit=crop&auto=format" },
  { id: 8, title: "Re:Zero", sub: "Season 2 Part 2", genre: "Fantasy", rating: 8.8, badge: null, image: "https://images.unsplash.com/photo-1492515114975-b062d1a270ae?w=400&h=560&fit=crop&auto=format" },
  { id: 9, title: "Sword Art Online", sub: "Alicization", genre: "Fantasy", rating: 7.8, badge: null, image: "https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?w=400&h=560&fit=crop&auto=format" },
  { id: 10, title: "Spy x Family", sub: "Season 2", genre: "Comedy", rating: 8.7, badge: "EP 12 NEW", image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=560&fit=crop&auto=format" },
  { id: 11, title: "Konosuba", sub: "Season 3", genre: "Comedy", rating: 8.2, badge: null, image: "https://images.unsplash.com/photo-1574375927818-6e7b3dd63d83?w=400&h=560&fit=crop&auto=format" },
  { id: 12, title: "Haikyuu!!", sub: "Season 4", genre: "Sports", rating: 8.7, badge: null, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=560&fit=crop&auto=format" },
  { id: 13, title: "Your Lie in April", sub: "Season 1", genre: "Romance", rating: 8.8, badge: null, image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=560&fit=crop&auto=format" },
  { id: 14, title: "Toradora", sub: "Complete Series", genre: "Romance", rating: 8.2, badge: null, image: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=560&fit=crop&auto=format" },
  { id: 15, title: "K-On!", sub: "Season 2", genre: "Slice of Life", rating: 8.1, badge: null, image: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&h=560&fit=crop&auto=format" }
];
const TRENDING = ALL_ANIME.slice(0, 7);
const CONTINUE_WATCHING = [
  { id: 1, title: "Fullmetal Alchemist", sub: "Brotherhood", ep: "Episode 38 \u2014 The Immortal Legion", progress: 68, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop&auto=format" },
  { id: 2, title: "Death Note", sub: "Season 1", ep: "Episode 15 \u2014 Wager", progress: 42, image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&h=300&fit=crop&auto=format" },
  { id: 3, title: "Vinland Saga", sub: "Season 2", ep: "Episode 22 \u2014 Father", progress: 85, image: "https://images.unsplash.com/photo-1533240332153-8b3bf4c0f0d5?w=500&h=300&fit=crop&auto=format" },
  { id: 4, title: "One Piece", sub: "Egghead Arc", ep: "Episode 1093 \u2014 The Will of Ohara", progress: 25, image: "https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?w=500&h=300&fit=crop&auto=format" }
];
const TOP_RATED = [
  { id: 1, title: "Fullmetal Alchemist: Brotherhood", genre: "Action / Adventure", year: 2009, rating: 9.12, views: "48.2M", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=160&fit=crop&auto=format" },
  { id: 2, title: "Steins;Gate", genre: "Sci-Fi / Thriller", year: 2011, rating: 9.07, views: "31.7M", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&h=160&fit=crop&auto=format" },
  { id: 3, title: "Hunter x Hunter (2011)", genre: "Action / Adventure", year: 2011, rating: 9.04, views: "39.1M", image: "https://images.unsplash.com/photo-1574375927818-6e7b3dd63d83?w=120&h=160&fit=crop&auto=format" },
  { id: 4, title: "Clannad: After Story", genre: "Drama / Romance", year: 2008, rating: 9.01, views: "22.4M", image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=120&h=160&fit=crop&auto=format" },
  { id: 5, title: "Vinland Saga", genre: "Historical / Action", year: 2019, rating: 8.97, views: "18.9M", image: "https://images.unsplash.com/photo-1533240332153-8b3bf4c0f0d5?w=120&h=160&fit=crop&auto=format" }
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
  return <div className="mt-2 h-0.5 bg-white/15 rounded-full overflow-hidden">
      <div className="h-full bg-accent rounded-full transition-all duration-1000 ease-out" style={{ width: `${w}%` }} />
    </div>;
}
function HeroParticles() {
  return <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {PARTICLES.map((p) => <div
    key={p.id}
    className="absolute rounded-full"
    style={{
      left: `${p.x}%`,
      top: `${p.y}%`,
      width: `${p.size}px`,
      height: `${p.size}px`,
      background: p.id % 3 === 0 ? "rgba(124,58,237,0.65)" : p.id % 3 === 1 ? "rgba(225,29,132,0.55)" : "rgba(255,255,255,0.3)",
      animation: `float-up ${p.duration}s ${p.delay}s infinite linear`
    }}
  />)}
    </div>;
}
function Starfield() {
  return <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {
    /* Nebula blobs */
  }
      {NEBULAS_DATA.map((n) => <div
    key={n.id}
    className="absolute rounded-full"
    style={{
      left: `${n.x}%`,
      top: `${n.y}%`,
      width: n.w,
      height: n.h,
      background: `rgba(${n.color},0.13)`,
      filter: `blur(${n.blur}px)`,
      transform: "translate(-50%,-50%)",
      animation: `nebula-breathe ${n.dur}s ease-in-out infinite`
    }}
  />)}
      {
    /* Stars */
  }
      {STARS_DATA.map((s) => <div
    key={s.id}
    className="absolute rounded-full bg-white"
    style={{
      left: `${s.x}%`,
      top: `${s.y}%`,
      width: s.size,
      height: s.size,
      animation: `${s.cls} ${s.dur}s ${s.delay}s ease-in-out infinite`
    }}
  />)}
      {
    /* Shooting stars */
  }
      {[
    { cls: "shoot-a", top: "10%", right: "18%" },
    { cls: "shoot-b", top: "28%", right: "42%" },
    { cls: "shoot-c", top: "5%", right: "65%" }
  ].map((ss) => <div
    key={ss.cls}
    className={`absolute h-px rounded-full ${ss.cls}`}
    style={{
      top: ss.top,
      right: ss.right,
      background: "linear-gradient(to left, rgba(255,255,255,0.9), transparent)",
      transformOrigin: "right center"
    }}
  />)}
    </div>;
}
function MarqueeTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return <div className="relative bg-secondary/50 border-y border-border overflow-hidden py-2.5 backdrop-blur-sm">
      <div className="flex gap-0 marquee-track whitespace-nowrap">
        {doubled.map((item, i) => <span key={i} className="flex items-center gap-6 px-6 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-default">
            {item}
            <span className="w-1 h-1 rounded-full bg-primary/50 inline-block" />
          </span>)}
      </div>
    </div>;
}
function PortraitCard({ item, index = 0 }) {
  const [liked, setLiked] = useState(false);
  return <motion.div
    className="relative flex-none w-40 sm:w-44 rounded-xl overflow-hidden cursor-pointer group"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.05 }}
    whileHover={{ y: -5 }}
  >
      <div className="bg-card aspect-[2/3]">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

      {item.badge && <motion.div
    className="absolute top-2 left-2 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide"
    animate={{ scale: [1, 1.07, 1] }}
    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
  >
          {item.badge}
        </motion.div>}

      <button
    onClick={(e) => {
      e.stopPropagation();
      setLiked((l) => !l);
    }}
    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
  >
        <Heart className={`w-4 h-4 transition-colors drop-shadow-md ${liked ? "text-accent fill-accent" : "text-white"}`} />
      </button>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/60 scale-90 group-hover:scale-100 transition-transform duration-300">
          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-bold text-sm leading-tight" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{item.title}</p>
        <p className="text-gray-400 text-xs mt-0.5">{item.sub}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-yellow-400 text-xs font-bold">{item.rating}</span>
          <span className="text-gray-500 text-xs">· {item.genre}</span>
        </div>
      </div>
    </motion.div>;
}
function LandscapeCard({ item }) {
  return <motion.div
    className="relative flex-none w-64 sm:w-72 rounded-xl overflow-hidden cursor-pointer group"
    whileHover={{ y: -4, scale: 1.01 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
      <div className="bg-card aspect-video">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/60">
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-bold text-sm" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{item.title}</p>
        <p className="text-gray-400 text-xs mt-0.5 truncate">{item.ep}</p>
        <AnimatedBar progress={item.progress} />
        <p className="text-gray-500 text-xs mt-1">{item.progress}% complete</p>
      </div>
    </motion.div>;
}
function ScrollRow({ title, icon, children }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  return <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {icon && <span className="text-accent">{icon}</span>}
          <h2 className="text-2xl font-bold text-foreground tracking-wide" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center hover:border-primary/60 hover:bg-primary/20 transition-all">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center hover:border-primary/60 hover:bg-primary/20 transition-all">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
          <button className="text-primary text-xs font-bold tracking-wide uppercase hover:text-accent transition-colors flex items-center gap-1 ml-2">
            See all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {children}
      </div>
    </section>;
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
  return <motion.nav
    className="fixed top-0 left-0 right-0 z-50"
    animate={{
      backgroundColor: scrolled ? "rgba(7,7,15,0.96)" : "rgba(7,7,15,0)",
      borderBottomColor: scrolled ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0)",
      backdropFilter: scrolled ? "blur(16px)" : "blur(0px)"
    }}
    transition={{ duration: 0.3 }}
    style={{ borderBottomWidth: 1, borderBottomStyle: "solid" }}
  >
      <div className="px-6 lg:px-16 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <motion.div className="flex items-center cursor-pointer" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}>
            <span
    className="text-3xl font-bold tracking-[0.18em]"
    style={{
      fontFamily: "'Rajdhani',sans-serif",
      background: "linear-gradient(135deg,#7c3aed 0%,#e11d84 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    }}
  >KAMUI</span>
            <span className="ml-2 text-[10px] font-bold tracking-widest text-accent/60 hidden sm:block" style={{ WebkitTextFillColor: "rgba(225,29,132,0.6)" }}>STREAM</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-7 text-sm font-semibold">
            {["Home", "Browse", "Movies", "Schedule", "My List"].map((link) => <a key={link} href="#" className={`transition-colors hover:text-primary relative group ${link === "Home" ? "text-foreground" : "text-muted-foreground"}`}>
                {link}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
              </a>)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {searchOpen ? <motion.div
    key="open"
    initial={{ width: 0, opacity: 0 }}
    animate={{ width: 200, opacity: 1 }}
    exit={{ width: 0, opacity: 0 }}
    transition={{ duration: 0.22 }}
    className="flex items-center bg-secondary/80 border border-primary/40 rounded-full px-4 py-1.5 gap-2 backdrop-blur-sm overflow-hidden"
  >
                <Search className="w-4 h-4 text-muted-foreground flex-none" />
                <input
    autoFocus
    value={searchQuery}
    onChange={(e) => onSearch(e.target.value)}
    placeholder="Search anime..."
    className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
    onBlur={() => {
      setSearchOpen(false);
      onSearch("");
    }}
  />
              </motion.div> : <motion.button
    key="closed"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    onClick={() => setSearchOpen(true)}
    className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-colors backdrop-blur-sm"
  >
                <Search className="w-4 h-4 text-foreground" />
              </motion.button>}
          </AnimatePresence>

          <button className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-colors backdrop-blur-sm relative">
            <Bell className="w-4 h-4 text-foreground" />
            <motion.span
    className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full"
    animate={{ scale: [1, 1.45, 1] }}
    transition={{ repeat: Infinity, duration: 1.8 }}
  />
          </button>

          <motion.div
    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold cursor-pointer select-none"
    whileHover={{ scale: 1.12 }}
    whileTap={{ scale: 0.93 }}
  >
            AK
          </motion.div>

          <button className="md:hidden ml-1" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    className="md:hidden bg-card/95 backdrop-blur-md border-b border-border px-6 py-4 flex flex-col gap-4 overflow-hidden"
  >
            {["Home", "Browse", "Movies", "Schedule", "My List"].map((link) => <a key={link} href="#" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>{link}</a>)}
          </motion.div>}
      </AnimatePresence>
    </motion.nav>;
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
  return <div
    className="relative h-screen min-h-[640px] max-h-[940px] flex items-end"
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
  >

      {
    /* BG crossfade */
  }
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
          <div className="absolute inset-0" style={{ background: "linear-gradient(105deg,rgba(7,7,15,0.97) 0%,rgba(7,7,15,0.6) 45%,rgba(7,7,15,0.15) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(7,7,15,1) 0%,rgba(7,7,15,0.2) 45%,transparent 70%)" }} />
        </motion.div>
      </AnimatePresence>

      <HeroParticles />

      {
    /* Accent color bloom */
  }
      <div
    className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[80px] pointer-events-none transition-all duration-1000"
    style={{ background: show.accentColor }}
  />

      {
    /* Slide progress indicators */
  }
      <div className="absolute bottom-8 right-8 lg:right-16 flex gap-2 z-20">
        {FEATURED_SHOWS.map((_, i) => <button
    key={i}
    onClick={() => setIdx(i)}
    className="relative h-1 rounded-full overflow-hidden transition-all duration-300"
    style={{ width: i === idx ? 32 : 12, background: "rgba(255,255,255,0.18)" }}
  >
            {i === idx && <motion.div
    className="absolute inset-0 rounded-full"
    style={{ background: show.accentColor }}
    initial={{ scaleX: 0, originX: 0 }}
    animate={{ scaleX: 1 }}
    transition={{ duration: paused ? 0 : 7, ease: "linear" }}
  />}
          </button>)}
      </div>

      {
    /* Prev / Next */
  }
      <button
    onClick={() => setIdx((i) => (i - 1 + FEATURED_SHOWS.length) % FEATURED_SHOWS.length)}
    className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center hover:bg-black/70 backdrop-blur-sm transition-all"
  >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
    onClick={() => setIdx((i) => (i + 1) % FEATURED_SHOWS.length)}
    className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center hover:bg-black/70 backdrop-blur-sm transition-all"
  >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {
    /* Thumbnail strip */
  }
      <div className="absolute top-24 right-8 lg:right-16 hidden lg:flex flex-col gap-2 z-20">
        {FEATURED_SHOWS.map((s, i) => <motion.button
    key={i}
    onClick={() => setIdx(i)}
    className="relative w-20 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300"
    style={{ borderColor: i === idx ? show.accentColor : "rgba(255,255,255,0.1)", opacity: i === idx ? 1 : 0.4 }}
    whileHover={{ opacity: 1, scale: 1.06 }}
  >
            <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
          </motion.button>)}
      </div>

      {
    /* Hero content */
  }
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
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: show.accentColor }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: show.accentColor }}>Trending #1 This Week</span>
          </motion.div>

          <h1 className="text-6xl lg:text-8xl font-bold text-white leading-none mb-2 tracking-tight" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            {show.title}
          </h1>
          <p className="font-bold text-lg mb-4 tracking-wide" style={{ color: show.accentColor }}>{show.subtitle}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 font-bold text-base">{show.rating}</span>
            </div>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">{show.year}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">{show.episodes} Episodes</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">{show.studio}</span>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-1 text-green-400 font-semibold">
              <Eye className="w-3.5 h-3.5" />
              <LiveViewers base={show.viewers} /> watching
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {show.tags.map((tag) => <span
    key={tag}
    className="text-xs px-3 py-1 border rounded-full font-medium"
    style={{ borderColor: `${show.accentColor}45`, color: show.accentColor, background: `${show.accentColor}14` }}
  >
                {tag}
              </span>)}
          </div>

          <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-lg">{show.description}</p>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
    className="pulse-btn flex items-center gap-2.5 text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide active:scale-95"
    style={{ background: show.accentColor }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.96 }}
  >
              <Play className="w-4 h-4 fill-white" /> Watch Now
            </motion.button>
            <motion.button
    className="flex items-center gap-2 bg-white/10 hover:bg-white/18 text-white px-6 py-3.5 rounded-full font-semibold text-sm backdrop-blur-sm border border-white/15 transition-all"
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
  >
              <Info className="w-4 h-4" /> Details
            </motion.button>
            <motion.button
    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 flex items-center justify-center transition-all group"
    whileHover={{ scale: 1.12 }}
    whileTap={{ scale: 0.9 }}
  >
              <Heart className="w-4 h-4 text-white group-hover:text-accent transition-colors" />
            </motion.button>
            <motion.button
    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 flex items-center justify-center transition-all group"
    whileHover={{ scale: 1.12 }}
    whileTap={{ scale: 0.9 }}
  >
              <BookmarkPlus className="w-4 h-4 text-white group-hover:text-primary transition-colors" />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>;
}
function GenreSection({ active, setActive }) {
  const filtered = active === "All" ? ALL_ANIME : ALL_ANIME.filter((a) => a.genre === active);
  return <section>
      <h2 className="text-2xl font-bold text-foreground mb-5 tracking-wide" style={{ fontFamily: "'Rajdhani',sans-serif" }}>Browse by Genre</h2>
      <div className="flex flex-wrap gap-2 mb-7">
        {GENRES.map((g) => <motion.button
    key={g}
    onClick={() => setActive(g)}
    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${active === g ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary border border-border"}`}
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.96 }}
  >
            {g}
          </motion.button>)}
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
          {filtered.length > 0 ? filtered.map((item, i) => <PortraitCard key={item.id} item={item} index={i} />) : <div className="col-span-full text-center py-16 text-muted-foreground">
              <p className="text-lg font-semibold">No titles for this genre yet.</p>
            </div>}
        </motion.div>
      </AnimatePresence>
    </section>;
}
function TopRatedSection() {
  return <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground tracking-wide" style={{ fontFamily: "'Rajdhani',sans-serif" }}>Top Rated All Time</h2>
        <button className="text-primary text-xs font-bold tracking-wide uppercase hover:text-accent transition-colors flex items-center gap-1">
          Full List <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-3">
        {TOP_RATED.map((item, i) => <motion.div
    key={item.id}
    className="flex items-center gap-4 p-3 lg:p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer group transition-all duration-200"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: i * 0.08, duration: 0.35 }}
    whileHover={{ x: 5 }}
  >
            <span
    className={`text-2xl font-bold w-8 text-center flex-none ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}
    style={{ fontFamily: "'Rajdhani',sans-serif" }}
  >{String(i + 1).padStart(2, "0")}</span>
            <div className="w-10 h-14 rounded-lg overflow-hidden flex-none bg-secondary">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{item.title}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{item.genre} · {item.year}</p>
            </div>
            <div className="hidden sm:flex items-center gap-1 flex-none text-muted-foreground text-xs mr-3">
              <Eye className="w-3.5 h-3.5" />{item.views}
            </div>
            <div className="flex items-center gap-1 flex-none mr-2">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm">{item.rating}</span>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 bg-primary/20 transition-all">
              <Play className="w-4 h-4 text-primary fill-primary" />
            </div>
          </motion.div>)}
      </div>
    </section>;
}
function Footer() {
  return <footer className="border-t border-border mt-20 px-6 lg:px-16 py-14">
      <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
        <div className="max-w-xs">
          <span
    className="text-2xl font-bold tracking-[0.18em] mb-3 inline-block"
    style={{ fontFamily: "'Rajdhani',sans-serif", background: "linear-gradient(135deg,#7c3aed,#e11d84)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
  >
            KAMUISTREAM
          </span>
          <p className="text-muted-foreground text-sm leading-relaxed">The ultimate destination for anime. Stream thousands of episodes in HD — subtitled and dubbed.</p>
          <div className="flex gap-3 mt-5">
            {["App Store", "Google Play"].map((label) => <button key={label} className="px-4 py-2 rounded-lg bg-secondary border border-border text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary transition-all">{label}</button>)}
          </div>
        </div>
        <div className="flex flex-wrap gap-12 text-sm">
          {[
    { heading: "Discover", links: ["New Releases", "Trending", "Movies", "Schedule", "Top Rated"] },
    { heading: "Account", links: ["My List", "History", "Settings", "Premium", "Help Center"] },
    { heading: "Company", links: ["About", "Careers", "Press", "Privacy Policy", "Terms of Use"] }
  ].map(({ heading, links }) => <div key={heading}>
              <p className="font-bold text-foreground mb-3 tracking-wide" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{heading}</p>
              <div className="space-y-2">
                {links.map((l) => <a key={l} href="#" className="block text-muted-foreground hover:text-primary transition-colors text-xs">{l}</a>)}
              </div>
            </div>)}
        </div>
      </div>
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-muted-foreground text-xs">
        <p>© 2024 KamuiStream Inc. All rights reserved.</p>
        <p>Crafted with passion for anime fans worldwide.</p>
      </div>
    </footer>;
}
export default function App() {
  const [activeGenre, setActiveGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredTrending = searchQuery ? TRENDING.filter((i) => i.title.toLowerCase().includes(searchQuery.toLowerCase())) : TRENDING;
  return <div className="bg-background text-foreground min-h-screen relative">
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
          {filteredTrending.length > 0 ? filteredTrending.map((item, i) => <PortraitCard key={item.id} item={item} index={i} />) : <p className="text-muted-foreground text-sm py-8 flex-none">No results found.</p>}
        </ScrollRow>
        <GenreSection active={activeGenre} setActive={setActiveGenre} />
        <TopRatedSection />
      </main>
      <Footer />
    </div>;
}
