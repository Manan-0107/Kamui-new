import { NextRequest, NextResponse } from 'next/server';
import { getLiveAnimeRatings, getCachedRatings } from '@/lib/animeRatings';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const animeId = searchParams.get('id') || 'kamui';
  const title = searchParams.get('title') || undefined;

  try {
    const ratings = await getLiveAnimeRatings(animeId, title);
    return NextResponse.json({
      success: true,
      animeId,
      ratings
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (err: any) {
    const fallback = getCachedRatings(animeId);
    return NextResponse.json({
      success: true,
      animeId,
      ratings: fallback,
      fallback: true
    });
  }
}
