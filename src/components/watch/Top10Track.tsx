'use client';

import React, { useRef } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { ANIME_CATALOG, CATALOG_IDS } from '@/lib/catalog';
import { AnimePosterSvg } from '@/components/visual/AnimePosterSvg';

export const Top10Track: React.FC = () => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { openPreview } = usePlayback();

  const top10Ids = [...CATALOG_IDS, 'kamui', 'ashfall-district'].slice(0, 10);

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

  return (
    <section className="content-row-section" id="top10Section" aria-label="Top 10">
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
          {top10Ids.map((id, index) => {
            const anime = ANIME_CATALOG[id];
            if (!anime) return null;
            const rank = index + 1;

            return (
              <div
                key={`${id}-${rank}`}
                className="top10-item"
                onClick={() => openPreview(anime.id)}
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
                  <AnimePosterSvg animeId={anime.id} className="top10-poster-art" />
                  <div className="top10-card-overlay">
                    <span className="top10-card-title">{anime.title}</span>
                    <span className="top10-card-genre">{anime.genre}</span>
                  </div>
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
