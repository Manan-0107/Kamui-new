'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const GoogleAuthModal: React.FC = () => {
  const { googleModal, closeGoogleModal, login, user, registeredAccounts } = useAuth();
  const router = useRouter();

  const lastUser = user || (registeredAccounts.length > 0 ? registeredAccounts[0] : null);
  const initialName = lastUser && lastUser.name && lastUser.name !== 'Anime Member' ? lastUser.name : 'Manan';
  const initialEmail =
    lastUser && lastUser.email && lastUser.email !== 'member@kamui.stream'
      ? lastUser.email
      : `${initialName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    if (googleModal.isOpen) {
      setName(initialName);
      setEmail(initialEmail);
    }
  }, [googleModal.isOpen, initialName, initialEmail]);

  if (!googleModal.isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || 'Google User';
    const cleanEmail = email.trim() || `${cleanName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

    login(cleanName, cleanEmail, undefined, 'google');
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
          <div className="google-logo-wrap">
            <svg width="22" height="22" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z" />
              <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
            </svg>
          </div>
          <h3 id="googleModalTitle">Sign in with Google</h3>
          <p>
            Choose an account to continue to <span className="brand-highlight">Kamui</span>
          </p>
        </div>

        <form id="googleAuthForm" onSubmit={handleSubmit}>
          <div className="google-accounts-box">
            <div className="google-account-row" id="googleQuickAccount">
              <div className="google-avatar-icon" id="googleAvatarPreview">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="google-account-details">
                <div className="google-acc-name" id="googlePreviewName">
                  {name}
                </div>
                <div className="google-acc-email" id="googlePreviewEmail">
                  {email}
                </div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4285f4" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            <div className="google-custom-inputs">
              <div className="google-field">
                <label htmlFor="googleInputName">Google Account Name</label>
                <input
                  type="text"
                  id="googleInputName"
                  value={name}
                  required
                  placeholder="Your Google Name"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="google-field">
                <label htmlFor="googleInputEmail">Gmail Address</label>
                <input
                  type="email"
                  id="googleInputEmail"
                  value={email}
                  required
                  placeholder="you@gmail.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="google-auth-btn-submit" id="googleBtnSubmit">
            <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#fff" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" />
              <path fill="#fff" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z" />
              <path fill="#fff" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z" />
              <path fill="#fff" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
            </svg>
            Continue as <span style={{ marginLeft: 4 }}>{name}</span>
          </button>

          <p className="google-auth-disclaimer">
            To continue, Google will share your name, email address, and language preference with Kamui.
          </p>
        </form>
      </div>
    </div>
  );
};
