import { NextRequest, NextResponse } from 'next/server';
import { getLiveAnimeFullMetadata, getCachedRatings, resolveAnimeSearchQuery } from '@/lib/animeRatings';
import { ANIME_IMAGE_MAP, ANIME_CATALOG } from '@/lib/catalog';

interface AniListScheduleMedia {
  id: number;
  title: { english?: string; romaji: string; native?: string };
  coverImage: { extraLarge?: string; large?: string; color?: string };
  bannerImage?: string;
  averageScore?: number;
  episodes?: number;
  nextAiringEpisode?: {
    episode: number;
    airingAt: number;
    timeUntilAiring: number;
  };
}

async function fetchLiveSimulcastSchedule(): Promise<any[]> {
  try {
    const query = `
      query {
        Page(page: 1, perPage: 12) {
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

    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'KamuiApp/1.0'
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(4000)
    });

    if (!res.ok) return [];
    const json = await res.json();
    const mediaList: AniListScheduleMedia[] = json?.data?.Page?.media || [];

    return mediaList.map((m) => {
      const hours = m.nextAiringEpisode
        ? Math.round(m.nextAiringEpisode.timeUntilAiring / 3600)
        : null;

      return {
        id: m.id,
        title: m.title.english || m.title.romaji,
        romajiTitle: m.title.romaji,
        posterImage: m.coverImage.extraLarge || m.coverImage.large,
        bannerImage: m.bannerImage,
        score: m.averageScore,
        nextEpisode: m.nextAiringEpisode?.episode,
        airingAt: m.nextAiringEpisode?.airingAt,
        timeUntilAiringStr:
          hours !== null
            ? hours > 24
              ? `in ${Math.round(hours / 24)} days`
              : `in ${hours} hours`
            : null
      };
    });
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const animeId = searchParams.get('id') || 'kamui';
  const customQuery = searchParams.get('query') || undefined;

  // Real-time live airing schedule action
  if (action === 'live-schedule') {
    const schedule = await fetchLiveSimulcastSchedule();
    return NextResponse.json(
      {
        success: true,
        action: 'live-schedule',
        count: schedule.length,
        schedule,
        apisUsed: ['AniList GraphQL API (Real-Time)']
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400'
        }
      }
    );
  }

  // Real-time tracking data for a specific title
  try {
    const resolvedQuery = resolveAnimeSearchQuery(animeId, customQuery);
    const catalogEntry = ANIME_CATALOG[animeId];
    const catalogImg = ANIME_IMAGE_MAP[animeId];
    const meta = await getLiveAnimeFullMetadata(animeId, resolvedQuery);

    return NextResponse.json(
      {
        success: true,
        animeId,
        displayTitle: catalogEntry?.title || animeId,
        matchedQuery: resolvedQuery,
        ratings: meta.ratings,
        posterImage: meta.posterImage || catalogImg?.poster,
        bannerImage: meta.bannerImage || catalogImg?.banner,
        nextAiring: meta.nextAiring || catalogImg?.nextAiring,
        status: meta.status || 'RELEASING',
        totalEpisodes: meta.totalEpisodes || catalogEntry?.episodes?.length || 24,
        apisUsed: [
          'AniList GraphQL API (v2)',
          'MyAnimeList API (Jikan v4)',
          'Kitsu REST API (v2)'
        ]
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );
  } catch (err: any) {
    const fallbackRatings = getCachedRatings(animeId);
    const catalogImg = ANIME_IMAGE_MAP[animeId];
    const catalogEntry = ANIME_CATALOG[animeId];

    return NextResponse.json({
      success: true,
      animeId,
      displayTitle: catalogEntry?.title || animeId,
      ratings: fallbackRatings,
      posterImage: catalogImg?.poster,
      bannerImage: catalogImg?.banner,
      nextAiring: catalogImg?.nextAiring,
      fallback: true
    });
  }
}
