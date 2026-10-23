'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { useAnime } from '@/hooks/useAnime';
import { useStreams } from '@/hooks/useStreams';
import { StreamItem } from '@/lib/extensions';
import { isMediaDownloaded, getDownloadRecord } from '@/lib/downloads/downloadsStorage';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  AlertTriangle,
  Captions
} from 'lucide-react';

export const FullVideoPlayer: React.FC = () => {
  const {
    playingAnimeId,
    playingEpNum,
    activeStream,
    isPlayerOpen,
    closePlayer,
    playEpisode,
    saveProgress
  } = usePlayback();

  const { anime } = useAnime(playingAnimeId);

  // Available streams for fallback & switching
  const { streams } = useStreams(playingAnimeId, playingEpNum, {
    title: anime?.title,
    year: anime?.year ? parseInt(anime.year, 10) : undefined,
    format: anime?.contentType
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<any>(null);

  const [currentStream, setCurrentStream] = useState<StreamItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync current stream from context or fallback to first available stream
  useEffect(() => {
    if (activeStream) {
      setCurrentStream(activeStream);
    } else if (streams.length > 0) {
      const valid = streams.find((s) => s.type !== 'p2p');
      if (valid) setCurrentStream(valid);
    }
  }, [activeStream, streams]);

  // Clean up HLS on unmount or stream change
  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // Handle stream error & offer fallback stream
  const handleStreamError = useCallback((msg?: string) => {
    setPlaybackError(msg || 'Playback error occurred on this stream source.');
    setIsPlaying(false);

    // Auto-fallback: try the next available stream
    const currentIndex = streams.findIndex((s) => s.url === currentStream?.url);
    if (currentIndex >= 0 && currentIndex + 1 < streams.length) {
      const nextStream = streams.slice(currentIndex + 1).find((s) => s.type !== 'p2p');
      if (nextStream) {
        setTimeout(() => {
          setCurrentStream(nextStream);
          setPlaybackError(null);
        }, 1200);
      }
    }
  }, [streams, currentStream]);

  // Initialize playback (HLS vs HTTP)
  useEffect(() => {
    if (!isPlayerOpen || !currentStream || !videoRef.current) return;

    setPlaybackError(null);
    destroyHls();

    // Check if playback requires verified local download
    const requiresLocalDownload = (currentStream as any).requiresDownload || (currentStream as any).isDownloaded;
    if (requiresLocalDownload && playingAnimeId) {
      const downloaded = isMediaDownloaded(playingAnimeId, playingEpNum);
      if (!downloaded) {
        handleStreamError('Playback blocked: Required local media file is absent. Download must be completed first.');
        return;
      }
    }

    const video = videoRef.current;
    const downloadRec = playingAnimeId ? getDownloadRecord(playingAnimeId, playingEpNum) : null;
    const streamUrl = (downloadRec?.status === 'completed' && downloadRec.localPath)
      ? downloadRec.localPath
      : currentStream.url;

    if (currentStream.type === 'hls') {
      // Dynamic import of hls.js for optimal bundle size
      import('hls.js')
        .then(({ default: Hls }) => {
          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsRef.current = hls;
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch(() => {});
            });
            hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    hls.recoverMediaError();
                    break;
                  default:
                    handleStreamError('Fatal HLS playback error');
                    break;
                }
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native Safari / iOS HLS support
            video.src = streamUrl;
            video.play().catch(() => {});
          } else {
            handleStreamError('HLS playback is not supported in this browser.');
          }
        })
        .catch((err) => {
          handleStreamError(`Failed to load HLS engine: ${err.message}`);
        });
    } else {
      // Direct HTTP MP4
      video.src = streamUrl;
      video.play().catch(() => {});
    }

    return () => {
      destroyHls();
    };
  }, [isPlayerOpen, currentStream, destroyHls, handleStreamError, playingAnimeId, playingEpNum]);

  const isAdvancingRef = useRef(false);

  // Auto-advance to next episode on video end
  const handleVideoEnded = () => {
    if (!anime || isAdvancingRef.current) return;
    const nextEp = playingEpNum + 1;
    const maxEps = anime.episodes?.length || 24;
    if (nextEp <= maxEps) {
      isAdvancingRef.current = true;
      playEpisode(anime.id, nextEp);
      setTimeout(() => {
        isAdvancingRef.current = false;
      }, 1200);
    }
  };

  // Track progress and update continue watching
  const handleTimeUpdate = () => {
    if (!videoRef.current || !anime) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(cur);
    setDuration(dur);

    // Persist progress every ~5 seconds
    if (Math.floor(cur) % 5 === 0 && dur > 0) {
      saveProgress(anime.id, playingEpNum, cur, dur, anime.title);
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Seek
  const handleSeek = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isPlayerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement).tagName.toLowerCase())) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(-10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(10);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'Escape') {
        closePlayer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Autohide controls on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  if (!isPlayerOpen) return null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[4000] bg-black flex items-center justify-center select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
        }}
        onError={() => handleStreamError()}
        onEnded={handleVideoEnded}
        playsInline
      >
        {/* Subtitle Tracks */}
        {currentStream?.subtitles?.map((sub, idx) => (
          <track
            key={idx}
            kind="subtitles"
            label={sub.label}
            srcLang={sub.lang}
            src={sub.url}
            default={selectedSubtitle === sub.lang}
          />
        ))}
      </video>

      {/* Playback Error Overlay */}
      {playbackError && (
        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-20">
          <AlertTriangle size={48} className="text-amber-400 mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Stream Playback Failed</h3>
          <p className="text-xs text-white/60 max-w-md mb-6">{playbackError}</p>

          <div className="flex items-center gap-3">
            {streams.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const alt = streams.find((s) => s.url !== currentStream?.url && s.type !== 'p2p');
                  if (alt) setCurrentStream(alt);
                }}
                className="px-4 py-2 bg-gold text-black font-semibold text-xs rounded-lg hover:bg-gold/90 cursor-pointer"
              >
                Try Another Stream
              </button>
            )}
            <button
              type="button"
              onClick={closePlayer}
              className="px-4 py-2 bg-white/10 text-white font-semibold text-xs rounded-lg hover:bg-white/15 cursor-pointer"
            >
              Close Player
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div
        className={`absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 z-10 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={closePlayer}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Back to details"
          >
            <X size={20} />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
              {anime?.title || 'Playing Episode'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>Episode {playingEpNum}</span>
              {currentStream && (
                <>
                  <span>·</span>
                  <span className="uppercase text-gold font-semibold">{currentStream.title}</span>
                  {currentStream.extensionName && <span>({currentStream.extensionName})</span>}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Subtitle Selector */}
        {currentStream?.subtitles && currentStream.subtitles.length > 0 && (
          <div className="flex items-center gap-2">
            <Captions size={16} className="text-white/60" />
            <select
              value={selectedSubtitle}
              onChange={(e) => {
                setSelectedSubtitle(e.target.value);
                if (videoRef.current?.textTracks) {
                  for (let i = 0; i < videoRef.current.textTracks.length; i++) {
                    const track = videoRef.current.textTracks[i];
                    track.mode = track.language === e.target.value ? 'showing' : 'disabled';
                  }
                }
              }}
              className="bg-black/60 border border-white/20 text-white text-xs rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="off">Subtitles Off</option>
              {currentStream.subtitles.map((s, idx) => (
                <option key={idx} value={s.lang}>
                  {s.label} ({s.lang})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 z-10 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Timeline Slider */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] font-mono text-white/70 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setCurrentTime(val);
              if (videoRef.current) videoRef.current.currentTime = val;
            }}
            className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-gold"
          />
          <span className="text-[11px] font-mono text-white/70 w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Bottom Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 rounded-full bg-white text-black hover:bg-white/90 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>

            {/* -10s */}
            <button
              type="button"
              onClick={() => handleSeek(-10)}
              title="Rewind 10s"
              className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw size={18} />
            </button>

            {/* +10s */}
            <button
              type="button"
              onClick={() => handleSeek(10)}
              title="Forward 10s"
              className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCw size={18} />
            </button>

            {/* Next Episode */}
            <button
              type="button"
              onClick={handleVideoEnded}
              title="Next Episode"
              className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <SkipForward size={18} />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 ml-2">
              <button
                type="button"
                onClick={() => {
                  if (!videoRef.current) return;
                  videoRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  setIsMuted(val === 0);
                  if (videoRef.current) {
                    videoRef.current.volume = val;
                    videoRef.current.muted = val === 0;
                  }
                }}
                className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatTime(sec: number): string {
  if (isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}
