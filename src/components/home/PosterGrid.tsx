'use client';

import React from 'react';
import Link from 'next/link';
import { usePlayback } from '@/context/PlaybackContext';
import { AnimePosterSvg } from '@/components/visual/AnimePosterSvg';
import { ANIME_CATALOG } from '@/lib/catalog';

const FEATURED_CATALOG = ['kamui', 'ashfall-district', 'paper-moon-society', 'iron-tide', 'nine-crows-inn', 'glasshouse'];

export const PosterGrid: React.FC = () => {
  const { openPreview } = usePlayback();

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
          {FEATURED_CATALOG.map((id) => {
            const anime = ANIME_CATALOG[id];
            if (!anime) return null;

            return (
              <div
                key={id}
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
                onClick={() => openPreview(id)}
              >
                <AnimePosterSvg animeId={id} className="poster-art-full" />
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
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--gold, #e8b94f)',
                      fontWeight: 600,
                      marginTop: '4px',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {anime.genre} · {anime.match} Match
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
