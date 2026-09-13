import { NextRequest, NextResponse } from 'next/server';
import { getLiveAnimeFullMetadata, getCachedRatings } from '@/lib/animeRatings';
import { ANIME_IMAGE_MAP } from '@/lib/catalog';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const animeId = searchParams.get('id') || 'kamui';
  const title = searchParams.get('title') || undefined;

  try {
    const data = await getLiveAnimeFullMetadata(animeId, title);
    const catalogImg = ANIME_IMAGE_MAP[animeId];

    return NextResponse.json(
      {
        success: true,
        animeId,
        ratings: data.ratings,
        posterImage: data.posterImage || catalogImg?.poster,
        bannerImage: data.bannerImage || catalogImg?.banner,
        nextAiring: data.nextAiring || catalogImg?.nextAiring
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );
  } catch (err: any) {
    const fallback = getCachedRatings(animeId);
    const catalogImg = ANIME_IMAGE_MAP[animeId];
    return NextResponse.json({
      success: true,
      animeId,
      ratings: fallback,
      posterImage: catalogImg?.poster,
      bannerImage: catalogImg?.banner,
      nextAiring: catalogImg?.nextAiring,
      fallback: true
    });
  }
}
