'use client';

import React from 'react';
import Link from 'next/link';
import { usePlayback } from '@/context/PlaybackContext';

export const PosterGrid: React.FC = () => {
  const { openPreview } = usePlayback();

  return (
    <section id="library">
      <div className="wrap">
        <div className="section-head reveal in">
          <div>
            <div className="kanji-mark">
              <span className="glyph">蔵</span> The catalog
            </div>
            <h2 className="h" style={{ marginTop: 18 }}>
              Thousands of episodes, one library
            </h2>
          </div>
          <Link href="/watch" className="btn">
            Browse full library
          </Link>
        </div>

        <div className="poster-grid reveal in">
          <div
            className="poster"
            data-anime-id="kamui"
            style={{ '--pc1': '#c1501f', '--pc2': '#0a0f18', cursor: 'pointer' } as React.CSSProperties}
            onClick={() => openPreview('kamui')}
          >
            <span className="poster-badge">Original</span>
            <span className="poster-title">Kamui</span>
            <span className="poster-genre">Dark fantasy</span>
          </div>

          <div
            className="poster"
            data-anime-id="ashfall-district"
            style={{ '--pc1': '#6fa8b5', '--pc2': '#0a0f18', cursor: 'pointer' } as React.CSSProperties}
            onClick={() => openPreview('ashfall-district')}
          >
            <span className="poster-title">Ashfall District</span>
            <span className="poster-genre">Sci-fi</span>
          </div>

          <div
            className="poster"
            data-anime-id="paper-moon-society"
            style={{ '--pc1': '#e8b94f', '--pc2': '#0a0f18', cursor: 'pointer' } as React.CSSProperties}
            onClick={() => openPreview('paper-moon-society')}
          >
            <span className="poster-title">Paper Moon Society</span>
            <span className="poster-genre">Slice of life</span>
          </div>

          <div
            className="poster"
            data-anime-id="iron-tide"
            style={{ '--pc1': '#8a5fb0', '--pc2': '#0a0f18', cursor: 'pointer' } as React.CSSProperties}
            onClick={() => openPreview('iron-tide')}
          >
            <span className="poster-title">Iron Tide</span>
            <span className="poster-genre">Mecha</span>
          </div>

          <div
            className="poster"
            data-anime-id="nine-crows-inn"
            style={{ '--pc1': '#c1501f', '--pc2': '#101824', cursor: 'pointer' } as React.CSSProperties}
            onClick={() => openPreview('nine-crows-inn')}
          >
            <span className="poster-badge">New</span>
            <span className="poster-title">Nine Crows Inn</span>
            <span className="poster-genre">Mystery</span>
          </div>

          <div
            className="poster"
            data-anime-id="glasshouse"
            style={{ '--pc1': '#3f8f6e', '--pc2': '#0a0f18', cursor: 'pointer' } as React.CSSProperties}
            onClick={() => openPreview('glasshouse')}
          >
            <span className="poster-title">Glasshouse</span>
            <span className="poster-genre">Romance</span>
          </div>
        </div>
      </div>
    </section>
  );
};
