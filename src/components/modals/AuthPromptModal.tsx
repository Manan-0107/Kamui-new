'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Play, User } from 'lucide-react';

export const AuthPromptModal: React.FC = () => {
  const { authModal, closeAuthModal, openProfileModal } = useAuth();
  const router = useRouter();

  if (!authModal.isOpen) return null;

  const handleStartWatching = () => {
    closeAuthModal();
    if (authModal.redirectUrl) {
      router.push(authModal.redirectUrl);
    } else {
      router.push('/watch');
    }
  };

  return (
    <div
      className="auth-prompt-overlay open"
      id="authPromptOverlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="auth-prompt-modal" role="dialog" aria-modal="true" aria-labelledby="authPromptTitle">
        <button
          className="auth-prompt-close"
          id="authPromptClose"
          aria-label="Close modal"
          onClick={closeAuthModal}
        >
          &times;
        </button>

        <div className="auth-prompt-header">
          <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center text-gold mx-auto mb-3">
            <ShieldCheck size={28} />
          </div>
          <h2 id="authPromptTitle">Local-First Anime Player</h2>
          <p id="authPromptSub">
            Kamui v0.1 does not require an account or password. All data stays privately on your device.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 space-y-2 mb-6">
          <div className="flex items-center gap-2 text-white font-medium">
            <span>✨</span>
            <span>No Cloud Database or Remote Tracking</span>
          </div>
          <p className="text-white/60 leading-relaxed">
            Your Watchlist, Continue Watching history, personal notes, and extension settings are stored directly in your browser or application-private storage.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            className="btn filled w-full flex items-center justify-center gap-2 py-3"
            onClick={handleStartWatching}
          >
            <Play size={16} fill="currentColor" />
            <span>Continue to Catalog</span>
          </button>

          <button
            type="button"
            className="btn w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
            onClick={() => {
              closeAuthModal();
              openProfileModal();
            }}
          >
            <User size={15} />
            <span>Customize Local Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
