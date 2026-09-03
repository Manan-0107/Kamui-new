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
  contentType?: 'series' | 'movie';
  duration?: string;
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

// ---------------- FRIENDS SYSTEM ----------------
export interface FriendUser {
  id: string;
  username: string;
  displayName: string;
  tag: string; // e.g. '#KM-7419'
  avatar: string;
  status: 'online' | 'watching' | 'offline' | 'idle';
  currentAnime?: string;
  currentEp?: number;
  favoriteAnime?: string;
  bio?: string;
  mutualFriends?: number;
  joinedAt?: string;
}

export interface FriendRequest {
  id: string;
  from: FriendUser;
  sentAt: string;
  type: 'incoming' | 'outgoing';
}

// ---------------- COMMENTS & DISCUSSION SYSTEM ----------------
export interface CommentMedia {
  type: 'image' | 'sticker';
  url: string; // data URL or sticker image URL
  name?: string;
}

export interface AnimeComment {
  id: string;
  animeId: string;
  epNum?: number;
  timestamp?: string; // e.g. "14:23"
  author: {
    name: string;
    avatar: string;
    badge?: string; // e.g. "PRO", "TOP FAN", "OTAKU"
    isCurrentUser?: boolean;
  };
  content: string;
  media?: CommentMedia;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  isSpoiler?: boolean;
  replies?: AnimeComment[];
}

