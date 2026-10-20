'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { useAnime } from '@/hooks/useAnime';
import { useStreams } from '@/hooks/useStreams';
import { AnimeImagePreview } from '@/components/visual/AnimeImagePreview';
import { AnimeRatingBadges } from '@/components/watch/AnimeRatingBadges';
import { PlayButton } from '@/components/common/PlayButton';
import { CommentSection } from '@/components/comments/CommentSection';
import { AnimeData, TrackerStatus } from '@/lib/types';
import Link from 'next/link';
import { Puzzle, Radio, Bookmark, Check, Bell, MessageSquare, Clock, Play, RefreshCw } from 'lucide-react';

const RelatedAnimeCard: React.FC<{ animeId: string }> = ({ animeId }) => {
  const { anime } = useAnime(animeId);
  const { openPreview, toggleWatchlist, isInWatchlist } = usePlayback();

  if (!anime) {
    return (
      <div className="more-like-card skeleton-card" style={{ height: 260, background: 'rgba(255,255,255,0.03)' }}>
        <div style={{ height: 160, background: 'rgba(255,255,255,0.05)' }} />
      </div>
    );
  }

  const relInList = isInWatchlist(anime.id);

  return (
    <div className="more-like-card" onClick={() => openPreview(anime.id)}>
      <div className="more-like-thumb">
        <AnimeImagePreview
          animeId={anime.id}
          src={anime.posterImage || anime.bannerImage}
          alt={anime.title}
          type="poster"
          className="w-full h-full object-cover"
        />
        <span className="more-like-duration">{anime.seasonsCount}</span>
      </div>
      <div className="more-like-body">
        <div className="more-like-meta-row">
          <span className="badge-match">{anime.match}</span>
          <span className="badge-rating">{anime.rating}</span>
          <button
            type="button"
            className={`btn-netflix-icon mini-icon ${relInList ? 'active' : ''}`}
            title="Add to My List"
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist(anime.id, anime.title);
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
        <h4 className="more-like-title">{anime.title}</h4>
        <p className="more-like-synopsis">{anime.synopsis}</p>
      </div>
    </div>
  );
};

export const NetflixPreviewModal: React.FC = () => {
  const {
    previewAnimeId,
    customPreviewData,
    isPreviewOpen,
    closePreview,
    toggleWatchlist,
    isInWatchlist,
    isLiked,
    toggleLike,
    getAnimeTrackerStatus,
    setAnimeTrackerStatus,
    isNotificationSubscribed,
    toggleNotificationSubscription,
    playEpisode
  } = usePlayback();

  const [activeTab, setActiveTab] = useState<'episodes' | 'more-like-this' | 'about' | 'discussion'>('episodes');
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [selectedEpNum, setSelectedEpNum] = useState<number>(1);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Dynamic async fetching by numeric AniList id
  const { anime: fetchedAnime, isLoading: isFetchingAnime } = useAnime(
    customPreviewData ? null : previewAnimeId
  );
  const anime: AnimeData | null = customPreviewData || fetchedAnime;

  // Real-time parallel stream fetching from enabled extensions
  const streamQueryParams = anime
    ? {
        title: anime.title,
        year: anime.year ? parseInt(anime.year, 10) : undefined,
        format: anime.contentType
      }
    : undefined;

  const {
    perExtension,
    isLoading: isStreamsLoading
  } = useStreams(anime?.id, selectedEpNum, streamQueryParams);

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

  if (!isPreviewOpen) return null;

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
      <div className="netflix-preview-modal" id="netflixPreviewModal" ref={modalRef}>
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

        {isFetchingAnime && !anime ? (
          <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--muted)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 20px', width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--gold, #e8b94f)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p>Loading title from AniList...</p>
          </div>
        ) : !anime ? (
          <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--muted)' }}>
            <h3>Unable to load anime details</h3>
            <p style={{ marginTop: 8 }}>The requested title could not be retrieved from AniList.</p>
            <button
              type="button"
              className="btn filled"
              style={{ marginTop: 20 }}
              onClick={closePreview}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Hero / Backdrop Banner Section */}
            <div className="preview-hero-banner" id="previewHeroBanner">
              <div className="preview-video-wrap">
                <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <AnimeImagePreview
                    animeId={anime.id}
                    src={anime.bannerImage || anime.posterImage}
                    alt={anime.title}
                    type="banner"
                    priority
                  />
                </div>
                <div className="preview-hero-gradient-overlay" />
              </div>

              {/* Floating Info & CTAs */}
              <div className="preview-hero-info">
                <div className="preview-kanji-badge" id="previewKanjiBadge">
                  {anime.kanji} {anime.badge ? `· ${anime.badge}` : ''}
                </div>
                <h2 className="preview-title" id="previewTitle">
                  {anime.title}
                </h2>

                {/* Multi-Platform Ratings (AniList) */}
                <div style={{ margin: '8px 0 16px' }}>
                  <AnimeRatingBadges animeId={anime.id} title={anime.title} initialRatings={anime.ratings} />
                </div>

                <div className="preview-action-row">
                  {/* Centralized PlayButton (Locked in Step 1, unlockable in Step 2) */}
                  <PlayButton
                    animeId={anime.id}
                    size="lg"
                    className="btn-netflix-play"
                  />

                  <button
                    type="button"
                    className={`btn-netflix-icon ${inList ? 'active' : ''}`}
                    id="previewAddListBtn"
                    title={inList ? 'Remove from My List' : 'Add to My List'}
                    aria-label="Add to My List"
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

                  <button
                    type="button"
                    className={`btn-netflix-icon ${liked ? 'active' : ''}`}
                    id="previewLikeBtn"
                    title={liked ? 'Liked' : 'Like'}
                    aria-label="Like"
                    onClick={() => toggleLike(anime.id, anime.title)}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                  </button>

                  {/* Simulcast Drop Alert Bell */}
                  <button
                    type="button"
                    className={`btn-netflix-icon ${isSubbed ? 'active' : ''}`}
                    id="previewSubNotifBtn"
                    title={isSubbed ? 'Alerts active for new episodes' : 'Enable new episode alerts'}
                    aria-label="Episode Alerts"
                    onClick={() => toggleNotificationSubscription(anime.id, anime.title)}
                  >
                    <Bell size={18} fill={isSubbed ? 'currentColor' : 'none'} />
                  </button>

                  {/* Anime Tracker Dropdown */}
                  <div className="tracker-dropdown-wrap" style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className={`btn-netflix-icon btn-tracker-trigger ${currentTracker ? 'active' : ''}`}
                      id="previewTrackerTriggerBtn"
                      title="Update Anime Tracking Status"
                      aria-label="Update Tracking Status"
                      onClick={() => setIsTrackerOpen(!isTrackerOpen)}
                    >
                      <Bookmark size={18} fill={currentTracker ? 'currentColor' : 'none'} />
                    </button>

                    {isTrackerOpen && (
                      <div className="tracker-dropdown-menu" id="previewTrackerDropdown">
                        <div className="tracker-menu-header">Anime Tracker Status</div>
                        {trackerOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`tracker-menu-opt ${currentTracker === opt.value ? 'selected' : ''}`}
                            onClick={() => {
                              setAnimeTrackerStatus(anime.id, opt.value, anime.title);
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
                              setAnimeTrackerStatus(anime.id, null, anime.title);
                              setIsTrackerOpen(false);
                            }}
                          >
                            Remove from Tracker
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="preview-badges-meta">
                  <span className="badge-match">{anime.match}</span>
                  <span className="badge-rating">{anime.rating}</span>
                  <span className="badge-ep-count">{anime.seasonsCount}</span>
                  {anime.nextAiring && (
                    <span className="badge-airing-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#93c5fd', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                      <Clock size={11} />
                      Ep. {anime.nextAiring.episode} · {anime.nextAiring.timeStr}
                    </span>
                  )}
                  {anime.year && <span className="meta-year">{anime.year}</span>}
                </div>
              </div>
            </div>

            {/* 2-Column Content Details */}
            <div className="preview-content-body">
              <div className="preview-main-col">
                <p className="preview-synopsis" id="previewSynopsis">
                  {anime.synopsis}
                </p>

                {/* Only render audio / subtitles if provided */}
                {(Boolean(anime.audio) || Boolean(anime.subtitles)) && (
                  <div className="preview-features-strip">
                    {anime.audio && (
                      <div className="preview-feat-item">
                        <span className="feat-label">Audio:</span>
                        <span className="feat-val">{anime.audio}</span>
                      </div>
                    )}
                    {anime.subtitles && (
                      <div className="preview-feat-item">
                        <span className="feat-label">Subtitles:</span>
                        <span className="feat-val">{anime.subtitles}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Visible AniList Attribution */}
                <div style={{ marginTop: 14, fontSize: 12, color: 'var(--muted)' }}>
                  Data provided by{' '}
                  <a
                    href={`https://anilist.co/anime/${anime.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#02a9ff', textDecoration: 'underline' }}
                  >
                    AniList
                  </a>
                </div>
              </div>

              <div className="preview-side-col">
                {/* Only render cast if provided */}
                {anime.cast && (
                  <div className="meta-block">
                    <span className="meta-label">Cast:</span>
                    <span className="meta-values">{anime.cast}</span>
                  </div>
                )}
                {anime.genres && anime.genres.length > 0 && (
                  <div className="meta-block">
                    <span className="meta-label">Genres:</span>
                    <span className="meta-values">{anime.genres.join(', ')}</span>
                  </div>
                )}
                {anime.mood && (
                  <div className="meta-block">
                    <span className="meta-label">Mood:</span>
                    <span className="meta-values">{anime.mood}</span>
                  </div>
                )}
                {anime.studio && (
                  <div className="meta-block">
                    <span className="meta-label">Studio:</span>
                    <span className="meta-values">{anime.studio}</span>
                  </div>
                )}
                {anime.director && (
                  <div className="meta-block">
                    <span className="meta-label">Director:</span>
                    <span className="meta-values">{anime.director}</span>
                  </div>
                )}
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
                    <div className="episodes-season-badge">Episodes</div>
                    <span className="episodes-country-sub">Install an extension to watch</span>
                  </div>
                  <div className="episodes-list">
                    {(anime.episodes || []).map((ep: any) => (
                      <div
                        key={ep.num}
                        className={`episode-item ${selectedEpNum === ep.num ? 'selected-episode' : ''}`}
                        onClick={() => setSelectedEpNum(ep.num)}
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
                          <div className="episode-play-hover" title="Locked: Install an extension to watch">
                            <Puzzle size={20} className="text-gold" />
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

                  {/* Streams Picker Panel (Grouped by Extension) */}
                  <div className="stremio-streams-panel" id="stremioStreamsPanel">
                    <div className="stremio-streams-header flex items-center justify-between">
                      <span className="stremio-streams-title flex items-center gap-2">
                        <Radio size={14} style={{ color: '#e8b94f' }} />
                        <span>Streams · Episode {selectedEpNum}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {isStreamsLoading && (
                          <span className="text-xs text-white/50 flex items-center gap-1.5">
                            <RefreshCw size={12} className="animate-spin" />
                            <span>Querying extensions...</span>
                          </span>
                        )}
                        <Link
                          href="/extensions"
                          className="text-xs text-gold/80 hover:text-gold hover:underline"
                        >
                          Manage Extensions
                        </Link>
                      </div>
                    </div>

                    {perExtension.length === 0 ? (
                      /* No extensions installed / enabled */
                      <div className="stremio-streams-empty-box">
                        <div className="stremio-empty-icon">
                          <Puzzle size={22} />
                        </div>
                        <h4 className="stremio-empty-heading">No Content Sources Installed</h4>
                        <p className="stremio-empty-desc">
                          Kamui ships with no built-in media content sources.
                          Install an extension in the Extension Manager to scrape and watch streams.
                        </p>
                        <Link
                          href="/extensions"
                          className="btn-stremio-install-addon"
                        >
                          <Puzzle size={15} />
                          <span>Install Extensions</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4 mt-3">
                        {perExtension.map((res) => (
                          <div
                            key={res.extension.id}
                            className="rounded-xl p-3.5 bg-black/40 border border-white/10"
                          >
                            <div className="flex items-center justify-between mb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-white">
                                  {res.extension.manifest.name}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                                  {res.extension.manifest.version}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                  res.status === 'ok'
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : res.status === 'loading'
                                    ? 'bg-white/10 text-white/50'
                                    : res.status === 'empty'
                                    ? 'bg-white/5 text-white/40'
                                    : 'bg-red-500/15 text-red-400'
                                }`}
                              >
                                {res.status === 'ok'
                                  ? `${res.streams.length} stream(s)`
                                  : res.status === 'loading'
                                  ? 'Fetching...'
                                  : res.status === 'empty'
                                  ? 'No streams found'
                                  : 'Error'}
                              </span>
                            </div>

                            {res.status === 'error' && (
                              <p className="text-xs text-red-400/80 mb-2">
                                {res.error || 'Failed to fetch streams from this provider.'}
                              </p>
                            )}

                            {res.status === 'ok' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {res.streams.map((stream, sIdx) => {
                                  const isUnsupported = stream.type === 'p2p';
                                  return (
                                    <button
                                      key={sIdx}
                                      type="button"
                                      disabled={isUnsupported}
                                      onClick={() => {
                                        if (isUnsupported) return;
                                        playEpisode(anime.id, selectedEpNum, stream);
                                      }}
                                      className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                                        isUnsupported
                                          ? 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
                                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-gold/40 cursor-pointer'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-md bg-gold/15 flex items-center justify-center text-gold shrink-0">
                                          <Play size={12} fill="currentColor" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-xs font-semibold text-white truncate">
                                            {stream.title}
                                          </div>
                                          <div className="text-[10px] text-white/50 flex items-center gap-1.5 mt-0.5">
                                            <span className="uppercase">{stream.type}</span>
                                            {stream.quality && <span>· {stream.quality}</span>}
                                            {stream.language && <span>· {stream.language}</span>}
                                            {stream.subtitles && stream.subtitles.length > 0 && (
                                              <span>· {stream.subtitles.length} Sub(s)</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {isUnsupported ? (
                                        <span className="text-[10px] text-amber-400/80 font-medium shrink-0">
                                          Not supported in this version
                                        </span>
                                      ) : (
                                        <span className="text-xs text-gold font-bold shrink-0">
                                          Play →
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* More Like This Pane */}
              {activeTab === 'more-like-this' && (
                <div className="preview-tab-pane active" id="tabPaneMoreLikeThis">
                  {anime.relatedIds && anime.relatedIds.length > 0 ? (
                    <div className="more-like-grid">
                      {anime.relatedIds.map((relId: string) => (
                        <RelatedAnimeCard key={relId} animeId={relId} />
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--muted)', padding: '20px 0' }}>No recommendations found.</p>
                  )}
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
                    {anime.studio && (
                      <div className="about-meta-row">
                        <span className="about-label">Animation Studio:</span>
                        <span className="about-val">{anime.studio}</span>
                      </div>
                    )}
                    {anime.genres && (
                      <div className="about-meta-row">
                        <span className="about-label">Genres:</span>
                        <span className="about-val">{anime.genres.join(', ')}</span>
                      </div>
                    )}
                    {anime.mood && (
                      <div className="about-meta-row">
                        <span className="about-label">Mood:</span>
                        <span className="about-val">{anime.mood}</span>
                      </div>
                    )}
                    {anime.rating && (
                      <div className="about-meta-row">
                        <span className="about-label">Score / Rating:</span>
                        <span className="about-val">{anime.rating}</span>
                      </div>
                    )}
                    <div className="about-meta-row">
                      <span className="about-label">Data Attribution:</span>
                      <span className="about-val">
                        Data provided by{' '}
                        <a
                          href={`https://anilist.co/anime/${anime.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#02a9ff', textDecoration: 'underline' }}
                        >
                          AniList
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
