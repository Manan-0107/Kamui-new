import { AnimeRatings } from './types';

// Default realistic ratings for catalog anime across all 4 major platforms
export const DEFAULT_CATALOG_RATINGS: Record<string, AnimeRatings> = {
  kamui: {
    anilist: { score: 89, scoreFormatted: '89%', rank: '#18', votes: '142,500', url: 'https://anilist.co/search/anime?search=kamui' },
    mal: { score: 8.84, scoreFormatted: '8.84', rank: '#24', votes: '320,400', url: 'https://myanimelist.net/anime' },
    imdb: { score: 8.7, scoreFormatted: '8.7', votes: '48,200', url: 'https://www.imdb.com' },
    tmdb: { score: 86, scoreFormatted: '86%', votes: '1,920', url: 'https://www.themoviedb.org' }
  },
  'ashfall-district': {
    anilist: { score: 86, scoreFormatted: '86%', rank: '#42', votes: '98,000', url: 'https://anilist.co' },
    mal: { score: 8.52, scoreFormatted: '8.52', rank: '#68', votes: '210,000', url: 'https://myanimelist.net' },
    imdb: { score: 8.4, scoreFormatted: '8.4', votes: '31,500', url: 'https://www.imdb.com' },
    tmdb: { score: 83, scoreFormatted: '83%', votes: '1,450', url: 'https://www.themoviedb.org' }
  },
  'paper-moon-society': {
    anilist: { score: 88, scoreFormatted: '88%', rank: '#29', votes: '115,000', url: 'https://anilist.co' },
    mal: { score: 8.71, scoreFormatted: '8.71', rank: '#38', votes: '245,000', url: 'https://myanimelist.net' },
    imdb: { score: 8.5, scoreFormatted: '8.5', votes: '22,900', url: 'https://www.imdb.com' },
    tmdb: { score: 85, scoreFormatted: '85%', votes: '980', url: 'https://www.themoviedb.org' }
  },
  'iron-tide': {
    anilist: { score: 84, scoreFormatted: '84%', rank: '#55', votes: '82,000', url: 'https://anilist.co' },
    mal: { score: 8.36, scoreFormatted: '8.36', rank: '#92', votes: '180,000', url: 'https://myanimelist.net' },
    imdb: { score: 8.2, scoreFormatted: '8.2', votes: '19,400', url: 'https://www.imdb.com' },
    tmdb: { score: 81, scoreFormatted: '81%', votes: '840', url: 'https://www.themoviedb.org' }
  },
  'nine-crows-inn': {
    anilist: { score: 87, scoreFormatted: '87%', rank: '#34', votes: '104,000', url: 'https://anilist.co' },
    mal: { score: 8.65, scoreFormatted: '8.65', rank: '#46', votes: '228,000', url: 'https://myanimelist.net' },
    imdb: { score: 8.6, scoreFormatted: '8.6', votes: '38,000', url: 'https://www.imdb.com' },
    tmdb: { score: 84, scoreFormatted: '84%', votes: '1,120', url: 'https://www.themoviedb.org' }
  },
  glasshouse: {
    anilist: { score: 82, scoreFormatted: '82%', rank: '#88', votes: '64,000', url: 'https://anilist.co' },
    mal: { score: 8.18, scoreFormatted: '8.18', rank: '#135', votes: '140,000', url: 'https://myanimelist.net' },
    imdb: { score: 8.0, scoreFormatted: '8.0', votes: '14,200', url: 'https://www.imdb.com' },
    tmdb: { score: 80, scoreFormatted: '80%', votes: '620', url: 'https://www.themoviedb.org' }
  },
  'hollow-meridian': {
    anilist: { score: 85, scoreFormatted: '85%', rank: '#48', votes: '91,000', url: 'https://anilist.co' },
    mal: { score: 8.44, scoreFormatted: '8.44', rank: '#76', votes: '195,000', url: 'https://myanimelist.net' },
    imdb: { score: 8.3, scoreFormatted: '8.3', votes: '26,700', url: 'https://www.imdb.com' },
    tmdb: { score: 82, scoreFormatted: '82%', votes: '910', url: 'https://www.themoviedb.org' }
  },
  'static-requiem': {
    anilist: { score: 86, scoreFormatted: '86%', rank: '#39', votes: '88,000', url: 'https://anilist.co' },
    mal: { score: 8.58, scoreFormatted: '8.58', rank: '#59', votes: '187,000', url: 'https://myanimelist.net' },
    imdb: { score: 8.5, scoreFormatted: '8.5', votes: '33,100', url: 'https://www.imdb.com' },
    tmdb: { score: 84, scoreFormatted: '84%', votes: '1,050', url: 'https://www.themoviedb.org' }
  },
  'long-thaw': {
    anilist: { score: 87, scoreFormatted: '87%', rank: '#32', votes: '109,000', url: 'https://anilist.co' },
    mal: { score: 8.62, scoreFormatted: '8.62', rank: '#51', votes: '215,000', url: 'https://myanimelist.net' },
    imdb: { score: 8.5, scoreFormatted: '8.5', votes: '29,400', url: 'https://www.imdb.com' },
    tmdb: { score: 83, scoreFormatted: '83%', votes: '1,200', url: 'https://www.themoviedb.org' }
  },
  'kamui-movie': {
    anilist: { score: 91, scoreFormatted: '91%', rank: '#9', votes: '185,000', url: 'https://anilist.co' },
    mal: { score: 8.95, scoreFormatted: '8.95', rank: '#12', votes: '390,000', url: 'https://myanimelist.net' },
    imdb: { score: 8.9, scoreFormatted: '8.9', votes: '62,000', url: 'https://www.imdb.com' },
    tmdb: { score: 88, scoreFormatted: '88%', votes: '2,600', url: 'https://www.themoviedb.org' }
  },
  'ashfall-movie': {
    anilist: { score: 88, scoreFormatted: '88%', rank: '#27', votes: '120,000', url: 'https://anilist.co' },
    mal: { score: 8.68, scoreFormatted: '8.68', rank: '#43', votes: '250,000', url: 'https://myanimelist.net' },
    imdb: { score: 8.6, scoreFormatted: '8.6', votes: '41,000', url: 'https://www.imdb.com' },
    tmdb: { score: 85, scoreFormatted: '85%', votes: '1,800', url: 'https://www.themoviedb.org' }
  },
  'papermoon-movie': {
    anilist: { score: 89, scoreFormatted: '89%', rank: '#21', votes: '130,000', url: 'https://anilist.co' },
    mal: { score: 8.78, scoreFormatted: '8.78', rank: '#30', votes: '270,000', url: 'https://myanimelist.net' },
    imdb: { score: 8.7, scoreFormatted: '8.7', votes: '35,000', url: 'https://www.imdb.com' },
    tmdb: { score: 86, scoreFormatted: '86%', votes: '1,350', url: 'https://www.themoviedb.org' }
  }
};

const GENERIC_DEFAULT_RATINGS: AnimeRatings = {
  anilist: { score: 85, scoreFormatted: '85%', rank: '#50', votes: '75,000', url: 'https://anilist.co' },
  mal: { score: 8.45, scoreFormatted: '8.45', rank: '#80', votes: '160,000', url: 'https://myanimelist.net' },
  imdb: { score: 8.3, scoreFormatted: '8.3', votes: '20,000', url: 'https://www.imdb.com' },
  tmdb: { score: 82, scoreFormatted: '82%', votes: '800', url: 'https://www.themoviedb.org' }
};

// In-memory runtime cache
const memoryCache: Record<string, AnimeRatings> = { ...DEFAULT_CATALOG_RATINGS };

/**
 * Synchronously get ratings from cache or defaults
 */
export function getCachedRatings(animeId: string): AnimeRatings {
  if (memoryCache[animeId]) return memoryCache[animeId];
  return DEFAULT_CATALOG_RATINGS[animeId] || GENERIC_DEFAULT_RATINGS;
}

/**
 * Fetch live AniList data via AniList public GraphQL endpoint
 */
export async function fetchAniListRating(queryTitle: string): Promise<{ score: number; scoreFormatted: string; votes?: string; rank?: string } | null> {
  try {
    const query = `
      query ($search: String) {
        Media(search: $search, type: ANIME) {
          id
          averageScore
          meanScore
          favourites
          popularity
          rankings {
            rank
            type
            allTime
          }
        }
      }
    `;

    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        query,
        variables: { search: queryTitle }
      }),
      signal: AbortSignal.timeout(4000)
    });

    if (!res.ok) return null;
    const json = await res.json();
    const media = json?.data?.Media;
    if (!media) return null;

    const score = media.averageScore || media.meanScore;
    if (!score) return null;

    const allTimeRank = media.rankings?.find((r: any) => r.allTime && r.type === 'RATED')?.rank;

    return {
      score,
      scoreFormatted: `${score}%`,
      votes: media.popularity ? media.popularity.toLocaleString() : undefined,
      rank: allTimeRank ? `#${allTimeRank}` : undefined
    };
  } catch (err) {
    return null;
  }
}

/**
 * Fetch live MyAnimeList data via Jikan v4 REST API
 */
export async function fetchMyAnimeListRating(queryTitle: string): Promise<{ score: number; scoreFormatted: string; rank?: string; votes?: string } | null> {
  try {
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(queryTitle)}&limit=1`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000)
    });

    if (!res.ok) return null;
    const json = await res.json();
    const first = json?.data?.[0];
    if (!first || !first.score) return null;

    return {
      score: first.score,
      scoreFormatted: first.score.toFixed(2),
      rank: first.rank ? `#${first.rank}` : undefined,
      votes: first.members ? first.members.toLocaleString() : undefined
    };
  } catch (err) {
    return null;
  }
}

/**
 * Fetch live ratings from AniList and MyAnimeList and return unified multi-platform ratings
 */
export async function getLiveAnimeRatings(animeId: string, searchTitle?: string): Promise<AnimeRatings> {
  const cached = getCachedRatings(animeId);
  const title = searchTitle || animeId;

  try {
    // Check localStorage cache if in browser
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`kamui_ratings_${animeId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
          memoryCache[animeId] = parsed.ratings;
          return parsed.ratings;
        }
      }
    }

    const [anilistRes, malRes] = await Promise.allSettled([
      fetchAniListRating(title),
      fetchMyAnimeListRating(title)
    ]);

    const updated: AnimeRatings = {
      anilist: anilistRes.status === 'fulfilled' && anilistRes.value
        ? {
            score: anilistRes.value.score,
            scoreFormatted: anilistRes.value.scoreFormatted,
            rank: anilistRes.value.rank || cached.anilist.rank,
            votes: anilistRes.value.votes || cached.anilist.votes,
            url: `https://anilist.co/search/anime?search=${encodeURIComponent(title)}`
          }
        : cached.anilist,
      mal: malRes.status === 'fulfilled' && malRes.value
        ? {
            score: malRes.value.score,
            scoreFormatted: malRes.value.scoreFormatted,
            rank: malRes.value.rank || cached.mal.rank,
            votes: malRes.value.votes || cached.mal.votes,
            url: `https://myanimelist.net/search/all?q=${encodeURIComponent(title)}`
          }
        : cached.mal,
      imdb: cached.imdb,
      tmdb: cached.tmdb
    };

    memoryCache[animeId] = updated;

    if (typeof window !== 'undefined') {
      localStorage.setItem(`kamui_ratings_${animeId}`, JSON.stringify({
        ratings: updated,
        timestamp: Date.now()
      }));
    }

    return updated;
  } catch (e) {
    return cached;
  }
}
