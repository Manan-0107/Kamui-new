'use client';

import React from 'react';
import { usePlayback } from '@/context/PlaybackContext';

const GENRES = [
  'all',
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
  const { filterGenre, setFilterGenre } = usePlayback();

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
