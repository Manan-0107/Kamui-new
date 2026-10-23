import { AnimeData, AnimeRatings, NextAiringInfo, Episode } from './types';

export interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english?: string | null;
    native?: string | null;
  };
  coverImage?: {
    extraLarge?: string | null;
    large?: string | null;
    medium?: string | null;
    color?: string | null;
  } | null;
  bannerImage?: string | null;
  description?: string | null;
  genres?: string[] | null;
  season?: string | null;
  seasonYear?: number | null;
  startDate?: {
    year?: number | null;
  } | null;
  episodes?: number | null;
  duration?: number | null;
  status?: string | null;
  averageScore?: number | null;
  meanScore?: number | null;
  popularity?: number | null;
  format?: string | null;
  trailer?: {
    id?: string | null;
    site?: string | null;
    thumbnail?: string | null;
  } | null;
  studios?: {
    nodes?: Array<{
      id: number;
      name: string;
      isAnimationStudio?: boolean;
    }> | null;
  } | null;
  nextAiringEpisode?: {
    episode: number;
    airingAt: number;
    timeUntilAiring: number;
  } | null;
  relations?: {
    edges?: Array<{
      relationType?: string | null;
      node?: {
        id: number;
        title?: {
          romaji?: string | null;
          english?: string | null;
        } | null;
        coverImage?: {
          large?: string | null;
        } | null;
        bannerImage?: string | null;
        format?: string | null;
        averageScore?: number | null;
      } | null;
    }> | null;
  } | null;
  recommendations?: {
    nodes?: Array<{
      mediaRecommendation?: {
        id: number;
        title?: {
          romaji?: string | null;
          english?: string | null;
        } | null;
        coverImage?: {
          large?: string | null;
        } | null;
        bannerImage?: string | null;
        format?: string | null;
        averageScore?: number | null;
        genres?: string[] | null;
      } | null;
    }> | null;
  } | null;
}

export interface LiveScheduleItem {
  id: number;
  title: string;
  romajiTitle: string;
  posterImage?: string;
  bannerImage?: string;
  score?: number;
  nextEpisode?: number;
  airingAt?: number;
  timeUntilAiringStr?: string;
}

const ANILIST_GRAPHQL_ENDPOINT = 'https://graphql.anilist.co';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const STORAGE_CACHE_PREFIX = 'kamui_al_cache_';
const MAX_STORAGE_CACHE_ENTRIES = 50; // Cap to keep well within ~5MB quota

// In-memory cache
const memoryCache = new Map<string, { data: any; expiresAt: number; lastAccessed: number }>();
// In-flight request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Strip HTML tags and decode common HTML entities
 */
export function stripHtml(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generate a cache key
 */
function getCacheKey(query: string, variables: Record<string, any> = {}): string {
  const normQuery = query.replace(/\s+/g, ' ').trim();
  const sortedVars = JSON.stringify(variables, Object.keys(variables).sort());
  return `${normQuery}_${sortedVars}`;
}

export function clearAniListCache(): void {
  memoryCache.clear();
  pendingRequests.clear();
}

/**
 * Read from in-memory or localStorage cache with LRU tracking
 */
function readCache<T>(key: string): T | null {
  const now = Date.now();
  const mem = memoryCache.get(key);
  if (mem && mem.expiresAt > now) {
    mem.lastAccessed = now;
    return mem.data as T;
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_CACHE_PREFIX + key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.expiresAt > now) {
          memoryCache.set(key, { data: parsed.data, expiresAt: parsed.expiresAt, lastAccessed: now });
          return parsed.data as T;
        } else {
          localStorage.removeItem(STORAGE_CACHE_PREFIX + key);
        }
      }
    } catch {
      // Ignore localStorage read errors, continue with memory
    }
  }

  return null;
}

/**
 * Write to in-memory and localStorage cache with strict quota protection and LRU eviction
 */
function writeCache<T>(key: string, data: T, ttlMs: number = CACHE_TTL_MS): void {
  const now = Date.now();
  const expiresAt = now + ttlMs;
  const entry = { data, expiresAt, lastAccessed: now };
  
  // 1. Always record into in-memory cache
  memoryCache.set(key, entry);

  // 2. Safely attempt writing to localStorage with eviction
  if (typeof window !== 'undefined') {
    try {
      evictOldestCacheIfNeeded();
      localStorage.setItem(STORAGE_CACHE_PREFIX + key, JSON.stringify({ data, expiresAt, lastAccessed: now }));
    } catch {
      // LocalStorage quota exceeded or unavailable; aggressively prune and fall back to memory
      try {
        pruneOldestEntries(10);
        localStorage.setItem(STORAGE_CACHE_PREFIX + key, JSON.stringify({ data, expiresAt, lastAccessed: now }));
      } catch {
        // Fall back completely to in-memory cache without failing
      }
    }
  }
}

/**
 * Evict expired entries or oldest accessed entries if count exceeds MAX_STORAGE_CACHE_ENTRIES
 */
function evictOldestCacheIfNeeded(): void {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_CACHE_PREFIX));
    const now = Date.now();

    // First remove definitely expired entries
    const validEntries: Array<{ key: string; lastAccessed: number }> = [];
    for (const k of keys) {
      try {
        const item = JSON.parse(localStorage.getItem(k) || '');
        if (!item || item.expiresAt <= now) {
          localStorage.removeItem(k);
        } else {
          validEntries.push({ key: k, lastAccessed: item.lastAccessed || 0 });
        }
      } catch {
        localStorage.removeItem(k);
      }
    }

    // If still over cap, evict oldest accessed entries
    if (validEntries.length >= MAX_STORAGE_CACHE_ENTRIES) {
      validEntries.sort((a, b) => a.lastAccessed - b.lastAccessed);
      const toRemove = validEntries.slice(0, validEntries.length - MAX_STORAGE_CACHE_ENTRIES + 1);
      for (const entry of toRemove) {
        localStorage.removeItem(entry.key);
      }
    }
  } catch {
    // Ignore eviction errors
  }
}

/**
 * Aggressively prune oldest N entries on quota errors
 */
function pruneOldestEntries(count = 10): void {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_CACHE_PREFIX));
    const entries: Array<{ key: string; lastAccessed: number }> = [];
    for (const k of keys) {
      try {
        const item = JSON.parse(localStorage.getItem(k) || '');
        entries.push({ key: k, lastAccessed: item?.lastAccessed || 0 });
      } catch {
        localStorage.removeItem(k);
      }
    }
    entries.sort((a, b) => a.lastAccessed - b.lastAccessed);
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      localStorage.removeItem(entries[i].key);
    }
  } catch {
    // Ignore prune errors
  }
}

/**
 * Sleep helper
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Core GraphQL fetcher with cache, deduplication, and dynamic 429 rate-limit backoff.
 * AniList allows ~90 req/min under standard conditions and ~30 req/min during degraded states.
 * Back off conservatively using Retry-After or exponential backoff on 429.
 */
export async function fetchAniListGraphQL<T = any>(
  query: string,
  variables: Record<string, any> = {},
  retries = 3
): Promise<T> {
  const cacheKey = getCacheKey(query, variables);

  // 1. Check cache
  const cached = readCache<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Request deduplication: if request is already in-flight, return the existing promise
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  // 3. Initiate request with retry and rate-limit backoff
  const fetchPromise = (async () => {
    let attempts = 0;
    while (attempts <= retries) {
      try {
        const res = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ query, variables })
        });

        if (res.status === 429) {
          // Dynamic rate-limit handling (server throttles between 30 and 90 req/min)
          const retryHeader = res.headers.get('Retry-After');
          const delaySec = retryHeader ? parseInt(retryHeader, 10) : Math.pow(2, attempts + 2);
          const delayMs = Math.max(1500, isNaN(delaySec) ? 3000 : delaySec * 1000);
          attempts++;
          if (attempts > retries) {
            throw new Error(`AniList rate limit exceeded (HTTP 429). Please wait before making more requests.`);
          }
          await sleep(delayMs);
          continue;
        }

        if (!res.ok) {
          const err = new Error(`AniList API error: ${res.status} ${res.statusText}`);
          if (res.status >= 400 && res.status < 500 && res.status !== 429) {
            (err as any).noRetry = true;
          }
          throw err;
        }

        const json = await res.json();
        if (json.errors && json.errors.length > 0) {
          const err = new Error(json.errors[0]?.message || 'AniList GraphQL error');
          (err as any).noRetry = true;
          throw err;
        }

        const data = json.data as T;
        writeCache(cacheKey, data);
        return data;
      } catch (err: any) {
        if (err.noRetry) {
          throw err;
        }
        attempts++;
        if (attempts > retries) {
          // If network failed but stale cache exists in localStorage, fall back to it
          if (typeof window !== 'undefined') {
            try {
              const stored = localStorage.getItem(STORAGE_CACHE_PREFIX + cacheKey);
              if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed?.data) return parsed.data as T;
              }
            } catch {
              // ignore
            }
          }
          throw err;
        }
        await sleep(1000 * attempts);
      }
    }
    throw new Error('Failed to fetch from AniList after retries');
  })();

  pendingRequests.set(cacheKey, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

/**
 * Map AniList Media GraphQL response into standard AnimeData shape
 */
export function mapAniListToAnimeData(media: AniListMedia): AnimeData {
  const title = media.title.english || media.title.romaji || 'Untitled Anime';
  const kanji = media.title.native || media.title.romaji || title;
  const score = media.averageScore || media.meanScore || 80;

  // Next airing episode
  let nextAiring: NextAiringInfo | undefined;
  if (media.nextAiringEpisode) {
    const hours = Math.round(media.nextAiringEpisode.timeUntilAiring / 3600);
    const timeStr =
      hours > 24 ? `in ${Math.round(hours / 24)} days` : hours > 0 ? `in ${hours} hours` : 'soon';
    nextAiring = {
      episode: media.nextAiringEpisode.episode,
      timeStr,
      airingAt: media.nextAiringEpisode.airingAt
    };
  }

  // Multi-platform ratings approximation from AniList score
  const ratings: AnimeRatings = {
    anilist: {
      score,
      scoreFormatted: `${score}%`,
      votes: media.popularity ? media.popularity.toLocaleString() : undefined,
      url: `https://anilist.co/anime/${media.id}`
    },
    mal: {
      score: score / 10,
      scoreFormatted: (score / 10).toFixed(2),
      url: `https://myanimelist.net/anime`
    },
    imdb: {
      score: Math.max(1, (score / 10) - 0.2),
      scoreFormatted: Math.max(1, (score / 10) - 0.2).toFixed(1),
      url: 'https://www.imdb.com'
    },
    tmdb: {
      score: Math.max(1, score - 2),
      scoreFormatted: `${Math.max(1, score - 2)}%`,
      url: 'https://www.themoviedb.org'
    }
  };

  const isMovie = media.format === 'MOVIE';
  const genres = media.genres && media.genres.length > 0 ? media.genres : ['Anime'];
  const primaryGenre = genres[0] || 'Anime';
  const year = media.seasonYear
    ? String(media.seasonYear)
    : media.startDate?.year
    ? String(media.startDate.year)
    : '';

  const seasonsCount = isMovie
    ? media.duration
      ? `${media.duration} mins`
      : 'Feature Film'
    : media.episodes
    ? `${media.episodes} Episodes`
    : media.status === 'RELEASING'
    ? 'Simulcast'
    : 'Series';

  // Badges
  let badge: string = 'ANILIST';
  let badgeType: 'original' | 'trending' | 'new' | undefined;
  if (media.status === 'RELEASING') {
    badge = 'SIMULCAST';
    badgeType = 'trending';
  } else if (isMovie) {
    badge = 'FEATURE FILM';
    badgeType = 'new';
  } else if (score >= 85) {
    badge = 'TOP RATED';
    badgeType = 'original';
  }

  // Relations & Recommendations IDs
  const relIds = (media.relations?.edges || [])
    .map((e) => e?.node?.id)
    .filter(Boolean)
    .map(String);
  const recIds = (media.recommendations?.nodes || [])
    .map((n) => n?.mediaRecommendation?.id)
    .filter(Boolean)
    .map(String);
  const relatedIds = Array.from(new Set([...recIds, ...relIds])).slice(0, 8);

  // Generate placeholder episode list
  const totalEps = media.episodes || (nextAiring ? nextAiring.episode : 12);
  const generatedEpisodes: Episode[] = Array.from(
    { length: Math.min(Math.max(totalEps, 1), 24) },
    (_, i) => ({
      num: i + 1,
      title: `Episode ${i + 1}`,
      duration: media.duration ? `${media.duration}m` : '24m',
      desc: `Episode ${i + 1} of ${title}. Install a streaming extension to watch.`
    })
  );

  const mainStudio = media.studios?.nodes?.[0]?.name || '';

  return {
    id: String(media.id),
    title,
    kanji,
    badge,
    badgeType,
    genre: primaryGenre,
    genres,
    year,
    rating: score ? `${(score / 10).toFixed(1)} ★` : 'PG-13',
    match: `${score}% Match`,
    ratings,
    posterImage: media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium || undefined,
    bannerImage: media.bannerImage || media.coverImage?.extraLarge || media.coverImage?.large || undefined,
    nextAiring,
    contentType: isMovie ? 'movie' : 'series',
    duration: media.duration ? `${media.duration}m` : undefined,
    seasonsCount,
    trailerVideo: media.trailer?.site === 'youtube' && media.trailer?.id ? `https://www.youtube.com/watch?v=${media.trailer.id}` : '',
    fullVideo: '',
    hook: '',
    synopsis: stripHtml(media.description) || 'No synopsis provided.',
    cast: '',
    mood: genres.slice(0, 3).join(', '),
    studio: mainStudio,
    director: '',
    audio: '',
    subtitles: '',
    maturityDesc: media.status ? `Status: ${media.status.replace(/_/g, ' ')}` : '',
    episodes: generatedEpisodes,
    relatedIds
  };
}

const MEDIA_FIELDS = `
  id
  title {
    romaji
    english
    native
  }
  coverImage {
    extraLarge
    large
    medium
    color
  }
  bannerImage
  description(asHtml: false)
  genres
  season
  seasonYear
  startDate {
    year
  }
  episodes
  duration
  status
  averageScore
  meanScore
  popularity
  format
  trailer {
    id
    site
    thumbnail
  }
  studios(isMain: true) {
    nodes {
      id
      name
      isAnimationStudio
    }
  }
  nextAiringEpisode {
    episode
    airingAt
    timeUntilAiring
  }
  relations {
    edges {
      relationType
      node {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        bannerImage
        format
        averageScore
      }
    }
  }
  recommendations(sort: RATING_DESC, perPage: 8) {
    nodes {
      mediaRecommendation {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        bannerImage
        format
        averageScore
        genres
      }
    }
  }
`;

/**
 * Fetch Trending Anime from AniList
 */
export async function fetchTrending(page = 1, perPage = 18): Promise<AnimeData[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: [TRENDING_DESC, POPULARITY_DESC]) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  try {
    const data = await fetchAniListGraphQL<{ Page: { media: AniListMedia[] } }>(query, { page, perPage });
    return (data?.Page?.media || []).map(mapAniListToAnimeData);
  } catch (err) {
    console.warn('Failed to fetch trending anime from AniList', err);
    return [];
  }
}

/**
 * Fetch Popular This Season Anime
 */
export async function fetchPopularThisSeason(page = 1, perPage = 18): Promise<AnimeData[]> {
  const currentMonth = new Date().getMonth();
  let season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' = 'WINTER';
  if (currentMonth >= 2 && currentMonth <= 4) season = 'SPRING';
  else if (currentMonth >= 5 && currentMonth <= 7) season = 'SUMMER';
  else if (currentMonth >= 8 && currentMonth <= 10) season = 'FALL';

  const seasonYear = new Date().getFullYear();

  const query = `
    query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await fetchAniListGraphQL<{ Page: { media: AniListMedia[] } }>(query, {
    season,
    seasonYear,
    page,
    perPage
  });
  return (data?.Page?.media || []).map(mapAniListToAnimeData);
}

/**
 * Fetch Top Rated Anime
 */
export async function fetchTopRated(page = 1, perPage = 18): Promise<AnimeData[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: SCORE_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await fetchAniListGraphQL<{ Page: { media: AniListMedia[] } }>(query, { page, perPage });
  return (data?.Page?.media || []).map(mapAniListToAnimeData);
}

/**
 * Fetch Anime by Genre
 */
export async function fetchByGenre(genre: string, page = 1, perPage = 18): Promise<AnimeData[]> {
  const query = `
    query ($genre: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, genre: $genre, sort: POPULARITY_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await fetchAniListGraphQL<{ Page: { media: AniListMedia[] } }>(query, { genre, page, perPage });
  return (data?.Page?.media || []).map(mapAniListToAnimeData);
}

/**
 * Search Anime by Query String
 */
export async function searchAnime(searchStr: string, page = 1, perPage = 20): Promise<AnimeData[]> {
  const trimmed = searchStr.trim();
  if (!trimmed) return [];

  const query = `
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, search: $search, sort: SEARCH_MATCH) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await fetchAniListGraphQL<{ Page: { media: AniListMedia[] } }>(query, {
    search: trimmed,
    page,
    perPage
  });
  return (data?.Page?.media || []).map(mapAniListToAnimeData);
}

/**
 * Fetch a Single Anime by AniList ID
 */
export async function fetchAnimeById(id: number | string): Promise<AnimeData | null> {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (!numericId || isNaN(numericId)) return null;

  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FIELDS}
      }
    }
  `;
  try {
    const data = await fetchAniListGraphQL<{ Media: AniListMedia | null }>(query, { id: numericId });
    if (!data?.Media) return null;
    return mapAniListToAnimeData(data.Media);
  } catch (err) {
    console.warn(`Failed to fetch anime id ${id} from AniList`, err);
    return null;
  }
}

/**
 * Fetch Multiple Anime by AniList IDs
 */
export async function fetchAnimeByIds(ids: (number | string)[]): Promise<AnimeData[]> {
  const numericIds = ids
    .map((id) => (typeof id === 'string' ? parseInt(id, 10) : id))
    .filter((id) => !isNaN(id) && id > 0);

  if (numericIds.length === 0) return [];

  const query = `
    query ($ids: [Int]) {
      Page(page: 1, perPage: 50) {
        media(id_in: $ids, type: ANIME) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  try {
    const data = await fetchAniListGraphQL<{ Page: { media: AniListMedia[] } }>(query, { ids: numericIds });
    return (data?.Page?.media || []).map(mapAniListToAnimeData);
  } catch (err) {
    console.warn('Failed to fetch anime by ids', err);
    return [];
  }
}

/**
 * Fetch Live Airing Schedule for Simulcast Tracker
 */
export async function fetchLiveAiringSchedule(page = 1, perPage = 12): Promise<LiveScheduleItem[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) {
          id
          title { english romaji native }
          coverImage { extraLarge large color }
          bannerImage
          averageScore
          episodes
          nextAiringEpisode { episode airingAt timeUntilAiring }
        }
      }
    }
  `;
  try {
    const data = await fetchAniListGraphQL<{ Page: { media: any[] } }>(query, { page, perPage });
    const mediaList = data?.Page?.media || [];
    return mediaList.map((m) => {
      const hours = m.nextAiringEpisode ? Math.round(m.nextAiringEpisode.timeUntilAiring / 3600) : null;
      return {
        id: m.id,
        title: m.title.english || m.title.romaji,
        romajiTitle: m.title.romaji,
        posterImage: m.coverImage?.extraLarge || m.coverImage?.large,
        bannerImage: m.bannerImage || m.coverImage?.extraLarge,
        score: m.averageScore,
        nextEpisode: m.nextAiringEpisode?.episode,
        airingAt: m.nextAiringEpisode?.airingAt,
        timeUntilAiringStr:
          hours !== null
            ? hours > 24
              ? `in ${Math.round(hours / 24)} days`
              : hours > 0
              ? `in ${hours} hours`
              : 'airing soon'
            : 'Simulcast'
      };
    });
  } catch (err) {
    console.warn('Failed to fetch live airing schedule', err);
    return [];
  }
}
