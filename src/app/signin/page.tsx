'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Play } from 'lucide-react';

export default function SignInPage() {
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
              <span className="glyph">入</span> Local-First Architecture
            </div>
            <h1>No Account Required</h1>
            <p>Kamui v0.1 operates 100% locally on your device.</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 space-y-2 mb-6 text-left">
            <p className="font-semibold text-white">Your privacy is preserved:</p>
            <ul className="list-disc list-inside space-y-1 text-white/70">
              <li>No account registration or password required</li>
              <li>Watchlist, history, and notes stay on your device</li>
              <li>No remote telemetry or analytics tracking</li>
              <li>Backup and restore data anytime using JSON exports</li>
            </ul>
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
              <span>Start Watching Free</span>
            </button>
          </form>

          <p className="auth-switch text-xs text-white/50 mt-4">
            Want to import an existing backup? Open the Profile menu and select Backup &amp; Restore.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
