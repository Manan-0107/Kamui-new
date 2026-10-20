'use client';

import React from 'react';
import { useAnime } from '@/hooks/useAnime';
import { AnimeImagePreview } from './AnimeImagePreview';

interface AnimeArtSvgProps {
  animeId: string;
  className?: string;
  src?: string;
  alt?: string;
}

export const AnimeArtSvg: React.FC<AnimeArtSvgProps> = ({
  animeId,
  className = 'w-full h-full object-cover',
  src: propSrc,
  alt: propAlt
}) => {
  const { anime } = useAnime(propSrc ? null : animeId);
  const src = propSrc || anime?.bannerImage || anime?.posterImage;

  return (
    <AnimeImagePreview
      animeId={animeId}
      src={src}
      alt={propAlt || anime?.title || animeId}
      type="banner"
      className={className}
    />
  );
};
