'use client';

import React from 'react';
import { useAnime } from '@/hooks/useAnime';
import { AnimeImagePreview } from './AnimeImagePreview';

interface AnimePosterSvgProps {
  animeId: string;
  className?: string;
  src?: string;
  alt?: string;
}

export const AnimePosterSvg: React.FC<AnimePosterSvgProps> = ({
  animeId,
  className = 'art',
  src: propSrc,
  alt: propAlt
}) => {
  const { anime } = useAnime(propSrc ? null : animeId);
  const src = propSrc || anime?.posterImage || anime?.bannerImage;

  return (
    <AnimeImagePreview
      animeId={animeId}
      src={src}
      alt={propAlt || anime?.title || animeId}
      type="poster"
      className={className}
    />
  );
};
