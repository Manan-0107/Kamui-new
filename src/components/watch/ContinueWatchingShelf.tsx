'use client';

import React, { useRef } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { AnimeArtSvg } from '@/components/visual/AnimeArtSvg';

export const ContinueWatchingShelf: React.FC = () => {
  const { continueWatching, playEpisode, openPreview, clearContinueWatching, removeContinueItem } = usePlayback();
  const trackRef = useRef<HTMLDivElement | null>(null);

  if (continueWatching.length === 0) return null;

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
    <section className="content-row-section" id="continueWatchingSection" aria-label="Continue Watching">
      <div className="row-header">
        <div className="row-title-wrap">
          <span className="row-kanji-glyph">継</span>
          <h2 className="row-title">
            Continue Watching <span className="shelf-count-badge">{continueWatching.length}</span>
          </h2>
        </div>
        <button
          type="button"
          className="shelf-clear-btn"
          id="clearContinueHistoryBtn"
          title="Clear watch history"
          onClick={clearContinueWatching}
        >
          Clear History
        </button>
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

        <div ref={trackRef} className="row-track" id="continueWatchingGrid">
          {continueWatching.map((item) => (
            <div
              key={item.animeId}
              className="continue-card"
              onClick={() => openPreview(item.animeId)}
            >
              <div className="continue-thumb-wrap">
                <AnimeArtSvg animeId={item.animeId} className="continue-art" />
                <button
                  type="button"
                  className="continue-play-overlay"
                  title="Resume Watching"
                  onClick={(e) => {
                    e.stopPropagation();
                    playEpisode(item.animeId, item.episodeNum);
                  }}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="continue-remove-btn"
                  title="Remove from history"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeContinueItem(item.animeId);
                  }}
                >
                  &times;
                </button>
              </div>

              {/* Progress Bar */}
              <div className="continue-progress-track">
                <div
                  className="continue-progress-fill"
                  style={{ width: `${item.percentage || 15}%` }}
                />
              </div>

              <div className="continue-meta">
                <h4 className="continue-title">{item.title}</h4>
                <p className="continue-ep">{item.episodeTitle || `Episode ${item.episodeNum}`}</p>
              </div>
            </div>
          ))}
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
