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
  const [ratings, setRatings] = useState<AnimeRatings>(() => {
    return initialRatings || getCachedRatings(animeId);
  });

  useEffect(() => {
    let isMounted = true;
    getLiveAnimeRatings(animeId, title)
      .then((updated) => {
        if (isMounted && updated) {
          setRatings(updated);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [animeId, title]);

  if (!ratings) return null;

  const al = ratings.anilist;
  const mal = ratings.mal;
  const imdb = ratings.imdb;
  const tmdb = ratings.tmdb;

  return (
    <div className={`anime-ratings-cluster ${compact ? 'compact' : ''} ${className}`}>
      {/* AniList Badge */}
      {al && (
        <a
          href={al.url || 'https://anilist.co'}
          target="_blank"
          rel="noopener noreferrer"
          className="rating-pill rating-pill-anilist"
          title={`AniList Community Score: ${al.scoreFormatted || al.score || 'N/A'}${al.rank ? ` · Rank ${al.rank}` : ''}${al.votes ? ` (${al.votes} ratings)` : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="rating-brand-label al-brand">AL</span>
          <span className="rating-score-val">{al.scoreFormatted || (al.score ? `${al.score}%` : 'N/A')}</span>
        </a>
      )}

      {/* MyAnimeList (MAL) Badge */}
      {mal && (
        <a
          href={mal.url || 'https://myanimelist.net'}
          target="_blank"
          rel="noopener noreferrer"
          className="rating-pill rating-pill-mal"
          title={`MyAnimeList Score: ${mal.scoreFormatted || mal.score || 'N/A'} / 10${mal.rank ? ` · Rank ${mal.rank}` : ''}${mal.votes ? ` (${mal.votes} members)` : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="rating-brand-label mal-brand">MAL</span>
          <span className="rating-score-val">{mal.scoreFormatted || (mal.score ? Number(mal.score).toFixed(2) : 'N/A')}</span>
        </a>
      )}

      {/* IMDb Badge */}
      {imdb && (
        <a
          href={imdb.url || 'https://www.imdb.com'}
          target="_blank"
          rel="noopener noreferrer"
          className="rating-pill rating-pill-imdb"
          title={`IMDb Score: ${imdb.scoreFormatted || imdb.score || 'N/A'} / 10${imdb.votes ? ` (${imdb.votes} reviews)` : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="rating-brand-label imdb-brand">IMDb</span>
          <span className="rating-score-val">{imdb.scoreFormatted || (imdb.score ? Number(imdb.score).toFixed(1) : 'N/A')}</span>
        </a>
      )}

      {/* TMDB Badge */}
      {tmdb && (
        <a
          href={tmdb.url || 'https://www.themoviedb.org'}
          target="_blank"
          rel="noopener noreferrer"
          className="rating-pill rating-pill-tmdb"
          title={`TMDB User Score: ${tmdb.scoreFormatted || tmdb.score || 'N/A'}${tmdb.votes ? ` (${tmdb.votes} votes)` : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="rating-brand-label tmdb-brand">TMDB</span>
          <span className="rating-score-val">{tmdb.scoreFormatted || (tmdb.score ? `${tmdb.score}%` : 'N/A')}</span>
        </a>
      )}
    </div>
  );
};
