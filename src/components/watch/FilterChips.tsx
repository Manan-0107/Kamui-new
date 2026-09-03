'use client';

import React from 'react';
import { usePlayback } from '@/context/PlaybackContext';

interface GenreChip {
  id: string;
  label: string;
  sectionId: string;
}

const GENRES: GenreChip[] = [
  { id: 'all', label: 'All', sectionId: 'contentRowsContainer' },
  { id: 'liked', label: '👍 Liked', sectionId: 'likedAnimeSection' },
  { id: 'watchlist', label: '🔖 My List', sectionId: 'myWatchlistSection' },
  { id: 'Dark fantasy', label: 'Dark fantasy', sectionId: 'darkFantasySection' },
  { id: 'Sci-fi', label: 'Sci-fi', sectionId: 'scifiSection' },
  { id: 'Mecha', label: 'Mecha', sectionId: 'mechaSection' },
  { id: 'Mystery', label: 'Mystery', sectionId: 'mysterySection' },
  { id: 'Romance', label: 'Romance', sectionId: 'romanceSection' },
  { id: 'Slice of life', label: 'Slice of life', sectionId: 'sliceOfLifeSection' },
  { id: 'Adventure', label: 'Adventure', sectionId: 'adventureSection' },
  { id: 'Psychological', label: 'Psychological', sectionId: 'psychologicalSection' },
  { id: 'Movies', label: 'Movies', sectionId: 'moviesSection' }
];

export const FilterChips: React.FC = () => {
  const { filterGenre, setFilterGenre } = usePlayback();

  const handleChipClick = (item: GenreChip) => {
    setFilterGenre(item.id);
    const targetEl = document.getElementById(item.sectionId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const fullCat = document.getElementById('fullCatalogSection');
      if (fullCat) {
        fullCat.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section className="filter-chips-section" id="filterChipsSection">
      <div className="wrap">
        <div className="filter-bar" id="filterBar">
          {GENRES.map((item) => (
            <button
              key={item.id}
              id={`filter-chip-${item.id.toLowerCase().replace(/[\s&]+/g, '-')}`}
              type="button"
              className={`filter-chip ${filterGenre.toLowerCase() === item.id.toLowerCase() ? 'active' : ''}`}
              data-section={item.sectionId}
              onClick={() => handleChipClick(item)}
              title={`View ${item.label} section`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
