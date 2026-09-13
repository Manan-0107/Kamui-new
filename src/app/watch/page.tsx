'use client';

import React, { useMemo, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BillboardHero } from '@/components/watch/BillboardHero';
import { FilterChips } from '@/components/watch/FilterChips';
import { ContentRow } from '@/components/watch/ContentRow';
import { Top10Track } from '@/components/watch/Top10Track';
import { ContinueWatchingShelf } from '@/components/watch/ContinueWatchingShelf';
import { WatchCard } from '@/components/watch/WatchCard';
import { usePlayback } from '@/context/PlaybackContext';
import { ANIME_CATALOG, CATALOG_IDS } from '@/lib/catalog';

export default function WatchPage() {
  const { filterGenre, searchQuery, watchlist, likedTitles, clearLikedTitles, trackerStatus } = usePlayback();

  // Handle hash scrolling on page load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.slice(1);
      const timer = setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  // Search Results filtering
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return CATALOG_IDS.filter((id) => {
      const anime = ANIME_CATALOG[id];
      if (!anime) return false;
      return (
        anime.title.toLowerCase().includes(q) ||
        anime.genres.some((g) => g.toLowerCase().includes(q)) ||
        anime.genre.toLowerCase().includes(q) ||
        anime.cast.toLowerCase().includes(q) ||
        anime.synopsis.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  // Personalized suggestions based on what the user liked
  const recommendedData = useMemo(() => {
    if (likedTitles.length > 0) {
      const lastLikedId = likedTitles[likedTitles.length - 1];
      const sourceAnime = ANIME_CATALOG[lastLikedId];
      if (sourceAnime) {
        const recs = CATALOG_IDS.filter(
          (id) =>
            id !== sourceAnime.id &&
            (sourceAnime.relatedIds.includes(id) ||
              ANIME_CATALOG[id].genres.some((g) => sourceAnime.genres.includes(g)))
        );
        return {
          title: `Because You Liked "${sourceAnime.title}"`,
          kanji: '推',
          animeIds: recs.length > 0 ? recs : ['kamui', 'iron-tide', 'ashfall-district']
        };
      }
    }
    return {
      title: 'Recommended For You',
      kanji: '推',
      animeIds: ['kamui', 'ashfall-district', 'paper-moon-society', 'nine-crows-inn']
    };
  }, [likedTitles]);

  // Simulcast Airing Schedule & What's New
  const simulcastScheduleIds = useMemo(() => {
    return CATALOG_IDS.filter((id) => Boolean(ANIME_CATALOG[id]?.nextAiring));
  }, []);

  // Catalog Grid filtering
  const filteredCatalogIds = useMemo(() => {
    if (filterGenre === 'all') return CATALOG_IDS;
    if (filterGenre === 'watchlist') return watchlist;
    if (filterGenre === 'liked') return likedTitles;
    if (filterGenre === 'tracking-watching') {
      return CATALOG_IDS.filter((id) => trackerStatus[id] === 'watching');
    }
    if (filterGenre === 'tracking-planning') {
      return CATALOG_IDS.filter((id) => trackerStatus[id] === 'planning');
    }
    if (filterGenre === 'tracking-completed') {
      return CATALOG_IDS.filter((id) => trackerStatus[id] === 'completed');
    }
    return CATALOG_IDS.filter((id) => {
      const anime = ANIME_CATALOG[id];
      if (!anime) return false;
      return (
        anime.genre.toLowerCase() === filterGenre.toLowerCase() ||
        anime.genres.some((g) => g.toLowerCase() === filterGenre.toLowerCase())
      );
    });
  }, [filterGenre, watchlist, likedTitles, trackerStatus]);

  return (
    <>
      <Navbar />

      {/* Billboard Spotlight Hero */}
      <BillboardHero />

      {/* Live Search Results Section */}
      {searchQuery.trim().length > 0 && (
        <ContentRow
          id="searchResultsSection"
          kanji="探"
          title={`Search Results for "${searchQuery}"`}
          countBadge={searchResults.length}
          animeIds={searchResults}
        />
      )}

      {/* Filter Chips Bar */}
      <FilterChips />

      {/* Netflix Horizontal Content Rows */}
      <div className="netflix-browse-container" id="contentRowsContainer">
        {/* Row 1: Continue Watching */}
        <ContinueWatchingShelf />

        {/* Row 2: Recommended / Because You Liked */}
        <ContentRow
          id="recommendedSection"
          kanji={recommendedData.kanji}
          title={recommendedData.title}
          animeIds={recommendedData.animeIds}
        />

        {/* Row 3: Simulcast Drops & Airing Schedule */}
        <ContentRow
          id="simulcastScheduleSection"
          kanji="放"
          title="Simulcast Drops & Airing Schedule"
          countBadge={simulcastScheduleIds.length}
          animeIds={simulcastScheduleIds}
        />

        {/* Row 4: My Watchlist */}
        {watchlist.length > 0 && (
          <ContentRow
            id="myWatchlistSection"
            kanji="録"
            title="My Watchlist"
            countBadge={watchlist.length}
            animeIds={watchlist}
          />
        )}

        {/* Row 5: Liked Anime */}
        {likedTitles.length > 0 && (
          <ContentRow
            id="likedAnimeSection"
            kanji="好"
            title="Liked Anime"
            countBadge={likedTitles.length}
            animeIds={likedTitles}
            onClear={clearLikedTitles}
            clearLabel="Clear All"
          />
        )}

        {/* Row 6: Top 10 in Anime Today */}
        <Top10Track />

        {/* Row 7: Trending Now & Simulcasts */}
        <ContentRow
          id="trendingSection"
          kanji="熱"
          title="Trending Now & Simulcasts"
          animeIds={['ashfall-district', 'kamui', 'iron-tide', 'nine-crows-inn', 'long-thaw', 'paper-moon-society']}
        />

        {/* Row 6: New on Kamui */}
        <ContentRow
          id="newSection"
          kanji="新"
          title="New on Kamui"
          animeIds={['nine-crows-inn', 'long-thaw', 'hollow-meridian', 'glasshouse', 'ashfall-district', 'kamui']}
        />

        {/* Row 7: Dark Fantasy & Supernatural */}
        <ContentRow
          id="darkFantasySection"
          kanji="闇"
          title="Dark Fantasy & Supernatural"
          animeIds={['kamui', 'long-thaw', 'nine-crows-inn', 'static-requiem']}
        />

        {/* Row 8: Sci-Fi & Cyberpunk */}
        <ContentRow
          id="scifiSection"
          kanji="機"
          title="Sci-Fi & Cyberpunk"
          animeIds={['ashfall-district', 'iron-tide', 'static-requiem', 'hollow-meridian']}
        />

        {/* Row 9: Mecha & Titan Pilot Combat */}
        <ContentRow
          id="mechaSection"
          kanji="甲"
          title="Mecha & Heavy Machinery"
          animeIds={['iron-tide', 'ashfall-district', 'static-requiem', 'kamui']}
        />

        {/* Row 10: Mystery & Clever Whodunits */}
        <ContentRow
          id="mysterySection"
          kanji="謎"
          title="Mystery & Suspense"
          animeIds={['nine-crows-inn', 'static-requiem', 'ashfall-district', 'kamui']}
        />

        {/* Row 11: Romance & Emotional Drama */}
        <ContentRow
          id="romanceSection"
          kanji="愛"
          title="Romance & Drama"
          animeIds={['glasshouse', 'paper-moon-society', 'papermoon-movie', 'hollow-meridian']}
        />

        {/* Row 12: Cozy Slice of Life & Comedy */}
        <ContentRow
          id="sliceOfLifeSection"
          kanji="日"
          title="Cozy Slice of Life & Comedy"
          animeIds={['paper-moon-society', 'glasshouse', 'hollow-meridian']}
        />

        {/* Row 13: Adventure & Grand Expeditions */}
        <ContentRow
          id="adventureSection"
          kanji="旅"
          title="Adventure & Expeditions"
          animeIds={['hollow-meridian', 'kamui', 'long-thaw', 'iron-tide']}
        />

        {/* Row 14: Psychological Suspense & Thrillers */}
        <ContentRow
          id="psychologicalSection"
          kanji="心"
          title="Psychological Suspense"
          animeIds={['static-requiem', 'nine-crows-inn', 'kamui', 'ashfall-district']}
        />

        {/* Row 15: Feature Anime Movies */}
        <ContentRow
          id="moviesSection"
          kanji="映"
          title="Feature Anime Movies (4K HDR)"
          animeIds={['kamui-movie', 'ashfall-movie', 'papermoon-movie']}
        />
      </div>

      {/* Full Catalog Section */}
      <section className="catalog" id="fullCatalogSection">
        <div className="wrap">
          <div className="shelf-header" style={{ marginBottom: 18 }}>
            <div className="shelf-title-wrap">
              <span className="shelf-kanji">
                <span className="glyph">全</span> All Shows
              </span>
              <h2 className="shelf-title" id="catalogHeadingTitle">
                {filterGenre === 'all'
                  ? 'All Series'
                  : filterGenre === 'watchlist'
                  ? 'My Watchlist'
                  : filterGenre === 'liked'
                  ? 'Liked Anime'
                  : `${filterGenre} Series`}
              </h2>
            </div>
          </div>

          <div className="catalog-grid" id="catalogGrid">
            {filteredCatalogIds.map((id) => {
              const anime = ANIME_CATALOG[id];
              if (!anime) return null;
              return <WatchCard key={anime.id} anime={anime} />;
            })}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
