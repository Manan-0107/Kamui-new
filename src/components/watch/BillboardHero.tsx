'use client';

import React, { useState } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { useCatalogRow } from '@/hooks/useAnime';
import { AnimeImagePreview } from '@/components/visual/AnimeImagePreview';
import { AnimeRatingBadges } from '@/components/watch/AnimeRatingBadges';
import { Puzzle, Flame, Bell, Clock, Bookmark, Check, Info } from 'lucide-react';
import { TrackerStatus } from '@/lib/types';

export const BillboardHero: React.FC = () => {
  const {
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

  const { animes, isLoading } = useCatalogRow('trending', 5);
  const anime = animes[0] || null;

  const [isTrackerMenuOpen, setIsTrackerMenuOpen] = useState(false);

  const inList = anime ? isInWatchlist(anime.id) : false;
  const liked = anime ? isLiked(anime.id) : false;
  const currentTracker = anime ? getAnimeTrackerStatus(anime.id) : undefined;
  const isSubbed = anime ? isNotificationSubscribed(anime.id) : false;

  const trackerOptions: { value: TrackerStatus; label: string }[] = [
    { value: 'watching', label: 'Watching' },
    { value: 'planning', label: 'Plan to Watch' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' }
  ];

  if (isLoading || !anime) {
    return (
      <section className="billboard-hero" id="billboardHero" aria-label="Featured Anime Spotlight">
        <div className="billboard-media-wrap" id="billboardMediaWrap">
          <div className="billboard-fallback-art" style={{ background: '#0a0f18' }} />
          <div className="billboard-vignette-left" />
          <div className="billboard-vignette-bottom" />
          <div className="billboard-vignette-top" />
        </div>
        <div className="billboard-content-grid">
          <div className="billboard-info" style={{ opacity: 0.5 }}>
            <div className="billboard-badge-row">
              <span className="billboard-badge">Trending Spotlight</span>
            </div>
            <h1 className="billboard-title">Loading trending anime...</h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="billboard-hero"
      id="billboardHero"
      aria-label="Featured Anime Spotlight"
    >
      {/* Background Poster Artwork from AniList */}
      <div className="billboard-media-wrap" id="billboardMediaWrap">
        <div className="billboard-fallback-art" style={{ opacity: 1 }}>
          <AnimeImagePreview
            animeId={anime.id}
            src={anime.bannerImage || anime.posterImage}
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
        <div className="billboard-info transitioning-in" id="billboardInfo">
          <div className="billboard-badge-row">
            <span className="billboard-badge billboard-badge-rank" id="billboardBadge">
              <span className="badge-flame-icon" style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4 }}>
                <Flame size={13} color="#e8b94f" />
              </span>
              #1 Trending on AniList
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
          </div>

          <h1 className="billboard-title" id="billboardTitle">
            {anime.title}
          </h1>

          {/* Multi-Platform Community Ratings (AniList) */}
          <div style={{ margin: '10px 0 14px' }}>
            <AnimeRatingBadges animeId={anime.id} title={anime.title} initialRatings={anime.ratings} />
          </div>

          <div className="billboard-meta-row">
            <span className="badge-match" id="billboardMatch">
              {anime.match}
            </span>
            <span className="badge-rating" id="billboardRating">
              {anime.rating}
            </span>
            {anime.year && <span id="billboardYear" className="meta-year">{anime.year}</span>}
            <span className="meta-dot">•</span>
            <span id="billboardSeasons" className="meta-seasons">{anime.seasonsCount}</span>
            <span className="meta-dot">•</span>
            <span style={{ fontSize: 11, color: '#02a9ff' }}>Data provided by AniList</span>
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
            {/* Locked Play Button (Step 1 requirement) */}
            <button
              type="button"
              className="btn-billboard-play disabled"
              id="billboardPlayBtn"
              disabled
              title="Install an extension to watch"
              style={{
                opacity: 0.85,
                cursor: 'not-allowed',
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'var(--muted)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <Puzzle size={18} />
              <span id="billboardPlayText">Install an extension to watch</span>
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
                        setAnimeTrackerStatus(anime.id, opt.value, anime.title);
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
                        setAnimeTrackerStatus(anime.id, null, anime.title);
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
              onClick={() => toggleNotificationSubscription(anime.id, anime.title)}
            >
              <Bell size={18} fill={isSubbed ? 'currentColor' : 'none'} />
            </button>

            {/* Add to Watchlist Button */}
            <button
              type="button"
              className={`btn-billboard-icon ${inList ? 'active' : ''}`}
              id="billboardWatchlistBtn"
              title={inList ? 'Remove from My List' : 'Add to My List'}
              aria-label="Add to Watchlist"
              onClick={() => toggleWatchlist(anime.id, anime.title)}
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

            {/* Like / Favorite Button */}
            <button
              type="button"
              className={`btn-billboard-icon ${liked ? 'active' : ''}`}
              id="billboardLikeBtn"
              title={liked ? 'In Favorites (Click to unlike)' : 'Favorite this anime'}
              aria-label="Favorite this anime"
              onClick={() => toggleLike(anime.id, anime.title)}
            >
              <svg viewBox="0 0 24 24" width="19" height="19" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </button>

            {/* Expand Full Details Modal Button */}
            <button
              type="button"
              className="btn-billboard-info"
              id="billboardMoreInfoBtn"
              onClick={() => openPreview(anime.id)}
            >
              <Info size={19} />
              <span>More Info</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
