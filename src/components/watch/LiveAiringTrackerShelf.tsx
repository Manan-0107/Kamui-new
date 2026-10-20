'use client';

import React, { useRef } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { useLiveSchedule } from '@/hooks/useAnime';
import { Clock, ChevronLeft, ChevronRight, Radio } from 'lucide-react';

export const LiveAiringTrackerShelf: React.FC = () => {
  const { schedule, isLoading } = useLiveSchedule(12);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { openPreview } = usePlayback();

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = dir === 'left' ? -600 : 600;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!isLoading && schedule.length === 0) return null;

  return (
    <section className="content-row-section live-tracker-shelf-section" id="liveSimulcastTrackerShelf">
      <div className="row-header">
        <div className="row-title-wrap">
          <span className="row-kanji-badge">放</span>
          <h2 className="row-title">
            Real-Time Airing Anime & Simulcast Schedule
          </h2>
          <span className="live-pulse-badge">
            <Radio size={12} className="pulse-icon" /> Live Airing
          </span>
        </div>

        <div className="row-nav-arrows">
          <button
            type="button"
            className="row-arrow-btn"
            aria-label="Scroll left"
            onClick={() => handleScroll('left')}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="row-arrow-btn"
            aria-label="Scroll right"
            onClick={() => handleScroll('right')}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="live-tracker-track" ref={scrollRef}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="live-tracker-card skeleton-card">
                <div className="live-tracker-art-placeholder" />
              </div>
            ))
          : schedule.map((item) => (
              <div
                key={item.id}
                className="live-tracker-card"
                onClick={() => openPreview(String(item.id))}
                title={`${item.title} · Next episode ${item.nextEpisode || ''} airing ${item.timeUntilAiringStr || ''}`}
              >
                <div className="live-tracker-poster-wrap">
                  {item.posterImage ? (
                    <img
                      src={item.posterImage}
                      alt={item.title}
                      loading="lazy"
                      className="live-tracker-img"
                    />
                  ) : (
                    <div className="live-tracker-art-placeholder" />
                  )}
                  <div className="live-tracker-poster-gradient" />

                  {/* Countdown Badge */}
                  <div className="live-tracker-countdown-tag">
                    <Clock size={12} />
                    <span>Ep. {item.nextEpisode || 1} {item.timeUntilAiringStr || 'Soon'}</span>
                  </div>

                  {/* AniList Score Badge */}
                  {item.score && (
                    <div className="live-tracker-score-pill">
                      <span>{item.score}%</span>
                    </div>
                  )}
                </div>

                <div className="live-tracker-info">
                  <h4 className="live-tracker-title">{item.title}</h4>
                  <span className="live-tracker-romaji">{item.romajiTitle}</span>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
};
