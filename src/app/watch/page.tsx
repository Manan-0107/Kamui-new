'use client';

import React, { useMemo } from 'react';
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
  const { filterGenre, searchQuery, watchlist } = usePlayback();

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

  // Catalog Grid filtering
  const filteredCatalogIds = useMemo(() => {
    if (filterGenre === 'all') return CATALOG_IDS;
    if (filterGenre === 'watchlist') return watchlist;
    return CATALOG_IDS.filter((id) => {
      const anime = ANIME_CATALOG[id];
      if (!anime) return false;
      return (
        anime.genre.toLowerCase() === filterGenre.toLowerCase() ||
        anime.genres.some((g) => g.toLowerCase() === filterGenre.toLowerCase())
      );
    });
  }, [filterGenre, watchlist]);

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

        {/* Row 2: My Watchlist */}
        {watchlist.length > 0 && (
          <ContentRow
            id="myWatchlistSection"
            kanji="録"
            title="My Watchlist"
            countBadge={watchlist.length}
            animeIds={watchlist}
          />
        )}

        {/* Row 3: Top 10 in Anime Today */}
        <Top10Track />

        {/* Row 4: Trending Now & Simulcasts */}
        <ContentRow
          id="trendingSection"
          kanji="熱"
          title="Trending Now & Simulcasts"
          animeIds={['ashfall-district', 'kamui', 'iron-tide', 'nine-crows-inn', 'long-thaw', 'paper-moon-society']}
        />

        {/* Row 5: New on Kamui */}
        <ContentRow
          id="newSection"
          kanji="新"
          title="New on Kamui"
          animeIds={['nine-crows-inn', 'long-thaw', 'hollow-meridian', 'glasshouse', 'ashfall-district', 'kamui']}
        />

        {/* Row 6: Dark Fantasy & Supernatural */}
        <ContentRow
          id="darkFantasySection"
          kanji="闇"
          title="Dark Fantasy & Supernatural"
          animeIds={['kamui', 'long-thaw', 'nine-crows-inn', 'static-requiem']}
        />

        {/* Row 7: Sci-Fi, Cyberpunk & Mecha */}
        <ContentRow
          id="scifiSection"
          kanji="機"
          title="Sci-Fi, Cyberpunk & Mecha"
          animeIds={['ashfall-district', 'iron-tide', 'static-requiem', 'hollow-meridian']}
        />

        {/* Row 8: Cozy Slice of Life & Romance */}
        <ContentRow
          id="sliceOfLifeSection"
          kanji="恋"
          title="Cozy Slice of Life & Romance"
          animeIds={['paper-moon-society', 'glasshouse', 'hollow-meridian']}
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
