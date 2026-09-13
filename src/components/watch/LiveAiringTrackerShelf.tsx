'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { Clock, ChevronLeft, ChevronRight, Radio } from 'lucide-react';

interface LiveSimulcastItem {
  id: number;
  title: string;
  romajiTitle: string;
  posterImage?: string;
  bannerImage?: string;
  score?: number;
  nextEpisode?: number;
  airingAt?: number;
  timeUntilAiringStr?: string;
}

export const LiveAiringTrackerShelf: React.FC = () => {
  const [schedule, setSchedule] = useState<LiveSimulcastItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { openPreview } = usePlayback();

  useEffect(() => {
    let isMounted = true;
    fetch('/api/anime-tracker?action=live-schedule')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.schedule)) {
          setSchedule(data.schedule);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = dir === 'left' ? -600 : 600;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!isLoading && schedule.length === 0) return null;

  return (
    <section className="content-row-section live-tracker-shelf-section" id="liveSimulcastTrackerShelf">
      <div className="row-header">
        <div className="row-title-wrap">
          <span className="row-kanji-badge">放</span>
          <h2 className="row-title">
            Real-Time Airing Anime & Simulcast Schedule
          </h2>
          <span className="row-count-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Radio size={11} className="text-gold" />
            Live AniList Tracker ({schedule.length})
          </span>
        </div>

        <div className="row-nav-btns">
          <button
            type="button"
            className="row-arrow row-arrow-left"
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="row-arrow row-arrow-right"
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="row-track-container" ref={scrollRef}>
        <div className="row-track">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="live-tracker-card skeleton-card">
                  <div className="live-tracker-art-placeholder" />
                </div>
              ))
            : schedule.map((item) => (
                <div
                  key={item.id}
                  className="live-tracker-card"
                  onClick={() => {
                    const epCount = Math.max(item.nextEpisode || 12, 12);
                    openPreview(`live-${item.id}`, {
                      id: `live-${item.id}`,
                      title: item.title,
                      kanji: item.romajiTitle,
                      badge: 'SIMULCAST',
                      badgeType: 'trending',
                      genre: 'Anime',
                      genres: ['Action', 'Fantasy', 'Simulcast'],
                      year: '2026',
                      rating: '16+',
                      match: `${item.score || 88}% Match`,
                      seasonsCount: `Episode ${item.nextEpisode || 1} ${item.timeUntilAiringStr || 'Simulcast'}`,
                      trailerVideo: '/kamui-hero.mp4',
                      fullVideo: '/kamui-hero.mp4',
                      hook: `Currently broadcasting in Japan. Episode ${item.nextEpisode || 1} drops ${item.timeUntilAiringStr || 'soon'}.`,
                      synopsis: `Simulcast tracked via AniList real-time GraphQL API. Episode ${item.nextEpisode || 1} scheduled to drop ${item.timeUntilAiringStr || 'soon'}. Track watch status, set episode drop alerts, and stream once extension sources are added.`,
                      cast: 'Original Japanese Voice Cast',
                      mood: 'Simulcast, Releasing, High Octane',
                      studio: 'Simulcast Studio',
                      audio: 'Japanese [Original], Multi-Sub',
                      subtitles: 'English [CC], Spanish, French, German',
                      posterImage: item.posterImage,
                      bannerImage: item.bannerImage || item.posterImage,
                      nextAiring: item.nextEpisode
                        ? { episode: item.nextEpisode, timeStr: item.timeUntilAiringStr || 'Simulcast' }
                        : undefined,
                      ratings: {
                        anilist: {
                          score: item.score || 85,
                          scoreFormatted: item.score ? `${item.score}%` : '85%',
                          url: `https://anilist.co/search/anime?search=${encodeURIComponent(item.title)}`
                        },
                        mal: {
                          score: ((item.score || 85) / 10),
                          scoreFormatted: ((item.score || 85) / 10).toFixed(2),
                          url: `https://myanimelist.net/search/all?q=${encodeURIComponent(item.title)}`
                        },
                        imdb: { score: 8.5, scoreFormatted: '8.5', url: 'https://www.imdb.com' },
                        tmdb: { score: 84, scoreFormatted: '84%', url: 'https://www.themoviedb.org' }
                      },
                      episodes: Array.from({ length: epCount }, (_, i) => ({
                        num: i + 1,
                        title: `Episode ${i + 1}`,
                        duration: '24m',
                        desc: `Simulcast broadcast episode ${i + 1}. Stream available through community extensions.`
                      })),
                      relatedIds: ['kamui', 'ashfall-district', 'paper-moon-society']
                    });
                  }}
                  title={`${item.title} · Next episode ${item.nextEpisode || ''} airing ${item.timeUntilAiringStr || ''}`}
                >
                  <div className="live-tracker-art-wrap">
                    {item.posterImage && (
                      <img
                        src={item.posterImage}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="live-tracker-poster-img"
                      />
                    )}
                    {item.nextEpisode && item.timeUntilAiringStr && (
                      <div className="live-tracker-airing-tag">
                        <Clock size={10} style={{ marginRight: 4 }} />
                        <span>Ep. {item.nextEpisode} · {item.timeUntilAiringStr}</span>
                      </div>
                    )}
                    {item.score && (
                      <span className="live-tracker-score-pill">
                        AL {item.score}%
                      </span>
                    )}
                  </div>

                  <div className="live-tracker-info">
                    <span className="live-tracker-title">{item.title}</span>
                    <span className="live-tracker-sub">
                      {item.romajiTitle !== item.title ? item.romajiTitle : 'Simulcast Airing'}
                    </span>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};
