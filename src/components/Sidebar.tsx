'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  Compass,
  Library,
  Users,
  User,
  Bookmark,
  History,
  CheckCircle2,
  ThumbsUp,
  Flame,
  Heart,
  Smile,
  Sparkles,
  Cpu,
  Eye,
  Crosshair,
  Coffee,
  X,
  Palette,
  LogOut,
  LogIn,
  Tv,
  Film,
  Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePlayback } from '@/context/PlaybackContext';
import { useTheme } from '@/context/ThemeContext';
import { REALM_THEMES } from '@/lib/themes';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, openAuthModal, openProfileModal } = useAuth();
  const {
    watchlist,
    continueWatching,
    likedTitles,
    filterGenre,
    setFilterGenre,
    setSearchQuery,
    isSidebarOpen: ctxIsOpen,
    closeSidebar: ctxClose
  } = usePlayback();
  const { currentThemeId: theme, setTheme } = useTheme();

  const isOpen = propIsOpen !== undefined ? propIsOpen : ctxIsOpen;
  const onClose = propOnClose || ctxClose;

  // Close sidebar on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleGenreClick = (genreKey: string) => {
    setFilterGenre(genreKey);
    setSearchQuery('');
    onClose();
    if (pathname !== '/watch') {
      router.push('/watch#catalogFilterSection');
    } else {
      const el = document.getElementById('catalogFilterSection') || document.getElementById('fullCatalogSection');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWatchlistClick = () => {
    setFilterGenre('watchlist');
    onClose();
    if (pathname !== '/watch') {
      router.push('/watch#myWatchlistSection');
    } else {
      const el = document.getElementById('myWatchlistSection') || document.getElementById('contentRowsContainer');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHistoryClick = () => {
    onClose();
    if (pathname !== '/watch') {
      router.push('/watch#continueWatchingSection');
    } else {
      const el = document.getElementById('continueWatchingSection');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Sidebar drawer */}
      <aside
        className={`kamui-sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Navigation drawer"
        aria-hidden={!isOpen}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand-group">
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label="Close sidebar"
              title="Close menu"
            >
              <X size={20} />
            </button>

            <Link href="/" className="sidebar-brand" onClick={onClose}>
              <span className="sidebar-brand-mark">神威</span>
              <span className="sidebar-brand-word">KAMUI</span>
            </Link>
          </div>

          <span className="sidebar-status-pill">
            <span className="live-dot" /> LIVE
          </span>
        </div>

        {/* Sidebar Scrollable Body */}
        <div className="sidebar-body custom-scrollbar">
          {/* Main Section */}
          <div className="sidebar-nav-group">
            <Link
              href="/"
              className={`sidebar-nav-item ${pathname === '/' ? 'active' : ''}`}
              onClick={onClose}
            >
              <Home size={18} className="sidebar-icon" />
              <span className="sidebar-label">Home</span>
            </Link>

            <Link
              href="/watch"
              className={`sidebar-nav-item ${pathname === '/watch' && filterGenre === 'all' ? 'active' : ''}`}
              onClick={() => {
                setFilterGenre('all');
                onClose();
              }}
            >
              <Tv size={18} className="sidebar-icon" />
              <span className="sidebar-label">Stream Browse</span>
              <span className="sidebar-badge-pill gold">4K</span>
            </Link>

            <a
              href="/watch#trendingSection"
              className="sidebar-nav-item"
              onClick={(e) => {
                onClose();
                if (pathname !== '/watch') {
                  e.preventDefault();
                  router.push('/watch#trendingSection');
                }
              }}
            >
              <Calendar size={18} className="sidebar-icon" />
              <span className="sidebar-label">Schedule</span>
            </a>

            <a
              href="/watch#fullCatalogSection"
              className="sidebar-nav-item"
              onClick={(e) => {
                onClose();
                if (pathname !== '/watch') {
                  e.preventDefault();
                  router.push('/watch#fullCatalogSection');
                }
              }}
            >
              <Library size={18} className="sidebar-icon" />
              <span className="sidebar-label">Browse Library</span>
            </a>

            <div
              className="sidebar-nav-item clickable-badge-item"
              onClick={() => {
                onClose();
                if (pathname !== '/watch') router.push('/watch');
              }}
            >
              <Users size={18} className="sidebar-icon" />
              <span className="sidebar-label">Watch Together</span>
              <span className="sidebar-badge-pill gold">SOC</span>
            </div>
          </div>

          {/* You Section */}
          <div className="sidebar-nav-group">
            <div className="sidebar-group-title">YOU</div>

            <div
              className="sidebar-nav-item"
              onClick={() => {
                onClose();
                if (!user?.loggedIn) {
                  openAuthModal();
                } else {
                  openProfileModal();
                }
              }}
            >
              <User size={18} className="sidebar-icon" />
              <span className="sidebar-label">
                {user?.loggedIn ? user.name || 'Profile & Socials' : 'Your Profile'}
              </span>
              {user?.loggedIn && (
                <span className="sidebar-badge-pill pro">PRO</span>
              )}
            </div>

            <div
              className={`sidebar-nav-item ${filterGenre === 'watchlist' ? 'active' : ''}`}
              onClick={handleWatchlistClick}
            >
              <Bookmark size={18} className="sidebar-icon" />
              <span className="sidebar-label">Watchlist</span>
              {watchlist.length > 0 && (
                <span className="sidebar-count-badge">{watchlist.length}</span>
              )}
            </div>

            <div className="sidebar-nav-item" onClick={handleHistoryClick}>
              <History size={18} className="sidebar-icon" />
              <span className="sidebar-label">History</span>
              {continueWatching.length > 0 && (
                <span className="sidebar-count-badge">{continueWatching.length}</span>
              )}
            </div>

            <div
              className="sidebar-nav-item"
              onClick={() => {
                onClose();
                if (pathname !== '/watch') router.push('/watch');
              }}
            >
              <CheckCircle2 size={18} className="sidebar-icon" />
              <span className="sidebar-label">Completed</span>
            </div>

            <div
              className="sidebar-nav-item"
              onClick={() => {
                onClose();
                if (pathname !== '/watch') router.push('/watch');
              }}
            >
              <ThumbsUp size={18} className="sidebar-icon" />
              <span className="sidebar-label">Liked Anime</span>
              {likedTitles.length > 0 && (
                <span className="sidebar-count-badge">{likedTitles.length}</span>
              )}
            </div>
          </div>

          {/* Explore Genres Section */}
          <div className="sidebar-nav-group">
            <div className="sidebar-group-title">EXPLORE</div>

            <div
              className={`sidebar-nav-item ${filterGenre === 'Action' ? 'active' : ''}`}
              onClick={() => handleGenreClick('Action')}
            >
              <Flame size={18} className="sidebar-icon icon-action" />
              <span className="sidebar-label">Action</span>
            </div>

            <div
              className={`sidebar-nav-item ${filterGenre === 'Dark Fantasy' ? 'active' : ''}`}
              onClick={() => handleGenreClick('Dark Fantasy')}
            >
              <Crosshair size={18} className="sidebar-icon icon-fantasy" />
              <span className="sidebar-label">Dark Fantasy</span>
            </div>

            <div
              className={`sidebar-nav-item ${filterGenre === 'Sci-Fi' ? 'active' : ''}`}
              onClick={() => handleGenreClick('Sci-Fi')}
            >
              <Cpu size={18} className="sidebar-icon icon-scifi" />
              <span className="sidebar-label">Sci-Fi</span>
            </div>

            <div
              className={`sidebar-nav-item ${filterGenre === 'Mecha' ? 'active' : ''}`}
              onClick={() => handleGenreClick('Mecha')}
            >
              <Zap size={18} className="sidebar-icon icon-mecha" />
              <span className="sidebar-label">Mecha</span>
            </div>

            <div
              className={`sidebar-nav-item ${filterGenre === 'Mystery' ? 'active' : ''}`}
              onClick={() => handleGenreClick('Mystery')}
            >
              <Eye size={18} className="sidebar-icon icon-mystery" />
              <span className="sidebar-label">Mystery</span>
            </div>

            <div
              className={`sidebar-nav-item ${filterGenre === 'Romance' ? 'active' : ''}`}
              onClick={() => handleGenreClick('Romance')}
            >
              <Heart size={18} className="sidebar-icon icon-romance" />
              <span className="sidebar-label">Romance</span>
            </div>

            <div
              className={`sidebar-nav-item ${filterGenre === 'Slice of Life' ? 'active' : ''}`}
              onClick={() => handleGenreClick('Slice of Life')}
            >
              <Coffee size={18} className="sidebar-icon icon-slice" />
              <span className="sidebar-label">Slice of Life</span>
            </div>

            <div
              className={`sidebar-nav-item ${filterGenre === 'Adventure' ? 'active' : ''}`}
              onClick={() => handleGenreClick('Adventure')}
            >
              <Compass size={18} className="sidebar-icon icon-adventure" />
              <span className="sidebar-label">Adventure</span>
            </div>

            <div
              className={`sidebar-nav-item ${filterGenre === 'Comedy' ? 'active' : ''}`}
              onClick={() => handleGenreClick('Comedy')}
            >
              <Smile size={18} className="sidebar-icon icon-comedy" />
              <span className="sidebar-label">Comedy</span>
            </div>

            <div
              className={`sidebar-nav-item ${filterGenre === 'Fantasy' ? 'active' : ''}`}
              onClick={() => handleGenreClick('Fantasy')}
            >
              <Sparkles size={18} className="sidebar-icon icon-sparkles" />
              <span className="sidebar-label">Fantasy</span>
            </div>
          </div>

          {/* Themes Palette in Sidebar */}
          <div className="sidebar-nav-group">
            <div className="sidebar-group-title">
              <Palette size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
              REALM THEMES
            </div>
            <div className="sidebar-theme-chips">
              {REALM_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`sidebar-theme-chip ${theme === t.id ? 'active' : ''}`}
                  onClick={() => setTheme(t.id)}
                  title={t.name}
                >
                  <span
                    className="sidebar-theme-color-dot"
                    style={{ background: `rgb(${t.hues[0]})` }}
                  />
                  <span>{t.kanji} {t.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {user?.loggedIn ? (
            <div className="sidebar-user-footer">
              <div className="sidebar-user-meta">
                <img
                  src={user.avatar || '/avatars/nami.svg'}
                  alt={user.name || 'User'}
                  className="sidebar-avatar-img"
                />
                <div className="sidebar-user-text">
                  <span className="sidebar-user-name">{user.name || 'Member'}</span>
                  <span className="sidebar-user-sub">✦ 4K HDR Subscriber</span>
                </div>
              </div>
              <button
                type="button"
                className="sidebar-logout-icon-btn"
                onClick={() => {
                  logout();
                  onClose();
                }}
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="sidebar-auth-cta-btn"
              onClick={() => {
                onClose();
                openAuthModal();
              }}
            >
              <LogIn size={16} />
              <span>Sign In to Kamui</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
