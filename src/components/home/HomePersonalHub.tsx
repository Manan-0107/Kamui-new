'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePlayback } from '@/context/PlaybackContext';
import { useAnime } from '@/hooks/useAnime';
import { AnimeArtSvg } from '@/components/visual/AnimeArtSvg';
import { AnimePosterSvg } from '@/components/visual/AnimePosterSvg';
import {
  Clock,
  Play,
  Bookmark,
  ThumbsUp,
  Info,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Puzzle
} from 'lucide-react';

const HubAnimeCard: React.FC<{ animeId: string; mode: 'watchlist' | 'liked' }> = ({ animeId, mode }) => {
  const { openPreview, toggleWatchlist, toggleLike } = usePlayback();
  const { anime } = useAnime(animeId);

  if (!anime) {
    return (
      <div className="personal-hub-poster-card skeleton-card" style={{ height: 260, background: 'rgba(255,255,255,0.03)' }} />
    );
  }

  return (
    <div
      className="personal-hub-poster-card"
      onClick={() => openPreview(anime.id)}
    >
      <div className="poster-card-thumb">
        <AnimePosterSvg animeId={anime.id} src={anime.posterImage} alt={anime.title} className="poster-card-art" />
        <div className="poster-card-gradient" />
        {/* Locked Play Button (Step 1 requirement) */}
        <button
          type="button"
          className="poster-card-play-btn disabled"
          title="Install an extension to watch"
          style={{ opacity: 0.85, cursor: 'not-allowed' }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Puzzle size={16} />
        </button>
        {mode === 'watchlist' ? (
          <button
            type="button"
            className="poster-card-remove-btn"
            title="Remove from Watchlist"
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist(anime.id, anime.title);
            }}
          >
            &times;
          </button>
        ) : (
          <button
            type="button"
            className="poster-card-remove-btn"
            title="Unlike"
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(anime.id, anime.title);
            }}
          >
            <ThumbsUp size={11} fill="currentColor" />
          </button>
        )}
        {anime.badge && (
          <span className={`poster-card-badge badge-${anime.badgeType || 'original'}`}>
            {anime.badge}
          </span>
        )}
      </div>
      <div className="poster-card-info">
        <h4 className="poster-card-title">{anime.title}</h4>
        <div className="poster-card-meta">
          <span className="poster-card-match">{anime.match}</span>
          <span className="poster-card-genre">{anime.genre}</span>
        </div>
      </div>
    </div>
  );
};

export const HomePersonalHub: React.FC = () => {
  const {
    watchlist,
    likedTitles,
    continueWatching,
    openPreview,
    toggleWatchlist: _toggleWatchlist,
    clearContinueWatching,
    removeContinueItem,
    clearLikedTitles
  } = usePlayback();

  const [activeTab, setActiveTab] = useState<'continue' | 'watchlist' | 'liked'>('continue');
  const trackRef = useRef<HTMLDivElement | null>(null);

  const hasContinue = continueWatching.length > 0;
  const hasWatchlist = watchlist.length > 0;
  const hasLiked = likedTitles.length > 0;

  // Auto-switch tabs if current tab data becomes empty
  const currentTab = useMemo(() => {
    if (activeTab === 'continue' && !hasContinue) {
      return hasWatchlist ? 'watchlist' : 'liked';
    }
    if (activeTab === 'watchlist' && !hasWatchlist) {
      return hasContinue ? 'continue' : 'liked';
    }
    if (activeTab === 'liked' && !hasLiked) {
      return hasContinue ? 'continue' : 'watchlist';
    }
    return activeTab;
  }, [activeTab, hasContinue, hasWatchlist, hasLiked]);

  // If user has no personal activity, hide the entire section cleanly
  if (!hasContinue && !hasWatchlist && !hasLiked) {
    return null;
  }

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

  // For spotlight when only 1 item is in Continue Watching
  const singleContinueItem = hasContinue && continueWatching.length === 1 ? continueWatching[0] : null;

  return (
    <section className="home-personal-hub-section" id="jumpBackInSection" aria-label="Your Anime Realm">
      <div className="wrap">
        <div className="personal-hub-card">
          {/* Header with Kanji Mark, Title & Tabs */}
          <div className="personal-hub-header">
            <div className="personal-hub-title-group">
              <span className="personal-hub-kanji">私</span>
              <div>
                <h2 className="personal-hub-title">Jump Back In</h2>
                <p className="personal-hub-subtitle">Resume your episodes or explore your curated library</p>
              </div>
            </div>

            {/* Tab Pills */}
            <div className="personal-hub-tabs" role="tablist">
              {hasContinue && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={currentTab === 'continue'}
                  className={`personal-hub-tab-btn ${currentTab === 'continue' ? 'active' : ''}`}
                  onClick={() => setActiveTab('continue')}
                >
                  <Play size={13} className="tab-icon" />
                  <span>Continue</span>
                  <span className="tab-badge">{continueWatching.length}</span>
                </button>
              )}

              {hasWatchlist && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={currentTab === 'watchlist'}
                  className={`personal-hub-tab-btn ${currentTab === 'watchlist' ? 'active' : ''}`}
                  onClick={() => setActiveTab('watchlist')}
                >
                  <Bookmark size={13} className="tab-icon" />
                  <span>Watchlist</span>
                  <span className="tab-badge">{watchlist.length}</span>
                </button>
              )}

              {hasLiked && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={currentTab === 'liked'}
                  className={`personal-hub-tab-btn ${currentTab === 'liked' ? 'active' : ''}`}
                  onClick={() => setActiveTab('liked')}
                >
                  <ThumbsUp size={13} className="tab-icon" />
                  <span>Liked</span>
                  <span className="tab-badge">{likedTitles.length}</span>
                </button>
              )}
            </div>

            {/* Hub Actions */}
            <div className="personal-hub-actions">
              {currentTab === 'continue' && (
                <button
                  type="button"
                  className="personal-hub-clear-btn"
                  title="Clear watch history"
                  onClick={clearContinueWatching}
                >
                  Clear History
                </button>
              )}

              {currentTab === 'liked' && (
                <button
                  type="button"
                  className="personal-hub-clear-btn"
                  title="Clear liked titles"
                  onClick={clearLikedTitles}
                >
                  Clear Liked
                </button>
              )}

              <Link href="/watch" className="personal-hub-link">
                Watch Hub →
              </Link>
            </div>
          </div>

          {/* Content Body */}
          <div className="personal-hub-body">
            {/* 1. Continue Watching Tab */}
            {currentTab === 'continue' && (
              <>
                {/* When only 1 item is continuing: Gorgeous Spotlight Layout */}
                {singleContinueItem ? (
                  <div className="personal-spotlight-wrap">
                    <div
                      className="personal-spotlight-thumb-wrap"
                      onClick={() => openPreview(singleContinueItem.animeId)}
                    >
                      <AnimeArtSvg animeId={singleContinueItem.animeId} className="personal-spotlight-art" />
                      <div className="spotlight-overlay-gradient" />
                      {/* Locked play state */}
                      <button
                        type="button"
                        className="spotlight-play-btn disabled"
                        aria-label="Install extension to watch"
                        title="Install an extension to watch"
                        style={{ opacity: 0.85, cursor: 'not-allowed' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreview(singleContinueItem.animeId);
                        }}
                      >
                        <Puzzle size={24} />
                      </button>
                      {/* Progress Bar */}
                      <div className="spotlight-progress-track">
                        <div
                          className="spotlight-progress-fill"
                          style={{ width: `${singleContinueItem.percentage || 25}%` }}
                        />
                      </div>
                    </div>

                    <div className="personal-spotlight-details">
                      <div className="spotlight-badge-row">
                        <span className="spotlight-live-pill">
                          <Clock size={12} /> IN PROGRESS
                        </span>
                        <span className="spotlight-pct">
                          {Math.round(singleContinueItem.percentage || 25)}% completed
                        </span>
                      </div>

                      <h3 className="spotlight-title">{singleContinueItem.title}</h3>
                      <p className="spotlight-ep">
                        {singleContinueItem.episodeTitle || `Episode ${singleContinueItem.episodeNum}`}
                      </p>

                      <div className="spotlight-btn-group">
                        <button
                          type="button"
                          className="btn filled spotlight-action-resume"
                          style={{ opacity: 0.85, cursor: 'not-allowed' }}
                          title="Install an extension to watch"
                          disabled
                        >
                          <Puzzle size={16} />
                          <span>Install extension to watch</span>
                        </button>
                        <button
                          type="button"
                          className="btn spotlight-action-info"
                          onClick={() => openPreview(singleContinueItem.animeId)}
                        >
                          <Info size={15} />
                          <span>Overview</span>
                        </button>
                        <button
                          type="button"
                          className="spotlight-action-dismiss"
                          title="Remove from continue watching"
                          onClick={() => removeContinueItem(singleContinueItem.animeId)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Multiple continue watching items: Horizontal carousel */
                  <div className="personal-hub-track-wrapper">
                    {continueWatching.length > 3 && (
                      <button
                        type="button"
                        className="personal-track-arrow left"
                        aria-label="Scroll left"
                        onClick={handleScrollLeft}
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}

                    <div ref={trackRef} className="personal-hub-track custom-scrollbar">
                      {continueWatching.map((item) => (
                        <div
                          key={item.animeId}
                          className="personal-continue-card"
                          onClick={() => openPreview(item.animeId)}
                        >
                          <div className="continue-card-thumb">
                            <AnimeArtSvg animeId={item.animeId} className="continue-card-art" />
                            <div className="continue-card-gradient" />
                            <button
                              type="button"
                              className="continue-card-play-btn disabled"
                              title="Install an extension to watch"
                              style={{ opacity: 0.85, cursor: 'not-allowed' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openPreview(item.animeId);
                              }}
                            >
                              <Puzzle size={16} />
                            </button>
                            <button
                              type="button"
                              className="continue-card-dismiss-btn"
                              title="Remove from history"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeContinueItem(item.animeId);
                              }}
                            >
                              &times;
                            </button>
                            {/* Progress Bar */}
                            <div className="continue-card-progress-track">
                              <div
                                className="continue-card-progress-fill"
                                style={{ width: `${item.percentage || 15}%` }}
                              />
                            </div>
                          </div>
                          <div className="continue-card-info">
                            <h4 className="continue-card-title">{item.title}</h4>
                            <div className="continue-card-meta">
                              <span className="continue-card-ep">{item.episodeTitle || `Ep. ${item.episodeNum}`}</span>
                              <span className="continue-card-dot">•</span>
                              <span className="continue-card-pct">{Math.round(item.percentage || 15)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {continueWatching.length > 3 && (
                      <button
                        type="button"
                        className="personal-track-arrow right"
                        aria-label="Scroll right"
                        onClick={handleScrollRight}
                      >
                        <ChevronRight size={20} />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* 2. My Watchlist Tab */}
            {currentTab === 'watchlist' && (
              <div className="personal-hub-grid">
                {watchlist.map((animeId) => (
                  <HubAnimeCard key={animeId} animeId={animeId} mode="watchlist" />
                ))}
              </div>
            )}

            {/* 3. Liked Anime Tab */}
            {currentTab === 'liked' && (
              <div className="personal-hub-grid">
                {likedTitles.map((animeId) => (
                  <HubAnimeCard key={animeId} animeId={animeId} mode="liked" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
