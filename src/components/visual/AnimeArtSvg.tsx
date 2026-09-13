'use client';

import React from 'react';
import { ANIME_CATALOG, ANIME_IMAGE_MAP } from '@/lib/catalog';
import { AnimeImagePreview } from './AnimeImagePreview';

interface AnimeArtSvgProps {
  animeId: string;
  className?: string;
}

export const AnimeArtSvg: React.FC<AnimeArtSvgProps> = ({
  animeId,
  className = 'w-full h-full object-cover'
}) => {
  const anime = ANIME_CATALOG[animeId];
  const imgData = ANIME_IMAGE_MAP[animeId];
  const src = imgData?.banner || imgData?.poster || anime?.bannerImage || anime?.posterImage;

  return (
    <AnimeImagePreview
      animeId={animeId}
      src={src}
      alt={anime?.title || animeId}
      type="banner"
      className={className}
    />
  );
};
