'use client';

import React from 'react';
import { Sparkles, ThumbsUp, Bookmark, Film, Flame } from 'lucide-react';
import { usePlayback } from '@/context/PlaybackContext';

interface GenreChip {
  id: string;
  label: string;
  sectionId: string;
  icon?: React.ReactNode;
  special?: boolean;
}

export const FilterChips: React.FC = () => {
  const { filterGenre, setFilterGenre, watchlist, likedTitles } = usePlayback();

  const GENRES: GenreChip[] = [
    {
      id: 'all',
      label: 'All',
      sectionId: 'contentRowsContainer',
      icon: <Sparkles size={12} className="chip-icon" />
    },
    {
      id: 'liked',
      label: 'Liked',
      sectionId: 'likedAnimeSection',
      icon: <ThumbsUp size={12} className="chip-icon" />,
      special: true
    },
    {
      id: 'watchlist',
      label: 'My List',
      sectionId: 'myWatchlistSection',
      icon: <Bookmark size={12} className="chip-icon" />,
      special: true
    },
    { id: 'Dark fantasy', label: 'Dark Fantasy', sectionId: 'darkFantasySection' },
    { id: 'Sci-fi', label: 'Sci-Fi', sectionId: 'scifiSection' },
    { id: 'Mecha', label: 'Mecha', sectionId: 'mechaSection' },
    { id: 'Mystery', label: 'Mystery', sectionId: 'mysterySection' },
    { id: 'Romance', label: 'Romance', sectionId: 'romanceSection' },
    { id: 'Slice of life', label: 'Slice of Life', sectionId: 'sliceOfLifeSection' },
    { id: 'Adventure', label: 'Adventure', sectionId: 'adventureSection' },
    { id: 'Psychological', label: 'Psychological', sectionId: 'psychologicalSection' },
    {
      id: 'Movies',
      label: 'Movies',
      sectionId: 'moviesSection',
      icon: <Film size={12} className="chip-icon" />
    }
  ];

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
          {GENRES.map((item) => {
            const isActive = filterGenre.toLowerCase() === item.id.toLowerCase();
            const count =
              item.id === 'liked'
                ? likedTitles.length
                : item.id === 'watchlist'
                ? watchlist.length
                : 0;

            return (
              <button
                key={item.id}
                id={`filter-chip-${item.id.toLowerCase().replace(/[\s&]+/g, '-')}`}
                type="button"
                className={`filter-chip ${isActive ? 'active' : ''} ${item.special ? 'chip-special' : ''}`}
                data-section={item.sectionId}
                onClick={() => handleChipClick(item)}
                title={`View ${item.label} collection`}
              >
                {item.icon}
                <span className="chip-label">{item.label}</span>
                {count > 0 && <span className="chip-count-badge">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
