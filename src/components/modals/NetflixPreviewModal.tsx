'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { ANIME_CATALOG } from '@/lib/catalog';
import { AnimeArtSvg } from '@/components/visual/AnimeArtSvg';

export const NetflixPreviewModal: React.FC = () => {
  const {
    previewAnimeId,
    isPreviewOpen,
    closePreview,
    playEpisode,
    isInWatchlist,
    toggleWatchlist,
    isLiked,
    toggleLike,
    openPreview
  } = usePlayback();

  const [activeTab, setActiveTab] = useState<'episodes' | 'more-like-this' | 'about'>('episodes');
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const anime = previewAnimeId ? ANIME_CATALOG[previewAnimeId] : null;

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreviewOpen) {
        closePreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen, closePreview]);

  // Prevent background scrolling when preview modal is open
  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPreviewOpen]);

  // Autoplay trailer video when opened
  useEffect(() => {
    if (isPreviewOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [isPreviewOpen, previewAnimeId]);

  if (!anime) return null;

  const inList = isInWatchlist(anime.id);
  const liked = isLiked(anime.id);

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div
      className={`netflix-preview-overlay ${isPreviewOpen ? 'open' : ''}`}
      id="netflixPreviewOverlay"
      role="dialog"
      aria-modal="true"
      aria-hidden={!isPreviewOpen}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePreview();
      }}
    >
      <div className="netflix-preview-modal" id="netflixPreviewModal">
        {/* Modal Close Button */}
        <button
          className="netflix-preview-close"
          id="previewCloseBtn"
          aria-label="Close preview"
          title="Close (Esc)"
          onClick={closePreview}
        >
          &times;
        </button>

        {/* Hero / Backdrop Video Banner Section */}
        <div className="preview-hero-banner" id="previewHeroBanner">
          <div className="preview-video-wrap">
            <video
              ref={videoRef}
              className="preview-video"
              id="previewVideoPlayer"
              loop
              playsInline
              muted={isMuted}
              preload="auto"
              src={anime.trailerVideo}
            />
            <div className="preview-hero-gradient-overlay" />
          </div>

          {/* Video Audio Toggle */}
          <div className="preview-hero-controls">
            <button
              type="button"
              className="preview-circle-btn preview-mute-btn"
              id="previewMuteBtn"
              title="Toggle audio"
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
          </div>

          {/* Floating Info & CTAs */}
          <div className="preview-hero-info">
            <div className="preview-kanji-badge" id="previewKanjiBadge">
              {anime.kanji} · {anime.badge}
            </div>
            <h2 className="preview-title" id="previewTitle">
              {anime.title}
            </h2>

            <div className="preview-action-row">
              <button
                type="button"
                className="btn-netflix-play"
                id="previewMainPlayBtn"
                onClick={() => playEpisode(anime.id, 1)}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span id="previewPlayBtnText">Play Episode 1</span>
              </button>

              <button
                type="button"
                className={`btn-netflix-icon ${inList ? 'active' : ''}`}
                id="previewAddListBtn"
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
                className={`btn-netflix-icon ${liked ? 'active' : ''}`}
                id="previewLikeBtn"
                title={liked ? 'Liked' : 'I like this'}
                aria-label="Like title"
                onClick={() => toggleLike(anime.id)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              </button>

              <div className="preview-quality-tags">
                <span className="badge-match">{anime.match}</span>
                <span className="badge-rating">{anime.rating}</span>
                <span className="badge-ep-count">{anime.seasonsCount}</span>
                <span className="badge-hd">4K HDR</span>
                <span className="badge-spatial">Spatial Audio</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Content Details */}
        <div className="preview-content-body">
          <div className="preview-main-col">
            <p className="preview-hook" id="previewHook">
              "{anime.hook}"
            </p>
            <p className="preview-synopsis" id="previewSynopsis">
              {anime.synopsis}
            </p>

            <div className="preview-features-strip">
              <div className="preview-feat-item">
                <span className="feat-label">Audio:</span>
                <span className="feat-val">{anime.audio}</span>
              </div>
              <div className="preview-feat-item">
                <span className="feat-label">Subtitles:</span>
                <span className="feat-val">{anime.subtitles}</span>
              </div>
            </div>
          </div>

          <div className="preview-side-col">
            <div className="meta-block">
              <span className="meta-label">Cast:</span>
              <span className="meta-values">{anime.cast}</span>
            </div>
            <div className="meta-block">
              <span className="meta-label">Genres:</span>
              <span className="meta-values">{anime.genres.join(', ')}</span>
            </div>
            <div className="meta-block">
              <span className="meta-label">This anime is:</span>
              <span className="meta-values">{anime.mood}</span>
            </div>
            <div className="meta-block">
              <span className="meta-label">Studio:</span>
              <span className="meta-values">{anime.studio}</span>
            </div>
          </div>
        </div>

        {/* Netflix Tabs Section */}
        <div className="preview-tabs-container">
          <div className="preview-tabs-header">
            <button
              type="button"
              className={`preview-tab-btn ${activeTab === 'episodes' ? 'active' : ''}`}
              onClick={() => setActiveTab('episodes')}
            >
              Episodes
            </button>
            <button
              type="button"
              className={`preview-tab-btn ${activeTab === 'more-like-this' ? 'active' : ''}`}
              onClick={() => setActiveTab('more-like-this')}
            >
              More Like This
            </button>
            <button
              type="button"
              className={`preview-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About <span className="tab-title-name">{anime.title}</span>
            </button>
          </div>

          {/* Episodes Pane */}
          {activeTab === 'episodes' && (
            <div className="preview-tab-pane active" id="tabPaneEpisodes">
              <div className="episodes-header-row">
                <div className="episodes-season-badge">Season 1</div>
                <span className="episodes-country-sub">Subbed &amp; Dubbed &bull; Same-Day Simulcast in 4K HDR</span>
              </div>
              <div className="episodes-list">
                {anime.episodes.map((ep) => (
                  <div
                    key={ep.num}
                    className="episode-item"
                    onClick={() => playEpisode(anime.id, ep.num)}
                  >
                    <div className="episode-num-col">{ep.num}</div>
                    <div className="episode-thumb-col">
                      <AnimeArtSvg animeId={anime.id} className="w-full h-full object-cover" />
                      <div className="episode-play-hover">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="episode-details-col">
                      <div className="ep-title-row">
                        <h4 className="ep-title">{ep.title}</h4>
                        <span className="ep-duration">{ep.duration}</span>
                      </div>
                      <p className="ep-desc">{ep.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* More Like This Pane */}
          {activeTab === 'more-like-this' && (
            <div className="preview-tab-pane active" id="tabPaneMoreLikeThis">
              <div className="more-like-grid">
                {anime.relatedIds.map((relId) => {
                  const rel = ANIME_CATALOG[relId];
                  if (!rel) return null;
                  const relInList = isInWatchlist(rel.id);
                  return (
                    <div
                      key={rel.id}
                      className="more-like-card"
                      onClick={() => openPreview(rel.id)}
                    >
                      <div className="more-like-thumb">
                        <AnimeArtSvg animeId={rel.id} className="w-full h-full object-cover" />
                        <span className="more-like-duration">{rel.seasonsCount}</span>
                      </div>
                      <div className="more-like-body">
                        <div className="more-like-meta-row">
                          <span className="badge-match">{rel.match}</span>
                          <span className="badge-rating">{rel.rating}</span>
                          <button
                            type="button"
                            className={`btn-netflix-icon mini-icon ${relInList ? 'active' : ''}`}
                            title="Add to My List"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(rel.id);
                            }}
                          >
                            {relInList ? (
                              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2.5">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2.5">
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <h4 className="more-like-title">{rel.title}</h4>
                        <p className="more-like-synopsis">{rel.synopsis}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* About Pane */}
          {activeTab === 'about' && (
            <div className="preview-tab-pane active" id="tabPaneAbout">
              <div className="about-anime-details">
                <div className="about-head-title">About {anime.title}</div>
                <div className="about-meta-row">
                  <span className="about-label">Director:</span>
                  <span className="about-val">{anime.director}</span>
                </div>
                <div className="about-meta-row">
                  <span className="about-label">Animation Studio:</span>
                  <span className="about-val">{anime.studio}</span>
                </div>
                <div className="about-meta-row">
                  <span className="about-label">Genres:</span>
                  <span className="about-val">{anime.genres.join(', ')}</span>
                </div>
                <div className="about-meta-row">
                  <span className="about-label">This Show is:</span>
                  <span className="about-val">{anime.mood}</span>
                </div>
                <div className="about-meta-row">
                  <span className="about-label">Maturity Rating:</span>
                  <span className="about-val">{anime.rating} — {anime.maturityDesc}</span>
                </div>
                <div className="about-meta-row">
                  <span className="about-label">Simulcast Status:</span>
                  <span className="about-val">Exclusive 4K HDR Simulcasts · Same-day Japan broadcast</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
