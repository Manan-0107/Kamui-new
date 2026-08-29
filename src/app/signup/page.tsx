'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

export default function SignUpPage() {
  const router = useRouter();
  const { login, openGoogleModal } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || 'Member';
    const cleanEmail = email.trim();

    login(cleanName, cleanEmail);
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
              <span className="glyph">登</span> Join Kamui
            </div>
            <h1>Create your account</h1>
            <p>Free forever. No credit card required to start.</p>
          </div>

          <form className="auth-form" id="signupForm" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <label className="check-row">
              <input
                type="checkbox"
                name="terms"
                required
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
              />
              I agree to the Terms of Service and Privacy Policy.
            </label>
            <button type="submit" className="btn filled auth-submit">
              Create account
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
            Already have an account? <Link href="/signin">Sign in</Link>
          </p>
          <p className="auth-note">Concept design for an anime streaming platform — no real account is created.</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
