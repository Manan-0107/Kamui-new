'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EmberCanvas } from '@/components/EmberCanvas';
import { HeroMoon } from '@/components/HeroMoon';
import { FeatureCards } from '@/components/home/FeatureCards';
import { PosterGrid } from '@/components/home/PosterGrid';
import { usePlayback } from '@/context/PlaybackContext';
import { ContentRow } from '@/components/watch/ContentRow';
import { ContinueWatchingShelf } from '@/components/watch/ContinueWatchingShelf';

export default function HomePage() {
  const { watchlist, continueWatching } = usePlayback();

  return (
    <>
      <Navbar />

      <div id="top" />

      {/* Hero Section */}
      <section className="hero">
        <EmberCanvas />
        <HeroMoon />

        <div className="hero-mountains" aria-hidden="true">
          <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
            <polygon
              points="0,400 0,260 180,180 340,240 520,140 700,220 900,150 1080,230 1260,170 1440,240 1440,400"
              fill="#0d1622"
            />
            <polygon
              points="0,400 0,320 220,280 420,320 640,270 860,310 1080,280 1440,320 1440,400"
              fill="#080c13"
            />
          </svg>
        </div>

        <div className="hero-content">
          <div className="hero-inner">
            <div className="eyebrow">
              <span className="rule" /> Anime streaming &nbsp;·&nbsp; No ads &nbsp;·&nbsp; 4K HDR
            </div>

            <h1 className="title">
              <span className="jp">神威</span>
              <span className="title-word video-title-word">
                <svg
                  className="title-video-svg"
                  viewBox="0 0 760 160"
                  preserveAspectRatio="xMidYMid meet"
                  role="img"
                  aria-label="KAMUI"
                >
                  <defs>
                    <clipPath id="kamuiTitleClip">
                      <text x="50%" y="58%" textAnchor="middle" dominantBaseline="central" className="svg-kamui-text">
                        KAMUI
                      </text>
                    </clipPath>
                    <linearGradient id="kamuiStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                      <stop offset="40%" stopColor="#f6edd9" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#e8b94f" stopOpacity="0.85" />
                    </linearGradient>
                  </defs>
                  <foreignObject x="0" y="0" width="760" height="160" clipPath="url(#kamuiTitleClip)">
                    <video
                      className="title-bg-video"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      src="/kamui-hero.mp4"
                    />
                  </foreignObject>
                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="svg-kamui-stroke"
                    aria-hidden="true"
                  >
                    KAMUI
                  </text>
                </svg>
              </span>
            </h1>

            <p className="tagline">
              Every story worth losing a season to — subbed, dubbed, and yours the moment it airs in Japan.
            </p>
            <div className="hero-meta">
              <span className="tag">Same-day simulcasts</span>
              <span className="tag">4K &amp; HDR</span>
              <span className="tag">Offline downloads</span>
              <span className="tag">Watch on everything</span>
            </div>
            <div className="hero-cta">
              <Link href="/watch" className="btn filled">
                Start watching free
              </Link>
              <a href="#library" className="btn">
                See what's streaming
              </a>
            </div>
          </div>
        </div>

        <div className="scroll-cue">
          <span className="line" /> Scroll
        </div>
      </section>

      {/* Features */}
      <FeatureCards />

      {/* Dynamic Continue Watching on Homepage */}
      {continueWatching.length > 0 && (
        <section className="home-shelf-section">
          <div className="wrap">
            <ContinueWatchingShelf />
          </div>
        </section>
      )}

      {/* Dynamic Watchlist on Homepage */}
      {watchlist.length > 0 && (
        <section className="home-shelf-section">
          <div className="wrap">
            <ContentRow
              id="myWatchlistSection"
              kanji="録"
              title="My Watchlist"
              countBadge={watchlist.length}
              animeIds={watchlist}
            />
          </div>
        </section>
      )}

      {/* Poster Catalog Preview */}
      <PosterGrid />

      {/* Quote / World Section */}
      <section className="world" id="quote">
        <div className="world-glyph" aria-hidden="true">
          冬
        </div>
        <div className="wrap reveal in">
          <blockquote>
            "Every winter takes something. This one's giving you a reason to stay in and watch."
          </blockquote>
        </div>
      </section>

      {/* CTA / Watch Section */}
      <section className="watch" id="cta">
        <div className="wrap reveal in">
          <div className="kanji-mark" style={{ justifyContent: 'center' }}>
            <span className="glyph">始</span> Begin
          </div>
          <h2 className="h" style={{ margin: '18px auto 0' }}>
            Your next binge starts tonight.
          </h2>
          <p>No credit card required. Cancel anytime, from any device.</p>
          <Link href="/signup" className="btn filled">
            Start watching free
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
