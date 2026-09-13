'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { useExtensions } from '@/context/ExtensionsContext';
import { ANIME_CATALOG } from '@/lib/catalog';
import { AnimeArtSvg } from '@/components/visual/AnimeArtSvg';
import { AnimeImagePreview } from '@/components/visual/AnimeImagePreview';
import { CommentSection } from '@/components/comments/CommentSection';
import { AnimeRatingBadges } from '@/components/watch/AnimeRatingBadges';
import { Puzzle, MessageSquare, Bell, Bookmark, Check, Clock, Radio } from 'lucide-react';
import { TrackerStatus } from '@/lib/types';
import { useAnimeTracker } from '@/hooks/useAnimeTracker';

export const NetflixPreviewModal: React.FC = () => {
  const {
    previewAnimeId,
    customPreviewData,
    isPreviewOpen,
    closePreview,
    playEpisode,
    openPreview,
    isInWatchlist,
    toggleWatchlist,
    isLiked,
    toggleLike,
    getAnimeTrackerStatus,
    setAnimeTrackerStatus,
    isNotificationSubscribed,
    toggleNotificationSubscription
  } = usePlayback();

  const { extensions, activeExtension, openModal: openExtensionsModal } = useExtensions();

  const [activeTab, setActiveTab] = useState<'episodes' | 'more-like-this' | 'about' | 'discussion'>('episodes');
  const [isMuted, setIsMuted] = useState(true);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [selectedEpNum, setSelectedEpNum] = useState<number>(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const trackerInfo = useAnimeTracker(previewAnimeId || 'kamui');
  const catalogAnime = previewAnimeId ? ANIME_CATALOG[previewAnimeId] : null;
  const anime = customPreviewData || catalogAnime;
  const bannerImage = customPreviewData?.bannerImage || trackerInfo.bannerImage || anime?.bannerImage;
  const nextAiring = customPreviewData?.nextAiring || trackerInfo.nextAiring || anime?.nextAiring;
  const hasActiveExtension = Boolean(activeExtension && activeExtension.enabled);
  const currentTracker = anime ? getAnimeTrackerStatus(anime.id) : undefined;
  const isSubbed = anime ? isNotificationSubscribed(anime.id) : false;

  const trackerOptions: { value: TrackerStatus; label: string }[] = [
    { value: 'watching', label: 'Watching' },
    { value: 'planning', label: 'Plan to Watch' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' }
  ];

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

  // Play video only when active extension is installed and enabled
  useEffect(() => {
    if (isPreviewOpen && videoRef.current && hasActiveExtension) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isPreviewOpen, previewAnimeId, hasActiveExtension]);

  if (!anime || !isPreviewOpen) return null;

  const inList = isInWatchlist(anime.id);
  const liked = isLiked(anime.id);

  const handleMuteToggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div
      className={`netflix-preview-backdrop ${isPreviewOpen ? 'open' : ''}`}
      id="netflixPreviewBackdrop"
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
            {hasActiveExtension ? (
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
            ) : (
              <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <AnimeImagePreview
                  animeId={anime.id}
                  src={bannerImage || anime.posterImage}
                  alt={anime.title}
                  type="banner"
                  priority
                />
              </div>
            )}
            <div className="preview-hero-gradient-overlay" />
          </div>

          {/* Video Audio Toggle */}
          {hasActiveExtension && (
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
          )}

          {/* Floating Info & CTAs */}
          <div className="preview-hero-info">
            <div className="preview-kanji-badge" id="previewKanjiBadge">
              {anime.kanji} · {anime.badge}
            </div>
            <h2 className="preview-title" id="previewTitle">
              {anime.title}
            </h2>

            {/* Multi-Platform Ratings (AniList, MAL, IMDb, TMDB) */}
            <div style={{ margin: '8px 0 16px' }}>
              <AnimeRatingBadges animeId={anime.id} title={anime.title} />
            </div>

            <div className="preview-action-row">
              <button
                type="button"
                className="btn-netflix-play"
                id="previewMainPlayBtn"
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
                    <span id="previewPlayBtnText">Play Episode 1</span>
                  </>
                ) : (
                  <>
                    <Puzzle size={18} />
                    <span id="previewPlayBtnText">Add Extension to Watch</span>
                  </>
                )}
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

              {/* Anime Tracker Status Dropdown */}
              <div className="tracker-dropdown-wrap" style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  type="button"
                  className={`btn-netflix-tracker ${currentTracker ? 'active' : ''}`}
                  id="previewTrackerBtn"
                  title="Update Anime Tracking Status (Mihon / AniList style)"
                  onClick={() => setIsTrackerOpen(!isTrackerOpen)}
                >
                  <Bookmark size={16} style={{ marginRight: 6 }} />
                  <span>
                    {currentTracker
                      ? trackerOptions.find((o) => o.value === currentTracker)?.label
                      : 'Track'}
                  </span>
                </button>

                {isTrackerOpen && (
                  <div
                    className="tracker-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      zIndex: 150
                    }}
                  >
                    {trackerOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`tracker-menu-opt ${currentTracker === opt.value ? 'selected' : ''}`}
                        onClick={() => {
                          setAnimeTrackerStatus(anime.id, opt.value);
                          setIsTrackerOpen(false);
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
                          setIsTrackerOpen(false);
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
                className={`btn-netflix-icon ${isSubbed ? 'active' : ''}`}
                id="previewNotifyBtn"
                title={
                  isSubbed
                    ? 'Simulcast alerts active (Click to disable)'
                    : 'Notify me when next episode airs'
                }
                aria-label="Toggle simulcast alerts"
                onClick={() => toggleNotificationSubscription(anime.id)}
              >
                <Bell size={18} fill={isSubbed ? 'currentColor' : 'none'} />
              </button>

              <div className="preview-quality-tags">
                <button
                  type="button"
                  className="badge-source-ext"
                  onClick={() => openExtensionsModal(extensions.length === 0 ? 'store' : 'installed')}
                  title={activeExtension ? `Streaming Engine: ${activeExtension.name} (Click to switch source)` : 'No extensions installed (Click to browse store)'}
                >
                  <Puzzle size={12} />
                  <span>Source: {activeExtension ? activeExtension.name : 'None (+ Add)'}</span>
                  <span className={`source-dot ${activeExtension ? 'online' : 'empty'}`} />
                </button>
                <span className="badge-match">{anime.match}</span>
                <span className="badge-rating">{anime.rating}</span>
                <span className="badge-ep-count">{anime.seasonsCount}</span>
                {nextAiring && (
                  <span className="badge-airing-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#93c5fd', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                    <Clock size={11} />
                    Ep. {nextAiring.episode} · {nextAiring.timeStr}
                  </span>
                )}
                <span className="badge-hd">{activeExtension?.supportedResolutions?.[0] || '4K HDR'}</span>
                <span className="badge-spatial">Spatial Audio</span>
              </div>
            </div>

            {/* Extension notice banner when no extension is enabled */}
            {!hasActiveExtension && (
              <div className="preview-ext-notice-bar">
                <div className="preview-ext-notice-icon">
                  <Puzzle size={16} />
                </div>
                <p className="preview-ext-notice-text">
                  <strong>Streaming Extension Required:</strong> Kamui streams through decentralized community source extensions. Add or enable a streaming provider to watch episodes of {anime.title}.
                </p>
                <button
                  type="button"
                  className="btn-add-extension-prompt"
                  onClick={() => openExtensionsModal('store')}
                >
                  Install Extension &rarr;
                </button>
              </div>
            )}
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
              className={`preview-tab-btn ${activeTab === 'discussion' ? 'active' : ''}`}
              onClick={() => setActiveTab('discussion')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={14} />
                Discussion &amp; Chat
              </span>
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
                {(anime.episodes || []).map((ep: any) => (
                  <div
                    key={ep.num}
                    className={`episode-item ${selectedEpNum === ep.num ? 'selected-episode' : ''}`}
                    onClick={() => {
                      setSelectedEpNum(ep.num);
                      if (hasActiveExtension) {
                        playEpisode(anime.id, ep.num);
                      }
                    }}
                  >
                    <div className="episode-num-col">{ep.num}</div>
                    <div className="episode-thumb-col">
                      <AnimeImagePreview
                        animeId={anime.id}
                        src={anime.bannerImage || anime.posterImage}
                        alt={`${anime.title} Episode ${ep.num}`}
                        type="banner"
                        className="w-full h-full object-cover"
                      />
                      <div className="episode-play-hover">
                        {hasActiveExtension ? (
                          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        ) : (
                          <Puzzle size={20} className="text-gold" />
                        )}
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

              {/* Stremio Streams Panel */}
              <div className="stremio-streams-panel" id="stremioStreamsPanel">
                <div className="stremio-streams-header">
                  <span className="stremio-streams-title">
                    <Radio size={14} style={{ color: '#e8b94f' }} />
                    Streams · Episode {selectedEpNum}
                  </span>
                  <span className={`stremio-streams-badge ${hasActiveExtension ? 'online' : 'empty'}`}>
                    {hasActiveExtension ? `${activeExtension?.name} Connected` : 'No Addons Installed'}
                  </span>
                </div>

                {!hasActiveExtension ? (
                  <div className="stremio-streams-empty-box">
                    <div className="stremio-empty-icon">
                      <Puzzle size={22} />
                    </div>
                    <h4 className="stremio-empty-heading">No Streams Available</h4>
                    <p className="stremio-empty-desc">
                      Kamui currently operates as an <strong>Anime Tracker</strong> (Stremio architecture).
                      Install community streaming extensions to play Episode {selectedEpNum} of {anime.title}.
                    </p>
                    <button
                      type="button"
                      className="btn-stremio-install-addon"
                      onClick={() => openExtensionsModal('store')}
                    >
                      <Puzzle size={15} />
                      <span>Install Streaming Extension</span>
                    </button>
                  </div>
                ) : (
                  <div className="stremio-streams-list">
                    <div
                      className="stremio-stream-card"
                      onClick={() => playEpisode(anime.id, selectedEpNum)}
                    >
                      <div className="stream-card-left">
                        <span className="stream-source-tag">{activeExtension?.name || 'Community Addon'}</span>
                        <div className="stream-server-info">
                          <span className="stream-name">High-Speed CDN Mirror · 1080p Ultra</span>
                          <span className="stream-meta">Dual Audio (Japanese / English) · Multi-Sub CC</span>
                        </div>
                      </div>
                      <div className="stream-card-right">
                        <span className="stream-quality-badge">{activeExtension?.supportedResolutions?.[0] || '1080p'}</span>
                        <button type="button" className="btn-stream-play-action">
                          Stream &rarr;
                        </button>
                      </div>
                    </div>
                    <div
                      className="stremio-stream-card"
                      onClick={() => playEpisode(anime.id, selectedEpNum)}
                    >
                      <div className="stream-card-left">
                        <span className="stream-source-tag">{activeExtension?.name || 'Community Addon'}</span>
                        <div className="stream-server-info">
                          <span className="stream-name">Direct Stream Feed · 720p HD</span>
                          <span className="stream-meta">Japanese Original · English Subtitles</span>
                        </div>
                      </div>
                      <div className="stream-card-right">
                        <span className="stream-quality-badge">720p</span>
                        <button type="button" className="btn-stream-play-action">
                          Stream &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* More Like This Pane */}
          {activeTab === 'more-like-this' && (
            <div className="preview-tab-pane active" id="tabPaneMoreLikeThis">
              <div className="more-like-grid">
                {(anime.relatedIds || []).map((relId: string) => {
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
                        <AnimeImagePreview
                          animeId={rel.id}
                          src={rel.posterImage || rel.bannerImage}
                          alt={rel.title}
                          type="poster"
                          className="w-full h-full object-cover"
                        />
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

          {/* Discussion & Comments Pane */}
          {activeTab === 'discussion' && (
            <div className="preview-tab-pane active" id="tabPaneDiscussion">
              <CommentSection animeId={anime.id} />
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
