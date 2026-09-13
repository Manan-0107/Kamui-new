'use client';

import React from 'react';
import { ANIME_CATALOG, ANIME_IMAGE_MAP } from '@/lib/catalog';
import { AnimeImagePreview } from './AnimeImagePreview';

interface AnimePosterSvgProps {
  animeId: string;
  className?: string;
}

export const AnimePosterSvg: React.FC<AnimePosterSvgProps> = ({
  animeId,
  className = 'art'
}) => {
  const anime = ANIME_CATALOG[animeId];
  const imgData = ANIME_IMAGE_MAP[animeId];
  const src = imgData?.poster || anime?.posterImage || imgData?.banner || anime?.bannerImage;

  return (
    <AnimeImagePreview
      animeId={animeId}
      src={src}
      alt={anime?.title || animeId}
      type="poster"
      className={className}
    />
  );
};
