'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { useExtensions } from '@/context/ExtensionsContext';
import { ANIME_CATALOG } from '@/lib/catalog';
import { CommentSection } from '@/components/comments/CommentSection';
import { Puzzle, ChevronDown, Plus } from 'lucide-react';

export const FullVideoPlayer: React.FC = () => {
  const { playingAnimeId, playingEpNum, isPlayerOpen, closePlayer, openPreview, playEpisode, saveProgress } =
    usePlayback();

  const anime = playingAnimeId ? ANIME_CATALOG[playingAnimeId] : null;
  const currentEp = anime?.episodes.find((e) => e.num === playingEpNum) || anime?.episodes[0];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrubberRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1458); // default fallback ~24m18s
  const [bufferedPercentage, setBufferedPercentage] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [showCenterSplash, setShowCenterSplash] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showLiveDiscussion, setShowLiveDiscussion] = useState(false);
  const [serverMenuOpen, setServerMenuOpen] = useState(false);

  const { extensions, activeExtensionId, activeExtension, setActiveExtension, openModal: openExtensionsModal } =
    useExtensions();

  const speeds = [1.0, 1.25, 1.5, 2.0];
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize playback on open
  useEffect(() => {
    if (isPlayerOpen && videoRef.current && anime) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlayerOpen, playingAnimeId, playingEpNum]);

  // Handle saving progress periodically
  useEffect(() => {
    if (!isPlayerOpen || !playingAnimeId) return;

    const interval = setInterval(() => {
      if (videoRef.current && videoRef.current.duration > 0) {
        saveProgress(
          playingAnimeId,
          playingEpNum,
          videoRef.current.currentTime,
          videoRef.current.duration
        );
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlayerOpen, playingAnimeId, playingEpNum, saveProgress]);

  // Auto-hide controls on inactivity
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 3500);
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setShowCenterSplash(true);
    setTimeout(() => setShowCenterSplash(false), 500);
  }, []);

  const handleRewind = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  }, []);

  const handleForward = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.duration || 1400, videoRef.current.currentTime + 10);
    }
  }, []);

  const handleSkipIntro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.duration || 1400, videoRef.current.currentTime + 85);
    }
  };

  const cycleSpeed = () => {
    const nextIdx = (speedIndex + 1) % speeds.length;
    setSpeedIndex(nextIdx);
    if (videoRef.current) {
      videoRef.current.playbackRate = speeds[nextIdx];
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    if (!isPlayerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleRewind();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleForward();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          closePlayer();
          if (playingAnimeId) openPreview(playingAnimeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerOpen, togglePlay, handleRewind, handleForward, playingAnimeId, openPreview, closePlayer]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
      setDuration(videoRef.current.duration);
    }
    if (videoRef.current.buffered.length > 0 && videoRef.current.duration) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBufferedPercentage((bufferedEnd / videoRef.current.duration) * 100);
    }
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || !videoRef.current || duration <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = percent * duration;
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNextEpisode = () => {
    if (!anime) return;
    const nextEp = anime.episodes.find((e) => e.num === playingEpNum + 1);
    if (nextEp) {
      playEpisode(anime.id, nextEp.num);
    } else {
      playEpisode(anime.id, 1);
    }
  };

  if (!anime || !isPlayerOpen) return null;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`netflix-full-player-overlay ${isPlayerOpen ? 'open' : ''}`}
      id="netflixFullPlayerOverlay"
      aria-hidden={!isPlayerOpen}
      onMouseMove={handleMouseMove}
      style={{ display: isPlayerOpen ? 'block' : 'none' }}
    >
      <div className="full-player-wrapper" id="fullPlayerWrapper">
        <video
          ref={videoRef}
          className="full-player-video"
          id="fullStreamVideo"
          playsInline
          autoPlay
          preload="auto"
          src={anime.fullVideo}
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleNextEpisode}
        />

        {/* Top Controls Bar */}
        <div
          className="player-top-bar"
          style={{
            opacity: controlsVisible ? 1 : 0,
            pointerEvents: controlsVisible ? 'auto' : 'none',
            transition: 'opacity .3s ease'
          }}
        >
          <button
            type="button"
            className="player-back-btn"
            id="playerBackBtn"
            title="Back to preview"
            onClick={() => {
              closePlayer();
              openPreview(anime.id);
            }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="player-back-title">Back to Preview</span>
          </button>
          <div className="player-anime-label" id="playerCurrentEpTitle">
            {anime.title} — Episode {currentEp?.num || playingEpNum}: {currentEp?.title || 'Simulcast'}
          </div>

          {/* Extension / Streaming Server Selector */}
          <div className="player-source-selector-wrap">
            <button
              type="button"
              className="player-server-switch-btn"
              onClick={() => setServerMenuOpen(!serverMenuOpen)}
              title="Switch Streaming Source Extension"
            >
              <Puzzle size={13} className="text-gold" />
              <span className="player-server-name">{activeExtension?.name || 'Kamui Origin'}</span>
              <span className="player-server-ping">({activeExtension?.latencyMs || 24}ms)</span>
              <ChevronDown size={12} />
            </button>

            {serverMenuOpen && (
              <div className="player-server-dropdown custom-scrollbar">
                <div className="player-server-dropdown-head">
                  <span>STREAMING SOURCE EXTENSION</span>
                </div>
                {extensions
                  .filter((e) => e.enabled)
                  .map((ext) => (
                    <div
                      key={ext.id}
                      className={`player-server-item ${ext.id === activeExtensionId ? 'active' : ''}`}
                      onClick={() => {
                        setActiveExtension(ext.id);
                        setServerMenuOpen(false);
                      }}
                    >
                      <div className="server-item-left">
                        <span className={`server-dot ${ext.status}`} />
                        <span className="server-name">{ext.name}</span>
                      </div>
                      <div className="server-item-right">
                        <span className="server-proto">{ext.streamType.toUpperCase()}</span>
                        <span className="server-ping">{ext.latencyMs}ms</span>
                      </div>
                    </div>
                  ))}
                <div
                  className="player-server-add-link"
                  onClick={() => {
                    setServerMenuOpen(false);
                    openExtensionsModal('add');
                  }}
                >
                  <Plus size={13} />
                  <span>+ Add More Extensions...</span>
                </div>
              </div>
            )}
          </div>

          <div className="player-quality-pill">
            {activeExtension?.supportedResolutions[0] || '4K HDR'}
          </div>
        </div>

        {/* Skip Intro Button */}
        <button
          type="button"
          className="btn-skip-intro"
          id="btnSkipIntro"
          style={{
            opacity: controlsVisible ? 1 : 0,
            pointerEvents: controlsVisible ? 'auto' : 'none'
          }}
          onClick={handleSkipIntro}
        >
          Skip Intro &gt;&gt;
        </button>

        {/* Center Play Splash */}
        {showCenterSplash && (
          <div className="player-center-play animate-splash" id="playerCenterPlayIcon" style={{ display: 'flex' }}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="56" height="56" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="56" height="56" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </div>
        )}

        {/* Bottom Controls Bar */}
        <div
          className="player-bottom-controls"
          id="playerBottomControls"
          style={{
            opacity: controlsVisible ? 1 : 0,
            pointerEvents: controlsVisible ? 'auto' : 'none',
            transition: 'opacity .3s ease'
          }}
        >
          {/* Interactive Scrubber Bar */}
          <div
            ref={scrubberRef}
            className="player-scrubber-wrap"
            id="playerScrubberWrap"
            onClick={handleScrubberClick}
          >
            <div className="player-scrubber-track">
              <div
                className="player-scrubber-buffered"
                id="playerScrubberBuffered"
                style={{ width: `${bufferedPercentage}%` }}
              />
              <div
                className="player-scrubber-progress"
                id="playerScrubberProgress"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div
              className="player-scrubber-thumb"
              id="playerScrubberThumb"
              style={{ left: `${progressPercentage}%` }}
            />
          </div>

          <div className="player-controls-row">
            <div className="player-ctrls-left">
              {/* Play / Pause */}
              <button
                type="button"
                className="player-btn"
                id="playerPlayPauseBtn"
                title="Play/Pause (Space)"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Rewind 10s */}
              <button
                type="button"
                className="player-btn"
                id="playerRewindBtn"
                title="Rewind 10s (Left Arrow)"
                onClick={handleRewind}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12.5 8V4L6 9.5 12.5 15v-4c4 0 7 2.5 7 6.5 0-6-3.5-9.5-7-9.5z" />
                </svg>
              </button>

              {/* Forward 10s */}
              <button
                type="button"
                className="player-btn"
                id="playerForwardBtn"
                title="Forward 10s (Right Arrow)"
                onClick={handleForward}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11.5 8V4L18 9.5 11.5 15v-4c-4 0-7 2.5-7 6.5 0-6 3.5-9.5 7-9.5z" />
                </svg>
              </button>

              {/* Volume Slider & Toggle */}
              <div className="player-volume-group">
                <button
                  type="button"
                  className="player-btn"
                  id="playerVolumeToggleBtn"
                  title="Mute/Unmute (M)"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  className="player-vol-slider"
                  id="playerVolumeSlider"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  title="Volume"
                />
              </div>

              {/* Time display */}
              <span className="player-time-display" id="playerTimeDisplay">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="player-ctrls-right">
              {/* Next Episode */}
              <button
                type="button"
                className="player-btn text-pill"
                id="playerNextEpBtn"
                title="Next Episode"
                onClick={handleNextEpisode}
              >
                Next Ep ▶
              </button>

              {/* Speed toggle */}
              <button
                type="button"
                className="player-btn text-pill"
                id="playerSpeedBtn"
                title="Playback Speed"
                onClick={cycleSpeed}
              >
                {speeds[speedIndex]}x
              </button>

              {/* Live Chat / Discussion toggle */}
              <button
                type="button"
                className={`player-btn ${showLiveDiscussion ? 'active-chat' : ''}`}
                id="playerChatBtn"
                title="Episode Discussion & Live Chat"
                onClick={() => setShowLiveDiscussion(!showLiveDiscussion)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                className="player-btn"
                id="playerFullscreenBtn"
                title="Toggle Fullscreen (F)"
                onClick={toggleFullscreen}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Sliding Live Episode Discussion Drawer */}
        {showLiveDiscussion && anime && (
          <div className="player-chat-drawer-overlay">
            <div className="player-chat-drawer">
              <div className="player-chat-head">
                <div className="player-chat-title">
                  <span>💬 Live Chat · Episode {playingEpNum}</span>
                </div>
                <button
                  type="button"
                  className="player-chat-close-btn"
                  onClick={() => setShowLiveDiscussion(false)}
                >
                  &times;
                </button>
              </div>
              <div className="player-chat-scrollable">
                <CommentSection
                  animeId={anime.id}
                  episodeNum={playingEpNum}
                  currentPlaybackTime={currentTime}
                  isSidebarLayout={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
