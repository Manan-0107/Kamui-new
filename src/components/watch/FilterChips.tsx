'use client';

import React from 'react';
import { usePlayback } from '@/context/PlaybackContext';

const GENRES = [
  'all',
  'Movies',
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
    <section className="filter-chips-section" id="filterChipsSection">
      <div className="wrap">
        <div className="filter-bar" id="filterBar">
          {GENRES.map((genre) => {
            if (genre === 'all') {
              return (
                <button
                  key="all"
                  type="button"
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
                type="button"
                className={`filter-chip ${filterGenre.toLowerCase() === genre.toLowerCase() ? 'active' : ''}`}
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
