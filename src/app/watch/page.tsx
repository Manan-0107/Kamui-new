'use client';

import React, { useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BillboardHero } from '@/components/watch/BillboardHero';
import { FilterChips } from '@/components/watch/FilterChips';
import { ContentRow } from '@/components/watch/ContentRow';
import { Top10Track } from '@/components/watch/Top10Track';
import { ContinueWatchingShelf } from '@/components/watch/ContinueWatchingShelf';
import { WatchCard } from '@/components/watch/WatchCard';
import { LiveAiringTrackerShelf } from '@/components/watch/LiveAiringTrackerShelf';
import { usePlayback } from '@/context/PlaybackContext';
import { useAnimeSearch, useCatalogRow, CatalogRowKind } from '@/hooks/useAnime';

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

  // Live AniList search
  const { results: searchResults, isLoading: isSearchLoading } = useAnimeSearch(searchQuery);

  // Determine Catalog Grid Kind based on active filter
  const gridKind: CatalogRowKind = useMemo(() => {
    if (filterGenre === 'all') return 'popular';
    if (filterGenre === 'watchlist') return { ids: watchlist };
    if (filterGenre === 'liked') return { ids: likedTitles };
    if (filterGenre.startsWith('tracking-')) {
      const statusKey = filterGenre.replace('tracking-', '');
      const matchedIds = Object.keys(trackerStatus).filter((id) => trackerStatus[id] === statusKey);
      return { ids: matchedIds };
    }
    return { genre: filterGenre };
  }, [filterGenre, watchlist, likedTitles, trackerStatus]);

  const { animes: gridAnimes, isLoading: isGridLoading } = useCatalogRow(gridKind, 24);

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
          animes={searchResults}
          alwaysShow
          emptyMessage={isSearchLoading ? 'Searching AniList...' : 'No anime found matching your query.'}
        />
      )}

      {/* Filter Chips Bar */}
      <FilterChips />

      {/* Netflix Horizontal Content Rows */}
      <div className="netflix-browse-container" id="contentRowsContainer">
        {/* Row 1: Continue Watching */}
        <ContinueWatchingShelf />

        {/* Real-Time Live Simulcast Airing Tracker Shelf (AniList API) */}
        <LiveAiringTrackerShelf />

        {/* Row 2: Trending Now */}
        <ContentRow
          id="trendingSection"
          kanji="熱"
          title="Trending Now on AniList"
          kind="trending"
        />

        {/* Row 3: Popular This Season */}
        <ContentRow
          id="popularSection"
          kanji="旬"
          title="Popular This Season"
          kind="popular"
        />

        {/* Row 4: My Watchlist */}
        <ContentRow
          id="myWatchlistSection"
          kanji="録"
          title="My Watchlist"
          countBadge={watchlist.length}
          animeIds={watchlist}
          alwaysShow
          emptyMessage="Your watchlist is empty. Bookmark any anime to build your personal library!"
        />

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

        {/* Row 7: Action & Shonen */}
        <ContentRow
          id="actionSection"
          kanji="闘"
          title="Action & Shonen"
          kind={{ genre: 'Action' }}
        />

        {/* Row 8: Fantasy & Supernatural */}
        <ContentRow
          id="darkFantasySection"
          kanji="闇"
          title="Fantasy & Supernatural"
          kind={{ genre: 'Fantasy' }}
        />

        {/* Row 9: Sci-Fi & Cyberpunk */}
        <ContentRow
          id="scifiSection"
          kanji="機"
          title="Sci-Fi & Cyberpunk"
          kind={{ genre: 'Sci-Fi' }}
        />

        {/* Row 10: Mecha & Machines */}
        <ContentRow
          id="mechaSection"
          kanji="甲"
          title="Mecha & Heavy Machinery"
          kind={{ genre: 'Mecha' }}
        />

        {/* Row 11: Mystery & Suspense */}
        <ContentRow
          id="mysterySection"
          kanji="謎"
          title="Mystery & Suspense"
          kind={{ genre: 'Mystery' }}
        />

        {/* Row 12: Romance & Drama */}
        <ContentRow
          id="romanceSection"
          kanji="愛"
          title="Romance & Drama"
          kind={{ genre: 'Romance' }}
        />

        {/* Row 13: Slice of Life & Comedy */}
        <ContentRow
          id="sliceOfLifeSection"
          kanji="日"
          title="Slice of Life & Comedy"
          kind={{ genre: 'Slice of Life' }}
        />

        {/* Row 14: Adventure & Expeditions */}
        <ContentRow
          id="adventureSection"
          kanji="旅"
          title="Adventure & Expeditions"
          kind={{ genre: 'Adventure' }}
        />

        {/* Row 15: Psychological */}
        <ContentRow
          id="psychologicalSection"
          kanji="心"
          title="Psychological Thrillers"
          kind={{ genre: 'Psychological' }}
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
                  ? 'Popular Series'
                  : filterGenre === 'watchlist'
                  ? 'My Watchlist'
                  : filterGenre === 'liked'
                  ? 'Liked Anime'
                  : `${filterGenre} Series`}
              </h2>
            </div>
            <div className="text-xs text-text-muted">
              Data provided by <a href="https://anilist.co" target="_blank" rel="noreferrer" className="underline hover:text-accent">AniList</a>
            </div>
          </div>

          <div className="catalog-grid" id="catalogGrid">
            {isGridLoading && gridAnimes.length === 0
              ? Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="watch-card skeleton-card"
                    style={{
                      height: 260,
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}
                  />
                ))
              : gridAnimes.map((anime) => (
                  <WatchCard key={anime.id} anime={anime} />
                ))}
          </div>

          {!isGridLoading && gridAnimes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.5)' }}>
              No anime found in this category.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
