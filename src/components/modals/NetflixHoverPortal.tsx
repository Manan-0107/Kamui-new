'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { ANIME_CATALOG } from '@/lib/catalog';
import { AnimeArtSvg } from '@/components/visual/AnimeArtSvg';

export const NetflixHoverPortal: React.FC = () => {
  const {
    hoveredAnimeId,
    hoverRect,
    setHoveredCard,
    playEpisode,
    openPreview,
    toggleWatchlist,
    isInWatchlist,
    isLiked,
    toggleLike
  } = usePlayback();

  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const anime = hoveredAnimeId ? ANIME_CATALOG[hoveredAnimeId] : null;

  // Auto-play trailer video when hover card appears
  useEffect(() => {
    if (anime && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [hoveredAnimeId, anime]);

  if (!anime || !hoverRect) return null;

  const inList = isInWatchlist(anime.id);
  const liked = isLiked(anime.id);

  // Position calculation (unclipped fixed viewport coordinates)
  const cardWidth = 390;
  let left = hoverRect.left + hoverRect.width / 2 - cardWidth / 2;
  let top = hoverRect.top - 45;

  if (typeof window !== 'undefined') {
    if (left < 20) left = 20;
    if (left + cardWidth > window.innerWidth - 20) {
      left = window.innerWidth - cardWidth - 20;
    }
    if (top < 80) {
      top = hoverRect.top - 10;
    }
  }

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div
      className="netflix-global-hover-portal"
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${cardWidth}px`,
        zIndex: 2200
      }}
      onMouseEnter={() => setHoveredCard(anime.id, hoverRect)}
      onMouseLeave={() => setHoveredCard(null)}
      onClick={(e) => {
        e.stopPropagation();
        openPreview(anime.id);
      }}
      role="dialog"
      aria-label={`${anime.title} preview popup`}
    >
      {/* Top Media Banner with Live Auto-Playing Video */}
      <div className="hover-popout-media">
        <video
          ref={videoRef}
          className="hover-popout-video"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          src={anime.trailerVideo}
        />
        <div className="hover-popout-art-fallback">
          <AnimeArtSvg animeId={anime.id} />
        </div>
        <div className="hover-popout-gradient" />

        {/* Top Kanji Badge */}
        <div className="hover-popout-top-row">
          <span className="hover-popout-kanji-badge">
            {anime.kanji} · {anime.badge || 'KAMUI ORIGINAL'}
          </span>
        </div>

        {/* Audio Mute/Unmute Toggle */}
        <button
          type="button"
          className="hover-popout-mute-btn"
          title={isMuted ? 'Unmute preview audio' : 'Mute preview audio'}
          aria-label="Toggle audio"
          onClick={handleMuteToggle}
        >
          {isMuted ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>

        {/* Title inside Media */}
        <h3 className="hover-popout-title">{anime.title}</h3>
      </div>

      {/* Popout Body Content */}
      <div className="hover-popout-body">
        {/* Action Button Row */}
        <div className="hover-popout-actions">
          <button
            type="button"
            className="btn-hover-play-main"
            title="Play Episode 1"
            onClick={(e) => {
              e.stopPropagation();
              playEpisode(anime.id, 1);
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Play Episode 1</span>
          </button>

          <button
            type="button"
            className={`hover-popout-circle-btn ${inList ? 'active' : ''}`}
            title={inList ? 'Remove from My List' : 'Add to My List'}
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist(anime.id);
            }}
          >
            {inList ? (
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className={`hover-popout-circle-btn ${liked ? 'active' : ''}`}
            title={liked ? 'Liked' : 'Like this anime'}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(anime.id);
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </button>

          <button
            type="button"
            className="hover-popout-circle-btn hover-popout-chevron"
            title="Expand Full Details & Episode List"
            onClick={(e) => {
              e.stopPropagation();
              openPreview(anime.id);
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Metadata Line */}
        <div className="hover-popout-meta-row">
          <span className="badge-match">{anime.match}</span>
          <span className="badge-rating">{anime.rating}</span>
          <span className="meta-seasons">{anime.duration || anime.seasonsCount}</span>
          <span className="badge-hd">4K HDR</span>
          <span className="badge-spatial">Spatial Audio</span>
        </div>

        {/* Golden Hook & Description */}
        {anime.hook && <p className="hover-popout-hook">"{anime.hook}"</p>}
        <p className="hover-popout-synopsis">{anime.synopsis}</p>

        {/* Cast & Genres Grid */}
        <div className="hover-popout-details-grid">
          <div className="hover-popout-detail">
            <span className="detail-label">CAST:</span>
            <span className="detail-value">{anime.cast.split(',').slice(0, 3).join(', ')}</span>
          </div>
          <div className="hover-popout-detail">
            <span className="detail-label">GENRES:</span>
            <span className="detail-value">{anime.genres.join(', ')}</span>
          </div>
          <div className="hover-popout-detail">
            <span className="detail-label">STUDIO:</span>
            <span className="detail-value">{anime.studio}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
