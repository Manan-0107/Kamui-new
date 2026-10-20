'use client';

import React from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { useExtensions } from '@/context/ExtensionsContext';
import { useAnime } from '@/hooks/useAnime';
import { Puzzle, X } from 'lucide-react';

export const FullVideoPlayer: React.FC = () => {
  const { playingAnimeId, isPlayerOpen, closePlayer } = usePlayback();
  const { openModal: openExtensionsModal } = useExtensions();
  const { anime } = useAnime(playingAnimeId);

  if (!isPlayerOpen) return null;

  return (
    <div
      className="netflix-preview-backdrop open"
      style={{ zIndex: 3000 }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="netflix-preview-modal"
        style={{
          maxWidth: 640,
          margin: 'auto',
          padding: '40px 30px',
          textAlign: 'center',
          background: 'var(--night, #080c14)',
          border: '1px solid var(--line, rgba(255, 255, 255, 0.1))',
          borderRadius: 16
        }}
      >
        <button
          className="netflix-preview-close"
          onClick={closePlayer}
          aria-label="Close"
          style={{ position: 'absolute', top: 16, right: 16 }}
        >
          <X size={20} />
        </button>

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(232, 185, 79, 0.15)',
            border: '1px solid rgba(232, 185, 79, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--gold, #e8b94f)'
          }}
        >
          <Puzzle size={32} />
        </div>

        <h3 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', marginBottom: 10 }}>
          Install an Extension to Watch
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 24px' }}>
          Kamui is an open-source anime catalog client that ships with <strong>no media content sources</strong>.
          {anime ? ` To stream episodes of "${anime.title}", ` : ' To stream episodes, '}
          install a community extension (unlocked in Step 2).
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            type="button"
            className="btn filled"
            onClick={() => {
              closePlayer();
              openExtensionsModal('store');
            }}
          >
            Manage Extensions
          </button>
          <button
            type="button"
            className="btn"
            onClick={closePlayer}
          >
            Back to Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
