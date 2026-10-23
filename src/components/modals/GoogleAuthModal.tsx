'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export const GoogleAuthModal: React.FC = () => {
  const { googleModal, closeGoogleModal } = useAuth();
  const router = useRouter();

  if (!googleModal.isOpen) return null;

  const handleContinue = () => {
    closeGoogleModal();
    if (googleModal.redirectUrl) {
      router.push(googleModal.redirectUrl);
    }
  };

  return (
    <div
      className="google-auth-overlay open"
      id="googleAuthOverlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeGoogleModal();
      }}
    >
      <div className="google-auth-card" role="dialog" aria-modal="true" aria-labelledby="googleModalTitle">
        <button
          type="button"
          className="google-auth-close"
          id="googleAuthClose"
          aria-label="Close modal"
          onClick={closeGoogleModal}
        >
          &times;
        </button>

        <div className="google-auth-header">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mx-auto mb-3">
            <ShieldCheck size={28} />
          </div>
          <h3 id="googleModalTitle">Account-Free Experience</h3>
          <p>
            Kamui v0.1 is designed to be <span className="brand-highlight">100% Local-First</span>.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 space-y-2 mb-4 leading-relaxed">
          <p>
            Google Sign-In is disabled in this release. All watch history, custom lists, anime tracking, and notes are securely kept on your local device.
          </p>
          <p className="text-white/60">
            No remote account or credentials are required to discover and stream anime.
          </p>
        </div>

        <button
          type="button"
          className="btn filled w-full py-2.5 text-sm font-semibold"
          onClick={handleContinue}
        >
          Continue Watching
        </button>
      </div>
    </div>
  );
};
