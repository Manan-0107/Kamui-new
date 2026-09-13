'use client';

import React, { useState, useEffect } from 'react';
import { AnimeRatings } from '@/lib/types';
import { getCachedRatings, getLiveAnimeRatings } from '@/lib/animeRatings';

interface AnimeRatingBadgesProps {
  animeId: string;
  title?: string;
  initialRatings?: AnimeRatings;
  compact?: boolean;
  className?: string;
}

export const AnimeRatingBadges: React.FC<AnimeRatingBadgesProps> = ({
  animeId,
  title,
  initialRatings,
  compact = false,
  className = ''
}) => {
  const [ratings, setRatings] = useState<AnimeRatings>(
    initialRatings || getCachedRatings(animeId)
  );

  useEffect(() => {
    let isMounted = true;
    getLiveAnimeRatings(animeId, title).then((updated) => {
      if (isMounted && updated) {
        setRatings(updated);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [animeId, title]);

  if (!ratings) return null;

  return (
    <div className={`anime-ratings-cluster ${compact ? 'compact' : ''} ${className}`}>
      {/* AniList Badge */}
      <a
        href={ratings.anilist.url || 'https://anilist.co'}
        target="_blank"
        rel="noopener noreferrer"
        className="rating-pill rating-pill-anilist"
        title={`AniList Community Score: ${ratings.anilist.scoreFormatted}${ratings.anilist.rank ? ` · Rank ${ratings.anilist.rank}` : ''}${ratings.anilist.votes ? ` (${ratings.anilist.votes} ratings)` : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="rating-brand-label al-brand">AL</span>
        <span className="rating-score-val">{ratings.anilist.scoreFormatted}</span>
      </a>

      {/* MyAnimeList (MAL) Badge */}
      <a
        href={ratings.mal.url || 'https://myanimelist.net'}
        target="_blank"
        rel="noopener noreferrer"
        className="rating-pill rating-pill-mal"
        title={`MyAnimeList Score: ${ratings.mal.scoreFormatted} / 10${ratings.mal.rank ? ` · Rank ${ratings.mal.rank}` : ''}${ratings.mal.votes ? ` (${ratings.mal.votes} members)` : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="rating-brand-label mal-brand">MAL</span>
        <span className="rating-score-val">{ratings.mal.scoreFormatted}</span>
      </a>

      {/* IMDb Badge */}
      <a
        href={ratings.imdb.url || 'https://www.imdb.com'}
        target="_blank"
        rel="noopener noreferrer"
        className="rating-pill rating-pill-imdb"
        title={`IMDb Score: ${ratings.imdb.scoreFormatted} / 10${ratings.imdb.votes ? ` (${ratings.imdb.votes} reviews)` : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="rating-brand-label imdb-brand">IMDb</span>
        <span className="rating-score-val">{ratings.imdb.scoreFormatted}</span>
      </a>

      {/* TMDB Badge */}
      <a
        href={ratings.tmdb.url || 'https://www.themoviedb.org'}
        target="_blank"
        rel="noopener noreferrer"
        className="rating-pill rating-pill-tmdb"
        title={`TMDB User Score: ${ratings.tmdb.scoreFormatted}${ratings.tmdb.votes ? ` (${ratings.tmdb.votes} votes)` : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="rating-brand-label tmdb-brand">TMDB</span>
        <span className="rating-score-val">{ratings.tmdb.scoreFormatted}</span>
      </a>
    </div>
  );
};
