'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

export default function SignInPage() {
  const router = useRouter();
  const { login, parseUserDisplayName, findAccount, openGoogleModal } = useAuth();

  const [inputVal, setInputVal] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputVal.trim();
    if (!clean) return;

    const existing = findAccount(clean);
    const name = parseUserDisplayName(clean);
    const email = clean.includes('@')
      ? clean
      : existing && existing.email
      ? existing.email
      : `${clean.toLowerCase()}@kamui.stream`;

    login(name, email);
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
            <div className="kanji-mark">
              <span className="glyph">入</span> Welcome back
            </div>
            <h1>Sign in to Kamui</h1>
            <p>Pick up your season right where you left off.</p>
          </div>

          <form className="auth-form" id="signinForm" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Username or Email</label>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="e.g. Manan or you@example.com"
                required
                autoComplete="username"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="field-row">
              <label className="check-row" style={{ alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />{' '}
                Stay signed in
              </label>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>
            <button type="submit" className="btn filled auth-submit">
              Sign in
            </button>
          </form>

          <div className="auth-divider">or</div>

          <button
            type="button"
            className="btn auth-alt"
            onClick={() => openGoogleModal('/watch')}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#e8b94f"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
              />
              <path
                fill="#ece3d0"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"
              />
              <path
                fill="#a79d87"
                d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z"
              />
              <path
                fill="#6c6555"
                d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="auth-switch">
            New to Kamui? <Link href="/signup">Create an account</Link>
          </p>
          <p className="auth-note">Concept design for an anime streaming platform — no real account is created.</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
