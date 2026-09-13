'use client';

import React, { useState, useEffect, useRef } from 'react';

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
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setHasError(false);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <div className={`anime-img-preview-container ${type} ${className}`}>
      {/* Background dark glass shimmer placeholder (Stremio style) */}
      {!isLoaded && !hasError && (
        <div className="anime-img-preview-shimmer" />
      )}

      {/* Real High-Definition Anime Image from AniList / Kitsu CDN */}
      {src && !hasError ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          className={`anime-img-preview-real ${isLoaded ? 'loaded' : ''}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            // Only set error if image really failed to load and naturalWidth is 0
            if (!imgRef.current || imgRef.current.naturalWidth === 0) {
              setHasError(true);
            }
          }}
        />
      ) : (
        <div className="anime-img-preview-error-fallback">
          <span className="error-fallback-title">{alt}</span>
        </div>
      )}
    </div>
  );
};
