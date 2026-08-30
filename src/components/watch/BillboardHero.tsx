'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { ANIME_CATALOG, CATALOG_IDS } from '@/lib/catalog';
import { AnimeArtSvg } from '@/components/visual/AnimeArtSvg';

export const BillboardHero: React.FC = () => {
  const { playEpisode, openPreview, toggleWatchlist, isInWatchlist } = usePlayback();

  const [activeId, setActiveId] = useState<string>('kamui');
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const anime = ANIME_CATALOG[activeId] || ANIME_CATALOG['kamui'];
  const inList = isInWatchlist(anime.id);

  const spotlightList = CATALOG_IDS.slice(0, 6);

  const switchSlide = useCallback((nextId: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveId(nextId);
      setIsTransitioning(false);
    }, 200);
  }, []);

  const handlePrev = useCallback(() => {
    const currentIdx = spotlightList.indexOf(activeId);
    const prevIdx = (currentIdx - 1 + spotlightList.length) % spotlightList.length;
    switchSlide(spotlightList[prevIdx]);
  }, [activeId, spotlightList, switchSlide]);

  const handleNext = useCallback(() => {
    const currentIdx = spotlightList.indexOf(activeId);
    const nextIdx = (currentIdx + 1) % spotlightList.length;
    switchSlide(spotlightList[nextIdx]);
  }, [activeId, spotlightList, switchSlide]);

  // Auto-sliding every 7 seconds when not hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      handleNext();
    }, 7000);
    return () => clearInterval(timer);
  }, [isHovered, handleNext]);

  // Reset & play video when active slide changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [activeId]);

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <section
      className="billboard-hero"
      id="billboardHero"
      aria-label="Featured Spotlight"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Video & Cover Art */}
      <div className="billboard-video-wrap">
        <video
          ref={videoRef}
          className={`billboard-video ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          id="billboardVideo"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          src={anime.trailerVideo}
        />
        <div className="billboard-fallback-art">
          <AnimeArtSvg animeId={anime.id} />
        </div>
        <div className="billboard-vignette-left" />
        <div className="billboard-vignette-bottom" />
        <div className="billboard-vignette-top" />
      </div>

      <div className="billboard-content-grid">
        {/* Left Hero Info */}
        <div className={`billboard-info ${isTransitioning ? 'transitioning' : 'transitioning-in'}`} id="billboardInfo">
          <div className="billboard-badge-row">
            <span className="billboard-badge billboard-badge-rank" id="billboardBadge">
              <span className="badge-flame-icon">🔥</span> #1 in Anime Today · Newly Added
            </span>
            {anime.badge && (
              <span className="billboard-badge" id="billboardOriginBadge">
                {anime.badge}
              </span>
            )}
          </div>

          <h1 className="billboard-title" id="billboardTitle">
            {anime.title}
          </h1>

          <div className="billboard-meta-row">
            <span className="badge-match" id="billboardMatch">
              {anime.match}
            </span>
            <span className="badge-rating" id="billboardRating">
              {anime.rating}
            </span>
            <span id="billboardYear" className="meta-year">{anime.year}</span>
            <span className="meta-dot">•</span>
            <span id="billboardSeasons" className="meta-seasons">{anime.seasonsCount}</span>
            <span className="meta-dot">•</span>
            <span className="badge-hd">4K Ultra HD</span>
            <span className="badge-spatial">Dolby Atmos</span>
          </div>

          <p className="billboard-synopsis" id="billboardSynopsis">
            {anime.synopsis}
          </p>

          <div className="billboard-genres" id="billboardGenres">
            {anime.genres.map((g) => (
              <span key={g} className="billboard-genre-tag">
                {g}
              </span>
            ))}
          </div>

          <div className="billboard-action-row">
            <button
              type="button"
              className="btn-billboard-play"
              id="billboardPlayBtn"
              title="Start Streaming"
              onClick={() => playEpisode(anime.id, 1)}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span id="billboardPlayText">Watch Now</span>
            </button>

            <button
              type="button"
              className={`btn-billboard-icon ${inList ? 'active' : ''}`}
              id="billboardListBtn"
              title={inList ? 'Remove from My List' : 'Add to My List'}
              aria-label="Add to My List"
              onClick={() => toggleWatchlist(anime.id)}
            >
              {inList ? (
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="btn-billboard-more"
              id="billboardInfoBtn"
              title="Show Show Details"
              onClick={() => openPreview(anime.id)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>More Info</span>
            </button>
          </div>
        </div>

        {/* Right Controls: Audio + Maturity + Spotlight Carousel */}
        <div className="billboard-side-ctrls">
          <div className="billboard-top-toggles">
            <button
              type="button"
              className="billboard-sound-btn"
              id="billboardMuteBtn"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label="Toggle audio"
              onClick={handleMuteToggle}
            >
              {isMuted ? (
                <svg className="icon-volume-off" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="icon-volume-on" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            <span className="billboard-maturity-pill" id="billboardMaturity">
              {anime.rating}
            </span>
          </div>

          {/* Mini Spotlight Switcher Carousel */}
          <div className="billboard-switcher-container">
            <div className="switcher-header">
              <span className="switcher-header-label">Featured Spotlight</span>
              <span className="switcher-header-count">
                {spotlightList.indexOf(activeId) + 1} / {spotlightList.length}
              </span>
            </div>

            <div className="billboard-switcher-wrap" id="billboardSwitcherWrap">
              <button
                type="button"
                className="switcher-nav-btn switcher-nav-prev"
                id="switcherPrevBtn"
                aria-label="Previous spotlight"
                onClick={handlePrev}
              >
                ‹
              </button>

              <div className="billboard-switcher-track" id="billboardSwitcherTrack">
                {spotlightList.map((id) => {
                  const item = ANIME_CATALOG[id];
                  if (!item) return null;
                  const isActive = id === activeId;
                  return (
                    <div
                      key={id}
                      className={`switcher-thumb-card ${isActive ? 'active' : ''}`}
                      onClick={() => switchSlide(id)}
                      title={item.title}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="switcher-thumb-media">
                        <AnimeArtSvg animeId={id} className="switcher-thumb-art" />
                        <div className="switcher-thumb-gradient" />
                        {isActive && (
                          <div className="switcher-active-badge">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="switcher-thumb-title">{item.title}</span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="switcher-nav-btn switcher-nav-next"
                id="switcherNextBtn"
                aria-label="Next spotlight"
                onClick={handleNext}
              >
                ›
              </button>
            </div>

            {/* Auto-Slide Progress Indicators */}
            <div className="switcher-indicators">
              {spotlightList.map((id, index) => {
                const isActive = id === activeId;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`switcher-dot ${isActive ? 'active' : ''}`}
                    onClick={() => switchSlide(id)}
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    {isActive && !isHovered && <span className="switcher-dot-fill" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

