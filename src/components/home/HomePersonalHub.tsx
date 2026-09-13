'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Play, Info, Trash2, ChevronLeft, ChevronRight, Bookmark, ThumbsUp, Sparkles, Clock } from 'lucide-react';
import { usePlayback } from '@/context/PlaybackContext';
import { ANIME_CATALOG } from '@/lib/catalog';
import { AnimeArtSvg } from '@/components/visual/AnimeArtSvg';

type ActiveTab = 'continue' | 'watchlist' | 'liked';

export const HomePersonalHub: React.FC = () => {
  const {
    continueWatching,
    watchlist,
    likedTitles,
    playEpisode,
    openPreview,
    clearContinueWatching,
    removeContinueItem,
    toggleWatchlist,
    clearLikedTitles,
    setHoveredCard
  } = usePlayback();

  const trackRef = useRef<HTMLDivElement | null>(null);

  // Determine available tabs
  const hasContinue = continueWatching.length > 0;
  const hasWatchlist = watchlist.length > 0;
  const hasLiked = likedTitles.length > 0;

  // Don't render anything if user has no personal content
  if (!hasContinue && !hasWatchlist && !hasLiked) {
    return null;
  }

  // Set default tab based on priority
  const defaultTab: ActiveTab = hasContinue ? 'continue' : hasWatchlist ? 'watchlist' : 'liked';
  const [activeTab, setActiveTab] = useState<ActiveTab>(defaultTab);

  // If active tab has 0 items, fallback to an available tab
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
  const singleAnime = singleContinueItem ? ANIME_CATALOG[singleContinueItem.animeId] : null;

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
                      onClick={() => playEpisode(singleContinueItem.animeId, singleContinueItem.episodeNum)}
                    >
                      <AnimeArtSvg animeId={singleContinueItem.animeId} className="personal-spotlight-art" />
                      <div className="spotlight-overlay-gradient" />
                      <button
                        type="button"
                        className="spotlight-play-btn"
                        aria-label="Resume video"
                        onClick={(e) => {
                          e.stopPropagation();
                          playEpisode(singleContinueItem.animeId, singleContinueItem.episodeNum);
                        }}
                      >
                        <Play size={26} fill="currentColor" />
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

                      {singleAnime && (
                        <p className="spotlight-synopsis">
                          {singleAnime.hook || singleAnime.synopsis}
                        </p>
                      )}

                      <div className="spotlight-btn-group">
                        <button
                          type="button"
                          className="btn filled spotlight-action-resume"
                          onClick={() => playEpisode(singleContinueItem.animeId, singleContinueItem.episodeNum)}
                        >
                          <Play size={16} fill="currentColor" />
                          <span>Resume Episode {singleContinueItem.episodeNum}</span>
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
                          className="continue-card personal-hub-continue-card"
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
                              <Play size={20} fill="currentColor" />
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

                          <div className="continue-progress-track">
                            <div
                              className="continue-progress-fill"
                              style={{ width: `${item.percentage || 20}%` }}
                            />
                          </div>

                          <div className="continue-meta">
                            <h4 className="continue-title">{item.title}</h4>
                            <p className="continue-ep">
                              {item.episodeTitle || `Episode ${item.episodeNum}`}
                            </p>
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
                {watchlist.map((animeId) => {
                  const anime = ANIME_CATALOG[animeId];
                  if (!anime) return null;
                  return (
                    <div
                      key={anime.id}
                      className="personal-hub-poster-card"
                      onClick={() => openPreview(anime.id)}
                    >
                      <div className="poster-card-thumb">
                        <AnimeArtSvg animeId={anime.id} className="poster-card-art" />
                        <div className="poster-card-gradient" />
                        <button
                          type="button"
                          className="poster-card-play-btn"
                          title="Watch Now"
                          onClick={(e) => {
                            e.stopPropagation();
                            playEpisode(anime.id, 1);
                          }}
                        >
                          <Play size={18} fill="currentColor" />
                        </button>
                        <button
                          type="button"
                          className="poster-card-remove-btn"
                          title="Remove from Watchlist"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(anime.id);
                          }}
                        >
                          &times;
                        </button>
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
                })}
              </div>
            )}

            {/* 3. Liked Anime Tab */}
            {currentTab === 'liked' && (
              <div className="personal-hub-grid">
                {likedTitles.map((animeId) => {
                  const anime = ANIME_CATALOG[animeId];
                  if (!anime) return null;
                  return (
                    <div
                      key={anime.id}
                      className="personal-hub-poster-card"
                      onClick={() => openPreview(anime.id)}
                    >
                      <div className="poster-card-thumb">
                        <AnimeArtSvg animeId={anime.id} className="poster-card-art" />
                        <div className="poster-card-gradient" />
                        <button
                          type="button"
                          className="poster-card-play-btn"
                          title="Watch Now"
                          onClick={(e) => {
                            e.stopPropagation();
                            playEpisode(anime.id, 1);
                          }}
                        >
                          <Play size={18} fill="currentColor" />
                        </button>
                        <span className="poster-card-liked-badge" title="Liked">
                          <ThumbsUp size={11} fill="currentColor" />
                        </span>
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
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
