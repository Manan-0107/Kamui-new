'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const AuthPromptModal: React.FC = () => {
  const { authModal, closeAuthModal, openGoogleModal, login, parseUserDisplayName, findAccount } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [signinInput, setSigninInput] = useState('');
  const [signinPass, setSigninPass] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');

  useEffect(() => {
    if (authModal.isOpen && authModal.defaultTab) {
      setActiveTab(authModal.defaultTab);
    }
  }, [authModal.isOpen, authModal.defaultTab]);

  if (!authModal.isOpen) return null;

  const handleSigninSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = signinInput.trim();
    if (!clean) return;

    const existing = findAccount(clean);
    const name = parseUserDisplayName(clean);
    const email = clean.includes('@')
      ? clean
      : existing && existing.email
      ? existing.email
      : `${clean.toLowerCase()}@kamui.stream`;

    login(name, email);
    closeAuthModal();
    if (authModal.redirectUrl) {
      router.push(authModal.redirectUrl);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = signupName.trim() || 'Member';
    const cleanEmail = signupEmail.trim();

    login(cleanName, cleanEmail);
    closeAuthModal();
    if (authModal.redirectUrl) {
      router.push(authModal.redirectUrl);
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
          <div className="kanji-mark">
            <span className="glyph">入</span> Access Kamui
          </div>
          <h2 id="authPromptTitle">{authModal.heading || 'Sign in to start watching'}</h2>
          <p id="authPromptSub">
            {authModal.sub || 'Please sign in or create a free account to stream titles in 4K HDR with zero ads.'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => setActiveTab('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Create Account
          </button>
        </div>

        {/* Sign In Tab */}
        {activeTab === 'signin' && (
          <div className="auth-tab-pane active" id="tabPaneSignin">
            <form className="auth-prompt-form" onSubmit={handleSigninSubmit}>
              <div className="field">
                <label htmlFor="modalSigninEmail">Username or Email</label>
                <input
                  type="text"
                  id="modalSigninEmail"
                  placeholder="e.g. Manan or you@example.com"
                  required
                  autoComplete="username"
                  value={signinInput}
                  onChange={(e) => setSigninInput(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="modalSigninPass">Password</label>
                <input
                  type="password"
                  id="modalSigninPass"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  value={signinPass}
                  onChange={(e) => setSigninPass(e.target.value)}
                />
              </div>
              <button type="submit" className="btn filled auth-prompt-submit">
                Sign in &amp; Stream
              </button>
            </form>
            <div className="auth-prompt-divider">or</div>
            <button
              type="button"
              className="btn auth-alt auth-prompt-google"
              onClick={() => {
                closeAuthModal();
                openGoogleModal(authModal.redirectUrl);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
              </svg>
              Continue with Google
            </button>
            <p className="auth-prompt-footer">
              Prefer standard page?{' '}
              <Link href="/signin" onClick={closeAuthModal}>
                Full Sign In
              </Link>
            </p>
          </div>
        )}

        {/* Sign Up Tab */}
        {activeTab === 'signup' && (
          <div className="auth-tab-pane active" id="tabPaneSignup">
            <form className="auth-prompt-form" onSubmit={handleSignupSubmit}>
              <div className="field">
                <label htmlFor="modalSignupName">Username / Display Name</label>
                <input
                  type="text"
                  id="modalSignupName"
                  placeholder="Your name or username"
                  required
                  autoComplete="name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="modalSignupEmail">Email</label>
                <input
                  type="email"
                  id="modalSignupEmail"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="modalSignupPass">Password</label>
                <input
                  type="password"
                  id="modalSignupPass"
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={signupPass}
                  onChange={(e) => setSignupPass(e.target.value)}
                />
              </div>
              <button type="submit" className="btn filled auth-prompt-submit">
                Create Account &amp; Stream
              </button>
            </form>
            <div className="auth-prompt-divider">or</div>
            <button
              type="button"
              className="btn auth-alt auth-prompt-google"
              onClick={() => {
                closeAuthModal();
                openGoogleModal(authModal.redirectUrl);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
              </svg>
              Continue with Google
            </button>
            <p className="auth-prompt-footer">
              Prefer standard page?{' '}
              <Link href="/signup" onClick={closeAuthModal}>
                Full Sign Up
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
