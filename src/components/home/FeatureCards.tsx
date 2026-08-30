import React from 'react';

export const FeatureCards: React.FC = () => {
  return (
    <section id="features">
      <div className="wrap">
        <div className="section-head reveal in">
          <div>
            <div className="kanji-mark">
              <span className="glyph">観</span> How you watch
            </div>
            <h2 className="h" style={{ marginTop: 18 }}>
              Built for people who actually finish the season
            </h2>
          </div>
        </div>
        <div className="feature-grid reveal in">
          <div className="feature-card">
            <div className="feature-icon">早</div>
            <h3>Same-day simulcasts</h3>
            <p>
              New episodes land within hours of their Japan broadcast — subtitled and ready before you've finished dinner.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">画</div>
            <h3>4K &amp; HDR, always</h3>
            <p>
              Every catalog title streams up to 4K with HDR and lossless audio on supported devices, no separate tier required.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">声</div>
            <h3>Full dub &amp; sub libraries</h3>
            <p>
              Switch languages mid-episode. Most series ship with English, Japanese, and regional dub tracks at launch.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">降</div>
            <h3>Download &amp; watch offline</h3>
            <p>Take entire seasons with you. Downloads sync progress back the moment you're online again.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">器</div>
            <h3>Every screen you own</h3>
            <p>One account, up to five profiles, streaming on TVs, consoles, phones, and browsers at the same time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">静</div>
            <h3>Zero ads, mid-episode or otherwise</h3>
            <p>No pre-roll, no mid-episode breaks, on every plan — including the free tier.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
