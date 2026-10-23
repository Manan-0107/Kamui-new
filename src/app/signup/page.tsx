'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Play } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { user, updateName } = useAuth();
  const [profileName, setProfileName] = useState(user?.name || '');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileName.trim()) {
      updateName(profileName.trim());
    }
    router.push('/watch');
  };

  return (
    <>
      <Navbar />

      <section className="auth">
        <div className="auth-ambient aura-1" aria-hidden="true" />
        <div className="auth-ambient aura-2" aria-hidden="true" />
        <div className="auth-watermark" aria-hidden="true">
          神威
        </div>

        <div className="auth-card">
          <div className="auth-head">
            <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center text-gold mx-auto mb-3">
              <ShieldCheck size={26} />
            </div>
            <div className="kanji-mark">
              <span className="glyph">始</span> Begin Watching
            </div>
            <h1>Instant Access</h1>
            <p>No registration, email, or credit card required.</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 space-y-2 mb-6 text-left">
            <p className="font-semibold text-white">How Kamui Works:</p>
            <p className="text-white/70 leading-relaxed">
              Browse anime catalogs powered by AniList. All your personal lists and viewing history are stored safely in your device storage without mandatory user accounts.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSaveProfile}>
            <div className="field">
              <label htmlFor="profileName">Local Display Name (Optional)</label>
              <input
                type="text"
                id="profileName"
                name="profileName"
                placeholder="e.g. Anime Fan"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>
            <button type="submit" className="btn filled auth-submit flex items-center justify-center gap-2">
              <Play size={16} fill="currentColor" />
              <span>Browse Anime Catalog</span>
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}
