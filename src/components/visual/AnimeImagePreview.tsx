'use client';

import React, { useState } from 'react';
import { AnimePosterSvg } from './AnimePosterSvg';
import { AnimeArtSvg } from './AnimeArtSvg';

interface AnimeImagePreviewProps {
  animeId: string;
  src?: string;
  alt?: string;
  type?: 'poster' | 'banner';
  className?: string;
  priority?: boolean;
}

export const AnimeImagePreview: React.FC<AnimeImagePreviewProps> = ({
  animeId,
  src,
  alt = 'Anime Art Preview',
  type = 'poster',
  className = '',
  priority = false
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no image src or if image failed to load, fallback to SVG artwork
  if (!src || hasError) {
    if (type === 'banner') {
      return (
        <div className={`anime-img-preview-fallback banner ${className}`}>
          <AnimeArtSvg animeId={animeId} className="w-full h-full" />
        </div>
      );
    }
    return (
      <div className={`anime-img-preview-fallback poster ${className}`}>
        <AnimePosterSvg animeId={animeId} className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className={`anime-img-preview-container ${type} ${className}`}>
      {/* Background SVG fallback while image is loading */}
      {!isLoaded && (
        <div className="anime-img-preview-placeholder">
          {type === 'banner' ? (
            <AnimeArtSvg animeId={animeId} />
          ) : (
            <AnimePosterSvg animeId={animeId} />
          )}
        </div>
      )}

      {/* Real High-Definition Anime Image */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`anime-img-preview-real ${isLoaded ? 'loaded' : 'loading'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
};
