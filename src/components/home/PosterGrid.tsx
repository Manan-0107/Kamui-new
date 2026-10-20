'use client';

import React from 'react';
import Link from 'next/link';
import { usePlayback } from '@/context/PlaybackContext';
import { useCatalogRow } from '@/hooks/useAnime';
import { AnimeImagePreview } from '@/components/visual/AnimeImagePreview';

export const PosterGrid: React.FC = () => {
  const { openPreview } = usePlayback();
  const { animes, isLoading } = useCatalogRow('trending', 6);

  return (
    <section id="library" style={{ position: 'relative', zIndex: 10 }}>
      <div className="wrap">
        <div className="section-head reveal in">
          <div>
            <div className="kanji-mark">
              <span className="glyph">蔵</span> The Catalog
            </div>
            <h2 className="h" style={{ marginTop: 18 }}>
              Thousands of episodes, one library
            </h2>
          </div>
          <Link href="/watch" className="btn filled">
            Explore Watch Library →
          </Link>
        </div>

        <div className="poster-grid reveal in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '20px', marginTop: '28px' }}>
          {isLoading && animes.length === 0
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    aspectRatio: '2/3',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                />
              ))
            : animes.map((anime) => (
                <div
                  key={anime.id}
                  className="poster"
                  style={{
                    position: 'relative',
                    aspectRatio: '2/3',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.35s cubic-bezier(0.2, 1, 0.3, 1)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
                  }}
                  onClick={() => openPreview(anime.id)}
                >
                  <AnimeImagePreview
                    animeId={anime.id}
                    src={anime.posterImage}
                    alt={anime.title}
                    type="poster"
                    className="poster-art-full"
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(8,12,20,0.95) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '16px 14px'
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--serif-heading, var(--serif))',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#ffffff',
                        lineHeight: 1.2
                      }}
                    >
                      {anime.title}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--gold, #e8b94f)',
                          fontWeight: 600,
                          letterSpacing: '0.04em'
                        }}
                      >
                        {anime.genre}
                      </span>
                      {anime.ratings?.anilist && (
                        <span
                          style={{
                            fontSize: '10px',
                            color: '#70d4ff',
                            background: 'rgba(2, 169, 255, 0.15)',
                            border: '1px solid rgba(2, 169, 255, 0.35)',
                            borderRadius: '4px',
                            padding: '1px 5px',
                            fontWeight: 700,
                            lineHeight: 1.2
                          }}
                        >
                          AL {anime.ratings.anilist.scoreFormatted}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};
