'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { usePlayback } from '@/context/PlaybackContext';
import { useFriends } from '@/context/FriendsContext';
import { DEFAULT_AVATARS } from '@/lib/avatars';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isWatchPage = pathname === '/watch';
  const isAuthPage = pathname === '/signin' || pathname === '/signup';

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifyDropdownOpen, setNotifyDropdownOpen] = useState(false);

  const { cycleTheme } = useTheme();
  const { user, logout, updateAvatar, openAuthModal, openProfileModal } = useAuth();
  const { friends, openFriendsModal } = useFriends();
  const {
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    openPreview,
    toggleSidebar
  } = usePlayback();

  const profileRef = useRef<HTMLDivElement | null>(null);
  const notifyRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll blur detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns & search on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(target)) {
        setNotifyDropdownOpen(false);
      }
      if (searchWrapRef.current && !searchWrapRef.current.contains(target) && !searchQuery) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [searchQuery, setIsSearchOpen]);

  const handleDeviceAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        updateAvatar(dataUrl, 'device photo');
      }
    };
    reader.readAsDataURL(file);
  };

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (pathname === '/watch') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(`/watch#${sectionId}`);
    }
  };

  const handleSearchToggle = () => {
    const nextState = !isSearchOpen;
    setIsSearchOpen(nextState);
    if (nextState) {
      setTimeout(() => searchInputRef.current?.focus(), 120);
    }
  };

  const currentAvatar = user?.avatar || '/avatars/nami.svg';

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`} id="siteNav">
      {/* Brand & Sidebar Toggle */}
      <div className="nav-brand-group">
        <button
          type="button"
          className="nav-sidebar-toggle-btn"
          id="navSidebarToggleBtn"
          aria-label="Open sidebar menu"
          title="Open menu"
          onClick={() => toggleSidebar()}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Link href="/" className="brand">
          <span className="mark">神威</span>
          <span className="brand-word">KAMUI</span>
        </Link>
      </div>

      {/* Nav Links Desktop */}
      <nav
        className="links"
        style={
          mobileMenuOpen
            ? {
                display: 'flex',
                position: 'fixed',
                inset: '70px 0 auto 0',
                flexDirection: 'column',
                gap: 0,
                transform: 'none',
                left: 0,
                background: 'var(--night)',
                padding: '10px 30px 30px',
                borderBottom: '1px solid var(--line)',
                zIndex: 99
              }
            : undefined
        }
      >
        <Link
          href="/"
          className={pathname === '/' ? 'active' : ''}
          onClick={() => setMobileMenuOpen(false)}
        >
          Home
        </Link>
        <a
          href="/watch#myWatchlistSection"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('myWatchlistSection');
          }}
        >
          My List
        </a>
      </nav>

      {/* Actions */}
      <div className="nav-actions">
        {/* Expandable Search with Smooth Slider */}
        <div
          ref={searchWrapRef}
          className={`browse-search-wrap ${isSearchOpen ? 'open' : ''}`}
          id="browseSearchWrap"
        >
          <button
            type="button"
            className="browse-search-btn"
            title="Search anime"
            aria-label="Search"
            onClick={handleSearchToggle}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <input
            ref={searchInputRef}
            type="text"
            className="browse-search-input"
            id="browseSearchInput"
            placeholder="Search anime, genres, titles..."
            aria-label="Search anime"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (val.trim() && pathname !== '/watch') {
                router.push('/watch');
              }
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsSearchOpen(false);
              } else if (e.key === 'Enter' && pathname !== '/watch') {
                router.push('/watch');
              }
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className="browse-search-close"
              aria-label="Clear search"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
            >
              &times;
            </button>
          )}
        </div>

        {/* Friends & Watch Party */}
        <button
          type="button"
          className="nav-friends-btn"
          id="navFriendsBtn"
          title="Friends & Watch Party"
          aria-label="Friends & Watch Party"
          onClick={() => openFriendsModal('friends')}
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="friends-badge-count">{friends.length}</span>
        </button>

        {/* Realm Theme Switcher */}
        <button
          type="button"
          className="theme-moon-btn"
          id="themeToggleBtn"
          title="Shift Realm Theme (Click to cycle colors)"
          aria-label="Shift realm theme"
          onClick={(e) => {
            e.stopPropagation();
            cycleTheme(true);
          }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        {/* Notifications Bell on Watch page */}
        {isWatchPage && (
          <div className="nav-notify-wrap" id="navNotifyWrap" ref={notifyRef}>
            <button
              type="button"
              className="nav-notify-btn"
              id="navNotifyBtn"
              title="Notifications"
              aria-label="Notifications"
              onClick={(e) => {
                e.stopPropagation();
                setNotifyDropdownOpen(!notifyDropdownOpen);
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="notify-badge" />
            </button>

            {notifyDropdownOpen && (
              <div className="nav-notify-dropdown" id="navNotifyDropdown" style={{ display: 'flex' }}>
                <div
                  className="notify-item"
                  onClick={() => {
                    openPreview('kamui');
                    setNotifyDropdownOpen(false);
                  }}
                >
                  <div className="notify-thumb">
                    <svg viewBox="0 0 44 28">
                      <rect width="44" height="28" fill="#12131a" />
                      <circle cx="22" cy="14" r="8" fill="#e8b94f" />
                    </svg>
                  </div>
                  <div className="notify-text">
                    <span className="notify-title">Kamui Ep. 4 Now Streaming!</span>
                    <span className="notify-sub">Simulcast in 4K HDR · 2h ago</span>
                  </div>
                </div>
                <div
                  className="notify-item"
                  onClick={() => {
                    openPreview('ashfall-district');
                    setNotifyDropdownOpen(false);
                  }}
                >
                  <div className="notify-thumb">
                    <svg viewBox="0 0 44 28">
                      <rect width="44" height="28" fill="#0d1a1e" />
                      <circle cx="22" cy="14" r="8" fill="#6fa8b5" />
                    </svg>
                  </div>
                  <div className="notify-text">
                    <span className="notify-title">Ashfall District Trending #1</span>
                    <span className="notify-sub">New episode drops tonight</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile / Auth State */}
        {user?.loggedIn ? (
          <div
            className={`nav-profile-wrap ${profileDropdownOpen ? 'open' : ''}`}
            id="navProfileWrap"
            ref={profileRef}
          >
            <button
              type="button"
              className="nav-profile-btn"
              id="navProfileBtn"
              aria-label="Open profile menu"
              aria-expanded={profileDropdownOpen}
              onClick={(e) => {
                e.stopPropagation();
                setProfileDropdownOpen(!profileDropdownOpen);
              }}
            >
              <img className="nav-avatar-img" id="navAvatarImg" src={currentAvatar} alt={user.name || 'Profile'} />
              <span className="nav-profile-name">{user.name || 'Member'}</span>
              <svg className="nav-profile-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="nav-profile-dropdown" id="navProfileDropdown">
                <div className="profile-dropdown-head">
                  <div className="profile-avatar-preview-wrap">
                    <img
                      className="profile-large-avatar"
                      id="dropdownAvatarImg"
                      src={currentAvatar}
                      alt={user.name || 'Profile'}
                    />
                    <label
                      className="avatar-upload-badge"
                      htmlFor="deviceAvatarInput"
                      title="Upload from your device"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                    </label>
                  </div>
                  <div className="profile-user-info">
                    <h4 className="profile-dropdown-name">{user.name || 'Member'}</h4>
                    <p className="profile-dropdown-email">{user.email || 'user@kamui.stream'}</p>
                    <button
                      type="button"
                      className="profile-tier-badge profile-strength-btn"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        openProfileModal();
                      }}
                      title="View & Edit Profile Strength, Social Accounts, and Badges"
                    >
                      ⚡ Profile Strength &amp; Socials →
                    </button>
                  </div>
                </div>

                <div className="profile-dropdown-section">
                  <div className="profile-section-title-row">
                    <span className="profile-section-heading">Avatar Image</span>
                    <label
                      className="btn-import-device"
                      htmlFor="deviceAvatarInput"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                      Import from Device
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      id="deviceAvatarInput"
                      accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                      style={{ display: 'none' }}
                      onChange={handleDeviceAvatarUpload}
                    />
                  </div>
                  <p className="chibi-subheading">Choose an authentic Chibi character (One Piece, Bleach, Naruto):</p>
                  <div className="chibi-avatar-grid" id="chibiAvatarGrid">
                    {DEFAULT_AVATARS.map((item) => (
                      <div
                        key={item.id}
                        className={`chibi-card ${currentAvatar === item.src ? 'active' : ''}`}
                        title={`${item.name} (${item.anime})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateAvatar(item.src, `${item.name} (${item.anime})`);
                        }}
                      >
                        <img className="chibi-img" src={item.src} alt={item.name} />
                        <span className="chibi-name">{item.name}</span>
                        <span className="chibi-anime">{item.anime}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="profile-dropdown-footer">
                  <button
                    type="button"
                    className="profile-link-btn"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      openProfileModal();
                    }}
                  >
                    Socials &amp; Badges
                  </button>
                  <button
                    type="button"
                    className="profile-logout-btn"
                    id="profileLogoutBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {pathname === '/signin' ? (
              <Link href="/signup" className="btn filled">
                Sign up
              </Link>
            ) : pathname === '/signup' ? (
              <Link href="/signin" className="link-cta">
                Sign in
              </Link>
            ) : (
              <>
                <Link href="/signin" className="link-cta">
                  Sign in
                </Link>
                <Link href="/signup" className="btn filled">
                  Start watching
                </Link>
              </>
            )}
          </>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="menu-toggle"
        id="menuToggle"
        aria-label="Toggle menu"
        onClick={() => toggleSidebar()}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
};
