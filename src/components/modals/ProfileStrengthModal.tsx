'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePlayback } from '@/context/PlaybackContext';
import { DEFAULT_AVATARS } from '@/lib/avatars';

interface BadgeDefinition {
  id: string;
  name: string;
  glyph: string;
  category: string;
  desc: string;
  color: string;
  unlocked: boolean;
  progressText: string;
}

export const ProfileStrengthModal: React.FC = () => {
  const { user, isProfileModalOpen, closeProfileModal, updateSocials, updateAvatar } = useAuth();
  const { watchlist, continueWatching, likedTitles } = usePlayback();

  const [instagram, setInstagram] = useState('');
  const [snapchat, setSnapchat] = useState('');
  const [myanimelist, setMyanimelist] = useState('');
  const [anilist, setAnilist] = useState('');
  const [discord, setDiscord] = useState('');
  const [bio, setBio] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'badges' | 'avatars'>('profile');

  useEffect(() => {
    if (user?.socials) {
      setInstagram(user.socials.instagram || '');
      setSnapchat(user.socials.snapchat || '');
      setMyanimelist(user.socials.myanimelist || '');
      setAnilist(user.socials.anilist || '');
      setDiscord(user.socials.discord || '');
      setBio(user.socials.bio || '');
    }
  }, [user]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isProfileModalOpen) {
        closeProfileModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileModalOpen, closeProfileModal]);

  if (!isProfileModalOpen) return null;

  // Calculate Profile Strength (0 - 100%)
  let strengthScore = 15; // Base account
  if (user?.avatar) strengthScore += 10;
  if (instagram.trim()) strengthScore += 15;
  if (snapchat.trim()) strengthScore += 15;
  if (myanimelist.trim() || anilist.trim()) strengthScore += 20;
  if (discord.trim()) strengthScore += 10;
  if (bio.trim()) strengthScore += 5;
  if (watchlist.length > 0) strengthScore += 5;
  if (continueWatching.length > 0) strengthScore += 5;
  const strength = Math.min(100, strengthScore);

  // Determine Rank Tier
  let rankTier = { title: '🌱 Novice Initiate', level: 'Level 1', color: '#94a3b8' };
  if (strength >= 85) {
    rankTier = { title: '👑 Legendary Sovereign', level: 'Max Level 5', color: '#e8b94f' };
  } else if (strength >= 65) {
    rankTier = { title: '⚡ Anime Sensei', level: 'Level 4', color: '#c084fc' };
  } else if (strength >= 45) {
    rankTier = { title: '🔥 Elite Otaku', level: 'Level 3', color: '#f97316' };
  } else if (strength >= 25) {
    rankTier = { title: '⚔️ Wandering Shinobi', level: 'Level 2', color: '#38bdf8' };
  }

  // Define Atsumaru Tags & Badges
  const badges: BadgeDefinition[] = [
    {
      id: 'shonen',
      name: 'Shonen Vanguard',
      glyph: '🗡️',
      category: 'Combat & Action',
      desc: 'Added or watched fast-paced action & mecha series.',
      color: '#f97316',
      unlocked: watchlist.length > 0 || continueWatching.length > 0,
      progressText: watchlist.length > 0 ? 'Unlocked' : 'Save 1 action title to unlock'
    },
    {
      id: 'dark-realm',
      name: 'Dark Realm Sorcerer',
      glyph: '🌙',
      category: 'Dark Fantasy',
      desc: 'Explored supernatural lore and mythological realms.',
      color: '#c084fc',
      unlocked: true,
      progressText: 'Unlocked by joining Kamui'
    },
    {
      id: 'mal-anilist',
      name: 'Otaku Scholar',
      glyph: '📜',
      category: 'Anime Tracking',
      desc: 'Connected official MyAnimeList or AniList profile.',
      color: '#38bdf8',
      unlocked: Boolean(myanimelist.trim() || anilist.trim()),
      progressText: myanimelist.trim() || anilist.trim() ? 'Linked' : 'Add MyAnimeList or AniList username'
    },
    {
      id: 'socialite',
      name: 'Atsumaru Socialite',
      glyph: '📸',
      category: 'Community',
      desc: 'Shared Instagram or Snapchat handle with the clan.',
      color: '#f43f5e',
      unlocked: Boolean(instagram.trim() || snapchat.trim()),
      progressText: instagram.trim() || snapchat.trim() ? 'Connected' : 'Add Instagram or Snapchat'
    },
    {
      id: 'binge-master',
      name: 'Binge Conqueror',
      glyph: '⚡',
      category: 'Watch Activity',
      desc: 'Actively tracking series in Continue Watching.',
      color: '#fbbf24',
      unlocked: continueWatching.length > 0,
      progressText: continueWatching.length > 0 ? `${continueWatching.length} in progress` : 'Start watching any episode'
    },
    {
      id: 'collector',
      name: 'Grand Archivist',
      glyph: '📚',
      category: 'Library',
      desc: 'Curated 3 or more shows in your personal Watchlist.',
      color: '#34d399',
      unlocked: watchlist.length >= 3,
      progressText: watchlist.length >= 3 ? `${watchlist.length} saved` : `${watchlist.length}/3 shows saved`
    },
    {
      id: 'subscriber',
      name: '4K HDR Purist',
      glyph: '✦',
      category: 'VIP Membership',
      desc: 'Unlimited lossless 4K streaming & Spatial Audio.',
      color: '#e8b94f',
      unlocked: true,
      progressText: 'Kamui Lifetime Member'
    }
  ];

  const handleSaveSocials = (e: React.FormEvent) => {
    e.preventDefault();
    updateSocials({
      instagram: instagram.trim(),
      snapchat: snapchat.trim(),
      myanimelist: myanimelist.trim(),
      anilist: anilist.trim(),
      discord: discord.trim(),
      bio: bio.trim()
    });
  };

  return (
    <div
      className="profile-modal-overlay"
      id="profileModalOverlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeProfileModal();
      }}
    >
      <div className="profile-modal-card" id="profileModalCard">
        {/* Close Button */}
        <button
          type="button"
          className="profile-modal-close"
          onClick={closeProfileModal}
          title="Close (Esc)"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Modal Header & Profile Banner */}
        <div className="profile-modal-header">
          <div className="profile-banner-avatar-wrap">
            <img
              src={user?.avatar || '/avatars/nami.svg'}
              alt={user?.name || 'User'}
              className="profile-banner-avatar"
            />
            <button
              type="button"
              className="profile-banner-avatar-edit"
              title="Change Chibi Avatar"
              onClick={() => setActiveTab('avatars')}
            >
              ✎
            </button>
          </div>

          <div className="profile-banner-details">
            <div className="profile-name-row">
              <h2 className="profile-user-title">{user?.name || 'Kamui Member'}</h2>
              <span className="profile-rank-pill" style={{ color: rankTier.color, borderColor: rankTier.color }}>
                {rankTier.title}
              </span>
            </div>
            <p className="profile-user-email">{user?.email || 'user@kamui.stream'}</p>
            {bio && <p className="profile-user-bio">"{bio}"</p>}
          </div>
        </div>

        {/* Profile Strength Meter Bar */}
        <div className="profile-strength-box">
          <div className="strength-header-row">
            <span className="strength-label">
              <span className="strength-icon">⚡</span> Profile Strength &amp; Atsumaru Rank
            </span>
            <span className="strength-percentage" style={{ color: rankTier.color }}>
              {strength}% · {rankTier.level}
            </span>
          </div>

          <div className="strength-bar-track">
            <div
              className="strength-bar-fill"
              style={{
                width: `${strength}%`,
                background: `linear-gradient(90deg, #c1501f 0%, #e8b94f 50%, ${rankTier.color} 100%)`
              }}
            />
          </div>

          <p className="strength-tip">
            {strength < 100
              ? '💡 Connect your MyAnimeList, AniList, Instagram or Snapchat below to boost your strength to 100% and unlock rare Sovereign Badges!'
              : '🌟 Maximum Profile Strength achieved! All Atsumaru badges & title perks unlocked.'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs-bar">
          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Socials &amp; Bio
          </button>
          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'badges' ? 'active' : ''}`}
            onClick={() => setActiveTab('badges')}
          >
            Atsumaru Badges ({badges.filter((b) => b.unlocked).length}/{badges.length})
          </button>
          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'avatars' ? 'active' : ''}`}
            onClick={() => setActiveTab('avatars')}
          >
            Chibi Avatars
          </button>
        </div>

        {/* Tab Content 1: Socials & Accounts */}
        {activeTab === 'profile' && (
          <form className="profile-socials-form" onSubmit={handleSaveSocials}>
            <div className="profile-form-grid">
              {/* Instagram */}
              <div className="profile-field">
                <label htmlFor="inputInstagram">
                  <span className="field-icon icon-insta">📸</span> Instagram Handle
                </label>
                <div className="field-input-wrap">
                  <span className="input-prefix">@</span>
                  <input
                    type="text"
                    id="inputInstagram"
                    placeholder="your_insta"
                    value={instagram.replace(/^@/, '')}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>
              </div>

              {/* Snapchat */}
              <div className="profile-field">
                <label htmlFor="inputSnapchat">
                  <span className="field-icon icon-snap">👻</span> Snapchat Username
                </label>
                <div className="field-input-wrap">
                  <span className="input-prefix">@</span>
                  <input
                    type="text"
                    id="inputSnapchat"
                    placeholder="your_snap"
                    value={snapchat.replace(/^@/, '')}
                    onChange={(e) => setSnapchat(e.target.value)}
                  />
                </div>
              </div>

              {/* MyAnimeList */}
              <div className="profile-field">
                <label htmlFor="inputMAL">
                  <span className="field-icon icon-mal">🔵</span> MyAnimeList (MAL)
                </label>
                <div className="field-input-wrap">
                  <span className="input-prefix">mal/</span>
                  <input
                    type="text"
                    id="inputMAL"
                    placeholder="MAL_Username"
                    value={myanimelist}
                    onChange={(e) => setMyanimelist(e.target.value)}
                  />
                </div>
              </div>

              {/* AniList */}
              <div className="profile-field">
                <label htmlFor="inputAniList">
                  <span className="field-icon icon-ani">🔷</span> AniList Profile
                </label>
                <div className="field-input-wrap">
                  <span className="input-prefix">ani/</span>
                  <input
                    type="text"
                    id="inputAniList"
                    placeholder="AniList_User"
                    value={anilist}
                    onChange={(e) => setAnilist(e.target.value)}
                  />
                </div>
              </div>

              {/* Discord */}
              <div className="profile-field">
                <label htmlFor="inputDiscord">
                  <span className="field-icon icon-discord">💬</span> Discord Tag
                </label>
                <div className="field-input-wrap">
                  <input
                    type="text"
                    id="inputDiscord"
                    placeholder="username#0000"
                    value={discord}
                    onChange={(e) => setDiscord(e.target.value)}
                  />
                </div>
              </div>

              {/* Custom Bio */}
              <div className="profile-field full-width">
                <label htmlFor="inputBio">
                  <span className="field-icon">✍️</span> Anime Bio / Favorite Quote
                </label>
                <input
                  type="text"
                  id="inputBio"
                  placeholder="e.g. Binging Shonen &amp; Dark Fantasy the night it airs."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={120}
                />
              </div>
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="btn filled profile-save-btn">
                Save &amp; Boost Profile Strength
              </button>
            </div>
          </form>
        )}

        {/* Tab Content 2: Atsumaru Badges */}
        {activeTab === 'badges' && (
          <div className="profile-badges-container">
            <p className="badges-intro-text">
              Earn exclusive Atsumaru Clan Badges and prestige titles by exploring genres, saving shows, and linking tracking accounts:
            </p>

            <div className="profile-badges-grid">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`profile-badge-card ${b.unlocked ? 'unlocked' : 'locked'}`}
                  style={{ '--badge-color': b.color } as React.CSSProperties}
                >
                  <div className="badge-card-top">
                    <span className="badge-glyph-box">{b.glyph}</span>
                    <div className="badge-name-col">
                      <h4 className="badge-name">{b.name}</h4>
                      <span className="badge-category">{b.category}</span>
                    </div>
                  </div>
                  <p className="badge-desc">{b.desc}</p>
                  <div className="badge-status-row">
                    <span className={`badge-status-pill ${b.unlocked ? 'status-unlocked' : 'status-locked'}`}>
                      {b.unlocked ? '✓ Unlocked' : '🔒 Locked'}
                    </span>
                    <span className="badge-progress-note">{b.progressText}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 3: Chibi Avatars */}
        {activeTab === 'avatars' && (
          <div className="profile-avatars-tab">
            <p className="avatars-intro-text">
              Select your authentic Chibi character avatar (One Piece, Bleach, Naruto):
            </p>
            <div className="chibi-avatar-grid">
              {DEFAULT_AVATARS.map((item) => (
                <div
                  key={item.id}
                  className={`chibi-card ${user?.avatar === item.src ? 'active' : ''}`}
                  title={`${item.name} (${item.anime})`}
                  onClick={() => updateAvatar(item.src, `${item.name} (${item.anime})`)}
                >
                  <img className="chibi-img" src={item.src} alt={item.name} />
                  <span className="chibi-name">{item.name}</span>
                  <span className="chibi-anime">{item.anime}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
