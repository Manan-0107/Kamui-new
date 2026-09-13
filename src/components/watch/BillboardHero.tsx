'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { useExtensions } from '@/context/ExtensionsContext';
import { ANIME_CATALOG, CATALOG_IDS } from '@/lib/catalog';
import { AnimeImagePreview } from '@/components/visual/AnimeImagePreview';
import { AnimeRatingBadges } from '@/components/watch/AnimeRatingBadges';
import { Puzzle, Flame, Bell, Clock, Bookmark, Check } from 'lucide-react';
import { TrackerStatus } from '@/lib/types';

export const BillboardHero: React.FC = () => {
  const {
    playEpisode,
    openPreview,
    toggleWatchlist,
    isInWatchlist,
    isLiked,
    toggleLike,
    getAnimeTrackerStatus,
    setAnimeTrackerStatus,
    isNotificationSubscribed,
    toggleNotificationSubscription
  } = usePlayback();
  const { activeExtension, openModal: openExtensionsModal } = useExtensions();

  const [activeId, setActiveId] = useState('kamui');
  const [isMuted, setIsMuted] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isTrackerMenuOpen, setIsTrackerMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const anime = ANIME_CATALOG[activeId] || ANIME_CATALOG['kamui'];
  const inList = isInWatchlist(anime.id);
  const liked = isLiked(anime.id);
  const hasActiveExtension = Boolean(activeExtension && activeExtension.enabled);
  const currentTracker = getAnimeTrackerStatus(anime.id);
  const isSubbed = isNotificationSubscribed(anime.id);

  // Play video on active anime change only if active extension is installed
  useEffect(() => {
    if (videoRef.current && hasActiveExtension) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [activeId, hasActiveExtension]);

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const trackerOptions: { value: TrackerStatus; label: string }[] = [
    { value: 'watching', label: 'Watching' },
    { value: 'planning', label: 'Plan to Watch' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' }
  ];

  return (
    <section
      className="billboard-hero"
      id="billboardHero"
      aria-label="Featured Anime Spotlight"
    >
      {/* Background Video Stream / Real Art Poster */}
      <div className="billboard-media-wrap" id="billboardMediaWrap">
        {hasActiveExtension ? (
          <video
            ref={videoRef}
            className="billboard-video"
            id="billboardVideoPlayer"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            src={anime.trailerVideo}
          />
        ) : null}
        <div className="billboard-fallback-art" style={{ opacity: hasActiveExtension ? undefined : 1 }}>
          <AnimeImagePreview
            animeId={anime.id}
            src={anime.bannerImage}
            alt={anime.title}
            type="banner"
            priority
          />
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
              <span className="badge-flame-icon" style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4 }}>
                <Flame size={13} color="#e8b94f" />
              </span>
              #1 in Anime Today · Simulcast
            </span>
            {anime.badge && (
              <span className="billboard-badge" id="billboardOriginBadge">
                {anime.badge}
              </span>
            )}
            {/* Airing countdown tag if simulcasting */}
            {anime.nextAiring && (
              <span className="billboard-badge billboard-badge-airing">
                <Clock size={12} style={{ marginRight: 4 }} />
                Episode {anime.nextAiring.episode} · {anime.nextAiring.timeStr}
              </span>
            )}
            {/* Tracker Mode indicator when no extension is enabled */}
            {!hasActiveExtension && (
              <span
                className="billboard-badge billboard-badge-tracker-notice"
                onClick={() => openExtensionsModal('store')}
                style={{ cursor: 'pointer' }}
                title="Kamui operates in Tracker Mode until a streaming extension is added (like Stremio or Mihon)."
              >
                <Puzzle size={12} style={{ marginRight: 4 }} />
                Tracker Mode (Add Extension to Stream)
              </span>
            )}
          </div>

          <h1 className="billboard-title" id="billboardTitle">
            {anime.title}
          </h1>

          {/* Multi-Platform Community Ratings (AniList, MAL, IMDb, TMDB) */}
          <div style={{ margin: '10px 0 14px' }}>
            <AnimeRatingBadges animeId={anime.id} title={anime.title} />
          </div>

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
            <span className="badge-hd">{activeExtension?.supportedResolutions?.[0] || '4K Ultra HD'}</span>
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
              title={hasActiveExtension ? 'Start Streaming' : 'Add Extension to Stream'}
              onClick={() => {
                if (!hasActiveExtension) {
                  openExtensionsModal('store');
                } else {
                  playEpisode(anime.id, 1);
                }
              }}
            >
              {hasActiveExtension ? (
                <>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span id="billboardPlayText">Watch Now</span>
                </>
              ) : (
                <>
                  <Puzzle size={18} />
                  <span id="billboardPlayText">Add Extension to Watch</span>
                </>
              )}
            </button>

            {/* Anime Tracker Status Button */}
            <div className="tracker-dropdown-wrap" style={{ position: 'relative', display: 'inline-block' }}>
              <button
                type="button"
                className={`btn-billboard-tracker ${currentTracker ? 'active' : ''}`}
                id="billboardTrackerBtn"
                title="Update Anime Tracking Status"
                onClick={() => setIsTrackerMenuOpen(!isTrackerMenuOpen)}
              >
                <Bookmark size={17} style={{ marginRight: 6 }} />
                <span>
                  {currentTracker
                    ? trackerOptions.find((o) => o.value === currentTracker)?.label
                    : 'Track'}
                </span>
              </button>

              {isTrackerMenuOpen && (
                <div
                  className="tracker-dropdown-menu"
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: 0,
                    zIndex: 100
                  }}
                >
                  {trackerOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`tracker-menu-opt ${currentTracker === opt.value ? 'selected' : ''}`}
                      onClick={() => {
                        setAnimeTrackerStatus(anime.id, opt.value);
                        setIsTrackerMenuOpen(false);
                      }}
                    >
                      {currentTracker === opt.value && <Check size={14} style={{ marginRight: 6 }} />}
                      <span>{opt.label}</span>
                    </button>
                  ))}
                  {currentTracker && (
                    <button
                      type="button"
                      className="tracker-menu-opt opt-remove"
                      onClick={() => {
                        setAnimeTrackerStatus(anime.id, null);
                        setIsTrackerMenuOpen(false);
                      }}
                    >
                      <span>Remove from Tracker</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Notify Me When Next Episode Drops Button */}
            <button
              type="button"
              className={`btn-billboard-icon ${isSubbed ? 'active' : ''}`}
              id="billboardNotifyBtn"
              title={
                isSubbed
                  ? 'Simulcast alerts enabled (Click to disable)'
                  : 'Notify me when next episode airs'
              }
              aria-label="Toggle simulcast episode alerts"
              onClick={() => toggleNotificationSubscription(anime.id)}
            >
              <Bell size={18} fill={isSubbed ? 'currentColor' : 'none'} />
            </button>

            <button
              type="button"
              className="btn-billboard-icon"
              id="billboardDetailsBtn"
              title="Anime Details & Episodes"
              aria-label="Anime Details & Episodes"
              onClick={() => openPreview(anime.id)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
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
              className={`btn-billboard-icon ${liked ? 'active' : ''}`}
              id="billboardLikeBtn"
              title={liked ? 'Liked' : 'Like this anime'}
              aria-label="Like this anime"
              onClick={() => toggleLike(anime.id)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Controls: Audio + Maturity */}
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
        </div>
      </div>
    </section>
  );
};
