'use client';

import React from 'react';
import { usePlayback } from '@/context/PlaybackContext';

const GENRES = [
  'all',
  'watchlist',
  'Dark fantasy',
  'Sci-fi',
  'Mecha',
  'Mystery',
  'Romance',
  'Slice of life',
  'Adventure',
  'Psychological'
];

export const FilterChips: React.FC = () => {
  const { filterGenre, setFilterGenre, watchlist } = usePlayback();

  return (
    <section className="watch-hero" style={{ padding: '24px 0 10px', minHeight: 'auto' }}>
      <div className="wrap">
        <div className="filter-bar" id="filterBar">
          {GENRES.map((genre) => {
            if (genre === 'all') {
              return (
                <button
                  key="all"
                  className={`filter-chip ${filterGenre === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterGenre('all')}
                >
                  All
                </button>
              );
            }
            if (genre === 'watchlist') {
              return (
                <button
                  key="watchlist"
                  className={`filter-chip filter-chip-watchlist ${filterGenre === 'watchlist' ? 'active' : ''}`}
                  id="filterMyListChip"
                  title="Filter by your saved shows"
                  onClick={() => setFilterGenre('watchlist')}
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                  </svg>
                  My List <span className="chip-counter" id="watchlistCountBadge">{watchlist.length}</span>
                </button>
              );
            }
            return (
              <button
                key={genre}
                className={`filter-chip ${filterGenre === genre ? 'active' : ''}`}
                onClick={() => setFilterGenre(genre)}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
