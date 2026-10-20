'use client';

import React, { useRef } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { useCatalogRow } from '@/hooks/useAnime';
import { AnimeImagePreview } from '@/components/visual/AnimeImagePreview';

export const Top10Track: React.FC = () => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { openPreview, setHoveredCard } = usePlayback();

  const { animes: top10Animes, isLoading } = useCatalogRow('topRated', 10);

  const handleScrollLeft = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -600, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: 600, behavior: 'smooth' });
    }
  };

  if (!isLoading && top10Animes.length === 0) return null;

  return (
    <section className="content-row-section" id="top10Section" aria-label="Top 10 in Anime Today">
      <div className="row-header">
        <div className="row-title-wrap">
          <span className="row-kanji-glyph">十</span>
          <h2 className="row-title">Top 10 in Anime Today</h2>
        </div>
      </div>
      <div className="row-track-wrapper">
        <button
          type="button"
          className="row-arrow row-arrow-left"
          aria-label="Scroll left"
          onClick={handleScrollLeft}
        >
          ‹
        </button>

        <div ref={trackRef} className="row-track top10-track" id="top10Grid">
          {isLoading && top10Animes.length === 0
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="top10-item skeleton-card"
                  style={{ minWidth: 200, height: 200, opacity: 0.3 }}
                />
              ))
            : top10Animes.map((anime, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={`${anime.id}-${rank}`}
                    className="top10-item"
                    onClick={() => openPreview(anime.id)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredCard(anime.id, {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                      });
                    }}
                    onMouseLeave={() => setHoveredCard(null)}
                    role="button"
                    tabIndex={0}
                    title={`#${rank} · ${anime.title}`}
                  >
                    <div className="top10-rank-num">
                      <svg viewBox="0 0 100 140" className="top10-svg-num">
                        <text
                          x="50%"
                          y="78%"
                          textAnchor="middle"
                          className="top10-text-outline"
                        >
                          {rank}
                        </text>
                        <text
                          x="50%"
                          y="78%"
                          textAnchor="middle"
                          className="top10-text-fill"
                        >
                          {rank}
                        </text>
                      </svg>
                    </div>

                    <div className="top10-card-wrap">
                      <AnimeImagePreview
                        animeId={anime.id}
                        src={anime.posterImage}
                        alt={anime.title}
                        type="poster"
                        className="top10-poster-art"
                      />
                    </div>
                  </div>
                );
              })}
        </div>

        <button
          type="button"
          className="row-arrow row-arrow-right"
          aria-label="Scroll right"
          onClick={handleScrollRight}
        >
          ›
        </button>
      </div>
    </section>
  );
};
