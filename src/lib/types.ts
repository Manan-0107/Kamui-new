export interface Episode {
  num: number;
  title: string;
  duration: string;
  desc: string;
}

export interface AnimeData {
  id: string;
  title: string;
  kanji: string;
  badge: string;
  badgeType?: 'original' | 'trending' | 'new';
  genre: string;
  genres: string[];
  year: string;
  rating: string;
  match: string;
  seasonsCount: string;
  trailerVideo: string;
  fullVideo: string;
  hook: string;
  synopsis: string;
  cast: string;
  mood: string;
  studio: string;
  director: string;
  audio: string;
  subtitles: string;
  maturityDesc: string;
  episodes: Episode[];
  relatedIds: string[];
}

export interface ContinueWatchingItem {
  animeId: string;
  episodeNum: number;
  currentTime: number;
  duration: number;
  percentage: number;
  title: string;
  episodeTitle: string;
  updatedAt: number;
}

export interface UserSocials {
  instagram?: string;
  snapchat?: string;
  myanimelist?: string;
  anilist?: string;
  discord?: string;
  bio?: string;
}

export interface UserSession {
  loggedIn: boolean;
  name: string;
  email: string;
  avatar: string;
  authProvider?: 'google' | 'password';
  socials?: UserSocials;
  customBadges?: string[];
}

export type RealmThemeId =
  | 'kamui-gold'
  | 'blood-moon'
  | 'abyssal-blue'
  | 'jade-dragon'
  | 'void-amethyst'
  | 'silver-eclipse';

export interface RealmTheme {
  id: RealmThemeId;
  name: string;
  kanji: string;
  subtitle: string;
  hues: [string, string];
}

export interface ChibiAvatar {
  id: string;
  name: string;
  anime: string;
  src: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}
